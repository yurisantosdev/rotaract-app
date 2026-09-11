export const DEFAULT_PAGE_SIZE = 10;

export type PaginationItemLabel = {
  singular: string;
  plural: string;
};

export type PaginationProps = {
  page: number;
  totalItems: number;
  pageSize?: number;
  onPageChange: (page: number) => void;
  itemLabel?: PaginationItemLabel;
  compact?: boolean;
  className?: string;
};

export type UsePaginationOptions = {
  pageSize?: number;
  resetKey?: string | number;
};
