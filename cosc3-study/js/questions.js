/* Question bank, part 1. Numeric answers are computed expressions, not typed constants. */
'use strict';
function MC(id, lesson, mode, diff, q, opts, x) {
  Q(Object.assign({id: id, lesson: lesson, type: 'mcq', mode: mode, diff: diff, src: 'lecture', q: q,
    opts: opts.map(function (o) { return {t: o[0], ok: !!o[1], why: o[2], mis: o[3] || null}; })}, x || {}));
}
function NUM(id, lesson, diff, q, ans, sol, x) {
  const o = Object.assign({id: id, lesson: lesson, type: 'numeric', mode: 'numeric', diff: diff, src: 'lecture', q: q, ans: ans, sol: sol}, x || {});
  if (o.int) o.tol = 0.5;
  Q(o);
}
function WK(id, lesson, diff, q, parts, hints, x) {
  Q(Object.assign({id: id, lesson: lesson, type: 'worked', mode: 'worked', diff: diff, src: 'extra', q: q, parts: parts, hints: hints}, x || {}));
}

/* ---------- Misconceptions: name, the lesson that fixes it, a one-line correction ---------- */
MIS('norm-length', {name: 'Normalizing by part of the vector', lesson: 'l9-genre', fix: 'The length ‖q‖ uses every coordinate of the TF-IDF vector (0.3340 for Gorgeous), not only the words shown.'});
MIS('signed-cancel', {name: 'Averaging signed errors', lesson: 'l2-loss', fix: 'Positive and negative errors cancel. Use absolute values (MAE) or squares (MSE).'});
MIS('mean-median', {name: 'Mean versus median as the best constant', lesson: 'l2-median', fix: 'MSE is minimized by the mean; MAE by the median; 0-1 loss by the mode.'});
MIS('mse-units', {name: 'Units of squared quantities', lesson: 'l2-loss', fix: 'MSE and variance are in squared units (minutes², ms²); take a square root to return to the data units.'});
MIS('chain-sign', {name: 'Chain-rule sign', lesson: 'l2-mean', fix: 'd/dc (y − c)² = −2(y − c). The inner derivative −1 flips the sign.'});
MIS('bessel', {name: 'n versus n − 1', lesson: 'l3-sd', fix: 'Sample variance s² divides by n − 1. Dividing by n gives the biased version (and the minimum MSE).'});
MIS('var-sd', {name: 'Variance versus standard deviation', lesson: 'l3-sd', fix: 'SD is the square root of variance and is in the data\'s own units.'});
MIS('cov-units', {name: 'Reading strength from covariance', lesson: 'l3-cov', fix: 'Covariance scales with the units of x and y. Use r for strength.'});
MIS('r-slope', {name: 'Correlation as slope', lesson: 'l3-corr', fix: 'r measures tightness around a line. The slope is r·s_y/s_x, which equals r only when both variables are standardized.'});
MIS('zero-corr', {name: 'Zero correlation means independence', lesson: 'l3-limits', fix: 'r detects only straight-line association; y = x² can have r = 0.'});
MIS('causation', {name: 'Correlation as causation', lesson: 'l4-pitfalls', fix: 'A third variable can drive both (summer heat drives ice cream sales and drownings).'});
MIS('leakage', {name: 'Features from after prediction time', lesson: 'l4-features', fix: 'A valid feature must be known when the prediction is made.'});
MIS('group-denominator', {name: 'Group-mean denominator', lesson: 'l4-features', fix: 'Divide a group\'s total by the number of cases in that group.'});
MIS('residual-sign', {name: 'Residual sign convention', lesson: 'l4-line', fix: 'Lecture 4: e = y − ŷ. Lecture 7: r = ŷ − y. Check which one the question uses.'});
MIS('ols-denominator', {name: 'OLS slope formula', lesson: 'l4-ols', fix: 'θ₁* = Σ(x − x̄)(y − ȳ) ÷ Σ(x − x̄)². The denominator uses x only.'});
MIS('intercept', {name: 'OLS intercept formula', lesson: 'l4-ols', fix: 'θ₀* = ȳ − θ₁* x̄, so the line passes through (x̄, ȳ).'});
MIS('r2-negative', {name: 'What R² can be', lesson: 'l4-props', fix: 'R² = 1 − RSS/TSS. It is in [0, 1] on training data with an intercept but can be negative on test data.'});
MIS('extrapolation', {name: 'Extrapolation', lesson: 'l4-pitfalls', fix: 'A fitted line is untested outside the training range of x.'});
MIS('inverse-2x2', {name: '2 × 2 matrix inverse', lesson: 'l4-matrix', fix: 'Swap the diagonal, negate the off-diagonal, divide by ad − bc.'});
MIS('ols-any-loss', {name: 'OLS is optimal for every loss', lesson: 'l5-why', fix: 'OLS minimizes squared error only. Under MAE, 1 + 2x beats the OLS line on the café data.'});
MIS('prob-add', {name: 'Adding independent probabilities', lesson: 'l5-methods', fix: 'For independent draws, multiply the miss probabilities: P(all miss) = 0.95^B.'});
MIS('prob-complement', {name: 'Success versus failure probability', lesson: 'l5-methods', fix: '0.95^B is the chance every draw misses; success is 1 − 0.95^B.'});
MIS('hill-global', {name: 'Hill climbing finds the optimum', lesson: 'l5-hill', fix: 'It stops when no ±γ move helps, which can be short of the optimum when γ is large.'});
MIS('gd-sign', {name: 'Gradient descent direction', lesson: 'l5-gd', fix: 'θ_new = θ − ηg. Subtract the gradient to go downhill.'});
MIS('gd-simultaneous', {name: 'Simultaneous updates', lesson: 'l5-gd', fix: 'Compute every gradient at the current point, then update all coefficients together.'});
MIS('lr-large', {name: 'Bigger learning rate is faster', lesson: 'l5-gd', fix: 'Past a threshold, steps overshoot and diverge (η = 1.1 on c² multiplies by −1.2).'});
MIS('sign-diff', {name: 'Gradient descent on sign or 0-1 error', lesson: 'l6-sign', fix: 'sign(z) has derivative 0 almost everywhere and none at 0, so its gradient carries no information.'});
MIS('score-prob', {name: 'Score versus probability', lesson: 'l6-sigmoid', fix: 'z is the log odds (any real number); p = σ(z) is the probability. z = 0 gives p = 0.5.'});
MIS('odds-prob', {name: 'Odds versus probability', lesson: 'l6-sigmoid', fix: 'Odds = p ÷ (1 − p) can exceed 1; probability cannot.'});
MIS('logloss-branch', {name: 'Log-loss branch', lesson: 'l6-logloss', fix: 'y = 1 uses −ln p; y = 0 uses −ln(1 − p).'});
MIS('log-base', {name: 'Logarithm base', lesson: 'l9-idf', fix: 'The lecture\'s log loss and IDF numbers use the natural log ln.'});
MIS('grad-sign-py', {name: 'Logistic gradient', lesson: 'l6-gradient', fix: '∂ℓ/∂b = p − y and ∂ℓ/∂w = (p − y)x. Watch both the order p − y and the factor x.'});
MIS('threshold-coef', {name: 'Threshold and coefficients', lesson: 'l6-eval', fix: 'Changing the threshold changes predicted classes only; b and w are unchanged.'});
MIS('precision-recall', {name: 'Precision versus recall denominators', lesson: 'l9-prf', fix: 'Precision = TP ÷ (TP + FP), predicted positives. Recall = TP ÷ (TP + FN), actual positives.'});
MIS('train-test', {name: 'Evaluating on training data', lesson: 'l6-eval', fix: 'Report performance on held-out data with frozen coefficients.'});
MIS('holding-fixed', {name: 'Coefficient interpretation', lesson: 'l7-multi', fix: 'θ_j is the change in prediction per unit of x_j with the other features held fixed.'});
MIS('boundary-normal', {name: 'Direction of w', lesson: 'l7-boundary', fix: 'w is perpendicular (normal) to the boundary and points toward z > 0.'});
MIS('scale-all', {name: 'Scaling every coefficient', lesson: 'l7-boundary', fix: 'Multiplying b and all w by a positive number scales z but keeps its sign and the boundary.'});
MIS('grad-factor', {name: 'Gradient constant factors', lesson: 'l7-general', fix: 'Squared error: g_j = (2/n)Σ r x. Log loss: g_j = (1/n)Σ (p − y)x.'});
MIS('softmax-sum', {name: 'Multiclass versus multilabel', lesson: 'l7-multiclass', fix: 'Softmax probabilities sum to 1 (one answer); separate sigmoids need not (any subset).'});
MIS('test-stats', {name: 'Standardizing with test statistics', lesson: 'l7-scaling', fix: 'Reuse the training mean and SD for test and new inputs.'});
MIS('units-importance', {name: 'Coefficient size as importance', lesson: 'l7-scaling', fix: 'Coefficient size depends on units: θ_cm = 10 θ_mm for the same feature.'});
MIS('poly-nonlinear', {name: 'Polynomial features and linearity', lesson: 'l7-poly', fix: 'With features x and x², the model is still linear in its coefficients.'});
MIS('train-loss-better', {name: 'Lower training loss is better', lesson: 'l9-reg', fix: 'Training loss keeps falling with flexibility; judge models on validation loss.'});
MIS('zcr-denominator', {name: 'Zero-crossing denominator', lesson: 'l7-signal', fix: 'Divide sign changes by T − 1 neighboring pairs.'});
MIS('codes-meaning', {name: 'Character codes as meaning', lesson: 'l8-text', fix: 'ASCII distance tracks spelling and case, not meaning.'});
MIS('cond-denominator', {name: 'Conditional-probability denominator', lesson: 'l8-markov', fix: 'Divide by the number of times the context (or current state) occurred, the row total.'});
MIS('markov-history', {name: 'What a Markov chain conditions on', lesson: 'l8-markov', fix: 'A one-step chain uses only the current state, not the full history.'});
MIS('ngram-order', {name: 'n-gram names', lesson: 'l8-ngram', fix: 'Unigram: no previous token. Bigram: one. Trigram: two.'});
MIS('prob-multiply', {name: 'Chain rule multiplies', lesson: 'l8-ngram', fix: 'Sequence probability is a product of next-token probabilities.'});
MIS('bpe-recount', {name: 'Recounting when applying BPE', lesson: 'l8-bpe', fix: 'Apply the learned merge list in order; never recount pairs in the new word.'});
MIS('bpe-tie', {name: 'BPE tie rule', lesson: 'l8-bpe', fix: 'Equal counts: the pair that appears first in the training words wins (lecture tool).'});
MIS('tokens-vocab', {name: 'Tokens versus vocabulary terms', lesson: 'l9-dtm', fix: 'Tokens: every occurrence in one document. Vocabulary: distinct terms across the collection.'});
MIS('tf-denominator', {name: 'TF denominator', lesson: 'l9-tf', fix: 'TF = count ÷ all word tokens in that document (296 for Dartmouth).'});
MIS('tf-idf-confuse', {name: 'TF versus IDF roles', lesson: 'l9-tfidf', fix: 'TF measures share within one document; IDF measures rarity across documents.'});
MIS('idf-direction', {name: 'Direction of IDF', lesson: 'l9-idf', fix: 'More documents contain the word → larger DF → smaller IDF.'});
MIS('df-occurrences', {name: 'What DF counts', lesson: 'l9-idf', fix: 'DF counts documents containing the term, not occurrences.'});
MIS('idf-smoothing', {name: 'Smoothed IDF formula', lesson: 'l9-idf', fix: 'IDF = 1 + ln((n + 1) ÷ (DF + 1)): both +1s and the leading 1.'});
MIS('cosine-length', {name: 'Cosine and document length', lesson: 'l9-cosine', fix: 'Scaling a vector (repetition, TF) changes dot products and distances but not cosine.'});
MIS('dot-similarity', {name: 'Dot product as similarity', lesson: 'l9-cosine', fix: 'Dot products grow with length; divide by both lengths to get cosine.'});
MIS('norm-confuse', {name: 'TF versus unit-length normalization', lesson: 'l9-genre', fix: 'TF divides counts by the document\'s token count; unit length divides the TF-IDF vector by its Euclidean length so Σx² = 1.'});
MIS('positive-score', {name: 'Positive score as the prediction', lesson: 'l9-genre', fix: 'One-vs-rest predicts the genre with the largest score, not any positive score.'});
MIS('contribution-sign', {name: 'Sign of a feature contribution', lesson: 'l9-genre', fix: 'Contribution = coefficient × input; a large input with a negative coefficient lowers the score.'});
MIS('lambda-train', {name: 'Choosing λ from training loss', lesson: 'l9-reg', fix: 'Training loss always prefers the weakest penalty. Choose λ on validation data.'});
MIS('confusion-axes', {name: 'Confusion-matrix axes', lesson: 'l9-eval', fix: 'In this course rows are actual and columns predicted: FN is the rest of the row, FP the rest of the column.'});
MIS('accuracy-imbalance', {name: 'Accuracy under class imbalance', lesson: 'l9-eval', fix: 'Compare with the majority baseline; accuracy is dominated by large classes.'});
MIS('arith-mean-f1', {name: 'Averaging precision and recall', lesson: 'l9-prf', fix: 'F1 is the harmonic mean 2PR ÷ (P + R), which punishes a low value.'});
MIS('param-hyper', {name: 'Parameters versus hyperparameters', lesson: 'l9-tuning', fix: 'Fitted parameters (b_k, w_kj) are learned on training data; hyperparameters (λ, vocabulary cap, class weighting) are chosen on validation.'});
MIS('test-tuning', {name: 'Tuning on the test set', lesson: 'l9-tuning', fix: 'Use the test set once, after every choice is made on validation.'});

