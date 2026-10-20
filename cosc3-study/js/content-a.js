/* Lesson content for Lectures 2 to 5. Page numbers are PDF pages. */
'use strict';
function LEARN(o) {
  let h = '';
  if (o.problem) h += SEC('The problem', o.problem);
  if (o.model) h += SEC('Mental model', o.model);
  if (o.example) h += SEC('The lecture\'s example', o.example);
  if (o.steps) h += SEC('Step by step', o.steps);
  if (o.lab) h += SEC('Change the inputs', (o.labIntro || '') + [].concat(o.lab).map(LAB).join(''));
  if (o.more) h += o.more;
  if (o.mistakes) h += SEC('Common mistakes', TRAPS(o.mistakes));
  if (o.connect) h += SEC('How it connects', o.connect);
  if (o.worked) h += SEC('Worked example', o.worked);
  if (o.tryq) h += SEC('Your turn', '<p class="muted">Try this before looking anything up. The solution appears after you answer.</p>' + QREF(o.tryq));
  return h;
}
const PIPE = ['Raw data', 'Features x', 'Score z', 'Fitted coefficients', 'Prediction', 'Evaluation'];

LECTURE({n: 2, num: '01', title: 'Computing with Data', file: '2-Data.pdf', pages: 38});
LECTURE({n: 3, num: '02', title: 'Variation and Statistics', file: '3-Variation.pdf', pages: 49});
LECTURE({n: 4, num: '03', title: 'Conditional Prediction', file: '4-ConditionalPrediction.pdf', pages: 52});
LECTURE({n: 5, num: '04', title: 'Search and Optimization', file: '5-Search.pdf', pages: 32});
LECTURE({n: 6, num: '05', title: 'Logistic Regression', file: '6-LogisticRegression.pdf', pages: 68});
LECTURE({n: 7, num: '06', title: 'Multiple Features', file: '7-MultipleFeatures.pdf', pages: 72});
LECTURE({n: 8, num: '07', title: 'Natural Language', file: '8-NaturalLanguage.pdf', pages: 119});
LECTURE({n: 9, num: '08', title: 'Text Features', file: '9-TextFeatures.pdf', pages: 99});

/* ======================= Lecture 2 ======================= */
LESSON({id: 'l2-baseline', lec: 2, title: 'Constant prediction and task types', pages: '6 to 12', keys: 'constant prediction baseline regression classification fern cafe spam coffee tea',
  quick: {what: 'A constant prediction gives every case the same answer, chosen from past data.', why: 'It is the simplest possible model, and every later model must beat it to be worth anything.', idea: 'Which constant is "best" depends on the target type (number or category) and on how we score mistakes.', remember: 'Regression predicts a number; classification predicts a category.'},
  learn: LEARN({
    problem: '<p>You manage the Fern café and must estimate something about the next customer while knowing nothing about them. You get exactly one answer to give everyone. Which answer should it be, and why?</p>',
    model: '<p>Think of the constant as a single dart you throw at every future case. You want a spot that is close to where the darts usually land. "Close" needs a definition, and that definition (the loss function) is what decides the answer.</p>',
    example: SRC('7 to 10', '<p>Four warm-up questions from the lecture:</p>' + TABLE(['Question', 'Past data', 'Options offered'], [['Next bill (p. 7)', '$4, $5, $6, $7, $8', '$4, $6, $9, or need more information'], ['Wait time (p. 8)', '2, 3, 4, 5, 16 minutes', '4, 6, 16 minutes, or depends'], ['Next drink (p. 9)', 'Coffee, Tea, Coffee, Coffee, Tea', 'Coffee, Tea, or either'], ['Spam default (p. 10)', '800 legitimate, 200 spam', 'All legitimate or all spam']])) +
      SRC('12', TABLE(['Prediction target', 'Type of task', 'Example output'], [['A numerical quantity', 'Regression', '6 minutes'], ['A category', 'Classification', 'Spam']])),
    steps: LEDGER([
      ['<p><b>Bills.</b> 4, 5, 6, 7, 8 are symmetric around 6.</p>', 'Mean = 30 ÷ 5 = 6 and median = 6. Every sensible rule says $6.', 'plain'],
      ['<p><b>Wait times.</b> 2, 3, 4, 5, 16.</p>', 'Mean = 30 ÷ 5 = 6, but median = 4. The single 16 pulls the mean up. The honest answer is "depends", on how we measure mistakes.', 'plain'],
      ['<p><b>Drinks.</b> 3 coffee, 2 tea.</p>', 'A category can\'t be averaged. Predicting the most common class, coffee, is right 3 times out of 5.', 'plain'],
      ['<p><b>Spam.</b> 800 legitimate, 200 spam.</p>', 'Labeling everything legitimate is right 800 ÷ 1000 = 80% of the time, yet every spam message reaches the inbox (p. 35).']
    ]),
    mistakes: ['Assuming there is one correct constant regardless of how errors are scored. The wait-time example has two defensible answers, 4 and 6.', 'Reading 80% accuracy as good. On the spam data it comes from a rule that never catches a single spam message.', 'Averaging categories. "Coffee" and "Tea" have no mean; classification uses the most common class.'],
    connect: CHAIN(['Constant ŷ = c', 'Loss function', 'Best c (mean, median, mode)', 'Features x (Lecture 4)'], 0) + '<p>Every model in the course is judged against this baseline. In Lecture 9, "always predict Rap" plays exactly this role for genre prediction (accuracy 0.349).</p>',
    worked: '<p>Spam data: 800 legitimate and 200 spam. "Always legitimate" makes 200 mistakes out of 1000, an error rate of 200 ÷ 1000 = 0.2, so accuracy 0.8. "Always spam" makes 800 mistakes, accuracy 0.2. The majority class wins on accuracy, which is why accuracy alone can hide a useless spam filter.</p>',
    tryq: 'l2-baseline-t'
  }),
  revise: {formulas: ['loss-01'], when: 'Use the mean for squared error, the median for absolute error, the mode (most common class) for 0-1 loss.', formats: ['"Which constant should we predict and why?"', 'Accuracy of a majority-class baseline.', 'Classify a task as regression or classification.'], traps: ['Calling a high-accuracy majority baseline a good model.', 'Treating the target type as irrelevant to the choice of constant.']},
  prereq: [], next: ['l2-loss']
});

LESSON({id: 'l2-loss', lec: 2, title: 'Measuring errors: loss functions', pages: '13 to 18', keys: 'loss function 0-1 loss mae mse mean absolute error mean squared error signed error',
  quick: {what: 'A loss function L(y, ŷ) turns one mistake into a nonnegative penalty.', why: 'To choose between guesses we need a number that says how bad each guess is.', idea: 'Average the penalties over the data. MAE averages distances; MSE averages squared distances.', remember: 'Signed errors cancel out, so use absolute or squared errors.'},
  learn: LEARN({
    problem: '<p>Should the app predict 4 minutes or 6 minutes for the wait times 2, 3, 4, 5, 16? We need a scoreboard.</p>',
    model: '<p>A loss function is a penalty schedule: zero for a perfect prediction, larger for worse ones. MAE charges one unit per minute missed. MSE charges the square, so missing by 12 costs 144 while missing by 1 costs 1. Big mistakes dominate MSE.</p>',
    example: SRC('14 to 16', '<p>A loss maps an actual outcome y and a prediction ŷ to a penalty, with ' + M('L(y, \\hat{y}) \\ge 0') + ' and ' + M('L(y, y) = 0') + '. The 0-1 loss is 0 when ' + M('y = \\hat{y}') + ' and 1 otherwise, but for real numbers an exact hit has probability close to 0, so it says almost nothing (p. 15).</p><p>The naive idea fails: predicting 4 for actual waits of 2 and 6 gives errors −2 and +2, which average to 0 even though both predictions miss by 2 minutes (p. 16).</p>'),
    steps: '<p><b>MAE at c = 4</b> (p. 17). Each term is a distance |y − 4|:</p>' + LEDGER([
      ['|2-4|,\\ |3-4|,\\ |4-4|,\\ |5-4|,\\ |16-4| = 2,\\ 1,\\ 0,\\ 1,\\ 12', 'Distances from each actual wait to the guess. Absolute value removes the sign, so nothing cancels.', 'plain'],
      ['\\mathrm{MAE}(4) = \\frac{2+1+0+1+12}{5} = \\frac{16}{5} = 3.2', 'Numerator: total minutes missed. Denominator: 5 orders. Meaning: on average the guess 4 misses by 3.2 minutes.']
    ]) + '<p><b>MAE at c = 6:</b> distances 4, 3, 2, 1, 10 sum to 20, so MAE(6) = 20 ÷ 5 = 4. MAE prefers 4.</p><p><b>MSE</b> (p. 18) squares each distance first:</p>' + LEDGER([
      ['\\mathrm{MSE}(4) = \\frac{4 + 1 + 0 + 1 + 144}{5} = \\frac{150}{5} = 30', 'The 16 contributes 12² = 144 of the 150. One far point dominates.', 'plain'],
      ['\\mathrm{MSE}(6) = \\frac{16 + 9 + 4 + 1 + 100}{5} = \\frac{130}{5} = 26', 'Moving toward 16 shrinks its 144 to 100, worth more than the smaller penalties grow. MSE prefers 6. Units are minutes².']
    ]),
    lab: 'constant',
    labIntro: '<p>Drag c and watch both averages. Then press "Remove the 16" and see the two best guesses move together.</p>',
    mistakes: ['Averaging signed errors y − ŷ. They can sum to zero for a terrible guess.', 'Reporting MSE in minutes. It is in minutes² because each term is squared.', 'Assuming the guess with lower MAE also has lower MSE. On this data 4 wins MAE (3.2 vs 4) while 6 wins MSE (26 vs 30).', 'Squaring before subtracting. The term is (y − c)², not y² − c².'],
    connect: CHAIN(['Loss for one case', 'Average loss over data', 'Minimize over c', 'Minimize over θ (Lectures 4, 5)'], 1) + '<p>The same "average the penalties" idea becomes least squares in Lecture 4 and log loss in Lecture 6.</p>',
    worked: '<p>For c = 3: distances 1, 0, 1, 2, 13 sum to 17, so MAE(3) = 17 ÷ 5 = 3.4. Squares 1, 0, 1, 4, 169 sum to 175, so MSE(3) = 35. Both are worse than c = 4 under MAE (3.2) and worse than c = 6 under MSE (26).</p>',
    tryq: 'l2-loss-t'
  }),
  revise: {formulas: ['mae', 'mse', 'loss-01'], when: 'MAE when every minute missed costs the same; MSE when big misses are disproportionately bad.', formats: ['Compute MAE or MSE for a given constant.', 'Which of two guesses wins under each loss?', 'Why can\'t we average signed errors?'], traps: ['Signed errors cancelling.', 'Wrong units for MSE.', 'Forgetting to divide by n.']},
  prereq: ['l2-baseline'], next: ['l2-mean', 'l2-median']
});

