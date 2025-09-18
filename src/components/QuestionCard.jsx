import React from "react";

export default function QuestionCard({ item, onAnswer, selected, feedback }) {
  return (
    <div className="card">
      <h3 className="question">{item.question}</h3>

      <div className="options" role="list">
        {item.options.map((opt, idx) => {
          const isSelected = selected === opt;
          const cls =
            "option " +
            (isSelected ? (feedback === "correct" ? "correct" : "wrong") : "");
          return (
            <button
              key={idx}
              className={cls}
              onClick={() => onAnswer(opt)}
              disabled={!!selected}
              aria-pressed={isSelected}
              role="listitem"
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}