const WAITS = '2, 3, 4, 5, 16';

/* ======================= Lecture 2 ======================= */
NUM('l2-baseline-t', 'l2-baseline', 1, `The Fern café's last five drinks were Coffee, Tea, Coffee, Coffee, Tea (lecture p. 9). If you always predict the most common drink, what fraction of these five do you get right?`, 3 / 5,
  `<p>The most common class is Coffee (3 of 5). Predicting Coffee is right for the 3 coffees and wrong for the 2 teas: 3 ÷ 5 = <b>0.6</b>. This is the mode, the best constant under 0-1 loss.</p>`, {tryIt: true});
MC('l2-baseline-c1', 'l2-baseline', 'concept', 1, `Of the last 1,000 messages, 800 were legitimate and 200 spam. A filter labels every message legitimate. Which statement is correct?`, [
  ['Its accuracy is 80%, yet it catches none of the 200 spam messages.', 1, 'Right: 800 ÷ 1000 correct, and every spam message reaches the inbox (p. 35).'],
  ['Its accuracy is 80%, so it is a good spam filter.', 0, 'Accuracy hides that the rule never detects spam; the majority class alone gives 80%.', 'accuracy-imbalance'],
  ['Its accuracy is 20%.', 0, '20% is the accuracy of labeling everything spam.'],
  ['Accuracy cannot be computed without message features.', 0, 'Accuracy only needs predictions and labels; a constant rule has predictions.']]);
