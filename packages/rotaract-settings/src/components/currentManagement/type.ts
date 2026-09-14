export type CurrentManagementProps = {
  currentManagement: string;
  managements: string[];
  onCreateManagement: (name: string) => Promise<void>;
};

export type UseCurrentManagementProps = CurrentManagementProps;