LESSON({id: 'l2-mean', lec: 2, title: 'Why squared error picks the mean', pages: '19 to 25', keys: 'mse derivative mean optimal constant convex second derivative',
  quick: {what: 'Under MSE, the best single constant is the sample mean ȳ.', why: 'We want to prove which c minimizes MSE rather than try values one by one.', idea: 'Set the derivative of MSE(c) to zero. That requires the residuals y_i − c to sum to zero, which only happens at the mean.', remember: 'MSE gives the mean, and its curve is a smooth bowl with one minimum.'},
  learn: LEARN({
    problem: '<p>The MSE curve for 2, 3, 4, 5, 16 bottoms out at 6 (p. 21). Why exactly 6, and would it always be the mean?</p>',
    model: '<p>Each data point pulls the guess toward itself with a force proportional to its distance (the slope of a square grows with distance). The guess stops moving where the pulls to the left and right cancel. Distance-weighted balance is the definition of the mean.</p>',
    example: SRC('22 to 25', '<p>Notation (p. 22): n is the number of observations (5), ' + M('y_i') + ' is outcome i (2, 3, 4, 5, 16), and c is our constant.</p>' + MD('\\mathrm{MSE}(c) = \\frac{1}{n}\\sum_{i=1}^{n}(y_i - c)^2')),
    steps: LEDGER([
      ['\\frac{d}{dc}(y_i - c)^2 = 2(y_i - c)(-1) = -2(y_i - c)', 'Chain rule: the outer square gives 2(y_i − c), the inside (y_i − c) has derivative −1 with respect to c.', 'plain'],
      ['\\mathrm{MSE}\'(c) = -\\frac{2}{n}\\sum_{i=1}^{n}(y_i - c)', 'Average the five derivatives.', 'plain'],
      ['0 = \\sum_{i=1}^n (y_i - c) = \\sum_{i=1}^n y_i - nc', 'Set the slope to zero (the bottom of the bowl) and multiply both sides by −n/2.', 'plain'],
      ['c = \\frac{1}{n}\\sum_{i=1}^n y_i = \\bar{y} = \\frac{30}{5} = 6', 'Solve for c. The answer is the mean.', 'plain'],
      ['\\frac{d^2}{dc^2}\\mathrm{MSE}(c) = \\frac{2}{n}\\sum_{i=1}^n 1 = 2 > 0', 'Second derivative is positive everywhere, so MSE is strictly convex and this stationary point is the unique global minimum (p. 25).']
    ]) + '<p><b>Numbers first check.</b> At c = 4 the residuals are −2, −1, 0, 1, 12, summing to 10, so the slope is −(2/5)(10) = −4. Negative slope means moving c right lowers MSE. At c = 6 the residuals −4, −3, −2, −1, 10 sum to 0: slope 0, the minimum.</p>',
    lab: 'constant',
    labIntro: '<p>Watch the "MSE slope at c" readout: it equals 2(c − ȳ), and it is zero only at the mean.</p>',
    mistakes: ['Losing the −1 from the chain rule, which flips the sign of the slope.', 'Thinking the minimum is where MSE equals 0. The minimum value here is 26, not 0.', 'Concluding the mean is the best guess under every loss. It is best for squared error only.'],
    connect: CHAIN(['MSE(c)', 'Derivative = 0', 'c* = ȳ', 'Same trick gives θ₀*, θ₁* (Lecture 4)'], 2) + '<p>The minimum value MSE(ȳ) is the variance of y computed with n (Lecture 3, p. 30): 26 here.</p>',
    worked: '<p>Data 1, 2, 9. Mean = 12 ÷ 3 = 4. Check: residuals at 4 are −3, −2, 5, sum 0. MSE(4) = (9 + 4 + 25) ÷ 3 = 38 ÷ 3 ≈ 12.67. Any other c gives more, for example MSE(5) = (16 + 9 + 16) ÷ 3 ≈ 13.67.</p>',
    tryq: 'l2-mean-t'
  }),
  revise: {formulas: ['mse', 'best-mean'], when: 'Any question asking for the constant that minimizes squared error, or the slope of MSE at some c.', formats: ['Derive c* for MSE.', 'Evaluate MSE′(c) at a given c and interpret its sign.', 'Is MSE convex? Why does that matter?'], traps: ['Sign error from the chain rule.', 'Mixing up "minimum location" (ȳ) with "minimum value" (the variance).']},
  prereq: ['l2-loss'], next: ['l2-median']
});

LESSON({id: 'l2-median', lec: 2, title: 'Why absolute error picks the median', pages: '26 to 28', keys: 'mae median absolute value derivative sign vote even odd outlier robust',
  quick: {what: 'Under MAE, the best constant is the median.', why: 'Absolute error charges each point the same slope, ±1, no matter how far it is.', idea: 'The slope of MAE at c is (points below c − points above c) ÷ n. It is zero when the counts balance.', remember: 'MAE gives the median; every point gets one equal vote.'},
  learn: LEARN({
    problem: '<p>MAE for 2, 3, 4, 5, 16 is lowest at 4 (p. 20). Why does the far point 16 not drag the answer toward it the way it does for MSE?</p>',
    model: '<p>Under absolute error each point casts one vote: "move left" or "move right". A point 12 minutes away votes exactly as loudly as one 1 minute away. The guess stops where the votes tie, which is the middle of the sorted data.</p>',
    example: SRC('26 to 28', MD('\\mathrm{MAE}(c) = \\frac{1}{n}\\sum_{i=1}^{n}|y_i - c|,\\qquad \\frac{d}{dc}|y_i - c| = \\begin{cases} -1 & c < y_i \\\\ +1 & c > y_i \\end{cases}') + '<p>Points above c pull with slope −1, points below with +1, and the sum is zero only if the counts balance, giving ' + M('c^* = \\mathrm{median} = 4') + '. With an even count (2, 3, 5, 16) the slope is zero across the whole interval [3, 5]; by convention use the midpoint (p. 28).</p>'),
    steps: LEDGER([
      ['c = 3.5:\\ \\text{below} = \\{2, 3\\},\\ \\text{above} = \\{4, 5, 16\\}', 'Slope = (2 − 3) ÷ 5 = −0.2. Negative, so moving right lowers MAE.', 'plain'],
      ['c = 4.5:\\ \\text{below} = \\{2, 3, 4\\},\\ \\text{above} = \\{5, 16\\}', 'Slope = (3 − 2) ÷ 5 = +0.2. Positive, so moving right raises MAE.', 'plain'],
      ['c^* = 4', 'The slope changes sign at the middle value. Notice 16 counted as one point "above" both times, the same as 5.']
    ]),
    lab: 'constant',
    labIntro: '<p>Press "Even count: 2, 3, 5, 16" and slide c between 3 and 5: the MAE stays flat at 4.</p>',
    mistakes: ['Saying MAE is minimized by the mean. That is the MSE result.', 'Thinking a far outlier moves the median a lot. It moves it at most one position.', 'For an even count, expecting a single exact minimizer. Every value between the two middle points ties; the midpoint is a convention.'],
    connect: CHAIN(['|y − c| has a corner', 'Slope only ±1', 'No closed form for lines under MAE', 'Search (Lecture 5)'], 2) + '<p>The fact that the MAE derivative only carries signs, not distances, is exactly why least-absolute-error lines need search in Lecture 5 (p. 13).</p>',
    worked: '<p>Data 1, 2, 9. Sorted, the middle value is 2. MAE(2) = (1 + 0 + 7) ÷ 3 ≈ 2.67, while MAE(4) = (3 + 2 + 5) ÷ 3 ≈ 3.33. The median wins under MAE even though the mean (4) wins under MSE.</p>',
    tryq: 'l2-median-t'
  }),
  revise: {formulas: ['mae', 'best-median'], when: 'Data with outliers or skew, or any question that asks for the MAE-optimal constant.', formats: ['Find the MAE-minimizing constant (odd or even n).', 'Compute the MAE slope at a point.', 'Explain robustness to outliers.'], traps: ['Mean versus median swap.', 'Treating the even-n case as having a unique answer.']},
  prereq: ['l2-loss'], next: ['l2-choose']
});

LESSON({id: 'l2-choose', lec: 2, title: 'Comparing losses, ERM, and the three baselines', pages: '29 to 37', keys: 'empirical risk minimization erm argmin mean median mode skew outliers baseline autonomous braking asymmetric',
  quick: {what: 'Empirical risk minimization picks the parameter with the lowest average loss on the training data.', why: 'Different losses give different "best" answers on the same data, so the loss is a real modeling choice.', idea: 'Mean for MSE, median for MAE, mode for 0-1 loss. Choose the loss that reflects what mistakes actually cost.', remember: 'Changing the metric changes the optimal c on the exact same data.'},
  learn: LEARN({
    problem: '<p>We now have two losses that disagree. Which should we use, and is there a general recipe behind both answers?</p>',
    model: '<p>Empirical risk is "average penalty on the data we have". ERM is the instruction "pick whatever makes that average smallest". Plug in a different penalty and the same instruction returns a different winner.</p>',
    example: SRC('34', MD('R(c) = \\frac{1}{n}\\sum_{i=1}^{n}L(y_i, c),\\qquad c^* = \\argmin_{c\\in\\mathbb{R}} R(c)')) +
      SRC('33, 36', TABLE(['', 'Squared error (MSE)', 'Absolute error (MAE)', '0-1 loss'], [['Best constant', 'Mean ȳ = 6', 'Median = 4', 'Mode (most common class)'], ['Loss surface', 'Smooth parabola bowl', 'Sharp V-shaped valley', 'Counts of mistakes'], ['Pull per point', 'Scales with distance', 'Constant ±1', 'One mistake each'], ['Outliers', 'Severe pull toward extremes', 'Robust, one vote each', 'Not applicable'], ['Good for', 'Continuous, roughly symmetric data', 'Skewed data, outliers', 'Categorical labels']])) +
      SRC('30 to 31', '<p>With 5% extreme outliers the median stays at 5.02 while the mean is dragged to 6.94. On a skewed wait-time curve the median is 3.32 minutes (the typical customer) while the mean is 4.10 (expected total load). On a two-peaked mixture the mean, 6.30, falls between the peaks where almost nobody is, which motivates using features (Lecture 4).</p>'),
    steps: LEDGER([
      ['R_{\\text{MSE}}(6) = 26,\\quad R_{\\text{MAE}}(4) = 3.2', 'The two minimum values from the lecture\'s landscape plot (p. 29). They are not comparable: different units.', 'plain'],
      ['\\text{0-1 loss, drinks: } R(\\text{Coffee}) = \\frac{2}{5} = 0.4', 'Predicting coffee is wrong for the 2 teas out of 5.', 'plain'],
      ['R(\\text{Tea}) = \\frac{3}{5} = 0.6', 'So the mode, coffee, minimizes 0-1 risk.']
    ]),
    more: SEC('Choosing the loss: autonomous braking', SRC('37', '<p>A car estimates the distance to an obstacle. Overestimating (thinks 20 m, actually 5 m) and underestimating (thinks 5 m, actually 20 m) are very different mistakes. Would you train with standard MSE?</p>') + XTRA('<p>Standard MSE penalizes a 15 m overestimate exactly as much as a 15 m underestimate, because (+15)² = (−15)². Overestimating can cause a crash, while underestimating causes a cautious early stop, so a loss that charges overestimates more heavily matches the real costs better. This is why the recap true-or-false item "MSE treats over and underestimating differently" is false (Lecture 3, p. 19).</p>')),
    mistakes: ['Comparing an MSE value with an MAE value. One is in minutes², the other in minutes.', 'Thinking ERM guarantees zero training error. It minimizes average loss; with a constant the minimum is usually far from zero.', 'Assuming MSE is always the right default. The lecture says both are often defensible; choose by the cost of mistakes.'],
    connect: CHAIN(['Choose a loss', 'Empirical risk R', 'Minimize (formula or search)', 'Same recipe for every model'], 1) + '<p>Every later model is ERM with a richer family of predictions: lines (Lecture 4), searched lines (Lecture 5), logistic probabilities with log loss (Lecture 6), penalized genre classifiers (Lecture 9).</p>',
    worked: '<p>Spam, 0-1 loss: always-legitimate has risk 200 ÷ 1000 = 0.2; always-spam has risk 0.8. ERM picks "legitimate", the mode. Note that ERM did its job perfectly and the result is still useless for catching spam, a sign that 0-1 loss alone may be the wrong metric for this task (Lecture 9 returns to this with precision and recall).</p>',
    tryq: 'l2-choose-t'
  }),
  revise: {formulas: ['erm', 'best-mean', 'best-median'], when: 'Any "which constant / which loss" question, including asymmetric costs.', formats: ['Fill in the mean, median, mode table.', 'Pick a loss for a scenario and justify it.', 'Compute 0-1 risk of a constant class.'], traps: ['MSE treats over and under prediction the same.', 'Comparing losses in different units.']},
  prereq: ['l2-mean', 'l2-median'], next: ['l3-spread']
});

