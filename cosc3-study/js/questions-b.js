/* Question bank, part 2: Lectures 6 to 9 and multi-step worked problems. */
'use strict';

/* ======================= Lecture 6 ======================= */
NUM('l6-sign-t', 'l6-sign', 1, `Five messages have scores z = (−1.2, 0.3, 2.0, −0.1, 0.8) and true labels y = (−1, −1, +1, +1, +1). Using ŷ = +1 when z ≥ 0 and −1 otherwise, what is the training error rate?`, 2 / 5,
  `<p>Predictions: −1, +1, +1, −1, +1. Wrong at message 2 (predicted +1, true −1) and message 4 (predicted −1, true +1). Error = 2 ÷ 5 = <b>0.4</b>.</p>`, {src: 'extra', tryIt: true});
MC('l6-sign-c1', 'l6-sign', 'concept', 2, `Why can't gradient descent minimize training error when predictions are ŷ = sign(b + wx)?`, [
  ['sign(z) is flat almost everywhere (derivative 0) and has no derivative at 0, so the gradients carry no information.', 1, 'Lecture p. 22.'],
  ['Training error has no minimum.', 0, 'Grid or random search can find a minimum (p. 20).'],
  ['The labels must be 0 and 1 for any gradient.', 0, 'The coding is not the obstacle; flatness is.'],
  ['Gradient descent only works for regression.', 0, 'It works for logistic regression once the loss is smooth.', 'sign-diff']]);
MC('l6-sign-c2', 'l6-sign', 'concept', 1, `Two messages get scores z = 0.1 and z = 4. Under the sign rule, what do we learn?`, [
  ['Both are predicted spam (+1); the rule gives no degree of certainty.', 1, 'Same class label, no confidence information (p. 18).'],
  ['The second is 40 times more likely to be spam.', 0, 'Scores are not probabilities, and sign ignores magnitude.', 'score-prob'],
  ['The first is predicted nonspam.', 0, '0.1 ≥ 0 gives +1.'],
  ['Neither can be classified.', 0, 'Any real score has a sign.']]);

NUM('l6-sigmoid-t', 'l6-sigmoid', 2, `Penguin model b = −0.2, w = 1.4, x = (mass − 4000) ÷ 1000. What Gentoo probability does it give a 5000 g penguin?`, sigmoid(-0.2 + 1.4 * 1),
  `<p>x = (5000 − 4000) ÷ 1000 = 1. z = −0.2 + 1.4(1) = 1.2. e^(−1.2) ≈ 0.3012. p = 1 ÷ 1.3012 ≈ <b>0.769</b>.</p>`,
  {src: 'extra', tryIt: true, wrong: [[1.2, 'score-prob', '1.2 is the score z. Apply p = 1 ÷ (1 + e^(−z)).'], [sigmoid(-0.2 + 1.4 * 5000), 'score-prob', 'Standardize the mass first: x = (5000 − 4000) ÷ 1000 = 1.']]});
NUM('l6-sigmoid-n2', 'l6-sigmoid', 1, `A model gives Gentoo probability p = 0.8. What are the odds p ÷ (1 − p)?`, 0.8 / 0.2,
  `<p>Odds = 0.8 ÷ 0.2 = <b>4</b>: Gentoo is 4 times as likely as Adélie. The log odds is ln 4 ≈ 1.386, which is the score z.</p>`, {src: 'extra', wrong: [[0.8, 'odds-prob', '0.8 is the probability. Odds divide it by 1 − p.']]});
MC('l6-sigmoid-c1', 'l6-sigmoid', 'mistake', 1, `For the 4500 g penguin the score is z = 0.5. A student says "so the model gives a 50% chance of Gentoo". What is wrong?`, [
  ['z is the log odds, not a probability; p = σ(0.5) ≈ 0.622. A 50% chance corresponds to z = 0.', 1, 'Lecture pp. 40 to 43.'],
  ['Nothing; z = 0.5 means 50%.', 0, 'Score and probability are different quantities.', 'score-prob'],
  ['The probability is 1 − 0.5 = 0.5 for Adélie, so 50% is right.', 0, 'Probabilities come from σ(z), not from z itself.', 'score-prob'],
  ['z must be multiplied by 100 to get a percentage.', 0, 'That would give 50%, which is still wrong.']]);
NUM('l6-sigmoid-n3', 'l6-sigmoid', 2, `A model gives p = 0.731. What score z = ln(p ÷ (1 − p)) produced it? Give two decimals.`, Math.log(0.731 / 0.269),
  `<p>Odds = 0.731 ÷ 0.269 ≈ 2.717 ≈ e, so z = ln(2.717) ≈ <b>1.00</b>, matching the table on p. 24 (z = 1 gives 0.731).</p>`, {tol: 0.01});

NUM('l6-logloss-t', 'l6-logloss', 2, `A model gives p = 0.9 (Gentoo), but the penguin was recorded Adélie (y = 0). What is its log loss?`, -Math.log(1 - 0.9),
  `<p>For y = 0, ℓ = −ln(1 − p) = −ln(0.1) ≈ <b>2.303</b>. Confident and wrong is expensive.</p>`,
  {tryIt: true, wrong: [[-Math.log(0.9), 'logloss-branch', 'You used −ln p, the y = 1 branch. For y = 0 use −ln(1 − p).'], [1, 'log-base', 'That is −log₁₀(0.1). The lecture uses the natural log.']]});
MC('l6-logloss-c1', 'l6-logloss', 'prediction', 2, `A penguin is recorded Gentoo. Model A gives p = 0.6; model B gives p = 0.99. Both predict the correct class. Which statement is right?`, [
  ['B has lower loss (about 0.010 versus 0.511); A\'s loss is not zero despite the correct class.', 1, 'ℓ = −ln p; only p = 1 gives zero loss.'],
  ['Both have zero loss because both classes are correct.', 0, 'Lecture 7 recap (p. 2): "A correct class prediction always has 0 log loss" is false.'],
  ['A has lower loss because it is less overconfident.', 0, 'For the true class, more confidence means lower loss.'],
  ['They have equal loss because both exceed 0.5.', 0, 'Log loss depends on p itself, not just the predicted class.']]);
NUM('l6-logloss-n2', 'l6-logloss', 2, `Two penguins: a Gentoo with p = 0.9 and an Adélie with p = 0.2. What is the average log loss?`, (-Math.log(0.9) - Math.log(0.8)) / 2,
  `<p>Gentoo: −ln 0.9 ≈ 0.105. Adélie: −ln(1 − 0.2) = −ln 0.8 ≈ 0.223. Average = (0.105 + 0.223) ÷ 2 ≈ <b>0.164</b>.</p>`, {src: 'extra', wrong: [[(-Math.log(0.9) - Math.log(0.2)) / 2, 'logloss-branch', 'For the Adélie (y = 0) use −ln(1 − 0.2), not −ln 0.2.']]});
MC('l6-logloss-f1', 'l6-logloss', 'formula', 1, `You are fitting a classifier whose outputs are probabilities, using recorded 0/1 labels. Which training loss does the course use?`, [
  ['Average log loss −(1/n)Σ[y ln p + (1 − y) ln(1 − p)].', 1, 'Lecture p. 46; fit with gradient descent.'],
  ['Mean squared error between p and y.', 0, 'Lecture 7 recap: "Logistic regression uses squared error" is false.'],
  ['0-1 error of the thresholded predictions.', 0, 'Not differentiable.', 'sign-diff'],
  ['Mean absolute error.', 0, 'Not the course\'s classification loss.']]);

NUM('l6-gradient-t', 'l6-gradient', 2, `Lecture example (p. 56): x = (−1, 0, 1), y = (0, 0, 1), b = w = 0, so g_w = −1/3. With learning rate η = 0.6 instead of 0.3, what is w_new?`, 0 - 0.6 * (-1 / 3),
  `<p>w_new = w − η g_w = 0 − 0.6 × (−1/3) = <b>0.2</b>. Doubling η doubles the step (0.1 in the lecture).</p>`, {tryIt: true, wrong: [[-0.2, 'gd-sign', 'Subtract η g_w: 0 − 0.6(−1/3) = +0.2.']]});
NUM('l6-gradient-n2', 'l6-gradient', 1, `One penguin: p = 0.8, y = 1, x = 0.5 (lecture p. 53). What is ∂ℓ/∂w?`, (0.8 - 1) * 0.5,
  `<p>∂ℓ/∂w = (p − y)x = (0.8 − 1)(0.5) = <b>−0.1</b>. Also ∂ℓ/∂b = −0.2.</p>`, {wrong: [[0.1, 'grad-sign-py', 'You used y − p. The gradient is (p − y)x.'], [-0.2, 'grad-sign-py', '−0.2 is ∂ℓ/∂b. For w multiply by x = 0.5.']]});
MC('l6-gradient-c1', 'l6-gradient', 'prediction', 2, `One training row has x = 2, y = 0 (Adélie) and the current model gives p = 0.9. Considering only this row, what does gradient descent do to w?`, [
  ['Decrease w: (p − y)x = 0.9 × 2 = 1.8 > 0, and the update subtracts η × 1.8.', 1, 'The model is too confident in Gentoo for a large x, so w must fall.'],
  ['Increase w, because p is high.', 0, 'A high p for an Adélie is an error to correct downward.', 'grad-sign-py'],
  ['Leave w alone; only b changes.', 0, 'Both b and w have nonzero gradients here.'],
  ['Increase w by 1.8 exactly.', 0, 'The step is η × 1.8, and its direction is down.', 'gd-sign']]);
MC('l6-gradient-f1', 'l6-gradient', 'formula', 1, `Which expression is dℓ/dz for log loss with p = σ(z)?`, [
  ['p − y', 1, 'Lecture p. 52, for both labels.'],
  ['y − p', 0, 'Sign flipped.', 'grad-sign-py'],
  ['p(1 − p)', 0, 'That is dp/dz.'],
  ['−ln p', 0, 'That is the loss itself for y = 1.']]);

NUM('l6-eval-t', 'l6-eval', 1, `Penguin test results with Gentoo as positive: TP = 32, FP = 2, FN = 5, TN = 44. What is the recall?`, 32 / 37,
  `<p>Recall = TP ÷ (TP + FN) = 32 ÷ (32 + 5) = 32 ÷ 37 ≈ <b>0.865</b>: of the recorded Gentoo, 86.5% were found.</p>`, {tryIt: true, wrong: [[32 / 34, 'precision-recall', '32 ÷ 34 is precision (TP + FP). Recall divides by actual positives, TP + FN.']]});
