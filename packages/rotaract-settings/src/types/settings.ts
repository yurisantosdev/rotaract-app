export type Setting = {
  id: string;
  valueContribution: number;
  logo: string;
  nameClub: string;
  createdAt: Date;
  updatedAt: Date;
};

export type SettingPayload = {
  valueContribution: number;
  logo: string;
  nameClub: string;
};

export type ClubSettings = {
  id?: string;
  clubName: string;
  logoUrl: string;
  membershipFee: number;
};

export const SETTINGS_INPUT_CLASS =
  "h-12 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 text-sm text-zinc-900 outline-none ring-rotaract-pink/20 transition placeholder:text-zinc-400 focus:border-rotaract-pink/50 focus:bg-white focus:ring-4";

export const LOGO_ACCEPT = "image/png,image/jpeg,image/webp";
export const LOGO_MAX_BYTES = 2 * 1024 * 1024;

export const LOGO_DATA_URL_PATTERN =
  /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=\s]+$/;

export function isImageDataUrl(value: string): boolean {
  return LOGO_DATA_URL_PATTERN.test(value.trim());
}
