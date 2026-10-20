/* Lesson content for Lectures 8 and 9. Song material is limited to the lecture's counts and title words. */
'use strict';

/* ======================= Lecture 8 ======================= */
LESSON({id: 'l8-text', lec: 8, title: 'Text as numbers', pages: '26 to 33', keys: 'text bytes ascii character codes distance style features word order tokens',
  quick: {what: 'Computers store text as numbers, but the obvious numbers (character codes) don\'t capture meaning.', why: 'A logistic model for urgent maintenance requests needs a numeric x, and we must choose it well.', idea: 'Character-code distance can make same-meaning messages far apart and opposite messages close. A token is whatever text unit we choose to count.', remember: 'Code distance is not difference in meaning.'},
  learn: LEARN({
    problem: SRC('26', '<p>Sort dorm maintenance requests by urgency with logistic regression: "Water is leaking through my ceiling." → ' + M('z = \\theta_0 + \\sum_j \\theta_j x_j') + ' → probability of an urgent request. What is x? How do we fit θ?</p>'),
    model: '<p>Text is an ordered sequence of symbols. The simplest numbers are the byte codes of the characters, but those codes were assigned for storage, not meaning. Changing case changes every code while keeping the meaning.</p>',
    example: SRC('28 to 31', '<p>c, a, t have byte values 99, 97, 116; "cats" is [99, 97, 116, 115], a different length, so numeric codes give variable-length inputs.</p>' + TABLE(['Message', 'ASCII feature row'], [['Loved it.', '[76, 111, 118, 101, 100, 32, 105, 116, 46]'], ['LOVED IT.', '[76, 79, 86, 69, 68, 32, 73, 84, 46]'], ['Hated it.', '[72, 97, 116, 101, 100, 32, 105, 116, 46]']]) + '<p>With ' + M('d(\\mathbf{x}, \\mathbf{x}\') = \\sqrt{\\sum_j (x_j - x_j\')^2}') + ': d(Loved it., Hated it.) = 14.7 (opposite sentiment) while d(Loved it., LOVED IT.) = 78.4 (same sentiment). Style features (characters, uppercase count, exclamation marks) are 9, 1, 0 for both "Loved it." and "Hated it.": same style, opposite sentiment.</p>') +
      SRC('32 to 33', '<p>Word order carries meaning: "Sam follows Alex" and "Alex follows Sam" have the same words and different relationships. A token is a chosen text unit: characters (a, ␣, c, u, p, …) or words (a, cup, of, tea).</p>'),
    steps: LEDGER([
      ['\\text{Loved} - \\text{Hated}: (76-72, 111-97, 118-116, 0, \\dots) = (4, 14, 2, 0, 0, 0, 0, 0, 0)', 'Only the first three characters differ.', 'plain'],
      ['d = \\sqrt{16 + 196 + 4} = \\sqrt{216} \\approx 14.7', 'Small distance, opposite meaning.', 'plain'],
      ['\\text{Loved} - \\text{LOVED}: \\text{six differences of } 32', 'Lowercase and uppercase codes differ by 32.', 'plain'],
      ['d = \\sqrt{6 \\times 32^2} = \\sqrt{6144} \\approx 78.4', 'Large distance, same meaning.']
    ]),
    mistakes: ['Treating character codes as meaningful features.', 'Ignoring word order when it changes meaning.', 'Assuming "token" always means "word". It is whatever unit we choose.'],
    connect: CHAIN(['Raw text', 'Choose tokens', 'Counts and probabilities', 'TF-IDF vectors (Lecture 9)'], 1),
    tryq: 'l8-text-t'
  }),
  revise: {formulas: ['euclid'], when: 'Explaining why raw codes fail as text features.', formats: ['Compute an ASCII distance.', 'Why does code distance not track meaning?'], traps: ['Codes are not meaning.']},
  prereq: ['l7-signal'], next: ['l8-nextword']
});

LESSON({id: 'l8-nextword', lec: 8, title: 'Next-word probabilities from counts', pages: '34 to 36', keys: 'next word prediction context conditional probability counts a cup of coffee',
  quick: {what: 'Estimate the probability of the next word by counting what followed the same context in example texts.', why: 'Predicting the next word turns text into a probability problem we can learn from counts.', idea: 'P(word | context) = count(context followed by word) ÷ count(context followed by anything).', remember: 'The denominator counts only times the context appeared.'},
  learn: LEARN({
    problem: SRC('34 to 35', '<p>"I\'ll be there in |": five? ten? a? Words turn into probabilities for the next word. The context is the preceding words used for prediction: after "a cup of" we expect coffee, tea, water; after "a slice of" pizza, cake, bread.</p>'),
    model: '<p>Look up every place the context occurred and tally what came next. Probabilities are those tallies as shares of the total.</p>',
    example: SRC('36', '<p>Example texts: a cup of coffee; a cup of tea; a cup of coffee; a cup of water.</p>' + TABLE(['Next word', 'Count', 'Probability'], [['Coffee', '2', '2/4'], ['Tea', '1', '1/4'], ['Water', '1', '1/4']]) + MD('P(\\text{coffee} \\mid \\text{a cup of}) = \\frac{2}{4} = 0.5')),
    steps: LEDGER([
      ['\\text{count}(\\text{a cup of} \\to \\text{coffee}) = 2', 'Numerator: times this context was followed by coffee.', 'plain'],
      ['\\text{count}(\\text{a cup of} \\to \\text{anything}) = 4', 'Denominator: every time the context appeared with a next word.', 'plain'],
      ['P = 2 \\div 4 = 0.5', 'Shares sum to 1: 2/4 + 1/4 + 1/4 = 1.']
    ]),
    lab: 'ngram',
    mistakes: ['Dividing by the total number of words in the corpus instead of the number of times the context appeared.', 'Forgetting that probabilities over all next words must sum to 1.'],
    connect: CHAIN(['Counts', 'Conditional probability', 'Markov chains', 'n-gram language models'], 1),
    tryq: 'l8-nextword-t'
  }),
  revise: {formulas: ['cond-prob'], when: 'Estimating a next-token probability from a small corpus.', formats: ['Compute P(word | context) from a list of sentences.'], traps: ['Wrong denominator.']},
  prereq: ['l8-text'], next: ['l8-markov']
});

LESSON({id: 'l8-markov', lec: 8, title: 'Markov chains: vowels in Eugene Onegin', pages: '37 to 62', keys: 'markov chain nekrasov independence law of large numbers onegin vowel consonant transition probability sampling state',
  quick: {what: 'A Markov chain predicts the next state using only the current state, with transition probabilities estimated from pair counts.', why: 'Markov needed a counterexample: stable averages without independent observations.', idea: 'Count adjacent pairs, divide each row by its row total, then sample the next state with a uniform random number.', remember: 'P(next | complete history) ≈ P(next | current state).'},
  learn: LEARN({
    problem: SRC('37 to 43', '<p>Marriages in Belgium were stable year to year (29,876; 29,023; 28,220; 29,326; 29,210 for 1841 to 1845). Nekrasov (1902) argued: independent outcomes give stable averages, social totals are stable, so choices must be independent, so free will. Markov tested the claim "stable averages require independence" by finding dependent observations with a stable average.</p>'),
    model: '<p>A coin toss forgets the past: P(H next | H) = P(H next | T) = P(H) = 0.5. A Markov chain remembers exactly one step. The current state picks which row of probabilities to use for the next draw.</p>',
    example: SRC('40 to 46', '<p>Ten fair tosses T H H H T T H T H T give 5 heads, a head fraction of 5 ÷ 10 = 0.5; by the law of large numbers, more independent tosses push the fraction toward 0.5. Copied pairs (each second outcome repeats the first) are dependent, yet the head fraction is 2 × Heads ÷ 2 × Tosses, the same stable average. Markov\'s 1906 theory, then a 1913 study of Pushkin\'s novel in verse <i>Eugene Onegin</i>: 20,000 letters reduced to types V (vowel) or C (consonant).</p>') +
      SRC('50 to 56', '<p>Adjacent pairs in V C V V C: VC, CV, VV, VC, so VV 1, VC 2, CV 1, CC 0. In Onegin, 8,638 of 20,000 letters are vowels: ' + M('P(V) = 8{,}638 / 20{,}000 = 0.4319') + '. If letters were independent, ' + M('P(VV) = P(V)^2 \\approx 0.1865') + ' and we would expect about ' + M('19{,}999 \\times 0.4319^2 \\approx 3{,}731') + ' vowel pairs among 19,999 adjacent pairs. Observed: 1,104.</p>' + TABLE(['Current type', 'Next vowel', 'Next consonant', 'Row total'], [['Vowel', '1,104', '7,534', '8,638'], ['Consonant', '7,534', '3,827', '11,361']]) + '<p>11,362 consonants, but only 11,361 have a next letter: the final consonant has no successor.</p>') +
      SRC('57 to 62', '<p>One-step model: same current V → same next-type probabilities, whatever came before. Chain: P(V | V) = 0.1278, P(C | V) = 0.8722, P(V | C) = 0.6631, P(C | C) = 0.3369. Sampling from V: split [0, 1] at 0.1278; a draw of 0.4 lands in C. From C: split at 0.6631; a draw of 0.3 lands in V. Start V, draw 0.40 → C, draw 0.30 → V. The sampled type becomes the current type.</p>'),
    steps: LEDGER([
      ['P(V \\mid V) = \\frac{1{,}104}{1{,}104 + 7{,}534} = \\frac{1{,}104}{8{,}638} \\approx 0.1278', 'Numerator: VV pairs. Denominator: every pair that starts with a vowel (the V row total).', 'plain'],
      ['P(V \\mid C) = \\frac{7{,}534}{7{,}534 + 3{,}827} = \\frac{7{,}534}{11{,}361} \\approx 0.6631', 'Denominator: the C row total, 11,361, not all 20,000 letters.', 'plain'],
      ['P(V) = 0.4319 \\text{ lies between } 0.1278 \\text{ and } 0.6631', 'Next-vowel probability depends strongly on the current type, so the letters are not independent.']
    ]),
    lab: 'markov',
    mistakes: ['Dividing a pair count by all 20,000 letters instead of the row total.', 'Using 11,362 as the consonant row total; the last consonant has no successor (11,361).', 'Thinking a Markov chain conditions on the full history.', 'Reading the sampling rule backwards: with current V, a draw below P(V | V) gives V.'],
    connect: CHAIN(['Independent draws', 'One-step dependence', 'Stationary share', 'n-grams over words'], 1),
    tryq: 'l8-markov-t'
  }),
  revise: {formulas: ['markov', 'cond-prob'], when: 'Estimating transitions from pair counts; sampling a sequence.', formats: ['Compute P(V | C) from a count table.', 'Sample the next state from a draw u.', 'Expected pairs under independence.'], traps: ['Row total denominator.', 'Last letter has no successor.']},
  prereq: ['l8-nextword'], next: ['l8-chorus']
});

