import { candidateMeals, type CandidateMeal } from "@/lib/food-catalog";
import type { MealConfidence } from "@/lib/mock-data";

export type AnalyzeMealMode = "camera" | "gallery" | "text";
export type MealAnalysisProvider = "heuristic" | "openai" | "glm";

export type MealAnalysisInput = {
  mode: AnalyzeMealMode;
  query?: string;
  fileName?: string;
  fileNames?: string[];
  imageDataUrl?: string;
  imageDataUrls?: string[];
};

export type MealAnalysisItem = {
  candidateId: string;
  modifierIds: string[];
  portion: number;
  confidence: MealConfidence | null;
};

export type MealAnalysisResult = {
  analysisLabel: string;
  analysisConfidence: MealConfidence | null;
  candidates: CandidateMeal[];
  selectedCandidateId: string;
  selectedModifierIds: string[];
  items: MealAnalysisItem[];
  provider: MealAnalysisProvider;
};

const GENERIC_CAMERA_FILE_PATTERNS = [
  /^img[_-]?\d+$/i,
  /^image$/i,
  /^photo$/i,
  /^fullsizeoutput[_-]?\d*$/i,
  /^pxl[_-]?\d+$/i,
  /^screenshot[_-]?\d*$/i,
];

const KEYWORD_BOOSTS: Record<string, string[]> = {
  chicken: ["chicken-rice"],
  pork: ["bak-chor-mee", "pig-trotter-rice", "mala-xiang-guo"],
  minced: ["bak-chor-mee"],
  bak: ["bak-chor-mee"],
  chor: ["bak-chor-mee"],
  rice: ["chicken-rice", "cai-png"],
  hainanese: ["chicken-rice"],
  steamed: ["chicken-rice"],
  roasted: ["chicken-rice"],
  noodle: ["fishball-noodle", "prawn-noodle", "bak-chor-mee"],
  noodles: ["fishball-noodle", "prawn-noodle", "bak-chor-mee"],
  mee: ["fishball-noodle", "prawn-noodle", "bak-chor-mee"],
  fishball: ["fishball-noodle"],
  fishballs: ["fishball-noodle"],
  pok: ["fishball-noodle"],
  kia: ["fishball-noodle"],
  prawn: ["prawn-noodle"],
  prawns: ["prawn-noodle"],
  shrimp: ["prawn-noodle"],
  hae: ["prawn-noodle"],
  rib: ["prawn-noodle"],
  ribs: ["prawn-noodle"],
  虾面: ["prawn-noodle"],
  虾: ["prawn-noodle"],
  排骨: ["prawn-noodle"],
  cai: ["cai-png"],
  png: ["cai-png"],
  chap: ["cai-png"],
  fan: ["cai-png"],
  economy: ["cai-png"],
  economic: ["cai-png"],
  kopi: ["kopi-c-siew-dai", "kaya-toast-set"],
  coffee: ["kopi-c-siew-dai", "kaya-toast-set"],
  kaya: ["kaya-toast-set"],
  toast: ["kaya-toast-set", "tuna-mayo-toast"],
  yakun: ["kaya-toast-set"],
  siew: ["kopi-c-siew-dai"],
  dai: ["kopi-c-siew-dai"],
  kosong: ["kopi-c-siew-dai"],
  gao: ["kopi-c-siew-dai"],
  nasi: ["nasi-lemak"],
  lemak: ["nasi-lemak"],
  coconut: ["nasi-lemak"],
  ytf: ["yong-tau-foo"],
  yong: ["yong-tau-foo"],
  tau: ["yong-tau-foo", "tau-huay-soy-dessert"],
  foo: ["yong-tau-foo"],
  豆腐: ["yong-tau-foo"],
  lei: ["lei-cha"],
  leicha: ["lei-cha"],
  thunder: ["lei-cha"],
  擂茶: ["lei-cha"],
  客家擂茶: ["lei-cha"],
  laksa: ["laksa"],
  curry: ["laksa", "roti-prata"],
  mala: ["mala-xiang-guo"],
  spicy: ["mala-xiang-guo"],
  hotpot: ["mala-xiang-guo"],
  麻辣香锅: ["mala-xiang-guo"],
  prata: ["roti-prata"],
  roti: ["roti-prata"],
  sliced: ["sliced-fish-soup"],
  broth: ["sliced-fish-soup"],
  鱼片汤: ["sliced-fish-soup"],
  鱼汤: ["sliced-fish-soup"],
  boba: ["bubble-tea"],
  bubble: ["bubble-tea"],
  tea: ["bubble-tea"],
  tuna: ["tuna-mayo-toast"],
  sandwich: ["tuna-mayo-toast"],
  mayo: ["tuna-mayo-toast"],
  soy: ["tau-huay-soy-dessert"],
  huay: ["tau-huay-soy-dessert"],
  beancurd: ["yong-tau-foo", "tau-huay-soy-dessert"],
  grass: ["tau-huay-soy-dessert"],
  jelly: ["tau-huay-soy-dessert"],
  trotter: ["pig-trotter-rice"],
  braised: ["pig-trotter-rice"],
  珍珠奶茶: ["bubble-tea"],
  豆花: ["tau-huay-soy-dessert"],
  豆浆: ["tau-huay-soy-dessert"],
  猪脚饭: ["pig-trotter-rice"],
};

