// src/utils/leaderboard.js
// Utility functions for managing player profiles and high scores using localStorage

const LEADERBOARD_KEY = 'quiz_leaderboard';

export function getLeaderboard() {
  const data = localStorage.getItem(LEADERBOARD_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveScore({ name, score }) {
  const leaderboard = getLeaderboard();
  leaderboard.push({ name, score, date: new Date().toISOString() });
  leaderboard.sort((a, b) => b.score - a.score);
  // Keep only top 20 scores
  const trimmed = leaderboard.slice(0, 20);
  localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(trimmed));
  return trimmed;
}

export function clearLeaderboard() {
  localStorage.removeItem(LEADERBOARD_KEY);
}
