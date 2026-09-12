import { Movement } from "../../types/movement";

export type MovementsPanelProps = {
  movements: Movement[];
  onAdd: (movement: Omit<Movement, "id">) => void | Promise<void>;
  onUpdate: (movement: Movement) => void | Promise<void>;
  onRemove: (id: string) => void;
  onImported: (created: Movement[]) => void;
};

export type UseMovementsProps = Pick<
  MovementsPanelProps,
  "movements" | "onAdd" | "onUpdate"
>;