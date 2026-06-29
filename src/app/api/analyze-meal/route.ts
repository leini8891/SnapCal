import { NextResponse } from "next/server";
import {
  analyzeMealInput,
  type AnalyzeMealMode,
  type MealAnalysisInput,
} from "@/lib/analyze/meal-analysis";
import {
  analyzeMealWithGlm,
  hasGlmAnalysisEnv,
} from "@/lib/analyze/glm-analysis";
import {
  analyzeMealWithOpenAI,
  hasOpenAIAnalysisEnv,
} from "@/lib/analyze/openai-analysis";

function normalizeMode(input: unknown): AnalyzeMealMode {
  if (input === "camera" || input === "gallery") {
    return input;
  }

  return "text";
}

async function fileToDataUrl(file: File) {
  const arrayBuffer = await file.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString("base64");
  const mimeType = file.type || "image/jpeg";

  return `data:${mimeType};base64,${base64}`;
}

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";
  const payload: MealAnalysisInput = {
    mode: "text",
  };

  if (contentType.includes("application/json")) {
    const body = (await request.json()) as {
      mode?: unknown;
      query?: unknown;
      fileName?: unknown;
    };

    payload.mode = normalizeMode(body.mode);
    payload.query = typeof body.query === "string" ? body.query : undefined;
    payload.fileName =
      typeof body.fileName === "string" ? body.fileName : undefined;
  } else {
    const formData = await request.formData();
    const image = formData.get("image");
    const mode = formData.get("mode");
    const query = formData.get("query");

    payload.mode = normalizeMode(mode);
    payload.query = typeof query === "string" ? query : undefined;
    payload.fileName = image instanceof File ? image.name : undefined;

    if (image instanceof File) {
      payload.imageDataUrl = await fileToDataUrl(image);
    }
  }

  if (!payload.imageDataUrl) {
    return NextResponse.json(analyzeMealInput(payload));
  }

  let providerAttempted = false;

  if (hasGlmAnalysisEnv()) {
    providerAttempted = true;

    try {
      const glmResult = await analyzeMealWithGlm(payload);
      if (glmResult) {
        return NextResponse.json(glmResult);
      }
    } catch {
      // Try the next provider before falling back to the local correction loop.
    }
  }

  if (hasOpenAIAnalysisEnv()) {
    providerAttempted = true;

    try {
      const openAIResult = await analyzeMealWithOpenAI(payload);
      if (openAIResult) {
        return NextResponse.json(openAIResult);
      }
    } catch {
      // Fall through to the honest local fallback below.
    }
  }

  const fallback = analyzeMealInput(payload);
  if (!providerAttempted) {
    return NextResponse.json(fallback);
  }

  const fallbackLabel = fallback.analysisLabel.startsWith(
    "Vision provider is unavailable",
  )
    ? fallback.analysisLabel.replace(
        "Vision provider is unavailable",
        "Vision providers were unavailable",
      )
    : `Vision providers were unavailable, so ${fallback.analysisLabel.charAt(0).toLowerCase()}${fallback.analysisLabel.slice(1)}`;

  return NextResponse.json({
    ...fallback,
    analysisLabel: fallbackLabel,
  });
}