NUM('l6-eval-n2', 'l6-eval', 1, `Same penguin test results. What is the precision?`, 32 / 34,
  `<p>Precision = TP ÷ (TP + FP) = 32 ÷ 34 ≈ <b>0.941</b>: of the birds predicted Gentoo, 94.1% were Gentoo.</p>`, {wrong: [[32 / 37, 'precision-recall', '32 ÷ 37 is recall. Precision divides by predicted positives, TP + FP.']]});
MC('l6-eval-c1', 'l6-eval', 'prediction', 2, `After fitting (b ≈ −1.639, w ≈ 4.002), you lower the decision threshold from 0.5 to 0.3. What changes?`, [
  ['More penguins are predicted Gentoo; b, w and every p stay the same.', 1, 'Lecture 7 recap: changing the threshold does not change fitted coefficients.'],
  ['b and w are refit to match the new threshold.', 0, 'The threshold is applied after fitting.', 'threshold-coef'],
  ['Every predicted probability increases.', 0, 'p depends only on b, w and x.', 'threshold-coef'],
  ['Nothing changes.', 0, 'Penguins with 0.3 ≤ p < 0.5 switch to Gentoo.']]);
NUM('l6-eval-n3', 'l6-eval', 3, `For the fitted model b ≈ −1.639, w ≈ 4.002 with x = (mass − 4000) ÷ 1000, at what body mass (in grams) is p = 0.5?`, 4000 + 1000 * 1.639 / 4.002,
  `<p>p = 0.5 when z = 0: −1.639 + 4.002x = 0, so x = 1.639 ÷ 4.002 ≈ 0.4096. Mass = 4000 + 1000 × 0.4096 ≈ <b>4410</b> g. Heavier birds are predicted Gentoo.</p>`, {src: 'extra', tol: 2});

/* ======================= Lecture 7 ======================= */
NUM('l7-multi-t', 'l7-multi', 2, `Using ŷ ≈ −4215.86 + 26.37x₁ + 75.27x₂ (x₁ flipper mm, x₂ bill mm), predict the body mass of penguin row 6: flipper 190 mm, bill 39.3 mm.`, -4215.86 + 26.37 * 190 + 75.27 * 39.3,
  `<p>Flipper: 26.37 × 190 = 5010.3. Bill: 75.27 × 39.3 ≈ 2958.1. ŷ ≈ −4215.86 + 5010.3 + 2958.1 ≈ <b>3752.6</b> g. Recorded mass 3650 g, so r = ŷ − y ≈ +102.6 g.</p>`, {tryIt: true, tol: 1});
MC('l7-multi-c1', 'l7-multi', 'concept', 1, `In ŷ ≈ −4215.86 + 26.37x₁ + 75.27x₂, what does 75.27 mean?`, [
  ['Predicted mass rises 75.27 g per extra mm of bill length, with flipper length held fixed.', 1, 'Lecture p. 40.'],
  ['Bill length matters about three times as much as flipper length.', 0, 'Coefficient size depends on units and ranges.', 'units-importance'],
  ['A penguin with a 1 mm bill weighs 75.27 g.', 0, 'The intercept and flipper term also contribute.'],
  ['Mass rises 75.27 g per mm of bill regardless of how flipper length changes.', 0, 'The interpretation holds other features fixed.', 'holding-fixed']]);
NUM('l7-multi-n2', 'l7-multi', 2, `Penguin row 3: flipper 195 mm, bill 40.3 mm, recorded mass 3250 g. Using Lecture 7's residual r = ŷ − y, compute r.`, (-4215.86 + 26.37 * 195 + 75.27 * 40.3) - 3250,
  `<p>ŷ ≈ −4215.86 + 5142.15 + 3033.38 ≈ 3959.7 g. r = ŷ − y ≈ 3959.7 − 3250 ≈ <b>709.7</b> g: the model overpredicts this bird.</p>`, {src: 'extra', tol: 1, wrong: [[3250 - (-4215.86 + 26.37 * 195 + 75.27 * 40.3), 'residual-sign', 'Lecture 7 uses r = ŷ − y, the opposite of Lecture 4.']]});

NUM('l7-boundary-t', 'l7-boundary', 2, `For z = −0.2 + 1.4x₁ + x₂, find x₂ on the decision boundary when x₁ = 0.1.`, 0.2 - 1.4 * 0.1,
  `<p>Boundary: x₂ = −b/w₂ − (w₁/w₂)x₁ = 0.2 − 1.4x₁ = 0.2 − 0.14 = <b>0.06</b>. In real units: a 4100 g penguin with a 40.6 mm bill gets p = 0.5.</p>`, {tryIt: true});
MC('l7-boundary-c1', 'l7-boundary', 'prediction', 2, `Multiply b, w₁ and w₂ all by 2. What happens to the decision boundary?`, [
  ['It stays exactly where it is; z doubles but its sign never changes.', 1, 'Lecture 8 recap (p. 3) item 10 is false.'],
  ['It moves twice as far from the origin.', 0, 'b/w₂ and w₁/w₂ are unchanged.', 'scale-all'],
  ['It rotates by 90 degrees.', 0, 'The ratio w₁/w₂ sets the orientation and is unchanged.', 'scale-all'],
  ['It disappears.', 0, 'z = 0 still defines a line.']]);
MC('l7-boundary-c2', 'l7-boundary', 'concept', 2, `For z = x₁ + 2x₂ − 2, how does z change if you move from a point on the boundary by (Δx₁, Δx₂) = (2, −1), and by (1, 2)?`, [
  ['0 along (2, −1), which lies along the boundary; 5 along (1, 2), the direction of w.', 1, 'Δz = 1(2) + 2(−1) = 0 and 1(1) + 2(2) = 5 (p. 29).'],
  ['5 along (2, −1); 0 along (1, 2).', 0, 'w = (1, 2) is perpendicular to the boundary, not along it.', 'boundary-normal'],
  ['Both change z by 0.', 0, 'Moving along w changes z fastest.'],
  ['Both change z by the same nonzero amount.', 0, 'Compute Δz = w₁Δx₁ + w₂Δx₂ for each.']]);
NUM('l7-boundary-n2', 'l7-boundary', 2, `With illustrative coefficients b = −0.2, w₁ = 1.4, w₂ = 1, x₁ = (mass − 4000) ÷ 1000 and x₂ = (bill − 40) ÷ 10, what Gentoo probability does a 5000 g penguin with a 50 mm bill get?`, sigmoid(-0.2 + 1.4 + 1),
  `<p>x₁ = 1 and x₂ = 1. z = −0.2 + 1.4 + 1 = 2.2. p = 1 ÷ (1 + e^(−2.2)) ≈ <b>0.900</b>.</p>`, {src: 'extra', wrong: [[2.2, 'score-prob', '2.2 is z. Apply the sigmoid.']]});

NUM('l7-general-t', 'l7-general', 2, `Regression with x = (1, 2), y = (3, 5), current θ₀ = 0, θ₁ = 1. Using r_i = ŷ_i − y_i and g₁ = (2/n)Σ r_i x_i, compute g₁.`, (2 / 2) * ((1 - 3) * 1 + (2 - 5) * 2),
  `<p>ŷ = 1, 2. r = ŷ − y = −2, −3. Σ r_i x_i = (−2)(1) + (−3)(2) = −8. g₁ = (2/2)(−8) = <b>−8</b>. Negative, so θ₁ will increase.</p>`, {src: 'extra', tryIt: true, wrong: [[8, 'residual-sign', 'With r = ŷ − y the residuals here are negative.'], [-4, 'grad-factor', 'Squared error carries a factor 2: g₁ = (2/n)Σ r x.']]});
MC('l7-general-c1', 'l7-general', 'formula', 1, `Which is the classification (log-loss) gradient for coefficient θ_j in Lecture 7?`, [
  ['g_j = (1/n) Σ (p_i − y_i) x_ij', 1, 'Lecture p. 36.'],
  ['g_j = (2/n) Σ (p_i − y_i) x_ij', 0, 'The factor 2 belongs to squared error.', 'grad-factor'],
  ['g_j = (1/n) Σ (y_i − p_i) x_ij', 0, 'Sign flipped.', 'grad-sign-py'],
  ['g_j = (1/n) Σ (p_i − y_i)', 0, 'Missing x_ij (that is the intercept, where x_i0 = 1).']]);
MC('l7-general-c2', 'l7-general', 'prediction', 1, `After computing gradients, g₃ = −0.4. With η = 0.1, what happens to θ₃?`, [
  ['It increases by 0.04.', 1, 'θ₃ − 0.1(−0.4) = θ₃ + 0.04.'],
  ['It decreases by 0.04.', 0, 'Subtracting a negative raises it.', 'gd-sign'],
  ['It increases by 0.4.', 0, 'The step is η × g.'],
  ['It is unchanged.', 0, 'Only g = 0 leaves a coefficient unchanged.']]);

NUM('l7-multiclass-t', 'l7-multiclass', 2, `Three classes have scores z = (0, 1, 3). What softmax probability does the third class get?`, Math.exp(3) / (1 + Math.E + Math.exp(3)),
  `<p>e⁰ = 1, e¹ ≈ 2.718, e³ ≈ 20.086; total ≈ 23.804. p₃ = 20.086 ÷ 23.804 ≈ <b>0.844</b>.</p>`, {src: 'extra', tryIt: true, wrong: [[3 / 4, 'softmax-sum', 'You divided the raw scores (3 ÷ 4). Exponentiate first.']]});
MC('l7-multiclass-c1', 'l7-multiclass', 'formula', 1, `A photo can contain any combination of: penguin, ice, boat. Which output rule fits?`, [
  ['A separate sigmoid per label, each thresholded at 0.5.', 1, 'Multilabel: labels can overlap; probabilities need not sum to 1 (p. 47).'],
  ['Softmax over the three labels, take the largest.', 0, 'Softmax forces exactly one answer.', 'softmax-sum'],
  ['A single sigmoid for "penguin" only.', 0, 'That ignores the other labels.'],
  ['Linear regression on the labels.', 0, 'Outputs can leave [0, 1].']]);
NUM('l7-multiclass-n2', 'l7-multiclass', 1, `Three species have exponentiated scores e^(z_k) = 3, 5 and 12. What probability does the third species get?`, 12 / 20,
  `<p>p = 12 ÷ (3 + 5 + 12) = 12 ÷ 20 = <b>0.6</b>. Same recipe as the lecture\'s 1, 2, 7 → 0.1, 0.2, 0.7.</p>`, {src: 'extra'});

NUM('l7-scaling-t', 'l7-scaling', 1, `Training flipper statistics: mean 202.15 mm, SD 15.23 mm. Standardize a new flipper length of 220 mm.`, (220 - 202.15) / 15.23,
  `<p>u = (220 − 202.15) ÷ 15.23 = 17.85 ÷ 15.23 ≈ <b>1.172</b>: about 1.17 standard deviations above the training mean.</p>`, {src: 'extra', tryIt: true});
