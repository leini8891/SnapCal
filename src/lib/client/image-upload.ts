const MAX_UPLOAD_EDGE = 1600;
const MAX_UPLOAD_BYTES = 1_200_000;
const JPEG_QUALITY = 0.82;

export type PreparedImageUpload = {
  file: File;
  wasCompressed: boolean;
  originalBytes: number;
  nextBytes: number;
};

function formatBytes(bytes: number) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function renameAsJpeg(filename: string) {
  const trimmed = filename.trim();

  if (!trimmed) {
    return "snapcal-upload.jpg";
  }

  const extensionIndex = trimmed.lastIndexOf(".");
  if (extensionIndex === -1) {
    return `${trimmed}.jpg`;
  }

  return `${trimmed.slice(0, extensionIndex)}.jpg`;
}

function loadImage(file: File) {
  return new Promise<{
    image: HTMLImageElement;
    revoke: () => void;
    width: number;
    height: number;
  }>((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      resolve({
        image,
        revoke: () => URL.revokeObjectURL(objectUrl),
        width: image.naturalWidth,
        height: image.naturalHeight,
      });
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Image decode failed."));
    };

    image.src = objectUrl;
  });
}

function canvasToBlob(canvas: HTMLCanvasElement) {
  return new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY);
  });
}

export async function prepareImageUpload(
  file: File,
): Promise<PreparedImageUpload> {
  if (!file.type.startsWith("image/")) {
    return {
      file,
      wasCompressed: false,
      originalBytes: file.size,
      nextBytes: file.size,
    };
  }

  const { image, revoke, width, height } = await loadImage(file);

  try {
    const largestEdge = Math.max(width, height);
    if (largestEdge <= MAX_UPLOAD_EDGE && file.size <= MAX_UPLOAD_BYTES) {
      return {
        file,
        wasCompressed: false,
        originalBytes: file.size,
        nextBytes: file.size,
      };
    }

    const scale = Math.min(1, MAX_UPLOAD_EDGE / largestEdge);
    const nextWidth = Math.max(1, Math.round(width * scale));
    const nextHeight = Math.max(1, Math.round(height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = nextWidth;
    canvas.height = nextHeight;

    const context = canvas.getContext("2d");
    if (!context) {
      return {
        file,
        wasCompressed: false,
        originalBytes: file.size,
        nextBytes: file.size,
      };
    }

    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";
    context.drawImage(image, 0, 0, nextWidth, nextHeight);

    const compressedBlob = await canvasToBlob(canvas);
    if (!compressedBlob || compressedBlob.size >= file.size) {
      return {
        file,
        wasCompressed: false,
        originalBytes: file.size,
        nextBytes: file.size,
      };
    }

    return {
      file: new File([compressedBlob], renameAsJpeg(file.name), {
        type: "image/jpeg",
      }),
      wasCompressed: true,
      originalBytes: file.size,
      nextBytes: compressedBlob.size,
    };
  } finally {
    revoke();
  }
}

export function buildUploadPreparationLabel(input: PreparedImageUpload) {
  if (!input.wasCompressed) {
    return `Upload ready at ${formatBytes(input.nextBytes)}.`;
  }

  return `Compressed ${formatBytes(input.originalBytes)} to ${formatBytes(
    input.nextBytes,
  )} before analysis.`;
}
