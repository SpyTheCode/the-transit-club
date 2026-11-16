import "server-only";

export const MAX_ADMIN_IMAGE_BYTES = 5 * 1024 * 1024;

const imageExtensions: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export function getAdminImageExtension(mimeType: string) {
  return imageExtensions[mimeType] ?? null;
}

function hasExpectedSignature(bytes: Uint8Array, mimeType: string) {
  if (mimeType === "image/jpeg") {
    return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  }
  if (mimeType === "image/png") {
    return (
      bytes[0] === 0x89 &&
      bytes[1] === 0x50 &&
      bytes[2] === 0x4e &&
      bytes[3] === 0x47 &&
      bytes[4] === 0x0d &&
      bytes[5] === 0x0a &&
      bytes[6] === 0x1a &&
      bytes[7] === 0x0a
    );
  }
  return (
    mimeType === "image/webp" &&
    String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" &&
    String.fromCharCode(...bytes.slice(8, 12)) === "WEBP"
  );
}

export async function isValidAdminImage(file: File) {
  const extension = getAdminImageExtension(file.type);
  if (!extension || file.size === 0 || file.size > MAX_ADMIN_IMAGE_BYTES) {
    return false;
  }
  return hasExpectedSignature(
    new Uint8Array(await file.arrayBuffer()),
    file.type,
  );
}
