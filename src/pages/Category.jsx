// src/pages/Category.jsx
import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import questionsDB from '../data/questions.js';
import categories from '../data/categories.js';
import { addOrUpdateScore } from '../utils/leaderboard.js';
import { buildAdaptivePools, pickAdaptiveQuestion } from '../utils/questionPool.js';

export default function Category() {
  const { id } = useParams();
  const navigate = useNavigate();
  const sound = useSound();

  const category = categories.find(c => c.id === id) || { name: 'Unknown', icon: '❓', colorStart: '#ddd', colorEnd: '#bbb' };

  const sessionKey = `quiz_session_${id}`;
  const savedSession = JSON.parse(localStorage.getItem(sessionKey) || 'null');
  const sessionSize = savedSession?.sessionSize || Number(localStorage.getItem('session_size') || 10);

  const [index, setIndex] = useState(savedSession?.index || 0);
  const [score, setScore] = useState(savedSession?.score || 0);
  const [difficulty, setDifficulty] = useState(savedSession?.difficulty || 'easy');
  const [previouslyAskedIds, setPreviouslyAskedIds] = useState(savedSession?.previouslyAskedIds || []);
  const [currentQuestion, setCurrentQuestion] = useState(savedSession?.currentQuestion || null);
  const [selected, setSelected] = useState(null);
  const [finished, setFinished] = useState(false);
  const [streak, setStreak] = useState(savedSession?.streak || 0);
  const [timeLeft, setTimeLeft] = useState(12);
  const timerRef = useRef(null);

  const availableCount = (questionsDB[id] || []).length;
  const pools = React.useMemo(() => buildAdaptivePools(questionsDB[id] || []), [id]);
  const progressPct = Math.round((index / sessionSize) * 100);

  // Persist session
  useEffect(() => {
    localStorage.setItem(sessionKey, JSON.stringify({ sessionSize, index, score, difficulty, previouslyAskedIds, currentQuestion, streak }));
  }, [index, score, difficulty, previouslyAskedIds, currentQuestion, streak, sessionKey, sessionSize]);

  // Pick initial question
  useEffect(() => {
    if (!currentQuestion && !finished) {
      const res = pickAdaptiveQuestion(pools, previouslyAskedIds, difficulty);
      if (res.question) setCurrentQuestion(res.question);
      else setFinished(true);
    }
  }, [currentQuestion, finished, pools, previouslyAskedIds, difficulty]);

  // Timer
  useEffect(() => {
    setTimeLeft(12);
    setSelected(null);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(timerRef.current);
  }, [index]);

  useEffect(() => {
    if (timeLeft <= 0 && !finished) {
      clearInterval(timerRef.current);
      sound.wrong();
      setSelected('timeout');
      setTimeout(() => nextQuestion(false), 700);
    }
  }, [timeLeft]);

  // Save score automatically when finished
  useEffect(() => {
    if (finished) {
      (async () => {
        try {
          await addOrUpdateScore(score);
        } catch (err) {
          console.error(err);
          alert('Failed to save score. Check your connection.');
        }
      })();
    }
  }, [finished, score]);

  const choose = (i) => {
    if (selected !== null) return;
    sound.click();
    setSelected(i);
    const isCorrect = currentQuestion && i === currentQuestion.answer;
    if (isCorrect) {
      setScore(s => s + 1);
      sound.correct();
    } else sound.wrong();

    clearInterval(timerRef.current);
    setTimeout(() => nextQuestion(isCorrect), 800);
  };

  const nextQuestion = (wasCorrect) => {
    const nextPreviouslyAsked = currentQuestion && currentQuestion.id != null ? [...previouslyAskedIds, currentQuestion.id] : previouslyAskedIds.slice();
    setPreviouslyAskedIds(nextPreviouslyAsked);

    setStreak(s => wasCorrect ? s + 1 : 0);

    setDifficulty(d => {
      if (wasCorrect && streak + 1 >= 2) return d === 'easy' ? 'medium' : d === 'medium' ? 'hard' : d;
      if (!wasCorrect) return d === 'hard' ? 'medium' : d === 'medium' ? 'easy' : d;
      return d;
    });

    const res = pickAdaptiveQuestion(pools, nextPreviouslyAsked, difficulty);
    if (index + 1 >= sessionSize || !res.question) {
      setFinished(true);
      setCurrentQuestion(null);
      return;
    }
    setCurrentQuestion(res.question);
    setIndex(i => i + 1);
  };

  const restart = () => {
    setIndex(0); setScore(0); setSelected(null); setFinished(false);
    setPreviouslyAskedIds([]); setDifficulty('easy'); setStreak(0); setCurrentQuestion(null);
    localStorage.removeItem(sessionKey);
  };

  return (
    <main className="quiz-page">
      {availableCount < sessionSize && (
        <div style={{ background:'#fff3cd', border:'1px solid #ffeeba', padding:12, borderRadius:8, margin:'12px 16px'}}>
          <strong>Notice:</strong> This category has only {availableCount} question{availableCount === 1 ? '' : 's'}, less than session size {sessionSize}. Quiz ends after available questions.
        </div>
      )}

      <button className="back-btn" onClick={() => navigate('/')}>← Back</button>

      <div className="quiz-header" style={{ background: `linear-gradient(90deg, ${category.colorStart}, ${category.colorEnd})` }}>
        <div className="cat-icon">{category.icon}</div>
        <div>
          <h2>{category.name}</h2>
          <div className="header-sub">Score: <strong>{score}</strong> • Q {Math.min(index + 1, sessionSize)}/{sessionSize}</div>
        </div>
      </div>

      {!finished ? (
        <div className="question-card">
          <div className="q-top">
            <div className="progress">
              <div className="progress-bar" style={{ width: `${progressPct}%` }} />
            </div>
            <div className="timer-wrap">
              <div className="time-circle">
                <svg viewBox="0 0 36 36" className="circular-chart">
                  <path className="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
                  <path className="circle" strokeDasharray={`${(timeLeft/12)*100}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
                </svg>
                <div className="time-text">{timeLeft}s</div>
              </div>
            </div>
          </div>
          <div className="q-text">{currentQuestion?.q || 'No more questions'}</div>
          <div className="options">
            {currentQuestion?.options.map((opt, i) => {
              let cls = 'option';
              if (selected !== null) cls = i === currentQuestion.answer ? 'option correct' : selected === i ? 'option wrong' : 'option dim';
              if (selected === 'timeout') cls = i === currentQuestion.answer ? 'option correct' : 'option dim';
              return <button key={i} className={cls} onClick={() => choose(i)} disabled={selected !== null}>
                <span className="opt-letter">{String.fromCharCode(65+i)}</span>
                <span>{opt}</span>
              </button>;
            })}
          </div>
        </div>
      ) : (
        <div className="result-card">
          <h3>Quiz Finished!</h3>
          <p>Your score: <strong>{score}</strong> / {sessionSize}</p>
          <div className="result-actions">
            <button onClick={restart} className="playagain">Play again</button>
            <button onClick={() => navigate('/')} className="backhome">Back to Categories</button>
          </div>
        </div>
      )}
    </main>
  );
}

// Sound effects hook
function useSound() {
  const ctxRef = useRef(null);
  const getCtx = () => {
    if (!ctxRef.current) ctxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    return ctxRef.current;
  };

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
    setTimeout(() => o.stop(), 70);
  };

  const correct = () => {
    const ctx = getCtx();
    const o1 = ctx.createOscillator();
    const o2 = ctx.createOscillator();
    const g = ctx.createGain();
    o1.type = 'sine';
    o2.type = 'sine';
    o1.frequency.value = 600;
    o2.frequency.value = 900;
    g.gain.value = 0.02;
    o1.connect(g);
    o2.connect(g);
    g.connect(ctx.destination);
    o1.start();
    o2.start();
    setTimeout(() => { o1.stop(); o2.stop(); }, 220);
  };

  const wrong = () => {
    const ctx = getCtx();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'sawtooth';
    o.frequency.value = 240;
    g.gain.value = 0.03;
    o.connect(g);
    g.connect(ctx.destination);
    o.start();
    setTimeout(() => o.stop(), 280);
  };

  return { click, correct, wrong };
}
