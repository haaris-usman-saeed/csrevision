/* Lesson content for Lectures 6 and 7. */
'use strict';

/* ======================= Lecture 6 ======================= */
LESSON({id: 'l6-sign', lec: 6, title: 'Binary classification with a sign', pages: '15 to 22', keys: 'binary classification sign score spam nonspam training error derivative of sign turing test imitation game',
  quick: {what: 'A linear score z = b + wx classifies by its sign: z ≥ 0 gives one class, z < 0 the other.', why: 'Many targets are yes/no (spam or not, Gentoo or Adélie), not numbers.', idea: 'Training error counts wrong labels, but it is flat almost everywhere, so its derivative is useless for gradient descent.', remember: 'Sign gives a class with no degree of certainty, and you can\'t differentiate it.'},
  learn: LEARN({
    problem: SRC('16', '<p>Linear regression predicts a wait time ŷ = b + wx. For spam we need a class: y = −1 for nonspam and y = +1 for spam.</p>'),
    model: '<p>Keep the same linear score, but only look at which side of zero it falls. The score is like a vote total; the sign is the verdict. A verdict alone hides whether the vote was close.</p>',
    example: SRC('17 to 22', '<p>Prediction ' + M('\\hat{y} = +1') + ' (spam) when ' + M('z \\ge 0') + ', ' + M('\\hat{y} = -1') + ' when ' + M('z < 0') + '. A score of 0.1 and a score of 4 both give ŷ = +1: same class label, no degree of certainty (p. 18). Training error (p. 19):</p>' + MD('R(b, w) = \\frac{\\text{number of wrong labels}}{n},\\qquad \\hat{y}_i = \\mathrm{sign}(b + wx_i)') + '<p>Grid search (b, w ∈ {−1, 0, 1}) or random search (−1 ≤ b, w ≤ 1) can minimize it (p. 20). Gradient descent needs ' + M('\\partial R/\\partial b') + ' and ' + M('\\partial R/\\partial w') + ', but ' + M('f(z) = \\mathrm{sign}(z)') + ' has ' + M('f(z + h) = f(z)') + ' for small h away from 0, so ' + M('f\'(z) = 0') + ', and ' + M('f\'(0)') + ' is undefined (p. 22).</p>') +
      FLAG('<p>Label coding changes within this lecture: the spam example uses y ∈ {−1, +1}; from the penguins onward (p. 34) the labels are y ∈ {0, 1}, with Gentoo = 1. Log loss and the gradient p − y require the 0/1 coding.</p>') +
      SRC('25 to 28', '<p>Aside: Turing\'s 1950 imitation game as classification. Hidden participants are the true labels (human or machine), the text conversation is the input x, and the interrogator is a classifier whose error is a wrong predicted identity.</p>'),
    steps: XTRA('<p>Five messages with scores z and labels y (constructed):</p>', 'Extra worked numbers') + LEDGER([
      ['z = -1.2,\\ 0.3,\\ 2.0,\\ -0.1,\\ 0.8', 'Scores from some b and w.', 'plain'],
      ['\\hat{y} = -1,\\ +1,\\ +1,\\ -1,\\ +1', 'Sign of each score (0.3 and 0.8 are ≥ 0).', 'plain'],
      ['y = -1,\\ -1,\\ +1,\\ +1,\\ +1 \\Rightarrow \\text{wrong at 2 and 4}', 'Compare predicted and true labels.', 'plain'],
      ['R = \\frac{2}{5} = 0.4', 'Nudging b by a tiny amount leaves every sign, and R, unchanged: the slope is 0.']
    ]),
    mistakes: ['Treating a large positive score as "more spam" under the sign rule. The sign rule gives the same label for z = 0.1 and z = 4.', 'Trying gradient descent on 0-1 training error. Its derivative is 0 almost everywhere.', 'Mixing the {−1, +1} and {0, 1} label codings in one formula.'],
    connect: CHAIN(['Linear score z', 'sign(z): class only', 'σ(z): probability', 'Log loss and gradients'], 1),
    tryq: 'l6-sign-t'
  }),
  revise: {formulas: ['sign-rule', 'loss-01'], when: 'Classifying by the sign of a linear score; explaining why we need a smooth alternative.', formats: ['Compute training error for given scores.', 'Why can\'t we differentiate sign?'], traps: ['Label codings.', 'Score magnitude ignored by sign.']},
  prereq: ['l5-gd'], next: ['l6-sigmoid']
});

