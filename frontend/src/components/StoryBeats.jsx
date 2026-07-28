import { useEffect, useState } from "react";

/**
 * Pre-assessment "storybuilding" sequence: reveals the story's narrative
 * beats one at a time before any questions are asked, instead of jumping
 * straight into Q&A (PRD roadmap item).
 */
export default function StoryBeats({ beats = [], onDone, onSpeak }) {
  const [shown, setShown] = useState(1);
  const list = beats.length ? beats : [""];
  const isLast = shown >= list.length;

  useEffect(() => {
    setShown(1);
  }, [beats]);

  function handleNext() {
    if (isLast) {
      onDone && onDone();
    } else {
      setShown((s) => Math.min(s + 1, list.length));
    }
  }

  return (
    <div className="story-beats">
      {list.slice(0, shown).map((beat, i) => (
        <p key={i} className="story-beat" style={{ animationDelay: `${i * 0.05}s` }}>
          {beat}
        </p>
      ))}
      <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 6 }}>
        {onSpeak && (
          <button type="button" className="btn btn--ghost btn--small" onClick={() => onSpeak(list.slice(0, shown).join(" "))}>
            🔊 Read aloud
          </button>
        )}
        <button type="button" className="btn btn--small" onClick={handleNext}>
          {isLast ? "Start the questions →" : "Continue"}
        </button>
      </div>
    </div>
  );
}
