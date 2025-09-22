// build a session of questions mixing easy -> medium -> hard
/**
 * Build a session of questions, mixing easy -> medium -> hard, avoiding repeats.
 * @param {Array} allQuestionsForCategory - All questions for the selected category
 * @param {Object} options - Options for session
 * @param {number} options.sessionSize - Number of questions in the session
 * @param {Array} [options.previouslyAskedIds] - Array of question IDs to avoid
 * @returns {Array} - Array of selected questions
 */
export function buildSessionQuestions(
  allQuestionsForCategory = [],
  { sessionSize = 20, previouslyAskedIds = [] } = {}
) {
  // Group by difficulty
  const byDiff = { easy: [], medium: [], hard: [] };
  allQuestionsForCategory.forEach(q => {
    const d = q.difficulty || 'easy';
    if (!byDiff[d]) byDiff[d] = [];
    // Avoid previously asked questions
    if (!previouslyAskedIds.includes(q.id)) {
      byDiff[d].push(q);
    }
  });

  const shuffle = (arr) => arr.slice().sort(() => Math.random() - 0.5);

  const easyPool = shuffle(byDiff.easy || []);
  const mediumPool = shuffle(byDiff.medium || []);
  const hardPool = shuffle(byDiff.hard || []);

  // pick counts: front-load easy, then medium, then hard
  const easyCount = Math.max(2, Math.floor(sessionSize * 0.4));
  const mediumCount = Math.max(2, Math.floor(sessionSize * 0.35));
  let hardCount = sessionSize - easyCount - mediumCount;
  if (hardCount < 0) hardCount = 0;

  const session = [];
  session.push(...easyPool.slice(0, easyCount));
  session.push(...mediumPool.slice(0, mediumCount));
  session.push(...hardPool.slice(0, hardCount));

  // backfill if not enough
  const combined = shuffle([...easyPool, ...mediumPool, ...hardPool]);
  for (const q of combined) {
    if (session.length >= sessionSize) break;
    if (!session.find(s => s.id === q.id)) session.push(q);
  }

  return shuffle(session).slice(0, sessionSize);
}

// Build pools grouped by difficulty (shuffled)
export function buildAdaptivePools(allQuestionsForCategory = []) {
  const shuffle = (arr) => arr.slice().sort(() => Math.random() - 0.5);
  const byDiff = { easy: [], medium: [], hard: [] };
  allQuestionsForCategory.forEach(q => {
    const d = q.difficulty || 'easy';
    if (!byDiff[d]) byDiff[d] = [];
    byDiff[d].push(q);
  });
  return {
    easy: shuffle(byDiff.easy || []),
    medium: shuffle(byDiff.medium || []),
    hard: shuffle(byDiff.hard || []),
  };
}

// Pick a question adaptively given pools and previously asked ids.
// difficultyPreference is 'easy'|'medium'|'hard'
export function pickAdaptiveQuestion(pools = { easy: [], medium: [], hard: [] }, previouslyAskedIds = [], difficultyPreference = 'easy') {
  const tryPick = (arr) => {
    for (const q of arr) {
      if (!previouslyAskedIds.includes(q.id)) return q;
    }
    return null;
  };

  // order to try based on preference: prefer same, then medium, then hard (if starting low)
  const order = (pref) => {
    if (pref === 'easy') return ['easy', 'medium', 'hard'];
    if (pref === 'medium') return ['medium', 'hard', 'easy'];
    return ['hard', 'medium', 'easy'];
  };

  for (const level of order(difficultyPreference)) {
    const q = tryPick(pools[level] || []);
    if (q) return { question: q, difficulty: level };
  }

  // nothing left
  return { question: null, difficulty: difficultyPreference };
}