MC('l2-baseline-c2', 'l2-baseline', 'formula', 1, `With constant predictions only, you must forecast (1) tomorrow's café revenue in dollars and (2) whether the next order is for here or to go. Which pair of task types and baselines fits?`, [
  ['(1) regression, mean or median; (2) classification, most common class.', 1, 'Revenue is a number (regression); here or to go is a category (classification, mode).'],
  ['(1) classification, mode; (2) regression, mean.', 0, 'Swapped: a dollar amount is a numerical target.'],
  ['Both regression, both predicted with the mean.', 0, 'A category has no mean.', 'mean-median'],
  ['Both classification, both predicted with the mode.', 0, 'A continuous dollar amount is not a category.']]);

NUM('l2-loss-t', 'l2-loss', 1, `Wait times ${WAITS} minutes. Compute MAE for the constant guess c = 5.`, 17 / 5,
  `<p>Distances |y − 5|: 3, 2, 1, 0, 11. Sum 17. MAE(5) = 17 ÷ 5 = <b>3.4</b> minutes. Worse than MAE(4) = 3.2, as expected since the median is 4.</p>`,
  {tryIt: true, wrong: [[1, 'signed-cancel', 'You averaged signed errors (−3 − 2 − 1 + 0 + 11 = 5, then ÷ 5). Signed errors cancel; use absolute values.'], [27, 'mse-units', '27 is MSE(5), the squared version.']]});
NUM('l2-loss-n2', 'l2-loss', 1, `Same wait times. Compute MSE for c = 5.`, 135 / 5,
  `<p>Squared distances: 9, 4, 1, 0, 121. Sum 135. MSE(5) = 135 ÷ 5 = <b>27</b> minutes². Between MSE(4) = 30 and MSE(6) = 26.</p>`, {wrong: [[3.4, 'mse-units', '3.4 is MAE(5). MSE squares each distance first.']]});
MC('l2-loss-c1', 'l2-loss', 'prediction', 2, `In ${WAITS}, change the 16 to 26 and keep the guess c = 4. Which loss changes more, and by how much?`, [
  ['MSE: from 30 to 98. MAE only goes from 3.2 to 5.2.', 1, 'The far point\'s squared error jumps from 144 to 484 (+340, ÷ 5 = +68); its distance only grows by 10 (÷ 5 = +2).'],
  ['MAE: big misses count the most under absolute error.', 0, 'Absolute error grows linearly; squared error grows quadratically, so MSE reacts more.', 'mean-median'],
  ['They change by the same amount because both average over 5 points.', 0, 'The averaging is the same, but the per-point penalties differ: 10 versus 340.'],
  ['Neither changes, since only one point moved.', 0, 'Both are averages over every point, including the moved one.']]);
MC('l2-loss-m1', 'l2-loss', 'mistake', 1, `A student predicts 4 minutes for two orders that took 2 and 6 minutes, computes ((2 − 4) + (6 − 4)) ÷ 2 = 0, and concludes 4 is a perfect prediction. What is the mistake?`, [
  ['Signed errors cancel: both predictions miss by 2 minutes, but −2 and +2 average to 0.', 1, 'This is the lecture\'s naive error measurement (p. 16). MAE would be 2.'],
  ['The student should have divided by 1 instead of 2.', 0, 'The averaging is fine; the signs are the problem.'],
  ['4 really is perfect because it equals the mean of 2 and 6.', 0, 'Being the mean does not make each prediction correct; both still miss.', 'signed-cancel'],
  ['The student should have used 0-1 loss.', 0, 'For real-valued waits, 0-1 loss is almost always 1 and says little (p. 15).']]);

NUM('l2-mean-t', 'l2-mean', 2, `For ${WAITS}, compute the slope MSE′(c) = −(2/n) Σ(y_i − c) at c = 5.`, -2,
  `<p>Residuals y − 5: −3, −2, −1, 0, 11, sum 5. MSE′(5) = −(2/5)(5) = <b>−2</b>. Negative, so moving c to the right lowers MSE, toward the mean 6.</p>`,
  {tryIt: true, wrong: [[2, 'chain-sign', 'The sign is flipped: d/dc (y − c)² = −2(y − c). The −1 from the chain rule matters.']]});
MC('l2-mean-c1', 'l2-mean', 'concept', 1, `At c = 4, MSE′(4) = −4 for the wait times. What should happen to c to lower MSE?`, [
  ['Increase c: a negative slope means MSE falls as c moves right.', 1, 'The minimum is at the mean 6, to the right of 4.'],
  ['Decrease c: we move against the value −4.', 0, 'Moving against the slope means moving opposite to its sign: c − η(−4) increases c.', 'gd-sign'],
  ['Stay at 4: it is the median.', 0, '4 minimizes MAE, not MSE.', 'mean-median'],
  ['Nothing can be concluded from the slope.', 0, 'The sign of the derivative tells the downhill direction.']]);
MC('l2-mean-c2', 'l2-mean', 'formula', 2, `Which quantity equals the minimum value MSE(ȳ) of a constant prediction?`, [
  ['(1/n) Σ(y_i − ȳ)², the variance computed with n.', 1, 'Lecture 3, p. 30: the residual loss of the best constant is Var(y). For the wait times it is 26.'],
  ['(1/(n − 1)) Σ(y_i − ȳ)², the sample variance.', 0, 'MSE divides by n, not n − 1.', 'bessel'],
  ['0, because the mean is optimal.', 0, 'Optimal means smallest, not zero.'],
  ['The standard deviation.', 0, 'MSE is in squared units; SD is its square root.', 'var-sd']]);

