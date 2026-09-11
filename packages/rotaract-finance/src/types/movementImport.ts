import type { Movement } from "./movement";

export type MovementImportPayload = Omit<Movement, "id">;

export type MovementImportIssue = {
  row: number;
  message: string;
};

export type ParsedMovementImport = {
  rows: Array<{
    row: number;
    data: MovementImportPayload;
  }>;
  issues: MovementImportIssue[];
};

export type MovementImportResult = {
  created: Movement[];
  errors: MovementImportIssue[];
};