LESSON({id: 'l8-chorus', lec: 8, title: 'A chorus as a Markov chain', pages: '63 to 76', keys: 'song chorus continuation probability shuffle running vowel frequency stationary independent generation letter types character model',
  quick: {what: 'The same vowel and consonant test on one song chorus shows strong dependence, and the chain still settles to a stable vowel share.', why: 'Shuffling keeps the letter counts but destroys the neighbor pattern, isolating dependence.', idea: 'Same totals, different neighboring pairs; a Markov chain and independent draws can share the same long-run vowel share (0.4212).', remember: 'Stable averages do not require independence.'},
  learn: LEARN({
    problem: SRC('63 to 66', '<p>Song text is highly predictable. After the title\'s first two words there are 40 matching prefixes in the full song; six continuations each occur 6 times (6/40 = 0.15) and a bridge variant 4 times (4/40 = 0.10). Letter counts: the title has 19 letters (9 vowels, 10 consonants); one chorus has 138 letters (58 vowels, 80 consonants). Repeat Onegin\'s dependence test.</p>'),
    model: '<p>To prove neighbors matter, keep exactly the same letters and scramble their order. If the pair frequencies change, the original order carried information.</p>',
    example: SRC('68 to 70', '<p>Original V C V V C has one VV pair; the shuffle V V V C C has two: same 3 V and 2 C, different neighbors. For the chorus (spaces and punctuation removed, y counted as a consonant): V after V is 17.5% in the original order and 36.2% shuffled; V after C is 60.0% original and 45.6% shuffled. Chorus chain from 137 adjacent pairs: P(V | V) = 0.1754, P(C | V) = 0.8246, P(V | C) = 0.6000, P(C | C) = 0.4000.</p>') +
      SRC('71 to 76', '<p>Running vowel frequency = vowels among the first n types ÷ n. For V C C V V C: first 3 types 1/3 ≈ 0.333, first 6 types 3/6 = 0.5. Markov chain (P(V next | V) = 0.1754, P(V next | C) = 0.6000) versus independent draws (P(V next) = 0.4212 every step): the same stationary vowel probability ≈ 0.4212, and both running frequencies settle there. But V/C encoding removes letter identity ("give" and "love" are both C V C V), so a character model keeps the actual letters: current letter t, next letter h, o, e, ….</p>'),
    steps: LEDGER([
      ['\\text{V row: } 10 \\text{ VV},\\ 47 \\text{ VC}; \\text{ total } 57', '58 vowels, but the final letter is a V with no successor.', 'plain'],
      ['P(V \\mid V) = \\frac{10}{57} \\approx 0.1754', 'Lecture value.', 'plain'],
      ['\\text{C row: } 48 \\text{ CV},\\ 32 \\text{ CC}; \\text{ total } 80', 'All 80 consonants have a successor.', 'plain'],
      ['P(V \\mid C) = \\frac{48}{80} = 0.6000', '57 + 80 = 137 adjacent pairs.']
    ]) + XTRA('<p>Where 0.4212 comes from: in the long run, the flow into V must balance the flow out, ' + M('\\pi_V\\,P(C \\mid V) = \\pi_C\\,P(V \\mid C)') + ' with ' + M('\\pi_C = 1 - \\pi_V') + ', so ' + M('\\pi_V = \\frac{P(V \\mid C)}{P(V \\mid C) + P(C \\mid V)} = \\frac{0.6}{0.6 + 0.8246} \\approx 0.4212') + '. The same formula on Onegin gives 0.4319, its overall vowel share. The lecture reports the share; the formula is extra.</p>'),
    lab: 'markov',
    labIntro: '<p>Press "One chorus" to load the 137 pairs. The running-share plot shows both generators settling near 0.4212.</p>',
    mistakes: ['Using 58 as the vowel row total; only 57 vowels have a next letter.', 'Concluding that a stable running average proves independence.', 'Forgetting that shuffling preserves totals but changes pair counts.'],
    connect: CHAIN(['Letter types', 'Specific letters', 'Words', 'Subword tokens (BPE)'], 0),
    tryq: 'l8-chorus-t'
  }),
  revise: {formulas: ['markov'], when: 'Testing dependence; long-run behavior of a two-state chain.', formats: ['Transition probabilities from a small table.', 'What does shuffling change?', 'Running frequency of a short sequence.'], traps: ['Row totals.', 'Stable average does not imply independence.']},
  prereq: ['l8-markov'], next: ['l8-ngram']
});

LESSON({id: 'l8-ngram', lec: 8, title: 'Unigrams, bigrams, trigrams and sequence probability', pages: '77 to 97', keys: 'unigram bigram trigram n-gram shannon character model word model autoregressive chain rule sequence probability markov approximation',
  quick: {what: 'An n-gram model predicts each token from the previous n − 1 tokens; multiplying the predictions gives the probability of a whole sequence.', why: 'Shannon wanted to measure how predictable English is; prediction is also how we generate text.', idea: 'Unigram uses no context, bigram one previous token, trigram two. The chain rule multiplies next-token probabilities.', remember: 'P(x₁, …, x_T) = Π P(x_t | x₁, …, x_{t−1}), approximated with short context.'},
  learn: LEARN({
    problem: SRC('77 to 79', '<p>Shannon (Bell Telephone Laboratories, 1948) studied reliable communication through limited, noisy channels. More predictable symbols need fewer bits under efficient coding. His statistical approximations to English range from uniform letters, through letter frequencies, previous letter and previous two letters, to word frequencies and previous word; each step looks more like English.</p>'),
    model: '<p>Context length is a dial. At 0 the model knows only how common each token is. At 1 it knows what usually follows the last token. At 2 it knows what follows the last two. More context means sharper predictions but many more possible contexts to count.</p>',
    example: SRC('80 to 83', MD('\\text{Unigram } P(x_t),\\qquad \\text{Bigram } P(x_t \\mid x_{t-1}),\\qquad \\text{Trigram } P(x_t \\mid x_{t-2}, x_{t-1})') + '<p>Characters (26 letters and space): to predict after "never", the bigram context is just "r": count the successors of r, then normalize. After "n" in the song, 201 observed transitions: a 44, n 44, e 40, space 28, d 27, o 8, g 5, s 2, k 1, t 1 (p. 83).</p>') +
      SRC('84 to 90', '<p>Words: "never" appears 40 times among 430 word tokens: ' + M('P(\\text{never}) = 40/430 \\approx 0.0930') + '. The most frequent words are you (44), gonna (42), never (40). Unigram probabilities ignore previous words. Every one of the 40 occurrences of "never" is followed by "gonna": ' + M('c(\\text{never}, \\text{gonna}) = 40') + ', ' + M('\\sum_v c(\\text{never}, v) = 40') + ', so ' + M('P(\\text{gonna} \\mid \\text{never}) = 1') + '. Generating two words: ' + M('P(\\text{never}, \\text{gonna}) = \\frac{40}{430}\\cdot\\frac{40}{40} \\approx 0.0930') + '.</p>') +
      SRC('91 to 96', MD('P(x_1, x_2, x_3) = P(x_1)P(x_2 \\mid x_1)P(x_3 \\mid x_1, x_2),\\qquad P(x_1, \\dots, x_T) = \\prod_{t=1}^{T}P(x_t \\mid x_1, \\dots, x_{t-1})') + '<p>Continuation from the prefix "never gonna": ' + M('P(\\text{give} \\mid \\text{never gonna}) = 10/40 = 0.25') + ', ' + M('P(\\text{you} \\mid \\text{never gonna give}) = 6/10 = 0.60') + ', ' + M('P(\\text{up} \\mid \\text{never gonna give you}) = 6/6 = 1') + ', so ' + M('P(\\text{give you up} \\mid \\text{never gonna}) = \\frac{10}{40}\\cdot\\frac{6}{10}\\cdot\\frac{6}{6} = \\frac{6}{40} = 0.15') + '. With less context, after "gonna" alone (42 occurrences), "give" has 10/42 ≈ 23.8% versus 10/40 = 25.0% after "never gonna": pretty similar. Markov approximation: ' + M('P(x_t \\mid x_1, \\dots, x_{t-1}) \\approx P(x_t \\mid x_{t-1})') + '. In character generation, 0, 1 and 2 previous characters give increasingly word-like output, with more possible contexts to count (p. 97).</p>'),
    steps: LEDGER([
      ['P(\\text{give} \\mid \\text{never gonna}) = \\frac{10}{40}', '10 of the 40 "never gonna" prefixes continue with "give".', 'plain'],
      ['P(\\text{you} \\mid \\text{never gonna give}) = \\frac{6}{10}', 'Of those 10, 6 continue with "you". The denominator is the previous numerator.', 'plain'],
      ['P(\\text{up} \\mid \\dots\\text{you}) = \\frac{6}{6}', 'All 6 continue with "up".', 'plain'],
      ['\\frac{10}{40}\\times\\frac{6}{10}\\times\\frac{6}{6} = \\frac{6}{40} = 0.15', 'The 10s and 6s cancel: the answer is just 6 of the original 40.']
    ]),
    lab: 'ngram',
    labIntro: '<p>Switch between unigram, bigram and trigram with context "cup of" and watch the table sharpen. Score the phrase "a slice of coffee" to see a zero probability.</p>',
    mistakes: ['Calling a model with one previous token a unigram. Unigram has no context; bigram has one previous token; trigram has two.', 'Using the full-corpus token count as the denominator of a conditional probability.', 'Adding next-token probabilities instead of multiplying them.', 'Assuming a longer context is always available; at the start of a sequence there is less.'],
    connect: CHAIN(['Next-word counts', 'Chain rule', 'Markov approximation', 'Token pieces (BPE)'], 1),
    tryq: 'l8-ngram-t'
  }),
  revise: {formulas: ['ngram', 'autoreg', 'cond-prob'], when: 'Probability of a token or sequence from counts; choosing context length.', formats: ['Compute a sequence probability with the chain rule.', 'Unigram versus bigram versus trigram.', 'Estimate P(next | context) from counts.'], traps: ['Order names.', 'Denominators.', 'Add versus multiply.']},
  prereq: ['l8-chorus'], next: ['l8-music', 'l8-bpe']
});