NUM('l2-median-t', 'l2-median', 2, `For the even-count data 2, 3, 5, 16 (lecture p. 28), compute MAE at c = 3.5.`, 16 / 4,
  `<p>Distances: 1.5, 0.5, 1.5, 12.5, sum 16. MAE(3.5) = 16 ÷ 4 = <b>4</b>. The same value holds for every c in [3, 5]: the slope is zero across that interval, and the convention picks the midpoint 4.</p>`, {tryIt: true});
MC('l2-median-c1', 'l2-median', 'prediction', 2, `In ${WAITS}, replace the 16 by 1000. What happens to the MAE-optimal and MSE-optimal constants?`, [
  ['The median stays 4; the mean jumps to 202.8.', 1, 'The far point still casts one vote under MAE; under MSE it drags the mean: 1014 ÷ 5 = 202.8.'],
  ['Both jump toward 1000.', 0, 'Only the mean is sensitive to the size of an outlier.', 'mean-median'],
  ['Both stay the same.', 0, 'The mean changes because it uses the values, not just their order.'],
  ['The median jumps; the mean stays 6.', 0, 'Reversed: the median is the robust one.', 'mean-median']]);
NUM('l2-median-n2', 'l2-median', 2, `For ${WAITS}, compute the MAE slope at c = 4.5, using (points below c − points above c) ÷ n.`, 1 / 5,
  `<p>Below 4.5: 2, 3, 4 (3 points). Above: 5, 16 (2 points). Slope = (3 − 2) ÷ 5 = <b>0.2</b>. Positive, so moving right raises MAE: the minimum (median 4) is to the left.</p>`, {src: 'extra'});

NUM('l2-choose-t', 'l2-choose', 1, `Under 0-1 loss, what is the empirical risk of always predicting Coffee for Coffee, Tea, Coffee, Coffee, Tea?`, 2 / 5,
  `<p>0-1 loss is 1 for each wrong prediction: the 2 teas. R(Coffee) = 2 ÷ 5 = <b>0.4</b>. R(Tea) = 3 ÷ 5 = 0.6, so ERM picks Coffee, the mode.</p>`, {tryIt: true});
MC('l2-choose-c1', 'l2-choose', 'formula', 2, `A car estimates the distance to an obstacle. Overestimating the distance is far more dangerous than underestimating it (p. 37). Which training loss best reflects this?`, [
  ['An asymmetric loss that penalizes overestimates more than underestimates.', 1, 'Standard MSE and MAE treat ±15 m identically, which does not match the costs.'],
  ['Standard MSE, because it punishes large errors.', 0, 'MSE is symmetric: (+15)² = (−15)². The lecture\'s recap marks "MSE treats over and under differently" as false.'],
  ['MAE, because it is robust to outliers.', 0, 'Robustness is not the issue; MAE is also symmetric.'],
  ['0-1 loss, because a crash is a yes/no event.', 0, 'Distance is continuous; exact hits almost never happen.']], {src: 'extra'});
MC('l2-choose-c2', 'l2-choose', 'concept', 2, `Empirical risk minimization for a constant under MSE guarantees which of these?`, [
  ['The lowest average squared error on the training data among all constants.', 1, 'That is exactly what argmin of R(c) = (1/n)Σ(y_i − c)² means.'],
  ['Zero training error.', 0, 'Recap item (p. 19): ERM does not guarantee zero error; MSE(6) = 26 for the wait times.'],
  ['The lowest error on future data.', 0, 'ERM optimizes the data you have; future error can differ.', 'train-loss-better'],
  ['The median of the training data.', 0, 'Under MSE the minimizer is the mean.', 'mean-median']]);
MC('l2-choose-f1', 'l2-choose', 'formula', 1, `Wait times are heavily skewed, with rare 40-minute outliers, and every extra minute of error costs the same. Which constant should you predict?`, [
  ['The median, the MAE minimizer.', 1, 'Linear cost per minute means absolute error; the median is also robust to the outliers.'],
  ['The mean, the MSE minimizer.', 0, 'MSE charges big misses quadratically and is dragged by outliers.', 'mean-median'],
  ['The mode.', 0, 'The mode is for categories under 0-1 loss.'],
  ['The largest observed wait.', 0, 'That minimizes no standard loss here.']]);

/* ======================= Lecture 3 ======================= */
NUM('l3-spread-t', 'l3-spread', 1, `Server B's response times are 0, 4, 8 ms (mean 4). Compute the mean absolute deviation (MAD).`, 8 / 3,
  `<p>Deviations −4, 0, 4; absolute values 4, 0, 4; sum 8. MAD = 8 ÷ 3 ≈ <b>2.667</b> ms.</p>`, {tryIt: true, wrong: [[0, 'signed-cancel', 'You averaged the raw deviations, which always sum to zero.']]});
MC('l3-spread-c1', 'l3-spread', 'concept', 1, `Why can't spread be measured by averaging the raw deviations y_i − ȳ?`, [
  ['They always sum to zero: Σ(y_i − ȳ) = Σy_i − nȳ = 0.', 1, 'Lecture p. 23. Removing the sign (absolute value or square) fixes it.'],
  ['They are in squared units.', 0, 'Raw deviations are in the data units; squares are what create squared units.', 'mse-units'],
  ['They ignore the mean.', 0, 'They are defined relative to the mean.'],
  ['They are only defined for symmetric data.', 0, 'They exist for any data and still sum to zero.']]);
NUM('l3-spread-n2', 'l3-spread', 1, `Compute the variance dividing by n for the values 1, 2, 3, 6.`, 14 / 4,
  `<p>Mean 3. Deviations −2, −1, 0, 3; squares 4, 1, 0, 9; sum 14. Variance = 14 ÷ 4 = <b>3.5</b>.</p>`, {src: 'extra', wrong: [[14 / 3, 'bessel', 'You divided by n − 1 = 3; this question asks for the divide-by-n version.']]});

NUM('l3-sd-t', 'l3-sd', 1, `Compute the sample variance s² (divide by n − 1) for Server B: 0, 4, 8 ms.`, 32 / 2,
  `<p>Squared deviations 16, 0, 16, sum 32. s² = 32 ÷ (3 − 1) = <b>16</b> ms², so s = 4 ms. (Dividing by n gives the slide\'s 10.67 ms² on p. 24.)</p>`,
  {tryIt: true, wrong: [[32 / 3, 'bessel', 'That is the divide-by-n variance (10.67). Sample variance divides by n − 1.'], [4, 'var-sd', '4 is s, the standard deviation. The question asks for s².']]});
NUM('l3-sd-n2', 'l3-sd', 2, `Compute the sample standard deviation s for 2, 4, 4, 6.`, Math.sqrt(8 / 3),
  `<p>Mean 4; squared deviations 4, 0, 0, 4, sum 8; s² = 8 ÷ 3 ≈ 2.667; s = √2.667 ≈ <b>1.633</b>.</p>`, {src: 'extra', wrong: [[8 / 3, 'var-sd', 'That is s², not s. Take the square root.'], [Math.sqrt(2), 'bessel', 'You divided by n = 4. Use n − 1.']]});