MC('l7-scaling-c1', 'l7-scaling', 'mistake', 2, `A student standardizes the 83 test penguins using the test set's own mean and standard deviation. What is wrong?`, [
  ['Test and new inputs must reuse the training mean and SD so they are on the same scale the coefficients were fit on.', 1, 'Lecture p. 51; Lecture 8 recap item 9 is false.'],
  ['Nothing; each set should be standardized on its own.', 0, 'That changes the feature definition between training and test.', 'test-stats'],
  ['They should standardize with the combined training and test data.', 0, 'That leaks test information into training.', 'leakage'],
  ['Standardization should only be applied to training data.', 0, 'Every input must use the same transformation.']]);
NUM('l7-scaling-n2', 'l7-scaling', 1, `A flipper coefficient is 26.37 g per mm. If flipper length is measured in centimeters instead, what is the coefficient in g per cm?`, 26.37 * 10,
  `<p>x_cm = x_mm ÷ 10, so θ_cm = 10 θ_mm = <b>263.7</b> g per cm. The contribution is unchanged: 263.7 × 18.1 ≈ 4773 g.</p>`, {wrong: [[2.637, 'units-importance', 'A bigger unit needs a bigger coefficient to give the same grams.']]});

NUM('l7-poly-t', 'l7-poly', 2, `With two inputs x₁, x₂ and all polynomial features up to degree 3 (no intercept counted), how many features are there?`, 2 + 3 + 4,
  `<p>Degree 1: x₁, x₂ (2). Degree 2 adds x₁², x₁x₂, x₂² (3). Degree 3 adds x₁³, x₁²x₂, x₁x₂², x₂³ (4). Total <b>9</b>, plus an intercept gives 10 coefficients.</p>`, {tryIt: true, int: true});
MC('l7-poly-c1', 'l7-poly', 'concept', 1, `Is ĥ = b + w₁t + w₂t² a linear model?`, [
  ['Yes: it is linear in its coefficients; t² is just another feature column.', 1, 'Lecture 8 recap item 1 ("nonlinear in its coefficients") is false.'],
  ['No: squaring makes the model nonlinear in its coefficients.', 0, 'The curve comes from the feature, not from the coefficients.', 'poly-nonlinear'],
  ['Only if w₂ = 0.', 0, 'Linearity in coefficients holds for any w₂.', 'poly-nonlinear'],
  ['No: it needs gradient descent.', 0, 'Least squares still has a closed form here.']]);
MC('l7-poly-c2', 'l7-poly', 'prediction', 2, `You raise the polynomial degree from 2 to 16 for noisy ball-height data. What typically happens?`, [
  ['Training error keeps falling while error on new observations rises (variance grows).', 1, 'Lecture p. 59: too flexible fits noise.'],
  ['Both training and new-observation error fall.', 0, 'Lower training error does not imply lower error on new data.', 'train-loss-better'],
  ['Bias increases.', 0, 'Bias falls as flexibility grows; variance rises.'],
  ['Nothing; degree does not matter once the curve fits.', 0, 'High degrees chase noise.']]);
NUM('l7-poly-n2', 'l7-poly', 1, `For ŷ = x₁x₂ with x₂ = 5, by how much does ŷ change when x₁ goes from 2 to 3?`, 3 * 5 - 2 * 5,
  `<p>ŷ goes from 2 × 5 = 10 to 3 × 5 = 15, a change of <b>5</b> = x₂. The effect of x₁ depends on x₂: that is what an interaction term does.</p>`, {src: 'extra'});

NUM('l7-signal-t', 'l7-signal', 2, `Centered audio samples a = (0.4, −0.2, −0.3, 0.3, −0.2). Compute the zero-crossing rate Z = #{t : a_t a_(t−1) < 0} ÷ (T − 1).`, 3 / 4,
  `<p>Pairs: (0.4, −0.2) change, (−0.2, −0.3) none, (−0.3, 0.3) change, (0.3, −0.2) change. 3 changes over T − 1 = 4 pairs: Z = <b>0.75</b>.</p>`, {src: 'extra', tryIt: true, wrong: [[3 / 5, 'zcr-denominator', 'Divide by T − 1 = 4 neighboring pairs, not T = 5.']]});
NUM('l7-signal-n2', 'l7-signal', 1, `A 2 × 2 image has brightness r = [[16, 0], [8, 0]] on a 0 to 16 scale. Compute the ink density D = (1/HW) Σ w_ab with w = r ÷ 16.`, (1 + 0 + 0.5 + 0) / 4,
  `<p>w = [[1, 0], [0.5, 0]], total 1.5. D = 1.5 ÷ 4 = <b>0.375</b>.</p>`, {src: 'extra'});
NUM('l7-signal-n3', 'l7-signal', 1, `Same 2 × 2 image. Compute the left-right balance B = (L − R) ÷ (L + R).`, (1.5 - 0) / 1.5,
  `<p>Left column ink L = 1 + 0.5 = 1.5; right column R = 0. B = 1.5 ÷ 1.5 = <b>1</b>: all ink on the left.</p>`, {src: 'extra'});
MC('l7-signal-c1', 'l7-signal', 'concept', 2, `Why might five audio summaries (energy shape, zero-crossing rate) beat 64,000 raw samples as inputs to a linear classifier?`, [
  ['Good summaries capture the signal in a few numbers, keeping variance low; raw samples give a huge, noisy feature space.', 1, 'Lecture p. 60: useful complexity captures signal and limits variance.'],
  ['Linear models cannot accept more than 10 inputs.', 0, 'They can accept any number.'],
  ['Raw samples contain no information.', 0, 'They contain everything, but not in a form a linear model can use well.'],
  ['Summaries always increase training accuracy.', 0, 'They may lower training fit while generalizing better.', 'train-loss-better']]);

/* ======================= Lecture 8 ======================= */
NUM('l8-text-t', 'l8-text', 1, `"cat" is [99, 97, 116] and "car" is [99, 97, 114] in ASCII. What is their Euclidean distance?`, 2,
  `<p>Differences 0, 0, 2. d = √(0 + 0 + 4) = <b>2</b>. Small distance, unrelated meanings.</p>`, {src: 'extra', tryIt: true});
MC('l8-text-c1', 'l8-text', 'concept', 1, `ASCII distance gives 78.4 between "Loved it." and "LOVED IT." but only 14.7 between "Loved it." and "Hated it." (p. 30). What is the lesson?`, [
  ['Character-code distance does not measure difference in meaning.', 1, 'Case changes every code by 32; sentiment changes only three characters.'],
  ['Uppercase text has opposite sentiment.', 0, 'Both messages are positive.', 'codes-meaning'],
  ['ASCII distance is a good sentiment feature.', 0, 'It ranks the wrong pair as closer.', 'codes-meaning'],
  ['Distances between texts can never be computed.', 0, 'They can; this one just measures the wrong thing.']]);
NUM('l8-text-n2', 'l8-text', 2, `Compute the ASCII distance between "Loved it." [76, 111, 118, 101, 100, 32, 105, 116, 46] and "Hated it." [72, 97, 116, 101, 100, 32, 105, 116, 46].`, Math.sqrt(216),
  `<p>Differences 4, 14, 2, then all 0. d = √(16 + 196 + 4) = √216 ≈ <b>14.70</b> (p. 30).</p>`);

NUM('l8-nextword-t', 'l8-nextword', 1, `Example texts: a cup of coffee; a cup of tea; a cup of coffee; a cup of water. Estimate P(tea | a cup of).`, 1 / 4,
  `<p>"a cup of" appears 4 times; once it is followed by "tea". P = 1 ÷ 4 = <b>0.25</b>.</p>`, {tryIt: true, wrong: [[1 / 16, 'cond-denominator', 'Divide by the 4 times the context appeared, not by all 16 words.']]});
MC('l8-nextword-c1', 'l8-nextword', 'mistake', 1, `In the four "a cup of" sentences (16 words), a student computes P(coffee | a cup of) = 2 ÷ 16. What is the error?`, [
  ['The denominator should be the 4 occurrences of the context, giving 2 ÷ 4 = 0.5.', 1, 'Lecture p. 36.'],
  ['The numerator should be 4.', 0, 'Coffee followed the context twice.'],
  ['2 ÷ 16 is right because probabilities use total word count.', 0, 'That is a unigram-style share, not a conditional probability.', 'cond-denominator'],
  ['Next-word probabilities cannot be estimated from four sentences.', 0, 'They can; they are just noisy.']]);

MC('l8-nextword-c2', 'l8-nextword', 'prediction', 2, `Add a fifth example text, "a cup of tea", to the four lecture sentences. What happens to P(coffee | a cup of)?`, [
  ['It falls from 2/4 = 0.5 to 2/5 = 0.4.', 1, 'The denominator counts every time the context appears; the numerator is unchanged.'],
  ['It stays 0.5: coffee still appears twice.', 0, 'The denominator grew to 5.', 'cond-denominator'],
  ['It rises because there is more data.', 0, 'More data does not raise the share of coffee here.'],
  ['It becomes 2/20 = 0.1.', 0, 'Divide by occurrences of the context, not by all words.', 'cond-denominator']]);
NUM('l8-markov-t', 'l8-markov', 1, `Onegin pair counts: after a consonant, 7,534 vowels and 3,827 consonants follow. Estimate P(C | C).`, 3827 / 11361,
  `<p>Row total 7,534 + 3,827 = 11,361. P(C | C) = 3,827 ÷ 11,361 ≈ <b>0.3369</b> (p. 59).</p>`, {tryIt: true, wrong: [[3827 / 20000, 'cond-denominator', 'Divide by the consonant row total (11,361), not all 20,000 letters.']]});
NUM('l8-markov-n2', 'l8-markov', 2, `If Onegin letters were independent, how many of the 19,999 adjacent pairs would be vowel-vowel? (P(V) = 8,638 ÷ 20,000.)`, 19999 * Math.pow(8638 / 20000, 2),
  `<p>P(VV) = P(V)² = 0.4319² ≈ 0.1865. Expected count = 19,999 × 0.1865 ≈ <b>3,731</b> (precisely 3,730.57). Observed: 1,104 (p. 53).</p>`, {tol: 1.5});