const MODIFIER_HINTS: Record<string, string[]> = {
  "dry-bcm": ["dry"],
  "soup-bcm": ["soup"],
  "less-sauce-bcm": ["less sauce", "light sauce"],
  "no-lard-bcm": ["no lard", "less lard"],
  "extra-noodle-bcm": ["extra noodle", "more noodle"],
  "add-fishball-bcm": ["fishball", "fish ball"],
  "two-eggs-kaya": ["two eggs", "2 eggs", "soft boiled eggs"],
  "less-butter-kaya": ["less butter"],
  "less-kaya": ["less kaya"],
  "kopi-c-kaya": ["kopi c"],
  "kopi-kosong-kaya": ["kopi kosong"],
  "less-oil-mala": ["less oil", "no oil"],
  "less-salt-mala": ["less salt", "less sodium"],
  "no-noodles-mala": ["no noodles", "no noodle", "no carbs"],
  "more-veg-mala": ["more vegetables", "more veg", "veg"],
  "seafood-mala": ["seafood", "prawn", "shrimp", "squid"],
  "peanuts-mala": ["peanut", "peanuts"],
  "mayo-tuna-toast": ["mayo", "mayonnaise"],
  "light-mayo-tuna-toast": ["light mayo", "less mayo"],
  "wholemeal-tuna-toast": ["wholemeal", "whole grain"],
  "half-tuna-toast": ["half", "half portion"],
  "add-egg-tuna-toast": ["add egg", "with egg"],
  "unsweetened-tau-huay": ["unsweetened", "no sugar", "kosong"],
  "less-sugar-tau-huay": ["less sugar", "siew dai"],
  "ginkgo-tau-huay": ["ginkgo", "白果"],
  "grass-jelly-soy": ["grass jelly", "烧仙草"],
  "pearls-soy": ["pearls", "pearl", "boba"],
  "half-rice-pig-trotter": ["half rice", "less rice"],
  "less-gravy-pig-trotter": ["less gravy", "less sauce"],
  "leaner-pork-pig-trotter": ["lean", "leaner", "less fat"],
  "extra-veg-pig-trotter": ["extra veg", "extra vegetables"],
  "scallop-ccf": ["scallop", "扇贝", "帶子", "带子"],
  "prawn-ccf": ["prawn", "shrimp", "虾", "蝦"],
  "char-siew-ccf": ["char siew", "叉烧", "叉燒"],
  "extra-sauce-ccf": ["extra sauce", "more sauce", "酱多", "多酱"],
  "half-portion-ccf": ["half", "half portion", "半份"],
  "small-lor-mai-gai": ["small", "small piece", "小份"],
  "half-lor-mai-gai": ["half", "half portion", "半份"],
  "black-bean-ribs": ["black bean", "豉汁", "豆豉"],
  "fatty-ribs": ["fatty", "肥", "肥肉"],
  "small-ribs": ["small", "small plate", "小份", "小碟"],
  "shared-ribs": ["shared", "share", "分食", "一起吃"],
  "chili-oil-cucumber": ["chili oil", "辣油", "红油", "麻辣"],
  "sesame-cucumber": ["sesame", "芝麻", "麻酱"],
  "large-cucumber": ["large", "large serving", "一整根", "大份"],
  "half-rice": ["half rice", "less rice", "small rice"],
  "skin-removed": ["no skin", "skinless", "remove skin"],
  steamed: ["steamed"],
  roasted: ["roasted", "roast"],
  "add-egg": ["add egg", "with egg", "plus egg"],
  "extra-sauce": ["extra sauce", "more sauce", "gravy"],
  "less-rice-cai-png": ["less rice", "small rice"],
  "less-sauce": ["less sauce", "light sauce", "sauce less"],
  "extra-noodle": ["extra noodle", "more noodle", "add noodle"],
  "add-fishcake": ["fishcake", "add fishcake"],
  "soup-version": ["soup", "soup version"],
  "add-meatballs": ["meatball", "add meatballs"],
  "soup-prawn-mee": ["soup", "broth"],
  "dry-prawn-mee": ["dry"],
  "less-noodle-prawn-mee": ["less noodles", "small noodles", "less mee"],
  "extra-noodle-prawn-mee": ["extra noodles", "more noodles", "add noodles"],
  "extra-prawns-prawn-mee": ["extra prawns", "more prawns", "add prawns"],
  "add-ribs-prawn-mee": ["ribs", "pork ribs", "排骨"],
  "two-veg-one-meat": ["2 veg 1 meat", "two veg one meat", "2 vegetable 1 meat"],
  "three-veg-cai-png": ["3 veg", "three veg"],
  "extra-meat": ["extra meat", "more meat"],
  "curry-drizzle": ["curry", "curry drizzle"],
  "fried-item": ["fried", "fried item"],
  "brown-rice": ["brown rice"],
  hot: ["hot"],
  iced: ["iced", "peng"],
  gao: ["gao"],
  "less-milk": ["less milk"],
  kosong: ["kosong", "no sugar"],
  "half-rice-lemak": ["half rice", "less rice"],
  "add-wing-lemak": ["chicken wing", "add wing"],
  "extra-sambal-lemak": ["extra sambal", "more sambal"],
  "skip-peanuts-lemak": ["no peanuts", "skip peanuts"],
  "fried-fish-lemak": ["fried fish"],
  "soup-ytf": ["soup"],
  "dry-ytf": ["dry", "dry with sauce"],
  "add-noodles-ytf": ["add noodles", "with noodles"],
  "add-rice-ytf": ["add rice", "with rice"],
  "fried-pieces-ytf": ["fried pieces", "more fried"],
  "less-rice-lei-cha": ["less rice", "small rice"],
  "regular-rice-lei-cha": ["regular rice"],
  "extra-rice-lei-cha": ["extra rice", "more rice"],
  "peanuts-lei-cha": ["peanut", "peanuts"],
  "less-peanuts-lei-cha": ["less peanut", "less peanuts"],
  "fried-anchovies-lei-cha": ["anchovies", "ikan bilis", "fried anchovies"],
  "extra-tofu-lei-cha": ["extra tofu", "more tofu"],
  "less-gravy-laksa": ["less gravy", "less soup"],
  "extra-noodle-laksa": ["extra noodles", "more noodles"],
  "add-cockles-laksa": ["cockles", "add cockles"],
  "extra-puff-laksa": ["tau pok", "beancurd puff"],
  "extra-gravy-laksa": ["extra gravy", "more gravy"],
  "plain-prata": ["plain"],
  "egg-prata": ["egg prata", "with egg"],
  "two-piece-prata": ["2 pieces", "two pieces"],
  "curry-dip-prata": ["extra curry", "with curry"],
  "cheese-prata": ["cheese"],
  "clear-broth-fish-soup": ["clear broth", "clear soup"],
  "evap-milk-fish-soup": ["evaporated milk", "milk broth"],
  "add-rice-fish-soup": ["add rice", "with rice"],
  "add-beehoon-fish-soup": ["bee hoon", "with bee hoon"],
  "fried-fish-soup": ["fried fish"],
  "zero-sugar-bbt": ["0 sugar", "0% sugar", "zero sugar"],
  "quarter-sugar-bbt": ["25 sugar", "25% sugar", "quarter sugar"],
  "half-sugar-bbt": ["50 sugar", "50% sugar", "half sugar"],
  "pearls-bbt": ["pearls", "boba"],
  "milk-foam-bbt": ["milk foam", "foam"],
};

