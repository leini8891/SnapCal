import { buildDraftFromShortcut } from "@/lib/analyze/meal-analysis";
import { candidateMeals, type CandidateMeal } from "@/lib/food-catalog";
import type {
  MealConfidence,
  NutritionEstimate,
  Range,
} from "@/lib/mock-data";

function averageRange(range: Range) {
  return (range[0] + range[1]) / 2;
}

function scaleRange(range: Range, factor: number): Range {
  return [
    Math.max(0, Math.round(range[0] * factor)),
    Math.max(0, Math.round(range[1] * factor)),
  ];
}

export function applyModifierIdsToCandidate(
  candidate: CandidateMeal,
  selectedIds: string[],
) {
  return candidate.modifiers.reduce<Range>(
    (range, modifier) =>
      selectedIds.includes(modifier.id)
        ? [range[0] + modifier.delta[0], range[1] + modifier.delta[1]]
        : [range[0], range[1]],
    [...candidate.baseRange] as Range,
  );
}

export function estimateMacroRange(
  candidate: CandidateMeal,
  nextKcalRange: Range,
): NutritionEstimate {
  const baselineAverage = Math.max(averageRange(candidate.baseRange), 1);
  const nextAverage = averageRange(nextKcalRange);
  const scaleFactor = Math.max(0.55, nextAverage / baselineAverage);

  return {
    protein: scaleRange(candidate.macroRange.protein, scaleFactor),
    carbs: scaleRange(candidate.macroRange.carbs, scaleFactor),
    fat: scaleRange(candidate.macroRange.fat, scaleFactor),
  };
}

export function buildNutritionGuessFromNameAndModifiers(input: {
  name: string;
  modifiers: string[];
}) {
  const draftAnalysis = buildDraftFromShortcut(input);
  const selectedCandidate =
    candidateMeals.find(
      (candidate) => candidate.id === draftAnalysis.selectedCandidateId,
    ) ?? candidateMeals[0];
  const kcalRange = applyModifierIdsToCandidate(
    selectedCandidate,
    draftAnalysis.selectedModifierIds,
  );

  return {
    kcalRange,
    macroRange: estimateMacroRange(selectedCandidate, kcalRange),
    confidence:
      draftAnalysis.analysisConfidence ??
      (selectedCandidate.confidence as MealConfidence | null),
  };
}