MC('l3-sd-c1', 'l3-sd', 'concept', 1, `Query latency is roughly normal with ȳ = 4.0 ms and s = 1.0 ms. About what share of queries take between 2.0 and 6.0 ms?`, [
  ['About 95%.', 1, 'ȳ ± 2s contains about 95% (empirical rule, p. 31).'],
  ['About 68%.', 0, '68% is ȳ ± 1s, here 3.0 to 5.0 ms.'],
  ['About 99.7%.', 0, '99.7% is ȳ ± 3s, here 1.0 to 7.0 ms.'],
  ['Exactly 50%.', 0, 'The interval is centered at the mean and spans two SDs on each side.']]);
MC('l3-sd-m1', 'l3-sd', 'mistake', 2, `A student reports the sample variance of Server B (0, 4, 8) as 10.67 ms². What went wrong?`, [
  ['They divided by n = 3; the sample variance divides by n − 1 = 2, giving 16 ms².', 1, 'Bessel\'s correction (p. 26).'],
  ['They forgot to square the deviations.', 0, '32 ÷ 3 = 10.67 does use squares.'],
  ['They should have reported 3.27 ms instead.', 0, '3.27 ms is the square root of 10.67, still the divide-by-n version.', 'var-sd'],
  ['Nothing; 10.67 ms² is the sample variance.', 0, 'It is the population-style (÷ n) variance.', 'bessel']]);

NUM('l3-cov-t', 'l3-cov', 2, `Compute cov(x, y) with n − 1 for x = (1, 2, 3) and y = (2, 4, 9).`, 7 / 2,
  `<p>x̄ = 2, ȳ = 5. Centered x: −1, 0, 1; centered y: −3, −1, 4. Products 3, 0, 4, sum 7. cov = 7 ÷ 2 = <b>3.5</b>.</p>`, {src: 'extra', tryIt: true, wrong: [[7 / 3, 'bessel', 'You divided by n. Covariance in this course uses n − 1.']]});
MC('l3-cov-c1', 'l3-cov', 'prediction', 2, `Durations x are converted from minutes to seconds (multiplied by 60). What happens to cov(x, y) and to r?`, [
  ['cov is multiplied by 60; r is unchanged.', 1, 'Covariance carries the units of x; r divides by s_x, which is also multiplied by 60 (p. 39, 44).'],
  ['Both are multiplied by 60.', 0, 'r is unitless and invariant to positive rescaling.', 'cov-units'],
  ['Both are unchanged.', 0, 'Covariance depends on units.', 'cov-units'],
  ['cov is unchanged; r is multiplied by 60.', 0, 'Reversed.']]);
MC('l3-cov-c2', 'l3-cov', 'concept', 1, `np.cov(x, y) returns [[0.516, −0.201], [−0.201, 0.949]] (lecture p. 43). What is Var(y)?`, [
  ['0.949, the bottom-right entry.', 1, 'The matrix is [[Var(x), Cov(x, y)], [Cov(y, x), Var(y)]].'],
  ['−0.201.', 0, 'That is the covariance, an off-diagonal entry.'],
  ['0.516.', 0, 'That is Var(x).'],
  ['It cannot be read from this output.', 0, 'The diagonal holds both variances.']]);

NUM('l3-corr-t', 'l3-corr', 2, `For x = (1, 2, 3) and y = (2, 4, 9), cov = 3.5 and s_x = 1. Compute r.`, 3.5 / Math.sqrt(13),
  `<p>s_y² = ((−3)² + (−1)² + 4²) ÷ 2 = 26 ÷ 2 = 13, so s_y = √13 ≈ 3.606. r = 3.5 ÷ (1 × 3.606) ≈ <b>0.971</b>.</p>`, {src: 'extra', tryIt: true, wrong: [[3.5, 'cov-units', 'That is the covariance. Divide by s_x s_y.']]});
MC('l3-corr-c1', 'l3-corr', 'mistake', 2, `r = 0.5 between hours studied and exam score. A student concludes "each extra hour adds 0.5 points". What is wrong?`, [
  ['r is not the slope. The slope is r·s_y/s_x, which equals r only when both variables are standardized.', 1, 'Lecture p. 40 and Lecture 4 p. 29: correlation measures linear association, not slope.'],
  ['Nothing; r is the slope of the regression line.', 0, 'Only in standardized units.', 'r-slope'],
  ['r should be squared first to get the slope.', 0, 'r² is the share of variance explained, not the slope.'],
  ['The student should use covariance as the slope.', 0, 'The slope is cov ÷ var(x), not cov.', 'ols-denominator']]);
MC('l3-corr-c2', 'l3-corr', 'prediction', 1, `Temperature x is converted from Celsius to Fahrenheit (F = 1.8C + 32). What happens to the correlation between temperature and ice cream sales?`, [
  ['It is unchanged.', 1, 'For u = ax + b with a > 0, every z-score is unchanged, so r is unchanged (p. 44).'],
  ['It is multiplied by 1.8.', 0, 'The 1.8 cancels in the z-scores.', 'cov-units'],
  ['It increases by 32.', 0, 'Shifting by 32 changes the mean but not deviations from it.'],
  ['It flips sign.', 0, 'Only a negative scale factor would flip the sign.']]);
MC('l3-corr-f1', 'l3-corr', 'formula', 1, `You want to compare how strongly height relates to weight in two datasets: one in cm and kg, the other in inches and pounds. Which statistic?`, [
  ['Pearson\'s r.', 1, 'r is unitless, so the two datasets are comparable.'],
  ['Covariance.', 0, 'Covariance changes with the units.', 'cov-units'],
  ['The regression slope.', 0, 'The slope has units of y per x.'],
  ['Variance of weight.', 0, 'That ignores height entirely.']]);

NUM('l3-limits-t', 'l3-limits', 1, `For x = (−1, 0, 1) and y = x² = (1, 0, 1), compute Σ(x_i − x̄)(y_i − ȳ).`, 0,
  `<p>x̄ = 0 and ȳ = 2/3. Products: (−1)(1/3) + (0)(−2/3) + (1)(1/3) = <b>0</b>. Covariance and r are 0 even though y is a perfect function of x.</p>`, {src: 'extra', tryIt: true, tol: 0.001});
MC('l3-limits-c1', 'l3-limits', 'concept', 1, `For some dataset r(x, y) = 0. Which conclusion is justified?`, [
  ['There is no straight-line association; x and y may still be strongly related.', 1, 'Lecture p. 47: y = x² has r = 0.'],
  ['x and y are independent.', 0, 'Zero correlation does not imply independence.', 'zero-corr'],
  ['Knowing x cannot help predict y.', 0, 'With y = x², x predicts y perfectly.', 'zero-corr'],
  ['The datasets in Anscombe\'s quartet must look the same.', 0, 'Anscombe\'s point is the opposite.']]);

