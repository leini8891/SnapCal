"use client";

import Image from "next/image";
import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import SnapCalNav from "@/components/snapcal-nav";
import {
  useSnapCal,
  type SnapCalLanguage,
} from "@/components/snapcal-provider";
import {
  buildDraftFromShortcut,
  type MealAnalysisItem,
  type MealAnalysisResult,
} from "@/lib/analyze/meal-analysis";
import { prepareImageUpload } from "@/lib/client/image-upload";
import {
  quickStartExamples,
  type LoggedMeal,
  type MealConfidence,
  type Range,
} from "@/lib/mock-data";
import {
  candidateMeals,
  type CandidateMeal,
} from "@/lib/food-catalog";
import {
  applyModifierIdsToCandidate,
  estimateMacroRange,
} from "@/lib/nutrition-estimate";
import {
  formatCalories,
  formatMacroSummary,
  formatLoggedTime,
  isTodayInSingapore,
  sourceLabel,
  sumRanges,
} from "@/lib/snapcal-utils";

type InputMode = "camera" | "gallery" | "text";
type ServingMode = "solo" | "shared";
type DraftMealItem = MealAnalysisItem;

const PORTION_PRESETS = [0.25, 0.5, 0.75, 1, 1.5, 2] as const;

function confidenceTone(confidence: MealConfidence | null | undefined) {
  if (confidence === "High") {
    return "bg-[var(--green-tint)] text-[#2e8049]";
  }

  if (confidence === "Medium") {
    return "bg-[var(--amber-tint)] text-[#9b6418]";
  }

  return "bg-[var(--coral-tint)] text-[var(--coral-ink)]";
}

function midpoint(range: Range) {
  return (range[0] + range[1]) / 2;
}

function scaleRange(range: Range, factor: number): Range {
  return [
    Math.max(0, Math.round(range[0] * factor)),
    Math.max(0, Math.round(range[1] * factor)),
  ];
}

function addRanges(left: Range, right: Range): Range {
  return [left[0] + right[0], left[1] + right[1]];
}

function clampShareInput(value: number) {
  if (!Number.isFinite(value)) {
    return 1;
  }

  return Math.min(12, Math.max(1, Math.round(value)));
}

function clampPortionInput(value: number) {
  if (!Number.isFinite(value)) {
    return 1;
  }

  return Math.min(3, Math.max(0.15, Math.round(value * 4) / 4));
}

function formatPortionLabel(portion: number, isZh: boolean) {
  if (portion === 0.25) {
    return isZh ? "1/4 份" : "1/4 serving";
  }

  if (portion === 0.5) {
    return isZh ? "半份" : "1/2 serving";
  }

  if (portion === 0.75) {
    return isZh ? "3/4 份" : "3/4 serving";
  }

  if (portion === 1) {
    return isZh ? "一份" : "1 serving";
  }

  return isZh ? `${portion} 份` : `${portion} servings`;
}
function confidenceLabel(
  confidence: MealConfidence,
  language: SnapCalLanguage,
) {
  if (language === "en") {
    return confidence;
  }

  if (confidence === "High") {
    return "高";
  }

  if (confidence === "Medium") {
    return "中";
  }

  return "低";
}

function localizedSourceLabel(
  source: LoggedMeal["source"],
  language: SnapCalLanguage,
) {
  if (language === "en") {
    return sourceLabel(source);
  }

  if (source === "camera") {
    return "相机";
  }

  if (source === "gallery") {
    return "相册";
  }

  return "文字";
}

function buildMealGuidance({
  draftRange,
  draftMacroRange,
  goal,
  language,
  remainingAfterConfirm,
}: {
  draftRange: Range;
  draftMacroRange: {
    protein: Range;
    carbs: Range;
    fat: Range;
  };
  goal: number;
  language: SnapCalLanguage;
  remainingAfterConfirm: Range;
}) {
  const isZh = language === "zh";
  const mealMidpoint = midpoint(draftRange);
  const proteinMidpoint = midpoint(draftMacroRange.protein);
  const carbsMidpoint = midpoint(draftMacroRange.carbs);
  const fatMidpoint = midpoint(draftMacroRange.fat);

  if (remainingAfterConfirm[1] < 0) {
    return {
      title: isZh ? "这餐大概率偏重" : "This meal is likely on the heavier side",
      body: isZh
        ? "吃完这餐今天可能会超出目标。下一餐建议清一点：汤类、鱼、豆腐、鸡蛋，或者先跳过甜饮。"
        : "You will probably run past today's target after this. For the next meal, go lighter: soup, fish, tofu, eggs, or skip the sweet drink.",
    };
  }

  if (mealMidpoint > goal * 0.38) {
    return {
      title: isZh ? "今天剩下的餐简单一点" : "Keep the rest of the day simple",
      body: isZh
        ? "这餐占了今日预算的较大部分。如果目标是减脂，下一餐尽量少油、少酱、份量小一点。"
        : "This meal takes a big chunk of today's budget. The next meal should stay cleaner and smaller if fat loss is the goal.",
    };
  }

  if (proteinMidpoint < 20) {
    return {
      title: isZh ? "蛋白质看起来有点少" : "Protein looks a bit light",
      body: isZh
        ? "下一餐可以偏向鸡肉、鱼、豆腐或鸡蛋，会更顶饱，也更容易持续。"
        : "Your next meal can lean toward chicken, fish, tofu, or eggs so the day feels more filling and easier to sustain.",
    };
  }

  if (fatMidpoint > 25) {
    return {
      title: isZh ? "油和酱料可能是热量大头" : "Oil and sauce are probably doing a lot here",
      body: isZh
        ? "下一餐选汤类、少煎炸会更好，比一整天硬饿更稳。"
        : "A soup-based or less-fried next meal would balance this better than trying to cut too hard all day.",
    };
  }

  if (carbsMidpoint > 65) {
    return {
      title: isZh ? "这餐主要热量来自碳水" : "Carbs are doing most of the work here",
      body: isZh
        ? "可以接受，但下一餐更适合把重心放到蛋白质和蔬菜，少加饭、面或甜饮。"
        : "That is workable, but the next meal can shift toward protein and veg instead of extra rice, noodles, or sweet drinks.",
    };
  }

  return {
    title: isZh ? "这餐和今天目标还算匹配" : "This fits the day reasonably well",
    body: isZh
      ? `记录这餐后，今天大约还剩 ${formatCalories(remainingAfterConfirm)}。`
      : `After logging this, you still have about ${formatCalories(
          remainingAfterConfirm,
        )} left for the rest of today.`,
  };
}

