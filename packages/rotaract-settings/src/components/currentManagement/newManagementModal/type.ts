export type NewManagementModalProps = {
  open: boolean;
  existingNames: string[];
  currentManagement?: string;
  onClose: () => void;
  onCreate: (name: string) => void | Promise<void>;
};