MC('l8-markov-c1', 'l8-markov', 'concept', 1, `Current state C, P(V | C) = 0.6631, and the uniform draw is u = 0.7. Using the lecture's rule (V if u falls in [0, P(V | C))), what is the next state?`, [
  ['C, because 0.7 ≥ 0.6631.', 1, 'From C, [0, 0.6631) means V and [0.6631, 1] means C (p. 61).'],
  ['V, because 0.7 is large.', 0, 'Large draws fall in the C part of the interval here.'],
  ['V, because the previous state was C.', 0, 'The draw decides, using the C row.'],
  ['It depends on the full history.', 0, 'A one-step chain uses only the current state.', 'markov-history']]);
MC('l8-markov-c2', 'l8-markov', 'concept', 1, `What does a one-step Markov model assume?`, [
  ['P(next | complete history) ≈ P(next | current state).', 1, 'Lecture p. 58.'],
  ['Each letter is independent of all previous letters.', 0, 'That is the independent model, which ignores the current state.'],
  ['The next state depends on the whole history.', 0, 'That is what the Markov assumption removes.', 'markov-history'],
  ['Vowels and consonants are equally likely.', 0, 'Onegin has P(V) = 0.4319.']]);
MC('l8-markov-m1', 'l8-markov', 'mistake', 2, `A student estimates P(V | C) for Onegin as 7,534 ÷ 20,000 ≈ 0.377. What went wrong?`, [
  ['The denominator must be the consonant row total, 11,361, giving 0.6631.', 1, 'Conditional on the current type C, divide by pairs that start with C.'],
  ['The numerator should be 1,104.', 0, '1,104 is the VV count.'],
  ['Nothing; conditional probabilities divide by the total sample.', 0, 'That gives a joint share, not a conditional probability.', 'cond-denominator'],
  ['They should have divided by 8,638.', 0, '8,638 is the vowel row total.', 'cond-denominator']]);

NUM('l8-chorus-t', 'l8-chorus', 1, `In one chorus, 80 consonants have a next letter, and 48 of them are followed by a vowel. Estimate P(V | C).`, 48 / 80,
  `<p>P(V | C) = 48 ÷ 80 = <b>0.6</b>, matching the chorus chain (p. 70).</p>`, {tryIt: true});
MC('l8-chorus-c1', 'l8-chorus', 'concept', 1, `What does shuffling the letters of the chorus keep, and what does it change?`, [
  ['It keeps the counts of vowels and consonants and changes the neighboring pair frequencies.', 1, 'Lecture p. 68: same 3 V and 2 C, different pairs.'],
  ['It keeps the pair frequencies and changes the vowel count.', 0, 'Reversed.'],
  ['It changes both.', 0, 'Shuffling only reorders letters.'],
  ['It changes neither.', 0, 'Pairs depend on order (V after V: 17.5% original versus 36.2% shuffled).']]);
NUM('l8-chorus-n2', 'l8-chorus', 1, `Letter types V C C V V C V. What is the running vowel frequency after all 7 types?`, 4 / 7,
  `<p>Vowels: positions 1, 4, 5, 7 (4 of 7). Running frequency = 4 ÷ 7 ≈ <b>0.571</b>.</p>`, {src: 'extra'});
MC('l8-chorus-c2', 'l8-chorus', 'concept', 2, `A Markov chain and independent draws both produce running vowel shares that settle near 0.4212 (p. 73). What does this show?`, [
  ['Stable averages do not require independence.', 1, 'This is Markov\'s counterexample to Nekrasov.'],
  ['The chorus letters are independent.', 0, 'Pair frequencies show strong dependence.'],
  ['The Markov chain is the same as independent draws.', 0, 'They share the long-run share but generate very different neighbors.'],
  ['Free will is disproved.', 0, 'The lecture tests a statistical claim, not free will.']]);

NUM('l8-ngram-t', 'l8-ngram', 2, `Using the song counts: P(never) = 40/430, P(gonna | never) = 40/40, P(give | never gonna) = 10/40. What is P(never, gonna, give)?`, (40 / 430) * (40 / 40) * (10 / 40),
  `<p>Chain rule: (40/430)(40/40)(10/40) ≈ 0.0930 × 1 × 0.25 ≈ <b>0.0233</b>.</p>`, {tryIt: true, wrong: [[40 / 430 + 1 + 0.25, 'prob-multiply', 'Multiply the next-token probabilities; do not add them.']]});
MC('l8-ngram-c1', 'l8-ngram', 'concept', 1, `Which model is P(x_t | x_(t−1))?`, [
  ['Bigram: one previous token.', 1, 'Lecture p. 81.'],
  ['Unigram.', 0, 'Unigram uses no previous token: P(x_t).', 'ngram-order'],
  ['Trigram.', 0, 'Trigram conditions on two previous tokens.', 'ngram-order'],
  ['Autoregressive with full history.', 0, 'Full history conditions on x_1, …, x_(t−1).']]);
MC('l8-ngram-c2', 'l8-ngram', 'mistake', 1, `A student computes P(give you up | never gonna) = 10/40 + 6/10 + 6/6 = 1.85. What is wrong?`, [
  ['Next-token probabilities multiply: (10/40)(6/10)(6/6) = 0.15.', 1, 'Lecture p. 94. A probability above 1 is already a red flag.'],
  ['The denominators should all be 430.', 0, 'Each step conditions on its own prefix.', 'cond-denominator'],
  ['Only the first probability matters.', 0, 'Every position contributes a factor.'],
  ['The answer should be divided by 3.', 0, 'Averaging is still wrong; multiply.', 'prob-multiply']]);
NUM('l8-ngram-n2', 'l8-ngram', 1, `In the song, "you" appears 44 times among 430 word tokens. What is the unigram probability P(you)?`, 44 / 430,
  `<p>P(you) = 44 ÷ 430 ≈ <b>0.102</b>. Unigram probabilities ignore previous words (p. 86).</p>`);
MC('l8-ngram-f1', 'l8-ngram', 'formula', 1, `You want the probability of the next character given the previous two characters. Which model?`, [
  ['Trigram: P(x_t | x_(t−2), x_(t−1)).', 1, 'Two previous tokens.'],
  ['Bigram.', 0, 'Bigram uses one previous token.', 'ngram-order'],
  ['Unigram.', 0, 'No context.', 'ngram-order'],
  ['Softmax over the alphabet with no context.', 0, 'That ignores the context entirely.']]);

NUM('l8-music-t', 'l8-music', 2, `ILLIAC weights: interval 0 has weight 13 and interval 7 has weight 11 (total 91). After a previous interval of 0, what is P(7 | 0)?`, (11 + 13 - 1) / (91 + 13 * 12),
  `<p>Next weight 11 + 13 − 1 = 23. Denominator 91 + 13(13 − 1) = 247. P(7 | 0) = 23 ÷ 247 ≈ <b>0.0931</b>.</p>`, {src: 'extra', tryIt: true, wrong: [[23 / 91, 'cond-denominator', 'The denominator depends on the previous interval: 91 + 13(w_prev − 1) = 247.']]});
NUM('l8-music-n2', 'l8-music', 2, `After a previous interval of 6 (weight 1), what is P(12 | 6)? Interval 12 has weight 12.`, (12 + 1 - 1) / (91 + 13 * 0),
  `<p>Next weight 12 + 1 − 1 = 12; denominator 91 + 13(0) = 91. P(12 | 6) = 12 ÷ 91 ≈ <b>0.132</b>.</p>`, {src: 'extra'});
MC('l8-music-c1', 'l8-music', 'concept', 2, `Why is the denominator 247 after a previous interval of 0 but 91 after a previous interval of 6?`, [
  ['Each of the 13 possible next intervals gets an extra w_prev − 1: 13 × 12 = 156 extra for interval 0, 0 extra for interval 6.', 1, '91 + 13(w_prev − 1).'],
  ['There are more possible intervals after 0.', 0, 'There are always 13.'],
  ['The weights are renormalized randomly.', 0, 'The rule is deterministic.'],
  ['Interval 6 is never followed by a repeat.', 0, 'P(0 | 6) ≈ 0.143.']]);

NUM('l8-bpe-t', 'l8-bpe', 1, `After learning the three merges p + l → pl, pl + a → pla, pla + y → play, how many tokens does "replaying" become?`, 6,
  `<p>r e p l a y i n g → r e pl a y i n g → r e pla y i n g → r e play i n g: <b>6</b> tokens (r, e, play, i, n, g).</p>`, {tryIt: true, int: true});
MC('l8-bpe-c1', 'l8-bpe', 'mistake', 2, `A tokenizer was trained on play, player, playing, replay (merges pl, pla, play). To tokenize "display", a student counts the pairs inside "display" and merges its most frequent pair. What is wrong?`, [
  ['Applying a trained tokenizer replays the learned merges in order; it never recounts pairs in the new word. "display" becomes d i s play.', 1, 'Lecture p. 109.'],
  ['They should count pairs across the whole new sentence instead.', 0, 'Still recounting.', 'bpe-recount'],
  ['Nothing; BPE always recounts on new text.', 0, 'Counting happens only during learning.', 'bpe-recount'],
  ['"display" cannot be tokenized because it was not in training.', 0, 'Known pieces can represent unseen words.']]);
MC('l8-bpe-c2', 'l8-bpe', 'concept', 2, `Training words "same" and "sea" give pair counts s + a, a + m, m + e, s + e, e + a, each 1. Using the lecture tool's tie rule, which pair merges first?`, [
  ['s + a, the first pair in the training words.', 1, 'Equal counts: first pair in the training words (p. 108).'],
  ['a + m, because it comes first alphabetically.', 0, 'The lecture\'s rule is order of appearance, not alphabetical.', 'bpe-tie'],
  ['e + a, because it appears last.', 0, 'First appearance wins.', 'bpe-tie'],
  ['None; ties stop the algorithm.', 0, 'Ties are broken, not skipped.']]);
NUM('l8-bpe-n2', 'l8-bpe', 2, `The fourth merge learned from play, player, playing, replay is play + e → playe. After four merges, how many tokens is "player"?`, 2,
  `<p>p l a y e r → pl a y e r → pla y e r → play e r → playe r: <b>2</b> tokens.</p>`, {src: 'extra', int: true});

NUM('l8-wordvec-t', 'l8-wordvec', 2, `Relative-frequency rows over (treated, checked, examined, repaired): doctor (0.5, 0.25, 0.25, 0), mechanic (0, 0.25, 0.25, 0.5). What is their Euclidean distance?`, Math.sqrt(0.5),
  `<p>Differences 0.5, 0, 0, −0.5. d = √(0.25 + 0 + 0 + 0.25) = √0.5 ≈ <b>0.707</b>. Doctor and nurse are closer (≈ 0.354).</p>`, {src: 'extra', tryIt: true});