export default function SnapCalHome() {
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const lastConfirmRef = useRef<{ signature: string; timestamp: number } | null>(
    null,
  );
  const {
    addLog,
    goal,
    language,
    logs,
    removeLog,
    updateLog,
  } = useSnapCal();
  const isZh = language === "zh";
  const readyMessage = isZh
    ? "准备好了。拍一张餐食照片，或者输入菜名开始估算。"
    : "Ready when you are. Take a photo or type a dish name to start.";
  const [inputMode, setInputMode] = useState<InputMode>("camera");
  const [searchTerm, setSearchTerm] = useState("");
  const [analysisCandidates, setAnalysisCandidates] =
    useState<CandidateMeal[]>(candidateMeals);
  const [analysisUploadFile, setAnalysisUploadFile] = useState<File | null>(null);
  const [analysisUploadFiles, setAnalysisUploadFiles] = useState<File[]>([]);
  const [dishHint, setDishHint] = useState("");
  const [draftDishQuery, setDraftDishQuery] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [previewName, setPreviewName] = useState("No photo selected yet");
  const [servingMode, setServingMode] = useState<ServingMode>("solo");
  const [sharedPeople, setSharedPeople] = useState(3);
  const [myShare, setMyShare] = useState(1);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisConfidence, setAnalysisConfidence] =
    useState<MealAnalysisResult["analysisConfidence"]>(null);
  const [selectedCandidateId, setSelectedCandidateId] = useState(
    candidateMeals[0].id,
  );
  const [selectedModifierIds, setSelectedModifierIds] = useState<string[]>(
    candidateMeals[0].defaultModifierIds,
  );
  const [draftItems, setDraftItems] = useState<DraftMealItem[]>([]);
  const [activeItemIndex, setActiveItemIndex] = useState(0);
  const [editingLogDraft, setEditingLogDraft] = useState<{
    id: string;
    loggedAt: string;
    source: (typeof logs)[number]["source"];
  } | null>(null);
  const [hasDraft, setHasDraft] = useState(false);
  const [statusMessage, setStatusMessage] = useState(readyMessage);
  const [duplicateConfirmSignature, setDuplicateConfirmSignature] = useState<
    string | null
  >(null);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) {
      return;
    }

    void navigator.serviceWorker.register("/sw.js", { scope: "/" });
  }, []);

  useEffect(() => {
    return () => {
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  useEffect(() => {
    if (
      !hasDraft &&
      !previewUrl &&
      !analysisUploadFile &&
      analysisUploadFiles.length === 0 &&
      !editingLogDraft &&
      searchTerm.trim().length === 0
    ) {
      setStatusMessage(readyMessage);
    }
  }, [
    analysisUploadFile,
    analysisUploadFiles.length,
    editingLogDraft,
    hasDraft,
    previewUrl,
    readyMessage,
    searchTerm,
  ]);

  const todayLogs = logs
    .filter((log) => isTodayInSingapore(log.loggedAt))
    .sort(
      (left, right) =>
        new Date(right.loggedAt).getTime() - new Date(left.loggedAt).getTime(),
    );
  const visibleCandidates =
    analysisCandidates.length > 0 ? analysisCandidates : candidateMeals;
  const activeDraftItem = draftItems[activeItemIndex];
  const selectedCandidate =
    candidateMeals.find((candidate) => candidate.id === activeDraftItem?.candidateId) ??
    visibleCandidates.find((candidate) => candidate.id === selectedCandidateId) ??
    visibleCandidates[0];
  const quickSwapCandidates = visibleCandidates
    .filter((candidate) => candidate.id !== selectedCandidate.id)
    .slice(0, 3);
  const candidateChoiceOptions = [selectedCandidate, ...quickSwapCandidates].slice(
    0,
    3,
  );
  const safeSharedPeople = clampShareInput(sharedPeople);
  const safeMyShare = Math.min(clampShareInput(myShare), safeSharedPeople);
  const servingFactor = servingMode === "shared" ? safeMyShare / safeSharedPeople : 1;
  const draftItemEstimates = (draftItems.length > 0
    ? draftItems
    : [
        {
          candidateId: selectedCandidate.id,
          modifierIds: selectedModifierIds,
          portion: 1,
          confidence: analysisConfidence ?? selectedCandidate.confidence,
        } satisfies DraftMealItem,
      ]).flatMap((item) => {
        const itemCandidate = candidateMeals.find(
          (candidate) => candidate.id === item.candidateId,
        );

        if (!itemCandidate) {
          return [];
        }

        const baseRange = applyModifierIdsToCandidate(
          itemCandidate,
          item.modifierIds,
        );
        const portionRange = scaleRange(baseRange, item.portion);
        const macroRange = estimateMacroRange(itemCandidate, portionRange);

        return [
          {
            ...item,
            candidate: itemCandidate,
            kcalRange: scaleRange(portionRange, servingFactor),
            unsharedKcalRange: portionRange,
            macroRange: {
              protein: scaleRange(macroRange.protein, servingFactor),
              carbs: scaleRange(macroRange.carbs, servingFactor),
              fat: scaleRange(macroRange.fat, servingFactor),
            },
          },
        ];
      });
  const activeDraftItemEstimate =
    draftItemEstimates[activeItemIndex] ?? draftItemEstimates[0];
  const activePortion = activeDraftItemEstimate?.portion ?? 1;
  const draftRange = draftItemEstimates.reduce<Range>(
    (total, item) => addRanges(total, item.kcalRange),
    [0, 0],
  );
  const draftMacroRange = draftItemEstimates.reduce(
    (total, item) => ({
      protein: addRanges(total.protein, item.macroRange.protein),
      carbs: addRanges(total.carbs, item.macroRange.carbs),
      fat: addRanges(total.fat, item.macroRange.fat),
    }),
    {
      protein: [0, 0] as Range,
      carbs: [0, 0] as Range,
      fat: [0, 0] as Range,
    },
  );
  const consumedSoFar = sumRanges(todayLogs);
  const projectedAfterConfirm: Range = [
    consumedSoFar[0] + draftRange[0],
    consumedSoFar[1] + draftRange[1],
  ];
  const remainingAfterConfirm: Range = [
    goal - projectedAfterConfirm[1],
    goal - projectedAfterConfirm[0],
  ];
  const guidance = buildMealGuidance({
    draftRange,
    draftMacroRange,
    goal,
    language,
    remainingAfterConfirm,
  });
  const currentConfidence = analysisConfidence ?? selectedCandidate.confidence;
  const draftMealName = draftItemEstimates.length > 1
    ? draftItemEstimates.map((item) => item.candidate.name).join(" + ")
    : selectedCandidate.name;
  const draftLogModifierLabels = [
    ...draftItemEstimates.map((item) => {
      const modifierLabels = item.candidate.modifiers
        .filter((modifier) => item.modifierIds.includes(modifier.id))
        .map((modifier) => modifier.label);
      const portionLabel = item.portion !== 1 ? `x${item.portion}` : null;

      return [item.candidate.name, portionLabel, ...modifierLabels]
        .filter(Boolean)
        .join(" · ");
    }),
    servingMode === "shared"
      ? isZh
        ? `聚餐分摊：${safeMyShare}/${safeSharedPeople}`
        : `Shared meal: ${safeMyShare}/${safeSharedPeople}`
      : null,
  ].filter((label): label is string => Boolean(label));
  const showEstimate = hasDraft;
  const showLoadingState =
    !showEstimate &&
    isAnalyzing &&
    (Boolean(previewUrl) || searchTerm.trim().length > 0);

  function resetDraft(nextStatusMessage = readyMessage) {
    previewUrls.forEach((url) => URL.revokeObjectURL(url));

    setPreviewUrl(null);
    setPreviewUrls([]);
    setPreviewName("No photo selected yet");
    setAnalysisUploadFile(null);
    setAnalysisUploadFiles([]);
    setDishHint("");
    setDraftDishQuery("");
    setSearchTerm("");
    setInputMode("camera");
    setServingMode("solo");
    setSharedPeople(3);
    setMyShare(1);
    setAnalysisCandidates(candidateMeals);
    setSelectedCandidateId(candidateMeals[0].id);
    setSelectedModifierIds(candidateMeals[0].defaultModifierIds);
    setDraftItems([]);
    setActiveItemIndex(0);
    setAnalysisConfidence(null);
    setEditingLogDraft(null);
    setHasDraft(false);
    setDuplicateConfirmSignature(null);
    setStatusMessage(nextStatusMessage);
  }

  function selectCandidate(candidate: CandidateMeal) {
    setSelectedCandidateId(candidate.id);
    setSelectedModifierIds(candidate.defaultModifierIds);
    setDraftItems((items) => {
      if (items.length === 0) {
        return [
          {
            candidateId: candidate.id,
            modifierIds: candidate.defaultModifierIds,
            portion: 1,
            confidence: candidate.confidence,
          },
        ];
      }

      return items.map((item, index) =>
        index === activeItemIndex
          ? {
              ...item,
              candidateId: candidate.id,
              modifierIds: candidate.defaultModifierIds,
              confidence: candidate.confidence,
            }
          : item,
      );
    });
    setAnalysisConfidence(candidate.confidence);
    setHasDraft(true);
  }

  function selectCandidateFromQuickSwap(candidate: CandidateMeal) {
    selectCandidate(candidate);
    setStatusMessage(
      isZh
        ? `${candidate.name} 看起来更接近。份量或配料不准的话，可以继续点下面的快速调整。`
        : `${candidate.name} looks closer. Tap any quick fixes below if the portion or extras still need tuning.`,
    );
  }

  function updateSearchTerm(value: string) {
    setSearchTerm(value);

    if (
      value.trim().length === 0 &&
      !analysisUploadFile &&
      analysisUploadFiles.length === 0 &&
      !editingLogDraft
    ) {
      setAnalysisCandidates(candidateMeals);
      setSelectedCandidateId(candidateMeals[0].id);
      setSelectedModifierIds(candidateMeals[0].defaultModifierIds);
      setDraftItems([]);
      setActiveItemIndex(0);
      setAnalysisConfidence(null);
      setHasDraft(false);
      setStatusMessage(
        isZh
          ? "搜索已清空。输入菜名或上传照片即可开始。"
          : "Search cleared. Type a dish name or use a photo to begin.",
      );
    }
  }

  function applyAnalysisResult(result: MealAnalysisResult) {
    const nextCandidates =
      result.candidates.length > 0 ? result.candidates : candidateMeals;
    const nextSelectedCandidate =
      nextCandidates.find(
        (candidate) => candidate.id === result.selectedCandidateId,
      ) ?? nextCandidates[0];

    setAnalysisCandidates(nextCandidates);
    setSelectedCandidateId(nextSelectedCandidate.id);
    setAnalysisConfidence(result.analysisConfidence ?? nextSelectedCandidate.confidence);
    setSelectedModifierIds(
      result.selectedModifierIds.length > 0
        ? result.selectedModifierIds
        : nextSelectedCandidate.defaultModifierIds,
    );
    setDraftItems(
      result.items.length > 0
        ? result.items
        : [
            {
              candidateId: nextSelectedCandidate.id,
              modifierIds:
                result.selectedModifierIds.length > 0
                  ? result.selectedModifierIds
                  : nextSelectedCandidate.defaultModifierIds,
              portion: 1,
              confidence: result.analysisConfidence ?? nextSelectedCandidate.confidence,
            },
          ],
    );
    setActiveItemIndex(0);
    setDishHint("");
    setDraftDishQuery("");
    setHasDraft(true);
    setStatusMessage(
      isZh
        ? result.items.length > 1
          ? `已识别 ${result.items.length} 个餐食项目。可以点每一项微调份量或配料。`
          : `${nextSelectedCandidate.name} 是目前最接近的匹配。如果哪里不准，可以用快速调整微调。`
        : result.items.length > 1
          ? `${result.items.length} meal items found. Tap each item to tune portions or modifiers.`
          : `${nextSelectedCandidate.name} is the closest match right now. Adjust the quick fixes if anything looks off.`,
    );
  }

  async function analyzeMeal({
    file,
    files,
    introMessage,
    mode,
    query,
  }: {
    file?: File;
    files?: File[];
    introMessage?: string;
    mode: InputMode;
    query?: string;
  }) {
    setIsAnalyzing(true);
    setAnalysisConfidence(null);
    setStatusMessage(
      introMessage ??
        (mode === "text"
          ? isZh
            ? "正在和本地常见餐食匹配..."
            : "Checking that dish against local meal matches..."
          : isZh
            ? "正在查看你的餐食照片..."
            : "Looking at your meal photo..."),
    );

    try {
      const uploadFiles = files?.length ? files : file ? [file] : [];
      const response = uploadFiles.length > 0
        ? await fetch("/api/analyze-meal", {
            method: "POST",
            body: (() => {
              const formData = new FormData();

              formData.set("mode", mode);
              uploadFiles.forEach((uploadFile) => {
                formData.append("images", uploadFile);
              });

              if (query) {
                formData.set("query", query);
              }

              return formData;
            })(),
          })
        : await fetch("/api/analyze-meal", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              mode,
              query,
              fileNames: analysisUploadFiles.map((uploadFile) => uploadFile.name),
            }),
          });

      if (!response.ok) {
        throw new Error(`analyze-meal failed with ${response.status}`);
      }

      const result = (await response.json()) as MealAnalysisResult;
      applyAnalysisResult(result);
    } catch {
      setAnalysisCandidates(candidateMeals);
      setSelectedCandidateId(candidateMeals[0].id);
      setSelectedModifierIds(candidateMeals[0].defaultModifierIds);
      setAnalysisConfidence(candidateMeals[0].confidence);
      setHasDraft(true);
      setStatusMessage(
        isZh
          ? "刚才没能识别得很清楚，但你仍然可以选择最接近的本地餐食，再在下面微调。"
          : "I could not read that clearly just now, but you can still pick the closest local dish and tune it below.",
      );
    } finally {
      setIsAnalyzing(false);
    }
  }

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setInputMode("text");

    if (searchTerm.trim().length === 0) {
      setHasDraft(false);
      setStatusMessage(
        isZh
          ? "先输入一个小贩中心餐食或饮料名。"
          : "Type a hawker dish or drink name first.",
      );
      return;
    }

    void analyzeMeal({
      mode: "text",
      query: searchTerm.trim(),
    });
  }

  function runQuickExample(query: string, label: string) {
    previewUrls.forEach((url) => URL.revokeObjectURL(url));

    setAnalysisUploadFile(null);
    setAnalysisUploadFiles([]);
    setPreviewUrl(null);
    setPreviewUrls([]);
    setDishHint("");
    setDraftDishQuery("");
    setPreviewName("No photo selected yet");
    setInputMode("text");
    setSearchTerm(query);
    setStatusMessage(
      isZh
        ? `正在试一个 ${label} 示例，让你快速看看流程。`
        : `Trying a sample ${label} log so you can see the flow quickly.`,
    );
    void analyzeMeal({
      mode: "text",
      query,
    });
  }

  function openInput(mode: Extract<InputMode, "camera" | "gallery">) {
    setInputMode(mode);
    if (mode === "camera") {
      cameraInputRef.current?.click();
      return;
    }

    galleryInputRef.current?.click();
  }

  async function handleFileChange(
    event: ChangeEvent<HTMLInputElement>,
    mode: Extract<InputMode, "camera" | "gallery">,
  ) {
    const files = Array.from(event.target.files ?? []).slice(0, 6);

    if (files.length === 0) {
      return;
    }

    previewUrls.forEach((url) => URL.revokeObjectURL(url));

    const nextPreviewUrls = files.map((selectedFile) => URL.createObjectURL(selectedFile));
    setPreviewUrls(nextPreviewUrls);
    setPreviewUrl(nextPreviewUrls[0] ?? null);
    setPreviewName(
      files.length === 1
        ? files[0].name
        : isZh
          ? `${files.length} 张照片已选择`
          : `${files.length} photos selected`,
    );
    setDishHint("");
    setDraftDishQuery("");
    setInputMode(mode);
    setStatusMessage(
      isZh
        ? files.length > 1
          ? `${files.length} 张照片已添加，正在估算整餐...`
          : "照片已添加，正在估算..."
        : files.length > 1
          ? `${files.length} photos added. Estimating the meal...`
          : "Photo added. Estimating now...",
    );

    try {
      const preparedUploads = await Promise.all(
        files.map((selectedFile) => prepareImageUpload(selectedFile)),
      );
      const preparedFiles = preparedUploads.map((upload) => upload.file);
      setAnalysisUploadFile(preparedFiles[0] ?? null);
      setAnalysisUploadFiles(preparedFiles);

      void analyzeMeal({
        files: preparedFiles,
        mode,
        introMessage: isZh
          ? files.length > 1
            ? `${files.length} 张照片已添加，正在估算整餐...`
            : "照片已添加，正在估算..."
          : files.length > 1
            ? `${files.length} photos added. Estimating the meal...`
            : "Photo added. Estimating now...",
      });
    } catch {
      setAnalysisUploadFile(files[0] ?? null);
      setAnalysisUploadFiles(files);
      void analyzeMeal({
        files,
        mode,
        introMessage: isZh
          ? files.length > 1
            ? `${files.length} 张照片已添加，正在估算整餐...`
            : "照片已添加，正在估算..."
          : files.length > 1
            ? `${files.length} photos added. Estimating the meal...`
            : "Photo added. Estimating now...",
      });
    }

    event.target.value = "";
  }

  function handleDishHintSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (analysisUploadFiles.length === 0 || dishHint.trim().length === 0) {
      return;
    }

    void analyzeMeal({
      files: analysisUploadFiles,
      mode: inputMode === "text" ? "gallery" : inputMode,
      query: dishHint.trim(),
      introMessage: isZh
        ? `正在用提示「${dishHint.trim()}」重新估算。`
        : `Trying again with the hint "${dishHint.trim()}".`,
    });
  }

  function handleDraftDishQuerySubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (draftDishQuery.trim().length === 0) {
      return;
    }

    const normalizedQuery = draftDishQuery.trim();

    setSearchTerm(normalizedQuery);
    void analyzeMeal({
      files: analysisUploadFiles.length > 0 ? analysisUploadFiles : undefined,
      mode: analysisUploadFiles.length > 0
        ? inputMode === "text"
          ? "gallery"
          : inputMode
        : "text",
      query: normalizedQuery,
      introMessage: isZh
        ? `正在检查「${normalizedQuery}」是否更接近。`
        : `Checking whether "${normalizedQuery}" is a better fit.`,
    });
  }

  function selectDraftItem(index: number) {
    const item = draftItems[index];
    const itemCandidate = item
      ? candidateMeals.find((candidate) => candidate.id === item.candidateId)
      : null;

    if (!item || !itemCandidate) {
      return;
    }

    setActiveItemIndex(index);
    setSelectedCandidateId(itemCandidate.id);
    setSelectedModifierIds(item.modifierIds);
    setAnalysisConfidence(item.confidence ?? itemCandidate.confidence);
  }

  function updateActiveItemPortion(nextPortion: number) {
    const sanitizedPortion = clampPortionInput(nextPortion);

    setDuplicateConfirmSignature(null);
    setDraftItems((items) => {
      if (items.length === 0) {
        return [
          {
            candidateId: selectedCandidate.id,
            modifierIds: selectedModifierIds,
            portion: sanitizedPortion,
            confidence: currentConfidence,
          },
        ];
      }

      return items.map((item, index) =>
        index === activeItemIndex
          ? {
              ...item,
              portion: sanitizedPortion,
            }
          : item,
      );
    });
    setStatusMessage(
      isZh
        ? "已把 " +
          selectedCandidate.name +
          " 调整为 " +
          formatPortionLabel(sanitizedPortion, true) +
          "。"
        : selectedCandidate.name +
          " set to " +
          formatPortionLabel(sanitizedPortion, false) +
          ".",
    );
  }
  function toggleModifier(modifierId: string) {
    setDuplicateConfirmSignature(null);
    setSelectedModifierIds((current) =>
      current.includes(modifierId)
        ? current.filter((item) => item !== modifierId)
        : [...current, modifierId],
    );
    setDraftItems((items) =>
      items.map((item, index) => {
        if (index !== activeItemIndex) {
          return item;
        }

        const nextModifierIds = item.modifierIds.includes(modifierId)
          ? item.modifierIds.filter((itemModifierId) => itemModifierId !== modifierId)
          : [...item.modifierIds, modifierId];

        return {
          ...item,
          modifierIds: nextModifierIds,
        };
      }),
    );
  }

  function buildConfirmationSignature() {
    return [
      editingLogDraft?.id ?? "new",
      draftMealName,
      draftRange[0],
      draftRange[1],
      [...draftLogModifierLabels].sort().join("|"),
    ].join("::");
  }

  function findRecentDuplicateLog(now: number) {
    const duplicateWindowMs = 20 * 60 * 1000;
    const modifierSignature = [...draftLogModifierLabels].sort().join("|");

    return todayLogs.find((log) => {
      if (editingLogDraft?.id === log.id) {
        return false;
      }

      const loggedAtMs = new Date(log.loggedAt).getTime();

      if (
        !Number.isFinite(loggedAtMs) ||
        Math.abs(now - loggedAtMs) > duplicateWindowMs
      ) {
        return false;
      }

      return (
        log.name === draftMealName &&
        log.kcalRange[0] === draftRange[0] &&
        log.kcalRange[1] === draftRange[1] &&
        [...log.modifiers].sort().join("|") === modifierSignature
      );
    });
  }

  function confirmMeal() {
    if (!hasDraft) {
      return;
    }

    const confirmationSignature = buildConfirmationSignature();
    const now = Date.now();

    if (
      lastConfirmRef.current &&
      lastConfirmRef.current.signature === confirmationSignature &&
      now - lastConfirmRef.current.timestamp < 1500
    ) {
      setStatusMessage(
        isZh
          ? "这餐刚刚已经记录过了，所以这次重复点击被忽略。"
          : "That meal was already logged just now, so I ignored the duplicate tap.",
      );
      return;
    }

    const recentDuplicateLog = findRecentDuplicateLog(now);

    if (
      !editingLogDraft &&
      recentDuplicateLog &&
      duplicateConfirmSignature !== confirmationSignature
    ) {
      setDuplicateConfirmSignature(confirmationSignature);
      setStatusMessage(
        isZh
          ? `${formatLoggedTime(
              recentDuplicateLog.loggedAt,
            )} 已经有一条相似的 ${draftMealName}。如果这确实是另一餐，再点一次「记录这餐」。`
          : `${draftMealName} already appears at ${formatLoggedTime(
              recentDuplicateLog.loggedAt,
            )}. If this is truly another meal, tap "Log this meal" again.`,
      );
      return;
    }

    setDuplicateConfirmSignature(null);
    lastConfirmRef.current = {
      signature: confirmationSignature,
      timestamp: now,
    };

    if (editingLogDraft) {
      updateLog(editingLogDraft.id, {
        name: draftMealName,
        loggedAt: editingLogDraft.loggedAt,
        kcalRange: draftRange,
        macroRange: draftMacroRange,
        confidence: currentConfidence,
        modifiers: draftLogModifierLabels,
        source: editingLogDraft.source,
      });
      resetDraft(
        isZh
          ? `${draftMealName} 已更新到今天的记录里。当前草稿已收起。`
          : `${draftMealName} was updated in today's log. The draft is now closed.`,
      );
      return;
    }

    const loggedAt = new Date().toISOString();

    addLog({
      id: crypto.randomUUID(),
      name: draftMealName,
      loggedAt,
      kcalRange: draftRange,
      macroRange: draftMacroRange,
      confidence: currentConfidence,
      modifiers: draftLogModifierLabels,
      source: inputMode,
    });
    resetDraft(
      isZh
        ? `${draftMealName} 已加入今天的餐食记录。可以继续拍下一餐。`
        : `${draftMealName} was added to today's meals. You can start the next meal now.`,
    );
  }

  function startEditingConfirmedLog(log: (typeof logs)[number]) {
    const draftAnalysis = buildDraftFromShortcut({
      name: log.name,
      modifiers: log.modifiers,
    });

    previewUrls.forEach((url) => URL.revokeObjectURL(url));

    setAnalysisUploadFile(null);
    setAnalysisUploadFiles([]);
    setPreviewUrl(null);
    setPreviewUrls([]);
    setDishHint("");
    setDraftDishQuery("");
    setPreviewName("No photo selected yet");
    setInputMode("text");
    setSearchTerm(log.name);
    applyAnalysisResult(draftAnalysis);
    setAnalysisConfidence(log.confidence ?? draftAnalysis.analysisConfidence);
    setEditingLogDraft({
      id: log.id,
      loggedAt: log.loggedAt,
      source: log.source,
    });
    setHasDraft(true);
    setStatusMessage(
      isZh
        ? `正在编辑 ${log.name}。调整估算后确认保存。`
        : `Editing ${log.name}. Update the estimate, then save when it looks right.`,
    );
  }

  function removeConfirmedLog(log: (typeof logs)[number]) {
    removeLog(log.id);
    if (editingLogDraft?.id === log.id) {
      setEditingLogDraft(null);
    }
    setStatusMessage(
      isZh
        ? `${log.name} 已从今天的餐食记录移除。`
        : `${log.name} was removed from today's meals.`,
    );
  }

  function cancelConfirmedLogEdit() {
    setEditingLogDraft(null);
    setStatusMessage(
      isZh
        ? "编辑已取消。你可以随时重新记录一餐。"
        : "Edit cancelled. You can start a fresh meal log anytime.",
    );
  }

  return (
    <main className="relative flex-1 px-4 py-4 sm:px-6 lg:px-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-5">
        <SnapCalNav />

        <section className="rounded-[24px] border border-[var(--line)] bg-white p-4 shadow-[var(--shadow-card)] sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold text-[var(--coral-ink)]">
                {isZh ? "新加坡餐食记录" : "Singapore meal logging"}
              </p>
              <h1 className="font-display mt-2 text-3xl font-bold leading-tight text-[var(--foreground)] sm:text-4xl">
                {isZh ? "拍一餐，快速记录。" : "Snap a meal. Log it fast."}
              </h1>
              <p className="mt-2 text-sm leading-7 text-[var(--muted)] sm:text-base">
                {isZh
                  ? "拍一张或多张照片，也可以输入菜名；先拿到热量区间，再按份量、米饭和酱料快速修正。"
                  : "Use one or more photos, or type a dish name; get a calorie range, then tune portion, rice, and sauce quickly."}
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2 lg:min-w-[460px]">
              <MetricCard
                label={isZh ? "已记录" : "Logged"}
                value={formatCalories(consumedSoFar)}
              />
              <MetricCard
                label={isZh ? "这餐" : "This meal"}
                value={
                  showEstimate
                    ? formatCalories(draftRange)
                    : isZh
                      ? "待估算"
                      : "Waiting"
                }
              />
              <MetricCard
                label={isZh ? "今日剩余" : "Left today"}
                value={showEstimate ? formatCalories(remainingAfterConfirm) : `${goal} kcal`}
              />
            </div>
          </div>
        </section>

        <div className="grid gap-5 lg:grid-cols-[0.92fr_1.08fr]">
          <section className="rounded-[24px] border border-[var(--line)] bg-white p-4 shadow-[var(--shadow-card)] sm:p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-[var(--muted)]">
                  {isZh ? "添加餐食" : "Add meal"}
                </p>
                <h2 className="font-display mt-1 text-2xl font-bold text-[var(--foreground)]">
                  {isZh ? "拍照优先，文字备用" : "Photo first, text when needed"}
                </h2>
              </div>
              <div className="grid grid-cols-3 gap-2 sm:flex">
                <ModeButton
                  active={inputMode === "camera"}
                  label={isZh ? "拍照" : "Camera"}
                  onClick={() => openInput("camera")}
                />
                <ModeButton
                  active={inputMode === "gallery"}
                  label={isZh ? "相册" : "Gallery"}
                  onClick={() => openInput("gallery")}
                />
                <ModeButton
                  active={inputMode === "text"}
                  label={isZh ? "文字" : "Text"}
                  onClick={() => setInputMode("text")}
                />
              </div>
            </div>

            <input
              ref={cameraInputRef}
              hidden
              accept="image/*"
              capture="environment"
              type="file"
              onChange={(event) => handleFileChange(event, "camera")}
            />
            <input
              ref={galleryInputRef}
              hidden
              accept="image/*"
              multiple
              type="file"
              onChange={(event) => handleFileChange(event, "gallery")}
            />

            <div className="mt-5 rounded-[18px] bg-[var(--surface-2)] p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-[var(--muted)]">
                    {isZh ? "这餐怎么吃" : "Meal context"}
                  </p>
                  <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
                    {isZh
                      ? "单人餐直接估整份；聚餐会按你的份额折算。"
                      : "Solo logs the full meal; shared meals scale to your share."}
                  </p>
                </div>
                <div className="grid grid-cols-2 overflow-hidden rounded-full border border-[var(--line)] bg-white p-1 text-sm font-bold">
                  {(["solo", "shared"] as const).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setServingMode(mode)}
                      className={`rounded-full px-4 py-2 transition ${
                        servingMode === mode
                          ? "bg-[var(--foreground)] text-white"
                          : "text-[var(--foreground)] hover:bg-[rgba(31,23,18,0.06)]"
                      }`}
                    >
                      {mode === "solo"
                        ? isZh
                          ? "单人"
                          : "Solo"
                        : isZh
                          ? "聚餐"
                          : "Shared"}
                    </button>
                  ))}
                </div>
              </div>
              {servingMode === "shared" ? (
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <label className="flex flex-col gap-2">
                    <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                      {isZh ? "几个人分" : "People sharing"}
                    </span>
                    <input
                      min="1"
                      max="12"
                      type="number"
                      value={sharedPeople}
                      onChange={(event) =>
                        setSharedPeople(clampShareInput(Number(event.target.value)))
                      }
                      className="rounded-[14px] border border-[var(--line)] bg-white px-4 py-3 text-base font-bold outline-none transition focus:border-[var(--coral)] focus:ring-4 focus:ring-[rgba(242,80,43,0.12)]"
                    />
                  </label>
                  <label className="flex flex-col gap-2">
                    <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                      {isZh ? "我吃了几人份" : "My share"}
                    </span>
                    <input
                      min="1"
                      max="12"
                      type="number"
                      value={myShare}
                      onChange={(event) =>
                        setMyShare(clampShareInput(Number(event.target.value)))
                      }
                      className="rounded-[14px] border border-[var(--line)] bg-white px-4 py-3 text-base font-bold outline-none transition focus:border-[var(--coral)] focus:ring-4 focus:ring-[rgba(242,80,43,0.12)]"
                    />
                  </label>
                </div>
              ) : null}
            </div>

            {inputMode === "text" ? (
              <div className="mt-5 rounded-[18px] bg-[var(--surface-2)] p-4">
                <form className="flex flex-col gap-3" onSubmit={handleSearchSubmit}>
                  <label className="flex flex-col gap-2">
                    <span className="text-sm font-semibold text-[var(--muted)]">
                      {isZh ? "搜索食物或饮料" : "Search a dish or drink"}
                    </span>
                    <input
                      className="rounded-[14px] border border-[var(--line)] bg-white px-4 py-3 text-base outline-none transition focus:border-[var(--coral)] focus:ring-4 focus:ring-[rgba(242,80,43,0.12)]"
                      placeholder={
                        isZh
                          ? "例如 chicken rice、菜饭、kopi c siew dai"
                          : "e.g. chicken rice, cai png, kopi c siew dai"
                      }
                      value={searchTerm}
                      onChange={(event) => updateSearchTerm(event.target.value)}
                    />
                  </label>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <button
                      type="submit"
                      className="rounded-[14px] bg-[var(--coral)] px-4 py-3 text-sm font-bold text-white shadow-[var(--shadow-pop)] transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-70"
                      disabled={isAnalyzing}
                    >
                      {isAnalyzing
                        ? isZh
                          ? "估算中..."
                          : "Estimating..."
                        : isZh
                          ? "估算这餐"
                          : "Estimate meal"}
                    </button>
                    {(hasDraft || previewUrl || searchTerm.trim().length > 0) ? (
                      <button
                        type="button"
                        onClick={() => resetDraft()}
                        className="rounded-[14px] border border-[var(--line)] bg-white px-4 py-3 text-sm font-bold text-[var(--foreground)] transition hover:border-[var(--coral)]"
                      >
                        {isZh ? "重新开始" : "Start over"}
                      </button>
                    ) : null}
                  </div>
                </form>

                <div className="mt-5">
                  <p className="text-sm font-semibold text-[var(--muted)]">
                    {isZh ? "快速示例" : "Quick examples"}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {quickStartExamples.map((example) => (
                      <button
                        key={example.label}
                        type="button"
                        onClick={() => runQuickExample(example.query, example.label)}
                        className="rounded-full border border-[var(--line)] bg-white px-3 py-2 text-xs font-bold text-[var(--foreground)] transition hover:border-[var(--coral)] hover:text-[var(--coral-ink)]"
                      >
                        {example.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-5 overflow-hidden rounded-[20px] border border-[var(--line)] bg-white">
                <div className="aspect-[4/3] bg-[linear-gradient(135deg,#f9c55d_0%,#f2702e_52%,#2fa66a_100%)]">
                  {previewUrl ? (
                    <Image
                      src={previewUrl}
                      alt="Meal preview"
                      width={1200}
                      height={900}
                      unoptimized
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center bg-white/18 px-6 text-center text-white">
                      <span className="flex h-16 w-16 items-center justify-center rounded-[20px] bg-white/90 text-[var(--coral)] shadow-[var(--shadow-card)]">
                        <CameraGlyph />
                      </span>
                      <p className="font-display mt-5 text-2xl font-bold">
                        {isZh ? "拍下你的餐食" : "Snap your meal"}
                      </p>
                      <p className="mt-2 max-w-sm text-sm leading-6 text-white/90">
                        {isZh
                          ? "照片不用完美，确认前还可以修正菜名和份量。"
                          : "It does not need to be perfect. You can fix the dish and portion before logging."}
                      </p>
                    </div>
                  )}
                </div>
                <div className="space-y-4 p-4">
                  <div>
                    <p className="text-sm font-bold text-[var(--foreground)]">
                      {previewUrl
                        ? isZh
                          ? "照片已准备好分析"
                          : "Photo ready for analysis"
                        : isZh
                          ? "还没有选择照片"
                          : "No photo selected yet"}
                    </p>
                    <p className="mt-1 text-sm leading-7 text-[var(--muted)]">
                      {previewUrl
                        ? previewName
                        : isZh
                          ? "最快是直接拍照；一餐多个菜时可以从相册一次选多张。"
                          : "Use the camera for the fastest flow; choose multiple gallery photos for a full meal."}
                    </p>
                    {previewUrls.length > 1 ? (
                      <div className="mt-3 grid grid-cols-4 gap-2">
                        {previewUrls.map((url, index) => (
                          <div
                            key={url}
                            className="relative aspect-square overflow-hidden rounded-[12px] border border-white bg-[var(--surface-2)]"
                          >
                            <Image
                              src={url}
                              alt={`Meal preview ${index + 1}`}
                              width={160}
                              height={160}
                              unoptimized
                              className="h-full w-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                  <div className="grid gap-2 sm:grid-cols-3">
                    <button
                      type="button"
                      className="rounded-[14px] bg-[var(--coral)] px-4 py-3 text-sm font-bold text-white shadow-[var(--shadow-pop)] transition hover:translate-y-[-1px]"
                      onClick={() => openInput(inputMode)}
                    >
                      {inputMode === "camera"
                        ? isZh
                          ? "拍照"
                          : "Take photo"
                        : isZh
                          ? "选择照片"
                          : "Choose photo"}
                    </button>
                    <button
                      type="button"
                      className="rounded-[14px] border border-[var(--line)] bg-white px-4 py-3 text-sm font-bold text-[var(--foreground)] transition hover:border-[var(--coral)]"
                      onClick={() => {
                        setInputMode("gallery");
                        galleryInputRef.current?.click();
                      }}
                    >
                      {isZh
                        ? inputMode === "gallery"
                          ? "一次选多张"
                          : "相册多选"
                        : inputMode === "gallery"
                          ? "Choose multiple"
                          : "Multi-select"}
                    </button>
                    {(hasDraft || previewUrl) ? (
                      <button
                        type="button"
                        onClick={() => resetDraft()}
                        className="rounded-[14px] border border-[var(--line)] bg-white px-4 py-3 text-sm font-bold text-[var(--foreground)] transition hover:border-[var(--coral)]"
                      >
                        {isZh ? "重新开始" : "Start over"}
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
            )}

            {analysisUploadFiles.length > 0 && hasDraft ? (
              <div className="mt-4 rounded-[18px] border border-[var(--line)] bg-[var(--surface-2)] p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-[var(--foreground)]">
                      {isZh ? "选择最接近的一项" : "Pick the closest match"}
                    </p>
                    <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
                      {isZh
                        ? "上传后先点一个候选，再按需要微调份量和配料。"
                        : "After upload, choose one suggestion first, then adjust portions and modifiers if needed."}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-white px-3 py-1 text-xs font-bold text-[var(--muted)]">
                    {isZh ? "3 个猜测" : "3 guesses"}
                  </span>
                </div>
                <div className="mt-3 grid gap-2">
                  {candidateChoiceOptions.map((candidate) => {
                    const isSelected = candidate.id === selectedCandidate.id;
                    const candidateRange = applyModifierIdsToCandidate(
                      candidate,
                      candidate.defaultModifierIds,
                    );

                    return (
                      <button
                        key={`photo-choice-${candidate.id}`}
                        type="button"
                        onClick={() => {
                          if (!isSelected) {
                            selectCandidateFromQuickSwap(candidate);
                          }
                        }}
                        className={`flex min-h-[64px] items-center justify-between gap-3 rounded-[16px] border px-4 py-3 text-left transition ${
                          isSelected
                            ? "border-[var(--coral)] bg-white text-[var(--coral-ink)] shadow-[var(--shadow-card)]"
                            : "border-[var(--line)] bg-white text-[var(--foreground)] hover:border-[var(--coral)]"
                        }`}
                      >
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-bold">
                            {candidate.name}
                          </span>
                          <span className="mt-1 block text-xs font-medium text-[var(--muted)]">
                            {candidate.note}
                          </span>
                        </span>
                        <span className="shrink-0 rounded-full bg-[rgba(243,181,76,0.18)] px-3 py-1 text-xs font-bold text-[var(--foreground)]">
                          {formatCalories(candidateRange)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}

            {analysisUploadFiles.length > 0 ? (
              <form
                className="mt-4 rounded-[18px] border border-[var(--line)] bg-[var(--surface-2)] p-4"
                onSubmit={handleDishHintSubmit}
              >
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-semibold text-[var(--muted)]">
                    {isZh ? "都不对？加一个简短提示" : "None fit? Add a short hint"}
                  </span>
                  <input
                    className="rounded-[14px] border border-[var(--line)] bg-white px-4 py-3 text-base outline-none transition focus:border-[var(--coral)] focus:ring-4 focus:ring-[rgba(242,80,43,0.12)]"
                    placeholder={
                      isZh
                        ? "例如 擂茶、鱼汤、叻沙"
                        : "e.g. thunder tea rice, fish soup, laksa"
                    }
                    value={dishHint}
                    onChange={(event) => setDishHint(event.target.value)}
                  />
                </label>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="submit"
                    disabled={isAnalyzing || dishHint.trim().length === 0}
                    className="rounded-full bg-[var(--foreground)] px-4 py-2 text-sm font-bold text-white transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isAnalyzing
                      ? isZh
                        ? "重试中..."
                        : "Trying..."
                      : isZh
                        ? "使用这个提示"
                        : "Use this hint"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setDishHint("")}
                    className="rounded-full border border-[var(--line)] bg-white px-4 py-2 text-sm font-bold text-[var(--foreground)] transition hover:border-[var(--coral)]"
                  >
                    {isZh ? "清空" : "Clear"}
                  </button>
                </div>
              </form>
            ) : null}
          </section>

          <section className="rounded-[24px] border border-[var(--line)] bg-white p-4 shadow-[var(--shadow-card)] sm:p-5 lg:sticky lg:top-5 lg:self-start">
            {!showEstimate && !showLoadingState ? (
              <EmptyEstimate isZh={isZh} />
            ) : null}

            {showLoadingState ? (
              <div className="rounded-[18px] bg-[var(--surface-2)] p-5">
                <p className="text-sm font-semibold text-[var(--muted)]">
                  {isZh ? "餐食估算" : "Meal estimate"}
                </p>
                <h2 className="font-display mt-2 text-2xl font-bold text-[var(--foreground)]">
                  {isZh ? "正在估算你的餐食..." : "Estimating your meal..."}
                </h2>
                <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
                  {statusMessage}
                </p>
              </div>
            ) : null}

            {showEstimate ? (
              <div className="space-y-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-[var(--muted)]">
                        {isZh ? "餐食估算" : "Meal estimate"}
                      </p>
                      {editingLogDraft ? (
                        <span className="rounded-full bg-[var(--coral-tint)] px-3 py-1 text-xs font-bold text-[var(--coral-ink)]">
                          {isZh ? "编辑中" : "Editing"}
                        </span>
                      ) : null}
                      {currentConfidence ? (
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${confidenceTone(
                            currentConfidence,
                          )}`}
                        >
                          {isZh
                            ? `${confidenceLabel(currentConfidence, language)}置信度`
                            : `${currentConfidence} confidence`}
                        </span>
                      ) : null}
                    </div>
                    <h2 className="font-display mt-2 text-3xl font-bold leading-tight text-[var(--foreground)]">
                      {draftMealName}
                    </h2>
                    <p className="mt-1 text-sm text-[var(--muted)]">
                      {draftItemEstimates.length > 1
                        ? isZh
                          ? `${draftItemEstimates.length} 个项目 · ${selectedCandidate.chineseName}`
                          : `${draftItemEstimates.length} items · ${selectedCandidate.chineseName}`
                        : selectedCandidate.chineseName}
                    </p>
                  </div>
                </div>

                {draftItemEstimates.length > 1 ? (
                  <div className="rounded-[18px] border border-[var(--line)] bg-white p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-[var(--muted)]">
                        {isZh ? "本餐项目" : "Meal items"}
                      </p>
                      {servingMode === "shared" ? (
                        <span className="rounded-full bg-[var(--amber-tint)] px-3 py-1 text-xs font-bold text-[#9b6418]">
                          {isZh
                            ? `按 ${safeMyShare}/${safeSharedPeople} 计算`
                            : `Scaled ${safeMyShare}/${safeSharedPeople}`}
                        </span>
                      ) : null}
                    </div>
                    <div className="mt-3 grid gap-2">
                      {draftItemEstimates.map((item, index) => {
                        const active = index === activeItemIndex;
                        return (
                          <button
                            key={`${item.candidate.id}-${index}`}
                            type="button"
                            onClick={() => selectDraftItem(index)}
                            className={`flex items-center justify-between gap-3 rounded-[14px] border px-3 py-2 text-left transition ${
                              active
                                ? "border-[var(--coral)] bg-[var(--coral-tint)] text-[var(--coral-ink)]"
                                : "border-[var(--line)] bg-[var(--surface-2)] text-[var(--foreground)] hover:border-[var(--coral)]"
                            }`}
                          >
                            <span className="min-w-0">
                              <span className="block truncate text-sm font-bold">
                                {item.candidate.name}
                              </span>
                              <span className="mt-0.5 block text-xs text-[var(--muted)]">
                                {item.candidate.chineseName}
                                {item.portion !== 1 ? ` · x${item.portion}` : ""}
                              </span>
                            </span>
                            <span className="shrink-0 rounded-full bg-white px-3 py-1 text-xs font-bold text-[var(--foreground)]">
                              {formatCalories(item.kcalRange)}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : null}

                <div className="rounded-[18px] bg-[var(--surface-2)] p-4">
                  <p className="text-sm font-semibold text-[var(--muted)]">
                    {isZh ? "当前估算" : "Current estimate"}
                  </p>
                  <p className="font-display mt-2 text-5xl font-bold leading-none text-[var(--coral)]">
                    {draftRange[0]}-{draftRange[1]}
                    <span className="ml-2 text-base font-bold text-[var(--muted)]">
                      kcal
                    </span>
                  </p>
                  <p className="mt-2 text-sm text-[var(--muted)]">
                    {isZh
                      ? `记录后今天约剩 ${formatCalories(remainingAfterConfirm)}`
                      : `After logging, about ${formatCalories(
                          remainingAfterConfirm,
                        )} remains today.`}
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <MacroCard
                    label={isZh ? "蛋白" : "Protein"}
                    value={`${draftMacroRange.protein[0]}-${draftMacroRange.protein[1]}g`}
                  />
                  <MacroCard
                    label={isZh ? "碳水" : "Carbs"}
                    value={`${draftMacroRange.carbs[0]}-${draftMacroRange.carbs[1]}g`}
                  />
                  <MacroCard
                    label={isZh ? "脂肪" : "Fat"}
                    value={`${draftMacroRange.fat[0]}-${draftMacroRange.fat[1]}g`}
                  />
                </div>

                <div className="rounded-[18px] border border-[var(--line)] bg-white p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-[var(--muted)]">
                        {isZh ? "这项份量" : "Item portion"}
                      </p>
                      <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
                        {draftItemEstimates.length > 1
                          ? isZh
                            ? "先在本餐项目里点一道菜，再调你实际吃到的份量。"
                            : "Select an item above, then set the amount you actually ate."
                          : isZh
                            ? "按你实际吃到的份量调整，适合一桌菜只夹了几口的情况。"
                            : "Set what you actually ate, including a few bites from a shared plate."}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-full bg-[var(--surface-2)] px-3 py-1 text-xs font-bold text-[var(--foreground)]">
                      {formatPortionLabel(activePortion, isZh)}
                    </span>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-6">
                    {PORTION_PRESETS.map((portion) => {
                      const active = Math.abs(activePortion - portion) < 0.01;

                      return (
                        <button
                          key={portion}
                          type="button"
                          onClick={() => updateActiveItemPortion(portion)}
                          className={`rounded-[12px] border px-2 py-2 text-sm font-bold transition ${
                            active
                              ? "border-[var(--coral)] bg-[var(--coral-tint)] text-[var(--coral-ink)]"
                              : "border-[var(--line)] bg-[var(--surface-2)] text-[var(--foreground)] hover:border-[var(--coral)]"
                          }`}
                        >
                          {formatPortionLabel(portion, isZh)}
                        </button>
                      );
                    })}
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => updateActiveItemPortion(activePortion - 0.25)}
                      className="rounded-[12px] border border-[var(--line)] bg-white px-3 py-2 text-sm font-bold text-[var(--foreground)] transition hover:border-[var(--coral)]"
                    >
                      {isZh ? "少一点" : "Less"}
                    </button>
                    <button
                      type="button"
                      onClick={() => updateActiveItemPortion(activePortion + 0.25)}
                      className="rounded-[12px] border border-[var(--line)] bg-white px-3 py-2 text-sm font-bold text-[var(--foreground)] transition hover:border-[var(--coral)]"
                    >
                      {isZh ? "多一点" : "More"}
                    </button>
                  </div>
                </div>
                <div className="rounded-[18px] border border-[var(--line)] bg-white p-4">
                  <p className="font-bold text-[var(--foreground)]">
                    {guidance.title}
                  </p>
                  <p className="mt-2 text-sm leading-7 text-[var(--muted)]">
                    {guidance.body}
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-[var(--muted)]">
                      {isZh ? "快速调整" : "Quick fixes"}
                    </p>
                    <span className="text-xs font-semibold text-[var(--muted)]">
                      {isZh ? "点一下就修正" : "Tap to tune"}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedCandidate.modifiers.map((modifier) => {
                      const active = selectedModifierIds.includes(modifier.id);
                      return (
                        <button
                          key={modifier.id}
                          type="button"
                          onClick={() => toggleModifier(modifier.id)}
                          className={`rounded-full border px-3 py-2 text-sm font-bold transition ${
                            active
                              ? "border-[var(--coral)] bg-[var(--coral-tint)] text-[var(--coral-ink)]"
                              : "border-[var(--line)] bg-white text-[var(--foreground)] hover:border-[var(--coral)]"
                          }`}
                        >
                          {modifier.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-sm font-semibold text-[var(--muted)]">
                    {isZh ? "其他可能餐食" : "Other likely dishes"}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-[var(--foreground)] px-4 py-2 text-sm font-bold text-white">
                      {selectedCandidate.name}
                    </span>
                    {quickSwapCandidates.map((candidate) => (
                      <button
                        key={`quick-swap-${candidate.id}`}
                        type="button"
                        onClick={() => selectCandidateFromQuickSwap(candidate)}
                        className="rounded-full border border-[var(--line)] bg-white px-4 py-2 text-sm font-bold text-[var(--foreground)] transition hover:border-[var(--coral)]"
                      >
                        {candidate.name}
                      </button>
                    ))}
                  </div>
                  <form
                    className="grid gap-2 sm:grid-cols-[1fr_auto]"
                    onSubmit={handleDraftDishQuerySubmit}
                  >
                    <input
                      className="min-w-0 rounded-[14px] border border-[var(--line)] bg-white px-4 py-3 text-base outline-none transition focus:border-[var(--coral)] focus:ring-4 focus:ring-[rgba(242,80,43,0.12)]"
                      placeholder={
                        isZh ? "需要时试另一个菜名" : "Try another dish name"
                      }
                      value={draftDishQuery}
                      onChange={(event) => setDraftDishQuery(event.target.value)}
                    />
                    <button
                      type="submit"
                      disabled={isAnalyzing || draftDishQuery.trim().length === 0}
                      className="rounded-[14px] bg-[var(--foreground)] px-4 py-3 text-sm font-bold text-white transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isZh ? "重试" : "Try"}
                    </button>
                  </form>
                </div>

                <div className="hidden flex-col gap-3 md:flex">
                  <LogButton
                    isZh={isZh}
                    editing={Boolean(editingLogDraft)}
                    calories={formatCalories(draftRange)}
                    onClick={confirmMeal}
                  />
                  {editingLogDraft ? (
                    <button
                      type="button"
                      onClick={cancelConfirmedLogEdit}
                      className="rounded-[18px] border border-[var(--line)] bg-white px-4 py-3 text-sm font-bold text-[var(--foreground)] transition hover:border-[var(--coral)]"
                    >
                      {isZh ? "取消编辑" : "Cancel edit"}
                    </button>
                  ) : null}
                </div>
              </div>
            ) : null}

            <div className="mt-5 rounded-[16px] bg-[var(--surface-2)] px-4 py-3 text-sm leading-6 text-[var(--muted)]">
              {statusMessage}
            </div>
          </section>
        </div>

        {showEstimate ? (
          <div className="sticky bottom-[88px] z-40 md:hidden">
            <LogButton
              isZh={isZh}
              editing={Boolean(editingLogDraft)}
              calories={formatCalories(draftRange)}
              onClick={confirmMeal}
            />
          </div>
        ) : null}

        <section className="rounded-[24px] border border-[var(--line)] bg-white p-4 shadow-[var(--shadow-card)] sm:p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-[var(--muted)]">
                {isZh ? "今天" : "Today"}
              </p>
              <h2 className="font-display mt-1 text-2xl font-bold text-[var(--foreground)]">
                {isZh ? "已记录餐食" : "Logged meals"}
              </h2>
            </div>
            <span className="rounded-full bg-[var(--amber-tint)] px-3 py-1 text-sm font-bold text-[#9b6418]">
              {isZh ? `${todayLogs.length} 条` : `${todayLogs.length} entries`}
            </span>
          </div>

          <div className="mt-4 grid gap-3 lg:grid-cols-2">
            {todayLogs.length > 0 ? (
              todayLogs.map((log) => {
                const macroSummary = formatMacroSummary(log.macroRange, language);

                return (
                  <article
                    key={log.id}
                    className="rounded-[18px] border border-[var(--line)] bg-white px-4 py-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-display text-xl font-bold text-[var(--foreground)]">
                          {log.name}
                        </h3>
                        <p className="mt-1 text-sm text-[var(--muted)]">
                          {formatLoggedTime(log.loggedAt)} ·{" "}
                          {localizedSourceLabel(log.source, language)}
                        </p>
                      </div>
                      <span className="rounded-full bg-[var(--green-tint)] px-3 py-1 text-sm font-bold text-[#2e8049]">
                        {formatCalories(log.kcalRange)}
                      </span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {log.modifiers.length > 0 ? (
                        log.modifiers.map((modifier) => (
                          <span
                            key={`${log.id}-${modifier}`}
                            className="rounded-full bg-[var(--surface-2)] px-3 py-1 text-xs font-semibold text-[var(--foreground)]"
                          >
                            {modifier}
                          </span>
                        ))
                      ) : (
                        <span className="rounded-full bg-[var(--surface-2)] px-3 py-1 text-xs font-semibold text-[var(--foreground)]">
                          {isZh ? "未调整" : "No edits"}
                        </span>
                      )}
                      {log.confidence ? (
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${confidenceTone(
                            log.confidence,
                          )}`}
                        >
                          {confidenceLabel(log.confidence, language)}
                        </span>
                      ) : null}
                    </div>
                    {macroSummary ? (
                      <p className="mt-3 text-sm text-[var(--muted)]">
                        {macroSummary}
                      </p>
                    ) : null}
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => startEditingConfirmedLog(log)}
                        className="rounded-full border border-[var(--line)] px-3 py-1 text-sm font-bold text-[var(--foreground)] transition hover:border-[var(--coral)]"
                      >
                        {isZh ? "编辑" : "Edit"}
                      </button>
                      <button
                        type="button"
                        onClick={() => removeConfirmedLog(log)}
                        className="rounded-full border border-[var(--line)] px-3 py-1 text-sm font-bold text-[var(--muted)] transition hover:border-[var(--coral)] hover:text-[var(--coral-ink)]"
                      >
                        {isZh ? "删除" : "Remove"}
                      </button>
                    </div>
                  </article>
                );
              })
            ) : (
              <div className="rounded-[18px] border border-[var(--line)] bg-[var(--surface-2)] px-4 py-5 text-sm leading-7 text-[var(--muted)] lg:col-span-2">
                {isZh
                  ? "今天还没有记录餐食。在上方添加第一餐后，它会立刻出现在这里。"
                  : "No meals logged today yet. Add your first meal above and it will appear here right away."}
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function MetricCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[16px] bg-[var(--surface-2)] px-3 py-3">
      <p className="text-xs font-semibold text-[var(--muted)]">{label}</p>
      <p className="font-display mt-1 text-lg font-bold leading-tight text-[var(--foreground)] sm:text-xl">
        {value}
      </p>
    </div>
  );
}

function MacroCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[14px] bg-[var(--surface-2)] px-3 py-3 text-center">
      <p className="text-xs font-semibold text-[var(--muted)]">{label}</p>
      <p className="font-display mt-1 text-base font-bold text-[var(--foreground)]">
        {value}
      </p>
    </div>
  );
}

function ModeButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-[12px] px-3 py-3 text-sm font-bold transition sm:px-4 sm:py-2 ${
        active
          ? "bg-[var(--coral)] text-white shadow-[var(--shadow-pop)]"
          : "border border-[var(--line)] bg-white text-[var(--foreground)] hover:border-[var(--coral)]"
      }`}
    >
      {label}
    </button>
  );
}

function LogButton({
  calories,
  editing,
  isZh,
  onClick,
}: {
  calories: string;
  editing: boolean;
  isZh: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-between rounded-[18px] bg-[var(--coral)] px-4 py-4 text-left text-white shadow-[var(--shadow-pop)] transition hover:translate-y-[-1px]"
    >
      <span className="font-bold">
        {editing
          ? isZh
            ? "保存修改"
            : "Save changes"
          : isZh
            ? "记录这餐"
            : "Log this meal"}
      </span>
      <span className="font-display text-sm font-bold">{calories}</span>
    </button>
  );
}

function EmptyEstimate({
  isZh,
}: {
  isZh: boolean;
}) {
  return (
    <div className="rounded-[18px] bg-[var(--surface-2)] p-5 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[20px] bg-white text-[var(--coral)] shadow-[var(--shadow-card)]">
        <CameraGlyph />
      </div>
      <h2 className="font-display mt-4 text-2xl font-bold text-[var(--foreground)]">
        {isZh ? "等待你的餐食" : "Waiting for your meal"}
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-7 text-[var(--muted)]">
        {isZh
          ? "上传照片或搜索菜名后，这里会显示热量区间、营养估算和下一餐建议。"
          : "Upload a photo or search a dish, then this panel will show calories, rough macros, and the next suggestion."}
      </p>
    </div>
  );
}

function CameraGlyph() {
  return (
    <svg aria-hidden="true" className="h-8 w-8" viewBox="0 0 24 24">
      <path
        d="M4 8.5A2.5 2.5 0 0 1 6.5 6H8l1.2-1.8A2.5 2.5 0 0 1 11.3 3h1.4a2.5 2.5 0 0 1 2.1 1.2L16 6h1.5A2.5 2.5 0 0 1 20 8.5v8A2.5 2.5 0 0 1 17.5 19h-11A2.5 2.5 0 0 1 4 16.5v-8Z"
        fill="none"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="2"
      />
      <circle
        cx="12"
        cy="12.5"
        r="3.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  );
}
