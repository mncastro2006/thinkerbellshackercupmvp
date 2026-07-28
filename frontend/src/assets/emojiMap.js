// Maps the asset keys produced by the backend (see backend/src/services/ai.service.js
// OBJECT_POOL / CHARACTER_POOL) to emoji characters used as MVP static visuals for the
// composable story scenes (background + people + objects).
const emojiMap = {
  // characters (people)
  girl: "👧",
  boy: "👦",
  friend: "🧑",
  mom: "👩",
  dad: "👨",
  teacher: "🧑‍🏫",
  // objects
  apple: "🍎",
  orange: "🍊",
  banana: "🍌",
  basket: "🧺",
  coin: "🪙",
  wallet: "👛",
  candy: "🍬",
  balloon: "🎈",
  book: "📖",
  pencil: "✏️",
  star: "⭐",
  cookie: "🍪",
  cupcake: "🧁",
  backpack: "🎒",
  notebook: "📓",
  flower: "🌸",
  toy_car: "🚗",
  fish: "🐟",
  ruler: "📏",
  seed: "🌱",
  // answer-spot markers (decorative, not counted objects)
  flag: "🚩",
  leaf: "🍃",
};

// Background "worlds" used to compose a story scene. MVP renders these as a
// gradient + a large decorative emoji rather than a full illustration - see
// PRD roadmap item on composable background/people/objects scenes for the
// intended evolution (custom PNG/SVG or AI-generated art per component).
const backgroundMap = {
  market: { emoji: "🏪", gradientClass: "scene-bg--market", label: "the market" },
  home: { emoji: "🏠", gradientClass: "scene-bg--home", label: "home" },
  park: { emoji: "🌳", gradientClass: "scene-bg--park", label: "the park" },
  classroom: { emoji: "🏫", gradientClass: "scene-bg--classroom", label: "the classroom" },
  garden: { emoji: "🌻", gradientClass: "scene-bg--garden", label: "the garden" },
};

export function emojiFor(key) {
  return emojiMap[key] || "❓";
}

export function backgroundFor(key) {
  return backgroundMap[key] || backgroundMap.market;
}

export default emojiMap;