export function normalizeText(input: string) {
  return input
    .toLowerCase()
    .replace(/\.[a-z0-9]+$/g, " ")
    .replace(/[^a-z0-9\u4e00-\u9fff]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(input: string) {
  return normalizeText(input)
    .split(" ")
    .filter((token) => token.length > 0);
}

function isGenericCameraFileName(fileName?: string) {
  const normalizedFileName = normalizeText(fileName ?? "");
  const fileNameWithoutExtension = normalizedFileName
    .replace(/\s+jpe?g$/i, "")
    .replace(/\s+png$/i, "")
    .replace(/\s+heic$/i, "")
    .trim();
  const compactFileName = fileNameWithoutExtension.replace(/\s+/g, "");

  return GENERIC_CAMERA_FILE_PATTERNS.some((pattern) =>
    pattern.test(compactFileName),
  );
}

function scoreCandidate(candidate: CandidateMeal, source: string) {
  const normalizedSource = normalizeText(source);
  const tokens = tokenize(source);
  const phrases = [
    candidate.name,
    candidate.chineseName,
    ...candidate.aliases,
  ].map(normalizeText);
  let score = 0;

  for (const phrase of phrases) {
    if (phrase.length > 0 && normalizedSource.includes(phrase)) {
      score += Math.max(6, phrase.split(" ").length * 3);
    }
  }

  for (const token of tokens) {
    if (phrases.some((phrase) => phrase.includes(token))) {
      score += 2;
    }

    if (KEYWORD_BOOSTS[token]?.includes(candidate.id)) {
      score += 4;
    }
  }

  if (
    candidate.id === "kopi-c-siew-dai" &&
    normalizedSource.includes("siew dai")
  ) {
    score += 5;
  }

  if (
    candidate.id === "cai-png" &&
    (normalizedSource.includes("economy rice") ||
      normalizedSource.includes("chap fan"))
  ) {
    score += 5;
  }

  return score;
}

function getInputSource(input: MealAnalysisInput) {
  return [
    input.query,
    input.fileName,
    ...(input.fileNames ?? []),
  ]
    .filter((value): value is string => Boolean(value?.trim()))
    .join(" ")
    .trim();
}

function isSpecificEmbeddedPhrase(phrase: string) {
  if (/^[\u4e00-\u9fff]+$/.test(phrase)) {
    return phrase.length >= 2;
  }

  return phrase.includes(" ") || phrase.length >= 5;
}

function getCandidatePhrases(candidate: CandidateMeal) {
  return Array.from(
    new Set(
      [candidate.name, candidate.chineseName, ...candidate.aliases]
        .map(normalizeText)
        .filter((phrase) =>
          phrase.length > 0 && isSpecificEmbeddedPhrase(phrase),
        ),
    ),
  );
}

function splitEmbeddedMealSource(source: string) {
  const normalizedSource = normalizeText(source);
  const matches = candidateMeals.flatMap((candidate) =>
    getCandidatePhrases(candidate).flatMap((phrase) => {
      const index = normalizedSource.indexOf(phrase);

      return index >= 0
        ? [
            {
              candidateId: candidate.id,
              index,
              phrase,
            },
          ]
        : [];
    }),
  );
  const bestByCandidate = [
    ...matches
      .sort((left, right) =>
        left.index === right.index
          ? right.phrase.length - left.phrase.length
          : left.index - right.index,
      )
      .reduce((map, match) => {
        const current = map.get(match.candidateId);

        if (!current || match.phrase.length > current.phrase.length) {
          map.set(match.candidateId, match);
        }

        return map;
      }, new Map<string, (typeof matches)[number]>())
      .values(),
  ].sort((left, right) => left.index - right.index);

  if (bestByCandidate.length <= 1) {
    return [];
  }

  return bestByCandidate
    .map((match, index) => {
      const nextMatch = bestByCandidate[index + 1];

      return normalizedSource
        .slice(match.index, nextMatch?.index ?? normalizedSource.length)
        .trim();
    })
    .filter((part) => part.length > 0);
}

function splitMealSource(source: string) {
  const cleaned = source
    .replace(/\band\b/gi, "、")
    .replace(/[+,&，、;；/|\n]+/g, "、")
    .split("、")
    .map((part) => part.trim())
    .filter((part) => part.length > 0);

  if (cleaned.length > 1) {
    return cleaned;
  }

  const embeddedParts = splitEmbeddedMealSource(source);

  return embeddedParts.length > 1 ? embeddedParts : [source.trim()].filter(Boolean);
}

function includesAny(source: string, hints: string[]) {
  return hints.some((hint) => source.includes(normalizeText(hint)));
}

export function inferModifierIds(candidate: CandidateMeal, rawSource: string) {
  const normalizedSource = normalizeText(rawSource);
  const inferred = candidate.modifiers
    .filter((modifier) => {
      const hints = MODIFIER_HINTS[modifier.id] ?? [];
      const labelHint = normalizeText(modifier.label);

      return (
        (hints.length > 0 && includesAny(normalizedSource, hints)) ||
        (labelHint.length > 0 && normalizedSource.includes(labelHint))
      );
    })
    .map((modifier) => modifier.id);

  return inferred.length > 0 ? inferred : candidate.defaultModifierIds;
}

export function rankCandidateMatches(source: string) {
  return candidateMeals
    .map((candidate) => ({
      candidate,
      score: scoreCandidate(candidate, source),
    }))
    .sort((left, right) => right.score - left.score);
}

function buildAnalysisLabel(input: MealAnalysisInput, matched: boolean) {
  const dishHint = input.query?.trim();
  const source = dishHint || getInputSource(input);
  const genericCameraFileName = isGenericCameraFileName(input.fileName);
  const hasUpload = input.mode !== "text";
  const hasDishHint = Boolean(dishHint);

  if (
    hasUpload &&
    hasDishHint &&
    matched
  ) {
    return `Upload refined with your dish hint "${dishHint}".`;
  }

  if (
    hasUpload &&
    genericCameraFileName &&
    !hasDishHint
  ) {
    return matched
      ? "Vision provider is unavailable, so SnapCal used only the generic photo filename as a weak starting point. Add a short dish hint if the guess looks off."
      : "Vision provider is unavailable, so SnapCal cannot inspect the photo pixels right now. Add a short dish hint or pick the closest local dish below.";
  }

  if (!matched) {
    return hasUpload
      ? "Vision provider is unavailable, so SnapCal is showing a local SG starter set instead of claiming it recognized the photo."
      : "Heuristic text fallback is active. Showing the closest local starting point so users can correct in one tap.";
  }

  if (input.mode === "text" && source) {
    return `Heuristic text analysis matched local meal hints from "${source}".`;
  }

  if (hasUpload && source) {
    return `Vision provider is unavailable, so SnapCal used the filename or dish hint "${source}" as the local starting point.`;
  }

  if (source) {
    return `Heuristic analysis found local meal hints from "${source}".`;
  }

  return hasUpload
    ? "Vision provider is unavailable, so SnapCal is using a conservative local fallback instead of reading the photo pixels."
    : "Heuristic analysis found a likely local starting point for this meal.";
}

function inferHeuristicConfidence(
  input: MealAnalysisInput,
  rankedCandidates: Array<{ candidate: CandidateMeal; score: number }>,
  matched: boolean,
): MealConfidence | null {
  if (!matched) {
    return "Low";
  }

  const topMatch = rankedCandidates[0];
  const secondMatch = rankedCandidates[1];
  if (!topMatch) {
    return null;
  }

  const margin = topMatch.score - (secondMatch?.score ?? 0);
  const hasDishHint = Boolean(input.query?.trim());
  const hasSpecificUploadSignal =
    input.mode === "text" ||
    hasDishHint ||
    (Boolean(input.fileName?.trim()) && !isGenericCameraFileName(input.fileName));

  if (!hasSpecificUploadSignal) {
    return "Low";
  }

  if (topMatch.score >= 12 && margin >= 4) {
    return "High";
  }

  if (topMatch.score >= 6 || hasDishHint) {
    return "Medium";
  }

  return "Low";
}

export function buildMealAnalysisResult({
  analysisLabel,
  analysisConfidence = null,
  candidates,
  items,
  selectedCandidateId,
  selectedModifierIds,
  provider,
}: {
  analysisLabel: string;
  analysisConfidence?: MealConfidence | null;
  candidates: CandidateMeal[];
  items?: MealAnalysisItem[];
  selectedCandidateId: string;
  selectedModifierIds: string[];
  provider: MealAnalysisProvider;
}) {
  const dedupedCandidates = [
    ...new Map(
      candidates.map((candidate) => [candidate.id, candidate] as const),
    ).values(),
  ];
  const fallbackCandidates =
    dedupedCandidates.length > 0 ? dedupedCandidates : candidateMeals.slice(0, 3);
  const selectedCandidate =
    fallbackCandidates.find((candidate) => candidate.id === selectedCandidateId) ??
    fallbackCandidates[0] ??
    candidateMeals[0];
  const validModifierIds = new Set(
    selectedCandidate.modifiers.map((modifier) => modifier.id),
  );
  const sanitizedModifierIds = selectedModifierIds.filter((modifierId) =>
    validModifierIds.has(modifierId),
  );
  const sanitizedItems = (items ?? [])
    .map((item) => {
      const itemCandidate = fallbackCandidates.find(
        (candidate) => candidate.id === item.candidateId,
      ) ?? candidateMeals.find((candidate) => candidate.id === item.candidateId);

      if (!itemCandidate) {
        return null;
      }

      const itemModifierIds = item.modifierIds.filter((modifierId) =>
        itemCandidate.modifiers.some((modifier) => modifier.id === modifierId),
      );

      return {
        candidateId: itemCandidate.id,
        modifierIds:
          itemModifierIds.length > 0
            ? itemModifierIds
            : itemCandidate.defaultModifierIds,
        portion: Math.min(3, Math.max(0.15, item.portion || 1)),
        confidence: item.confidence,
      } satisfies MealAnalysisItem;
    })
    .filter((item): item is MealAnalysisItem => Boolean(item));
  const fallbackItems = sanitizedItems.length > 0
    ? sanitizedItems
    : [
        {
          candidateId: selectedCandidate.id,
          modifierIds:
            sanitizedModifierIds.length > 0
              ? sanitizedModifierIds
              : selectedCandidate.defaultModifierIds,
          portion: 1,
          confidence: analysisConfidence,
        },
      ];

  return {
    analysisLabel,
    analysisConfidence,
    candidates: fallbackCandidates,
    selectedCandidateId: selectedCandidate.id,
    selectedModifierIds:
      sanitizedModifierIds.length > 0
        ? sanitizedModifierIds
        : selectedCandidate.defaultModifierIds,
    items: fallbackItems,
    provider,
  } satisfies MealAnalysisResult;
}

export function analyzeMealInput(
  input: MealAnalysisInput,
): MealAnalysisResult {
  const source = getInputSource(input);
  const rankedCandidates = source ? rankCandidateMatches(source) : [];
  const matched = rankedCandidates.some((entry) => entry.score > 0);
  const sourceParts = splitMealSource(source);
  const matchedItems = sourceParts.flatMap((part) => {
    const partMatches = rankCandidateMatches(part).filter((entry) => entry.score > 0);
    const topMatch = partMatches[0];

    if (!topMatch) {
      return [];
    }

    return [
      {
        candidateId: topMatch.candidate.id,
        modifierIds: inferModifierIds(topMatch.candidate, part),
        portion: 1,
        confidence: inferHeuristicConfidence(input, partMatches, true),
      } satisfies MealAnalysisItem,
    ];
  });
  const candidates = matched
    ? [
        ...new Map(
          [
            ...matchedItems.flatMap((item) =>
              candidateMeals.find((candidate) => candidate.id === item.candidateId) ?? [],
            ),
            ...rankedCandidates.slice(0, 3).map((entry) => entry.candidate),
          ].map((candidate) => [candidate.id, candidate] as const),
        ).values(),
      ]
    : candidateMeals.slice(0, 3);
  const selectedCandidate = candidates[0] ?? candidateMeals[0];

  return buildMealAnalysisResult({
    analysisLabel: buildAnalysisLabel(input, matched),
    analysisConfidence: inferHeuristicConfidence(
      input,
      rankedCandidates,
      matched,
    ),
    candidates,
    items: matchedItems,
    selectedCandidateId: selectedCandidate.id,
    selectedModifierIds: inferModifierIds(selectedCandidate, source),
    provider: "heuristic",
  });
}

export function buildDraftFromShortcut({
  name,
  modifiers,
}: {
  name: string;
  modifiers: string[];
}) {
  const shortcutAnalysis = analyzeMealInput({
    mode: "text",
    query: [name, ...modifiers].join(" ").trim(),
  });

  return {
    ...shortcutAnalysis,
    analysisLabel: `Loaded ${name} into the draft panel. Fine-tune the local modifier chips before you confirm.`,
  } satisfies MealAnalysisResult;
}