LESSON({id: 'l6-sigmoid', lec: 6, title: 'Sigmoid probabilities, odds and log odds', pages: '23 to 44', keys: 'sigmoid logistic function probability odds log odds logit penguin adelie gentoo body mass score',
  quick: {what: 'The logistic function p = σ(z) = 1 ÷ (1 + e^(−z)) turns any score into a probability between 0 and 1.', why: 'A probability says how confident the prediction is and can be differentiated.', idea: 'The score is the log odds: z = ln(p ÷ (1 − p)). z = 0 means p = 0.5.', remember: 'Score z is any real number; probability p is strictly between 0 and 1.'},
  learn: LEARN({
    problem: SRC('30 to 36', '<p>An Antarctic ecologist needs species labels to compare feeding across Adélie (winter on pack ice) and Gentoo (nearshore open water) penguins, but some birds are missing labels. Predict species from body mass. Data: 151 Adélie and 123 Gentoo; their masses overlap, so the same mass could be either species. A least-squares line through 0/1 labels can predict values outside [0, 1] (p. 36).</p>'),
    model: '<p>Keep the linear score z, then squash it through an S-shaped curve. Very negative scores map near 0, very positive near 1, and 0 maps to exactly 0.5. The curve is smooth, so small changes in b and w give small changes in p.</p>',
    example: SRC('24', MD('p = \\sigma(z) = \\frac{1}{1 + e^{-z}}') + TABLE(['z', 'e^(−z)', 'p'], [['−1', 'e ≈ 2.718', '0.269'], ['0', '1', '0.5'], ['1', '1/e ≈ 0.368', '0.731']]) + '<p>Since ' + M('e^{-z} > 0') + ', we always get ' + M('0 < p < 1') + '.</p>') +
      SRC('34, 37, 39 to 41', '<p>Feature ' + M('x_i = \\frac{\\text{Mass}_i - 4000}{1000}') + ' (so 3000 g → −1, 4000 g → 0, 5000 g → 1); label ' + M('y_i \\in \\{0, 1\\}') + ' with Gentoo = 1. The model: x → score ' + M('z = b + wx \\in \\mathbb{R}') + ' → Gentoo probability ' + M('p = P(Y = 1 \\mid x)') + '. With b = −0.2 and w = 1.4, a new 4500 g penguin has p ≈ 0.622 Gentoo and 1 − p ≈ 0.378 Adélie, odds ≈ 1.65.</p>'),
    steps: LEDGER([
      ['x = \\frac{4500 - 4000}{1000} = 0.5', 'Center at 4000 g, measure in units of 1000 g.', 'plain'],
      ['z = -0.2 + 1.4(0.5) = -0.2 + 0.7 = 0.5', 'Linear score. Any real number is allowed.', 'plain'],
      ['e^{-0.5} \\approx 0.6065,\\quad 1 + 0.6065 = 1.6065', 'Denominator of the sigmoid.', 'plain'],
      ['p = \\frac{1}{1.6065} \\approx 0.622', 'Gentoo probability. Adélie gets 1 − 0.622 = 0.378.', 'plain'],
      ['\\text{odds} = \\frac{p}{1 - p} = \\frac{0.622}{0.378} \\approx 1.65', 'Gentoo is about 1.65 times as likely as Adélie.', 'plain'],
      ['\\ln(1.65) \\approx 0.5 = z', 'The score is the log odds.']
    ]) + SRC('42 to 43', '<p>Why the score equals the log odds: ' + M('1 - p = \\frac{e^{-z}}{1 + e^{-z}}') + ', so ' + M('\\frac{p}{1-p} = \\frac{1}{e^{-z}} = e^{z}') + ' and ' + M('\\mathrm{logit}(p) = \\ln\\frac{p}{1-p} = z = b + wx') + '.</p>' + TABLE(['Score z', 'Odds', 'Gentoo p', 'Higher probability'], [['−0.5', '0.61', '0.378', 'Adélie'], ['0', '1', '0.5', 'Equal'], ['0.5', '1.65', '0.622', 'Gentoo']])),
    lab: 'logistic',
    labIntro: '<p>The default sliders reproduce the lecture example. Move w and watch the curve steepen; move the threshold and notice that p does not change.</p>',
    mistakes: ['Reporting the score z as a probability. z = 0.5 is not 50%; it gives p ≈ 0.622.', 'Confusing odds with probability. Odds 1.65 is not a probability (it exceeds 1).', 'Forgetting to standardize the mass: plugging 4500 into z = b + wx gives nonsense.', 'Thinking doubling z doubles p (Lecture 7 recap, p. 2: false).'],
    connect: CHAIN(['Score z = b + wx', 'p = σ(z)', 'Log loss', 'Gradient descent'], 1) + '<p>The same σ is used for each genre in Lecture 9 (one-vs-rest) and for multilabel prediction in Lecture 7.</p>',
    worked: '<p>A 3500 g penguin: x = −0.5, z = −0.2 + 1.4(−0.5) = −0.9, e^{0.9} ≈ 2.460, p = 1 ÷ 3.460 ≈ 0.289. Adélie is more likely (0.711).</p>',
    tryq: 'l6-sigmoid-t'
  }),
  revise: {formulas: ['sigmoid', 'odds', 'logit'], when: 'Turning a linear score into a class probability; interpreting a score.', formats: ['Compute z, p, odds for given b, w, x.', 'Convert between p and log odds.', 'Which species is more likely?'], traps: ['z versus p.', 'Unstandardized feature.', 'Odds versus probability.']},
  prereq: ['l6-sign'], next: ['l6-logloss']
});

LESSON({id: 'l6-logloss', lec: 6, title: 'Log loss', pages: '45 to 49', keys: 'log loss cross entropy negative log likelihood joint probability recorded species confidence',
  quick: {what: 'Log loss charges −ln of the probability the model gave to the label that actually happened.', why: 'We need a smooth way to score probabilities against recorded labels so we can fit b and w.', idea: 'Multiply the probabilities of all recorded labels, take −ln to turn the product into a sum, and average.', remember: 'y = 1 uses −ln p; y = 0 uses −ln(1 − p). Confident and wrong is very expensive.'},
  learn: LEARN({
    problem: '<p>The model says p = 0.622 Gentoo for a 4500 g penguin. If the bird turns out to be Adélie, how bad was that prediction, as a number?</p>',
    model: '<p>A good model gives high probability to what actually happened. So score the model by the probability it assigned to the truth. Log turns "multiply over all penguins" into "add over penguins", and the minus sign turns "high probability is good" into "low loss is good".</p>',
    example: SRC('45 to 46', '<p>Probability of the recorded species: Gentoo ' + M('y_i = 1 \\to p_i') + ', Adélie ' + M('y_i = 0 \\to 1 - p_i') + '. Joint probability over all training penguins: ' + M('\\prod_{i=1}^{n} p_i^{y_i}(1 - p_i)^{1 - y_i}') + '. Then:</p>' + MD('L = \\frac{1}{n}\\sum_{i=1}^{n}\\ell_i = -\\frac{1}{n}\\sum_{i=1}^{n}\\left[y_i\\ln p_i + (1 - y_i)\\ln(1 - p_i)\\right]') + '<p>The exponents act as a switch: when y = 1 only the ln p term survives, when y = 0 only ln(1 − p) survives.</p>') +
      SRC('47 to 48', '<p>Loss rises steeply as confidence in the incorrect class grows (p. 47). Same 4500 g prediction, p ≈ 0.622: if recorded Gentoo, ' + M('\\ell = -\\ln p \\approx 0.474') + '; if recorded Adélie, ' + M('\\ell = -\\ln(1 - p) \\approx 0.974') + '.</p>'),
    steps: LEDGER([
      ['y = 1:\\ \\ell = -\\ln(0.622)', 'The model gave the truth probability 0.622.', 'plain'],
      ['\\ln(0.622) \\approx -0.474 \\Rightarrow \\ell \\approx 0.474', 'Natural log of a number below 1 is negative; the minus sign makes the loss positive.', 'plain'],
      ['y = 0:\\ \\ell = -\\ln(1 - 0.622) = -\\ln(0.378) \\approx 0.974', 'Now the truth only got 0.378, so the loss is about twice as large.']
    ]),
    lab: 'logistic',
    labIntro: '<p>Switch the recorded species and watch the dot jump between the two loss curves. Push w high with y = 0 to see how harshly confident mistakes are punished.</p>',
    mistakes: ['Using −ln p when y = 0. It must be −ln(1 − p).', 'Using log base 10. The lecture\'s numbers use the natural log.', 'Thinking a correct class prediction has zero loss. p = 0.622 for a Gentoo still costs 0.474; only p = 1 gives 0.', 'Thinking logistic regression is fit with squared error (Lecture 7 recap, p. 2: false).'],
    connect: CHAIN(['p = σ(z)', 'Log loss L(b, w)', 'Gradient p − y', 'Binary log loss per genre (Lecture 9)'], 1),
    worked: '<p>Two penguins: Gentoo with p = 0.9 and Adélie with p = 0.2. Losses −ln 0.9 ≈ 0.105 and −ln 0.8 ≈ 0.223. Average L = (0.105 + 0.223) ÷ 2 ≈ 0.164.</p>',
    tryq: 'l6-logloss-t'
  }),
  revise: {formulas: ['logloss'], when: 'Scoring predicted probabilities against 0/1 labels; the training objective of logistic regression.', formats: ['Compute ℓ for one case.', 'Average log loss over a few cases.', 'Why −ln of a product?'], traps: ['Wrong branch for y = 0.', 'Log base.', 'Correct does not mean zero loss.']},
  prereq: ['l6-sigmoid'], next: ['l6-gradient']
});

