export default function AccessibilityToggles({ dyslexiaFont, onToggleFont, onSpeak, speaking }) {
  return (
    <div className="a11y-toggles">
      <button
        type="button"
        className={`a11y-toggle ${speaking ? "a11y-toggle--active" : ""}`}
        onClick={onSpeak}
        title="Read the story aloud"
      >
        🔊 <span>Text to voice</span>
      </button>
      <button
        type="button"
        className={`a11y-toggle ${dyslexiaFont ? "a11y-toggle--active" : ""}`}
        onClick={onToggleFont}
        title="Toggle a dyslexia-friendly font"
      >
        🔤 <span>Easy-read font</span>
      </button>
    </div>
  );
}
