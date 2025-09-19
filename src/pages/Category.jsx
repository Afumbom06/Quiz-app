import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import questionsDB from '../data/questions.js';
import categories from '../data/categories.js';

/*
 Category quiz page:
 - Timer per question (configurable)
 - Visual progress
 - Sound effects via WebAudio
 - Immediate feedback (green/red)
*/

function useSound() {
  // small WebAudio helper for click/correct/wrong
  const ctxRef = useRef(null);
  function getCtx() {
    if (!ctxRef.current) ctxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    return ctxRef.current;
  }

  const click = () => {
    const ctx = getCtx();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'sine';
    o.frequency.value = 900;
    g.gain.value = 0.02;
    o.connect(g);
    g.connect(ctx.destination);
    o.start();
    setTimeout(() => { o.stop(); }, 70);
  };

  const correct = () => {
    const ctx = getCtx();
    const o = ctx.createOscillator();
    const o2 = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'sine';
    o2.type = 'sine';
    o.frequency.value = 600;
    o2.frequency.value = 900;
    g.gain.value = 0.02;
    o.connect(g); o2.connect(g); g.connect(ctx.destination);
    o.start(); o2.start();
    setTimeout(() => { o.stop(); o2.stop(); }, 220);
  };

  const wrong = () => {
    const ctx = getCtx();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'sawtooth';
    o.frequency.value = 240;
    g.gain.value = 0.03;
    o.connect(g); g.connect(ctx.destination);
    o.start();
    setTimeout(() => { o.stop(); }, 280);
  };

  return { click, correct, wrong };
}

export default function Category() {
  const { id } = useParams();
  const navigate = useNavigate();
  const sound = useSound();
  const category = categories.find(c => c.id === id) || { name: 'Unknown', icon: '❓', colorStart: '#ddd', colorEnd: '#bbb' };
  const questions = questionsDB[id] || [{ id: 0, q: 'No questions yet', options: ['OK'], answer: 0 }];

  const QUESTION_TIME = 12; // seconds
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME);
  const timerRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);

  // start timer for current question
  useEffect(() => {
    setTimeLeft(QUESTION_TIME);
    setSelected(null);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft(t => t - 1);
    }, 1000);
    return () => clearInterval(timerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  // when time runs out
  useEffect(() => {
    if (timeLeft <= 0) {
      clearInterval(timerRef.current);
      // mark as wrong and move on shortly
      sound.wrong();
      setSelected('timeout'); // special state
      setTimeout(() => {
        nextQuestion(false); // false because not correct
      }, 700);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft]);

  const choose = (i) => {
    if (selected !== null) return;
    sound.click();
    setSelected(i);
    const isCorrect = i === questions[index].answer;
    if (isCorrect) {
      setScore(s => s + 1);
      sound.correct();
    } else {
      sound.wrong();
    }
    // freeze timer and move to next after short delay
    clearInterval(timerRef.current);
    setTimeout(() => {
      nextQuestion(isCorrect);
    }, 800);
  };

  const nextQuestion = (wasCorrect) => {
    if (index + 1 < questions.length) {
      setIndex(index + 1);
    } else {
      setFinished(true);
    }
  };

  const restart = () => {
    setIndex(0);
    setScore(0);
    setSelected(null);
    setFinished(false);
    setTimeLeft(QUESTION_TIME);
  };

  const progressPct = Math.round(((index) / questions.length) * 100);

  return (
    <main className="quiz-page">
      <button className="back-btn" onClick={() => navigate('/')}>← Back</button>

      <div className="quiz-header" style={{ background: `linear-gradient(90deg, ${category.colorStart}, ${category.colorEnd})` }}>
        <div className="cat-icon">{category.icon}</div>
        <div>
          <h2>{category.name}</h2>
          <div className="header-sub">Score: <strong>{score}</strong> • Q {index + 1}/{questions.length}</div>
        </div>
      </div>

      {!finished ? (
        <div className="question-card">
          <div className="q-top">
            <div className="progress">
              <div className="progress-bar" style={{ width: `${progressPct}%` }} />
            </div>

            <div className="timer-wrap">
              <div className="time-circle" aria-hidden>
                <svg viewBox="0 0 36 36" className="circular-chart">
                  <path className="circle-bg"
                        d="M18 2.0845
                           a 15.9155 15.9155 0 0 1 0 31.831
                           a 15.9155 15.9155 0 0 1 0 -31.831"/>
                  <path className="circle"
                        strokeDasharray={`${(timeLeft/QUESTION_TIME)*100}, 100`}
                        d="M18 2.0845
                           a 15.9155 15.9155 0 0 1 0 31.831
                           a 15.9155 15.9155 0 0 1 0 -31.831"/>
                </svg>
                <div className="time-text">{timeLeft}s</div>
              </div>
            </div>
          </div>

          <div className="q-text">{questions[index].q}</div>

          <div className="options">
            {questions[index].options.map((opt, i) => {
              let cls = 'option';
              if (selected === null) cls = 'option';
              else {
                if (i === questions[index].answer) cls = 'option correct';
                else if (selected === i) cls = 'option wrong';
                else cls = 'option dim';
              }
              // if timeout, show correct green and mark others dim
              if (selected === 'timeout') {
                cls = i === questions[index].answer ? 'option correct' : 'option dim';
              }
              return (
                <button key={i} className={cls} onClick={() => choose(i)} disabled={selected !== null}>
                  <span className="opt-letter">{String.fromCharCode(65 + i)}</span>
                  <span>{opt}</span>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="result-card">
          <h3>Quiz Finished!</h3>
          <p>Your score: <strong>{score}</strong> / {questions.length}</p>
          <div className="result-actions">
            <button onClick={restart} className="playagain">Play again</button>
            <button onClick={() => navigate('/')} className="backhome">Back to Categories</button>
          </div>
        </div>
      )}
    </main>
  );
}
