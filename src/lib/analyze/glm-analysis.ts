import "server-only";

import { candidateMeals } from "@/lib/food-catalog";
import {
  buildMealAnalysisResult,
  rankCandidateMatches,
  type MealAnalysisInput,
  type MealAnalysisResult,
} from "@/lib/analyze/meal-analysis";

type GlmDecision = {
  candidateId: string;
  modifierIds: string[];
  confidence: "High" | "Medium" | "Low" | number;
  reasoning: string;
};

type GlmChatCompletionResponse = {
  choices?: Array<{
    message?: {
      content?: string | null;
    };
  }>;
};

const GLM_API_KEY_ENV_NAMES = [
  "GLM_API_KEY",
  "ZAI_API_KEY",
  "BIGMODEL_API_KEY",
] as const;

const DEFAULT_GLM_CHAT_COMPLETIONS_URLS = [
  "https://api.z.ai/api/paas/v4/chat/completions",
  "https://api.z.ai/api/coding/paas/v4/chat/completions",
] as const;

function getGlmApiKey() {
  for (const envName of GLM_API_KEY_ENV_NAMES) {
    const value = process.env[envName]?.trim();
    if (value) {
      return value;
    }
  }

  return null;
}

function getGlmAnalyzeModel() {
  return process.env.GLM_ANALYZE_MODEL?.trim() || "glm-4.6v-flashx";
}

function getGlmChatCompletionsUrls() {
  const configuredUrl = process.env.GLM_API_BASE_URL?.trim();

  return Array.from(
    new Set(
      [configuredUrl, ...DEFAULT_GLM_CHAT_COMPLETIONS_URLS].filter(
        (url): url is string => Boolean(url),
      ),
    ),
  );
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

function isGlmDecision(input: unknown): input is GlmDecision {
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
      candidate.confidence === "Low" ||
      typeof candidate.confidence === "number") &&
    typeof candidate.reasoning === "string"
  );
}

function normalizeGlmConfidence(confidence: GlmDecision["confidence"]) {
  if (
    confidence === "High" ||
    confidence === "Medium" ||
    confidence === "Low"
  ) {
    return confidence;
  }

  if (confidence >= 0.8) {
    return "High" as const;
  }

  if (confidence >= 0.55) {
    return "Medium" as const;
  }

  return "Low" as const;
}

export function hasGlmAnalysisEnv() {
  return Boolean(getGlmApiKey());
}

async function requestGlmChatCompletion(input: {
  apiKey: string;
  body: Record<string, unknown>;
  url: string;
}) {
  const response = await fetch(input.url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${input.apiKey}`,
      "Accept-Language": "en-US,en",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input.body),
  });

  const responseText = await response.text();

  return {
    ok: response.ok,
    status: response.status,
    text: responseText,
    url: input.url,
  };
}

export async function analyzeMealWithGlm(
  input: MealAnalysisInput,
): Promise<MealAnalysisResult | null> {
  const apiKey = getGlmApiKey();

  if (!apiKey) {
    return null;
  }

  const source = input.query?.trim() || input.fileName?.trim() || "Unknown meal";
  const rankedCandidates = source
    ? rankCandidateMatches(source).map((entry) => entry.candidate)
    : candidateMeals;
  const userText = [
    `User mode: ${input.mode}`,
    `User hint: ${source}`,
    input.fileName ? `Uploaded filename: ${input.fileName}` : null,
    "Choose the closest Singapore hawker dish from the catalog.",
    "Only return modifierIds that exist on the chosen dish.",
    "Prefer conservative edits when the image is ambiguous.",
    "Return a JSON object with exactly these keys: candidateId, modifierIds, confidence, reasoning.",
    `Catalog: ${JSON.stringify(buildCatalogSummary())}`,
  ]
    .filter(Boolean)
    .join("\n");
  const requestBody = {
    model: getGlmAnalyzeModel(),
    stream: false,
    temperature: 0.1,
    response_format: {
      type: "json_object",
    },
    thinking: {
      type: "disabled",
    },
    messages: [
      {
        role: "system",
        content:
          "You are SnapCal's Singapore hawker meal analyzer. Map meals to the provided catalog only and suggest only valid local modifier IDs. Return valid JSON only.",
      },
      {
        role: "user",
        content: [
          ...(input.imageDataUrl
            ? [
                {
                  type: "image_url",
                  image_url: {
                    url: input.imageDataUrl,
                  },
                },
              ]
            : []),
          {
            type: "text",
            text: userText,
          },
        ],
      },
    ],
  } satisfies Record<string, unknown>;

  let payload: GlmChatCompletionResponse | null = null;
  let lastError: string | null = null;

  for (const url of getGlmChatCompletionsUrls()) {
    const result = await requestGlmChatCompletion({
      apiKey,
      body: requestBody,
      url,
    });

    if (!result.ok) {
      lastError = `GLM analysis failed with ${result.status} at ${url}: ${result.text}`;
      continue;
    }

    payload = JSON.parse(result.text) as GlmChatCompletionResponse;
    break;
  }

  if (!payload) {
    throw new Error(lastError ?? "GLM analysis failed.");
  }

  const outputText = payload.choices?.[0]?.message?.content;

  if (typeof outputText !== "string" || outputText.trim().length === 0) {
    return null;
  }

  const parsed = JSON.parse(outputText) as unknown;
  if (!isGlmDecision(parsed)) {
    return null;
  }

  const selectedCandidate = candidateMeals.find(
    (candidate) => candidate.id === parsed.candidateId,
  );

  if (!selectedCandidate) {
    return null;
  }

  return buildMealAnalysisResult({
    analysisLabel: `GLM analysis selected ${selectedCandidate.name}. ${parsed.reasoning}`,
    analysisConfidence: normalizeGlmConfidence(parsed.confidence),
    candidates: [selectedCandidate, ...rankedCandidates],
    selectedCandidateId: selectedCandidate.id,
    selectedModifierIds: parsed.modifierIds,
    provider: "glm",
  });
}
