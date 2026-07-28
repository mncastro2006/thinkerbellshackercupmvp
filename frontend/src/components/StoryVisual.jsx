import { assetFor } from "../assets/assetMap";

/** Simple strip of PNG story objects (legacy helper). */
export default function StoryVisual({ assets = [], size = "large" }) {
  if (!assets.length) return null;
  return (
    <div className={`story-visual story-visual--${size}`} aria-hidden="true">
      {assets.map((key, i) => {
        const src = assetFor(key);
        return src ? (
          <img key={`${key}-${i}`} className="story-visual__img" src={src} alt="" />
        ) : null;
      })}
    </div>
  );
}
