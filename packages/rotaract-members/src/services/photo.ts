import {
  isPhotoDataUrl,
  PHOTO_ACCEPT,
  PHOTO_MAX_BYTES,
} from "../types/member";

export function fileToPhotoDataUrl(file: File): Promise<string> {
  const allowed = PHOTO_ACCEPT.split(",");
  if (!allowed.includes(file.type)) {
    return Promise.reject(new Error("Use uma foto PNG, JPG ou WEBP."));
  }

  if (file.size > PHOTO_MAX_BYTES) {
    return Promise.reject(new Error("A foto precisa ter no máximo 2 MB."));
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== "string" || !isPhotoDataUrl(result)) {
        reject(new Error("Não foi possível converter a foto."));
        return;
      }
      resolve(result);
    };
    reader.onerror = () => {
      reject(new Error("Não foi possível ler a foto."));
    };
    reader.readAsDataURL(file);
  });
}
