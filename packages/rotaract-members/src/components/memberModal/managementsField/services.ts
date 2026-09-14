import { ManagementsFieldProps } from "./type";

export function useManagementsField({
  selected,
  onChange,
}: ManagementsFieldProps) {
  function toggle(name: string) {
    if (selected.includes(name)) {
      onChange(selected.filter((item) => item !== name));
      return;
    }

    onChange(
      [...selected, name].sort((a, b) => a.localeCompare(b, "pt-BR"))
    );
  }

  return { toggle };
}