LESSON({id: 'l6-gradient', lec: 6, title: 'Gradients and one update', pages: '50 to 57', keys: 'gradient logistic regression p minus y chain rule derivative sigmoid simultaneous update learning rate',
  quick: {what: 'For log loss, the derivative with respect to the score is simply p − y; for w multiply by x.', why: 'There is no direct formula for the best b and w, so we need gradients for gradient descent.', idea: 'Chain rule: dℓ/dz = p − y, ∂z/∂b = 1, ∂z/∂w = x. Average over the data, then update b and w together.', remember: 'g_b = mean(p − y), g_w = mean((p − y)x), then b ← b − ηg_b and w ← w − ηg_w.'},
  learn: LEARN({
    problem: SRC('50', '<p>Minimize L(b, w) over the training penguins. No direct formula gives the best b and w, so use gradient descent, which needs ' + M('\\partial L/\\partial b') + ' and ' + M('\\partial L/\\partial w') + '.</p>'),
    model: '<p>p − y is the probability error: how far the predicted probability is from the recorded label. If the model says 0.8 for a Gentoo (y = 1), the error is −0.2, so the update pushes the score up. If it says 0.8 for an Adélie, the error is +0.8, and the update pushes the score down hard.</p>',
    example: SRC('51 to 53', LEDGER([
      ['\\frac{dp}{dz} = \\frac{e^{-z}}{(1 + e^{-z})^2} = p(1 - p)', 'Differentiate σ, then recognize p and 1 − p in the result.', 'plain'],
      ['y = 1:\\ \\frac{d\\ell}{dz} = -\\frac{1}{p}\\,p(1 - p) = p - 1', 'From ℓ = −ln p.', 'plain'],
      ['y = 0:\\ \\frac{d\\ell}{dz} = \\frac{1}{1 - p}\\,p(1 - p) = p', 'From ℓ = −ln(1 − p).', 'plain'],
      ['\\text{both labels: } \\frac{d\\ell}{dz} = p - y', 'One formula covers both cases because y is 0 or 1.', 'plain'],
      ['\\frac{\\partial \\ell}{\\partial b} = (p - y)\\times 1,\\quad \\frac{\\partial \\ell}{\\partial w} = (p - y)\\times x', 'Since z = b + wx: ∂z/∂b = 1 and ∂z/∂w = x. Example: p = 0.8, y = 1, x = 0.5 gives −0.2 and −0.1.']
    ])) + SRC('54 to 55', MD('g_b = \\frac{1}{n}\\sum_{i=1}^{n}(p_i - y_i),\\qquad g_w = \\frac{1}{n}\\sum_{i=1}^{n}(p_i - y_i)x_i') + '<p>Simultaneous update with the same current gradients: ' + M('b_{\\text{new}} = b - \\eta g_b') + ', ' + M('w_{\\text{new}} = w - \\eta g_w') + ', then new predictions ' + M('p_{\\text{new}} = \\sigma(b_{\\text{new}} + w_{\\text{new}}x)') + '.</p>'),
    steps: SRC('56', '<p>Start at b = w = 0, so every p_i = σ(0) = 0.5, with η = 0.3:</p>') + LEDGER([
      ['x = (-1,\\ 0,\\ 1),\\quad y = (0,\\ 0,\\ 1)', 'Three training rows.', 'plain'],
      ['p - y = 0.5 - 0,\\ 0.5 - 0,\\ 0.5 - 1 = 0.5,\\ 0.5,\\ -0.5', 'Probability errors.', 'plain'],
      ['(p - y)x = 0.5(-1),\\ 0.5(0),\\ -0.5(1) = -0.5,\\ 0,\\ -0.5', 'Multiply each error by its x.', 'plain'],
      ['g_b = \\frac{0.5 + 0.5 - 0.5}{3} = \\frac{1}{6},\\quad g_w = \\frac{-0.5 + 0 - 0.5}{3} = -\\frac{1}{3}', 'Means over n = 3.', 'plain'],
      ['b_{\\text{new}} = 0 - 0.3\\left(\\tfrac{1}{6}\\right) = -0.05,\\quad w_{\\text{new}} = 0 - 0.3\\left(-\\tfrac{1}{3}\\right) = 0.1', 'Positive g_b lowers b; negative g_w raises w.']
    ]),
    lab: 'lgstep',
    labIntro: '<p>The default reproduces the lecture table. Apply an update and watch the average log loss fall; change η to 2 and see it overshoot.</p>',
    mistakes: ['Writing y − p instead of p − y, which flips the update direction.', 'Forgetting to multiply by x for g_w (or multiplying g_b by x).', 'Summing instead of averaging (changes the effective learning rate).', 'Updating b first and using the new b to compute g_w.'],
    connect: CHAIN(['Log loss', 'dℓ/dz = p − y', 'Average gradients', 'Many features: g_j = mean((p − y)x_j) (Lecture 7)'], 2),
    tryq: 'l6-gradient-t'
  }),
  revise: {formulas: ['logit-grad', 'grad-avg', 'gd-update'], when: 'Any request for one gradient-descent step on logistic regression.', formats: ['Fill in the p − y and (p − y)x table.', 'Compute b_new and w_new.', 'Derive dℓ/dz = p − y.'], traps: ['Sign of p − y.', 'Missing x in g_w.', 'Sequential update.']},
  prereq: ['l6-logloss'], next: ['l6-eval']
});

