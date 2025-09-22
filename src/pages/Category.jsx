import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import questionsDB from '../data/questions.js';
import categories from '../data/categories.js';
import { saveScore } from '../utils/leaderboard.js';
import { buildAdaptivePools, pickAdaptiveQuestion } from '../utils/questionPool.js';

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
  // Adaptive session state stored in localStorage per category
  const sessionKey = `quiz_session_${id}`;
  const savedSession = JSON.parse(localStorage.getItem(sessionKey) || 'null');
  // prefer saved session size; otherwise use the global session_size from Home (so Home selector controls new sessions)
  const sessionSize = savedSession?.sessionSize || Number(localStorage.getItem('session_size') || 10);
  const [index, setIndex] = useState(savedSession?.index || 0);
  const [score, setScore] = useState(savedSession?.score || 0);
  const [difficulty, setDifficulty] = useState(savedSession?.difficulty || 'easy');
  const [previouslyAskedIds, setPreviouslyAskedIds] = useState(savedSession?.previouslyAskedIds || []);

  // Build adaptive pools from full DB for this category
  const pools = React.useMemo(() => buildAdaptivePools(questionsDB[id] || []), [id]);
  const availableCount = (questionsDB[id] || []).length;

  // current question is chosen adaptively if not restored
  const [currentQuestion, setCurrentQuestion] = useState(() => savedSession?.currentQuestion || null);

  const QUESTION_TIME = 12; // seconds
  const [selected, setSelected] = useState(null);
  const [finished, setFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME);
  const timerRef = useRef(null);


  // When index/score/difficulty change, persist session
  useEffect(() => {
    localStorage.setItem(sessionKey, JSON.stringify({ sessionSize, index, score, difficulty, previouslyAskedIds, currentQuestion }));
  }, [index, score, difficulty, previouslyAskedIds, currentQuestion, sessionKey, sessionSize]);

  // pick initial question on mount if none
  useEffect(() => {
    // If a saved session already reached its sessionSize, treat as finished
    if (savedSession && typeof savedSession.sessionSize === 'number' && savedSession.index >= savedSession.sessionSize) {
      setFinished(true);
      return;
    }

    if (!currentQuestion && !finished) {
      const res = pickAdaptiveQuestion(pools, previouslyAskedIds, difficulty);
      if (res.question) setCurrentQuestion(res.question);
      else setFinished(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // start timer for current question
  useEffect(() => {
    setTimeLeft(QUESTION_TIME);
    setSelected(null);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft(t => t - 1);
    }, 1000);
    return () => clearInterval(timerRef.current);

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
    const isCorrect = currentQuestion && i === currentQuestion.answer;
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

  // manage streaks to escalate difficulty
  const [streak, setStreak] = useState(savedSession?.streak || 0);

  const nextQuestion = (wasCorrect) => {
    // gather nextPreviouslyAsked synchronously
    const nextPreviouslyAsked = currentQuestion && currentQuestion.id != null ? [...previouslyAskedIds, currentQuestion.id] : previouslyAskedIds.slice();
    setPreviouslyAskedIds(nextPreviouslyAsked);

    // update streak and difficulty
    if (wasCorrect) setStreak(s => s + 1);
    else setStreak(0);

    setDifficulty(d => {
      if (wasCorrect && streak + 1 >= 2) {
        if (d === 'easy') return 'medium';
        if (d === 'medium') return 'hard';
        return d;
      }
      if (!wasCorrect) {
        if (d === 'hard') return 'medium';
        if (d === 'medium') return 'easy';
      }
      return d;
    });

    // pick next adaptively using nextPreviouslyAsked
    const res = pickAdaptiveQuestion(pools, nextPreviouslyAsked, difficulty);
    // If we've already reached the configured session size, finish the quiz
    if (index + 1 >= sessionSize) {
      setFinished(true);
      setCurrentQuestion(null);
      return;
    }

    if (res.question) {
      setCurrentQuestion(res.question);
      setIndex(i => i + 1);
    } else {
      // no more available questions in pools
      setFinished(true);
      setCurrentQuestion(null);
    }
  };

  const restart = () => {
    setIndex(0);
    setScore(0);
    setSelected(null);
    setFinished(false);
    setTimeLeft(QUESTION_TIME);
    setPreviouslyAskedIds([]);
    setDifficulty('easy');
    setStreak(0);
    setCurrentQuestion(null);
    // Reset session in localStorage
    localStorage.removeItem(sessionKey);
  };

  const progressPct = Math.round((index / sessionSize) * 100);

  return (
    <main className="quiz-page">
      {availableCount < sessionSize && (
        <div className="category-warning" style={{background:'#fff3cd',border:'1px solid #ffeeba',padding:12,borderRadius:8,margin:'12px 16px'}}>
          <strong>Notice:</strong> This category has only {availableCount} unique question{availableCount === 1 ? '' : 's'}, which is less than the selected session size of {sessionSize}. The quiz will end after {availableCount} question{availableCount === 1 ? '' : 's'}.
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

          <div className="q-text">{currentQuestion ? currentQuestion.q : 'No more questions'}</div>

          <div className="options">
            {currentQuestion && currentQuestion.options.map((opt, i) => {
              let cls = 'option';
              if (selected === null) cls = 'option';
              else {
                if (i === currentQuestion.answer) cls = 'option correct';
                else if (selected === i) cls = 'option wrong';
                else cls = 'option dim';
              }
              // if timeout, show correct green and mark others dim
              if (selected === 'timeout') {
                cls = i === currentQuestion.answer ? 'option correct' : 'option dim';
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
          <p>Your score: <strong>{score}</strong> / {sessionSize}</p>
          <NameInput onSave={name => {
            saveScore({ name, score });
            navigate('/leaderboard');
          }} />
          <div className="result-actions">
            <button onClick={restart} className="playagain">Play again</button>
            <button onClick={() => navigate('/')} className="backhome">Back to Categories</button>
          </div>
        </div>
      )}
    </main>
  );
}

// NameInput component for entering and saving player name
function NameInput({ onSave }) {
  const [name, setName] = useState(localStorage.getItem('player_name') || '');
  const [submitted, setSubmitted] = useState(false);
  function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) return;
    localStorage.setItem('player_name', name);
    setSubmitted(true);
    onSave(name);
  }
  if (submitted) return <div className="name-saved">Score saved!</div>;
  return (
    <form className="name-input-form" onSubmit={handleSubmit} style={{margin:'16px 0'}}>
      <input
        className="name-input"
        type="text"
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder="Enter your name"
        maxLength={18}
        required
        style={{padding:'8px',borderRadius:8,border:'1px solid #ccc',marginRight:8}}
      />
      <button type="submit" className="save-btn" style={{padding:'8px 16px',borderRadius:8,background:'#1dd17d',color:'#fff',border:'none',fontWeight:700}}>Save Score</button>
    </form>
  );
}
