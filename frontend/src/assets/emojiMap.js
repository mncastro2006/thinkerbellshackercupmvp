// Maps the asset keys produced by the backend (see backend/src/services/ai.service.js
// ASSET_POOL) to emoji characters used as MVP static visuals for the stories.
const emojiMap = {
  girl: "👧",
  boy: "👦",
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
};

export function emojiFor(key) {
  return emojiMap[key] || "❓";
}

export default emojiMap;