LESSON({id: 'l6-eval', lec: 6, title: 'Fitting penguins and checking errors', pages: '58 to 65', keys: 'training test split fit 1000 updates error rate accuracy confusion matrix true positive false positive precision recall penguin',
  quick: {what: 'Fit on training penguins, then count right and wrong predictions on held-out test penguins.', why: 'Training loss shows fit; only new data shows how predictions will do.', idea: 'Predict Gentoo when p ≥ 0.5, then sort test results into TP, FP, FN, TN.', remember: 'Precision divides by predicted positives; recall divides by actual positives.'},
  learn: LEARN({
    problem: '<p>After fitting, how good is the classifier on penguins it has never seen?</p>',
    model: '<p>Split the data like a practice exam and a real exam. Study (fit) on the practice set; the real exam (test set) is graded once with coefficients frozen.</p>',
    example: SRC('58 to 61', '<p>191 training penguins and 83 test penguins. Start at b = w = 0, run 1000 updates with η = 0.08. Training log loss falls quickly then levels off (to about 0.208, p. 59); smaller loss means better training fit. Fitted ' + M('b \\approx -1.639') + ', ' + M('w \\approx 4.002') + '. There is no general formula for the best log-loss coefficients; computable gradients give iterative updates.</p>') +
      SRC('62 to 64', '<p>Predict Gentoo (y = 1) when p ≥ 0.5. On the 83 test penguins: error rate 7 ÷ 83 ≈ 8.4%, accuracy 76 ÷ 83 ≈ 91.6%.</p>' + TABLE(['', 'Recorded Gentoo', 'Recorded Adélie'], [['Predicted Gentoo', 'TP = 32', 'FP = 2'], ['Predicted Adélie', 'FN = 5', 'TN = 44']]) + '<p>Correct = TP + TN = 76; wrong = FP + FN = 7. Precision (among predicted Gentoo) = 32 ÷ (32 + 2) ≈ 94.1%. Recall (among recorded Gentoo) = 32 ÷ (32 + 5) ≈ 86.5%.</p>') +
      SRC('66 to 68', '<p>The lecture closes with a 2026 version of the imitation game: writing → features → authorship scores for human versus AI-generated text, including errors within mixed writing and a false negative rate for each model family.</p>'),
    steps: LEDGER([
      ['\\text{boundary: } p = 0.5 \\iff z = 0 \\iff x = \\frac{1.639}{4.002} \\approx 0.41', 'Extra: where the fitted model switches species.', 'plain'],
      ['\\text{mass} = 4000 + 1000(0.41) \\approx 4410\\ \\text{g}', 'Undo the standardization. Heavier birds are predicted Gentoo.', 'plain'],
      ['\\text{precision} = \\frac{32}{34} \\approx 0.941,\\quad \\text{recall} = \\frac{32}{37} \\approx 0.865', 'Denominators: predicted Gentoo column (34) versus recorded Gentoo row (37).']
    ]),
    lab: 'confusion',
    labIntro: '<p>Choose "Penguin test" in the explorer. Click Adélie to make it the positive class and watch precision and recall swap roles.</p>',
    mistakes: ['Computing precision with TP + FN (that is recall).', 'Evaluating on the training penguins and calling it test accuracy.', 'Thinking a different threshold changes the fitted b and w (Lecture 7 recap, p. 2: false). It changes only which side a probability falls on.'],
    connect: CHAIN(['Fit on training', 'Freeze coefficients', 'Test confusion matrix', 'Precision, recall, F1 for genres (Lecture 9)'], 2),
    tryq: 'l6-eval-t'
  }),
  revise: {formulas: ['accuracy', 'precision', 'recall'], when: 'Evaluating a fitted binary classifier on held-out data.', formats: ['Fill in TP, FP, FN, TN from a description.', 'Compute accuracy, precision, recall.', 'Where is the 1D decision boundary?'], traps: ['Precision versus recall denominators.', 'Train versus test.']},
  prereq: ['l6-gradient'], next: ['l7-multi']
});

/* ======================= Lecture 7 ======================= */
LESSON({id: 'l7-multi', lec: 7, title: 'Several features in one weighted sum', pages: '9 to 18, 24, 38 to 42', keys: 'multiple regression flipper length bill length body mass plane coefficient interpretation holding fixed rmse',
  quick: {what: 'With several features, the prediction is an intercept plus one coefficient times each feature.', why: 'One feature leaves errors that another feature can explain (bill length explains part of what flipper length misses).', idea: 'Each coefficient is the change in prediction for a one-unit change in its feature with the other features held fixed.', remember: 'ŷ = θ₀ + θ₁x₁ + θ₂x₂; the predictions form a plane.'},
  learn: LEARN({
    problem: SRC('12 to 15', '<p>Predict penguin body mass from flipper length (and later bill length). Example rows:</p>' + TABLE(['Penguin row', 'Flipper x₁ (mm)', 'Bill x₂ (mm)', 'Mass y (g)'], [['1', '181', '39.1', '3750'], ['2', '186', '39.5', '3800'], ['3', '195', '40.3', '3250'], ['6', '190', '39.3', '3650']]) + '<p>From flipper alone: ' + M('\\hat{y} \\approx -5591 + 49.06x_1') + ', so 181 mm gives about 3289 g. The prediction errors vary with bill length, and penguins with similar masses have different bill lengths: another feature carries information.</p>'),
    model: '<p>Each feature gets its own dial (coefficient) and contributes coefficient × value grams. Add the contributions and the intercept. Moving one feature while freezing the others moves the prediction by exactly that feature\'s coefficient per unit.</p>',
    example: SRC('16 to 18, 40 to 42', MD('\\hat{y}_i = \\theta_0 + \\theta_1 x_{i1} + \\theta_2 x_{i2},\\qquad \\hat{y} \\approx -4215.86 + 26.37x_1 + 75.27x_2\\ \\text{g}') + '<p>θ₁ is in grams per mm of flipper, θ₂ in grams per mm of bill. Holding bill fixed at 39.1 mm, going from 181 to 182 mm flipper raises the prediction from 3500 g to 3526 g (Δŷ = 26.37 g). Bill +1 mm with flipper fixed gives +75.27 g. Training (191 penguins): MSE 117198 g², RMSE 342 g. Test (83 penguins): MSE 126250 g², RMSE 355 g.</p>'),
    steps: '<p>Penguin row 1 (p. 17):</p>' + LEDGER([
      ['\\theta_0 = -4215.86\\ \\text{g}', 'Intercept: adds the same mass everywhere.', 'plain'],
      ['\\theta_1 x_1 = 26.37 \\times 181 \\approx 4773\\ \\text{g}', 'Flipper contribution.', 'plain'],
      ['\\theta_2 x_2 = 75.27 \\times 39.1 \\approx 2943\\ \\text{g}', 'Bill contribution.', 'plain'],
      ['\\hat{y} \\approx -4216 + 4773 + 2943 = 3500\\ \\text{g}', 'Sum of intercept and contributions.', 'plain'],
      ['r = \\hat{y} - y = 3500 - 3750 \\approx -250\\ \\text{g}', 'Lecture 7 defines the residual as prediction minus recorded, the opposite sign from Lecture 4.']
    ]),
    more: SEC('RMSE in plain words', XTRA('<p>RMSE is the square root of MSE, back in grams: √117198 ≈ 342 g. "Typical miss is about 342 g" on training and 355 g on test. Test error is a little higher, as expected for unseen penguins.</p>')),
    mistakes: ['Reading 75.27 as "bill length matters more than flipper" without considering units and typical ranges.', 'Interpreting a coefficient without "holding the other features fixed".', 'Using e = y − ŷ here: Lecture 7 writes r = ŷ − y, so the residual of row 1 is −250 g.', 'Comparing training MSE with test MSE and calling the gap overfitting without context.'],
    connect: CHAIN(['One feature (Lecture 4)', 'Weighted sum of d features', 'Same score for classification', 'Thousands of word features (Lecture 9)'], 1),
    tryq: 'l7-multi-t'
  }),
  revise: {formulas: ['weighted-sum'], when: 'Predicting with a multi-feature linear model; interpreting a coefficient.', formats: ['Compute ŷ for a row.', 'Change in ŷ when one feature changes.', 'Residual with the Lecture 7 sign.'], traps: ['Residual sign convention.', 'Holding others fixed.']},
  prereq: ['l4-matrix'], next: ['l7-boundary', 'l7-general']
});

