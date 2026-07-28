import { assetFor, backgroundFor } from "../assets/assetMap";

/**
 * Composable story scene using PNG placeholders (overwrite files in
 * frontend/src/assets/story/ to customize). Answer choices stay as Kahoot
 * blocks below the scene on the student screen — this component only paints
 * the visual guide (characters + objects).
 */
export default function StoryScene({
  background,
  characters = [],
  objects = [],
  size = "large",
}) {
  const bg = backgroundFor(background);

  return (
    <div className={`story-scene story-scene--${size} ${bg.gradientClass}`}>
      {bg.src && (
        <img
          className="story-scene__backdrop-img"
          src={bg.src}
          alt=""
          aria-hidden="true"
        />
      )}

      {(characters.length > 0 || objects.length > 0) && (
        <div className="story-scene__cast">
          {characters.map((key, i) => {
            const src = assetFor(key);
            return src ? (
              <img
                key={`char-${key}-${i}`}
                className="story-scene__character"
                src={src}
                alt={key.replace(/_/g, " ")}
                title={key}
              />
            ) : null;
          })}
          {objects.map((key, i) => {
            const src = assetFor(key);
            return src ? (
              <img
                key={`obj-${key}-${i}`}
                className="story-scene__object"
                src={src}
                alt={key.replace(/_/g, " ")}
                title={key}
              />
            ) : null;
          })}
        </div>
      )}
    </div>
  );
}