/* ======================= Lecture 3 ======================= */
LESSON({id: 'l3-spread', lec: 3, title: 'Spread: deviations, MAD and variance', pages: '21 to 24', keys: 'variance spread deviation mad mean absolute deviation server response time',
  quick: {what: 'Variance is the average squared distance of the observations from their mean.', why: 'Two servers with the same 4 ms mean can differ completely in how predictable they are.', idea: 'Raw deviations always sum to zero, so square them (variance) or take absolute values (MAD) before averaging.', remember: 'Deviations sum to zero; variance is in squared units.'},
  learn: LEARN({
    problem: '<p>Server A answers in 4, 4, 4 ms. Server B answers in 0, 4, 8 ms. Both have mean 4.0 ms (p. 21), yet you could promise A\'s customers far more. The mean misses variability.</p>',
    model: '<p>Measure how far each observation sits from the center, then summarize those distances. The catch is that "above" and "below" cancel exactly, so we need to remove the signs first.</p>',
    example: SRC('23 to 24', '<p>Server B deviations from ȳ = 4.0: 0 − 4 = −4.0, 4 − 4 = 0.0, 8 − 4 = +4.0. Two options:</p>' + MD('\\mathrm{MAD} = \\frac{1}{n}\\sum_{i=1}^{n}|y_i - \\bar{y}|,\\qquad \\mathrm{Var} = \\frac{1}{n}\\sum_{i=1}^{n}(y_i - \\bar{y})^2') + '<p>Why not average the raw deviations? ' + M('\\sum (y_i - \\bar{y}) = \\sum y_i - n\\bar{y} = n\\bar{y} - n\\bar{y} = 0') + ' always. Variance in ms is measured in ms²; for Server B, ' + M('\\sqrt{10.67\\ \\mathrm{ms}^2} \\approx 3.27\\ \\mathrm{ms}') + ' (p. 24).</p>'),
    steps: LEDGER([
      ['\\text{deviations: } -4,\\ 0,\\ 4 \\quad\\Rightarrow\\quad \\text{sum} = 0', 'Confirms the "always zero" fact on real numbers.', 'plain'],
      ['\\mathrm{MAD} = \\frac{4 + 0 + 4}{3} = \\frac{8}{3} \\approx 2.67\\ \\mathrm{ms}', 'Absolute values, averaged over n = 3.', 'plain'],
      ['\\mathrm{Var} = \\frac{16 + 0 + 16}{3} = \\frac{32}{3} \\approx 10.67\\ \\mathrm{ms}^2', 'Squares, averaged over n = 3. The lecture\'s 10.67 ms² uses this divide-by-n version.', 'plain'],
      ['\\sqrt{10.67} \\approx 3.27\\ \\mathrm{ms}', 'Square root returns to milliseconds. Server A gives 0 for all three.']
    ]),
    lab: 'spread',
    mistakes: ['Averaging the raw deviations and getting 0, then concluding there is no spread.', 'Reporting variance in ms instead of ms².', 'Forgetting to subtract the mean before squaring.'],
    connect: CHAIN(['Mean (center)', 'Deviations', 'Variance (spread)', 'Covariance (two variables)'], 2) + '<p>Variance is the same quantity as the minimum MSE of a constant prediction from Lecture 2 (p. 30).</p>',
    worked: '<p>Values 1, 2, 3, 6: mean 3. Deviations −2, −1, 0, 3 (sum 0). MAD = 6 ÷ 4 = 1.5. Variance (÷ n) = (4 + 1 + 0 + 9) ÷ 4 = 3.5.</p>',
    tryq: 'l3-spread-t'
  }),
  revise: {formulas: ['mad', 'variance'], when: 'Describing how spread out one variable is.', formats: ['Compute MAD and variance for a short list.', 'Prove deviations sum to zero.', 'Units of variance.'], traps: ['Raw deviations cancel.', 'Squared units.']},
  prereq: ['l2-choose'], next: ['l3-sd']
});

LESSON({id: 'l3-sd', lec: 3, title: 'Sample variance, Bessel\'s correction and standard deviation', pages: '25 to 34', keys: 'sample variance bessel n-1 standard deviation empirical rule 68 95 99.7 outlier fragility units',
  quick: {what: 'Sample variance divides by n − 1; the standard deviation is its square root.', why: 'Dividing by n systematically underestimates the true variance, and squared units are hard to read.', idea: 'Center, square, average with n − 1, then take the square root.', remember: 's² uses n − 1 (Bessel\'s correction); s is back in the original units.'},
  learn: LEARN({
    problem: '<p>We only see a sample, not the whole population. Does the divide-by-n variance estimate the true spread fairly? And how do we report spread in milliseconds rather than ms²?</p>',
    model: '<p>The sample mean is computed from the same points, so it sits closer to them than the true mean would. Distances to ȳ therefore look a little too small. Dividing by n − 1 instead of n inflates the estimate by exactly the right amount on average.</p>',
    example: SRC('26 to 28', MD('s^2 = \\frac{1}{n-1}\\sum_{i=1}^{n}(y_i - \\bar{y})^2') + '<p>The derivation shows ' + M('\\mathbb{E}\\left[\\frac{1}{n}\\sum (y_i - \\bar{y})^2\\right] = \\frac{n-1}{n}\\sigma^2') + ', a bias of exactly ' + M('\\frac{n-1}{n}') + '; inverting it gives an unbiased estimator. The slide says plainly: you do not need to remember the math, only the intuition (p. 28).</p>') +
      FLAG('<p>Slide p. 29 reports ' + M('s^2 = 2.67\\ \\mathrm{ms}^2') + ' and ' + M('s \\approx 1.63\\ \\mathrm{ms}') + ' for "our server latency measurements". Those numbers do not follow from Server B (0, 4, 8) under either formula:</p>' + TABLE(['Formula', 'Server B result'], [['Divide by n', '32 ÷ 3 = 10.67 ms², SD 3.27 ms (matches p. 24)'], ['Divide by n − 1', '32 ÷ 2 = 16 ms², s = 4.00 ms']]) + '<p>Treat 2.67 and 1.63 as illustrative values for a different sample. On an exam, compute from the data you are given.</p>') +
      SRC('30 to 33', '<p><b>Variance as baseline loss</b> (p. 30): the best constant under MSE is ȳ, and the leftover loss is ' + M('\\frac{1}{n}\\sum(y_i - \\bar{y})^2 = \\mathrm{Var}(y)') + '. For the wait times, MSE(6) = 26 is that variance.</p><p><b>Empirical rule</b> (p. 31), for roughly normal data with ȳ = 4.0 ms and s = 1.0 ms: about 68% of queries in 3.0 to 5.0 ms, 95% in 2.0 to 6.0 ms, 99.7% in 1.0 to 7.0 ms; above 7.0 ms is a tail event.</p><p><b>Fragility</b> (p. 33): a clean sample has mean 4.00 ms and s = 0.16 ms. One 15 ms glitch shifts the mean to 6.16 ms, leaves the median at 4.00 ms, and inflates the variance from 0.02 to 24.43 (s = 4.94 ms).</p>'),
    steps: LEDGER([
      ['\\text{Center: } y_i - \\bar{y} = -4,\\ 0,\\ 4', 'Server B, ȳ = 4.', 'plain'],
      ['\\text{Square: } 16,\\ 0,\\ 16 \\quad (\\text{sum } 32)', 'Squares remove signs and weight far points more.', 'plain'],
      ['\\text{Average with Bessel: } s^2 = \\frac{32}{3 - 1} = 16\\ \\mathrm{ms}^2', 'Denominator is n − 1 = 2, not 3.', 'plain'],
      ['\\text{Square root: } s = \\sqrt{16} = 4\\ \\mathrm{ms}', 'Same units as the data. Read it as "typical distance from the mean".']
    ]),
    lab: 'spread',
    labIntro: '<p>The lab shows both versions side by side. Add the 15 ms glitch and watch s jump while the median would barely move.</p>',
    mistakes: ['Using n in a question that asks for the sample variance s².', 'Taking the square root of each squared deviation and averaging them. That gives MAD, not s.', 'Applying the empirical rule to clearly non-normal or skewed data.', 'Copying the slide\'s 2.67 ms² for Server B without checking.'],
    connect: CHAIN(['Variance', 'Standard deviation', 'z-scores', 'Correlation and standardized features (Lecture 7)'], 1) + '<p>Careful: Lecture 7 standardizes features with ' + M('s_j = \\sqrt{\\frac{1}{n}\\sum (x_{ij} - \\mu_j)^2}') + ', the divide-by-n version (Lecture 7, p. 50).</p>',
    worked: '<p>Values 2, 4, 4, 6: mean 4, deviations −2, 0, 0, 2, squares sum to 8. s² = 8 ÷ 3 ≈ 2.67, s ≈ 1.63. (This happens to reproduce the slide\'s 2.67 and 1.63, though the slide does not say which data it used.)</p>',
    tryq: 'l3-sd-t'
  }),
  revise: {formulas: ['sample-var', 'sd', 'variance'], when: 'Estimating spread from a sample; reporting spread in data units.', formats: ['Compute s² and s for a short sample.', 'Why n − 1?', 'Apply the 68/95/99.7 rule.'], traps: ['n versus n − 1.', 'Units.', 'Outliers inflate s.']},
  prereq: ['l3-spread'], next: ['l3-cov']
});