LESSON({id: 'l7-boundary', lec: 7, title: 'Decision boundaries', pages: '19 to 30, 43 to 45', keys: 'decision boundary two features logistic normal vector hyperplane intercept parallel penguin bill mass',
  quick: {what: 'The decision boundary is where z = 0, which is where p = 0.5.', why: 'It shows in feature space exactly which inputs get which class.', idea: 'In 2D, b + w₁x₁ + w₂x₂ = 0 is a line. The coefficient vector w is perpendicular to it and points toward z > 0.', remember: 'Change b: the boundary slides parallel. Change w: it rotates.'},
  learn: LEARN({
    problem: '<p>With mass and bill length as features, where does the model switch from Adélie to Gentoo?</p>',
    model: '<p>The score z is a tilted plane over the feature plane. The boundary is where that plane crosses height zero, a straight contour line. Walking along the contour keeps z constant; walking in the direction of w climbs fastest.</p>',
    example: SRC('19 to 22', '<p>Features ' + M('x_1 = (\\text{Mass} - 4000)/1000') + ', ' + M('x_2 = (\\text{Bill} - 40)/10') + ' (units of 1000 g and 10 mm), Gentoo = 1. Illustrative coefficients b = −0.2, w₁ = 1.4, w₂ = 1. A Gentoo with mass 4500 g and bill 46.1 mm: x₁ = 0.5, x₂ = 0.61, mass contribution 1.4(0.5) = 0.7, bill contribution 1(0.61) = 0.61, z = −0.2 + 0.7 + 0.61 = 1.11, p ≈ 0.752, log loss −ln(0.752) ≈ 0.285, probability error p − y ≈ −0.248.</p>') +
      SRC('26 to 30', MD('p = 0.5 \\iff z = 0 \\iff b + w_1x_1 + w_2x_2 = 0 \\iff x_2 = -\\frac{b}{w_2} - \\frac{w_1}{w_2}x_1') + '<p>For the penguin coefficients, ' + M('x_2 = 0.2 - 1.4x_1') + '. In 1D, ' + M('z = x - 2') + ' has boundary x = 2. In 2D, ' + M('z = x_1 + 2x_2 - 2') + ' gives ' + M('x_2 = 1 - \\tfrac{1}{2}x_1') + '. With ' + M('\\mathbf{w} = (1, 2)') + ': moving along the boundary by (2, −1) changes z by 1(2) + 2(−1) = 0; moving along the normal (1, 2) changes z by 1 + 4 = 5. Changing the intercept (b = −2 versus b = −4) gives a parallel boundary. In d dimensions, ' + M('b + \\sum_{j=1}^{d} w_j x_j = 0') + ' is a hyperplane, a flat boundary with one fewer dimension than the feature space.</p>') +
      SRC('43 to 45', '<p>Fitted on 191 training penguins (1000 updates, η = 0.08): b ≈ −1.998, w₁ ≈ 3.040, w₂ ≈ 2.775, training log loss 0.147.</p>' + TABLE(['Inputs', 'Training log loss', 'Test log loss', 'Correct predictions'], [['Mass', '0.208', '0.195', '76/83'], ['Mass and bill', '0.147', '0.151', '79/83']]) + '<p>Predict Gentoo when p ≥ 0.5. Adding bill length helps on new penguins too.</p>'),
    steps: LEDGER([
      ['x_1 = 0.1 \\Rightarrow x_2 = 0.2 - 1.4(0.1) = 0.06', 'A point on the illustrative boundary.', 'plain'],
      ['\\text{mass} = 4000 + 1000(0.1) = 4100\\ \\text{g},\\ \\text{bill} = 40 + 10(0.06) = 40.6\\ \\text{mm}', 'Back to real units: a 4100 g penguin with a 40.6 mm bill gets p = 0.5.']
    ]),
    lab: 'boundary',
    labIntro: '<p>Load each preset. Slide b and watch the line move without turning; change w₁ or w₂ and watch it rotate with the arrow staying perpendicular.</p>',
    mistakes: ['Saying w is parallel to the boundary (Lecture 8 recap, p. 3: false). It is perpendicular (normal).', 'Thinking multiplying b and every w by 2 moves the boundary (recap: false). z doubles, but its sign, and the boundary, stay put.', 'Forgetting to standardize inputs before plugging them into the boundary equation.'],
    connect: CHAIN(['1D threshold x = −b/w', '2D boundary line', 'Hyperplane in d dimensions', 'Curved boundaries via polynomial features'], 1),
    tryq: 'l7-boundary-t'
  }),
  revise: {formulas: ['boundary', 'weighted-sum', 'sigmoid'], when: 'Finding where p = 0.5; reasoning about how coefficients move the boundary.', formats: ['Solve for x₂ on the boundary.', 'Which side of the boundary is a point on?', 'Effect of changing b or scaling all coefficients.'], traps: ['Normal versus parallel.', 'Scaling all coefficients.']},
  prereq: ['l7-multi', 'l6-sigmoid'], next: ['l7-general']
});