MC('l3-limits-c2', 'l3-limits', 'concept', 2, `Anscombe's quartet and the Datasaurus Dozen (pp. 48 to 49) are datasets with matching means, variances and correlations. What do they demonstrate?`, [
  ['Summary statistics can be identical for datasets with completely different shapes, so always plot the data.', 1, 'Same numbers, different pictures.'],
  ['Correlation is unreliable and should never be used.', 0, 'It is useful, just incomplete.'],
  ['Datasets with equal correlation must have the same regression line shape.', 0, 'The shapes differ wildly.'],
  ['Zero correlation implies independence.', 0, 'Unrelated claim, and false.', 'zero-corr']]);

/* ======================= Lecture 4 ======================= */
NUM('l4-features-t', 'l4-features', 1, `Of 10 past orders, four had 2 items, with waits 5, 6, 7 and 5 minutes. What is the group mean f̂(2)?`, 23 / 4,
  `<p>f̂(2) = (5 + 6 + 7 + 5) ÷ 4 = 23 ÷ 4 = <b>5.75</b> minutes. The denominator is |D₂| = 4, the size of the group.</p>`, {src: 'extra', tryIt: true, wrong: [[2.3, 'group-denominator', 'You divided by all 10 orders. Divide by the 4 orders in the group.']]});
MC('l4-features-c1', 'l4-features', 'mistake', 1, `You predict a café order's wait at the moment it is placed. Which feature is invalid?`, [
  ['Milk volume measured during preparation.', 1, 'It only exists after prediction time (p. 6).'],
  ['Number of items ordered.', 0, 'Known at order time.', 'leakage'],
  ['Time of day.', 0, 'Known at order time.', 'leakage'],
  ['Day of the week.', 0, 'Known at order time.', 'leakage']]);
MC('l4-features-c2', 'l4-features', 'concept', 2, `With sparse data, you compute group means using very narrow bins (often 0 or 1 order per bin). What is the main problem?`, [
  ['Unstable means (high variance); some bins have no mean at all.', 1, 'Lecture p. 10: narrow bins give little systematic error but 0 or 1 points per bin.'],
  ['Large systematic error (bias).', 0, 'That is the wide-bin problem.'],
  ['The means are always equal to the overall mean.', 0, 'Narrow bins track local values closely, not the overall mean.'],
  ['Nothing; narrower is always better.', 0, 'It trades bias for variance.']]);

NUM('l4-line-t', 'l4-line', 1, `Café orders x = (1, 2, 3, 4), y = (3, 4, 8, 9). Compute the MSE of the line ŷ = 0.5 + 2.2x.`, 1.8 / 4,
  `<p>Predictions 2.7, 4.9, 7.1, 9.3; residuals 0.3, −0.9, 0.9, −0.3; squares 0.09, 0.81, 0.81, 0.09, sum 1.8. MSE = 1.8 ÷ 4 = <b>0.45</b>, lower than 0.5 for ŷ = 1 + 2x.</p>`, {tryIt: true});
MC('l4-line-c1', 'l4-line', 'concept', 1, `For ŷ = 2x + 1 (x = items ordered, ŷ = minutes), what does θ₁ = 2 mean?`, [
  ['Each extra item adds 2 minutes to the predicted wait.', 1, 'Lecture p. 13.'],
  ['An order with no items takes 2 minutes.', 0, 'That would be the intercept, which is 1 here.'],
  ['Predictions are off by 2 minutes on average.', 0, 'That is an error measure, not the slope.'],
  ['Two items take 1 minute.', 0, 'ŷ(2) = 5 minutes.']]);
NUM('l4-line-n2', 'l4-line', 1, `Using Lecture 4's convention e = y − ŷ, what is the residual of the café point x = 3, y = 8 under ŷ = 1 + 2x?`, 1,
  `<p>ŷ = 1 + 2(3) = 7, so e = 8 − 7 = <b>1</b>. Positive: the point is above the line.</p>`, {wrong: [[-1, 'residual-sign', 'You computed ŷ − y. Lecture 4 uses e = y − ŷ.']]});

NUM('l4-ols-t', 'l4-ols', 2, `Fit least squares to x = (1, 2, 3), y = (2, 4, 9). What is the slope θ₁*?`, 7 / 2,
  `<p>x̄ = 2, ȳ = 5. Σx̃ỹ = (−1)(−3) + 0(−1) + 1(4) = 7. Σx̃² = 1 + 0 + 1 = 2. θ₁* = 7 ÷ 2 = <b>3.5</b>.</p>`, {src: 'extra', tryIt: true, wrong: [[7 / 26, 'ols-denominator', 'You divided by Σ(y − ȳ)². The denominator is Σ(x − x̄)².']]});
NUM('l4-ols-n2', 'l4-ols', 2, `For the same data (slope 3.5), compute the intercept θ₀*.`, 5 - 3.5 * 2,
  `<p>θ₀* = ȳ − θ₁* x̄ = 5 − 3.5 × 2 = <b>−2</b>. The fitted line ŷ = −2 + 3.5x passes through (x̄, ȳ) = (2, 5).</p>`, {src: 'extra', wrong: [[3, 'intercept', 'θ₀* = ȳ − θ₁* x̄, not ȳ − x̄.'], [12, 'intercept', 'Subtract θ₁* x̄; do not add it.']]});
MC('l4-ols-c1', 'l4-ols', 'concept', 1, `For a least-squares line with an intercept, what is the prediction at x = x̄?`, [
  ['ȳ, for any slope.', 1, 'θ₀* = ȳ − θ₁x̄ puts the line through (x̄, ȳ) (p. 21).'],
  ['θ₀.', 0, 'θ₀ is the prediction at x = 0.'],
  ['0, because the residuals sum to zero.', 0, 'Residuals summing to zero does not make predictions zero.'],
  ['It depends on the slope.', 0, 'At x̄ the slope term cancels.', 'intercept']]);
NUM('l4-ols-n3', 'l4-ols', 2, `Both variables are standardized and r = 0.6. A case has z_x = −1.5. What is the predicted ẑ_y?`, 0.6 * -1.5,
  `<p>With s_x = s_y = 1 the slope is r, so ẑ_y = r z_x = 0.6 × (−1.5) = <b>−0.9</b>. Closer to the mean than the input: regression to the mean.</p>`, {src: 'extra'});
MC('l4-ols-f1', 'l4-ols', 'formula', 2, `You are told r = 0.8, s_x = 2 and s_y = 5 for a dataset but not the raw data. Which formula gives the least-squares slope?`, [
  ['θ₁* = r s_y ÷ s_x = 0.8 × 5 ÷ 2 = 2.', 1, 'Lecture p. 28.'],
  ['θ₁* = r = 0.8.', 0, 'Only for standardized variables.', 'r-slope'],
  ['θ₁* = r s_x ÷ s_y = 0.32.', 0, 'Upside down: the units must be y per x.'],
  ['θ₁* = ȳ − r x̄.', 0, 'That looks like the intercept formula, and it needs the means.', 'intercept']]);

