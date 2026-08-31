import { isImageDataUrl, LOGO_ACCEPT, LOGO_MAX_BYTES } from "../types/settings";

export function fileToImageDataUrl(file: File): Promise<string> {
  const allowed = LOGO_ACCEPT.split(",");
  if (!allowed.includes(file.type)) {
    return Promise.reject(new Error("Use uma imagem PNG, JPG ou WEBP."));
  }

  if (file.size > LOGO_MAX_BYTES) {
    return Promise.reject(new Error("A logomarca precisa ter no máximo 2 MB."));
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== "string" || !isImageDataUrl(result)) {
        reject(new Error("Não foi possível converter a imagem para base64."));
        return;
      }
      resolve(result);
    };
    reader.onerror = () => {
      reject(new Error("Não foi possível ler a imagem."));
    };
    reader.readAsDataURL(file);
  });
}
