import { emojiFor } from "../assets/emojiMap";

/**
 * Renders the static emoji visualization for a story/question,
 * e.g. visualAssets = ["apple","orange"] -> 🍎 🍊
 */
export default function StoryVisual({ assets = [], size = "large" }) {
  if (!assets.length) return null;
  return (
    <div className={`story-visual story-visual--${size}`}>
      {assets.map((key, i) => (
        <span key={`${key}-${i}`} className="story-visual__item" title={key}>
          {emojiFor(key)}
        </span>
      ))}
    </div>
  );
}