NUM('l4-props-t', 'l4-props', 1, `For the café fit, RSS = 1.8 and TSS = 26. Compute R².`, 1 - 1.8 / 26,
  `<p>R² = 1 − RSS ÷ TSS = 1 − 1.8 ÷ 26 ≈ 1 − 0.069 = <b>0.931</b>, which equals r² ≈ 0.965².</p>`, {tryIt: true, wrong: [[1.8 / 26, 'r2-negative', 'That is RSS ÷ TSS, the unexplained share. R² is 1 minus it.']]});
MC('l4-props-c1', 'l4-props', 'concept', 1, `A line with an intercept leaves residuals +2, +1, +3. Could it be the least-squares fit?`, [
  ['No: least-squares residuals with an intercept sum to zero, and these sum to 6.', 1, 'Lecture pp. 35 to 36.'],
  ['Yes: all residuals are small.', 0, 'Size is not the test; balance is.'],
  ['Yes: residuals only need to be orthogonal to x.', 0, 'Property 1 (Σe = 0) must also hold.'],
  ['Cannot tell without x.', 0, 'Property 1 needs no x values.']]);
MC('l4-props-c2', 'l4-props', 'concept', 2, `On test data, a model has R² = −0.2. What does this mean?`, [
  ['On those test cases it does worse than predicting ȳ for everyone.', 1, 'R² < 0 means RSS > TSS (p. 39); it can only happen on data the model was not fit to.'],
  ['The calculation must be wrong; R² is always between 0 and 1.', 0, 'That holds on training data with an intercept, not on test data.', 'r2-negative'],
  ['The model explains 20% of the variation, with the sign showing a negative slope.', 0, 'R² is not signed by the slope.'],
  ['The correlation is −0.2.', 0, 'R² = r² holds only for one-feature training fits, and a square cannot be negative.']]);

NUM('l4-pitfalls-t', 'l4-pitfalls', 1, `Using ŷ = 0.5 + 2.2x (trained on x from 1 to 4 items), compute the prediction for x = 500 in minutes.`, 0.5 + 2.2 * 500,
  `<p>ŷ = 0.5 + 2.2 × 500 = <b>1100.5</b> minutes ≈ 18.3 hours (p. 44). The arithmetic is easy; the point is that x = 500 is far outside [1, 4], so the number is untrustworthy.</p>`, {tryIt: true, tol: 0.1});
MC('l4-pitfalls-c1', 'l4-pitfalls', 'concept', 1, `Ice cream sales and drowning deaths have r = +0.89 (p. 45). What is the best explanation?`, [
  ['Summer heat drives both; ice cream does not cause drowning.', 1, 'A confounder Z creates the correlation.'],
  ['Ice cream causes drowning.', 0, 'Correlation alone does not show causation.', 'causation'],
  ['r = 0.89 proves a causal link of strength 0.89.', 0, 'r measures linear association, not causation.', 'causation'],
  ['The correlation must be a calculation error.', 0, 'It is real, just not causal.']]);
MC('l4-pitfalls-c2', 'l4-pitfalls', 'prediction', 2, `You add one point whose x is far from x̄ and whose y is far off the trend. What happens to the least-squares line?`, [
  ['It rotates toward the point; the slope can change a lot (2.20 to −0.32 in the lecture).', 1, 'A bad leverage point dominates both sums in θ₁* (pp. 42 to 43).'],
  ['It shifts up but keeps nearly the same slope.', 0, 'That is a response outlier with typical x.'],
  ['The slope becomes more precise.', 0, 'That is a good leverage point, far in x but on trend.'],
  ['Nothing changes; one point cannot matter.', 0, 'Far-out x values have long lever arms.']]);

NUM('l4-matrix-t', 'l4-matrix', 2, `For x = (1, 2, 3) with a column of ones, X^T X = [[3, 6], [6, 14]]. Compute its determinant.`, 3 * 14 - 6 * 6,
  `<p>det = 3 × 14 − 6 × 6 = 42 − 36 = <b>6</b>. Nonzero, so X^T X is invertible and θ* = (X^T X)⁻¹ X^T y exists.</p>`, {src: 'extra', tryIt: true, wrong: [[78, 'inverse-2x2', 'The determinant is ad − bc, not ad + bc.']]});
NUM('l4-matrix-n2', 'l4-matrix', 2, `Same x = (1, 2, 3) and y = (2, 4, 9). What is the second entry of X^T y, Σx_i y_i?`, 2 + 8 + 27,
  `<p>Σx_i y_i = 1(2) + 2(4) + 3(9) = 2 + 8 + 27 = <b>37</b>. The first entry is Σy_i = 15. Then θ* = (1/6)[[14, −6], [−6, 3]][15, 37] = [−2, 3.5], matching the scalar formulas.</p>`, {src: 'extra', int: true});
MC('l4-matrix-c1', 'l4-matrix', 'concept', 1, `Why does the design matrix X include a column of ones?`, [
  ['So that θ₀ multiplies 1 in every row, giving each prediction an intercept.', 1, 'Lecture p. 45: the column of ones multiplies θ₀.'],
  ['To make X^T X invertible.', 0, 'Invertibility depends on the x values, not on adding ones.'],
  ['To standardize the feature.', 0, 'Standardizing subtracts a mean and divides by an SD.'],
  ['So residuals are positive.', 0, 'Residuals can have either sign.']]);

/* ======================= Lecture 5 ======================= */
NUM('l5-why-t', 'l5-why', 1, `Café orders x = (1, 2, 3, 4), y = (3, 4, 8, 9). Compute the MAE of the line ŷ = 1 + 2x.`, 2 / 4,
  `<p>Predictions 3, 5, 7, 9; residuals 0, −1, 1, 0; absolute values sum to 2. MAE = 2 ÷ 4 = <b>0.5</b>, lower than the OLS line\'s 0.60 (p. 12).</p>`, {tryIt: true});
MC('l5-why-c1', 'l5-why', 'concept', 2, `Why can't we derive a closed-form least-absolute-error line the way we derived OLS?`, [
  ['Setting the MAE derivative to zero gives Σ sign(e_i) = 0, which carries signs but not magnitudes, so the coefficients cannot be isolated.', 1, 'Lecture p. 13.'],
  ['MAE has no minimum.', 0, 'It has a minimum; it just lacks a formula.'],
  ['The OLS coefficients already minimize MAE.', 0, 'On the café data, 1 + 2x has lower MAE than OLS.', 'ols-any-loss'],
  ['MAE cannot be computed for a line.', 0, 'The table on p. 12 computes it.']]);
MC('l5-why-c2', 'l5-why', 'concept', 1, `In the (θ₀, θ₁) parameter plane, which point is the constant predictor ŷ = 6?`, [
  ['(6, 0)', 1, 'Intercept 6, slope 0 (p. 17).'],
  ['(0, 6)', 0, 'That is the line ŷ = 6x.'],
  ['(6, 6)', 0, 'That line is ŷ = 6 + 6x.'],
  ['(2.5, 6)', 0, '(x̄, ȳ) is a data-space point, not a parameter.']]);

