const fs = require('fs');
const path = require('path');

const QUESTIONS_PATH = path.join(__dirname, '..', 'src', 'data', 'questions.js');
const CATEGORY_PATH = path.join(__dirname, '..', 'src', 'data', 'categories.js');

function loadQuestions() {
  // require the file — run from project root
  try {
    const db = require(QUESTIONS_PATH);
    return db;
  } catch (err) {
    console.error('Failed to load questions:', err.message);
    process.exit(1);
  }
}

function loadCategories() {
  try {
    const cats = require(CATEGORY_PATH);
    return cats;
  } catch (err) {
    console.error('Failed to load categories:', err.message);
    process.exit(1);
  }
}

function main() {
  const questionsDB = loadQuestions();
  const categories = loadCategories();
  const defaultRequired = 20;

  console.log('Validating question counts per category (recommend >=', defaultRequired, 'questions)');

  let issues = 0;

  for (const c of categories) {
    const id = c.id;
    const name = c.name;
    const count = Array.isArray(questionsDB[id]) ? questionsDB[id].length : 0;
    if (count < defaultRequired) {
      issues++;
      console.log(`- ${name} (${id}): ${count} questions — BELOW recommended ${defaultRequired}`);
    } else {
      console.log(`- ${name} (${id}): ${count} questions`);
    }
  }

  if (issues > 0) {
    console.log(`\nFound ${issues} category(ies) below recommended count.`);
    process.exitCode = 2;
  } else {
    console.log('\nAll categories meet the recommended count.');
  }
}

main();