MC('l8-wordvec-c1', 'l8-wordvec', 'concept', 1, `Why convert context count rows into relative frequencies before comparing words?`, [
  ['So words with different numbers of examples are comparable; a frequent word otherwise looks far from everything.', 1, 'Lecture p. 118 divides by the number of examples.'],
  ['Relative frequencies make every row identical.', 0, 'They keep the pattern of use.'],
  ['Counts cannot be compared with Euclidean distance.', 0, 'They can, but frequency differences dominate.'],
  ['To make the columns sum to 1.', 0, 'Each row sums to 1, not each column.', 'cond-denominator']]);
NUM('l8-wordvec-n2', 'l8-wordvec', 2, `Count rows: doctor (2, 1, 1, 0), nurse (1, 2, 1, 0). What is their cosine similarity?`, 5 / 6,
  `<p>Dot = 2 + 2 + 1 + 0 = 5. Lengths √6 and √6. Cosine = 5 ÷ 6 ≈ <b>0.833</b>.</p>`, {src: 'extra'});

/* ======================= Lecture 9 ======================= */
NUM('l9-dtm-t', 'l9-dtm', 1, `Brown University's row is the 30, and 12, dartmouth 0 (329 tokens). If its text were repeated 3 times, what would its "and" count be?`, 36,
  `<p>Every count triples: 12 × 3 = <b>36</b>. The length triples too (987 tokens), so TF("and") stays 12 ÷ 329.</p>`, {src: 'extra', tryIt: true, int: true});
MC('l9-dtm-c1', 'l9-dtm', 'concept', 1, `The Dartmouth introduction has 296 word tokens; the document-term matrix has 21,970 columns. What is 21,970?`, [
  ['The number of distinct vocabulary terms across all 998 articles.', 1, 'Lecture p. 27.'],
  ['The number of word tokens in all 998 articles.', 0, 'Tokens count every occurrence; columns are distinct terms.', 'tokens-vocab'],
  ['The number of distinct words in the Dartmouth article.', 0, 'That is at most 296.', 'tokens-vocab'],
  ['The number of articles.', 0, 'There are 998 rows.']]);
MC('l9-dtm-c2', 'l9-dtm', 'prediction', 2, `An article is repeated three times. Which of these change: its raw counts, its TF values, the collection's IDF values, its cosine similarity to another article?`, [
  ['Only the raw counts (and so the vector length) change.', 1, 'TF divides by a length that also triples; DF still counts the article once; cosine ignores scale.'],
  ['Raw counts and TF.', 0, 'TF is count ÷ length; both triple.', 'tf-denominator'],
  ['Raw counts, TF and IDF.', 0, 'DF counts documents containing the term, which is unchanged.', 'df-occurrences'],
  ['All four.', 0, 'Cosine is unchanged by scaling a vector.', 'cosine-length']]);

NUM('l9-tf-t', 'l9-tf', 1, `The Taylor Swift introduction has 419 word tokens, and "and" occurs 18 times. Compute TF("and").`, 18 / 419,
  `<p>TF = 18 ÷ 419 ≈ <b>0.0430</b>, the 4.3% shown on p. 33.</p>`, {tryIt: true, wrong: [[18 / 51, 'tf-denominator', 'You divided by 33 + 18 + 0 = 51, only the shown words. Use all 419 tokens.']]});
NUM('l9-tf-n2', 'l9-tf', 1, `A document contains 296 tokens, and a word occurs 26 times. Calculate its term frequency.`, 26 / 296,
  `<p>TF = C ÷ T = 26 ÷ 296 ≈ <b>0.0878</b>. The numerator is the occurrence count of the word. The denominator is every word token in this document (296). Using 46 (only the three displayed words) or 21,970 (the vocabulary) would be wrong. Meaning: 8.78% of the article\'s words are this word.</p>`,
  {wrong: [[26 / 46, 'tf-denominator', '46 is only the three displayed counts (26 + 11 + 9). TF divides by all 296 tokens.'], [26 / 21970, 'tf-denominator', '21,970 is the vocabulary size, not this document\'s length.'], [26 / 998, 'tf-idf-confuse', '998 is the number of articles; that belongs in IDF, not TF.']]});
MC('l9-tf-m1', 'l9-tf', 'mistake', 1, `A student computes TF("the") for the Dartmouth article as 26 ÷ 21,970. What is the mistake?`, [
  ['The denominator should be the article\'s own token count, 296, not the collection\'s vocabulary size.', 1, 'TF_ij = C_ij ÷ T_i (p. 32).'],
  ['The numerator should be 986, the number of articles containing "the".', 0, 'That is DF.', 'df-occurrences'],
  ['Nothing; TF divides by the vocabulary size.', 0, 'That would make every TF tiny and depend on the collection.', 'tf-denominator'],
  ['They should divide by 998 articles.', 0, 'Articles appear in IDF, not TF.', 'tf-idf-confuse']]);

NUM('l9-idf-t', 'l9-idf', 2, `"college" appears in 71 of the 998 articles (p. 34). Compute its smoothed IDF = 1 + ln((n + 1) ÷ (DF + 1)).`, 1 + Math.log(999 / 72),
  `<p>(998 + 1) ÷ (71 + 1) = 999 ÷ 72 ≈ 13.875. ln(13.875) ≈ 2.630. IDF ≈ 1 + 2.630 = <b>3.630</b>: between "the" (1.012) and "dartmouth" (6.808).</p>`,
  {src: 'extra', tryIt: true, wrong: [[1 + Math.log10(999 / 72), 'log-base', 'You used log base 10. The lecture\'s IDF uses ln.'], [Math.log(998 / 71), 'idf-smoothing', 'Missing the +1 smoothing and the leading 1: IDF = 1 + ln((n + 1) ÷ (DF + 1)).'], [998 / 71, 'idf-smoothing', 'That is the raw inverse coverage n ÷ DF without the log.']]});
MC('l9-idf-c1', 'l9-idf', 'prediction', 2, `A word's document frequency rises from 2 to 500 (n = 998). What happens to its IDF?`, [
  ['It falls from 6.808 to about 1.69.', 1, '1 + ln(999 ÷ 501) ≈ 1 + 0.690 = 1.690.'],
  ['It rises, because the word is more common.', 0, 'More widespread words get less weight.', 'idf-direction'],
  ['It stays the same; IDF depends only on n.', 0, 'IDF depends on DF.'],
  ['It falls to 0.', 0, 'The leading 1 keeps IDF at least 1.', 'idf-smoothing']]);
MC('l9-idf-c2', 'l9-idf', 'concept', 1, `The Dartmouth introduction contains "the" 26 times. How much does this article add to DF("the")?`, [
  ['1: DF counts documents that contain the term.', 1, 'Lecture p. 36: does it contain "the"? → 1.'],
  ['26', 0, 'That is the occurrence count used in TF.', 'df-occurrences'],
  ['26 ÷ 296', 0, 'That is TF.', 'tf-idf-confuse'],
  ['0, because "the" is too common.', 0, 'Common words still count toward DF.']]);
MC('l9-idf-c3', 'l9-idf', 'concept', 2, `Why does IDF use a logarithm of (n + 1) ÷ (DF + 1) rather than the raw ratio?`, [
  ['The log compresses the ratio: rare words still get more weight, but not hundreds of times more, so one rare word does not swamp the vector.', 1, 'Raw ratios: 333 for "dartmouth" versus 1.012 for "the"; with the log, 6.808 versus 1.012.'],
  ['The log makes IDF larger for common words.', 0, 'IDF still falls as DF rises.', 'idf-direction'],
  ['Logs are required to make TF-IDF a probability.', 0, 'TF-IDF is not a probability.'],
  ['The log removes the dependence on n.', 0, 'n still appears inside the log.']], {src: 'extra'});
MC('l9-idf-f1', 'l9-idf', 'formula', 1, `You want to downweight words that appear in nearly every document of a collection. Which quantity provides that weight?`, [
  ['IDF_j = 1 + ln((n + 1) ÷ (DF_j + 1))', 1, 'It is close to 1 for widespread words and large for rare ones.'],
  ['TF_ij = C_ij ÷ T_i', 0, 'TF measures share within one document.', 'tf-idf-confuse'],
  ['The raw count C_ij', 0, 'Counts make common words dominate.'],
  ['The unit-length normalization q ÷ ‖q‖', 0, 'That rescales a whole vector, not individual words by rarity.', 'norm-confuse']]);

NUM('l9-tfidf-t', 'l9-tfidf', 2, `Suppose "college" (IDF ≈ 3.630) appeared 3 times in the 296-token Dartmouth introduction. What would its TF-IDF coordinate be?`, (3 / 296) * (1 + Math.log(999 / 72)),
  `<p>TF = 3 ÷ 296 ≈ 0.01014. TF-IDF = 0.01014 × 3.630 ≈ <b>0.0368</b>.</p>`, {src: 'extra', tryIt: true});
MC('l9-tfidf-c1', 'l9-tfidf', 'concept', 1, `In the Dartmouth article, "the" appears 26 times and "dartmouth" 9 times. Which has the larger TF-IDF coordinate?`, [
  ['"dartmouth": 0.2070 versus 0.0889.', 1, 'Its IDF (6.808) outweighs its smaller TF (p. 42).'],
  ['"the", because it appears more often.', 0, 'Frequency within the article is only half of TF-IDF.', 'tf-idf-confuse'],
  ['They are equal after weighting.', 0, 'IDF differs greatly between them.'],
  ['Cannot tell without the vocabulary size.', 0, 'TF needs T = 296 and IDF needs n and DF; the vocabulary size is not needed.']]);
NUM('l9-tfidf-n2', 'l9-tfidf', 1, `"gonna" appears 42 times in the 392-token version of "Never Gonna Give You Up"; its IDF over 30,000 songs is 2.800. Compute its TF-IDF.`, (42 / 392) * 2.8,
  `<p>TF = 42 ÷ 392 ≈ 0.107. TF-IDF = 0.107 × 2.800 ≈ <b>0.300</b> (p. 48).</p>`);
MC('l9-tfidf-m1', 'l9-tfidf', 'mistake', 2, `A student says: "dartmouth has the largest TF-IDF in the Dartmouth article because it appears so often there." What is the error?`, [
  ['Its TF is small (0.0304, less than "the"); the large coordinate comes from its IDF, since only 2 of 998 articles contain it.', 1, 'Fewer occurrences can give a larger TF-IDF coordinate (p. 44).'],
  ['There is no error.', 0, '"dartmouth" occurs 9 times versus 26 for "the".', 'tf-idf-confuse'],
  ['TF-IDF ignores occurrence counts entirely.', 0, 'TF uses the counts.'],
  ['"dartmouth" actually has the smallest TF-IDF.', 0, 'It has the largest, 0.207.']]);