LESSON({id: 'l3-cov', lec: 3, title: 'Covariance and quadrants', pages: '35 to 38, 43', keys: 'covariance quadrant paired data joint variation np.cov covariance matrix',
  quick: {what: 'Covariance measures whether two variables move together relative to their means.', why: 'With paired data we want to answer: when x goes up, what tends to happen to y?', idea: 'Multiply the centered values in each pair. Same-side pairs add positive amounts; opposite-side pairs add negative amounts.', remember: 'cov(x, y) = Σ(x − x̄)(y − ȳ) ÷ (n − 1). The sign shows direction; the size depends on units.'},
  learn: LEARN({
    problem: '<p>Examples from the lecture (p. 35): flip-flops sold and iced tea sold, SAT score and college GPA, followers and following. We want one number for "do they rise together?"</p>',
    model: '<p>Draw crosshairs at (x̄, ȳ). A point up and to the right of the center, or down and to the left, agrees with "move together", and its product of deviations is positive. Points in the other two corners disagree and contribute negative products. Covariance tallies the agreement.</p>',
    example: SRC('36 to 37', MD('\\mathrm{cov}(x, y) = \\frac{1}{n-1}\\sum_{i=1}^{n}(x_i - \\bar{x})(y_i - \\bar{y})') + TABLE(['Quadrant', 'Signs', 'Product'], [['x > x̄, y > ȳ', '(+)(+)', 'positive'], ['x < x̄, y < ȳ', '(−)(−)', 'positive'], ['x < x̄, y > ȳ', '(−)(+)', 'negative'], ['x > x̄, y < ȳ', '(+)(−)', 'negative']]) + '<p>Variance is the special case ' + M('\\mathrm{cov}(y, y)') + '.</p>') +
      SRC('43', '<p><code>np.cov(x, y)</code> returns four numbers, a 2 × 2 matrix: ' + M('\\begin{bmatrix} \\mathrm{Var}(x) & \\mathrm{Cov}(x,y) \\\\ \\mathrm{Cov}(y,x) & \\mathrm{Var}(y) \\end{bmatrix}') + '. The off-diagonal entries are equal.</p>'),
    steps: XTRA('<p>Using the café orders from Lecture 4, x = (1, 2, 3, 4) items and y = (3, 4, 8, 9) minutes. These are lecture data; the covariance is computed here.</p>', 'Extra worked numbers') + LEDGER([
      ['\\bar{x} = 2.5,\\quad \\bar{y} = 6', 'Means of each variable separately.', 'plain'],
      ['x_i - \\bar{x} = -1.5,\\ -0.5,\\ 0.5,\\ 1.5;\\quad y_i - \\bar{y} = -3,\\ -2,\\ 2,\\ 3', 'Center both.', 'plain'],
      ['\\text{products} = 4.5,\\ 1,\\ 1,\\ 4.5 \\quad (\\text{sum } 11)', 'All four products are positive: every point is in an agreeing quadrant.', 'plain'],
      ['\\mathrm{cov}(x, y) = \\frac{11}{4 - 1} \\approx 3.67\\ \\text{item·min}', 'Units are items × minutes, which is why the size alone is hard to interpret.']
    ]),
    lab: 'spread',
    labIntro: '<p>Switch the lab to "Two variables" and drag points between quadrants. Then use "x × 10": the covariance gets 10 times bigger although nothing about the relationship changed.</p>',
    mistakes: ['Reading a large covariance as a strong relationship. Its size depends on units.', 'Forgetting to center one of the variables.', 'Mixing n and n − 1 between the covariance and the standard deviations.'],
    connect: CHAIN(['Variance', 'Covariance', 'Correlation r', 'Regression slope = cov ÷ var (Lecture 4)'], 1),
    worked: '<p>x = (1, 2, 3), y = (6, 4, 2). Means 2 and 4. Centered: (−1, 0, 1) and (2, 0, −2). Products −2, 0, −2, sum −4. cov = −4 ÷ 2 = −2: negative, as y falls while x rises.</p>',
    tryq: 'l3-cov-t'
  }),
  revise: {formulas: ['cov'], when: 'Direction of joint variation for two variables; building block of r and the OLS slope.', formats: ['Compute covariance by hand.', 'Identify the sign from a scatter plot.', 'Read np.cov output.'], traps: ['Unit dependence.', 'Uncentered products.']},
  prereq: ['l3-sd'], next: ['l3-corr']
});

LESSON({id: 'l3-corr', lec: 3, title: 'Correlation, z-scores and geometry', pages: '39 to 46', keys: 'pearson correlation r z-score standardize invariance affine cosine angle centered vectors',
  quick: {what: 'Pearson\'s r is covariance on a unitless scale, always between −1 and +1.', why: 'Covariance changes when you switch seconds to minutes, so it can\'t measure strength.', idea: 'Standardize both variables into z-scores and average their products (n − 1); equivalently r = cov ÷ (s_x s_y), the cosine of the angle between centered vectors.', remember: 'r measures linear association only, not the slope of the line.'},
  learn: LEARN({
    problem: '<p>The same durations in seconds and in minutes give different covariances (p. 39). We want r ∈ [−1, +1] where +1 is perfectly correlated and −1 perfectly anticorrelated.</p>',
    model: '<p>Convert each value into "how many standard deviations from its mean" (a z-score). Now both variables speak the same unitless language, and their average product measures how tightly the points hug a straight line.</p>',
    example: SRC('39 to 40', MD('z_{x,i} = \\frac{x_i - \\bar{x}}{s_x},\\quad z_{y,i} = \\frac{y_i - \\bar{y}}{s_y},\\quad r_{x,y} = \\frac{1}{n-1}\\sum_{i=1}^{n} z_{x,i}z_{y,i} = \\frac{\\mathrm{cov}(x,y)}{\\sqrt{\\mathrm{var}(x)\\,\\mathrm{var}(y)}}') + '<p>Magnitude |r| is tightness around a straight line; the sign gives direction. What counts as "substantial" varies by domain. Correlation is not the slope (p. 40).</p>') +
      SRC('44', '<p>Invariance: if ' + M('u = ax + b') + ' with a > 0 (for example F = 1.8C + 32), then ' + M('u_i - \\bar{u} = a(x_i - \\bar{x})') + ' and ' + M('s_u = a s_x') + ', so the a cancels in every z-score and r is unchanged.</p>') +
      SRC('46', '<p>Geometry: for centered vectors x̃ and ỹ in n-dimensional space, ' + M('r = \\frac{s_{xy}}{s_x s_y} = \\frac{\\tilde{x}\\cdot\\tilde{y}}{\\|\\tilde{x}\\|\\,\\|\\tilde{y}\\|} = \\cos\\theta') + '. Pearson correlation is literally the cosine of the angle between the centered data vectors. This idea returns as cosine similarity for documents in Lecture 9.</p>'),
    steps: XTRA('<p>Café orders again (lecture data, computed here).</p>', 'Extra worked numbers') + LEDGER([
      ['\\sum \\tilde{x}_i^2 = 2.25 + 0.25 + 0.25 + 2.25 = 5,\\quad s_x = \\sqrt{5/3} \\approx 1.291', 'Spread of x with n − 1 = 3.', 'plain'],
      ['\\sum \\tilde{y}_i^2 = 9 + 4 + 4 + 9 = 26,\\quad s_y = \\sqrt{26/3} \\approx 2.944', 'Spread of y.', 'plain'],
      ['r = \\frac{11/3}{1.291 \\times 2.944} = \\frac{11}{\\sqrt{5 \\times 26}} \\approx 0.965', 'The (n − 1) factors cancel, so r = Σx̃ỹ ÷ √(Σx̃² Σỹ²).']
    ]),
    lab: 'spread',
    labIntro: '<p>In "Two variables" mode, toggle "x × 10" and confirm r stays put while covariance changes.</p>',
    mistakes: ['Treating r as the slope. r = 0.5 does not mean y rises half a unit per unit of x (unless both are standardized, Lecture 4).', 'Thinking a negative scaling a < 0 keeps r. It flips the sign (extra fact: the a no longer cancels, its sign survives).', 'Concluding cause from a large r.'],
    connect: CHAIN(['Covariance', 'Correlation r', 'Slope θ₁* = r s_y ÷ s_x', 'Cosine similarity (Lecture 9)'], 1),
    worked: '<p>x = (1, 2, 3), y = (6, 4, 2): cov = −2, s_x = 1, s_y = √(8 ÷ 2) = 2, so r = −2 ÷ (1 × 2) = −1. Every point lies exactly on a falling line.</p>',
    tryq: 'l3-corr-t'
  }),
  revise: {formulas: ['zscore', 'corr'], when: 'Strength and direction of a linear relationship in a unit-free way.', formats: ['Compute r from sums.', 'Effect of changing units on cov and r.', 'r as a cosine.'], traps: ['r is not slope.', 'Unit changes affect covariance, not r.']},
  prereq: ['l3-cov'], next: ['l3-limits']
});

LESSON({id: 'l3-limits', lec: 3, title: 'What correlation cannot tell you', pages: '47 to 49', keys: 'zero correlation independence anscombe quartet datasaurus summary statistics limitations',
  quick: {what: 'Means, variances and r can be identical for completely different datasets.', why: 'y = x² is perfectly predictable from x yet has r = 0.', idea: 'Correlation only detects straight-line association. Always look at the data.', remember: 'Zero correlation does not imply independence.'},
  learn: LEARN({
    problem: '<p>If r = 0, are x and y unrelated? If two datasets share every summary statistic, do they look alike?</p>',
    model: '<p>r compresses a whole scatter into one number about straightness. Anything that is not a straight-line trend, like a curve, clusters or a picture of a dinosaur, can hide behind the same number.</p>',
    example: SRC('47', '<p>Observations of y = x² with x symmetric around 0: knowing x gives y with zero error, yet the best linear fit has slope 0 and r = 0.00 exactly.</p>') + SRC('48 to 49', '<p>Anscombe\'s quartet (Francis Anscombe, 1973) and the Datasaurus Dozen (Justin Matejka and George Fitzmaurice, 2017): datasets with matching summary statistics and wildly different shapes.</p>'),
    steps: XTRA('<p>Why r = 0 for y = x² on x = −1, 0, 1 (computed here):</p>', 'Extra worked numbers') + LEDGER([
      ['y = 1,\\ 0,\\ 1;\\quad \\bar{x} = 0,\\ \\bar{y} = \\tfrac{2}{3}', 'Means.', 'plain'],
      ['(x_i - \\bar{x})(y_i - \\bar{y}) = (-1)(\\tfrac{1}{3}),\\ 0,\\ (1)(\\tfrac{1}{3})', 'The left and right points contribute equal and opposite products.', 'plain'],
      ['\\sum = 0 \\Rightarrow \\mathrm{cov} = 0 \\Rightarrow r = 0', 'Perfect dependence, zero correlation.']
    ]),
    lab: 'spread',
    labIntro: '<p>In "Two variables" mode press "y = x² (exact dependence)". r is 0 while every point sits on the curve.</p>',
    mistakes: ['Saying "r = 0, so x tells us nothing about y".', 'Trusting summary statistics without a plot.', 'Assuming a high r means the relationship is linear; a curve can also produce a high r.'],
    connect: CHAIN(['r = 0', 'Not independence', 'Residual plots (Lecture 4)', 'Polynomial features (Lecture 7)'], 1) + '<p>The fix for curved patterns in prediction is to add features like x² (Lecture 4, p. 40, and Lecture 7).</p>',
    tryq: 'l3-limits-t'
  }),
  revise: {formulas: ['corr'], when: 'Interpreting r, especially r near 0.', formats: ['True or false: zero correlation means independence.', 'Construct a dependent pair with r = 0.'], traps: ['Zero r is not independence.', 'Same statistics, different shapes.']},
  prereq: ['l3-corr'], next: ['l4-features']
});

