"use client";

import {
  maximumFinalPaymentProofBytes,
  maximumPaymentProofDimension,
} from "@/lib/payment-proof-constraints";

const outputQualities = [0.82, 0.72, 0.62];

function canvasBlob(
  canvas: HTMLCanvasElement,
  quality: number,
) {
  return new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", quality),
  );
}

export async function optimizePaymentProof(file: File) {
  const bitmap = await createImageBitmap(file);
  try {
    if (
      file.size <= maximumFinalPaymentProofBytes &&
      Math.max(bitmap.width, bitmap.height) <= maximumPaymentProofDimension
    ) {
      return file;
    }

    const scale = Math.min(
      1,
      maximumPaymentProofDimension / Math.max(bitmap.width, bitmap.height),
    );
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const context = canvas.getContext("2d");
    if (!context) return null;
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

    for (const quality of outputQualities) {
      const blob = await canvasBlob(canvas, quality);
      if (blob && blob.size <= maximumFinalPaymentProofBytes) {
        const baseName = file.name.replace(/\.[^.]+$/, "");
        return new File([blob], `${baseName}-optimizado.jpg`, {
          lastModified: Date.now(),
          type: "image/jpeg",
        });
      }
    }
    return null;
  } finally {
    bitmap.close();
  }
}