NUM('l9-cosine-t', 'l9-cosine', 2, `Count vectors over [the, and, dartmouth]: Dartmouth [26, 11, 9], Brown University [30, 12, 0]. Compute their cosine similarity.`, (26 * 30 + 11 * 12) / (Math.sqrt(878) * Math.sqrt(1044)),
  `<p>Dot = 780 + 132 + 0 = 912. ‖u‖ = √878 ≈ 29.63; ‖v‖ = √(900 + 144) = √1044 ≈ 32.31. Cosine = 912 ÷ (29.63 × 32.31) ≈ <b>0.953</b>.</p>`, {src: 'extra', tryIt: true, wrong: [[912, 'dot-similarity', 'That is the dot product. Divide by both lengths.']]});
MC('l9-cosine-c1', 'l9-cosine', 'concept', 2, `Why doesn't switching from raw counts to TF change cosine similarity?`, [
  ['TF divides each document\'s whole vector by one number (its token count); that factor scales the dot product and the length equally and cancels.', 1, 'cos(u/T, v/S) = (uᵀv/TS) ÷ (‖u‖‖v‖/TS) = cos(u, v).'],
  ['Because TF and raw counts are the same numbers.', 0, 'TF values are much smaller.'],
  ['Because cosine only uses the IDF.', 0, 'Cosine uses whatever vector you give it.', 'tf-idf-confuse'],
  ['It does change, because longer documents get smaller TF.', 0, 'Each coordinate of one document is divided by the same T, so its direction is unchanged.', 'cosine-length']]);
NUM('l9-cosine-n2', 'l9-cosine', 1, `Dartmouth [26, 11, 9] and Taylor Swift [33, 18, 0]. Compute the dot product.`, 26 * 33 + 11 * 18,
  `<p>26 × 33 + 11 × 18 + 9 × 0 = 858 + 198 + 0 = <b>1056</b> (p. 52).</p>`, {int: true});
MC('l9-cosine-c2', 'l9-cosine', 'prediction', 2, `Repeat the Dartmouth text twice. What happens to its dot product with Taylor Swift, their Euclidean distance, and their cosine similarity?`, [
  ['Dot product doubles, distance changes, cosine stays 0.948.', 1, 'Scaling changes length-based measures only.'],
  ['All three double.', 0, 'Cosine is scale invariant.', 'cosine-length'],
  ['Nothing changes.', 0, 'The dot product and distance depend on length.', 'dot-similarity'],
  ['Cosine doubles.', 0, 'Cosine is at most 1 and ignores scale.', 'cosine-length']]);
MC('l9-cosine-f1', 'l9-cosine', 'formula', 1, `You want to rank articles by similarity to a query so that a long article is not favored just for being long. Which measure?`, [
  ['Cosine similarity uᵀv ÷ (‖u‖‖v‖).', 1, 'It compares directions only.'],
  ['Dot product uᵀv.', 0, 'Grows with document length.', 'dot-similarity'],
  ['Euclidean distance.', 0, 'Also depends on vector lengths.', 'cosine-length'],
  ['Sum of raw counts.', 0, 'That is the length itself.']]);

NUM('l9-genre-t', 'l9-genre', 1, `In "Gorgeous", the normalized input for "you" is 0.2398 and the Pop coefficient for "you" is +0.796. What is its contribution to the Pop score?`, 0.2398 * 0.796,
  `<p>Contribution = coefficient × input = 0.796 × 0.2398 ≈ <b>0.1909</b> (the slide rounds to 0.1908).</p>`, {tryIt: true});
MC('l9-genre-c1', 'l9-genre', 'mistake', 1, `"Gorgeous" gets Rock score 0.069 > 0, so a student predicts Rock. What is wrong?`, [
  ['One-vs-rest predicts the genre with the largest score; Pop (0.284) beats Rock (0.069).', 1, 'Largest score → predicted genre (p. 66).'],
  ['Nothing; any positive score is a prediction.', 0, 'Both Pop and Rock are positive.', 'positive-score'],
  ['The student should predict every genre with a positive score.', 0, 'Genre prediction here is single-label.', 'positive-score'],
  ['Scores must be converted to probabilities before comparing.', 0, 'σ is increasing, so comparing scores gives the same winner.']]);
MC('l9-genre-c2', 'l9-genre', 'mistake', 2, `"gorgeous" has the largest normalized input in the song (0.6488). A student concludes it must raise the Pop score the most. What is wrong?`, [
  ['The contribution is coefficient × input; the Pop coefficient is −0.114, so it contributes −0.0739 and lowers the score.', 1, 'Lecture p. 75.'],
  ['Nothing; large inputs always raise scores.', 0, 'Only if the coefficient is positive.', 'contribution-sign'],
  ['Inputs are not used in the score.', 0, 'z_k = b_k + Σ w_kj x_j.'],
  ['The input should be squared first.', 0, 'The score is linear in the inputs.']]);
NUM('l9-genre-n2', 'l9-genre', 1, `"gorgeous" has TF-IDF q = 0.2167 and the song vector has length ‖q‖ = 0.3340. What is its normalized input x?`, 0.2167 / 0.3340,
  `<p>x = q ÷ ‖q‖ = 0.2167 ÷ 0.3340 ≈ <b>0.6488</b> (p. 73).</p>`, {wrong: [[0.2167 / Math.sqrt(0.0801 * 0.0801 + 0.0275 * 0.0275 + 0.2167 * 0.2167), 'norm-length', 'You normalized by the three shown words only. ‖q‖ = 0.3340 uses all 10,000 coordinates.']]});
MC('l9-genre-c3', 'l9-genre', 'concept', 1, `Where does the IDF used for a validation song like "Gorgeous" come from?`, [
  ['From the training songs, computed once and reused for every new song.', 1, 'Training lyrics → vocabulary and IDF (p. 63).'],
  ['From the validation songs.', 0, 'That would change the feature map between splits.', 'leakage'],
  ['From all 30,000 songs.', 0, 'Including validation and test songs leaks information.', 'leakage'],
  ['From the song itself.', 0, 'IDF is a collection statistic.', 'tf-idf-confuse']]);
MC('l9-genre-f1', 'l9-genre', 'formula', 2, `A genre classifier needs each song's TF-IDF vector rescaled so that Σ_j x_j² = 1, making short and long songs comparable on one scale. Which operation?`, [
  ['Unit-length normalization: x_j = q_j ÷ ‖q‖.', 1, 'Lecture p. 63, 73.'],
  ['TF normalization: divide counts by the song\'s token count.', 0, 'TF makes counts into shares; the squared values still do not sum to 1.', 'norm-confuse'],
  ['IDF weighting.', 0, 'IDF reweights words by rarity.', 'tf-idf-confuse'],
  ['Standardization with the training mean and SD.', 0, 'That centers each feature across songs, a different operation.']]);

NUM('l9-reg-t', 'l9-reg', 2, `Penalized update w_new = (1 − 2ηλ)w − η ∂L/∂w with w = 0.8, η = 0.1, λ = 0.5 and ∂L/∂w = 0.2. Compute w_new.`, (1 - 2 * 0.1 * 0.5) * 0.8 - 0.1 * 0.2,
  `<p>Shrink factor 1 − 2(0.1)(0.5) = 0.9. w_new = 0.9 × 0.8 − 0.1 × 0.2 = 0.72 − 0.02 = <b>0.70</b>.</p>`, {src: 'extra', tryIt: true, wrong: [[0.8 - 0.1 * 0.2, 'grad-factor', 'You left out the penalty: shrink by (1 − 2ηλ) first.'], [(1 - 0.1 * 0.5) * 0.8 - 0.02, 'grad-factor', 'The penalty gradient is 2λw, so the factor is 1 − 2ηλ.']]});
MC('l9-reg-c1', 'l9-reg', 'mistake', 1, `A student picks λ as the value with the lowest training loss. What is wrong?`, [
  ['Training loss always prefers the weakest penalty; λ must be chosen by validation loss.', 1, 'Lecture p. 71: moderate penalty → lowest validation loss.'],
  ['Nothing; lower training loss means a better model.', 0, 'Lecture p. 68: lower training loss ⇏ lower loss on new songs.', 'lambda-train'],
  ['They should pick λ by test loss instead.', 0, 'The test set is used once at the end.', 'test-tuning'],
  ['λ should always be 0.', 0, 'That maximizes overfitting with 10,000 coefficients.', 'lambda-train']]);
MC('l9-reg-c2', 'l9-reg', 'prediction', 2, `You increase λ. What happens to the training loss and to the sizes of the fitted coefficients?`, [
  ['Training loss rises and the coefficients shrink toward zero.', 1, 'The penalty trades training fit for smaller coefficients.'],
  ['Training loss falls and the coefficients grow.', 0, 'Reversed.', 'train-loss-better'],
  ['Both are unchanged.', 0, 'λ changes the objective.'],
  ['Training loss falls and coefficients shrink.', 0, 'Shrinking coefficients away from the training optimum raises training loss.']]);
NUM('l9-reg-n2', 'l9-reg', 1, `With η = 0.05 and λ = 2, what is the shrink factor 1 − 2ηλ applied to each coefficient per update?`, 1 - 2 * 0.05 * 2,
  `<p>1 − 2(0.05)(2) = 1 − 0.2 = <b>0.8</b>: each step keeps 80% of the coefficient before the loss gradient acts.</p>`, {src: 'extra'});

NUM('l9-eval-t', 'l9-eval', 2, `Genre validation matrix, Rock as positive: TP = 780, Rock row total 1,383, Rock column total 1,391, all songs 5,774. What is TN?`, 5774 - 780 - (1383 - 780) - (1391 - 780),
  `<p>FN = 1383 − 780 = 603. FP = 1391 − 780 = 611. TN = 5774 − 780 − 603 − 611 = <b>3780</b>.</p>`, {tryIt: true, int: true});
NUM('l9-eval-n2', 'l9-eval', 1, `The diagonal of the genre validation matrix is 5, 1146, 1822, 34, 780, out of 5,774 songs. Compute the accuracy.`, 3787 / 5774,
  `<p>Correct = 5 + 1146 + 1822 + 34 + 780 = 3787. Accuracy = 3787 ÷ 5774 ≈ <b>0.656</b> (p. 78).</p>`);
MC('l9-eval-c1', 'l9-eval', 'concept', 1, `The genre model's validation accuracy is 0.656; always predicting Rap gives 0.349. What does the baseline tell you?`, [
  ['How much accuracy the class sizes alone deliver; the model\'s value is the improvement over 0.349.', 1, 'Lecture p. 79.'],
  ['That the model is bad because 0.656 is close to 0.5.', 0, 'Five classes; chance is not 0.5.'],
  ['That Rap is the easiest genre.', 0, 'It is the largest, not necessarily the easiest.', 'accuracy-imbalance'],
  ['Nothing; baselines only matter for regression.', 0, 'Majority baselines matter for classification too.']]);