/* ======================= Lecture 4 ======================= */
LESSON({id: 'l4-features', lec: 4, title: 'Features, prediction time and group means', pages: '4 to 11', keys: 'features prediction time valid invalid group means conditional expectation bin width bias variance',
  quick: {what: 'A feature x is case-specific information used to predict ŷ = f(x).', why: 'A constant 4.0 min treats 1 drip coffee and 8 lattes plus 4 bagels identically.', idea: 'Only use features known at prediction time. Group means estimate E[Y | X = k] but fail for x values never seen.', remember: 'A valid feature exists at the moment you make the prediction.'},
  learn: LEARN({
    problem: SRC('4', '<p>Customer A orders 1 drip coffee; customer B orders 8 lattes and 4 bagels. A constant model predicts 4.0 minutes for both. The constant ŷ = ȳ does not depend on order size.</p>'),
    model: '<p>Instead of one answer for everyone, look up the cases most like this one and average them. With a single feature like item count, "most like" means "same number of items".</p>',
    example: SRC('6 to 8', '<p>Timeline: at <b>Order</b> we know the prediction time, item count and time of day (valid features). During <b>Prep</b> we learn milk volume and barista ID (invalid: available only after prediction time). At <b>Pickup</b> we observe the wait y. For predicting hospital length of stay at check-in, age, self-reported urgency, people in the waiting room and day and hour are all valid (p. 8).</p>') +
      SRC('9 to 11', MD('\\hat{f}(k) = \\frac{1}{|\\mathcal{D}_k|}\\sum_{i\\in\\mathcal{D}_k} y_i \\quad \\text{estimates } \\mathbb{E}[Y \\mid X = k]') + '<p>' + M('\\mathcal{D}_k') + ' is the set of past orders with k items. In the lecture data: 1 item gives 3.4 min, 2 items 5.8 min, 3 items 8.2 min. Problems: 6 and 7 items have no past orders, so no mean; 5 items has one order, a sketchy mean; for continuous x (like 71.439321 °F) every value is basically new. Bin width trades bias against variance: wide bins have many points per bin and stable means but systematic error; narrow bins have little systematic error but 0 or 1 points per bin and unstable means (p. 10).</p>'),
    steps: LEDGER([
      ['\\mathcal{D}_2 = \\{\\text{orders with 2 items}\\}', 'Collect the matching cases.', 'plain'],
      ['\\hat{f}(2) = \\frac{\\text{sum of their waits}}{\\text{how many there are}}', 'Numerator: total minutes. Denominator: count of 2-item orders, not all orders.', 'plain'],
      ['\\hat{f}(2) = 5.8\\ \\text{min (lecture)}', 'Prediction for any new 2-item order.']
    ]),
    mistakes: ['Using information that only exists after the prediction (milk volume, barista ID, the outcome itself). This is called leakage.', 'Dividing a group\'s total by the whole dataset size instead of the group size.', 'Trusting a group mean built from one observation.'],
    connect: CHAIN(['ŷ = c', 'ŷ = group mean ȳ_x', 'ŷ = θ₁x + θ₀', 'Many features (Lecture 7)'], 1) + '<p>The line (next lesson) is defined at every x, including 6 and 7 items (p. 11, 13).</p>',
    tryq: 'l4-features-t'
  }),
  revise: {formulas: ['group-mean'], when: 'Deciding whether a feature is allowed; computing a conditional mean.', formats: ['Which feature is invalid?', 'Compute a group mean.', 'Bin width trade-off.'], traps: ['Leakage.', 'Wrong denominator for a group mean.']},
  prereq: ['l2-choose'], next: ['l4-line']
});

LESSON({id: 'l4-line', lec: 4, title: 'Lines, residuals and least squares', pages: '12 to 19', keys: 'line slope intercept residual least squares objective squared residual area ceres gauss',
  quick: {what: 'A line ŷ = θ₁x + θ₀ predicts the mean outcome at every x with two parameters.', why: 'Group means need data at every x; a line borrows strength from all the data and is defined everywhere.', idea: 'The residual e_i = y_i − ŷ_i is the vertical gap. Least squares chooses θ₀, θ₁ to minimize the average squared residual.', remember: 'e = y − ŷ, so a positive residual means the point is above the line.'},
  learn: LEARN({
    problem: '<p>Group means have holes. We want a rule that predicts for any number of items, including ones we have never seen.</p>',
    model: '<p>Draw a line through the cloud of points. Each point\'s miss is a vertical stick from the point to the line. Square each stick into a little square of area e²; the best line makes the total area of those squares as small as possible (p. 17).</p>',
    example: SRC('12 to 13', '<p>' + M('y = mx + b \\longrightarrow \\hat{y} = \\theta_1 x + \\theta_0') + ': θ are the parameters to learn, x the feature, θ₀ the baseline offset when x = 0, θ₁ the minutes per extra item. With ' + M('\\hat{y} = 2x + 1') + ', a 3-item order predicts 7 min, and θ₁ = 2 means 2 more minutes per extra item.</p>') +
      SRC('16, 19', MD('e_i = y_i - \\hat{y}_i,\\qquad R(\\theta_0, \\theta_1) = \\frac{1}{n}\\sum_{i=1}^{n}\\big(y_i - (\\theta_1 x_i + \\theta_0)\\big)^2,\\qquad (\\theta_0^*, \\theta_1^*) = \\argmin_{\\theta_0, \\theta_1} R') + '<p>Compare with Lecture 2: before, ' + M('\\mathrm{MSE} = \\frac{1}{n}\\sum (y_i - c)^2') + '. The constant c has simply been replaced by a line.</p>') +
      SRC('15', '<p>History: Piazzi observed Ceres for 40 days in January 1801 before it disappeared behind the Sun. Gauss, at 24, computed its orbit by least squares, and Ceres was found at the predicted position in December 1801. Legendre published the method in 1805, Gauss in 1809.</p>'),
    steps: '<p>Café orders, x = (1, 2, 3, 4) and y = (3, 4, 8, 9), with the line ŷ = 1 + 2x:</p>' + LEDGER([
      ['\\hat{y} = 3,\\ 5,\\ 7,\\ 9', 'Plug each x into 1 + 2x.', 'plain'],
      ['e = y - \\hat{y} = 0,\\ -1,\\ 1,\\ 0', 'Order of subtraction matters: actual minus predicted.', 'plain'],
      ['e^2 = 0,\\ 1,\\ 1,\\ 0 \\quad (\\text{sum } 2)', 'Areas of the squares.', 'plain'],
      ['R(1, 2) = \\frac{2}{4} = 0.5', 'Average over n = 4. The least-squares line (next lesson) does slightly better: 0.45.']
    ]),
    lab: 'regression',
    labIntro: '<p>Drag the sliders to shrink the amber squares, then press "Snap to least squares". Drag a data point to see the fitted line react.</p>',
    mistakes: ['Writing e = ŷ − y in Lecture 4. The lecture uses y − ŷ here (Lecture 7 later uses r = ŷ − y, so watch the sign convention in each lecture).', 'Measuring residuals perpendicular to the line. They are vertical.', 'Interpreting θ₀ as meaningful when x = 0 is outside the data (an order with zero items).'],
    connect: CHAIN(['MSE of a constant', 'MSE of a line', 'Closed-form OLS', 'Search when no formula exists (Lecture 5)'], 1),
    tryq: 'l4-line-t'
  }),
  revise: {formulas: ['line', 'residual', 'ls-objective'], when: 'Predicting with a fitted line; evaluating a candidate line.', formats: ['Compute residuals and MSE for a given line.', 'Interpret slope and intercept in context.'], traps: ['Residual sign.', 'Intercept interpretation.']},
  prereq: ['l4-features'], next: ['l4-ols']
});