LESSON({id: 'l8-music', lec: 8, title: 'Markov models for melody', pages: '98 to 104', keys: 'music intervals illiac suite hiller isaacson semitone conditional interval weights',
  quick: {what: 'Melodies are symbolic sequences too; Hiller and Isaacson generated music with interval probabilities that depend on the previous interval.', why: 'The same "P(next symbol | previous symbols)" idea applies beyond text.', idea: 'State = previous interval size; next-interval weight = w_next + w_previous − 1, normalized over all 13 intervals.', remember: 'P(0 | 0) = 25 ÷ 247 ≈ 0.101 and P(0 | 6) = 13 ÷ 91 ≈ 0.143.'},
  learn: LEARN({
    problem: SRC('98 to 100', '<p>Are such patterns unique to text? Lejaren Hiller and Leonard Isaacson (University of Illinois, 1956) programmed musical rules, generated scores and examined them: the ILLIAC Suite for string quartet (two violins, viola, cello).</p>'),
    model: '<p>Replace letters with musical steps. Instead of "which letter comes next", ask "how big is the next jump in pitch", and let the previous jump change the odds.</p>',
    example: SRC('101 to 104', '<p>One semitone is one adjacent pitch step; interval size is the absolute pitch difference: from 60 to 67 is |67 − 60| = 7 semitones, and pitch 60 can move to 60 + 7 = 67 or 60 − 7 = 53. The current state is the previous interval size. Specified weights (out of 91) for intervals 0 to 12 semitones (0 = repeat, 12 = octave):</p>' + TABLE(['Interval', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'], [['Weight', '13', '3', '5', '7', '9', '10', '1', '11', '8', '6', '4', '2', '12']]) + '<p>Conditional rule: next-interval weight = ' + M('w_{\\text{next}} + w_{\\text{previous}} - 1') + '. Previous interval 0 (weight 13): repeat weight 13 + 13 − 1 = 25, ' + M('P(0 \\mid 0) = \\frac{25}{91 + 13(12)} \\approx 0.101') + '. Previous interval 6 (weight 1): repeat weight 13 + 1 − 1 = 13, ' + M('P(0 \\mid 6) = \\frac{13}{91 + 13(0)} \\approx 0.143') + '.</p>'),
    steps: XTRA('<p>Where the denominator comes from: add the conditional weights over all 13 possible next intervals.</p>', 'Extra worked numbers') + LEDGER([
      ['\\sum_{\\text{next}}(w_{\\text{next}} + w_{\\text{prev}} - 1) = \\sum w_{\\text{next}} + 13(w_{\\text{prev}} - 1)', 'Each of the 13 terms gets the same extra w_prev − 1.', 'plain'],
      ['= 91 + 13(w_{\\text{prev}} - 1)', 'Previous 0: 91 + 13(12) = 247. Previous 6: 91 + 13(0) = 91.']
    ]),
    mistakes: ['Normalizing by 91 regardless of the previous interval.', 'Using signed pitch differences; the state is the interval size (absolute value).'],
    connect: CHAIN(['Letter types', 'Words', 'Intervals', 'Any symbolic sequence'], 2),
    tryq: 'l8-music-t'
  }),
  revise: {formulas: ['cond-prob'], when: 'Applying the conditional weighting rule from the ILLIAC example.', formats: ['Compute P(next | previous) from the weight table.'], traps: ['Denominator depends on the previous interval.']},
  prereq: ['l8-ngram'], next: ['l8-bpe']
});

LESSON({id: 'l8-bpe', lec: 8, title: 'Byte pair encoding', pages: '105 to 111', keys: 'byte pair encoding bpe merge rules subword tokens pair counts tie breaking apply tokenizer replaying',
  quick: {what: 'BPE builds a vocabulary of word pieces by repeatedly merging the most frequent adjacent pair.', why: 'Whole words can be unseen; single characters lose structure. Reusable pieces like "play" cover both problems.', idea: 'Learning: count pairs, merge the top pair, repeat. Applying: replay the learned merges in order on a new word.', remember: 'Applying a trained tokenizer never recounts pairs; it follows the merge list.'},
  learn: LEARN({
    problem: SRC('105', '<p>As a word token, "replaying" may never appear in training. As character tokens it is r e p l a y i n g, nine tokens with no reuse. We want reusable pieces inside words.</p>'),
    model: '<p>Start from letters. Look for the pair that sticks together most often across the training words and glue it into one new piece. Repeat. The glue steps are recorded in order, like a recipe, and the same recipe is later applied to any word.</p>',
    example: SRC('106 to 109', '<p>Training words play, player, playing, replay. Adjacent pair counts include ' + M('c(p, l) = 4') + ', ' + M('c(l, a) = 4') + ', ' + M('c(a, y) = 4') + '. First merge p + l → pl, next pl + a → pla, next pla + y → play; the added token pieces are pl, pla, play. The lecture\'s tool counts weighted adjacent pairs, keeps word boundaries, and breaks equal counts by taking the first pair in the training words (p. 108). Applying the learned merges to "replaying": p + l → pl gives r e pl a y i n g; pl + a → pla gives r e pla y i n g; pla + y → play gives r e play i n g. Known pieces can represent an unseen word.</p>') +
      SRC('110 to 111', '<p>Pipeline: training words → ordered BPE merge rules; training token sequences → counts of context continuations; tokenized new text → next-token probabilities. Next-piece prediction: ' + M('P(x_t \\mid x_1, \\dots, x_{t-1})') + ' over pieces such as r e play i n g.</p>'),
    steps: LEDGER([
      ['\\text{play: } pl, la, ay;\\ \\text{player: } pl, la, ay, ye, er', 'List adjacent pairs inside each word (never across words).', 'plain'],
      ['\\text{playing: } pl, la, ay, yi, in, ng;\\ \\text{replay: } re, ep, pl, la, ay', 'pl, la and ay each appear 4 times; everything else once.', 'plain'],
      ['\\text{tie at 4: } p + l \\text{ appears first} \\Rightarrow \\text{merge } pl', 'Tie rule: first pair in the training words.', 'plain'],
      ['\\text{after 3 merges, all counts are 1; next merge: play + e}', 'The first pair in the first word that still has a pair ("player").']
    ]),
    lab: 'bpe',
    mistakes: ['Recounting pairs in the new word when applying a trained tokenizer. You replay the learned merges in order.', 'Counting pairs across word boundaries.', 'Breaking a tie alphabetically instead of by first appearance (the lecture\'s rule).', 'Applying merges out of order.'],
    connect: CHAIN(['Characters', 'BPE pieces', 'Next-piece probabilities', 'Numerical features of word use'], 1),
    tryq: 'l8-bpe-t'
  }),
  revise: {formulas: ['bpe'], when: 'Learning merges from a small corpus; tokenizing a new word.', formats: ['Which pair merges next?', 'Tokenize a new word with given merges.', 'Spot the error in a BPE application.'], traps: ['Recounting.', 'Tie rule.', 'Merge order.']},
  prereq: ['l8-ngram'], next: ['l8-wordvec']
});

LESSON({id: 'l8-wordvec', lec: 8, title: 'Word vectors from contexts', pages: '112 to 119', keys: 'word vectors distributional semantics firth context counts relative frequency doctor nurse mechanic',
  quick: {what: 'Describe each word by how often each context word follows it, giving every word a fixed-length numerical row.', why: 'Words used in similar ways tend to have related meanings; counts of use turn that into numbers.', idea: 'Use the same context columns for every word, then divide each row by its number of examples.', remember: '"You shall know a word by the company it keeps" (J. R. Firth, 1957).'},
  learn: LEARN({
    problem: SRC('112 to 113', '<p>Next-word frequencies already summarize how a word is used. Can we reuse them as fixed-length features? Subject → verb → object patterns: doctor → treated → fever; nurse → treated → wound; mechanic → repaired → engine. Shared word use can indicate related meanings.</p>'),
    model: '<p>Make a fingerprint for each word: a row of tallies, one column per context word. Words with similar fingerprints get nearby vectors, which is the idea of distributional semantics.</p>',
    example: SRC('115 to 119', '<p>Context = the word immediately after the occupation, across twelve sentences such as "doctor treated a fever" and "mechanic repaired an engine". Counting gives ' + M('\\mathbf{x}_{\\text{doctor}} = (2, 1, 1, 0)') + ' over the fixed columns treated, checked, examined, repaired.</p>' + TABLE(['Word', 'treated', 'checked', 'examined', 'repaired'], [['doctor', '2', '1', '1', '0'], ['nurse', '1', '2', '1', '0'], ['mechanic', '0', '1', '1', '2']]) + '<p>Dividing each count row by its number of examples (4) gives relative frequencies: doctor (0.50, 0.25, 0.25, 0), nurse (0.25, 0.50, 0.25, 0), mechanic (0, 0.25, 0.25, 0.50). Plotting P(treated | word) against P(repaired | word) puts doctor and nurse near each other and the mechanic apart.</p>'),
    steps: XTRA('<p>Distances between the relative-frequency rows (computed here):</p>', 'Extra worked numbers') + LEDGER([
      ['d(\\text{doctor}, \\text{nurse}) = \\sqrt{0.25^2 + 0.25^2 + 0 + 0} \\approx 0.354', 'Differences (0.25, −0.25, 0, 0).', 'plain'],
      ['d(\\text{doctor}, \\text{mechanic}) = \\sqrt{0.5^2 + 0 + 0 + 0.5^2} \\approx 0.707', 'Differences (0.5, 0, 0, −0.5).', 'plain'],
      ['d(\\text{nurse}, \\text{mechanic}) = \\sqrt{0.25^2 + 0.25^2 + 0 + 0.5^2} \\approx 0.612', 'Doctor and nurse are the closest pair.']
    ]),
    lab: 'wordvec',
    labIntro: '<p>Edit a sentence, for example change "mechanic checked an engine" to "mechanic treated an engine", and watch the mechanic move toward the doctor.</p>',
    mistakes: ['Letting different words use different column orders. Every row must use the same columns.', 'Dividing a row by the total number of sentences (12) instead of that word\'s own count (4).', 'Comparing count rows of words with very different frequencies; relative frequencies fix this.'],
    connect: CHAIN(['Next-word counts', 'Word vectors', 'Document vectors (Lecture 9)', 'Latent semantics (Lecture 9, p. 98)'], 1),
    tryq: 'l8-wordvec-t'
  }),
  revise: {formulas: ['ctx-vec', 'euclid'], when: 'Building numerical word features from a small corpus.', formats: ['Build count and relative-frequency rows.', 'Which two words are closest?'], traps: ['Shared column order.', 'Row denominator.']},
  prereq: ['l8-bpe'], next: ['l9-dtm']
});

/* ======================= Lecture 9 ======================= */
LESSON({id: 'l9-dtm', lec: 9, title: 'Documents as vectors', pages: '23 to 30', keys: 'document term matrix vocabulary tokens wikipedia article retrieval feature space dartmouth brown taylor swift',
  quick: {what: 'A document-term matrix has one row per document and one column per vocabulary term, filled with counts.', why: 'Retrieval needs queries and articles of different lengths placed in the same coordinates.', idea: 'Tokens are every word occurrence in one document; vocabulary terms are the distinct words across the collection (the columns).', remember: '998 documents × 21,970 terms; the Dartmouth row starts [26, 11, 9].'},
  learn: LEARN({
    problem: SRC('23 to 25', '<p>Article retrieval: the query "Ivy League college in New Hampshire" should find relevant articles among 998 Wikipedia introductions, using the same token coordinates ("feature space") for the query and the articles. Dartmouth College has 296 word tokens, Brown University 329, Taylor Swift 419: different lengths, shared coordinates [x₁, x₂, …, x_m].</p>'),
    model: '<p>A spreadsheet: rows are articles, columns are every distinct word in the collection, and each cell counts how often that word appears in that article. Most cells are 0.</p>',
    example: SRC('26 to 28', '<p>In the Dartmouth introduction: "the" 26 times, "and" 11, "dartmouth" 9, out of 296 word tokens. The vocabulary has m = 21,970 distinct terms; choose x₁ = the, x₂ = and, x₃ = dartmouth.</p>' + TABLE(['Article', 'the', 'and', 'dartmouth'], [['Dartmouth College', '26', '11', '9'], ['Brown University', '30', '12', '0'], ['Taylor Swift', '33', '18', '0']]) + '<p>998 documents × 21,970 terms.</p>') +
      SRC('29 to 30', '<p>Projected onto the (the, dartmouth) coordinates: Dartmouth is [26, 9], Taylor Swift is [33, 0]. Repeating the Dartmouth text twice gives [26, 11, 9] → [52, 22, 18]: the vector gets longer, pointing the same way.</p>'),
    steps: LEDGER([
      ['T_{\\text{Dartmouth}} = 296 \\text{ tokens}', 'Every word occurrence counts, including all 26 copies of "the".', 'plain'],
      ['26 + 11 + 9 = 46', 'Only the three columns shown; the other 250 tokens are in the other 21,967 columns.', 'plain'],
      ['m = 21{,}970 \\text{ terms}', 'Columns: distinct words across all 998 articles, not tokens in one article.']
    ]),
    lab: 'dtm',
    mistakes: ['Confusing tokens (word occurrences in one document) with vocabulary terms (distinct words across the collection).', 'Thinking a document\'s length is the sum of the displayed columns (46) rather than all its tokens (296).', 'Assuming repeating a document changes its direction. It only scales the vector.'],
    connect: CHAIN(['Raw text', 'Counts (DTM row)', 'TF', 'TF-IDF', 'Cosine'], 1),
    tryq: 'l9-dtm-t'
  }),
  revise: {formulas: ['dtm'], when: 'Representing documents for retrieval or classification.', formats: ['Rows versus columns.', 'Tokens versus vocabulary.', 'Effect of repeating a document.'], traps: ['Tokens versus terms.', 'Length is all tokens.']},
  prereq: ['l8-wordvec'], next: ['l9-tf']
});

LESSON({id: 'l9-tf', lec: 9, title: 'Term frequency', pages: '31 to 33', keys: 'term frequency tf proportion document length normalization common words dominate',
  quick: {what: 'Term frequency is a word\'s count divided by the document\'s total word tokens.', why: 'Raw counts grow with length; a document repeated twice should not look like a different document.', idea: 'TF_ij = C_ij ÷ T_i, where T_i counts every word token in document i.', remember: 'Repetition doubles counts and length, so TF does not change.'},
  learn: LEARN({
    problem: '<p>Repeating the Dartmouth text doubled every count (p. 30). Counts mix up "what the article is about" with "how long it is". We want proportions.</p>',
    model: '<p>TF asks "what share of this article\'s words is this word?" A share does not care how long the article is: two copies of a text have the same shares as one.</p>',
    example: SRC('31 to 32', MD('\\mathrm{TF}_{ij} = \\frac{C_{ij}}{T_i}') + '<p>' + M('C_{ij}') + ' is the count of term j in document i and ' + M('T_i') + ' is the complete document\'s word-token count. For Dartmouth: "the" ' + M('26/296 \\approx 0.0878') + ', "dartmouth" ' + M('9/296 \\approx 0.0304') + '.</p>') +
      SRC('33', TABLE(['Dartmouth College', 'Share', 'Taylor Swift', 'Share'], [['the', '8.8%', 'the', '7.9%'], ['of', '4.4%', 'and', '4.3%'], ['and', '3.7%', 'of', '3.3%'], ['dartmouth', '3.0%', 'swift', '2.4%'], ['in', '2.7%', 'a', '2.1%'], ['a', '2.4%', 'is', '1.7%'], ['is', '2.0%', 'her', '1.7%']]) + '<p>Problem: the top terms are the same filler words in both articles. "the" dominates even though it says almost nothing about the topic.</p>'),
    steps: LEDGER([
      ['C_{\\text{the}} = 26', 'Numerator: occurrences of "the" in this article.', 'plain'],
      ['T = 296', 'Denominator: all 296 word tokens. Not 46 (the three shown words), not 21,970 (the vocabulary), not 998 (articles).', 'plain'],
      ['\\mathrm{TF}_{\\text{the}} = \\frac{26}{296} \\approx 0.0878', 'Meaning: 8.78% of the article\'s words are "the".', 'plain'],
      ['\\text{repeated twice: } \\frac{52}{592} \\approx 0.0878', 'Count and length both double; the share is unchanged.']
    ]),
    lab: 'tfidf',
    labIntro: '<p>Set k to 3 in the lab: the count becomes 27 and the length 888 for "dartmouth", and TF stays 0.0304.</p>',
    mistakes: ['Using 46 (sum of the displayed counts) as the denominator.', 'Dividing by the number of distinct terms in the document.', 'Confusing TF (within one document) with DF (across documents).', 'Thinking TF alone fixes the "the" problem. It doesn\'t; that is IDF\'s job.'],
    connect: CHAIN(['Counts', 'TF', 'IDF', 'TF-IDF'], 1),
    tryq: 'l9-tf-t'
  }),
  revise: {formulas: ['tf'], when: 'Turning counts into length-independent proportions.', formats: ['Compute TF.', 'Effect of repetition on count and TF.', 'Which denominator?'], traps: ['Denominator 46.', 'TF versus DF.']},
  prereq: ['l9-dtm'], next: ['l9-idf']
});

LESSON({id: 'l9-idf', lec: 9, title: 'Document frequency and IDF', pages: '34 to 40, 43', keys: 'document frequency df inverse document frequency idf smoothed log natural log virtual document widespread rare',
  quick: {what: 'IDF gives a word a weight that is high when few documents contain it and close to 1 when nearly all do.', why: 'Words like "the" appear in 986 of 998 articles and tell us nothing about the topic.', idea: 'Smoothed IDF_j = 1 + ln((n + 1) ÷ (DF_j + 1)). DF counts documents containing the word, not occurrences.', remember: 'More widespread word → larger DF → smaller IDF (never below 1).'},
  learn: LEARN({
    problem: SRC('34 to 35', TABLE(['Term', 'Containing articles', 'Share of corpus'], [['the', '986', '98.8%'], ['and', '977', '97.9%'], ['college', '71', '7.1%'], ['hanover', '3', '0.3%'], ['dartmouth', '2', '0.2%'], ['swift', '7', '0.7%']]) + '<p>We want to give relatively more weight to less widespread terms. Goal: ' + M('\\text{score}_{ij} = \\mathrm{TF}_{ij} \\times\\ ?_j') + '.</p>'),
    model: '<p>A word that shows up everywhere is like a stamp on every letter: it identifies nothing. A word in only two articles is a strong clue. IDF measures rarity across the collection and turns it into a multiplier.</p>',
    example: SRC('36 to 39', '<p>Document frequency asks a yes/no question per article: does it contain the term? "the" occurs 26 times in the Dartmouth intro, but contributes just 1 to DF; across the 998 introductions, ' + M('\\mathrm{DF}_{\\text{the}} = 986') + '. Inverse coverage compares n (all articles) with DF_j. Smoothed:</p>' + MD('\\mathrm{IDF}_j = 1 + \\log\\left(\\frac{n + 1}{\\mathrm{DF}_j + 1}\\right)') + '<p>The +1 inside adds a "virtual document" containing every vocabulary term once; the leading 1 is a base multiplier. With n = 998, ' + M('\\mathrm{IDF}_{\\text{the}} = 1 + \\log(999/987) \\approx 1.012') + '.</p>') +
      FLAG('<p>The slide writes "log". Its numbers come from the natural log: 1 + ln(333) = 6.808. Using log base 10 would give 1 + 2.522 = 3.522, which does not match. Use ln on the exam unless told otherwise.</p>') +
      SRC('40, 43', '<p>dartmouth: DF 2, IDF 6.808; and: DF 977, IDF 1.021; the: DF 986, IDF 1.012. Less widespread term ⟹ larger corpus weight.</p>'),
    steps: LEDGER([
      ['\\text{the: } \\frac{998 + 1}{986 + 1} = \\frac{999}{987} \\approx 1.0122', 'Almost every article has it, so the ratio is close to 1.', 'plain'],
      ['\\ln(1.0122) \\approx 0.012 \\Rightarrow \\mathrm{IDF} \\approx 1.012', 'Weight barely above the base 1.', 'plain'],
      ['\\text{dartmouth: } \\frac{999}{2 + 1} = 333,\\quad \\ln 333 \\approx 5.808', 'Only 2 articles contain it.', 'plain'],
      ['\\mathrm{IDF}_{\\text{dartmouth}} \\approx 1 + 5.808 = 6.808', 'About 6.7 times the weight of "the".']
    ]) + XTRA('<p><b>Why a logarithm?</b> Without it, the weight would be the raw ratio: 333 for "dartmouth" versus 1.012 for "the", a factor of about 329. One rare word would swamp every other coordinate, and a word in 1 article would weigh twice one in 3. The log compresses ratios: each tenfold increase in rarity adds a fixed amount (ln 10 ≈ 2.3) to the weight instead of multiplying it by 10. Rare words still win, just not by an absurd margin. The lab prints both columns.</p>', 'Extra intuition: why the log'),
    lab: 'tfidf',
    labIntro: '<p>Drag DF from 2 up to 998 and watch IDF fall toward 1. At DF = n it is exactly 1 + ln(1) = 1, never zero.</p>',
    mistakes: ['Thinking a more common word gets a higher IDF. It gets a lower one.', 'Counting occurrences for DF. DF counts documents containing the term (26 copies of "the" in one article add 1).', 'Using log base 10.', 'Forgetting the +1s: 1 + ln((n + 1) ÷ (DF + 1)), not ln(n ÷ DF).', 'Confusing TF (one document) with IDF (whole collection).'],
    connect: CHAIN(['Counts', 'TF', 'DF and IDF', 'TF-IDF'], 2),
    tryq: 'l9-idf-t'
  }),
  revise: {formulas: ['df', 'idf'], when: 'Weighting terms by rarity across a collection.', formats: ['Compute IDF from n and DF.', 'Effect of increasing DF.', 'Why the log?'], traps: ['Direction of IDF.', 'DF counts documents.', 'Natural log.', 'Missing +1s.']},
  prereq: ['l9-tf'], next: ['l9-tfidf']
});

LESSON({id: 'l9-tfidf', lec: 9, title: 'TF-IDF', pages: '41 to 49', keys: 'tf-idf weighting term frequency inverse document frequency lyrics genius songs reweighting vector direction',
  quick: {what: 'TF-IDF multiplies a word\'s share of the document by its rarity weight: x_ij = TF_ij × IDF_j.', why: 'TF captures importance within a document, IDF across the collection; we want both.', idea: 'A rare word with fewer occurrences can get a larger coordinate than a common word that appears often.', remember: 'Same text, different weights → a different vector direction.'},
  learn: LEARN({
    problem: '<p>TF says "the" dominates the Dartmouth article; IDF says "the" is useless. Combine them into one feature value.</p>',
    model: '<p>TF is "how loudly this article says the word", IDF is "how distinctive the word is". Multiply volume by distinctiveness.</p>',
    example: SRC('41 to 45', MD('x_{ij} = \\mathrm{TF}_{ij}\\,\\mathrm{IDF}_j') + TABLE(['Dartmouth (296 tokens)', 'the', 'and', 'dartmouth'], [['Count', '26', '11', '9'], ['TF', '0.0878', '0.0372', '0.0304'], ['IDF', '1.012', '1.021', '6.808'], ['TF-IDF', '0.0889', '0.0380', '0.2070']]) + '<p>The TF denominator includes every word token. Fewer occurrences can give a larger TF-IDF coordinate (p. 44). Reweighting moves topic words to the top: by TF the leaders are the, of, and, dartmouth; by TF-IDF they are dartmouth (0.207), the (0.089), undergraduate (0.085), sciences (0.077), university (0.061), ivy (0.060), center (0.054).</p>') +
      SRC('46 to 50', '<p>Same logic for 30,000 Genius songs. In "Never Gonna Give You Up" (392 word tokens in this lyrics version):</p>' + TABLE(['Term', 'Count', 'TF', 'Songs containing term', 'IDF', 'TF-IDF'], [['you', '44', '0.112', '27,665 / 30,000', '1.081', '0.121'], ['gonna', '42', '0.107', '4,960 / 30,000', '2.800', '0.300'], ['never', '40', '0.102', '11,797 / 30,000', '1.933', '0.197']]) + '<p>Repeated in one song does not mean unusual across songs. The ratio of the "gonna" to "you" coordinates goes from 0.95 under TF to 2.47 under TF-IDF. On the (the, dartmouth) axes, the Dartmouth TF vector [0.0878, 0.0304] becomes [0.0889, 0.2070]: different term multipliers, different direction.</p>'),
    steps: LEDGER([
      ['\\mathrm{TF}_{\\text{dartmouth}} = \\frac{9}{296} \\approx 0.0304', 'Share of the article.', 'plain'],
      ['\\mathrm{IDF}_{\\text{dartmouth}} = 6.808', 'Rarity weight (DF = 2).', 'plain'],
      ['x = 0.0304 \\times 6.808 \\approx 0.2070', 'Bigger than "the" (0.0878 × 1.012 ≈ 0.0889) despite 9 versus 26 occurrences.']
    ]),
    lab: 'tfidf',
    mistakes: ['Assuming the most frequent word in a document has the largest TF-IDF.', 'Using a song-collection IDF with an article-collection TF (each corpus has its own n and DF).', 'Forgetting that TF-IDF is not length-normalized to unit length; that is a separate step (genre pipeline).'],
    connect: CHAIN(['TF', 'IDF', 'TF-IDF', 'Unit length', 'Cosine and classifiers'], 2),
    tryq: 'l9-tfidf-t'
  }),
  revise: {formulas: ['tfidf', 'tf', 'idf'], when: 'Building weighted text features.', formats: ['Fill in a count, TF, IDF, TF-IDF table.', 'Which word has the largest coordinate?', 'Effect of reweighting on direction.'], traps: ['Frequent is not largest.', 'Mixing corpora.']},
  prereq: ['l9-idf'], next: ['l9-cosine']
});

LESSON({id: 'l9-cosine', lec: 9, title: 'Dot products and cosine similarity', pages: '50 to 59', keys: 'dot product cosine similarity vector length norm euclidean distance retrieval ranking sparse lyric similarity contribution',
  quick: {what: 'Cosine similarity compares the directions of two vectors: dot product divided by the product of their lengths.', why: 'Document length should not decide similarity, and the right weighting decides which articles match a query.', idea: 'cos(u, v) = uᵀv ÷ (‖u‖‖v‖). Scaling a vector changes the dot product and the distance, never the cosine.', remember: 'Counts and TF give the same cosine; TF-IDF can change it a lot.'},
  learn: LEARN({
    problem: '<p>Dartmouth College and Taylor Swift share many "the" and "and" tokens. Raw comparison says they are very similar. How do we compare documents fairly?</p>',
    model: '<p>Think of each document as an arrow from the origin. Length reflects how much text there is; direction reflects the mix of words. Cosine looks only at the angle between arrows, so a document and its doubled copy point the same way and get cosine 1.</p>',
    example: SRC('52 to 53', '<p>Selected coordinates [the, and, dartmouth]: Dartmouth u = [26, 11, 9], Taylor Swift v = [33, 18, 0].</p>' + MD('\\mathbf{u}^\\top\\mathbf{v} = 26 \\times 33 + 11 \\times 18 + 9 \\times 0 = 1056') + MD('\\|\\mathbf{u}\\| = \\sqrt{26^2 + 11^2 + 9^2} = \\sqrt{878},\\quad \\|\\mathbf{v}\\| = \\sqrt{33^2 + 18^2} = \\sqrt{1413}') + MD('\\cos(\\mathbf{u}, \\mathbf{v}) = \\frac{\\mathbf{u}^\\top\\mathbf{v}}{\\|\\mathbf{u}\\|\\|\\mathbf{v}\\|} = \\frac{1056}{\\sqrt{878}\\sqrt{1413}} \\approx 0.948') + '<p>Shared common words contribute across different topics.</p>') +
      SRC('55 to 57', '<p>Ranking the 998 introductions against the query "Ivy League college in New Hampshire" with the same cosine calculation:</p>' + TABLE(['Rank', 'TF', 'TF-IDF'], [['1', 'Premier League (0.256)', 'Hanover, New Hampshire (0.214)'], ['2', 'Thomas Tuchel (0.252)', 'Dartmouth College (0.183)'], ['3', 'Florence Pugh (0.250)', 'World Series (0.165)'], ['4', 'Anthony Volpe (0.247)', 'Brown University (0.162)'], ['5', 'Erik ten Hag (0.247)', '2024-25 UEFA Nations League (0.155)']]) + '<p>Under TF, filler words and "League" drive the matches; TF-IDF finds the relevant articles. The full matrix is sparse: 998 × 21,970 with 99.28% of entries zero.</p>') +
      SRC('58 to 59', '<p>For lyrics, the closest TF-IDF match to "Never Gonna Give You Up" is BROODS\' "Never Gonna Change" with cosine 0.592. Writing ' + M('\\cos(\\mathbf{u}, \\mathbf{v}) = \\sum_j \\frac{u_j v_j}{\\|\\mathbf{u}\\|\\|\\mathbf{v}\\|}') + ' splits it into per-word contributions: gonna (Rick 42, BROODS 25) 0.3518, never (40 and 26) 0.1662, you (44 and 7) 0.0154, remaining words 0.074; total 0.352 + 0.166 + 0.074 ≈ 0.592.</p>'),
    steps: LEDGER([
      ['26 \\times 33 = 858,\\quad 11 \\times 18 = 198,\\quad 9 \\times 0 = 0', 'Multiply matching coordinates.', 'plain'],
      ['\\mathbf{u}^\\top\\mathbf{v} = 858 + 198 + 0 = 1056', 'Add them.', 'plain'],
      ['\\|\\mathbf{u}\\| = \\sqrt{676 + 121 + 81} = \\sqrt{878} \\approx 29.63', 'Length of u.', 'plain'],
      ['\\|\\mathbf{v}\\| = \\sqrt{1089 + 324 + 0} = \\sqrt{1413} \\approx 37.59', 'Length of v.', 'plain'],
      ['\\cos = \\frac{1056}{29.63 \\times 37.59} = \\frac{1056}{1113.8} \\approx 0.948', 'Close to 1 because both vectors are dominated by "the" and "and".']
    ]) + XTRA('<p><b>Why counts and TF give the same cosine.</b> TF divides the whole vector u by one number, T = 296. That scales the dot product by 1/296 and the length ‖u‖ by 1/296, so they cancel in the ratio. The same argument shows repeating a document never changes cosine. TF-IDF multiplies each coordinate by a different IDF, which changes the direction, so the cosine changes. Euclidean distance between the count vectors is ' + M('\\sqrt{(26-33)^2 + (11-18)^2 + (9-0)^2} = \\sqrt{179} \\approx 13.38') + ' and does change with length (lecture tool, p. 54).</p>', 'Extra intuition'),
    lab: 'cosine',
    mistakes: ['Thinking repetition or TF normalization changes cosine similarity.', 'Using the dot product alone as similarity; longer documents get larger dot products.', 'Forgetting the square root in the vector length.', 'Assuming high cosine means same topic when vectors are dominated by common words.'],
    connect: CHAIN(['TF-IDF vectors', 'Cosine similarity', 'Retrieval ranking', 'Unit-length inputs to classifiers'], 1) + '<p>Pearson r is the cosine of centered vectors (Lecture 3, p. 46).</p>',
    tryq: 'l9-cosine-t'
  }),
  revise: {formulas: ['dot', 'cosine', 'euclid'], when: 'Comparing documents or a query with documents.', formats: ['Compute dot product, lengths, cosine.', 'Which changes under repetition: dot, distance, cosine?', 'Why TF-IDF ranks better.'], traps: ['Cosine scale invariance.', 'Dot product grows with length.']},
  prereq: ['l9-tfidf'], next: ['l9-genre']
});

LESSON({id: 'l9-genre', lec: 9, title: 'Genre prediction pipeline', pages: '60 to 67, 72 to 76', keys: 'genre prediction lyrics one vs rest unit length normalization training idf gorgeous pop score largest score class imbalance splits',
  quick: {what: 'A song\'s lyrics become a unit-length TF-IDF vector; each genre\'s classifier scores it, and the largest score wins.', why: 'This chains every earlier step (counts, TF, IDF, normalization, linear score) into one real prediction.', idea: 'z_k = b_k + Σ w_kj x_j for each genre k; one-vs-rest binary models; predict argmax_k z_k.', remember: 'A positive score is not the prediction; the largest score is.'},
  learn: LEARN({
    problem: SRC('60 to 62', '<p>Predict a genre tag (Country, Pop, Rap, R&B, Rock) from lyrics. 30,000 sampled Genius songs: Country 818, Pop 8,779, Rap 11,135, R&B 2,066, Rock 7,202 ("class imbalance"). Splits: training 18,248 songs (fit the feature map and coefficients), validation 5,774 (compare models), test 5,978 (final evaluation). Songs with the same artist credit stay in the same split.</p>'),
    model: '<p>Five judges, one per genre, each trained to answer "is it my genre or not?" Every judge gives a score. We don\'t ask which judges said yes; we pick the judge with the highest score.</p>',
    example: SRC('63 to 67', '<p>Fixed inputs for new songs: training lyrics define the vocabulary and IDF (10,000 word coordinates per song). Then ' + M('q_j = \\mathrm{TF}_j\\,\\mathrm{IDF}_j') + ', ' + M('\\|\\mathbf{q}\\| = \\sqrt{\\sum_l q_l^2}') + ', and model inputs ' + M('x_j = q_j/\\|\\mathbf{q}\\|') + '. The mean normalized input per genre, ' + M('\\bar{x}_{kj} = \\frac{1}{n_k}\\sum_{i:y_i = k}x_{ij}') + ', shows that word use differs across genres. One-vs-rest: each genre gets a 0/1 target, one binary model per genre fit with binary log loss from Lecture 6, giving intercepts b_k and word weights w_kj. Genre score ' + M('z_k = b_k + \\sum_j w_{kj}x_j') + '; largest score → predicted genre.</p>') +
      SRC('72 to 76', '<p>Validation song "Gorgeous" by Taylor Swift, 473 word tokens:</p>' + TABLE(['Term', 'Count', 'TF', 'Training IDF', 'TF-IDF q', 'Normalized x', 'Pop coefficient', 'Contribution'], [['you', '35', '0.0740', '1.082', '0.0801', '0.2398', '+0.796', '0.1908'], ['and', '12', '0.0254', '1.083', '0.0275', '0.0823', '+0.163', '0.0134'], ['gorgeous', '16', '0.0338', '6.405', '0.2167', '0.6488', '−0.114', '−0.0739']]) + '<p>' + M('\\|\\mathbf{q}\\| \\approx 0.3340') + ' over all coordinates, and ' + M('\\sum_j x_j^2 = 1') + '. ' + M('z_{\\text{Pop}} \\approx 0.0494 + 0.1303 + 0.1043 \\approx 0.2841') + ' (intercept, shown words, remaining words). Scores: Country −4.125, Pop 0.284, Rap −3.300, R&B −2.943, Rock 0.069. Prediction: Pop.</p>'),
    steps: LEDGER([
      ['\\mathrm{TF}_{\\text{you}} = 35/473 \\approx 0.0740', 'Count over all 473 tokens.', 'plain'],
      ['q_{\\text{you}} = 0.0740 \\times 1.082 \\approx 0.0801', 'IDF comes from training songs, reused unchanged.', 'plain'],
      ['x_{\\text{you}} = 0.0801 / 0.3340 \\approx 0.2398', 'Divide by the length of the whole 10,000-coordinate vector, not just these three.', 'plain'],
      ['0.2398 \\times 0.796 \\approx 0.1908', 'Contribution to the Pop score.', 'plain'],
      ['0.6488 \\times (-0.114) \\approx -0.0739', '"gorgeous" has the largest input but a negative Pop coefficient: it pulls the Pop score down.', 'plain'],
      ['\\max(-4.125,\\ 0.284,\\ -3.300,\\ -2.943,\\ 0.069) = 0.284 \\Rightarrow \\text{Pop}', 'Rock is also positive; it loses because 0.069 < 0.284.']
    ]),
    lab: 'genre',
    labIntro: '<p>Raise the count of "gorgeous" and watch the Pop score fall toward Rock\'s 0.069. (The lab computes from raw counts, so a fourth decimal can differ by 1 from the slide.)</p>',
    mistakes: ['Treating a positive score as the prediction. Pop (0.284) and Rock (0.069) are both positive; the largest wins.', 'Assuming a large TF-IDF coordinate means a positive contribution. The sign comes from the coefficient.', 'Normalizing by the three shown words instead of the full vector length 0.3340.', 'Recomputing IDF on the validation or test songs. IDF is fit on training songs only.', 'Splitting one artist\'s songs across training and test (leaks style).'],
    connect: CHAIN(PIPE, 4) + '<p>Raw lyrics → TF-IDF features → genre scores → fitted coefficients → largest score → confusion matrix and F1.</p>',
    tryq: 'l9-genre-t'
  }),
  revise: {formulas: ['unit-norm', 'genre-score', 'tfidf'], when: 'Any multi-step "lyrics to prediction" question.', formats: ['Compute one contribution and add up a score.', 'Which genre is predicted?', 'Normalize a TF-IDF vector.'], traps: ['Positive score is not the rule.', 'Sign of contribution.', 'Normalization length.', 'Training-only IDF.']},
  prereq: ['l9-cosine', 'l7-multiclass'], next: ['l9-reg', 'l9-eval']
});

LESSON({id: 'l9-reg', lec: 9, title: 'Regularization', pages: '68 to 71', keys: 'regularization penalty lambda l2 ridge overfitting validation loss training loss coefficient shrinkage hyperparameter',
  quick: {what: 'Regularization adds λ × (sum of squared coefficients) to the loss, discouraging large coefficients.', why: 'With 10,000 word coefficients, a model can memorize accidental patterns: training loss falls while validation loss rises.', idea: 'Each update shrinks every coefficient by the factor (1 − 2ηλ) before the loss gradient acts. Choose λ by validation loss.', remember: 'Lower training loss does not imply lower loss on new songs.'},
  learn: LEARN({
    problem: SRC('68', '<p>Pop versus other genres with a fixed weak penalty: as the number of word coefficients fitted grows from 100 to 10,000, mean binary log loss on training keeps falling, but on validation it rises after about 1,000 coefficients (roughly 0.5 up to about 0.75 at 10,000 on the chart; values read from the plot are approximate). Lower training loss ⇏ lower loss on new songs.</p>'),
    model: '<p>A model with too much freedom can bend itself around accidental patterns in the training songs (an unusual word that happened to appear in a few Pop songs). Charging a fee for large coefficients makes the model keep only patterns that pay for themselves across many songs.</p>',
    example: SRC('69 to 70', MD('J_k = L_k + \\lambda\\left(b_k^2 + \\sum_j w_{kj}^2\\right)') + '<p>λ is the chosen penalty weight (a hyperparameter). Note that the lecture\'s penalty includes the intercept b_k. Penalty gradient for one coefficient: ' + M('\\frac{\\partial}{\\partial w_j}(\\lambda w_j^2) = 2\\lambda w_j') + ', pointing toward zero. Gradient update:</p>' + MD('w_j^{\\text{new}} = w_j - \\eta\\left(\\frac{\\partial L}{\\partial w_j} + 2\\lambda w_j\\right) = (1 - 2\\eta\\lambda)w_j - \\eta\\frac{\\partial L}{\\partial w_j}')) +
      SRC('71', '<p>Same 10,000 word features, penalty strength from 0.01× to 100× the current model: training loss rises steadily with stronger penalties, while validation loss is high at 0.01× (weak penalty, overfitting), falls to its lowest around a moderate penalty, and rises again at 100× (underfitting). Moderate penalty → lowest validation loss in this comparison.</p>'),
    steps: LEDGER([
      ['w = 0.8,\\ \\eta = 0.1,\\ \\lambda = 0.5,\\ \\partial L/\\partial w = 0.2', 'Illustrative numbers.', 'plain'],
      ['1 - 2\\eta\\lambda = 1 - 2(0.1)(0.5) = 0.9', 'Shrink factor: keep 90% of the coefficient.', 'plain'],
      ['w^{\\text{new}} = 0.9(0.8) - 0.1(0.2) = 0.72 - 0.02 = 0.70', 'Shrink first, then the ordinary gradient step.']
    ]),
    lab: 'reg',
    labIntro: '<p>The lab fits a degree-9 polynomial to 12 constructed points and recomputes the fit for every λ. Slide log₁₀ λ from −7 to 1 and watch the blue validation curve bottom out in the middle.</p>',
    mistakes: ['Choosing λ by training loss. Training loss always prefers λ → 0.', 'Thinking the penalty only acts on large coefficients. Every coefficient shrinks by the same factor each step.', 'Forgetting the factor 2 in 2λw.', 'Calling λ a fitted parameter. It is a hyperparameter chosen on validation data.'],
    connect: CHAIN(['Many features', 'Overfitting', 'Penalty λΣw²', 'Choose λ on validation', 'Final test'], 2) + '<p>Bias versus variance (Lecture 7, p. 59) is the same trade-off: a strong penalty is "too simple", a weak one "too flexible".</p>',
    tryq: 'l9-reg-t'
  }),
  revise: {formulas: ['l2-penalty', 'l2-update'], when: 'Many coefficients relative to data; choosing λ; one penalized update.', formats: ['Compute one penalized update.', 'Which λ from training and validation curves?', 'Effect of increasing λ.'], traps: ['λ from training loss.', 'Factor 2.', 'Intercept is penalized in this lecture.']},
  prereq: ['l9-genre', 'l7-poly'], next: ['l9-eval']
});

LESSON({id: 'l9-eval', lec: 9, title: 'Confusion matrices and accuracy', pages: '77 to 80, 91', keys: 'confusion matrix accuracy baseline majority class rap one vs rest binary tp fp fn tn micro accuracy weights',
  quick: {what: 'A confusion matrix counts every (actual, predicted) pair; accuracy is the diagonal over the total.', why: 'Accuracy alone hides which genres fail, and a majority baseline can look decent.', idea: 'For one genre, collapse the matrix: TP is its diagonal cell, FN the rest of its row, FP the rest of its column, TN everything else.', remember: 'Rows = actual, columns = predicted (in this lecture).'},
  learn: LEARN({
    problem: '<p>The initial unigram TF-IDF model predicts a genre for each of 5,774 validation songs. Where does it go wrong?</p>',
    model: '<p>The matrix is a grid of "was X, predicted Y". Correct predictions sit on the diagonal. Off-diagonal cells are specific confusions, such as Rock songs predicted as Pop.</p>',
    example: SRC('77 to 79', '<p>Validation songs, initial unigram TF-IDF model; rows are the actual genre, columns the predicted genre:</p>' + TABLE(['Actual \\ Predicted', 'Country', 'Pop', 'Rap', 'R&B', 'Rock'], [['Country', '5', '101', '20', '0', '71'], ['Pop', '0', '1,146', '165', '21', '444'], ['Rap', '0', '125', '1,822', '10', '59'], ['R&B', '0', '221', '110', '34', '37'], ['Rock', '0', '533', '66', '4', '780']]) + MD('\\text{Accuracy} = \\frac{5 + 1146 + 1822 + 34 + 780}{5774} = \\frac{3787}{5774} \\approx 0.656') + '<p>Baseline: always predict Rap, the largest class: 2,016 of 5,774 correct, accuracy ≈ 0.349.</p>') +
      SRC('80, 91', TABLE(['R&B vs other', 'Predicted R&B', 'Predicted other'], [['Actual R&B', 'TP = 34', 'FN = 368'], ['Other', 'FP = 35', 'TN = 5,337']]) + '<p>Same songs and predictions, now grouped around R&B. Accuracy implicitly weights genres by size: ' + M('\\text{Accuracy} = \\frac{\\sum_k \\mathrm{TP}_k}{N} = \\sum_k \\frac{n_k}{N}R_k') + ' with ' + M('\\mathrm{TP}_k = n_k R_k') + '. Rap is 2016/5774 ≈ 34.9% of the songs, Country only 197/5774 ≈ 3.4%.</p>'),
    steps: LEDGER([
      ['\\mathrm{TP}_{\\text{R\\&B}} = 34', 'Diagonal cell: actual R&B, predicted R&B.', 'plain'],
      ['\\mathrm{FN} = 0 + 221 + 110 + 37 = 368', 'Rest of the R&B row: R&B songs predicted as something else. Row total 402.', 'plain'],
      ['\\mathrm{FP} = 0 + 21 + 10 + 4 = 35', 'Rest of the R&B column: other songs predicted R&B.', 'plain'],
      ['\\mathrm{TN} = 5774 - 34 - 368 - 35 = 5337', 'Everything else.']
    ]),
    lab: 'confusion',
    mistakes: ['Reading FP from the row and FN from the column (swapped). Check which axis is "actual".', 'Comparing a model\'s accuracy without the majority baseline (0.349 here).', 'Thinking accuracy treats every genre equally; it is dominated by large classes.'],
    connect: CHAIN(['Predictions', 'Confusion matrix', 'Per-class TP, FP, FN', 'Precision, recall, F1'], 1),
    tryq: 'l9-eval-t'
  }),
  revise: {formulas: ['accuracy', 'onevsrest-cells'], when: 'Summarizing classifier results; extracting a binary matrix for one class.', formats: ['Compute accuracy from a matrix.', 'Extract TP, FP, FN, TN for one class.', 'Majority baseline accuracy.'], traps: ['Row versus column.', 'Baseline comparison.']},
  prereq: ['l9-genre', 'l6-eval'], next: ['l9-prf']
});

LESSON({id: 'l9-prf', lec: 9, title: 'Precision, recall and F1', pages: '81 to 90', keys: 'precision recall f1 harmonic mean macro f1 errors per correct prediction country r&b',
  quick: {what: 'Precision asks "of the songs we called R&B, how many were?"; recall asks "of the actual R&B songs, how many did we find?"; F1 combines both.', why: 'A model can be precise but miss almost everything (Country: precision 1, recall 0.025).', idea: 'F1 = 2TP ÷ (2TP + FP + FN): both error types lower it. Macro F1 averages F1 across classes equally.', remember: 'Precision divides by predicted positives (column); recall by actual positives (row).'},
  learn: LEARN({
    problem: '<p>R&B has 34 correct predictions. Is that good? It depends on how many R&B songs we missed and how many non-R&B songs we wrongly called R&B.</p>',
    model: '<p>Precision is the purity of what you caught. Recall is the coverage of what was there. A net that catches only one fish, and it is the right species, has perfect precision and terrible recall.</p>',
    example: SRC('81 to 85', MD('P = \\frac{\\mathrm{TP}}{\\mathrm{TP} + \\mathrm{FP}} = \\frac{34}{69} \\approx 0.493,\\qquad R = \\frac{\\mathrm{TP}}{\\mathrm{TP} + \\mathrm{FN}} = \\frac{34}{402} \\approx 0.085') + '<p>Errors per correct R&B prediction: ' + M('\\mathrm{FP}/\\mathrm{TP} = 35/34 \\approx 1.029') + ' and ' + M('\\mathrm{FN}/\\mathrm{TP} = 368/34 \\approx 10.824') + '. Average them: ' + M('E = \\frac{1}{2}\\left(\\frac{\\mathrm{FP}}{\\mathrm{TP}} + \\frac{\\mathrm{FN}}{\\mathrm{TP}}\\right) = \\frac{\\mathrm{FP} + \\mathrm{FN}}{2\\mathrm{TP}}') + ', then</p>' + MD('F_1 = \\frac{1}{1 + E} = \\frac{2\\mathrm{TP}}{2\\mathrm{TP} + \\mathrm{FP} + \\mathrm{FN}} = \\frac{68}{471} \\approx 0.144') + '<p>E = 0 gives F1 = 1; as E grows, F1 falls. Both error counts reduce F1.</p>') +
      SRC('86 to 90', '<p>Since ' + M('1/P = 1 + \\mathrm{FP}/\\mathrm{TP}') + ' and ' + M('1/R = 1 + \\mathrm{FN}/\\mathrm{TP}') + ', ' + M('F_1 = \\frac{2}{1/P + 1/R} = \\frac{2PR}{P + R}') + ', the harmonic mean. Country: precision 5/5 = 1, recall 5/197 ≈ 0.025, arithmetic mean ≈ 0.513 but F1 = 10/(10 + 0 + 192) ≈ 0.050. High precision alone leaves missed songs unresolved.</p>' + TABLE(['Genre', 'TP', 'FP', 'FN', 'F1'], [['Country', '5', '0', '192', '0.050'], ['Pop', '1,146', '980', '630', '0.587'], ['Rap', '1,822', '361', '194', '0.868'], ['R&B', '34', '35', '368', '0.144'], ['Rock', '780', '611', '603', '0.562']]) + MD('F_1^{\\text{macro}} = \\frac{0.050 + 0.587 + 0.868 + 0.144 + 0.562}{5} \\approx 0.442') + '<p>Macro averaging gives every genre an equal share.</p>'),
    steps: LEDGER([
      ['P = \\frac{34}{34 + 35}', 'Denominator: everything predicted R&B (the R&B column total, 69).', 'plain'],
      ['R = \\frac{34}{34 + 368}', 'Denominator: everything actually R&B (the R&B row total, 402).', 'plain'],
      ['F_1 = \\frac{2(34)}{2(34) + 35 + 368} = \\frac{68}{471} \\approx 0.144', 'Check: 2PR ÷ (P + R) = 2(0.493)(0.085) ÷ 0.578 ≈ 0.144.']
    ]),
    lab: 'confusion',
    labIntro: '<p>Select R&B, then increase the R&B diagonal cell and decrease the Pop cell in the same row: recall rises, and F1 follows.</p>',
    mistakes: ['Swapping precision and recall denominators. Precision: TP + FP (predicted). Recall: TP + FN (actual).', 'Averaging precision and recall arithmetically (Country would look like 0.513 instead of 0.050).', 'Thinking high precision means a good classifier for that class.', 'Computing macro F1 by pooling counts across classes (that is a micro average).'],
    connect: CHAIN(['Confusion matrix', 'Precision and recall', 'F1', 'Macro F1 and class weighting'], 2),
    tryq: 'l9-prf-t'
  }),
  revise: {formulas: ['precision', 'recall', 'f1', 'macro-f1'], when: 'Per-class evaluation, especially for rare classes.', formats: ['Compute P, R, F1 from TP, FP, FN.', 'Macro F1 from per-class F1.', 'Why not the arithmetic mean?'], traps: ['Denominator swap.', 'Arithmetic mean.', 'Micro versus macro.']},
  prereq: ['l9-eval'], next: ['l9-tuning']
});

LESSON({id: 'l9-tuning', lec: 9, title: 'Class weighting, hyperparameters and the final test', pages: '92 to 99', keys: 'hyperparameters parameters class weighting balanced loss imbalance validation test bigrams macro f1 multimodal latent',
  quick: {what: 'Hyperparameters (unigrams or word pairs, vocabulary cap, class weighting) are chosen on validation; fitted parameters (b_k, w_kj) are learned on training.', why: 'With 515 Country songs versus 17,733 others, the loss barely notices Country unless we reweight it.', idea: 'Balanced loss averages each group separately and then averages the two: equal group means.', remember: 'Choose hyperparameters → fit coefficients → compare on validation → test once.'},
  learn: LEARN({
    problem: SRC('93', '<p>Country training targets: n₊ = 515 Country songs and n₋ = 17,733 others. The ordinary loss ' + M('L = \\frac{\\sum_{i:y_i=1}\\ell_i + \\sum_{i:y_i=0}\\ell_i}{18248}') + ' lets the other genres dominate. Imbalance during fitting gives imbalance in validation.</p>'),
    model: '<p>Make the two groups equal voices: average the Country losses on their own, average the other losses on their own, then average those two numbers. Each Country song now counts far more.</p>',
    example: SRC('92, 94 to 96', '<p>Hyperparameters: unigrams or word pairs, vocabulary cap, class weighting. Fitted parameters: intercepts b_k and word coefficients w_kj.</p>' + MD('L_{\\text{balanced}} = \\frac{1}{2}\\left(\\frac{1}{n_+}\\sum_{i:y_i=1}\\ell_i + \\frac{1}{n_-}\\sum_{i:y_i=0}\\ell_i\\right)') + '<p>Same log loss, different group weights. Validation F1 per genre:</p>' + TABLE(['Genre', 'Equal song weights', 'Equal group means'], [['Country', '0.050', '0.324'], ['Pop', '0.587', '0.533'], ['Rap', '0.868', '0.868'], ['R&B', '0.144', '0.313'], ['Rock', '0.562', '0.577']]) + TABLE(['Inputs', 'Loss weighting', 'Accuracy', 'Macro F1'], [['TF', 'Equal song weights', '0.645', '0.417'], ['TF-IDF', 'Equal song weights', '0.656', '0.442'], ['TF-IDF', 'Equal group means', '0.632', '0.523'], ['Bigram-only TF-IDF', 'Equal group means', '0.612', '0.483'], ['TF-IDF + bigrams', 'Equal group means', '0.641', '0.528']])) +
      SRC('97 to 99', '<p>Final test on new artist credits, selected pipeline on 5,978 test songs: F1 Country 0.222, Pop 0.493, Rap 0.868, R&B 0.293, Rock 0.564; accuracy ≈ 0.636, macro F1 ≈ 0.488. Next ideas: multi-word features that capture shared "latent" semantics (love and affection, money and cash); lyrics are incomplete evidence, so combine them with audio features into multimodal inputs ' + M('\\mathbf{x} = [t_1, \\dots, t_V, a_1, \\dots, a_5] \\in \\mathbb{R}^{V+5}') + '.</p>'),
    steps: XTRA('<p>How much more each Country song counts under balancing (computed here):</p>', 'Extra worked numbers') + LEDGER([
      ['\\text{Country song weight} = \\frac{1}{2 \\times 515} \\approx 0.000971', 'Its share of the balanced loss.', 'plain'],
      ['\\text{other song weight} = \\frac{1}{2 \\times 17733} \\approx 0.0000282', 'Each of the many other songs.', 'plain'],
      ['\\frac{17733}{515} \\approx 34.4', 'A Country song counts about 34 times as much as another song.']
    ]) + '<p>Balancing raised Country F1 from 0.050 to 0.324 and R&B from 0.144 to 0.313, lowered accuracy from 0.656 to 0.632, and raised macro F1 from 0.442 to 0.523: a trade the macro metric rewards.</p>',
    mistakes: ['Choosing hyperparameters on the test set. Test is used once, at the end.', 'Calling b_k and w_kj hyperparameters. They are fitted parameters.', 'Expecting class weighting to raise accuracy. Here it lowered accuracy and raised macro F1.'],
    connect: CHAIN(['Hyperparameters', 'Fit on training', 'Compare on validation', 'Test once'], 2),
    tryq: 'l9-tuning-t'
  }),
  revise: {formulas: ['balanced-loss', 'macro-f1'], when: 'Imbalanced classes; deciding what is tuned versus fitted; reporting a final result.', formats: ['Parameter or hyperparameter?', 'Why does balancing help rare classes?', 'Pick a model from a validation table.'], traps: ['Test-set tuning.', 'Parameter versus hyperparameter.', 'Accuracy versus macro F1.']},
  prereq: ['l9-prf', 'l9-reg'], next: []
});
