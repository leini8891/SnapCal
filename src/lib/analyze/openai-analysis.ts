import "server-only";

import OpenAI from "openai";
import { candidateMeals } from "@/lib/food-catalog";
import {
  buildMealAnalysisResult,
  rankCandidateMatches,
  type MealAnalysisInput,
  type MealAnalysisResult,
} from "@/lib/analyze/meal-analysis";

type OpenAIDecision = {
  candidateId: string;
  modifierIds: string[];
  confidence: "High" | "Medium" | "Low";
  reasoning: string;
  items: Array<{
    candidateId: string;
    modifierIds: string[];
    portion: number;
    confidence: "High" | "Medium" | "Low";
  }>;
};

const ANALYSIS_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    candidateId: {
      type: "string",
      enum: candidateMeals.map((candidate) => candidate.id),
    },
    modifierIds: {
      type: "array",
      items: {
        type: "string",
      },
    },
    confidence: {
      type: "string",
      enum: ["High", "Medium", "Low"],
    },
    reasoning: {
      type: "string",
    },
    items: {
      type: "array",
      minItems: 1,
      maxItems: 8,
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          candidateId: {
            type: "string",
            enum: candidateMeals.map((candidate) => candidate.id),
          },
          modifierIds: {
            type: "array",
            items: {
              type: "string",
            },
          },
          portion: {
            type: "number",
            minimum: 0.15,
            maximum: 3,
          },
          confidence: {
            type: "string",
            enum: ["High", "Medium", "Low"],
          },
        },
        required: ["candidateId", "modifierIds", "portion", "confidence"],
      },
    },
  },
  required: ["candidateId", "modifierIds", "confidence", "reasoning", "items"],
} as const;

let cachedClient: OpenAI | null | undefined;

function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY?.trim();

  if (!apiKey) {
    return null;
  }

  if (cachedClient) {
    return cachedClient;
  }

  cachedClient = new OpenAI({ apiKey });
  return cachedClient;
}

function getOpenAIAnalyzeModel() {
  return process.env.OPENAI_ANALYZE_MODEL?.trim() || "gpt-4.1-mini";
}

function buildCatalogSummary() {
  return candidateMeals.map((candidate) => ({
    id: candidate.id,
    name: candidate.name,
    chineseName: candidate.chineseName,
    aliases: candidate.aliases,
    note: candidate.note,
    modifiers: candidate.modifiers.map((modifier) => ({
      id: modifier.id,
      label: modifier.label,
    })),
  }));
}

function isOpenAIDecision(input: unknown): input is OpenAIDecision {
  if (!input || typeof input !== "object") {
    return false;
  }

  const candidate = input as Record<string, unknown>;
  return (
    typeof candidate.candidateId === "string" &&
    Array.isArray(candidate.modifierIds) &&
    candidate.modifierIds.every((item) => typeof item === "string") &&
    (candidate.confidence === "High" ||
      candidate.confidence === "Medium" ||
      candidate.confidence === "Low") &&
    typeof candidate.reasoning === "string" &&
    Array.isArray(candidate.items) &&
    candidate.items.every((item) => {
      if (!item || typeof item !== "object") {
        return false;
      }

      const mealItem = item as Record<string, unknown>;
      return (
        typeof mealItem.candidateId === "string" &&
        Array.isArray(mealItem.modifierIds) &&
        mealItem.modifierIds.every((modifierId) => typeof modifierId === "string") &&
        typeof mealItem.portion === "number" &&
        (mealItem.confidence === "High" ||
          mealItem.confidence === "Medium" ||
          mealItem.confidence === "Low")
      );
    })
  );
}

export function hasOpenAIAnalysisEnv() {
  return Boolean(process.env.OPENAI_API_KEY?.trim());
}

export async function analyzeMealWithOpenAI(
  input: MealAnalysisInput,
): Promise<MealAnalysisResult | null> {
  const client = getOpenAIClient();

  if (!client) {
    return null;
  }

  const source = [input.query, input.fileName, ...(input.fileNames ?? [])]
    .filter((value): value is string => Boolean(value?.trim()))
    .join(" ") || "Unknown meal";
  const rankedCandidates = source
    ? rankCandidateMatches(source).map((entry) => entry.candidate)
    : candidateMeals;
  const userText = [
    `User mode: ${input.mode}`,
    `User hint: ${source}`,
    input.fileName ? `Uploaded filename: ${input.fileName}` : null,
    input.fileNames?.length ? `Uploaded filenames: ${input.fileNames.join(", ")}` : null,
    "Identify every visible dish or drink in this meal, across all images.",
    "Map each item to the closest Singapore hawker/local catalog dish. Return one item per distinct dish or drink.",
    "If the meal is one plate with several components, include the main components that materially affect calories.",
    "Use portion around 1 for a normal serving; use smaller portions such as 0.25 or 0.5 for shared dishes or small sides.",
    "Only return modifierIds that exist on the chosen dish.",
    "Prefer conservative edits when the image is ambiguous.",
    `Catalog: ${JSON.stringify(buildCatalogSummary())}`,
  ]
    .filter(Boolean)
    .join("\n");

  const response = await client.responses.create({
    model: getOpenAIAnalyzeModel(),
    store: false,
    input: [
      {
        role: "system",
        content: [
          {
            type: "input_text",
            text: "You are SnapCal's Singapore hawker meal analyzer. Map meals to the provided catalog only and suggest only valid local modifier IDs.",
          },
        ],
      },
      {
        role: "user",
        content: [
          {
            type: "input_text",
            text: userText,
          },
          ...((input.imageDataUrls?.length ? input.imageDataUrls : input.imageDataUrl ? [input.imageDataUrl] : [])
            .slice(0, 6)
            .map((imageDataUrl) => ({
              type: "input_image" as const,
              image_url: imageDataUrl,
              detail: "auto" as const,
            }))),
        ],
      },
    ],
    text: {
      format: {
        type: "json_schema",
        name: "snapcal_meal_analysis",
        strict: true,
        schema: ANALYSIS_SCHEMA,
      },
    },
  });

  const outputText = response.output_text;

  if (!outputText) {
    return null;
  }

  const parsed = JSON.parse(outputText) as unknown;

  if (!isOpenAIDecision(parsed)) {
    return null;
  }

  const selectedCandidate = candidateMeals.find(
    (candidate) => candidate.id === parsed.candidateId,
  );

  if (!selectedCandidate) {
    return null;
  }

  return buildMealAnalysisResult({
    analysisLabel: `OpenAI analysis selected ${selectedCandidate.name}. ${parsed.reasoning}`,
    analysisConfidence: parsed.confidence,
    candidates: [selectedCandidate, ...rankedCandidates],
    items: parsed.items.map((item) => ({
      candidateId: item.candidateId,
      modifierIds: item.modifierIds,
      portion: item.portion,
      confidence: item.confidence,
    })),
    selectedCandidateId: selectedCandidate.id,
    selectedModifierIds: parsed.modifierIds,
    provider: "openai",
  });
}