LESSON({id: 'l4-ols', lec: 4, title: 'Deriving the least-squares coefficients', pages: '20 to 32', keys: 'ols derivation slope intercept covariance variance pearson regression to the mean galton standardized',
  quick: {what: 'Least squares has an exact answer: θ₁* = Σx̃ỹ ÷ Σx̃², θ₀* = ȳ − θ₁*x̄.', why: 'Calculus gives the best line directly, with no searching.', idea: 'The intercept condition forces the line through (x̄, ȳ). Then only the slope remains, and it equals cov ÷ var, or r s_y ÷ s_x.', remember: 'Slope = Σ(x − x̄)(y − ȳ) ÷ Σ(x − x̄)²; the intercept puts the line through the means.'},
  learn: LEARN({
    problem: '<p>Which line minimizes R(θ₀, θ₁) for the café data, exactly?</p>',
    model: '<p>Two dials, one bowl-shaped landscape (p. 19). Find where the bowl is flat in both directions. First fix the intercept dial using the slope dial, then solve the slope on its own.</p>',
    example: SRC('20 to 28', LEDGER([
      ['\\frac{\\partial R}{\\partial \\theta_0} = -\\frac{2}{n}\\sum e_i = 0 \\Rightarrow \\sum e_i = 0', 'Step 1 and 2: the residuals must balance.', 'plain'],
      ['\\theta_0^* = \\bar{y} - \\theta_1\\bar{x}', 'So the line passes through (x̄, ȳ) for every slope (p. 20); at x = x̄ the prediction is ȳ (p. 21).', 'plain'],
      ['\\hat{y}_i - \\bar{y} = \\theta_1(x_i - \\bar{x}),\\ \\text{i.e. } \\hat{\\tilde{y}}_i = \\theta_1\\tilde{x}_i', 'Step 3: center the data; the line now goes through the origin.', 'plain'],
      ['R(\\theta_1) = \\frac{1}{n}\\sum(\\tilde{y}_i - \\theta_1\\tilde{x}_i)^2', 'Step 4: a parabola in θ₁ alone.', 'plain'],
      ['\\frac{dR}{d\\theta_1} = -\\frac{2}{n}\\sum\\tilde{x}_i\\tilde{y}_i + \\frac{2\\theta_1}{n}\\sum\\tilde{x}_i^2', 'Step 5: chain rule, inner derivative −x̃_i.', 'plain'],
      ['\\theta_1^* = \\frac{\\sum\\tilde{x}_i\\tilde{y}_i}{\\sum\\tilde{x}_i^2} = \\frac{\\sum(x_i - \\bar{x})(y_i - \\bar{y})}{\\sum(x_i - \\bar{x})^2}', 'Step 6: requires the x_i not all equal.', 'plain'],
      ['\\theta_1^* = \\frac{s_{xy}}{s_x^2} = \\frac{\\mathrm{Cov}(x,y)}{\\mathrm{Var}(x)},\\quad \\frac{d^2R}{d\\theta_1^2} = \\frac{2}{n}\\sum\\tilde{x}_i^2 > 0', 'Step 7: covariance over variance; the positive second derivative confirms a minimum.']
    ])),
    steps: '<p>Café data, every number:</p>' + LEDGER([
      ['\\bar{x} = \\frac{1+2+3+4}{4} = 2.5,\\quad \\bar{y} = \\frac{3+4+8+9}{4} = 6', 'Means.', 'plain'],
      ['\\tilde{x} = -1.5,\\ -0.5,\\ 0.5,\\ 1.5;\\quad \\tilde{y} = -3,\\ -2,\\ 2,\\ 3', 'Centered values.', 'plain'],
      ['\\sum\\tilde{x}_i\\tilde{y}_i = 4.5 + 1 + 1 + 4.5 = 11', 'Numerator: how x and y move together.', 'plain'],
      ['\\sum\\tilde{x}_i^2 = 2.25 + 0.25 + 0.25 + 2.25 = 5', 'Denominator: how much x moves on its own.', 'plain'],
      ['\\theta_1^* = \\frac{11}{5} = 2.2\\ \\text{min per item}', 'Lecture result (p. 24 plot: minimum at 2.2).', 'plain'],
      ['\\theta_0^* = 6 - 2.2 \\times 2.5 = 0.5\\ \\text{min}', 'Through the means. The fitted line is ŷ = 0.5 + 2.2x.']
    ]) + SRC('28 to 32', '<p>Writing ' + M('s_{xy} = r\\,s_x s_y') + ' gives ' + M('\\theta_1^* = r\\frac{s_y}{s_x}') + ': r carries sign and strength (no units), ' + M('s_y/s_x') + ' carries units of y per unit of x. If both variables are standardized (' + M('s_x = s_y = 1') + '), then ' + M('\\hat{z}_y = r\\,z_x') + '. Since |r| < 1 unless all points lie on one line, predictions are closer to the mean than the inputs: Galton\'s 1886 "regression towards mediocrity". Quick check: r = 0.5 and a parent at ' + M('z_x = +2') + ' predicts ' + M('\\hat{z}_y = 0.5 \\times 2 = +1') + '. Units: slope in [y]/[x], intercept in [y].</p>'),
    lab: 'regression',
    mistakes: ['Dividing by Σ(y − ȳ)² instead of Σ(x − x̄)² in the slope.', 'Computing θ₀ as ȳ − x̄ or forgetting to multiply by θ₁.', 'Using r as the slope when the variables are not standardized.', 'Applying the formula when all x are equal (division by zero: no unique slope).'],
    connect: CHAIN(['Covariance', 'Slope θ₁*', 'Residual properties', 'Normal equations (matrix form)'], 1),
    worked: '<p>Check with r: r ≈ 0.965, s_y ≈ 2.944, s_x ≈ 1.291, so r s_y ÷ s_x ≈ 0.965 × 2.280 ≈ 2.2. Same slope, different route.</p>',
    tryq: 'l4-ols-t'
  }),
  revise: {formulas: ['ols-slope', 'ols-intercept', 'slope-r'], when: 'Fitting a one-feature line by least squares exactly.', formats: ['Compute θ₁*, θ₀* from data.', 'Derive θ₀* from ∂R/∂θ₀ = 0.', 'Standardized prediction ẑ_y = r z_x.'], traps: ['Wrong denominator.', 'r versus slope.', 'Intercept formula.']},
  prereq: ['l4-line', 'l3-corr'], next: ['l4-props']
});

LESSON({id: 'l4-props', lec: 4, title: 'Residual properties and R²', pages: '33 to 40', keys: 'residuals sum to zero orthogonal r squared tss ess rss variance explained residual plot',
  quick: {what: 'Least-squares residuals sum to zero and are orthogonal to x and to ŷ; R² = 1 − RSS ÷ TSS.', why: 'These let you check a fit and say how much better it is than predicting ȳ for everyone.', idea: 'Total variation splits into explained plus leftover: TSS = ESS + RSS.', remember: 'With an intercept, residuals always sum to zero; R² compares the line with the constant ȳ.'},
  learn: LEARN({
    problem: '<p>Someone hands you residuals. Can you tell whether they came from a least-squares fit? And how good is a fit, as a single number?</p>',
    model: '<p>The fitted values ŷ are the part of y the line can explain; the residuals are what is left. Least squares leaves nothing explainable in the residuals: no average offset, no leftover trend in x.</p>',
    example: SRC('33 to 37', LEDGER([
      ['\\sum e_i = \\sum(y_i - \\bar{y}) - \\theta_1^*\\sum(x_i - \\bar{x}) = 0 - \\theta_1^*\\cdot 0 = 0', 'Property 1: positive and negative errors balance.', 'plain'],
      ['\\frac{\\partial R}{\\partial \\theta_1} = -\\frac{2}{n}\\sum x_i e_i = 0 \\Rightarrow \\mathbf{x}^\\top\\mathbf{e} = 0', 'Property 2: if xᵀe ≠ 0, a small change in θ₁ would lower R.', 'plain'],
      ['\\sum\\hat{y}_i e_i = \\theta_1^*\\sum x_i e_i + \\theta_0^*\\sum e_i = 0', 'Property 3: y = ŷ + e with ŷ ⊥ e.']
    ]) + '<p>Quick check: residuals +2, +1, +3. Least-squares fit with an intercept? No: ' + M('\\sum e_i = 6 \\ne 0') + ' (pp. 35 to 36).</p>') +
      SRC('38 to 40', MD('\\text{TSS} = \\sum(y_i - \\bar{y})^2,\\quad \\text{ESS} = \\sum(\\hat{y}_i - \\bar{y})^2,\\quad \\text{RSS} = \\sum(y_i - \\hat{y}_i)^2,\\quad \\text{TSS} = \\text{ESS} + \\text{RSS}') + MD('R^2 = \\frac{\\text{ESS}}{\\text{TSS}} = 1 - \\frac{\\text{RSS}}{\\text{TSS}}') + '<p>TSS is the variation of y, ESS the variation of the predictions, RSS the variation left in the residuals. R² = 0.85 means 85% less squared error than ŷ = ȳ. R² = 0 means no gain over ȳ. R² < 0 means worse than ȳ, which can only happen on test data. Residual plots (p. 40): no pattern means the line fits the mean; a curve suggests adding a feature such as x²; spread growing with x means the noise variance is not constant.</p>'),
    steps: XTRA('<p>The café fit ŷ = 0.5 + 2.2x (lecture coefficients; the R² arithmetic is computed here):</p>', 'Extra worked numbers') + LEDGER([
      ['\\hat{y} = 2.7,\\ 4.9,\\ 7.1,\\ 9.3;\\quad e = 0.3,\\ -0.9,\\ 0.9,\\ -0.3', 'Residuals. They sum to 0 (property 1).', 'plain'],
      ['\\mathbf{x}^\\top\\mathbf{e} = 1(0.3) + 2(-0.9) + 3(0.9) + 4(-0.3) = 0', 'Property 2 holds.', 'plain'],
      ['\\text{RSS} = 0.09 + 0.81 + 0.81 + 0.09 = 1.8,\\quad \\text{TSS} = 9 + 4 + 4 + 9 = 26', 'RSS from residuals; TSS from y − ȳ = −3, −2, 2, 3.', 'plain'],
      ['R^2 = 1 - \\frac{1.8}{26} \\approx 0.931 = r^2', 'With one feature and an intercept, R² = r² (p. 52): 0.965² ≈ 0.931.']
    ]),
    lab: 'regression',
    labIntro: '<p>Snap to least squares: the residual column sums to 0. Move the line away and it stops summing to zero.</p>',
    mistakes: ['Thinking R² can never be negative. On test data a model can be worse than predicting the mean.', 'Computing TSS around 0 instead of around ȳ.', 'Mixing RSS (a sum) with MSE (an average).'],
    connect: CHAIN(['Residuals', 'Orthogonality', 'Projection (matrix form)', 'Evaluation on test data'], 1),
    tryq: 'l4-props-t'
  }),
  revise: {formulas: ['r2', 'tss-decomp'], when: 'Checking whether residuals come from least squares; summarizing fit quality.', formats: ['Could these residuals come from OLS with an intercept?', 'Compute R² from RSS and TSS.', 'Interpret a residual plot.'], traps: ['R² < 0 on test data.', 'Sum versus average.']},
  prereq: ['l4-ols'], next: ['l4-pitfalls']
});

LESSON({id: 'l4-pitfalls', lec: 4, title: 'Leverage, extrapolation, causation and Simpson\'s paradox', pages: '41 to 46', keys: 'leverage outlier extrapolation correlation causation confounder simpson paradox spread of x',
  quick: {what: 'A fitted line can be distorted by unusual points, misused outside its training range, or misread as causal.', why: 'Least squares trusts every point equally in its sums and never warns you.', idea: 'Wide x spread stabilizes the slope; one far, off-trend point can flip it; a hidden variable can create correlation.', remember: 'Don\'t extrapolate, don\'t read cause from correlation, and check for groups.'},
  learn: LEARN({
    problem: '<p>The café line says 2.2 minutes per item. Can we use it for a 500-item catering order? Does buying ice cream cause drowning?</p>',
    model: '<p>Least squares is a balance on the sums Σx̃ỹ and Σx̃². A point far from x̄ has a long lever arm and can dominate both sums. Outside the observed x range the line is untested, and correlation in observational data may come from a third factor.</p>',
    example: SRC('41 to 43', '<p>With x confined to [4.5, 5.5], fitted slopes vary widely between samples; with x spread over [0.5, 9.5] they agree (p. 41). A <b>response outlier</b> (typical x, unusual y) shifts the line up with little slope change; a <b>good leverage point</b> (x far from x̄, on trend) makes the slope more precise; a <b>bad leverage point</b> (far x, off trend) rotates the line toward it (p. 42). One bad point changed the slope from 2.20 to −0.32 (p. 43).</p>') +
      SRC('44', '<p>Training data x ∈ [1, 4]. At x = 500: ŷ = 1100.5 min ≈ 18.3 h. Real bulk brewing (carafes) takes far less than 2.2 min per item. The line is untested outside [x_min, x_max].</p>') +
      SRC('45 to 46', '<p>Ice cream sales x and drowning deaths y have r = +0.89, but summer heat Z drives both. Simpson\'s paradox: within each group the slope is negative, groups with larger x have larger y, so pooling gives a positive slope; adding the group as a feature recovers the within-group slope.</p>'),
    steps: LEDGER([
      ['\\hat{y}(500) = 0.5 + 2.2 \\times 500 = 1100.5\\ \\text{min}', 'Arithmetic is easy; the problem is trust.', 'plain'],
      ['1100.5 \\div 60 \\approx 18.3\\ \\text{h}', 'The lecture\'s conversion.']
    ]),
    mistakes: ['Extrapolating far outside the training range.', 'Removing a point just because it is far from x̄. Good leverage points help.', 'Claiming a feature causes the outcome because r is large.', 'Pooling groups that behave differently without including the group as a feature.'],
    connect: CHAIN(['Fitted line', 'Check leverage and range', 'Interpretation', 'More features fix confounding (Lecture 7)'], 1),
    tryq: 'l4-pitfalls-t'
  }),
  revise: {formulas: ['line'], when: 'Interpreting a fit, spotting unreliable predictions.', formats: ['Classify a point as outlier, good or bad leverage.', 'Is this prediction an extrapolation?', 'Explain a confounder or Simpson\'s paradox.'], traps: ['Correlation as causation.', 'Extrapolation.']},
  prereq: ['l4-props'], next: ['l4-matrix']
});