LESSON({id: 'l7-general', lec: 7, title: 'Gradients for any number of features', pages: '32 to 37, 72', keys: 'weighted sum d features gradient regression classification intercept input x0 update rule',
  quick: {what: 'One score z = θ₀ + Σθ_j x_j serves both regression (ŷ = z) and classification (p = σ(z)).', why: 'Fitting d + 1 coefficients needs one gradient formula per coefficient, ideally the same pattern for all.', idea: 'Gradient for θ_j = average of (prediction error) × x_ij, where x_i0 = 1 for the intercept.', remember: 'Regression: g_j = (2/n)Σr_i x_ij. Classification: g_j = (1/n)Σ(p_i − y_i)x_ij.'},
  learn: LEARN({
    problem: '<p>Two features, ten features, ten thousand features: we need a fitting rule that does not change form as d grows.</p>',
    model: '<p>Every coefficient asks the same question: "when my feature was large, was the prediction too high or too low?" Multiply each row\'s error by that row\'s feature value and average. Positive means the coefficient is pushing predictions too high, so decrease it.</p>',
    example: SRC('32 to 37', MD('z_i = \\theta_0 + \\sum_{j=1}^{d}\\theta_j x_{ij},\\qquad \\text{regression } \\hat{y}_i = z_i,\\qquad \\text{classification } p_i = \\frac{1}{1 + e^{-z_i}}') + '<p>There are d + 1 coefficients: intercept θ₀ and feature weights θ₁ to θ_d. Regression loss uses the residual ' + M('r_i = \\hat{y}_i - y_i') + ' and ' + M('R = \\frac{1}{n}\\sum_i r_i^2') + '.</p>' + MD('\\frac{\\partial (r_i^2)}{\\partial \\theta_j} = 2r_i x_{ij} \\Rightarrow g_j = \\frac{2}{n}\\sum_{i=1}^{n} r_i x_{ij};\\qquad \\frac{\\partial \\ell_i}{\\partial \\theta_j} = (p_i - y_i)x_{ij} \\Rightarrow g_j = \\frac{1}{n}\\sum_{i=1}^{n}(p_i - y_i)x_{ij}') + '<p>Intercept input ' + M('x_{i0} = 1') + '. Update ' + M('\\theta_j^{\\text{new}} = \\theta_j - \\eta g_j') + ' for j = 0, …, d: g_j > 0 lowers θ_j, g_j < 0 raises it, g_j = 0 leaves it.</p>'),
    steps: XTRA('<p>Consistency check with Lecture 5 (computed here). Café data at θ = (0, 0): ŷ = 0, so r = ŷ − y = −3, −4, −8, −9.</p>', 'Extra worked numbers') + LEDGER([
      ['g_0 = \\frac{2}{4}\\sum r_i(1) = \\frac{2}{4}(-24) = -12', 'Same −12 as Lecture 5\'s −(2/n)Σe_i, because r = −e.', 'plain'],
      ['g_1 = \\frac{2}{4}\\sum r_i x_i = \\frac{2}{4}(-3 - 8 - 24 - 36) = -35.5', 'Same −35.5. The sign convention changed but the gradient did not.']
    ]),
    mistakes: ['Dropping the factor 2 for squared error (or adding it for log loss).', 'Forgetting x_i0 = 1, so the intercept gradient is computed wrong or skipped.', 'Mixing r = ŷ − y with e = y − ŷ and getting the gradient sign wrong.'],
    connect: CHAIN(['Lecture 5 gradients', 'One rule for d features', 'Penalty adds 2λθ_j (Lecture 9)'], 1),
    tryq: 'l7-general-t'
  }),
  revise: {formulas: ['grad-general', 'weighted-sum', 'gd-update'], when: 'One gradient step for any linear model, regression or classification.', formats: ['Compute g_j for a tiny dataset.', 'Which coefficients increase after the update?'], traps: ['Factor of 2.', 'Residual sign.', 'Intercept input.']},
  prereq: ['l7-multi', 'l6-gradient'], next: ['l7-multiclass']
});

LESSON({id: 'l7-multiclass', lec: 7, title: 'Multiclass and multilabel prediction', pages: '46 to 47', keys: 'softmax multiclass multilabel separate sigmoid chinstrap probabilities sum to one',
  quick: {what: 'Multiclass picks one of K classes using softmax; multilabel decides each label separately with its own sigmoid.', why: 'A penguin is exactly one species, but a photo can contain a penguin and ice at once.', idea: 'Softmax divides each e^(z_k) by their total, so probabilities sum to 1. Separate sigmoids need not sum to 1.', remember: 'One answer: softmax and take the largest. Many answers: sigmoid per label and threshold at 0.5.'},
  learn: LEARN({
    problem: '<p>Three penguin species, or several labels per image. How do scores become predictions?</p>',
    model: '<p>Softmax is a vote share: exponentiate each class score so everything is positive, then divide by the total so the shares add up to 1. Multilabel is a set of independent yes/no questions.</p>',
    example: SRC('46', MD('z_k = b_k + \\sum_j w_{kj}x_j,\\qquad p_k = \\frac{e^{z_k}}{\\sum_c e^{z_c}}') + TABLE(['Species', 'e^(z_k)', 'p_k'], [['Adélie', '1', '1/10 = 0.1'], ['Chinstrap', '2', '2/10 = 0.2'], ['Gentoo', '7', '7/10 = 0.7']]) + '<p>Largest probability → Gentoo.</p>') +
      SRC('47', TABLE(['Label', 'Probability'], [['Penguin', 'σ(z_penguin) = 0.98'], ['Ice', 'σ(z_ice) = 0.85'], ['Boat', 'σ(z_boat) = 0.03']]) + '<p>Probability ≥ 0.5 → Penguin + Ice. Labels can overlap; probabilities need not sum to 1 (here 1.86).</p>'),
    steps: LEDGER([
      ['\\sum_c e^{z_c} = 1 + 2 + 7 = 10', 'Denominator: total of the exponentiated scores.', 'plain'],
      ['p_{\\text{Gentoo}} = \\frac{7}{10} = 0.7', 'Numerator: Gentoo\'s own exponentiated score.']
    ]),
    mistakes: ['Applying softmax directly to scores without exponentiating.', 'Expecting multilabel probabilities to sum to 1.', 'Picking every class above 0.5 in a multiclass problem.'],
    connect: CHAIN(['Binary sigmoid', 'Softmax (one of K)', 'Separate sigmoids (any subset)', 'One-vs-rest genres (Lecture 9)'], 1) + '<p>Lecture 9\'s genre model uses one binary logistic classifier per genre and then predicts the genre with the largest score.</p>',
    tryq: 'l7-multiclass-t'
  }),
  revise: {formulas: ['softmax', 'sigmoid'], when: 'More than two classes, or overlapping labels.', formats: ['Compute softmax probabilities.', 'Multiclass or multilabel for a scenario?'], traps: ['Sum to 1 confusion.', 'Missing exponent.']},
  prereq: ['l7-general'], next: ['l7-scaling']
});