NUM('l9-eval-n3', 'l9-eval', 2, `In the genre validation matrix the Pop column (predicted Pop) is 101, 1146, 125, 221, 533 over actual Country, Pop, Rap, R&B, Rock. How many false positives does Pop have?`, 101 + 125 + 221 + 533,
  `<p>FP = column total minus TP = 101 + 125 + 221 + 533 = <b>980</b>: songs predicted Pop that were not Pop.</p>`, {int: true, wrong: [[630, 'confusion-axes', '630 is Pop\'s FN (rest of its row). FP is the rest of the column.']]});

NUM('l9-prf-t', 'l9-prf', 2, `Pop on validation: TP = 1146, FP = 980, FN = 630. Compute F1.`, 2 * 1146 / (2 * 1146 + 980 + 630),
  `<p>F1 = 2TP ÷ (2TP + FP + FN) = 2292 ÷ (2292 + 980 + 630) = 2292 ÷ 3902 ≈ <b>0.587</b> (p. 89).</p>`, {tryIt: true, wrong: [[(1146 / 2126 + 1146 / 1776) / 2, 'arith-mean-f1', 'That is the arithmetic mean of precision and recall. F1 is the harmonic mean.']]});
NUM('l9-prf-n2', 'l9-prf', 1, `R&B: TP = 34, FP = 35, FN = 368. Compute precision.`, 34 / 69,
  `<p>Precision = 34 ÷ (34 + 35) = 34 ÷ 69 ≈ <b>0.493</b>.</p>`, {wrong: [[34 / 402, 'precision-recall', '34 ÷ 402 is recall (actual positives). Precision divides by predicted positives.']]});
MC('l9-prf-m1', 'l9-prf', 'mistake', 1, `A student computes R&B precision as 34 ÷ (34 + 368). What went wrong?`, [
  ['They used the actual R&B songs (TP + FN) as the denominator, which is recall; precision uses TP + FP = 69.', 1, 'Precision: among predicted R&B. Recall: among actual R&B.'],
  ['Nothing; that is precision.', 0, 'It is recall, 0.085.', 'precision-recall'],
  ['The numerator should be 368.', 0, '368 is FN.'],
  ['They should divide by all 5,774 songs.', 0, 'That mixes in all the true negatives.']]);
NUM('l9-prf-n3', 'l9-prf', 1, `Rap: TP = 1822, FN = 194. Compute recall.`, 1822 / 2016,
  `<p>Recall = 1822 ÷ (1822 + 194) = 1822 ÷ 2016 ≈ <b>0.904</b>: 90% of actual Rap songs were found.</p>`, {src: 'extra'});
MC('l9-prf-c1', 'l9-prf', 'concept', 2, `Country has precision 1 and recall 0.025. The arithmetic mean is 0.513, but F1 is 0.050. Why does the course use F1?`, [
  ['F1 is the harmonic mean, which stays low when either precision or recall is low; high precision alone leaves 192 missed songs unresolved.', 1, 'Lecture p. 87.'],
  ['F1 is always smaller than precision, so it is safer.', 0, 'The reason is the harmonic mean, not being smaller.'],
  ['The arithmetic mean is undefined when precision is 1.', 0, 'It is defined: 0.513.', 'arith-mean-f1'],
  ['F1 ignores false negatives.', 0, 'F1 = 2TP ÷ (2TP + FP + FN) includes them.']]);
NUM('l9-prf-n4', 'l9-prf', 1, `Per-genre F1: 0.050, 0.587, 0.868, 0.144, 0.562. Compute macro F1.`, (0.050 + 0.587 + 0.868 + 0.144 + 0.562) / 5,
  `<p>Macro F1 = (0.050 + 0.587 + 0.868 + 0.144 + 0.562) ÷ 5 = 2.211 ÷ 5 ≈ <b>0.442</b> (p. 90).</p>`);
MC('l9-prf-f1', 'l9-prf', 'formula', 1, `"Of all the songs the model labeled R&B, what fraction really were R&B?" Which formula answers this?`, [
  ['Precision TP ÷ (TP + FP).', 1, 'Among predicted positives.'],
  ['Recall TP ÷ (TP + FN).', 0, 'Recall is among actual positives.', 'precision-recall'],
  ['Accuracy.', 0, 'Accuracy pools all classes.'],
  ['F1.', 0, 'F1 combines precision and recall.']]);

NUM('l9-tuning-t', 'l9-tuning', 1, `With equal group means, per-genre validation F1 is 0.324, 0.533, 0.868, 0.313, 0.577. Compute macro F1.`, (0.324 + 0.533 + 0.868 + 0.313 + 0.577) / 5,
  `<p>(0.324 + 0.533 + 0.868 + 0.313 + 0.577) ÷ 5 = 2.615 ÷ 5 = <b>0.523</b> (p. 96).</p>`, {tryIt: true});
MC('l9-tuning-c1', 'l9-tuning', 'concept', 1, `Which of these is a hyperparameter in the genre pipeline?`, [
  ['The vocabulary cap.', 1, 'Chosen before fitting and compared on validation (p. 92).'],
  ['The Pop coefficient for "you".', 0, 'Word coefficients w_kj are fitted parameters.', 'param-hyper'],
  ['The Pop intercept b_Pop.', 0, 'Intercepts are fitted parameters.', 'param-hyper'],
  ['The TF-IDF value of a word in one song.', 0, 'That is a feature value, not a model setting.']]);
MC('l9-tuning-c2', 'l9-tuning', 'concept', 2, `If the goal is the best macro F1, which validation configuration from p. 96 should be selected for the final test?`, [
  ['TF-IDF + bigrams with equal group means (macro F1 0.528).', 1, 'Highest validation macro F1 in the table.'],
  ['TF-IDF with equal song weights (accuracy 0.656).', 0, 'Highest accuracy, but macro F1 only 0.442.', 'accuracy-imbalance'],
  ['Whichever scores best on the test set.', 0, 'Selecting on test makes the test result optimistic.', 'test-tuning'],
  ['Bigram-only TF-IDF.', 0, 'Macro F1 0.483, lower than 0.528.']]);
NUM('l9-tuning-n2', 'l9-tuning', 2, `Country training targets: n₊ = 515, n₋ = 17,733. Under the balanced loss, how many times more does one Country song count than one other song?`, 17733 / 515,
  `<p>Weights 1 ÷ (2 × 515) versus 1 ÷ (2 × 17733). Ratio = 17733 ÷ 515 ≈ <b>34.4</b>.</p>`, {src: 'extra'});
MC('l9-tuning-m1', 'l9-tuning', 'mistake', 2, `A team tries ten values of λ and keeps the one with the best test-set macro F1, then reports that test score. What is wrong?`, [
  ['The test set was used for tuning, so the reported score is optimistic; tune on validation and test once.', 1, 'Choose hyperparameters → fit → compare on validation → final test.'],
  ['Nothing; the test set is the most honest choice.', 0, 'It stops being honest once you select on it.', 'test-tuning'],
  ['They should tune λ on training loss.', 0, 'Training loss prefers λ → 0.', 'lambda-train'],
  ['λ is a fitted parameter and should not be tuned.', 0, 'λ is a hyperparameter.', 'param-hyper']]);

