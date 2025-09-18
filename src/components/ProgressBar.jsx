import React from "react";

export default function ProgressBar({ current, total }) {
  const pct = Math.round(((current + 1) / total) * 100);
  return (
    <div className="progress-wrap" aria-hidden="false">
      <div className="progress" aria-label={`Progress: ${pct}%`}>
        <div className="progress-fill" style={{ width: `${pct}%` }} />
      </div>
      <div className="progress-text">Question {current + 1} of {total}</div>
    </div>
  );
}
