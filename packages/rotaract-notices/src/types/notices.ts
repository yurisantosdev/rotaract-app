export type Notices = {
  id: string;
  title: string;
  message: string;
  memberId: string;
  read: boolean;
  date: string;
  createdAt: Date;
  updatedAt: Date;
};

export type NoticesPayload = {
  title: string;
  message: string;
  memberId: string;
  read: boolean;
  date: string;
};

export const NOTICE_INPUT_CLASS =
  "h-12 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 text-sm text-zinc-900 outline-none ring-rotaract-pink/20 transition placeholder:text-zinc-400 focus:border-rotaract-pink/50 focus:bg-white focus:ring-4";

export const NOTICE_TEXTAREA_CLASS =
  "min-h-[6rem] w-full resize-none rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 outline-none ring-rotaract-pink/20 transition placeholder:text-zinc-400 focus:border-rotaract-pink/50 focus:bg-white focus:ring-4";