/* ======================= Worked exam problems ======================= */
WK('w-tfidf-pipeline', 'l9-genre', 3, `A validation song has 200 word tokens. "love" occurs 10 times and "night" 4 times. Training IDF: love 1.5, night 3.0. The rest of the song's TF-IDF vector has squared length 0.0625. Pop model: intercept −0.1, coefficient +0.6 for love, −0.4 for night; assume the other words contribute 0.`, [
  {q: 'TF of "love".', ans: 10 / 200, sol: '10 ÷ 200 = 0.05. Denominator: all 200 tokens.'},
  {q: 'TF-IDF q of "night".', ans: (4 / 200) * 3, sol: 'TF = 4 ÷ 200 = 0.02; q = 0.02 × 3.0 = 0.06.'},
  {q: 'Vector length ‖q‖ of the whole song.', ans: Math.sqrt(0.0625 + 0.075 * 0.075 + 0.06 * 0.06), sol: 'q_love = 0.05 × 1.5 = 0.075. ‖q‖ = √(0.0625 + 0.075² + 0.06²) = √0.071725 ≈ 0.2678.', wrong: [[Math.sqrt(0.075 * 0.075 + 0.06 * 0.06), 'norm-length', 'Include the rest of the vector (0.0625) in the length.']]},
  {q: 'Normalized input x for "love".', ans: 0.075 / Math.sqrt(0.071725), sol: '0.075 ÷ 0.2678 ≈ 0.2800.'},
  {q: 'Pop score z.', ans: -0.1 + 0.6 * (0.075 / Math.sqrt(0.071725)) - 0.4 * (0.06 / Math.sqrt(0.071725)), sol: 'x_night = 0.06 ÷ 0.2678 ≈ 0.2240. z = −0.1 + 0.6(0.2800) − 0.4(0.2240) ≈ −0.1 + 0.1680 − 0.0896 ≈ −0.0216.'}
], ['TF divides by every token in the song, not just the two words.', 'q = TF × training IDF.', 'The vector length uses every coordinate: add the rest\'s squared length.', 'z = intercept + Σ coefficient × normalized input.']);
WK('w-confusion-binary', 'l9-prf', 3, `From the genre validation matrix (rows actual, columns predicted), take Rock as the positive class. The Rock row is 0, 533, 66, 4, 780 (total 1,383) and the Rock column is 71, 444, 59, 37, 780 (total 1,391).`, [
  {q: 'False positives for Rock.', ans: 1391 - 780, tol: 0.5, sol: 'Rest of the Rock column: 71 + 444 + 59 + 37 = 611.', wrong: [[603, 'confusion-axes', '603 is the rest of the row: those are false negatives.']]},
  {q: 'False negatives for Rock.', ans: 1383 - 780, tol: 0.5, sol: 'Rest of the Rock row: 0 + 533 + 66 + 4 = 603.'},
  {q: 'Precision for Rock.', ans: 780 / 1391, sol: '780 ÷ (780 + 611) = 780 ÷ 1391 ≈ 0.561.', wrong: [[780 / 1383, 'precision-recall', 'That divides by the actual Rock songs: recall.']]},
  {q: 'Recall for Rock.', ans: 780 / 1383, sol: '780 ÷ (780 + 603) = 780 ÷ 1383 ≈ 0.564.'},
  {q: 'F1 for Rock.', ans: 1560 / 2774, sol: '2(780) ÷ (2(780) + 611 + 603) = 1560 ÷ 2774 ≈ 0.562 (matches p. 89).'}
], ['TP is the diagonal cell where the row and column are both Rock.', 'Predicted Rock but wrong lives in the Rock column.', 'Precision uses the column total; recall uses the row total.', 'F1 = 2TP ÷ (2TP + FP + FN).'], {src: 'lecture'});
WK('w-l2-update', 'l9-reg', 3, `Logistic regression with an L2 penalty that, as in the lecture, also covers the intercept: J = L + λ(b² + w²). One training row: x = 2, y = 1. Current b = 0, w = 0.5. Learning rate η = 0.1, λ = 0.25.`, [
  {q: 'Predicted probability p.', ans: sigmoid(1), sol: 'z = 0 + 0.5 × 2 = 1; p = 1 ÷ (1 + e^(−1)) ≈ 0.7311.'},
  {q: 'Loss gradient ∂L/∂w.', ans: (sigmoid(1) - 1) * 2, sol: '(p − y)x = (0.7311 − 1)(2) ≈ −0.5379.', wrong: [[(1 - sigmoid(1)) * 2, 'grad-sign-py', 'Use p − y, not y − p.']]},
  {q: 'Shrink factor 1 − 2ηλ.', ans: 1 - 2 * 0.1 * 0.25, sol: '1 − 2(0.1)(0.25) = 0.95.'},
  {q: 'Updated w.', ans: 0.95 * 0.5 - 0.1 * (sigmoid(1) - 1) * 2, sol: 'w_new = 0.95 × 0.5 − 0.1 × (−0.5379) = 0.475 + 0.0538 ≈ 0.5288.'},
  {q: 'Updated b.', ans: 0.95 * 0 - 0.1 * (sigmoid(1) - 1), sol: 'b_new = 0.95 × 0 − 0.1 × (p − y) = −0.1 × (−0.2689) ≈ 0.0269.'}
], ['Score first: z = b + wx.', 'For log loss, ∂ℓ/∂w = (p − y)x and ∂ℓ/∂b = p − y.', 'The penalty adds 2λw to the gradient, which becomes the factor (1 − 2ηλ).', 'Apply w_new = (1 − 2ηλ)w − η ∂L/∂w, and the same pattern for b.']);
WK('w-curves', 'l9-reg', 2, `A model is fit with five penalty strengths. Training loss: λ = 0.001: 0.12; 0.01: 0.18; 0.1: 0.27; 1: 0.38; 10: 0.55. Validation loss: 0.71, 0.52, 0.44, 0.47, 0.60 respectively.`, [
  {q: 'Which λ should be chosen? Enter the value.', ans: 0.1, tol: 0.0001, sol: 'Lowest validation loss is 0.44 at λ = 0.1. Training loss would wrongly pick 0.001.', wrong: [[0.001, 'lambda-train', 'λ = 0.001 has the lowest training loss but the highest validation loss: overfitting.']]},
  {q: 'Validation minus training loss at λ = 0.001.', ans: 0.71 - 0.12, sol: '0.71 − 0.12 = 0.59: a large gap, the signature of overfitting.'},
  {q: 'Validation minus training loss at the chosen λ.', ans: 0.44 - 0.27, sol: '0.44 − 0.27 = 0.17.'}
], ['Never choose λ from the training column.', 'Look for the smallest validation loss.', 'A large validation-minus-training gap signals overfitting; high losses on both signal underfitting.']);
WK('w-ols', 'l4-ols', 3, `Fit least squares to x = (0, 2, 4, 6) and y = (1, 3, 4, 8).`, [
  {q: 'Slope θ₁*.', ans: 22 / 20, sol: 'x̄ = 3, ȳ = 4. x̃ = −3, −1, 1, 3; ỹ = −3, −1, 0, 4. Σx̃ỹ = 9 + 1 + 0 + 12 = 22; Σx̃² = 20. θ₁* = 22 ÷ 20 = 1.1.', wrong: [[22 / 26, 'ols-denominator', 'The denominator is Σ(x − x̄)² = 20.']]},
  {q: 'Intercept θ₀*.', ans: 4 - 1.1 * 3, sol: 'θ₀* = 4 − 1.1 × 3 = 0.7.', wrong: [[1, 'intercept', 'θ₀* = ȳ − θ₁* x̄, not ȳ − x̄.']]},
  {q: 'RSS of the fitted line.', ans: 0.09 + 0.01 + 1.21 + 0.49, sol: 'Predictions 0.7, 2.9, 5.1, 7.3; residuals 0.3, 0.1, −1.1, 0.7 (sum 0). RSS = 0.09 + 0.01 + 1.21 + 0.49 = 1.8.'},
  {q: 'R².', ans: 1 - 1.8 / 26, sol: 'TSS = 9 + 1 + 0 + 16 = 26. R² = 1 − 1.8 ÷ 26 ≈ 0.931.'}
], ['Center x and y first.', 'Slope = Σx̃ỹ ÷ Σx̃².', 'Check your residuals sum to zero.', 'R² = 1 − RSS ÷ TSS with TSS = Σ(y − ȳ)².']);
WK('w-logistic', 'l6-gradient', 3, `Penguin model b = −0.2, w = 1.4, x = (mass − 4000) ÷ 1000. A 5200 g penguin is recorded Adélie (y = 0). Learning rate η = 0.5.`, [
  {q: 'Score z.', ans: -0.2 + 1.4 * 1.2, sol: 'x = 1.2; z = −0.2 + 1.4 × 1.2 = 1.48.'},
  {q: 'Gentoo probability p.', ans: sigmoid(1.48), sol: 'p = 1 ÷ (1 + e^(−1.48)) ≈ 1 ÷ 1.2276 ≈ 0.8146.', wrong: [[1.48, 'score-prob', 'That is z; apply the sigmoid.']]},
  {q: 'Log loss ℓ.', ans: -Math.log(1 - sigmoid(1.48)), sol: 'y = 0, so ℓ = −ln(1 − 0.8146) = −ln(0.1854) ≈ 1.685.', wrong: [[-Math.log(sigmoid(1.48)), 'logloss-branch', 'For y = 0 use −ln(1 − p).']]},
  {q: '∂ℓ/∂w.', ans: sigmoid(1.48) * 1.2, sol: '(p − y)x = (0.8146 − 0)(1.2) ≈ 0.9775.'},
  {q: 'Updated w.', ans: 1.4 - 0.5 * sigmoid(1.48) * 1.2, sol: 'w_new = 1.4 − 0.5 × 0.9775 ≈ 0.9113. The model was too confident in Gentoo, so w falls.', wrong: [[1.4 + 0.5 * sigmoid(1.48) * 1.2, 'gd-sign', 'Subtract η × gradient.']]}
], ['Standardize the mass first.', 'p = 1 ÷ (1 + e^(−z)).', 'Choose the log-loss branch from the recorded label.', 'Gradient for w: (p − y)x.', 'Update: w − η × gradient.']);
WK('w-markov', 'l8-markov', 2, `A short letter-type sequence: V C C V C V V C.`, [
  {q: 'How many adjacent pairs start with V?', ans: 4, tol: 0.5, sol: 'Pairs: VC, CC, CV, VC, CV, VV, VC. Starting with V: VC, VC, VV, VC = 4 (the final C has no successor).'},
  {q: 'P(V | V).', ans: 1 / 4, sol: 'One VV pair out of 4 V-start pairs: 0.25.', wrong: [[1 / 7, 'cond-denominator', 'Divide by the V row total (4), not all 7 pairs.']]},
  {q: 'P(V | C).', ans: 2 / 3, sol: 'C-start pairs: CC, CV, CV (3); two are CV: 2 ÷ 3 ≈ 0.667.'},
  {q: 'Long-run vowel share π_V = P(V | C) ÷ (P(V | C) + P(C | V)).', ans: (2 / 3) / (2 / 3 + 3 / 4), sol: 'P(C | V) = 3 ÷ 4 = 0.75. π_V = 0.667 ÷ (0.667 + 0.75) ≈ 0.471.'}
], ['List the 7 adjacent pairs.', 'Each conditional probability divides by its own row total.', 'P(C | V) = 1 − P(V | V).']);
WK('w-ngram', 'l8-ngram', 2, `Corpus, one sentence per line: a cup of coffee / a cup of tea / a cup of coffee / a cup of water / a slice of cake.`, [
  {q: 'Bigram P(coffee | of).', ans: 2 / 5, sol: '"of" is followed by coffee, tea, coffee, water, cake: 2 of 5 = 0.4.'},
  {q: 'Trigram P(coffee | cup of).', ans: 2 / 4, sol: '"cup of" occurs 4 times, followed by coffee twice: 0.5. More context sharpens the estimate.'},
  {q: 'Unigram P(a).', ans: 5 / 20, sol: '"a" appears 5 times among 20 tokens: 0.25.'},
  {q: 'Bigram probability of "a cup of coffee", starting with the unigram P(a).', ans: 0.25 * (4 / 5) * 1 * (2 / 5), sol: 'P(a) P(cup | a) P(of | cup) P(coffee | of) = 0.25 × 0.8 × 1 × 0.4 = 0.08.', wrong: [[0.25 + 0.8 + 1 + 0.4, 'prob-multiply', 'Multiply the factors.']]}
], ['A bigram conditions on one previous word; a trigram on two.', 'Denominator: how often the context appears with a following word.', 'Chain rule: multiply.'], {src: 'extra'});
WK('w-gd', 'l5-gd', 2, `Gradient descent on L(c) = (c − 3)², starting at c = 0 with η = 0.25.`, [
  {q: 'c after one update.', ans: 0 - 0.25 * 2 * (0 - 3), sol: 'L′(c) = 2(c − 3) = −6 at c = 0. c = 0 − 0.25(−6) = 1.5.', wrong: [[-1.5, 'gd-sign', 'Subtract η × L′(c).']]},
  {q: 'c after two updates.', ans: 1.5 - 0.25 * 2 * (1.5 - 3), sol: 'L′(1.5) = −3. c = 1.5 + 0.75 = 2.25. The distance to 3 halves each step: (1 − 2η) = 0.5.'},
  {q: 'At what η does the multiplier (1 − 2η) on the distance to 3 equal −1, so c bounces forever?', ans: 1, tol: 0.001, sol: '1 − 2η = −1 gives η = 1. Above that, the iterates diverge.'}
], ['Differentiate: L′(c) = 2(c − 3).', 'c_new = c − ηL′(c).', 'Write c_new − 3 = (1 − 2η)(c − 3).']);
