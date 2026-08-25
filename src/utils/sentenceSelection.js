import { normalizeSentenceText } from './sentenceCatalog';
import { getDueSentenceReviews } from './sentenceReview';

const shuffle = (items, rng) => {
  const output = [...items];
  for (let index = output.length - 1; index > 0; index -= 1) {
    const other = Math.floor(rng() * (index + 1));
    [output[index], output[other]] = [output[other], output[index]];
  }
  return output;
};

const starterOf = sentence => normalizeSentenceText(sentence.en).split(' ').slice(0, 2).join(' ');

const bucketForRole = (pool, role, target) => {
  switch (role) {
    case 'review': return pool.filter(item => item.difficulty >= target - 15 && item.difficulty <= target - 6);
    case 'easy': return pool.filter(item => item.difficulty >= target - 10 && item.difficulty <= target - 4);
    case 'challenge': return pool.filter(item => item.difficulty >= target + 3 && item.difficulty <= target + 8);
    default: return pool.filter(item => Math.abs(item.difficulty - target) <= 5);
  }
};

const chooseVaried = (candidates, selected, rng, phraseStats = {}) => {
  const categories = new Set(selected.map(item => item.category));
  const starters = new Set(selected.map(starterOf));
  return shuffle(candidates, rng)
    .map(item => ({
      item,
      variety: (categories.has(item.category) ? 0 : 4)
        + (starters.has(starterOf(item)) ? 0 : 2)
        - Math.min(4, Math.max(0, (phraseStats[item.en]?.correct || 0) - (phraseStats[item.en]?.wrong || 0))),
    }))
    .sort((a, b) => b.variety - a.variety)[0]?.item;
};

/**
 * Monta uma partida em torno da habilidade: 60% núcleo, revisão, item fácil
 * e desafio sempre limitado a no máximo oito pontos acima do alvo.
 */
export const selectSentenceSet = ({
  sentences,
  targetDifficulty,
  count = 5,
  recentSentenceIds = [],
  reviewQueue = [],
  completedGames = 0,
  phraseStats = {},
  rng = Math.random,
}) => {
  const target = Math.max(1, Math.min(100, Math.round(targetDifficulty || 1)));
  const recent = new Set(recentSentenceIds);
  const waitingReviewIds = new Set(
    reviewQueue.filter(item => item.dueGame > completedGames).map(item => item.sentenceId),
  );
  const fresh = (sentences || []).filter(item => !recent.has(item.id) && !waitingReviewIds.has(item.id));
  const boundedFresh = fresh.filter(item => item.difficulty <= target + 8);
  const boundedAll = (sentences || []).filter(item =>
    item.difficulty <= target + 8 && !waitingReviewIds.has(item.id));
  const basePool = boundedFresh.length >= count ? boundedFresh : boundedAll;
  const roles = ['core', 'core', 'core', 'review', rng() < 0.5 ? 'easy' : 'challenge'];
  const selected = [];
  const dueReviews = getDueSentenceReviews(reviewQueue, completedGames);
  const dueCandidates = dueReviews
    .map(review => (sentences || []).find(item => item.id === review.sentenceId))
    .filter(item => item && item.difficulty <= target + 12);
  const due = chooseVaried(dueCandidates, selected, rng, phraseStats);
  if (due) selected.push(due);
  const pendingCategories = new Set(reviewQueue.map(item => item.category));

  for (let index = selected.length; index < count; index += 1) {
    const role = roles[index % roles.length];
    const unused = basePool.filter(item => !selected.includes(item));
    let candidates = bucketForRole(unused, role, target);
    if (role === 'review' && pendingCategories.size > 0) {
      const related = unused.filter(item => pendingCategories.has(item.category));
      if (related.length > 0) candidates = related;
    }
    if (candidates.length === 0) candidates = bucketForRole(unused, 'core', target);
    if (candidates.length === 0) {
      candidates = [...unused].sort((a, b) =>
        Math.abs(a.difficulty - target) - Math.abs(b.difficulty - target));
      candidates = candidates.slice(0, Math.max(12, count * 3));
    }
    const chosen = chooseVaried(candidates, selected, rng, phraseStats);
    if (chosen) selected.push(chosen);
  }

  return shuffle(selected, rng);
};

export { starterOf as getSentenceStarter };
