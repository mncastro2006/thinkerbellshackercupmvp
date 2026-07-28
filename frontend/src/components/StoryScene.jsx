import { emojiFor, backgroundFor } from "../assets/emojiMap";

/**
 * Composable story scene: background + people + objects, layered into one
 * frame (PRD roadmap: "build the story frame/visualizations from background,
 * people, and objects components"). MVP renders each layer as a CSS
 * background + emoji, but the layering structure is designed so any layer
 * can later be swapped for a real PNG/SVG or AI-generated image without
 * changing how callers use this component.
 *
 * When `answerScene` is provided, the 4 answer options are rendered as
 * clickable "spots" positioned inside the scene itself (e.g. corners of the
 * frame) instead of as a separate row of quiz buttons below the story -
 * per the PRD's "options integrated into the story frame" requirement.
 */
export default function StoryScene({
  background,
  characters = [],
  objects = [],
  answerScene = null,
  onAnswer,
  selectedLabel,
  disabled,
  correctAnswer,
  size = "large",
}) {
  const bg = backgroundFor(background);

  return (
    <div className={`story-scene story-scene--${size} ${bg.gradientClass}`}>
      <span className="story-scene__backdrop-emoji" aria-hidden="true">{bg.emoji}</span>

      {(characters.length > 0 || objects.length > 0) && (
        <div className="story-scene__cast">
          {characters.map((key, i) => (
            <span key={`char-${key}-${i}`} className="story-scene__character" title={key}>
              {emojiFor(key)}
            </span>
          ))}
          {objects.map((key, i) => (
            <span key={`obj-${key}-${i}`} className="story-scene__object" title={key}>
              {emojiFor(key)}
            </span>
          ))}
        </div>
      )}

      {answerScene && answerScene.length > 0 && (
        <div className="story-scene__answers">
          {answerScene.map((opt) => {
            const isSelected = selectedLabel === opt.label;
            let extra = "";
            if (disabled && correctAnswer) {
              if (opt.label === correctAnswer) extra = "answer-spot--correct";
              else if (isSelected) extra = "answer-spot--incorrect";
            } else if (isSelected) {
              extra = "answer-spot--selected";
            }
            return (
              <button
                key={opt.label}
                type="button"
                className={`answer-spot answer-spot--${opt.position} ${extra}`}
                onClick={() => onAnswer && onAnswer(opt.label)}
                disabled={disabled}
                aria-label={`Answer ${opt.label}`}
              >
                <span className="answer-spot__marker" aria-hidden="true">{emojiFor(opt.marker)}</span>
                <span className="answer-spot__label">{opt.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