LESSON({id: 'l7-scaling', lec: 7, title: 'Units and standardization', pages: '48 to 52', keys: 'units millimeters centimeters coefficient scaling standardize z-score training mean standard deviation test data',
  quick: {what: 'Changing a feature\'s units rescales its coefficient; standardizing puts every feature in "standard deviations from the training mean".', why: 'Coefficient steps (in gradient descent or penalties) have very different effects depending on a feature\'s scale.', idea: 'u = (x − μ) ÷ s using the training mean μ and training standard deviation s.', remember: 'Standardize test and new inputs with the training μ and s, never their own.'},
  learn: LEARN({
    problem: '<p>Flipper length in mm or cm gives the same prediction but different coefficients. Why does that matter, and how do we put features on equal footing?</p>',
    model: '<p>A coefficient is "grams per unit". Make the unit 10 times bigger (cm instead of mm) and the coefficient must be 10 times bigger to give the same grams. But a fixed step in the coefficient then has 10 times smaller effect on the prediction, so learning rates and penalties treat the two versions differently.</p>',
    example: SRC('48 to 49', TABLE(['Unit', 'Input value', 'Weight', 'Contribution (g)'], [['Millimeters', '181', '26.37 g per mm', '26.37(181) ≈ 4773'], ['Centimeters', '18.1', '263.7 g per cm', '263.7(18.1) ≈ 4773']]) + '<p>' + M('x_{\\text{cm}} = x_{\\text{mm}}/10 \\iff \\theta_{\\text{cm}} = 10\\,\\theta_{\\text{mm}}') + '. A coefficient step of +1 g/mm changes the prediction by 181 g; +1 g/cm changes it by 18.1 g, since ' + M('\\Delta\\hat{y} = x\\,\\Delta\\theta') + '. Input scale changes the effect of coefficient steps.</p>') +
      SRC('50 to 51', MD('\\mu_j = \\frac{1}{n}\\sum_i x_{ij},\\quad s_j = \\sqrt{\\frac{1}{n}\\sum_i (x_{ij} - \\mu_j)^2},\\quad u_{ij} = \\frac{x_{ij} - \\mu_j}{s_j}') + '<p>New flipper x = 193 mm, training mean 202.15 mm, training SD 15.23 mm: u = (193 − 202.15) ÷ 15.23 ≈ −0.60, so 0.60 standard deviations below the training mean. Reuse the training mean and standard deviation.</p>') +
      FLAG('<p>Lecture 7 computes s_j with 1/n, while Lecture 3\'s sample standard deviation uses 1/(n − 1). Use whichever the question specifies; for standardization in this course, the lecture uses 1/n.</p>'),
    steps: LEDGER([
      ['x - \\mu = 193 - 202.15 = -9.15\\ \\text{mm}', 'How far below the training mean.', 'plain'],
      ['u = \\frac{-9.15}{15.23} \\approx -0.60', 'Measured in training standard deviations. Unitless.']
    ]),
    lab: 'scaling',
    mistakes: ['Standardizing test data with the test set\'s own mean and SD (Lecture 8 recap, p. 3: false).', 'Thinking a larger coefficient means a more important feature regardless of units.', 'Using n − 1 when the lecture\'s standardization uses n (small difference, but match the question).'],
    connect: CHAIN(['Units', 'Coefficient scale', 'Standardized features', 'Fair penalties in regularization (Lecture 9)'], 2),
    tryq: 'l7-scaling-t'
  }),
  revise: {formulas: ['standardize'], when: 'Preparing features for gradient descent or penalties; converting units.', formats: ['Compute a standardized value.', 'Rescale a coefficient after a unit change.', 'Which statistics standardize test data?'], traps: ['Test statistics leakage.', 'n versus n − 1.']},
  prereq: ['l7-multi', 'l3-sd'], next: ['l7-poly']
});

LESSON({id: 'l7-poly', lec: 7, title: 'Polynomial features and bias versus variance', pages: '53 to 60', keys: 'polynomial features degree squared interaction term curved boundary bias variance overfitting ball height',
  quick: {what: 'Adding powers and products of inputs (t², x₁x₂) lets a linear model fit curves and curved boundaries.', why: 'A straight line misses the rise and fall of a thrown ball.', idea: 'The model stays linear in its coefficients; only the features are curved. More flexibility lowers bias but raises variance.', remember: 'Too simple misses the pattern; too flexible fits the noise.'},
  learn: LEARN({
    problem: SRC('53 to 54', '<p>Predict ball height h (m) from elapsed time t (s). A straight line misses the rise and fall. Add squared time: ' + M('t \\to (t, t^2)') + ' and ' + M('\\hat{h} = b + w_1 t + w_2 t^2') + '.</p>'),
    model: '<p>Treat t² as just another column in the table. The model still adds coefficient × column; it has no idea that one column happens to be the square of another. Curves come from the features, not from a new kind of model.</p>',
    example: SRC('55 to 58', '<p>Degree d: ' + M('z = b + \\sum_{j=1}^{d} w_j x^j') + ', with ŷ = z for regression or p = σ(z) for classification. With two inputs x₁, x₂: degree 1 uses x₁, x₂; degree 2 adds ' + M('x_1^2,\\ x_1x_2,\\ x_2^2') + '; degree 3 adds ' + M('x_1^3,\\ x_1^2x_2,\\ x_1x_2^2,\\ x_2^3') + '. Degree-2 score: ' + M('z = b + w_1x_1 + w_2x_2 + w_3x_1^2 + w_4x_1x_2 + w_5x_2^2') + '. The interaction ' + M('x_1x_2') + ' uses both inputs together. Curved boundary: ' + M('z = x_2 - x_1^2') + ' gives p = 0.5 on ' + M('x_2 = x_1^2') + '; with ' + M('u = x_1^2,\\ v = x_2') + ' it is the straight line v = u in the new features.</p>') +
      SRC('59 to 60', '<p>Fitting the same ball-height rule to different noisy samples: degree 1 has large squared bias (misses the pattern); as degree grows to 16, variance rises and new-observation error climbs. Images and recordings go the other way: 64 pixels or 64,000 audio samples get compressed into useful numeric summaries. Useful complexity captures signal and limits variance.</p>'),
    steps: XTRA('<p>Counting features for two inputs (follows from the lecture\'s lists):</p>', 'Extra worked numbers') + LEDGER([
      ['\\text{degree 1: } x_1, x_2 \\quad (2)', 'Original inputs.', 'plain'],
      ['\\text{degree 2 adds } x_1^2, x_1x_2, x_2^2 \\quad (\\text{total } 5)', 'Every product of two inputs.', 'plain'],
      ['\\text{degree 3 adds } x_1^3, x_1^2x_2, x_1x_2^2, x_2^3 \\quad (\\text{total } 9)', 'Plus one intercept: 10 coefficients.']
    ]) + XTRA('<p>Interaction meaning: for ŷ = x₁x₂, increasing x₁ by 1 changes ŷ by x₂, so the effect of x₁ depends on x₂ (Lecture 8 recap, p. 3: true).</p>'),
    lab: 'boundary',
    labIntro: '<p>Switch the lab to "Degree 2" for the lecture\'s parabola boundary. The regularization lab in Lecture 9 (Text Features) shows a degree-9 fit overfitting and a penalty taming it.</p>',
    mistakes: ['Calling a model with x and x² features nonlinear in its coefficients (recap: false). It is linear in the coefficients.', 'Assuming higher degree is always better because training error falls.', 'Forgetting the interaction terms when counting degree-2 features.'],
    connect: CHAIN(['Straight line', 'Polynomial features', 'Bias versus variance', 'Regularization (Lecture 9)'], 1),
    tryq: 'l7-poly-t'
  }),
  revise: {formulas: ['poly'], when: 'Curved relationships or boundaries; counting features; reasoning about overfitting.', formats: ['List degree-2 features.', 'Linear in coefficients?', 'Which degree overfits?'], traps: ['Linear in coefficients.', 'Training error falls with degree.']},
  prereq: ['l7-boundary'], next: ['l7-signal']
});

