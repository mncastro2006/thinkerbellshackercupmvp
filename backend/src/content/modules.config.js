/**
 * Predetermined prototype content packs.
 *
 * Edit stories, questions, answers, and feedback here — the UI loads
 * whatever matches the uploaded PDF filename (MATH3_Mod1 / MATH3_Mod2).
 *
 * visualAssets / scene keys map to PNG files in frontend/src/assets/story/
 * (e.g. "apple" → apple.png). Overwrite those PNGs to change art.
 */

const MODULES = {
  MATH3_Mod1: {
    match: [/MATH3_Mod1/i, /mod[_-]?1/i],
    topic: "Addition of 1- and 2-digit numbers",
    title: "MATH3 Module 1 — Addition",
    stories: [
      {
        orderIndex: 0,
        title: "Lea at the Market",
        content:
          "Lea walks to the market with her mom. She picks up 5 oranges and then 6 apples. " +
          "Mom asks Lea to count how many fruits she has altogether. Later, Lea finds 3 more bananas " +
          "and puts them with the other fruit. At the stall, a friend has 12 mangoes and Lea has 8. " +
          "They wonder how many mangoes they would have if they put them together.",
        beats: [
          "Lea walks to the market with her mom.",
          "She picks up 5 oranges and then 6 apples.",
          "Mom asks Lea to count how many fruits she has altogether.",
        ],
        theme: "market",
        scene: { background: "market", characters: ["girl", "mom"] },
        visualAssets: ["orange", "apple", "basket"],
        parentGuide:
          "Read the whole story aloud. Point out that 'altogether' and 'put together' mean addition. " +
          "Use the child's screen visuals to count oranges and apples one by one before choosing an answer.",
        questions: [
          {
            orderIndex: 0,
            text: "If Lea bought 5 oranges and 6 apples, how many fruits did she buy overall?",
            choices: ["9", "11", "10", "12"],
            correctAnswer: "11",
            skillTag: "addition-1digit",
            visualAssets: ["orange", "orange", "orange", "orange", "orange", "apple", "apple", "apple", "apple", "apple", "apple"],
          },
          {
            orderIndex: 1,
            text: "Lea has 11 fruits. She finds 3 more bananas. How many fruits does she have now?",
            choices: ["13", "14", "12", "15"],
            correctAnswer: "14",
            skillTag: "addition-1digit",
            visualAssets: ["banana", "banana", "banana", "basket"],
          },
          {
            orderIndex: 2,
            text: "A friend has 12 mangoes and Lea has 8. How many mangoes do they have together?",
            choices: ["18", "20", "19", "21"],
            correctAnswer: "20",
            skillTag: "addition-2digit",
            visualAssets: ["basket", "basket"],
          },
          {
            orderIndex: 3,
            text: "Mom buys 7 candies. Lea buys 9 candies. How many candies in total?",
            choices: ["15", "16", "17", "14"],
            correctAnswer: "16",
            skillTag: "addition-1digit",
            visualAssets: ["candy", "candy", "candy"],
          },
          {
            orderIndex: 4,
            text: "The stall has 15 coins in one jar and 14 coins in another. How many coins altogether?",
            choices: ["28", "29", "30", "27"],
            correctAnswer: "29",
            skillTag: "addition-2digit",
            visualAssets: ["coin", "coin", "wallet"],
          },
        ],
      },
      {
        orderIndex: 1,
        title: "Anna's Birthday Treats",
        content:
          "Anna is setting up her birthday table. She puts 8 cupcakes on the left and 7 cupcakes on the right. " +
          "Her dad brings a plate with 10 cookies, and Anna already has 13 cookies from baking. " +
          "Friends arrive with balloons: Anna has 6 and her friend has 9. " +
          "At the end, they count stars on two gift bags — 24 on one and 15 on the other.",
        beats: [
          "Anna is setting up her birthday table.",
          "She puts cupcakes on the left and on the right.",
          "Friends arrive with balloons and gifts.",
        ],
        theme: "home",
        scene: { background: "home", characters: ["girl", "dad"] },
        visualAssets: ["cupcake", "cookie", "balloon"],
        parentGuide:
          "Encourage Anna's story as addition of groups. For 2-digit sums, line up tens and ones on paper " +
          "or use coins as tens and ones counters on the table.",
        questions: [
          {
            orderIndex: 0,
            text: "Anna puts 8 cupcakes on the left and 7 on the right. How many cupcakes are there?",
            choices: ["14", "15", "16", "13"],
            correctAnswer: "15",
            skillTag: "addition-1digit",
            visualAssets: ["cupcake", "cupcake", "cupcake"],
          },
          {
            orderIndex: 1,
            text: "Dad brings 10 cookies. Anna already has 13. How many cookies altogether?",
            choices: ["22", "23", "24", "21"],
            correctAnswer: "23",
            skillTag: "addition-2digit",
            visualAssets: ["cookie", "cookie"],
          },
          {
            orderIndex: 2,
            text: "Anna has 6 balloons and her friend has 9. How many balloons in total?",
            choices: ["14", "15", "16", "13"],
            correctAnswer: "15",
            skillTag: "addition-1digit",
            visualAssets: ["balloon", "balloon", "balloon"],
          },
          {
            orderIndex: 3,
            text: "One gift bag has 24 stars and another has 15. How many stars altogether?",
            choices: ["38", "39", "40", "37"],
            correctAnswer: "39",
            skillTag: "addition-2digit",
            visualAssets: ["star", "star"],
          },
          {
            orderIndex: 4,
            text: "Anna counts 18 party hats and finds 11 more in a box. How many hats now?",
            choices: ["28", "29", "30", "27"],
            correctAnswer: "29",
            skillTag: "addition-2digit",
            visualAssets: ["basket", "star"],
          },
        ],
      },
      {
        orderIndex: 2,
        title: "Park Picnic Counting",
        content:
          "Ben and his friend pack a picnic at the park. Ben packs 4 sandwiches and his friend packs 5. " +
          "They bring juice boxes: 16 from Ben and 12 from his friend. " +
          "On the blanket they place 9 apples and then add 8 more from the bag. " +
          "Before leaving they count flowers they picked — 27 yellow and 14 red — and seeds for planting: 35 and 20.",
        beats: [
          "Ben and his friend pack a picnic at the park.",
          "They share sandwiches, juice, and fruit.",
          "They count flowers and seeds before going home.",
        ],
        theme: "park",
        scene: { background: "park", characters: ["boy", "friend"] },
        visualAssets: ["apple", "flower", "seed"],
        parentGuide:
          "Use park objects as counters. For larger 2-digit sums, regroup tens with sticks or drawings. " +
          "Celebrate when the child explains 'plus' in their own words.",
        questions: [
          {
            orderIndex: 0,
            text: "Ben packs 4 sandwiches and his friend packs 5. How many sandwiches in all?",
            choices: ["8", "9", "10", "7"],
            correctAnswer: "9",
            skillTag: "addition-1digit",
            visualAssets: ["basket", "basket"],
          },
          {
            orderIndex: 1,
            text: "They bring 16 juice boxes and 12 more. How many juice boxes altogether?",
            choices: ["27", "28", "29", "26"],
            correctAnswer: "28",
            skillTag: "addition-2digit",
            visualAssets: ["basket"],
          },
          {
            orderIndex: 2,
            text: "On the blanket: 9 apples, then 8 more. How many apples now?",
            choices: ["16", "17", "18", "15"],
            correctAnswer: "17",
            skillTag: "addition-1digit",
            visualAssets: ["apple", "apple", "apple"],
          },
          {
            orderIndex: 3,
            text: "They picked 27 yellow flowers and 14 red flowers. How many flowers total?",
            choices: ["40", "41", "42", "39"],
            correctAnswer: "41",
            skillTag: "addition-2digit",
            visualAssets: ["flower", "flower"],
          },
          {
            orderIndex: 4,
            text: "Seeds for planting: 35 and 20. How many seeds altogether?",
            choices: ["54", "55", "56", "53"],
            correctAnswer: "55",
            skillTag: "addition-2digit",
            visualAssets: ["seed", "seed"],
          },
        ],
      },
    ],
    feedback: {
      skillLabels: {
        "addition-1digit": "addition of single-digit numbers",
        "addition-2digit": "addition of 2-digit numbers",
      },
      recommendations: {
        "addition-1digit":
          "Practice joining small groups with real objects (fruit, buttons, toys). Count each group, then count all together. Do 5–10 minutes of visual counting daily.",
        "addition-2digit":
          "Line up tens and ones on paper or use coin stacks for tens. Practice sums like 12+8 and 24+15 with drawings before moving to mental math.",
      },
      strengthTemplate: "Strong performance in {label} ({correct}/{total} correct).",
      weaknessTemplate: "{name} needs improvement in {label} ({correct}/{total} correct).",
      summaryFocus: "addition of 1- and 2-digit numbers",
    },
  },

  MATH3_Mod2: {
    match: [/MATH3_Mod2/i, /mod[_-]?2/i],
    topic: "Division of 1- and 2-digit numbers",
    title: "MATH3 Module 2 — Division",
    stories: [
      {
        orderIndex: 0,
        title: "Sharing Fruit at the Market",
        content:
          "Lea buys 12 apples at the market to share equally with 3 friends (including herself). " +
          "Next she has 20 oranges to put into 4 equal bags. " +
          "A vendor gives her 18 bananas to split into groups of 6. " +
          "Mom asks her to share 15 candies among 5 children, and later to put 24 coins into 6 equal piles.",
        beats: [
          "Lea buys fruit at the market to share.",
          "She splits apples, oranges, and bananas into equal groups.",
          "Mom helps her share candies and coins fairly.",
        ],
        theme: "market",
        scene: { background: "market", characters: ["girl", "mom"] },
        visualAssets: ["apple", "orange", "banana"],
        parentGuide:
          "Division here means equal sharing. Physically move fruit into equal groups on a table. " +
          "Ask: 'How many in each group?' and 'Did every group get the same amount?'",
        questions: [
          {
            orderIndex: 0,
            text: "Lea has 12 apples to share equally with 3 friends. How many apples does each friend get?",
            choices: ["3", "4", "5", "6"],
            correctAnswer: "4",
            skillTag: "division-1digit",
            visualAssets: ["apple", "apple", "apple", "apple"],
          },
          {
            orderIndex: 1,
            text: "She has 20 oranges for 4 equal bags. How many oranges in each bag?",
            choices: ["4", "5", "6", "8"],
            correctAnswer: "5",
            skillTag: "division-1digit",
            visualAssets: ["orange", "basket"],
          },
          {
            orderIndex: 2,
            text: "18 bananas split into groups of 6. How many groups are there?",
            choices: ["2", "3", "4", "6"],
            correctAnswer: "3",
            skillTag: "division-1digit",
            visualAssets: ["banana", "banana", "banana"],
          },
          {
            orderIndex: 3,
            text: "15 candies shared among 5 children. How many candies each?",
            choices: ["2", "3", "4", "5"],
            correctAnswer: "3",
            skillTag: "division-1digit",
            visualAssets: ["candy", "candy", "candy"],
          },
          {
            orderIndex: 4,
            text: "24 coins into 6 equal piles. How many coins in each pile?",
            choices: ["3", "4", "5", "6"],
            correctAnswer: "4",
            skillTag: "division-2digit",
            visualAssets: ["coin", "coin", "wallet"],
          },
        ],
      },
      {
        orderIndex: 1,
        title: "Classroom Supply Teams",
        content:
          "The teacher has 16 pencils to give equally to 4 tables. " +
          "There are 28 notebooks for 7 groups. " +
          "A box holds 36 stickers to share among 9 students. " +
          "The class has 45 seed packs for 5 garden teams, and 32 rulers for 8 pairs of students.",
        beats: [
          "The teacher prepares classroom supplies.",
          "Pencils, notebooks, and stickers are shared equally.",
          "Garden teams and pairs get their tools.",
        ],
        theme: "classroom",
        scene: { background: "classroom", characters: ["teacher", "boy"] },
        visualAssets: ["pencil", "notebook", "ruler"],
        parentGuide:
          "Frame each question as 'fair shares.' Draw circles for groups and place marks inside until all items are used. " +
          "For 2-digit dividends, count by the divisor aloud together.",
        questions: [
          {
            orderIndex: 0,
            text: "16 pencils for 4 tables equally. How many pencils per table?",
            choices: ["3", "4", "5", "6"],
            correctAnswer: "4",
            skillTag: "division-1digit",
            visualAssets: ["pencil", "pencil"],
          },
          {
            orderIndex: 1,
            text: "28 notebooks for 7 groups. How many notebooks each group?",
            choices: ["3", "4", "5", "6"],
            correctAnswer: "4",
            skillTag: "division-2digit",
            visualAssets: ["notebook", "notebook"],
          },
          {
            orderIndex: 2,
            text: "36 stickers among 9 students equally. How many stickers each?",
            choices: ["3", "4", "5", "6"],
            correctAnswer: "4",
            skillTag: "division-2digit",
            visualAssets: ["star", "star"],
          },
          {
            orderIndex: 3,
            text: "45 seed packs for 5 garden teams. How many packs per team?",
            choices: ["7", "8", "9", "10"],
            correctAnswer: "9",
            skillTag: "division-2digit",
            visualAssets: ["seed", "seed"],
          },
          {
            orderIndex: 4,
            text: "32 rulers for 8 pairs. How many rulers does each pair get?",
            choices: ["3", "4", "5", "6"],
            correctAnswer: "4",
            skillTag: "division-2digit",
            visualAssets: ["ruler", "ruler"],
          },
        ],
      },
      {
        orderIndex: 2,
        title: "Garden Share Day",
        content:
          "In the garden, Anna has 10 flowers to plant in 2 equal rows. " +
          "She has 21 seeds to put into 3 pots equally. " +
          "Dad brings 40 fish crackers to share with 8 friends. " +
          "They split 27 toy cars into groups of 3, and later divide 56 leaves into 7 scrapbook pages.",
        beats: [
          "Anna works in the garden with Dad.",
          "They plant flowers and share seeds equally.",
          "Snacks and craft leaves are divided fairly too.",
        ],
        theme: "garden",
        scene: { background: "garden", characters: ["girl", "dad"] },
        visualAssets: ["flower", "seed", "fish"],
        parentGuide:
          "Use garden language: rows, pots, equal piles. If the child guesses, ask them to check by multiplying " +
          "(groups × amount per group) to see if they get the original total.",
        questions: [
          {
            orderIndex: 0,
            text: "10 flowers in 2 equal rows. How many flowers in each row?",
            choices: ["4", "5", "6", "8"],
            correctAnswer: "5",
            skillTag: "division-1digit",
            visualAssets: ["flower", "flower"],
          },
          {
            orderIndex: 1,
            text: "21 seeds into 3 pots equally. How many seeds per pot?",
            choices: ["6", "7", "8", "9"],
            correctAnswer: "7",
            skillTag: "division-1digit",
            visualAssets: ["seed", "seed", "seed"],
          },
          {
            orderIndex: 2,
            text: "40 fish crackers shared with 8 friends. How many each?",
            choices: ["4", "5", "6", "8"],
            correctAnswer: "5",
            skillTag: "division-2digit",
            visualAssets: ["fish", "fish"],
          },
          {
            orderIndex: 3,
            text: "27 toy cars into groups of 3. How many groups?",
            choices: ["7", "8", "9", "10"],
            correctAnswer: "9",
            skillTag: "division-1digit",
            visualAssets: ["toy_car", "toy_car"],
          },
          {
            orderIndex: 4,
            text: "56 leaves onto 7 scrapbook pages equally. How many leaves per page?",
            choices: ["6", "7", "8", "9"],
            correctAnswer: "8",
            skillTag: "division-2digit",
            visualAssets: ["leaf", "leaf"],
          },
        ],
      },
    ],
    feedback: {
      skillLabels: {
        "division-1digit": "division with single-digit numbers",
        "division-2digit": "division with 1- and 2-digit numbers",
      },
      recommendations: {
        "division-1digit":
          "Practice equal sharing with snacks or toys. Make equal piles and count how many are in each pile. Keep sessions short and hands-on.",
        "division-2digit":
          "Draw groups as circles and distribute items one-by-one. Check answers by multiplying groups × size. Use skip-counting by the divisor.",
      },
      strengthTemplate: "Strong performance in {label} ({correct}/{total} correct).",
      weaknessTemplate: "{name} needs improvement in {label} ({correct}/{total} correct).",
      summaryFocus: "division of 1- and 2-digit numbers",
    },
  },
};

function resolvePack(filename = "", title = "") {
  const haystack = `${filename} ${title}`.trim();
  for (const [key, pack] of Object.entries(MODULES)) {
    if (pack.match.some((re) => re.test(haystack))) {
      return { key, pack };
    }
  }
  return null;
}

function listSupportedFilenames() {
  return ["MATH3_Mod1.pdf", "MATH3_Mod2.pdf"];
}

module.exports = { MODULES, resolvePack, listSupportedFilenames };
