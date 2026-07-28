/**
 * Maps story asset keys (from modules.config.js) to PNG files.
 * Overwrite files in ./story/ keeping the same filenames to swap art.
 */
import girl from "./story/girl.png";
import boy from "./story/boy.png";
import friend from "./story/friend.png";
import mom from "./story/mom.png";
import dad from "./story/dad.png";
import teacher from "./story/teacher.png";
import apple from "./story/apple.png";
import orange from "./story/orange.png";
import banana from "./story/banana.png";
import basket from "./story/basket.png";
import coin from "./story/coin.png";
import wallet from "./story/wallet.png";
import candy from "./story/candy.png";
import balloon from "./story/balloon.png";
import book from "./story/book.png";
import pencil from "./story/pencil.png";
import star from "./story/star.png";
import cookie from "./story/cookie.png";
import cupcake from "./story/cupcake.png";
import backpack from "./story/backpack.png";
import notebook from "./story/notebook.png";
import flower from "./story/flower.png";
import toy_car from "./story/toy_car.png";
import fish from "./story/fish.png";
import ruler from "./story/ruler.png";
import seed from "./story/seed.png";
import flag from "./story/flag.png";
import leaf from "./story/leaf.png";
import market from "./story/market.png";
import home from "./story/home.png";
import park from "./story/park.png";
import classroom from "./story/classroom.png";
import garden from "./story/garden.png";

const assetMap = {
  girl,
  boy,
  friend,
  mom,
  dad,
  teacher,
  apple,
  orange,
  banana,
  basket,
  coin,
  wallet,
  candy,
  balloon,
  book,
  pencil,
  star,
  cookie,
  cupcake,
  backpack,
  notebook,
  flower,
  toy_car,
  fish,
  ruler,
  seed,
  flag,
  leaf,
};

const backgroundMap = {
  market: { src: market, gradientClass: "scene-bg--market", label: "the market" },
  home: { src: home, gradientClass: "scene-bg--home", label: "home" },
  park: { src: park, gradientClass: "scene-bg--park", label: "the park" },
  classroom: { src: classroom, gradientClass: "scene-bg--classroom", label: "the classroom" },
  garden: { src: garden, gradientClass: "scene-bg--garden", label: "the garden" },
};

export function assetFor(key) {
  return assetMap[key] || null;
}

export function backgroundFor(key) {
  return backgroundMap[key] || backgroundMap.market;
}

export default assetMap;