LESSON({id: 'l7-signal', lec: 7, title: 'Features from images and audio', pages: '61 to 71', keys: 'image features pixels ink density center symmetry balance audio energy zero crossing rate feature engineering',
  quick: {what: 'Hand-designed measurements compress raw pixels or audio samples into a few meaningful numbers.', why: '64 pixels or 64,000 samples are many raw inputs; a few good summaries make a linear model useful.', idea: 'Normalize, then measure: ink amount, where the ink is, symmetry, energy over time, how often the wave crosses zero.', remember: 'Choose measurements, then learn coefficients.'},
  learn: LEARN({
    problem: SRC('64, 67', '<p>A handwritten digit is an 8 × 8 = 64 grid of brightness values from 0 to 16. A 4-second recording at 16,000 samples per second is 64,000 numbers. Which few numbers should a classifier see?</p>'),
    model: '<p>Feature engineering can expand data (powers, interactions) or compress it (summaries). Here we compress: describe the picture the way a person might, "lots of ink, centered, fairly symmetric", but with formulas.</p>',
    example: SRC('64 to 66', MD('w_{ab} = \\frac{r_{ab}}{16} \\in [0, 1],\\qquad D = \\frac{1}{HW}\\sum_{a,b}w_{ab}') + MD('\\mu_{\\text{column}} = \\frac{\\sum_{a,b}v_b w_{ab}}{\\sum_{a,b}w_{ab}},\\quad \\mu_{\\text{row}} = \\frac{\\sum_{a,b}u_a w_{ab}}{\\sum_{a,b}w_{ab}}') + MD('S = 1 - \\frac{\\sum_{a,b}|w_{ab} - F(w)_{ab}|}{2\\sum_{a,b}w_{ab}},\\qquad B = \\frac{L - R}{L + R}') + '<p>D is ink density, the μ\'s are the ink center (positions u_a, v_b run from −1 to 1), F(w) is the left-right reflected image so S = 1 means perfect symmetry, and B compares left-half ink L with right-half ink R.</p>') +
      SRC('68 to 71', MD('\\tilde{a}_t = a_t - \\bar{a},\\quad e_t = \\tilde{a}_t^2 \\ge 0,\\quad \\omega_t = \\frac{e_t}{\\sum_j e_j},\\ \\sum_t\\omega_t = 1,\\qquad Z = \\frac{\\#\\{t : a_t a_{t-1} < 0\\}}{T - 1}') + '<p>Energy-shape features: early-energy fraction (energy in the first quarter ÷ total), energy center (energy-weighted average time), spread, and skewness. Zero-crossing rate counts sign changes per neighboring sample pair; percussive and non-percussive sounds differ. Then ' + M('\\mathbf{x} = \\phi_{\\text{image}}(r) \\in \\mathbb{R}^7') + ' or ' + M('\\mathbf{x} = \\phi_{\\text{audio}}(a) \\in \\mathbb{R}^5') + ' feeds ' + M('z = b + \\sum_j w_j x_j') + ', ' + M('p = \\sigma(z)') + '.</p>'),
    steps: XTRA('<p>On the lecture\'s digit (pixel values from p. 64; the feature values are computed here):</p>', 'Extra worked numbers') + LEDGER([
      ['\\sum r_{ab} = 344 \\Rightarrow \\sum w_{ab} = \\frac{344}{16} = 21.5', 'Total ink after normalizing.', 'plain'],
      ['D = \\frac{21.5}{64} \\approx 0.336', 'About a third of the grid is "inked".', 'plain'],
      ['B = \\frac{9.3125 - 12.1875}{21.5} \\approx -0.134', 'Slightly more ink on the right half.']
    ]),
    lab: 'signal',
    mistakes: ['Forgetting to divide by Σw for the ink center (that gives a sum, not an average position).', 'Counting zero crossings over T instead of T − 1 neighboring pairs.', 'Thinking more raw inputs always help a linear model; good summaries can do better.'],
    connect: CHAIN(['Raw signal', 'Engineered features φ(r)', 'Linear score', 'Text features: counts, TF-IDF (Lectures 8, 9)'], 1),
    tryq: 'l7-signal-t'
  }),
  revise: {formulas: ['ink', 'zcr'], when: 'Turning images or audio into a short feature vector.', formats: ['Compute ink density or balance for a tiny grid.', 'Compute a zero-crossing rate.', 'Expanding versus compressing features.'], traps: ['T − 1 denominator.', 'Normalizing by Σw.']},
  prereq: ['l7-poly'], next: ['l8-text']
});
