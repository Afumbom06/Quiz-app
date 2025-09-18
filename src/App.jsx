import React, { useEffect, useState, useRef } from "react";
import QuestionCard from "./components/QuestionCard";
import ProgressBar from "./components/ProgressBar";
import ScoreScreen from "./components/ScoreScreen";
import { playCorrect, playWrong } from "./utils/sound";

const SUBJECTS = {
  Gaming: [
    { id: 1, question: "Which company created the Mario franchise?", options: ["Nintendo", "Sony", "Microsoft", "Sega"], answer: "Nintendo" },
    { id: 2, question: "Which platform introduced the DualShock controller?", options: ["Xbox", "Nintendo 64", "PlayStation", "GameCube"], answer: "PlayStation" },
    { id: 3, question: "In gaming, FPS stands for?", options: ["Frames Per Second", "First-Person Shooter", "Fast Player Score", "Field Play System"], answer: "First-Person Shooter" },
    { id: 4, question: "Which game popularized the battle royale genre in 2017?", options: ["Fortnite", "PUBG", "Apex Legends", "H1Z1"], answer: "PUBG" },
    { id: 5, question: "What color is commonly associated with the 'Truth' item in Among Us?", options: ["Red", "Green", "Blue", "Yellow"], answer: "Green" },
  ],
  Science: [
    { id: 1, question: "What is the chemical symbol for water?", options: ["O2", "H2O", "CO2", "HO"], answer: "H2O" },
    { id: 2, question: "Which planet is known as the Red Planet?", options: ["Mars", "Venus", "Jupiter", "Saturn"], answer: "Mars" },
  ],
  Math: [
    { id: 1, question: "What is 12 × 8?", options: ["96", "84", "108", "92"], answer: "96" },
    { id: 2, question: "Square root of 144?", options: ["10", "12", "14", "16"], answer: "12" },
  ],
};

export default function App() {
  const [subject, setSubject] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [timeLeft, setTimeLeft] = useState(10);
  const [finished, setFinished] = useState(false);
  const [search, setSearch] = useState("");

  const timerRef = useRef(null);

  useEffect(() => {
    setSelected(null);
    setFeedback(null);
    setTimeLeft(10);
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [current]);

  useEffect(() => {
    if (finished || !subject) return;
    if (selected) return;
    if (timeLeft <= 0) {
      handleTimeout();
      return;
    }
    const t = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, selected, finished, subject]);

  const handleTimeout = () => {
    setFeedback("wrong");
    playWrong();
    timerRef.current = setTimeout(() => moveNext(), 1100);
  };

  const handleAnswer = (option) => {
    if (selected) return;
    setSelected(option);
    const correct = questions[current].answer === option;
    if (correct) {
      setScore((s) => s + 1);
      setFeedback("correct");
      try { playCorrect(); } catch {}
    } else {
      setFeedback("wrong");
      try { playWrong(); } catch {}
    }
    timerRef.current = setTimeout(() => moveNext(), 1200);
  };

  const moveNext = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setSelected(null);
    setFeedback(null);
    setTimeLeft(10);
    setCurrent((prev) => {
      if (prev + 1 < questions.length) return prev + 1;
      setFinished(true);
      return prev;
    });
  };

  const restart = () => {
    setCurrent(0);
    setScore(0);
    setSelected(null);
    setFeedback(null);
    setTimeLeft(10);
    setFinished(false);
  };

  const chooseSubject = (name) => {
    setSubject(name);
    setQuestions(SUBJECTS[name]);
    restart();
  };

  return (
    <div className="app">
      {!subject ? (
        <>
          <div className="header">
            <div>
              <div className="title">Quiz Game 🎯</div>
              <div className="subtitle">Choose a subject to start</div>
            </div>
          </div>

          <input
            type="text"
            placeholder="Search subjects..."
            className="search-bar"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <div className="subjects-grid">
            {Object.keys(SUBJECTS)
              .filter((s) => s.toLowerCase().includes(search.toLowerCase()))
              .map((s) => (
                <div key={s} className="subject-card" onClick={() => chooseSubject(s)}>
                  {s}
                </div>
              ))}
          </div>
        </>
      ) : !finished ? (
        <>
          <div className="header">
            <div>
              <div className="title">{subject} Quiz</div>
              <div className="subtitle">Try to get them all right!</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontWeight: 700 }}>{score} pts</div>
              <div style={{ fontSize: 12, color: "var(--muted)" }}>Score</div>
            </div>
          </div>

          <ProgressBar current={current} total={questions.length} />
          <div style={{ height: 12 }} />
          <QuestionCard item={questions[current]} onAnswer={handleAnswer} selected={selected} feedback={feedback} />

          <div className="row">
            <div className="progress-wrap" style={{ flex: "0 1 60%" }}></div>
            <div className="timer">
              <span style={{ fontSize: 12, color: "var(--muted)" }}>Time</span>
              <strong>{timeLeft}s</strong>
            </div>
          </div>
        </>
      ) : (
        <ScoreScreen score={score} total={questions.length} onRestart={() => setSubject(null)} />
      )}
    </div>
  );
}