LESSON({id: 'l4-matrix', lec: 4, title: 'Matrix form and the normal equations', pages: '47 to 52', keys: 'design matrix normal equations X transpose X inverse projection column space',
  quick: {what: 'Stacking all n equations gives y ≈ Xθ, with a column of ones for the intercept.', why: 'The matrix form solves least squares with one formula for any number of features.', idea: 'Setting the gradient −2Xᵀ(y − Xθ) to zero gives the normal equations XᵀXθ = Xᵀy.', remember: 'θ* = (XᵀX)⁻¹Xᵀy, valid when XᵀX is invertible.'},
  learn: LEARN({
    problem: '<p>The scalar derivation worked for one feature. Lecture 7 needs two, then many. We want the same answer in a form that scales.</p>',
    model: '<p>Each row of X describes one case: a 1 (for the intercept) and its x. Multiplying X by θ produces every prediction at once. Least squares looks for the θ whose predictions vector is closest to y.</p>',
    example: SRC('45 to 47', MD('\\begin{bmatrix} y_1 \\\\ y_2 \\\\ \\vdots \\\\ y_n \\end{bmatrix} \\approx \\begin{bmatrix} 1 & x_1 \\\\ 1 & x_2 \\\\ \\vdots & \\vdots \\\\ 1 & x_n \\end{bmatrix}\\begin{bmatrix} \\theta_0 \\\\ \\theta_1 \\end{bmatrix},\\qquad \\mathbf{y} \\approx X\\boldsymbol{\\theta},\\ X \\in \\mathbb{R}^{n\\times 2}') + MD('\\mathrm{RSS}(\\boldsymbol{\\theta}) = \\|\\mathbf{y} - X\\boldsymbol{\\theta}\\|^2,\\quad \\nabla_{\\boldsymbol{\\theta}}\\mathrm{RSS} = -2X^\\top(\\mathbf{y} - X\\boldsymbol{\\theta}) = \\mathbf{0},\\quad X^\\top X\\boldsymbol{\\theta} = X^\\top\\mathbf{y}')) +
      SRC('48', '<p>With one feature: ' + M('X^\\top X = \\begin{bmatrix} n & \\sum x_i \\\\ \\sum x_i & \\sum x_i^2 \\end{bmatrix}') + ' and ' + M('X^\\top\\mathbf{y} = \\begin{bmatrix} \\sum y_i \\\\ \\sum x_i y_i \\end{bmatrix}') + '. The first row gives ' + M('n\\theta_0 + \\theta_1\\sum x_i = \\sum y_i \\Rightarrow \\theta_0^* = \\bar{y} - \\theta_1\\bar{x}') + ', the same answer as before.</p>'),
    steps: '<p>Café orders (p. 49), every entry:</p>' + LEDGER([
      ['X^\\top X = \\begin{bmatrix} 4 & 1+2+3+4 \\\\ 10 & 1+4+9+16 \\end{bmatrix} = \\begin{bmatrix} 4 & 10 \\\\ 10 & 30 \\end{bmatrix}', 'Top left is n = 4; off-diagonals Σx = 10; bottom right Σx² = 30.', 'plain'],
      ['X^\\top\\mathbf{y} = \\begin{bmatrix} 3+4+8+9 \\\\ 3+8+24+36 \\end{bmatrix} = \\begin{bmatrix} 24 \\\\ 71 \\end{bmatrix}', 'Σy = 24 and Σxy = 1(3) + 2(4) + 3(8) + 4(9) = 71.', 'plain'],
      ['\\det = 4 \\times 30 - 10 \\times 10 = 20,\\quad (X^\\top X)^{-1} = \\frac{1}{20}\\begin{bmatrix} 30 & -10 \\\\ -10 & 4 \\end{bmatrix}', '2 × 2 inverse: swap the diagonal, negate the off-diagonal, divide by the determinant.', 'plain'],
      ['\\boldsymbol{\\theta}^* = \\frac{1}{20}\\begin{bmatrix} 30(24) - 10(71) \\\\ -10(24) + 4(71) \\end{bmatrix} = \\frac{1}{20}\\begin{bmatrix} 10 \\\\ 44 \\end{bmatrix} = \\begin{bmatrix} 0.50 \\\\ 2.20 \\end{bmatrix}', 'Same line as the scalar derivation.']
    ]) + SRC('50 to 52', '<p>Geometry: ' + M('\\hat{\\mathbf{y}} = X\\boldsymbol{\\theta}^*') + ' is the closest point to y in the column space of X; the residual ' + M('\\mathbf{e} = \\mathbf{y} - \\hat{\\mathbf{y}}') + ' is orthogonal to that space, ' + M('X^\\top\\mathbf{e} = \\mathbf{0}') + '; the projection matrix is ' + M('P = X(X^\\top X)^{-1}X^\\top') + '. Summary: line through (x̄, ȳ), θ₁* = r s_y ÷ s_x, Σe = 0 and xᵀe = 0, R² = r², features available at prediction time.</p>'),
    mistakes: ['Forgetting the column of ones, which silently forces the intercept to 0.', 'Getting the 2 × 2 inverse wrong: the off-diagonal entries are negated, the diagonal entries swapped.', 'Inverting XᵀX when it is singular (for example all x equal).'],
    connect: CHAIN(['Scalar OLS', 'Normal equations', 'Many features (Lecture 7)', 'Gradient descent when no formula (Lectures 5, 6)'], 1),
    tryq: 'l4-matrix-t'
  }),
  revise: {formulas: ['normal-eq'], when: 'Least squares with the design matrix; any number of features.', formats: ['Build XᵀX and Xᵀy for small data.', 'Solve the 2 × 2 system.', 'Interpret Xᵀe = 0.'], traps: ['Missing ones column.', '2 × 2 inverse sign errors.']},
  prereq: ['l4-ols'], next: ['l5-why']
});

/* ======================= Lecture 5 ======================= */
LESSON({id: 'l5-why', lec: 5, title: 'When there is no formula: search', pages: '12 to 17', keys: 'search optimization candidate objective mae line no closed form sign parameter space',
  quick: {what: 'When a loss has no closed-form minimizer, we compare candidate parameter values directly.', why: 'Switching from MSE to MAE breaks the OLS derivation: the derivative gives only signs, not magnitudes.', idea: 'Any prediction rule can be scored on the same observations, so candidates can be ranked by loss.', remember: 'Candidate, objective, search (explore), optimization (find the best).'},
  learn: LEARN({
    problem: SRC('12', '<p>Same café data, now scored with MAE as well as MSE:</p>' + TABLE(['Candidate line', 'MSE', 'MAE'], [['OLS: ŷ = 0.5 + 2.2x', '0.45', '0.60'], ['Alternative: ŷ = 1 + 2x', '0.50', '0.50']]) + '<p>Under MAE the OLS coefficients no longer win. Can we repeat the derivation and get a closed-form answer?</p>'),
    model: '<p>Picture the loss as a landscape over the (θ₀, θ₁) plane. Each point is one possible line (p. 17). We don\'t need a formula if we can walk around the landscape and remember the lowest spot we found.</p>',
    example: SRC('13 to 16', '<p>For MSE, setting the intercept derivative to zero gives Σe_i = 0, and expanding the errors keeps the coefficient magnitudes. For MAE it gives ' + M('\\sum_i \\mathrm{sign}(e_i) = 0') + ' (positive error → +1, negative → −1), which cannot isolate the coefficients. Functions can be smooth, have corners (MAE), or jump with local minima (p. 14). Vocabulary (p. 15): a <b>candidate</b> is one possible answer, such as ŷ = 1 + 2x; the <b>objective</b> is the loss as before; <b>search</b> explores candidates; <b>optimization</b> finds the best. Recipe (p. 16): choose a candidate, evaluate it, keep the best so far, repeat within a budget. Methods differ only in the rule for choosing the next candidate.</p>'),
    steps: '<p>MAE of the OLS line (checking the table):</p>' + LEDGER([
      ['e = 0.3,\\ -0.9,\\ 0.9,\\ -0.3', 'Residuals of ŷ = 0.5 + 2.2x.', 'plain'],
      ['\\mathrm{MAE} = \\frac{0.3 + 0.9 + 0.9 + 0.3}{4} = \\frac{2.4}{4} = 0.60', 'Absolute values, averaged.', 'plain'],
      ['\\text{line } 1 + 2x:\\ e = 0,\\ -1,\\ 1,\\ 0 \\Rightarrow \\mathrm{MAE} = 0.50', 'Lower MAE than OLS, even though its MSE is higher.']
    ]) + '<p>The constant predictor ŷ = 6 is the same rule with slope 0, so it is the point (6, 0) in the parameter plane (p. 17).</p>',
    lab: 'search',
    mistakes: ['Assuming OLS coefficients are optimal for every loss.', 'Confusing a point in parameter space (θ₀, θ₁) with a data point (x, y).', 'Thinking search needs derivatives. Only gradient descent does.'],
    connect: CHAIN(['Closed form (Lecture 4)', 'No closed form', 'Search methods', 'Gradient descent'], 1),
    tryq: 'l5-why-t'
  }),
  revise: {formulas: ['mae'], when: 'Losses without closed-form solutions (MAE lines, classification error, log loss).', formats: ['Compute MSE and MAE for two lines and compare.', 'Why can\'t MAE be solved like OLS?'], traps: ['OLS optimal under MAE.']},
  prereq: ['l4-ols'], next: ['l5-methods']
});