NUM('l5-methods-t', 'l5-methods', 2, `Random search, independent draws, target the best 5% of the box. What is the probability that at least one of B = 20 draws lands in the target?`, 1 - Math.pow(0.95, 20),
  `<p>Each draw misses with probability 0.95; all 20 miss with 0.95²⁰ ≈ 0.3585. So P(at least one hit) = 1 − 0.3585 ≈ <b>0.642</b>.</p>`,
  {tryIt: true, wrong: [[1, 'prob-add', '20 × 0.05 = 1 adds probabilities; for independent draws multiply the miss probabilities.'], [Math.pow(0.95, 20), 'prob-complement', '0.3585 is the chance every draw misses. Take the complement.']]});
NUM('l5-methods-n2', 'l5-methods', 1, `A grid search uses 4 values for each of 3 coefficients. How many candidates does it evaluate?`, Math.pow(4, 3),
  `<p>Every combination: 4 × 4 × 4 = 4³ = <b>64</b>. With 5 choices for 10 coefficients it would be 5¹⁰ = 9,765,625 (p. 18).</p>`, {src: 'extra', int: true, wrong: [[12, 'prob-add', 'Combinations multiply: 4 × 4 × 4, not 4 + 4 + 4.']]});
MC('l5-methods-c1', 'l5-methods', 'concept', 2, `What is the smallest number of independent random draws that gives at least a 95% chance of landing in the best 5% region?`, [
  ['59', 1, '0.95⁵⁹ ≈ 4.85%, so success ≈ 95.15%; 58 draws give only 94.90% (p. 23).'],
  ['20', 0, '1 ÷ 0.05 = 20 assumes probabilities add.', 'prob-add'],
  ['58', 0, '1 − 0.95⁵⁸ ≈ 0.949, just short of 95%.'],
  ['100', 0, 'Works, but it is not the smallest.']]);
MC('l5-methods-f1', 'l5-methods', 'formula', 1, `Which expression gives the probability that at least one of B independent random draws lands in a region covering 5% of the search box?`, [
  ['1 − 0.95^B', 1, 'Complement of "all B draws miss".'],
  ['0.95^B', 0, 'That is the probability all draws miss.', 'prob-complement'],
  ['0.05B', 0, 'Probabilities of independent events do not add.', 'prob-add'],
  ['0.05^B', 0, 'That is the probability all B draws hit.']]);

NUM('l5-hill-t', 'l5-hill', 1, `On the café data, compute the MSE of the candidate (θ₀, θ₁) = (1, 2.5).`, 8.5 / 4,
  `<p>ŷ = 1 + 2.5x gives 3.5, 6, 8.5, 11; residuals −0.5, −2, −0.5, −2; squares sum to 0.25 + 4 + 0.25 + 4 = 8.5. MSE = 8.5 ÷ 4 = <b>2.125</b> (p. 25).</p>`, {tryIt: true});
MC('l5-hill-c1', 'l5-hill', 'concept', 2, `Hill climbing with step γ = 0.5 stops at (1, 2) with MSE 0.5, although OLS reaches 0.45 at (0.5, 2.2). Why?`, [
  ['Every ±0.5 change to one coefficient raises MSE (0.75, 0.75, 2.625, 2.125), so no move improves; the step is too coarse.', 1, 'A step of 0.05 in the slope finds 0.49375 (p. 25).'],
  ['(1, 2) is the global minimum of MSE.', 0, 'OLS at (0.5, 2.2) is lower.', 'hill-global'],
  ['The budget ran out.', 0, 'It stopped because nothing improved.'],
  ['Hill climbing only works for MAE.', 0, 'It works for any objective; here MSE.']]);
MC('l5-hill-c2', 'l5-hill', 'concept', 3, `When searching over assignment answers with all-or-nothing grading, strict hill climbing averaged 2.12 of 53 points while hill climbing with ties averaged 13.07. Why does accepting ties help?`, [
  ['Most single changes leave the score unchanged (plateaus); strict hill climbing sees no improvement and stops, while ties let it keep moving.', 1, 'Explanation is extra intuition; the scores are from p. 30.'],
  ['Ties make each evaluation cheaper.', 0, 'Evaluation cost is unchanged.'],
  ['Ties guarantee the global optimum.', 0, 'They help cross plateaus but guarantee nothing.', 'hill-global'],
  ['Strict hill climbing uses a larger step size.', 0, 'The difference is the acceptance rule, not the step.']], {src: 'extra'});

NUM('l5-gd-t', 'l5-gd', 1, `Gradient descent on L(c) = c², start c = 2, learning rate η = 0.2. What is c after two updates?`, 2 * 0.6 * 0.6,
  `<p>c_new = (1 − 2η)c = 0.6c. After one step 1.2, after two 0.72. So c = <b>0.72</b>.</p>`, {tryIt: true, wrong: [[2 * 1.4 * 1.4, 'gd-sign', 'You added the gradient: c + η(2c) = 1.4c. Subtract it.']]});
MC('l5-gd-c1', 'l5-gd', 'prediction', 1, `On L(c) = c², starting at c = 2 with η = 1.1, what happens?`, [
  ['It diverges: 2 → −2.4 → 2.88, flipping sign and growing.', 1, 'Each step multiplies by 1 − 2.2 = −1.2 (p. 32).'],
  ['It converges in one step.', 0, 'That happens at η = 0.5.'],
  ['It converges slowly, like η = 0.1.', 0, 'η = 0.1 multiplies by 0.8; η = 1.1 multiplies by −1.2.', 'lr-large'],
  ['It stays at 2.', 0, 'The gradient at 2 is 4, so c moves.']]);
MC('l5-gd-m1', 'l5-gd', 'mistake', 2, `A student updates θ₀ first, then recomputes the gradient using the new θ₀ before updating θ₁. What is the mistake?`, [
  ['Gradient descent computes all derivatives at the current point and updates every coefficient together.', 1, 'Lecture p. 31: "Calculate all derivatives, update coefficients together."'],
  ['θ₁ should be updated first.', 0, 'Order is not the issue; using a mixed point is.', 'gd-simultaneous'],
  ['The learning rate must be doubled to compensate.', 0, 'Changing η does not fix the mixed update.'],
  ['Nothing; this is standard gradient descent.', 0, 'That is a coordinate-wise method, not the lecture\'s update.', 'gd-simultaneous']]);
NUM('l5-gd-n2', 'l5-gd', 2, `Café MSE, start at (θ₀, θ₁) = (0, 0), η = 0.1. The gradients are g₀ = −12 and g₁ = −35.5. What is θ₁ after one update?`, 0 - 0.1 * -35.5,
  `<p>θ₁ = 0 − 0.1 × (−35.5) = <b>3.55</b>. At the same time θ₀ = 0 − 0.1 × (−12) = 1.2. Both negative gradients raise their coefficients.</p>`, {src: 'extra', wrong: [[-3.55, 'gd-sign', 'Subtract η times the gradient: 0 − 0.1(−35.5) = +3.55.']]});
