import type { Range } from "@/lib/mock-data";

export type Modifier = {
  id: string;
  label: string;
  delta: Range;
};

export type MacroRange = {
  protein: Range;
  carbs: Range;
  fat: Range;
};

export type CandidateMeal = {
  id: string;
  name: string;
  chineseName: string;
  confidence: "High" | "Medium" | "Low";
  baseRange: Range;
  macroRange: MacroRange;
  note: string;
  aliases: string[];
  defaultModifierIds: string[];
  modifiers: Modifier[];
};

export const candidateMeals: CandidateMeal[] = [
  {
    id: "chicken-rice",
    name: "Hainanese Chicken Rice",
    chineseName: "海南鸡饭",
    confidence: "High",
    baseRange: [520, 650],
    macroRange: {
      protein: [28, 36],
      carbs: [52, 68],
      fat: [12, 20],
    },
    note: "Classic hawker lunch. Portion, skin, and sauce drive most of the swing.",
    aliases: ["chicken rice", "hainan chicken rice", "roasted chicken rice"],
    defaultModifierIds: ["half-rice", "skin-removed"],
    modifiers: [
      { id: "half-rice", label: "Half rice", delta: [-110, -80] },
      { id: "skin-removed", label: "Skin removed", delta: [-55, -35] },
      { id: "steamed", label: "Steamed", delta: [-10, 10] },
      { id: "roasted", label: "Roasted", delta: [20, 40] },
      { id: "add-egg", label: "Add egg", delta: [60, 85] },
      { id: "extra-sauce", label: "Extra sauce", delta: [25, 45] },
    ],
  },
  {
    id: "fishball-noodle",
    name: "Fishball Noodles (Dry)",
    chineseName: "鱼圆面",
    confidence: "Medium",
    baseRange: [420, 530],
    macroRange: {
      protein: [20, 28],
      carbs: [55, 70],
      fat: [10, 16],
    },
    note: "Good everyday meal. Sauce choice and noodle size matter more than users expect.",
    aliases: ["fishball noodle", "mee pok", "mee kia", "fish ball noodle"],
    defaultModifierIds: ["less-sauce"],
    modifiers: [
      { id: "less-sauce", label: "Less sauce", delta: [-40, -20] },
      { id: "extra-noodle", label: "Extra noodle", delta: [85, 120] },
      { id: "add-fishcake", label: "Add fishcake", delta: [45, 65] },
      { id: "soup-version", label: "Soup version", delta: [-30, -15] },
      { id: "add-meatballs", label: "Add meatballs", delta: [70, 95] },
    ],
  },
  {
    id: "prawn-noodle",
    name: "Prawn Noodles / Prawn Mee",
    chineseName: "虾面",
    confidence: "Medium",
    baseRange: [430, 590],
    macroRange: {
      protein: [24, 36],
      carbs: [45, 62],
      fat: [14, 22],
    },
    note: "Broth, noodle portion, prawns, and pork ribs change the calorie story quickly. Great test case for seafood + extras.",
    aliases: [
      "prawn noodle",
      "prawn noodles",
      "prawn mee",
      "shrimp noodle",
      "hae mee",
      "虾面",
      "排骨虾面",
      "pork rib prawn noodle",
      "pork rib prawn mee",
      "prawn rib mee",
    ],
    defaultModifierIds: ["soup-prawn-mee"],
    modifiers: [
      { id: "soup-prawn-mee", label: "Soup", delta: [0, 0] },
      { id: "dry-prawn-mee", label: "Dry version", delta: [30, 60] },
      { id: "less-noodle-prawn-mee", label: "Less noodles", delta: [-95, -65] },
      { id: "extra-noodle-prawn-mee", label: "Extra noodles", delta: [90, 130] },
      { id: "extra-prawns-prawn-mee", label: "Extra prawns", delta: [45, 75] },
      { id: "add-ribs-prawn-mee", label: "Add pork ribs", delta: [110, 160] },
    ],
  },
  {
    id: "cai-png",
    name: "Cai Png / Economy Rice",
    chineseName: "杂菜饭",
    confidence: "Medium",
    baseRange: [470, 620],
    macroRange: {
      protein: [18, 32],
      carbs: [50, 72],
      fat: [14, 24],
    },
    note: "The best correction UX test case. Components matter more than the photo label.",
    aliases: ["cai png", "economic rice", "economy rice", "chap fan"],
    defaultModifierIds: ["two-veg-one-meat"],
    modifiers: [
      { id: "less-rice-cai-png", label: "Less rice", delta: [-90, -60] },
      { id: "two-veg-one-meat", label: "2 veg 1 meat", delta: [-50, -20] },
      { id: "three-veg-cai-png", label: "3 veg", delta: [-80, -45] },
      { id: "extra-meat", label: "Extra meat", delta: [90, 130] },
      { id: "curry-drizzle", label: "Curry drizzle", delta: [35, 60] },
      { id: "fried-item", label: "Fried item", delta: [70, 110] },
      { id: "brown-rice", label: "Brown rice swap", delta: [-20, -10] },
    ],
  },
  {
    id: "kopi-c-siew-dai",
    name: "Kopi C Siew Dai",
    chineseName: "咖啡 C 少糖",
    confidence: "High",
    baseRange: [70, 110],
    macroRange: {
      protein: [2, 4],
      carbs: [8, 16],
      fat: [2, 4],
    },
    note: "Drinks are small, fast wins that help users feel the budget add up honestly.",
    aliases: ["kopi c siew dai", "kopi c", "coffee less sugar"],
    defaultModifierIds: ["hot"],
    modifiers: [
      { id: "hot", label: "Hot", delta: [0, 0] },
      { id: "iced", label: "Iced", delta: [10, 20] },
      { id: "gao", label: "Gao", delta: [15, 25] },
      { id: "less-milk", label: "Less milk", delta: [-15, -10] },
      { id: "kosong", label: "Kosong", delta: [-25, -20] },
    ],
  },
  {
    id: "nasi-lemak",
    name: "Nasi Lemak",
    chineseName: "椰浆饭",
    confidence: "Medium",
    baseRange: [560, 720],
    macroRange: {
      protein: [16, 28],
      carbs: [52, 70],
      fat: [22, 32],
    },
    note: "Great test case for side-item correction. Rice is only part of the calorie story here.",
    aliases: ["nasi lemak", "coconut rice", "椰浆饭"],
    defaultModifierIds: [],
    modifiers: [
      { id: "half-rice-lemak", label: "Half rice", delta: [-120, -90] },
      { id: "add-wing-lemak", label: "Add chicken wing", delta: [180, 240] },
      { id: "extra-sambal-lemak", label: "Extra sambal", delta: [20, 40] },
      { id: "skip-peanuts-lemak", label: "Skip peanuts", delta: [-55, -35] },
      { id: "fried-fish-lemak", label: "Fried fish", delta: [120, 170] },
    ],
  },
  {
    id: "yong-tau-foo",
    name: "Yong Tau Foo",
    chineseName: "酿豆腐",
    confidence: "Medium",
    baseRange: [320, 460],
    macroRange: {
      protein: [22, 32],
      carbs: [24, 40],
      fat: [10, 18],
    },
    note: "Healthy-looking, but noodles, rice, and fried pieces change the estimate fast.",
    aliases: ["yong tau foo", "ytf", "酿豆腐"],
    defaultModifierIds: ["soup-ytf"],
    modifiers: [
      { id: "soup-ytf", label: "Soup", delta: [0, 0] },
      { id: "dry-ytf", label: "Dry with sauce", delta: [70, 110] },
      { id: "add-noodles-ytf", label: "Add noodles", delta: [140, 190] },
      { id: "add-rice-ytf", label: "Add rice", delta: [180, 240] },
      { id: "fried-pieces-ytf", label: "More fried pieces", delta: [80, 120] },
    ],
  },
  {
    id: "lei-cha",
    name: "Lei Cha / Thunder Tea Rice",
    chineseName: "擂茶",
    confidence: "Medium",
    baseRange: [460, 685],
    macroRange: {
      protein: [18, 32],
      carbs: [58, 88],
      fat: [14, 28],
    },
    note: "Vegetable-forward, but rice, peanuts, fried anchovies, and tea paste decide whether it stays light.",
    aliases: [
      "lei cha",
      "leicha",
      "thunder tea rice",
      "thunder tea",
      "擂茶",
      "客家擂茶",
    ],
    defaultModifierIds: ["regular-rice-lei-cha", "peanuts-lei-cha"],
    modifiers: [
      { id: "less-rice-lei-cha", label: "Less rice", delta: [-110, -70] },
      { id: "regular-rice-lei-cha", label: "Regular rice", delta: [0, 0] },
      { id: "extra-rice-lei-cha", label: "Extra rice", delta: [90, 140] },
      { id: "peanuts-lei-cha", label: "Peanuts", delta: [70, 120] },
      { id: "less-peanuts-lei-cha", label: "Less peanuts", delta: [-55, -30] },
      { id: "fried-anchovies-lei-cha", label: "Fried anchovies", delta: [45, 90] },
      { id: "extra-tofu-lei-cha", label: "Extra tofu", delta: [50, 90] },
    ],
  },
  {
    id: "laksa",
    name: "Laksa",
    chineseName: "叻沙",
    confidence: "Medium",
    baseRange: [500, 650],
    macroRange: {
      protein: [18, 28],
      carbs: [42, 58],
      fat: [18, 28],
    },
    note: "The broth matters. One quick gravy or topping correction changes the range meaningfully.",
    aliases: ["laksa", "katong laksa", "curry noodle", "叻沙"],
    defaultModifierIds: ["less-gravy-laksa"],
    modifiers: [
      { id: "less-gravy-laksa", label: "Less gravy", delta: [-45, -25] },
      { id: "extra-noodle-laksa", label: "Extra noodles", delta: [90, 130] },
      { id: "add-cockles-laksa", label: "Add cockles", delta: [35, 60] },
      { id: "extra-puff-laksa", label: "More tau pok", delta: [40, 65] },
      { id: "extra-gravy-laksa", label: "Extra gravy", delta: [50, 80] },
    ],
  },
  {
    id: "roti-prata",
    name: "Roti Prata",
    chineseName: "印度煎饼",
    confidence: "Medium",
    baseRange: [280, 380],
    macroRange: {
      protein: [6, 10],
      carbs: [32, 44],
      fat: [10, 16],
    },
    note: "Breakfast and supper staple. Piece count and add-ons are the whole game.",
    aliases: ["prata", "roti prata", "plain prata", "egg prata", "印度煎饼"],
    defaultModifierIds: ["plain-prata"],
    modifiers: [
      { id: "plain-prata", label: "Plain", delta: [0, 0] },
      { id: "egg-prata", label: "Egg prata", delta: [70, 95] },
      { id: "two-piece-prata", label: "2 pieces", delta: [130, 180] },
      { id: "curry-dip-prata", label: "Extra curry", delta: [35, 55] },
      { id: "cheese-prata", label: "Cheese", delta: [90, 130] },
    ],
  },
  {
    id: "sliced-fish-soup",
    name: "Sliced Fish Soup",
    chineseName: "鱼片汤",
    confidence: "Medium",
    baseRange: [250, 360],
    macroRange: {
      protein: [24, 34],
      carbs: [8, 18],
      fat: [5, 10],
    },
    note: "Usually lighter, but milk broth and carb add-ons push it up quickly.",
    aliases: ["sliced fish soup", "fish soup", "鱼片汤", "鱼汤"],
    defaultModifierIds: ["clear-broth-fish-soup"],
    modifiers: [
      { id: "clear-broth-fish-soup", label: "Clear broth", delta: [0, 0] },
      { id: "evap-milk-fish-soup", label: "Evaporated milk", delta: [45, 75] },
      { id: "add-rice-fish-soup", label: "Add rice", delta: [180, 240] },
      { id: "add-beehoon-fish-soup", label: "Add bee hoon", delta: [120, 170] },
      { id: "fried-fish-soup", label: "Fried fish version", delta: [80, 120] },
    ],
  },
  {
    id: "bubble-tea",
    name: "Bubble Milk Tea",
    chineseName: "珍珠奶茶",
    confidence: "High",
    baseRange: [170, 250],
    macroRange: {
      protein: [2, 5],
      carbs: [28, 42],
      fat: [4, 8],
    },
    note: "Drink logging should feel honest, not punitive. Sugar and pearls are the biggest levers.",
    aliases: ["bubble tea", "boba", "milk tea", "珍珠奶茶"],
    defaultModifierIds: ["quarter-sugar-bbt"],
    modifiers: [
      { id: "zero-sugar-bbt", label: "0% sugar", delta: [-55, -35] },
      { id: "quarter-sugar-bbt", label: "25% sugar", delta: [0, 0] },
      { id: "half-sugar-bbt", label: "50% sugar", delta: [45, 70] },
      { id: "pearls-bbt", label: "Pearls", delta: [90, 130] },
      { id: "milk-foam-bbt", label: "Milk foam", delta: [80, 120] },
    ],
  },
  {
    id: "bak-chor-mee",
    name: "Bak Chor Mee",
    chineseName: "肉脞面",
    confidence: "Medium",
    baseRange: [520, 700],
    macroRange: {
      protein: [22, 34],
      carbs: [58, 82],
      fat: [18, 32],
    },
    note: "Common Singapore noodle meal. Sauce, lard, noodle size, and add-ons decide whether it stays moderate.",
    aliases: ["bak chor mee", "minced meat noodles", "meat noodle", "肉脞面", "肉搓面"],
    defaultModifierIds: ["dry-bcm"],
    modifiers: [
      { id: "dry-bcm", label: "Dry", delta: [0, 0] },
      { id: "soup-bcm", label: "Soup", delta: [-35, -15] },
      { id: "less-sauce-bcm", label: "Less sauce", delta: [-45, -20] },
      { id: "no-lard-bcm", label: "No lard", delta: [-60, -35] },
      { id: "extra-noodle-bcm", label: "Extra noodles", delta: [90, 130] },
      { id: "add-fishball-bcm", label: "Add fishball", delta: [45, 70] },
    ],
  },
  {
    id: "kaya-toast-set",
    name: "Kaya Toast Set",
    chineseName: "咖椰吐司套餐",
    confidence: "Medium",
    baseRange: [380, 520],
    macroRange: {
      protein: [14, 24],
      carbs: [45, 68],
      fat: [14, 24],
    },
    note: "A reasonable breakfast if it stays planned, but kaya, butter, and sweet coffee can stack quickly.",
    aliases: ["kaya toast", "yakun", "toast set", "soft boiled eggs", "咖椰吐司"],
    defaultModifierIds: ["two-eggs-kaya"],
    modifiers: [
      { id: "two-eggs-kaya", label: "2 soft-boiled eggs", delta: [120, 160] },
      { id: "less-butter-kaya", label: "Less butter", delta: [-55, -30] },
      { id: "less-kaya", label: "Less kaya", delta: [-35, -20] },
      { id: "kopi-c-kaya", label: "Kopi C", delta: [45, 85] },
      { id: "kopi-kosong-kaya", label: "Kopi kosong", delta: [5, 20] },
    ],
  },
  {
    id: "mala-xiang-guo",
    name: "Mala Xiang Guo",
    chineseName: "麻辣香锅",
    confidence: "Low",
    baseRange: [650, 980],
    macroRange: {
      protein: [26, 46],
      carbs: [35, 70],
      fat: [36, 62],
    },
    note: "Highly variable. A planned less-oil bowl can work; sauce, peanuts, fried items, noodles, and late-night timing are the risk.",
    aliases: ["mala xiang guo", "mala", "麻辣香锅", "ma la xiang guo", "spicy hotpot"],
    defaultModifierIds: ["less-oil-mala", "more-veg-mala"],
    modifiers: [
      { id: "less-oil-mala", label: "Less oil", delta: [-160, -90] },
      { id: "less-salt-mala", label: "Less salt", delta: [0, 0] },
      { id: "no-noodles-mala", label: "No noodles", delta: [-160, -100] },
      { id: "more-veg-mala", label: "More vegetables", delta: [-70, -30] },
      { id: "seafood-mala", label: "Seafood protein", delta: [-40, 20] },
      { id: "peanuts-mala", label: "Peanuts", delta: [90, 150] },
    ],
  },
  {
    id: "tuna-mayo-toast",
    name: "Tuna Mayo Toast",
    chineseName: "金枪鱼吐司",
    confidence: "Medium",
    baseRange: [380, 560],
    macroRange: {
      protein: [18, 32],
      carbs: [36, 58],
      fat: [12, 28],
    },
    note: "Useful convenience food, but mayo and buttered toast keep it from being a default diet-safe meal.",
    aliases: ["tuna toast", "tuna mayo toast", "tuna sandwich", "tuna mayo sandwich", "金枪鱼吐司", "金枪鱼三明治"],
    defaultModifierIds: ["mayo-tuna-toast"],
    modifiers: [
      { id: "mayo-tuna-toast", label: "Mayo", delta: [80, 140] },
      { id: "light-mayo-tuna-toast", label: "Light mayo", delta: [-45, -20] },
      { id: "wholemeal-tuna-toast", label: "Wholemeal bread", delta: [-20, 0] },
      { id: "half-tuna-toast", label: "Half portion", delta: [-210, -150] },
      { id: "add-egg-tuna-toast", label: "Add egg", delta: [60, 85] },
    ],
  },
  {
    id: "tau-huay-soy-dessert",
    name: "Tau Huay / Soy Beancurd Dessert",
    chineseName: "豆花豆浆甜品",
    confidence: "Medium",
    baseRange: [180, 340],
    macroRange: {
      protein: [8, 18],
      carbs: [22, 48],
      fat: [4, 12],
    },
    note: "Often a better dessert fallback when unsweetened, but toppings and syrup can turn it into a full sweet snack.",
    aliases: ["tau huay", "dou hua", "beancurd", "soy beancurd", "soy milk", "grass jelly soy milk", "豆花", "豆浆", "烧仙草"],
    defaultModifierIds: ["unsweetened-tau-huay"],
    modifiers: [
      { id: "unsweetened-tau-huay", label: "Unsweetened", delta: [-90, -45] },
      { id: "less-sugar-tau-huay", label: "Less sugar", delta: [-55, -25] },
      { id: "ginkgo-tau-huay", label: "Ginkgo", delta: [35, 70] },
      { id: "grass-jelly-soy", label: "Grass jelly soy milk", delta: [40, 90] },
      { id: "pearls-soy", label: "Pearls", delta: [100, 230] },
    ],
  },
  {
    id: "pig-trotter-rice",
    name: "Pig Trotter Rice",
    chineseName: "猪脚饭",
    confidence: "Medium",
    baseRange: [720, 980],
    macroRange: {
      protein: [24, 40],
      carbs: [70, 100],
      fat: [30, 52],
    },
    note: "Sauce, fatty skin, and rice portion make this heavy. It is better as a planned lunch than an accidental add-on.",
    aliases: ["pig trotter rice", "braised pork rice", "pork trotter rice", "猪脚饭", "卤肉饭"],
    defaultModifierIds: [],
    modifiers: [
      { id: "half-rice-pig-trotter", label: "Half rice", delta: [-120, -80] },
      { id: "less-gravy-pig-trotter", label: "Less gravy", delta: [-45, -20] },
      { id: "leaner-pork-pig-trotter", label: "Leaner pieces", delta: [-120, -70] },
      { id: "extra-veg-pig-trotter", label: "Extra vegetables", delta: [20, 45] },
    ],
  },
  {
    id: "chee-cheong-fun",
    name: "Chee Cheong Fun / Rice Rolls",
    chineseName: "肠粉",
    confidence: "Medium",
    baseRange: [260, 380],
    macroRange: {
      protein: [6, 16],
      carbs: [42, 62],
      fat: [5, 13],
    },
    note: "Steamed rice rolls are usually moderate, but sauce, oil, and seafood or char siew fillings change the range quickly.",
    aliases: ["chee cheong fun", "rice roll", "rice rolls", "scallop chee cheong fun", "prawn chee cheong fun", "char siew chee cheong fun", "肠粉", "扇贝肠粉", "虾肠粉", "叉烧肠粉"],
    defaultModifierIds: [],
    modifiers: [
      { id: "scallop-ccf", label: "Scallop filling", delta: [50, 90] },
      { id: "prawn-ccf", label: "Prawn filling", delta: [45, 80] },
      { id: "char-siew-ccf", label: "Char siew filling", delta: [70, 120] },
      { id: "extra-sauce-ccf", label: "Extra sauce", delta: [30, 65] },
      { id: "half-portion-ccf", label: "Half portion", delta: [-150, -100] },
    ],
  },
  {
    id: "lor-mai-gai",
    name: "Lor Mai Gai / Glutinous Rice Chicken",
    chineseName: "糯米鸡",
    confidence: "Medium",
    baseRange: [420, 560],
    macroRange: {
      protein: [16, 26],
      carbs: [58, 78],
      fat: [12, 22],
    },
    note: "Small-looking but dense. Glutinous rice, oil, and sauce make this a real breakfast item, not a light snack.",
    aliases: ["lor mai gai", "lo mai gai", "glutinous rice chicken", "steamed glutinous rice", "糯米鸡", "糯米飯"],
    defaultModifierIds: [],
    modifiers: [
      { id: "small-lor-mai-gai", label: "Small piece", delta: [-120, -70] },
      { id: "extra-chicken-lor-mai-gai", label: "More chicken", delta: [45, 85] },
      { id: "extra-sauce-lor-mai-gai", label: "Extra sauce", delta: [25, 55] },
      { id: "half-lor-mai-gai", label: "Half portion", delta: [-260, -190] },
    ],
  },
  {
    id: "steamed-pork-ribs",
    name: "Steamed Pork Ribs",
    chineseName: "蒸排骨",
    confidence: "Medium",
    baseRange: [220, 360],
    macroRange: {
      protein: [18, 30],
      carbs: [4, 12],
      fat: [14, 26],
    },
    note: "Dim sum pork ribs are protein-heavy, but fatty cuts, black bean sauce, and oil can push calories up.",
    aliases: ["steamed pork ribs", "pork ribs", "black bean ribs", "dim sum ribs", "蒸排骨", "豉汁蒸排骨", "排骨"],
    defaultModifierIds: [],
    modifiers: [
      { id: "black-bean-ribs", label: "Black bean sauce", delta: [20, 45] },
      { id: "fatty-ribs", label: "Fatty pieces", delta: [60, 120] },
      { id: "small-ribs", label: "Small plate", delta: [-80, -45] },
      { id: "shared-ribs", label: "Shared portion", delta: [-140, -90] },
    ],
  },
  {
    id: "cucumber-side",
    name: "Cucumber / Cucumber Side",
    chineseName: "黄瓜",
    confidence: "High",
    baseRange: [15, 40],
    macroRange: {
      protein: [0, 2],
      carbs: [3, 8],
      fat: [0, 1],
    },
    note: "Very light unless dressed with oil, sesame sauce, or sugar-heavy pickling liquid.",
    aliases: ["cucumber", "cucumber side", "sliced cucumber", "黄瓜", "青瓜", "拍黄瓜"],
    defaultModifierIds: [],
    modifiers: [
      { id: "chili-oil-cucumber", label: "Chili oil dressing", delta: [35, 90] },
      { id: "sesame-cucumber", label: "Sesame dressing", delta: [45, 110] },
      { id: "large-cucumber", label: "Large serving", delta: [20, 45] },
    ],
  },
  {
    id: "siew-mai",
    name: "Siew Mai",
    chineseName: "烧卖",
    confidence: "Medium",
    baseRange: [180, 280],
    macroRange: { protein: [12, 20], carbs: [12, 24], fat: [8, 16] },
    note: "Dim sum portion depends on piece count. Usually manageable, but easy to stack with other breakfast items.",
    aliases: ["siew mai", "siu mai", "shumai", "pork dumpling", "烧卖", "燒賣"],
    defaultModifierIds: ["three-siew-mai"],
    modifiers: [
      { id: "three-siew-mai", label: "3 pieces", delta: [0, 0] },
      { id: "four-siew-mai", label: "4 pieces", delta: [60, 95] },
      { id: "two-siew-mai", label: "2 pieces", delta: [-75, -45] },
    ],
  },
  {
    id: "har-gow",
    name: "Har Gow / Prawn Dumplings",
    chineseName: "虾饺",
    confidence: "Medium",
    baseRange: [160, 240],
    macroRange: { protein: [10, 18], carbs: [18, 30], fat: [3, 8] },
    note: "Usually lighter than fried dim sum, but piece count and dipping sauce still matter.",
    aliases: ["har gow", "har gao", "prawn dumpling", "shrimp dumpling", "虾饺", "蝦餃"],
    defaultModifierIds: ["three-har-gow"],
    modifiers: [
      { id: "three-har-gow", label: "3 pieces", delta: [0, 0] },
      { id: "four-har-gow", label: "4 pieces", delta: [50, 80] },
      { id: "two-har-gow", label: "2 pieces", delta: [-70, -45] },
    ],
  },
  {
    id: "carrot-cake",
    name: "Fried Carrot Cake / Chai Tow Kway",
    chineseName: "菜头粿",
    confidence: "Medium",
    baseRange: [420, 650],
    macroRange: { protein: [10, 20], carbs: [50, 82], fat: [18, 34] },
    note: "A hawker classic where oil and egg drive the swing. Black sauce adds sweetness but oil is usually the bigger lever.",
    aliases: ["fried carrot cake", "chai tow kway", "carrot cake", "white carrot cake", "black carrot cake", "菜头粿", "萝卜糕", "蘿蔔糕"],
    defaultModifierIds: [],
    modifiers: [
      { id: "white-carrot-cake", label: "White version", delta: [-25, 20] },
      { id: "black-carrot-cake", label: "Black sauce", delta: [35, 80] },
      { id: "less-oil-carrot-cake", label: "Less oil", delta: [-120, -65] },
      { id: "small-carrot-cake", label: "Small plate", delta: [-160, -95] },
    ],
  },
  {
    id: "char-kway-teow",
    name: "Char Kway Teow",
    chineseName: "炒粿条",
    confidence: "Medium",
    baseRange: [650, 900],
    macroRange: { protein: [18, 30], carbs: [70, 98], fat: [28, 48] },
    note: "High variance and usually oil-heavy. Cockles, Chinese sausage, lard, and portion size all matter.",
    aliases: ["char kway teow", "char kuay teow", "fried kway teow", "炒粿条", "炒果条", "炒粿條"],
    defaultModifierIds: [],
    modifiers: [
      { id: "less-oil-ckt", label: "Less oil", delta: [-160, -90] },
      { id: "small-ckt", label: "Small plate", delta: [-180, -120] },
      { id: "extra-cockles-ckt", label: "Extra cockles", delta: [35, 70] },
      { id: "no-lard-ckt", label: "No lard", delta: [-80, -45] },
    ],
  },
  {
    id: "hokkien-mee",
    name: "Hokkien Mee",
    chineseName: "福建面",
    confidence: "Medium",
    baseRange: [520, 720],
    macroRange: { protein: [20, 34], carbs: [62, 88], fat: [18, 32] },
    note: "Noodle portion, oil, pork lard, and seafood topping decide whether it stays moderate.",
    aliases: ["hokkien mee", "fried hokkien mee", "福建面", "福建炒虾面", "福建炒蝦麵"],
    defaultModifierIds: [],
    modifiers: [
      { id: "less-noodle-hokkien", label: "Less noodles", delta: [-120, -80] },
      { id: "extra-seafood-hokkien", label: "Extra seafood", delta: [45, 90] },
      { id: "no-lard-hokkien", label: "No lard", delta: [-70, -40] },
      { id: "small-hokkien", label: "Small plate", delta: [-160, -100] },
    ],
  },
  {
    id: "wanton-mee",
    name: "Wanton Mee",
    chineseName: "云吞面",
    confidence: "Medium",
    baseRange: [430, 620],
    macroRange: { protein: [18, 30], carbs: [58, 78], fat: [12, 24] },
    note: "Dry sauce and char siew portion are the main levers. Soup version is usually a little lighter.",
    aliases: ["wanton mee", "wantan mee", "wan tan mee", "wonton noodle", "云吞面", "雲吞麵"],
    defaultModifierIds: ["dry-wanton-mee"],
    modifiers: [
      { id: "dry-wanton-mee", label: "Dry", delta: [0, 0] },
      { id: "soup-wanton-mee", label: "Soup", delta: [-60, -25] },
      { id: "extra-char-siew-wanton", label: "Extra char siew", delta: [80, 140] },
      { id: "less-noodle-wanton", label: "Less noodles", delta: [-100, -70] },
    ],
  },
  {
    id: "ban-mian",
    name: "Ban Mian / Handmade Noodles",
    chineseName: "板面",
    confidence: "Medium",
    baseRange: [430, 620],
    macroRange: { protein: [20, 34], carbs: [58, 82], fat: [10, 22] },
    note: "A solid everyday meal, but dry chilli versions and extra noodles push it up.",
    aliases: ["ban mian", "you mian", "mee hoon kueh", "handmade noodles", "板面", "幼面", "面粉粿"],
    defaultModifierIds: ["soup-ban-mian"],
    modifiers: [
      { id: "soup-ban-mian", label: "Soup", delta: [0, 0] },
      { id: "dry-ban-mian", label: "Dry chilli", delta: [80, 140] },
      { id: "add-egg-ban-mian", label: "Add egg", delta: [60, 85] },
      { id: "less-noodle-ban-mian", label: "Less noodles", delta: [-110, -75] },
    ],
  },
  {
    id: "mee-siam",
    name: "Mee Siam",
    chineseName: "米暹",
    confidence: "Medium",
    baseRange: [420, 560],
    macroRange: { protein: [12, 22], carbs: [62, 86], fat: [10, 20] },
    note: "The gravy is not the only issue; noodle portion and egg decide the meal size.",
    aliases: ["mee siam", "米暹", "暹罗米粉"],
    defaultModifierIds: [],
    modifiers: [
      { id: "less-noodle-mee-siam", label: "Less noodles", delta: [-110, -70] },
      { id: "add-egg-mee-siam", label: "Add egg", delta: [60, 85] },
      { id: "extra-gravy-mee-siam", label: "Extra gravy", delta: [20, 45] },
    ],
  },
  {
    id: "mee-rebus",
    name: "Mee Rebus",
    chineseName: "马来卤面",
    confidence: "Medium",
    baseRange: [480, 650],
    macroRange: { protein: [14, 24], carbs: [68, 92], fat: [14, 26] },
    note: "Thick gravy, noodles, and fried garnish can make it heavier than it looks.",
    aliases: ["mee rebus", "马来卤面", "馬來滷麵"],
    defaultModifierIds: [],
    modifiers: [
      { id: "less-gravy-mee-rebus", label: "Less gravy", delta: [-50, -25] },
      { id: "less-noodle-mee-rebus", label: "Less noodles", delta: [-120, -80] },
      { id: "add-egg-mee-rebus", label: "Add egg", delta: [60, 85] },
    ],
  },
  {
    id: "nasi-padang",
    name: "Nasi Padang",
    chineseName: "巴东饭",
    confidence: "Low",
    baseRange: [650, 980],
    macroRange: { protein: [22, 42], carbs: [62, 98], fat: [28, 56] },
    note: "Treat as a component meal. Curry, coconut gravy, fried items, and rice portion decide the final range.",
    aliases: ["nasi padang", "padang rice", "巴东饭", "马来饭", "mutton curry rice", "rendang rice"],
    defaultModifierIds: [],
    modifiers: [
      { id: "half-rice-padang", label: "Half rice", delta: [-120, -80] },
      { id: "rendang-padang", label: "Rendang", delta: [120, 220] },
      { id: "fried-item-padang", label: "Fried item", delta: [140, 240] },
      { id: "less-gravy-padang", label: "Less gravy", delta: [-80, -40] },
    ],
  },
  {
    id: "satay",
    name: "Satay",
    chineseName: "沙爹",
    confidence: "Medium",
    baseRange: [300, 450],
    macroRange: { protein: [22, 36], carbs: [12, 28], fat: [16, 30] },
    note: "Skewer count and peanut sauce matter. Shared satay should usually be scaled down.",
    aliases: ["satay", "chicken satay", "beef satay", "mutton satay", "沙爹"],
    defaultModifierIds: ["five-satay"],
    modifiers: [
      { id: "five-satay", label: "5 skewers", delta: [0, 0] },
      { id: "ten-satay", label: "10 skewers", delta: [300, 450] },
      { id: "peanut-sauce-satay", label: "Peanut sauce", delta: [80, 160] },
      { id: "rice-cake-satay", label: "Rice cake", delta: [80, 140] },
    ],
  },
  {
    id: "popiah",
    name: "Popiah",
    chineseName: "薄饼",
    confidence: "Medium",
    baseRange: [180, 280],
    macroRange: { protein: [6, 12], carbs: [28, 42], fat: [5, 12] },
    note: "Often a reasonable snack, but sweet sauce, peanuts, and fried bits can add up.",
    aliases: ["popiah", "fresh spring roll", "薄饼", "薄餅"],
    defaultModifierIds: [],
    modifiers: [
      { id: "extra-peanuts-popiah", label: "Extra peanuts", delta: [45, 90] },
      { id: "extra-sauce-popiah", label: "Extra sweet sauce", delta: [25, 60] },
      { id: "two-popiah", label: "2 rolls", delta: [180, 280] },
    ],
  },
  {
    id: "oyster-omelette",
    name: "Oyster Omelette / Orh Luak",
    chineseName: "蚝煎",
    confidence: "Medium",
    baseRange: [550, 820],
    macroRange: { protein: [20, 34], carbs: [36, 62], fat: [34, 56] },
    note: "Oil and starch make this heavy quickly. Usually better treated as a shared dish.",
    aliases: ["oyster omelette", "orh luak", "or luak", "蚝煎", "蠔煎"],
    defaultModifierIds: [],
    modifiers: [
      { id: "shared-orh-luak", label: "Shared portion", delta: [-360, -240] },
      { id: "less-oil-orh-luak", label: "Less oil", delta: [-120, -70] },
      { id: "extra-oyster-orh-luak", label: "Extra oysters", delta: [45, 90] },
    ],
  },
  {
    id: "rojak",
    name: "Rojak",
    chineseName: "罗惹",
    confidence: "Medium",
    baseRange: [320, 520],
    macroRange: { protein: [8, 18], carbs: [46, 70], fat: [10, 24] },
    note: "Fruit and veg help, but sauce, peanuts, and you tiao decide the calorie story.",
    aliases: ["rojak", "indian rojak", "chinese rojak", "罗惹", "囉惹"],
    defaultModifierIds: [],
    modifiers: [
      { id: "less-sauce-rojak", label: "Less sauce", delta: [-70, -35] },
      { id: "extra-youtiao-rojak", label: "Extra you tiao", delta: [100, 180] },
      { id: "extra-peanut-rojak", label: "Extra peanuts", delta: [70, 130] },
      { id: "shared-rojak", label: "Shared portion", delta: [-180, -120] },
    ],
  },
  {
    id: "chwee-kueh",
    name: "Chwee Kueh",
    chineseName: "水粿",
    confidence: "Medium",
    baseRange: [260, 420],
    macroRange: { protein: [4, 9], carbs: [42, 66], fat: [8, 20] },
    note: "Rice cakes are light alone; preserved radish oil is the calorie lever.",
    aliases: ["chwee kueh", "shui kueh", "水粿", "水糕"],
    defaultModifierIds: ["four-chwee-kueh"],
    modifiers: [
      { id: "four-chwee-kueh", label: "4 pieces", delta: [0, 0] },
      { id: "six-chwee-kueh", label: "6 pieces", delta: [120, 190] },
      { id: "less-chai-poh", label: "Less chai poh oil", delta: [-80, -40] },
    ],
  },
  {
    id: "mee-goreng",
    name: "Mee Goreng",
    chineseName: "印度炒面",
    confidence: "Medium",
    baseRange: [600, 850],
    macroRange: { protein: [18, 32], carbs: [78, 108], fat: [22, 42] },
    note: "Usually carb-heavy and oil-forward. Egg, mutton, and portion size are the main corrections.",
    aliases: ["mee goreng", "indian mee goreng", "mamak mee goreng", "印度炒面", "炒面"],
    defaultModifierIds: [],
    modifiers: [
      { id: "small-mee-goreng", label: "Small plate", delta: [-180, -110] },
      { id: "add-egg-mee-goreng", label: "Add egg", delta: [60, 85] },
      { id: "mutton-mee-goreng", label: "Mutton", delta: [120, 220] },
      { id: "less-oil-mee-goreng", label: "Less oil", delta: [-120, -70] },
    ],
  },
  {
    id: "fried-rice",
    name: "Fried Rice",
    chineseName: "炒饭",
    confidence: "Medium",
    baseRange: [550, 780],
    macroRange: { protein: [16, 30], carbs: [72, 102], fat: [18, 34] },
    note: "The reliable fallback for mixed rice photos. Oil, egg, meat, and portion size drive the range.",
    aliases: ["fried rice", "egg fried rice", "yangzhou fried rice", "炒饭", "蛋炒饭", "扬州炒饭"],
    defaultModifierIds: [],
    modifiers: [
      { id: "small-fried-rice", label: "Small plate", delta: [-170, -100] },
      { id: "extra-egg-fried-rice", label: "Extra egg", delta: [60, 85] },
      { id: "seafood-fried-rice", label: "Seafood", delta: [50, 110] },
      { id: "less-oil-fried-rice", label: "Less oil", delta: [-110, -65] },
    ],
  },
  {
    id: "steamed-fish",
    name: "Steamed Fish",
    chineseName: "蒸鱼",
    confidence: "Medium",
    baseRange: [220, 380],
    macroRange: { protein: [28, 46], carbs: [2, 10], fat: [8, 20] },
    note: "Usually a strong shared-dinner protein if sauce and oil stay moderate.",
    aliases: ["steamed fish", "hong kong steamed fish", "soy sauce steamed fish", "蒸鱼", "清蒸鱼", "港蒸鱼"],
    defaultModifierIds: [],
    modifiers: [
      { id: "shared-steamed-fish", label: "Shared portion", delta: [-150, -90] },
      { id: "extra-oil-steamed-fish", label: "Extra oil", delta: [60, 130] },
      { id: "large-steamed-fish", label: "Large portion", delta: [120, 220] },
    ],
  },
  {
    id: "curry-fish-head",
    name: "Curry Fish Head",
    chineseName: "咖喱鱼头",
    confidence: "Low",
    baseRange: [680, 1100],
    macroRange: { protein: [35, 60], carbs: [18, 42], fat: [42, 78] },
    note: "Usually shared. Curry gravy and rice are the hidden budget drivers.",
    aliases: ["curry fish head", "fish head curry", "咖喱鱼头", "咖喱魚頭"],
    defaultModifierIds: ["shared-curry-fish-head"],
    modifiers: [
      { id: "shared-curry-fish-head", label: "Shared portion", delta: [-440, -280] },
      { id: "more-gravy-curry-fish", label: "More gravy", delta: [90, 180] },
      { id: "add-rice-curry-fish", label: "Add rice", delta: [180, 240] },
    ],
  },
  {
    id: "sweet-sour-pork",
    name: "Sweet and Sour Pork",
    chineseName: "咕噜肉",
    confidence: "Medium",
    baseRange: [420, 680],
    macroRange: { protein: [20, 34], carbs: [34, 58], fat: [20, 40] },
    note: "A shared zi char dish. Fried batter and sweet sauce are the big calorie sources.",
    aliases: ["sweet and sour pork", "sweet sour pork", "gu lou yuk", "咕噜肉", "古老肉"],
    defaultModifierIds: ["shared-sweet-sour-pork"],
    modifiers: [
      { id: "shared-sweet-sour-pork", label: "Shared portion", delta: [-230, -150] },
      { id: "large-sweet-sour-pork", label: "Large portion", delta: [160, 260] },
      { id: "extra-sauce-sweet-sour", label: "Extra sauce", delta: [45, 90] },
    ],
  },
  {
    id: "kangkong-belacan",
    name: "Kang Kong Belacan",
    chineseName: "马来风光",
    confidence: "Medium",
    baseRange: [180, 320],
    macroRange: { protein: [5, 12], carbs: [12, 24], fat: [10, 22] },
    note: "Vegetable dish, but oil and sambal mean it is not free. Usually shared.",
    aliases: ["kang kong belacan", "sambal kangkong", "kangkong", "马来风光", "参巴空心菜", "空心菜"],
    defaultModifierIds: ["shared-kangkong"],
    modifiers: [
      { id: "shared-kangkong", label: "Shared portion", delta: [-100, -60] },
      { id: "less-oil-kangkong", label: "Less oil", delta: [-60, -30] },
      { id: "large-kangkong", label: "Large plate", delta: [80, 140] },
    ],
  },
  {
    id: "kopi-o-kosong",
    name: "Kopi O Kosong",
    chineseName: "咖啡乌无糖",
    confidence: "High",
    baseRange: [5, 20],
    macroRange: { protein: [0, 1], carbs: [0, 2], fat: [0, 1] },
    note: "A very low-calorie drink if it is truly kosong.",
    aliases: ["kopi o kosong", "kopi kosong", "black coffee no sugar", "咖啡乌无糖", "咖啡乌 kosong"],
    defaultModifierIds: [],
    modifiers: [
      { id: "iced-kopi-o-kosong", label: "Iced", delta: [0, 10] },
      { id: "siew-dai-kopi-o", label: "Siew dai", delta: [35, 70] },
      { id: "regular-sugar-kopi-o", label: "Regular sugar", delta: [60, 110] },
    ],
  },
  {
    id: "teh-c-siew-dai",
    name: "Teh C Siew Dai",
    chineseName: "奶茶 C 少糖",
    confidence: "High",
    baseRange: [80, 130],
    macroRange: { protein: [2, 5], carbs: [10, 22], fat: [2, 5] },
    note: "Condensed or evaporated milk and sugar level decide most drink calories.",
    aliases: ["teh c siew dai", "teh c", "milk tea less sugar", "奶茶少糖", "teh siu dai"],
    defaultModifierIds: [],
    modifiers: [
      { id: "iced-teh-c", label: "Iced", delta: [10, 25] },
      { id: "kosong-teh-c", label: "Kosong", delta: [-45, -25] },
      { id: "regular-sugar-teh-c", label: "Regular sugar", delta: [40, 80] },
    ],
  },
  {
    id: "sugarcane-juice",
    name: "Sugarcane Juice",
    chineseName: "甘蔗水",
    confidence: "High",
    baseRange: [150, 260],
    macroRange: { protein: [0, 1], carbs: [36, 64], fat: [0, 1] },
    note: "Refreshing but sugar-heavy. Cup size is the whole estimate.",
    aliases: ["sugarcane juice", "sugar cane", "甘蔗水", "甘蔗汁"],
    defaultModifierIds: [],
    modifiers: [
      { id: "small-sugarcane", label: "Small cup", delta: [-70, -35] },
      { id: "large-sugarcane", label: "Large cup", delta: [70, 130] },
      { id: "less-ice-sugarcane", label: "Less ice", delta: [30, 60] },
    ],
  },
  {
    id: "lime-juice",
    name: "Calamansi / Lime Juice",
    chineseName: "酸柑水",
    confidence: "Medium",
    baseRange: [80, 160],
    macroRange: { protein: [0, 1], carbs: [18, 40], fat: [0, 1] },
    note: "Can be light or sugary depending on syrup. Siew dai matters.",
    aliases: ["calamansi juice", "lime juice", "limau", "酸柑水", "酸梅水"],
    defaultModifierIds: [],
    modifiers: [
      { id: "siew-dai-lime", label: "Less sugar", delta: [-50, -25] },
      { id: "no-sugar-lime", label: "No sugar", delta: [-85, -45] },
      { id: "large-lime", label: "Large cup", delta: [50, 90] },
    ],
  },
  {
    id: "ice-kachang",
    name: "Ice Kachang",
    chineseName: "红豆冰",
    confidence: "Medium",
    baseRange: [260, 430],
    macroRange: { protein: [4, 9], carbs: [58, 92], fat: [2, 8] },
    note: "Dessert range depends on syrup, condensed milk, and toppings.",
    aliases: ["ice kachang", "ais kacang", "红豆冰", "冰 kacang"],
    defaultModifierIds: [],
    modifiers: [
      { id: "less-syrup-kachang", label: "Less syrup", delta: [-80, -40] },
      { id: "condensed-milk-kachang", label: "Condensed milk", delta: [50, 110] },
      { id: "shared-kachang", label: "Shared dessert", delta: [-140, -90] },
    ],
  },
  {
    id: "cendol",
    name: "Cendol",
    chineseName: "煎蕊",
    confidence: "Medium",
    baseRange: [300, 520],
    macroRange: { protein: [4, 9], carbs: [54, 88], fat: [8, 22] },
    note: "Coconut milk and gula melaka make it denser than shaved ice looks.",
    aliases: ["cendol", "chendol", "煎蕊", "珍多冰"],
    defaultModifierIds: [],
    modifiers: [
      { id: "less-gula-cendol", label: "Less gula melaka", delta: [-80, -40] },
      { id: "extra-coconut-cendol", label: "Extra coconut milk", delta: [70, 140] },
      { id: "shared-cendol", label: "Shared dessert", delta: [-170, -110] },
    ],
  },
  {
    id: "char-siew-bao",
    name: "Char Siew Bao",
    chineseName: "叉烧包",
    confidence: "Medium",
    baseRange: [
      180,
      320
    ],
    macroRange: {
      protein: [
        6,
        13
      ],
      carbs: [
        28,
        48
      ],
      fat: [
        4,
        11
      ]
    },
    note: "One steamed barbecue pork bun. Larger buns and sweeter fatty filling push the range up.",
    aliases: [
      "char siew bao",
      "char siu bao",
      "bbq pork bun",
      "叉烧包",
      "叉燒包"
    ],
    defaultModifierIds: [
      "one-char-siew-bao"
    ],
    modifiers: [
      {
        id: "one-char-siew-bao",
        label: "1 bun",
        delta: [
          0,
          0
        ]
      },
      {
        id: "two-char-siew-bao",
        label: "2 buns",
        delta: [
          180,
          320
        ]
      },
      {
        id: "large-char-siew-bao",
        label: "Large bun",
        delta: [
          70,
          130
        ]
      }
    ]
  },
  {
    id: "liu-sha-bao",
    name: "Salted Egg Custard Bun",
    chineseName: "流沙包",
    confidence: "Medium",
    baseRange: [
      190,
      340
    ],
    macroRange: {
      protein: [
        5,
        10
      ],
      carbs: [
        28,
        48
      ],
      fat: [
        6,
        15
      ]
    },
    note: "Molten custard bun. Butterier salted egg fillings make the small bun surprisingly dense.",
    aliases: [
      "liu sha bao",
      "molten custard bun",
      "salted egg bun",
      "流沙包",
      "咸蛋流沙包"
    ],
    defaultModifierIds: [
      "one-liu-sha-bao"
    ],
    modifiers: [
      {
        id: "one-liu-sha-bao",
        label: "1 bun",
        delta: [
          0,
          0
        ]
      },
      {
        id: "two-liu-sha-bao",
        label: "2 buns",
        delta: [
          190,
          340
        ]
      },
      {
        id: "mini-liu-sha-bao",
        label: "Mini bun",
        delta: [
          -80,
          -45
        ]
      }
    ]
  },
  {
    id: "egg-tart",
    name: "Egg Tart",
    chineseName: "蛋挞",
    confidence: "Medium",
    baseRange: [
      170,
      300
    ],
    macroRange: {
      protein: [
        4,
        8
      ],
      carbs: [
        18,
        35
      ],
      fat: [
        8,
        17
      ]
    },
    note: "One bakery or dim sum egg tart. Flaky pastry versions are usually higher in fat.",
    aliases: [
      "egg tart",
      "dan tat",
      "dan ta",
      "egg custard tart",
      "蛋挞",
      "蛋塔",
      "港式蛋挞"
    ],
    defaultModifierIds: [
      "one-egg-tart"
    ],
    modifiers: [
      {
        id: "one-egg-tart",
        label: "1 tart",
        delta: [
          0,
          0
        ]
      },
      {
        id: "two-egg-tarts",
        label: "2 tarts",
        delta: [
          170,
          300
        ]
      },
      {
        id: "flaky-egg-tart",
        label: "Flaky pastry",
        delta: [
          35,
          80
        ]
      },
      {
        id: "mini-egg-tart",
        label: "Mini tart",
        delta: [
          -80,
          -45
        ]
      }
    ]
  },
  {
    id: "fan-choy",
    name: "Fan Choy",
    chineseName: "饭菜",
    confidence: "Medium",
    baseRange: [
      320,
      560
    ],
    macroRange: {
      protein: [
        10,
        22
      ],
      carbs: [
        45,
        80
      ],
      fat: [
        8,
        24
      ]
    },
    note: "Steamed rice cup with char siew, sausage, chicken, or gravy. Compact but not necessarily light.",
    aliases: [
      "fan choy",
      "fanchoy",
      "steamed rice cup",
      "饭菜",
      "蒸饭"
    ],
    defaultModifierIds: [],
    modifiers: [
      {
        id: "small-fan-choy",
        label: "Small cup",
        delta: [
          -90,
          -50
        ]
      },
      {
        id: "sausage-fan-choy",
        label: "Chinese sausage",
        delta: [
          70,
          130
        ]
      },
      {
        id: "extra-gravy-fan-choy",
        label: "Extra gravy",
        delta: [
          25,
          60
        ]
      }
    ]
  },
  {
    id: "you-tiao",
    name: "You Tiao",
    chineseName: "油条",
    confidence: "Medium",
    baseRange: [
      180,
      360
    ],
    macroRange: {
      protein: [
        4,
        9
      ],
      carbs: [
        22,
        45
      ],
      fat: [
        8,
        22
      ]
    },
    note: "Deep-fried dough fritter. Usually one stick; easy to forget when it comes with porridge, soy milk, or bak kut teh.",
    aliases: [
      "you tiao",
      "youtiao",
      "you char kway",
      "dough fritter",
      "油条",
      "油炸鬼"
    ],
    defaultModifierIds: [
      "one-you-tiao"
    ],
    modifiers: [
      {
        id: "one-you-tiao",
        label: "1 stick",
        delta: [
          0,
          0
        ]
      },
      {
        id: "half-you-tiao",
        label: "Half stick",
        delta: [
          -150,
          -85
        ]
      },
      {
        id: "two-you-tiao",
        label: "2 sticks",
        delta: [
          180,
          360
        ]
      }
    ]
  },
  {
    id: "curry-puff",
    name: "Curry Puff",
    chineseName: "咖喱角",
    confidence: "Medium",
    baseRange: [
      220,
      430
    ],
    macroRange: {
      protein: [
        5,
        13
      ],
      carbs: [
        25,
        48
      ],
      fat: [
        10,
        25
      ]
    },
    note: "One curry puff with potato curry and sometimes chicken or egg. Spiral fried pastry is usually heavier than baked.",
    aliases: [
      "curry puff",
      "karipap",
      "epok epok",
      "curry pok",
      "咖喱角",
      "咖喱卜"
    ],
    defaultModifierIds: [
      "one-curry-puff"
    ],
    modifiers: [
      {
        id: "one-curry-puff",
        label: "1 puff",
        delta: [
          0,
          0
        ]
      },
      {
        id: "two-curry-puffs",
        label: "2 puffs",
        delta: [
          220,
          430
        ]
      },
      {
        id: "egg-curry-puff",
        label: "With egg",
        delta: [
          45,
          80
        ]
      }
    ]
  },
  {
    id: "min-jiang-kueh",
    name: "Min Jiang Kueh",
    chineseName: "面煎粿",
    confidence: "Medium",
    baseRange: [
      180,
      360
    ],
    macroRange: {
      protein: [
        5,
        11
      ],
      carbs: [
        30,
        58
      ],
      fat: [
        4,
        15
      ]
    },
    note: "Local pancake slice. Peanut, coconut, red bean, and extra sugar change the range quickly.",
    aliases: [
      "min jiang kueh",
      "mee chiang kueh",
      "peanut pancake",
      "apam balik",
      "面煎粿",
      "面煎糕",
      "花生煎饼"
    ],
    defaultModifierIds: [],
    modifiers: [
      {
        id: "peanut-mjk",
        label: "Peanut filling",
        delta: [
          35,
          80
        ]
      },
      {
        id: "coconut-mjk",
        label: "Coconut filling",
        delta: [
          20,
          55
        ]
      },
      {
        id: "red-bean-mjk",
        label: "Red bean filling",
        delta: [
          25,
          65
        ]
      },
      {
        id: "half-mjk",
        label: "Half piece",
        delta: [
          -150,
          -85
        ]
      }
    ]
  },
  {
    id: "soon-kueh",
    name: "Soon Kueh",
    chineseName: "笋粿",
    confidence: "Medium",
    baseRange: [
      120,
      260
    ],
    macroRange: {
      protein: [
        3,
        8
      ],
      carbs: [
        22,
        42
      ],
      fat: [
        2,
        10
      ]
    },
    note: "One steamed turnip or bamboo shoot dumpling. Sauce and chilli are small, but piece count matters.",
    aliases: [
      "soon kueh",
      "soon kway",
      "turnip dumpling",
      "笋粿",
      "菜粿"
    ],
    defaultModifierIds: [
      "one-soon-kueh"
    ],
    modifiers: [
      {
        id: "one-soon-kueh",
        label: "1 piece",
        delta: [
          0,
          0
        ]
      },
      {
        id: "two-soon-kueh",
        label: "2 pieces",
        delta: [
          120,
          260
        ]
      },
      {
        id: "pan-fried-soon-kueh",
        label: "Pan-fried",
        delta: [
          35,
          80
        ]
      }
    ]
  },
  {
    id: "economy-bee-hoon",
    name: "Economy Bee Hoon",
    chineseName: "经济米粉",
    confidence: "Medium",
    baseRange: [
      350,
      700
    ],
    macroRange: {
      protein: [
        8,
        25
      ],
      carbs: [
        55,
        100
      ],
      fat: [
        9,
        30
      ]
    },
    note: "Breakfast fried bee hoon plate. Plain bee hoon is modest; egg, luncheon meat, fishcake, or wing makes it a full meal.",
    aliases: [
      "economy bee hoon",
      "economic bee hoon",
      "fried bee hoon",
      "经济米粉",
      "炒米粉"
    ],
    defaultModifierIds: [],
    modifiers: [
      {
        id: "plain-economy-bee-hoon",
        label: "Plain bee hoon",
        delta: [
          -120,
          -70
        ]
      },
      {
        id: "add-egg-economy-bee-hoon",
        label: "Add egg",
        delta: [
          60,
          85
        ]
      },
      {
        id: "add-luncheon-meat-economy-bee-hoon",
        label: "Luncheon meat",
        delta: [
          120,
          180
        ]
      },
      {
        id: "add-wing-economy-bee-hoon",
        label: "Chicken wing",
        delta: [
          180,
          250
        ]
      }
    ]
  },
  {
    id: "hor-fun",
    name: "Hor Fun",
    chineseName: "河粉",
    confidence: "Medium",
    baseRange: [
      520,
      850
    ],
    macroRange: {
      protein: [
        18,
        36
      ],
      carbs: [
        65,
        105
      ],
      fat: [
        16,
        36
      ]
    },
    note: "Wok-fried flat rice noodles with gravy. Seafood, beef, and oil-heavy stalls change the range a lot.",
    aliases: [
      "hor fun",
      "wat tan hor",
      "滑蛋河粉",
      "河粉",
      "炒河粉"
    ],
    defaultModifierIds: [],
    modifiers: [
      {
        id: "small-hor-fun",
        label: "Small plate",
        delta: [
          -170,
          -100
        ]
      },
      {
        id: "beef-hor-fun-version",
        label: "Beef version",
        delta: [
          40,
          90
        ]
      },
      {
        id: "seafood-hor-fun-version",
        label: "Seafood version",
        delta: [
          45,
          100
        ]
      },
      {
        id: "less-gravy-hor-fun",
        label: "Less gravy",
        delta: [
          -40,
          -20
        ]
      }
    ]
  },
  {
    id: "duck-rice",
    name: "Duck Rice",
    chineseName: "鸭饭",
    confidence: "Medium",
    baseRange: [
      560,
      880
    ],
    macroRange: {
      protein: [
        24,
        44
      ],
      carbs: [
        60,
        95
      ],
      fat: [
        20,
        42
      ]
    },
    note: "Braised or roasted duck with rice. Skin-on portions and gravy are the main levers.",
    aliases: [
      "duck rice",
      "braised duck rice",
      "roast duck rice",
      "卤鸭饭",
      "烧鸭饭",
      "鸭饭"
    ],
    defaultModifierIds: [],
    modifiers: [
      {
        id: "half-rice-duck-rice",
        label: "Half rice",
        delta: [
          -120,
          -80
        ]
      },
      {
        id: "skinless-duck-rice",
        label: "Skin removed",
        delta: [
          -80,
          -45
        ]
      },
      {
        id: "extra-duck-rice",
        label: "Extra duck",
        delta: [
          120,
          220
        ]
      },
      {
        id: "extra-gravy-duck-rice",
        label: "Extra gravy",
        delta: [
          30,
          70
        ]
      }
    ]
  },
  {
    id: "roast-meat-rice",
    name: "Roast Meat Rice",
    chineseName: "烧腊饭",
    confidence: "Medium",
    baseRange: [
      620,
      1050
    ],
    macroRange: {
      protein: [
        26,
        52
      ],
      carbs: [
        60,
        100
      ],
      fat: [
        24,
        58
      ]
    },
    note: "Mixed roast duck, char siew, or crispy roast pork over rice. The meat choice decides most of the range.",
    aliases: [
      "roast meat rice",
      "mixed roast rice",
      "shao la rice",
      "char siew rice",
      "roast pork rice",
      "烧腊饭",
      "叉烧饭",
      "烧肉饭",
      "三拼饭",
      "双拼饭"
    ],
    defaultModifierIds: [],
    modifiers: [
      {
        id: "half-rice-roast-meat",
        label: "Half rice",
        delta: [
          -120,
          -80
        ]
      },
      {
        id: "char-siew-roast-meat",
        label: "Char siew",
        delta: [
          -40,
          40
        ]
      },
      {
        id: "roast-pork-roast-meat",
        label: "Crispy roast pork",
        delta: [
          100,
          180
        ]
      },
      {
        id: "double-meat-roast-meat",
        label: "Double meat",
        delta: [
          180,
          320
        ]
      },
      {
        id: "less-sauce-roast-meat",
        label: "Less sauce",
        delta: [
          -35,
          -15
        ]
      }
    ]
  },
  {
    id: "ayam-penyet",
    name: "Ayam Penyet",
    chineseName: "印尼炸鸡饭",
    confidence: "Medium",
    baseRange: [
      680,
      1050
    ],
    macroRange: {
      protein: [
        28,
        52
      ],
      carbs: [
        65,
        105
      ],
      fat: [
        28,
        55
      ]
    },
    note: "Smashed fried chicken with rice, sambal, tofu, or tempeh. Fried sides and skin drive the upper end.",
    aliases: [
      "ayam penyet",
      "smashed fried chicken rice",
      "ayam penyet rice",
      "印尼炸鸡饭",
      "压扁鸡饭"
    ],
    defaultModifierIds: [],
    modifiers: [
      {
        id: "half-rice-ayam-penyet",
        label: "Half rice",
        delta: [
          -120,
          -80
        ]
      },
      {
        id: "skinless-ayam-penyet",
        label: "Skin removed",
        delta: [
          -90,
          -50
        ]
      },
      {
        id: "extra-sambal-ayam-penyet",
        label: "Extra sambal",
        delta: [
          40,
          100
        ]
      },
      {
        id: "fried-tempeh-ayam-penyet",
        label: "Fried tempeh/tofu",
        delta: [
          90,
          170
        ]
      }
    ]
  },
  {
    id: "kway-chap",
    name: "Kway Chap",
    chineseName: "粿汁",
    confidence: "Medium",
    baseRange: [
      550,
      950
    ],
    macroRange: {
      protein: [
        22,
        48
      ],
      carbs: [
        55,
        95
      ],
      fat: [
        24,
        55
      ]
    },
    note: "Flat rice sheets with braised pork, offal, tofu, or egg. Leaner selections are much lighter than pork belly-heavy plates.",
    aliases: [
      "kway chap",
      "kway chap set",
      "braised kway chap",
      "粿汁",
      "卤味粿汁"
    ],
    defaultModifierIds: [],
    modifiers: [
      {
        id: "less-kway-kway-chap",
        label: "Less kway",
        delta: [
          -100,
          -65
        ]
      },
      {
        id: "lean-kway-chap",
        label: "Leaner selection",
        delta: [
          -150,
          -80
        ]
      },
      {
        id: "pork-belly-kway-chap",
        label: "More pork belly",
        delta: [
          160,
          280
        ]
      },
      {
        id: "add-egg-kway-chap",
        label: "Add egg",
        delta: [
          60,
          85
        ]
      }
    ]
  },
  {
    id: "chilli-crab",
    name: "Chilli Crab",
    chineseName: "辣椒螃蟹",
    confidence: "Low",
    baseRange: [
      420,
      850
    ],
    macroRange: {
      protein: [
        28,
        55
      ],
      carbs: [
        20,
        60
      ],
      fat: [
        18,
        45
      ]
    },
    note: "Logged as a personal shared portion, mostly crab plus chilli egg gravy. Mantou is not included unless added.",
    aliases: [
      "chilli crab",
      "chili crab",
      "singapore chilli crab",
      "辣椒螃蟹",
      "辣椒蟹",
      "辣蟹"
    ],
    defaultModifierIds: [
      "shared-third-chilli-crab"
    ],
    modifiers: [
      {
        id: "shared-quarter-chilli-crab",
        label: "Shared quarter",
        delta: [
          -180,
          -110
        ]
      },
      {
        id: "shared-third-chilli-crab",
        label: "Shared third",
        delta: [
          0,
          0
        ]
      },
      {
        id: "shared-half-chilli-crab",
        label: "Shared half",
        delta: [
          180,
          320
        ]
      },
      {
        id: "extra-gravy-chilli-crab",
        label: "Extra chilli egg gravy",
        delta: [
          60,
          180
        ]
      },
      {
        id: "mantou-2pcs-chilli-crab",
        label: "Add 2 fried mantou",
        delta: [
          220,
          360
        ]
      }
    ]
  },
  {
    id: "cereal-prawn",
    name: "Cereal Prawn",
    chineseName: "麦片虾",
    confidence: "Medium",
    baseRange: [
      360,
      720
    ],
    macroRange: {
      protein: [
        22,
        42
      ],
      carbs: [
        22,
        55
      ],
      fat: [
        18,
        42
      ]
    },
    note: "Per shared plate portion. Deep-fried prawns with buttery cereal topping are easy to underestimate.",
    aliases: [
      "cereal prawn",
      "cereal prawns",
      "麦片虾",
      "麦片明虾",
      "麦片虾球"
    ],
    defaultModifierIds: [
      "small-plate-cereal-prawn"
    ],
    modifiers: [
      {
        id: "shared-quarter-cereal-prawn",
        label: "Shared quarter",
        delta: [
          -220,
          -120
        ]
      },
      {
        id: "shared-third-cereal-prawn",
        label: "Shared third",
        delta: [
          -140,
          -60
        ]
      },
      {
        id: "small-plate-cereal-prawn",
        label: "Small plate portion",
        delta: [
          0,
          0
        ]
      },
      {
        id: "extra-cereal-prawn",
        label: "Extra cereal topping",
        delta: [
          80,
          220
        ]
      }
    ]
  },
  {
    id: "sambal-stingray",
    name: "Sambal Stingray",
    chineseName: "叁巴魔鬼鱼",
    confidence: "Medium",
    baseRange: [
      320,
      650
    ],
    macroRange: {
      protein: [
        28,
        55
      ],
      carbs: [
        8,
        28
      ],
      fat: [
        16,
        38
      ]
    },
    note: "Per personal shared portion. Grilled stingray is lean, but oily sambal and cincalok sauce change the total.",
    aliases: [
      "sambal stingray",
      "bbq stingray",
      "barbecued stingray",
      "sambal ikan pari",
      "烤魔鬼鱼",
      "叁巴魟鱼",
      "叁巴魔鬼鱼"
    ],
    defaultModifierIds: [
      "shared-third-stingray"
    ],
    modifiers: [
      {
        id: "shared-quarter-stingray",
        label: "Shared quarter",
        delta: [
          -190,
          -95
        ]
      },
      {
        id: "shared-third-stingray",
        label: "Shared third",
        delta: [
          0,
          0
        ]
      },
      {
        id: "shared-half-stingray",
        label: "Shared half",
        delta: [
          120,
          300
        ]
      },
      {
        id: "extra-sambal-stingray",
        label: "Extra sambal",
        delta: [
          60,
          180
        ]
      }
    ]
  },
  {
    id: "salted-egg-squid",
    name: "Salted Egg Squid",
    chineseName: "咸蛋苏东",
    confidence: "Medium",
    baseRange: [
      420,
      820
    ],
    macroRange: {
      protein: [
        20,
        38
      ],
      carbs: [
        18,
        45
      ],
      fat: [
        28,
        58
      ]
    },
    note: "Per shared plate portion. Usually battered or deep-fried squid with salted egg sauce.",
    aliases: [
      "salted egg squid",
      "salted egg sotong",
      "salted egg calamari",
      "咸蛋苏东",
      "咸蛋鱿鱼",
      "金沙苏东"
    ],
    defaultModifierIds: [
      "small-plate-salted-egg-squid"
    ],
    modifiers: [
      {
        id: "shared-quarter-salted-egg-squid",
        label: "Shared quarter",
        delta: [
          -260,
          -130
        ]
      },
      {
        id: "shared-third-salted-egg-squid",
        label: "Shared third",
        delta: [
          -160,
          -60
        ]
      },
      {
        id: "small-plate-salted-egg-squid",
        label: "Small plate portion",
        delta: [
          0,
          0
        ]
      },
      {
        id: "extra-sauce-salted-egg-squid",
        label: "Extra salted egg sauce",
        delta: [
          100,
          260
        ]
      }
    ]
  },
  {
    id: "claypot-tofu",
    name: "Claypot Tofu",
    chineseName: "砂煲豆腐",
    confidence: "Medium",
    baseRange: [
      280,
      560
    ],
    macroRange: {
      protein: [
        14,
        28
      ],
      carbs: [
        18,
        42
      ],
      fat: [
        14,
        34
      ]
    },
    note: "Per personal shared portion. Egg tofu, vegetables, mushrooms, and gravy; meat or seafood versions are higher.",
    aliases: [
      "claypot tofu",
      "claypot beancurd",
      "claypot bean curd",
      "砂煲豆腐",
      "砂锅豆腐",
      "瓦煲豆腐"
    ],
    defaultModifierIds: [
      "shared-third-claypot-tofu"
    ],
    modifiers: [
      {
        id: "shared-quarter-claypot-tofu",
        label: "Shared quarter",
        delta: [
          -170,
          -80
        ]
      },
      {
        id: "shared-third-claypot-tofu",
        label: "Shared third",
        delta: [
          0,
          0
        ]
      },
      {
        id: "small-plate-claypot-tofu",
        label: "Small plate portion",
        delta: [
          -100,
          -40
        ]
      },
      {
        id: "seafood-claypot-tofu",
        label: "Seafood version",
        delta: [
          80,
          180
        ]
      },
      {
        id: "extra-gravy-claypot-tofu",
        label: "Extra gravy",
        delta: [
          40,
          120
        ]
      }
    ]
  },
  {
    id: "prawn-paste-chicken",
    name: "Prawn Paste Chicken",
    chineseName: "虾酱鸡",
    confidence: "Medium",
    baseRange: [
      420,
      760
    ],
    macroRange: {
      protein: [
        25,
        48
      ],
      carbs: [
        12,
        36
      ],
      fat: [
        25,
        50
      ]
    },
    note: "Per shared plate portion. Deep-fried har cheong gai; wings and mid-joints vary by batter and skin.",
    aliases: [
      "prawn paste chicken",
      "har cheong gai",
      "shrimp paste chicken",
      "虾酱鸡",
      "虾酱鸡翅",
      "虾酱炸鸡"
    ],
    defaultModifierIds: [
      "small-plate-prawn-paste-chicken"
    ],
    modifiers: [
      {
        id: "shared-quarter-prawn-paste-chicken",
        label: "Shared quarter",
        delta: [
          -250,
          -130
        ]
      },
      {
        id: "shared-third-prawn-paste-chicken",
        label: "Shared third",
        delta: [
          -150,
          -60
        ]
      },
      {
        id: "small-plate-prawn-paste-chicken",
        label: "Small plate portion",
        delta: [
          0,
          0
        ]
      },
      {
        id: "extra-chilli-prawn-paste-chicken",
        label: "Extra chilli sauce",
        delta: [
          20,
          80
        ]
      }
    ]
  },
  {
    id: "crab-bee-hoon",
    name: "Crab Bee Hoon",
    chineseName: "螃蟹米粉",
    confidence: "Low",
    baseRange: [
      500,
      950
    ],
    macroRange: {
      protein: [
        28,
        60
      ],
      carbs: [
        55,
        115
      ],
      fat: [
        16,
        45
      ]
    },
    note: "Per personal shared portion. Soup and dry versions differ; crab size, broth, and noodle share decide the range.",
    aliases: [
      "crab bee hoon",
      "crab beehoon",
      "crab vermicelli",
      "螃蟹米粉",
      "螃蟹米粉汤",
      "干炒螃蟹米粉"
    ],
    defaultModifierIds: [
      "shared-third-crab-bee-hoon"
    ],
    modifiers: [
      {
        id: "shared-quarter-crab-bee-hoon",
        label: "Shared quarter",
        delta: [
          -320,
          -150
        ]
      },
      {
        id: "shared-third-crab-bee-hoon",
        label: "Shared third",
        delta: [
          0,
          0
        ]
      },
      {
        id: "shared-half-crab-bee-hoon",
        label: "Shared half",
        delta: [
          180,
          430
        ]
      },
      {
        id: "extra-broth-crab-bee-hoon",
        label: "Extra broth or gravy",
        delta: [
          40,
          140
        ]
      }
    ]
  },
  {
    id: "chap-chye",
    name: "Chap Chye",
    chineseName: "杂菜",
    confidence: "Medium",
    baseRange: [
      120,
      260
    ],
    macroRange: {
      protein: [
        3,
        10
      ],
      carbs: [
        10,
        24
      ],
      fat: [
        5,
        16
      ]
    },
    note: "Braised mixed vegetables with cabbage, mushrooms, beancurd skin, and glass noodles. Oil and portion size matter.",
    aliases: [
      "chap chye",
      "nonya chap chye",
      "braised mixed vegetables",
      "mixed veg",
      "杂菜",
      "娘惹杂菜"
    ],
    defaultModifierIds: [],
    modifiers: [
      {
        id: "shared-chap-chye",
        label: "Shared portion",
        delta: [
          -90,
          -45
        ]
      },
      {
        id: "large-chap-chye",
        label: "Large serving",
        delta: [
          70,
          140
        ]
      },
      {
        id: "extra-beancurd-skin-chap-chye",
        label: "More beancurd skin",
        delta: [
          40,
          90
        ]
      }
    ]
  },
  {
    id: "sambal-long-beans",
    name: "Sambal Long Beans",
    chineseName: "叁峇长豆",
    confidence: "Medium",
    baseRange: [
      90,
      220
    ],
    macroRange: {
      protein: [
        2,
        6
      ],
      carbs: [
        8,
        18
      ],
      fat: [
        5,
        16
      ]
    },
    note: "Common cai png or nasi padang side. Sambal and oil drive most of the calorie swing.",
    aliases: [
      "sambal long beans",
      "sambal kacang panjang",
      "long beans",
      "spicy long beans",
      "叁峇长豆",
      "辣炒长豆"
    ],
    defaultModifierIds: [],
    modifiers: [
      {
        id: "shared-sambal-long-beans",
        label: "Shared portion",
        delta: [
          -70,
          -35
        ]
      },
      {
        id: "less-oil-sambal-long-beans",
        label: "Less oil",
        delta: [
          -45,
          -20
        ]
      },
      {
        id: "large-sambal-long-beans",
        label: "Large serving",
        delta: [
          60,
          120
        ]
      }
    ]
  },
  {
    id: "achar-side",
    name: "Achar",
    chineseName: "阿杂",
    confidence: "Medium",
    baseRange: [
      40,
      140
    ],
    macroRange: {
      protein: [
        1,
        4
      ],
      carbs: [
        5,
        18
      ],
      fat: [
        2,
        9
      ]
    },
    note: "Pickled vegetables with chilli, vinegar, sugar, and sometimes peanuts. Usually a small side.",
    aliases: [
      "achar",
      "nyonya achar",
      "acar",
      "pickled vegetables",
      "阿杂",
      "腌菜"
    ],
    defaultModifierIds: [],
    modifiers: [
      {
        id: "small-achar",
        label: "Small side",
        delta: [
          -45,
          -20
        ]
      },
      {
        id: "peanuts-achar",
        label: "With peanuts",
        delta: [
          35,
          70
        ]
      },
      {
        id: "large-achar",
        label: "Large side",
        delta: [
          45,
          90
        ]
      }
    ]
  },
  {
    id: "bean-sprouts-side",
    name: "Bean Sprouts Side",
    chineseName: "豆芽",
    confidence: "High",
    baseRange: [
      40,
      120
    ],
    macroRange: {
      protein: [
        2,
        6
      ],
      carbs: [
        4,
        12
      ],
      fat: [
        1,
        8
      ]
    },
    note: "Blanched or lightly stir-fried taugeh served with chicken rice, hor fun, or zi char.",
    aliases: [
      "bean sprouts",
      "beansprouts",
      "taugeh",
      "豆芽",
      "芽菜"
    ],
    defaultModifierIds: [],
    modifiers: [
      {
        id: "plain-bean-sprouts",
        label: "Plain/blanched",
        delta: [
          -25,
          -10
        ]
      },
      {
        id: "oily-bean-sprouts",
        label: "Oil dressing",
        delta: [
          25,
          60
        ]
      },
      {
        id: "large-bean-sprouts",
        label: "Large side",
        delta: [
          40,
          80
        ]
      }
    ]
  },
  {
    id: "plain-rice-addon",
    name: "Plain Rice Add-on",
    chineseName: "白饭",
    confidence: "High",
    baseRange: [
      180,
      320
    ],
    macroRange: {
      protein: [
        3,
        7
      ],
      carbs: [
        38,
        70
      ],
      fat: [
        0,
        2
      ]
    },
    note: "Extra white rice for shared dishes, economy rice, or zi char. Use lower end for half rice.",
    aliases: [
      "plain rice",
      "white rice",
      "extra rice",
      "nasi putih",
      "白饭",
      "白飯",
      "加饭"
    ],
    defaultModifierIds: [],
    modifiers: [
      {
        id: "half-rice-addon",
        label: "Half rice",
        delta: [
          -120,
          -70
        ]
      },
      {
        id: "full-rice-addon",
        label: "Full rice",
        delta: [
          0,
          0
        ]
      },
      {
        id: "large-rice-addon",
        label: "Large rice",
        delta: [
          70,
          130
        ]
      }
    ]
  },
  {
    id: "fried-egg-addon",
    name: "Fried Egg Add-on",
    chineseName: "煎蛋",
    confidence: "High",
    baseRange: [
      90,
      180
    ],
    macroRange: {
      protein: [
        6,
        10
      ],
      carbs: [
        0,
        2
      ],
      fat: [
        7,
        15
      ]
    },
    note: "Common add-on for nasi lemak, fried rice, mee goreng, and cai png. Oil level decides the range.",
    aliases: [
      "fried egg",
      "sunny side up",
      "egg add on",
      "telur mata",
      "煎蛋",
      "荷包蛋"
    ],
    defaultModifierIds: [],
    modifiers: [
      {
        id: "one-fried-egg",
        label: "1 egg",
        delta: [
          0,
          0
        ]
      },
      {
        id: "less-oil-fried-egg",
        label: "Less oil",
        delta: [
          -45,
          -20
        ]
      },
      {
        id: "two-fried-eggs",
        label: "2 eggs",
        delta: [
          90,
          180
        ]
      }
    ]
  },
  {
    id: "seaweed-soup-side",
    name: "Seaweed Soup",
    chineseName: "紫菜汤",
    confidence: "Medium",
    baseRange: [
      50,
      180
    ],
    macroRange: {
      protein: [
        3,
        12
      ],
      carbs: [
        3,
        14
      ],
      fat: [
        1,
        10
      ]
    },
    note: "Light soup often served with minced pork, egg, tofu, or fishball. Higher when it includes meatballs or egg.",
    aliases: [
      "seaweed soup",
      "zi cai tang",
      "seaweed egg soup",
      "seaweed minced pork soup",
      "紫菜汤",
      "紫菜蛋花汤"
    ],
    defaultModifierIds: [],
    modifiers: [
      {
        id: "plain-seaweed-soup",
        label: "Plain soup",
        delta: [
          -40,
          -15
        ]
      },
      {
        id: "egg-seaweed-soup",
        label: "With egg",
        delta: [
          45,
          80
        ]
      },
      {
        id: "meatball-seaweed-soup",
        label: "With meatballs",
        delta: [
          70,
          140
        ]
      }
    ]
  },
  {
    id: "ang-ku-kueh",
    name: "Ang Ku Kueh",
    chineseName: "红龟粿",
    confidence: "Medium",
    baseRange: [
      140,
      260
    ],
    macroRange: {
      protein: [
        3,
        7
      ],
      carbs: [
        25,
        45
      ],
      fat: [
        3,
        9
      ]
    },
    note: "Small glutinous rice cake with sweet mung bean, peanut, or red bean filling. Size and filling are the main levers.",
    aliases: [
      "ang ku kueh",
      "ang ku kuih",
      "red tortoise cake",
      "红龟粿",
      "红龟糕"
    ],
    defaultModifierIds: [
      "one-ang-ku-kueh"
    ],
    modifiers: [
      {
        id: "one-ang-ku-kueh",
        label: "1 piece",
        delta: [
          0,
          0
        ]
      },
      {
        id: "peanut-ang-ku-kueh",
        label: "Peanut filling",
        delta: [
          30,
          70
        ]
      },
      {
        id: "large-ang-ku-kueh",
        label: "Large piece",
        delta: [
          60,
          120
        ]
      }
    ]
  },
  {
    id: "ondeh-ondeh",
    name: "Ondeh Ondeh",
    chineseName: "椰丝椰糖球",
    confidence: "Medium",
    baseRange: [
      120,
      260
    ],
    macroRange: {
      protein: [
        2,
        5
      ],
      carbs: [
        22,
        45
      ],
      fat: [
        3,
        10
      ]
    },
    note: "Glutinous rice balls filled with gula melaka and coated in grated coconut. Count pieces when possible.",
    aliases: [
      "ondeh ondeh",
      "onde-onde",
      "gula melaka balls",
      "椰糖糯米球",
      "椰丝球"
    ],
    defaultModifierIds: [
      "three-ondeh-ondeh"
    ],
    modifiers: [
      {
        id: "two-ondeh-ondeh",
        label: "2 pieces",
        delta: [
          -70,
          -35
        ]
      },
      {
        id: "three-ondeh-ondeh",
        label: "3 pieces",
        delta: [
          0,
          0
        ]
      },
      {
        id: "five-ondeh-ondeh",
        label: "5 pieces",
        delta: [
          80,
          170
        ]
      },
      {
        id: "extra-coconut-ondeh-ondeh",
        label: "Extra coconut",
        delta: [
          25,
          60
        ]
      }
    ]
  },
  {
    id: "putu-piring",
    name: "Putu Piring",
    chineseName: "椰糖米糕",
    confidence: "Medium",
    baseRange: [
      160,
      340
    ],
    macroRange: {
      protein: [
        2,
        6
      ],
      carbs: [
        35,
        70
      ],
      fat: [
        2,
        9
      ]
    },
    note: "Steamed rice flour cake with gula melaka and grated coconut. Usually logged by pieces.",
    aliases: [
      "putu piring",
      "putu piring gula melaka",
      "tu tu kueh gula melaka",
      "椰糖米糕",
      "椰糖嘟嘟糕"
    ],
    defaultModifierIds: [
      "two-putu-piring"
    ],
    modifiers: [
      {
        id: "one-putu-piring",
        label: "1 piece",
        delta: [
          -90,
          -45
        ]
      },
      {
        id: "two-putu-piring",
        label: "2 pieces",
        delta: [
          0,
          0
        ]
      },
      {
        id: "four-putu-piring",
        label: "4 pieces",
        delta: [
          160,
          340
        ]
      },
      {
        id: "extra-coconut-putu-piring",
        label: "Extra coconut",
        delta: [
          25,
          60
        ]
      }
    ]
  },
  {
    id: "milo-peng",
    name: "Milo Peng",
    chineseName: "冰美禄",
    confidence: "High",
    baseRange: [
      160,
      380
    ],
    macroRange: {
      protein: [
        5,
        12
      ],
      carbs: [
        28,
        70
      ],
      fat: [
        4,
        14
      ]
    },
    note: "Iced Milo from kopitiam or hawker drink stalls. Dinosaur topping adds a noticeable calorie bump.",
    aliases: [
      "milo peng",
      "iced milo",
      "milo ice",
      "milo bing",
      "冰Milo",
      "冰美禄"
    ],
    defaultModifierIds: [],
    modifiers: [
      {
        id: "siew-dai-milo-peng",
        label: "Less sugar",
        delta: [
          -60,
          -30
        ]
      },
      {
        id: "kosong-milo-peng",
        label: "No sugar",
        delta: [
          -90,
          -45
        ]
      },
      {
        id: "milo-dinosaur",
        label: "Milo dinosaur",
        delta: [
          90,
          170
        ]
      },
      {
        id: "large-milo-peng",
        label: "Large cup",
        delta: [
          60,
          120
        ]
      }
    ]
  },
  {
    id: "teh-peng",
    name: "Teh Peng",
    chineseName: "冰奶茶",
    confidence: "High",
    baseRange: [
      90,
      260
    ],
    macroRange: {
      protein: [
        2,
        7
      ],
      carbs: [
        15,
        50
      ],
      fat: [
        2,
        10
      ]
    },
    note: "Iced pulled milk tea. Sugar and condensed milk decide most of the range.",
    aliases: [
      "teh peng",
      "iced teh",
      "teh ice",
      "teh bing",
      "冰Teh",
      "冰奶茶"
    ],
    defaultModifierIds: [],
    modifiers: [
      {
        id: "siew-dai-teh-peng",
        label: "Less sugar",
        delta: [
          -55,
          -25
        ]
      },
      {
        id: "kosong-teh-peng",
        label: "No sugar",
        delta: [
          -85,
          -40
        ]
      },
      {
        id: "ga-dai-teh-peng",
        label: "Extra sweet",
        delta: [
          45,
          90
        ]
      },
      {
        id: "large-teh-peng",
        label: "Large cup",
        delta: [
          50,
          100
        ]
      }
    ]
  },
  {
    id: "barley-water",
    name: "Barley Water",
    chineseName: "薏米水",
    confidence: "Medium",
    baseRange: [
      50,
      190
    ],
    macroRange: {
      protein: [
        1,
        4
      ],
      carbs: [
        12,
        45
      ],
      fat: [
        0,
        2
      ]
    },
    note: "Hawker barley drink, sometimes with ginkgo or beancurd skin. Sweetness varies widely.",
    aliases: [
      "barley water",
      "barley drink",
      "薏米水",
      "大麦水",
      "白果薏米水"
    ],
    defaultModifierIds: [],
    modifiers: [
      {
        id: "siew-dai-barley",
        label: "Less sugar",
        delta: [
          -60,
          -30
        ]
      },
      {
        id: "kosong-barley",
        label: "No sugar",
        delta: [
          -85,
          -45
        ]
      },
      {
        id: "add-ginkgo-barley",
        label: "Add ginkgo",
        delta: [
          25,
          60
        ]
      },
      {
        id: "large-barley",
        label: "Large cup",
        delta: [
          45,
          90
        ]
      }
    ]
  },
  {
    id: "bandung",
    name: "Bandung",
    chineseName: "玫瑰奶",
    confidence: "Medium",
    baseRange: [
      120,
      320
    ],
    macroRange: {
      protein: [
        3,
        9
      ],
      carbs: [
        22,
        60
      ],
      fat: [
        3,
        12
      ]
    },
    note: "Rose syrup milk drink. Condensed milk and syrup make stall versions quite variable.",
    aliases: [
      "bandung",
      "air bandung",
      "rose milk",
      "玫瑰奶",
      "玫瑰露奶",
      "玫瑰糖水奶"
    ],
    defaultModifierIds: [],
    modifiers: [
      {
        id: "siew-dai-bandung",
        label: "Less sugar",
        delta: [
          -70,
          -35
        ]
      },
      {
        id: "ga-dai-bandung",
        label: "Extra sweet",
        delta: [
          50,
          100
        ]
      },
      {
        id: "large-bandung",
        label: "Large cup",
        delta: [
          70,
          140
        ]
      }
    ]
  }

];