LESSON({id: 'l5-methods', lec: 5, title: 'Exhaustive, grid and random search', pages: '18 to 23', keys: 'exhaustive search grid search random search budget probability 0.95 iid 59 draws',
  quick: {what: 'Exhaustive and grid search test a fixed list of candidates; random search draws candidates independently.', why: 'We can\'t test every real-valued pair, and lists explode as coefficients multiply.', idea: 'If each independent draw lands in a good region with probability p, all B draws miss with probability (1 − p)^B.', remember: 'Target the best 5%: P(at least one hit) = 1 − 0.95^B, and 59 draws give about 95%.'},
  learn: LEARN({
    problem: '<p>With a budget of evaluations, which candidates should we test?</p>',
    model: '<p>Grid search lays a fixed net over the landscape and can only catch what falls on the net. Random search throws darts; each dart has the same fixed chance of landing in a good patch, independent of the others, so more darts steadily raise the chance of at least one good hit.</p>',
    example: SRC('18 to 20', '<p><b>Exhaustive</b>: permitted intercepts 0, 1, 2 and slopes 1, 2, 3 give 3 × 3 = 9 lines; test every one and keep the lowest MSE. With 5 choices for each of 10 coefficients there are ' + M('5^{10} = 9{,}765{,}625') + ' combinations. <b>Grid</b>: intercepts in [−4, 4] and slopes in [0, 4], tested at −4, 0, 4 and 0, 2, 4: again 9 tests. Neither is guaranteed to include OLS. <b>Random</b>: pick an intercept and slope at random, compute MSE, keep if better, repeat until the budget is used; each candidate drawn i.i.d.</p>') +
      SRC('21 to 23', '<p>Suppose the green region, the lowest-loss 5% of the area, is the target. Each fresh draw has a 5% chance. In 1,000 repeated searches, after 1 draw about 950 have no luck; after 2 draws, 95% of those still miss: 950 × 0.95 = 902.5.</p>' + TABLE(['Draws B', '0.95^B (all miss)', 'Chance at least one hits'], [['1', '95.00%', '5.00%'], ['10', '59.87%', '40.13%'], ['40', '12.85%', '87.15%'], ['58', '5.10%', '94.90%'], ['59', '4.85%', '95.15%']])),
    steps: LEDGER([
      ['P(\\text{one draw misses}) = 1 - 0.05 = 0.95', 'The complement of landing in the 5% region.', 'plain'],
      ['P(\\text{all } B \\text{ miss}) = 0.95 \\times 0.95 \\times \\cdots = 0.95^B', 'Draws are independent, so probabilities multiply.', 'plain'],
      ['P(\\text{at least one hit}) = 1 - 0.95^B', 'Complement again. B = 10: 1 − 0.5987 = 0.4013.']
    ]),
    lab: 'search',
    labIntro: '<p>Compare the exhaustive and grid nets, then switch to random and slide the budget: the footer prints 1 − 0.95^B.</p>',
    mistakes: ['Adding instead of multiplying: 10 draws do not give 10 × 5% = 50%.', 'Forgetting the complement: 0.95^B is the probability of failure, not success.', 'Thinking a finer grid is cheap. Grid size grows as (values per axis)^(number of coefficients).'],
    connect: CHAIN(['Fixed list', 'Random draws', 'Use the current candidate (hill climbing)', 'Use the gradient'], 1),
    tryq: 'l5-methods-t'
  }),
  revise: {formulas: ['random-search'], when: 'Probability that random search reaches a good region; counting grid candidates.', formats: ['Compute 1 − 0.95^B.', 'Smallest B for 95% success.', 'Count grid points.'], traps: ['Adding probabilities.', 'Success versus failure probability.']},
  prereq: ['l5-why'], next: ['l5-hill']
});

LESSON({id: 'l5-hill', lec: 5, title: 'Hill climbing and searching over answers', pages: '24 to 30', keys: 'hill climbing step size gamma local neighbors stall plateau ties assignment autograder search',
  quick: {what: 'Hill climbing uses the current candidate to choose the next: nudge one coefficient up or down and keep improvements.', why: 'Random search throws away everything it has learned; local moves exploit it.', idea: 'It stops when no step of size γ helps, which can happen too early when γ is large.', remember: 'Hill climbing can stall: (1, 2) beats all its ±0.5 neighbors but is not the OLS optimum.'},
  learn: LEARN({
    problem: '<p>Random search ignores where good candidates were found. Can we search near the best candidate so far?</p>',
    model: '<p>Stand somewhere on the landscape, test one step in each direction, and step to the best improvement. When every step goes uphill, stop. With big steps you can stand next to a valley and step over it in every direction.</p>',
    example: SRC('24 to 25', '<p>Start at (1, 0). Try increasing or decreasing one coefficient by γ = 0.5 with the other fixed, evaluate, keep improvements, and stop if nothing improves or after B evaluations. At (1, 2), with MSE 0.5:</p>' + TABLE(['Proposed coefficients', 'Change', 'MSE'], [['(0.5, 2)', 'Decrease intercept', '0.75'], ['(1.5, 2)', 'Increase intercept', '0.75'], ['(1, 1.5)', 'Decrease slope', '2.625'], ['(1, 2.5)', 'Increase slope', '2.125'], ['(1, 2.05)', 'Smaller slope step 0.05', '0.49375']]) + '<p>Every 0.5 step is worse than 0.5, so the search stops, short of OLS (0.45). A smaller step finds an improvement.</p>') +
      SRC('26 to 30', '<p>Search can even run over assignment answers: guessing what an autograder accepts, for example the number of CSV rows (3 points) or a median delay (1 point). Over integer constants and over candidate computations (mean, median, 2 × mean, and so on), the average best score out of 53:</p>' + TABLE(['Method', 'Integer constants', 'Candidate computations'], [['Grid search', '0.26', '0.88'], ['Random search', '2.90', '9.52'], ['Strict hill climbing', '0.26', '2.12'], ['Hill climbing with ties', '0.34', '13.07'], ['Change one answer', '7.36', '46.38']]) + '<p>Constants can earn at most 9 points. The lecture asks: why doesn\'t naive hill climbing work?</p>') +
      XTRA('<p>All-or-nothing grading makes the score landscape flat almost everywhere: changing a wrong answer to a different wrong answer leaves the score unchanged. Strict hill climbing only accepts strict improvements, so on a plateau it sees no better neighbor and stops. Accepting ties lets it wander across plateaus (2.12 to 13.07), and changing one answer at a time isolates each question\'s points (46.38).</p>'),
    steps: '<p>Verify one row: (1, 2.5) means ŷ = 1 + 2.5x.</p>' + LEDGER([
      ['\\hat{y} = 3.5,\\ 6,\\ 8.5,\\ 11', 'Predictions for x = 1 to 4.', 'plain'],
      ['e = -0.5,\\ -2,\\ -0.5,\\ -2', 'y − ŷ with y = 3, 4, 8, 9.', 'plain'],
      ['\\mathrm{MSE} = \\frac{0.25 + 4 + 0.25 + 4}{4} = \\frac{8.5}{4} = 2.125', 'Matches the table.']
    ]),
    lab: 'search',
    labIntro: '<p>Choose "Hill climbing". With γ = 0.5 the path stops at (1, 2). Drop γ to 0.05 and raise the budget.</p>',
    mistakes: ['Moving both coefficients at once. In the lecture\'s version, each proposal changes one coefficient.', 'Thinking hill climbing always finds the global minimum. It stops at the first point with no improving neighbor at step γ.', 'Concluding "no neighbor improves" means optimal: it may only mean the step is too big.'],
    connect: CHAIN(['Random search', 'Hill climbing', 'Gradient descent (direction from the derivative)'], 1),
    tryq: 'l5-hill-t'
  }),
  revise: {formulas: ['ls-objective'], when: 'Searching without derivatives using local moves.', formats: ['Evaluate the four neighbors of a point.', 'Does hill climbing stop here?', 'Why do plateaus break strict hill climbing?'], traps: ['Step too large.', 'Changing both coefficients.']},
  prereq: ['l5-methods'], next: ['l5-gd']
});

LESSON({id: 'l5-gd', lec: 5, title: 'Gradient descent and the learning rate', pages: '31 to 32', keys: 'gradient descent learning rate eta step size diverge converge overshoot simultaneous update',
  quick: {what: 'Gradient descent moves every coefficient a step against its derivative: θ_new = θ − ηg.', why: 'The derivative says which way is downhill, so we don\'t need to test neighbors.', idea: 'The learning rate η sets the step size: too small is slow, too large overshoots and can diverge.', remember: 'Subtract the gradient, update all coefficients together, and choose η carefully.'},
  learn: LEARN({
    problem: '<p>Hill climbing tests neighbors blindly. The slope of the loss already tells us the downhill direction. How do we use it?</p>',
    model: '<p>A positive derivative means "a small increase makes the loss worse", so decrease the coefficient; a negative derivative means increase it. Step size is proportional to the slope: steep slopes give big steps, and near the bottom the steps shrink by themselves.</p>',
    example: SRC('31', MD('\\theta_j^{\\text{new}} = \\theta_j - \\eta\\,g_j,\\qquad g_j = \\frac{\\partial L}{\\partial \\theta_j},\\ \\eta > 0') + '<p>Calculate every derivative at the current line, then update all coefficients together. Rinse, repeat.</p>') +
      SRC('32', '<p>For ' + M('L(c) = c^2') + ', the minimum is at 0 and the derivative is 2c, so ' + M('c_{\\text{new}} = c - \\eta(2c) = (1 - 2\\eta)c') + '. With η = 0.1, multiply by 0.8: 2 → 1.6 → 1.28. With η = 0.5, multiply by 0: done in one step. With η = 1.1, multiply by −1.2: 2 → −2.4 → 2.88, growing and flipping sign.</p>'),
    steps: LEDGER([
      ['c = 2,\\ \\eta = 0.1:\\ g = 2c = 4', 'Slope at the current point.', 'plain'],
      ['c_{\\text{new}} = 2 - 0.1 \\times 4 = 1.6', 'Subtract η times the slope.', 'plain'],
      ['g = 3.2,\\ c_{\\text{new}} = 1.6 - 0.32 = 1.28', 'Second step: smaller slope, smaller step.']
    ]) + XTRA('<p>On the café MSE, starting at (0, 0): residuals equal y, so ' + M('g_0 = -\\frac{2}{4}\\sum e_i = -\\frac{2}{4}(24) = -12') + ' and ' + M('g_1 = -\\frac{2}{4}\\sum x_i e_i = -\\frac{2}{4}(71) = -35.5') + '. With η = 0.1 both move at once: θ₀ = 0 − 0.1(−12) = 1.2 and θ₁ = 0 − 0.1(−35.5) = 3.55. For this data, η above about 0.12 diverges, which the lab lets you see.</p>', 'Extra worked numbers'),
    lab: 'gd',
    mistakes: ['Adding the gradient instead of subtracting it, which climbs uphill.', 'Updating θ₀ first and then using the new θ₀ to compute θ₁\'s gradient. The update is simultaneous.', 'Assuming a larger η is always faster. Past a threshold it diverges.', 'Forgetting that the step shrinks automatically as the slope flattens.'],
    connect: CHAIN(['Hill climbing', 'Gradient descent', 'Log loss fitting (Lecture 6)', 'Penalized updates (Lecture 9)'], 1),
    tryq: 'l5-gd-t'
  }),
  revise: {formulas: ['gd-update', 'gd-sq'], when: 'Any smooth loss without a closed form, or when asked for one update step.', formats: ['Compute one or two updates by hand.', 'Classify η as converging, oscillating or diverging.', 'Simultaneous update with two coefficients.'], traps: ['Sign of the update.', 'Sequential instead of simultaneous.', 'η too large.']},
  prereq: ['l5-hill', 'l2-mean'], next: ['l6-sign']
});
