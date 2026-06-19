export type SortDirection = 'asc' | 'desc' | null;

export interface ColumnDef<T> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  minWidth?: string;
}

export interface SortState<T> {
  column: keyof T | null;
  direction: SortDirection;
}

export interface PaginationState {
  page: number;
  pageSize: number;
}

export interface TableConfig {
  pageSizeOptions: number[];
  searchPlaceholder?: string;
}

export type UserStatus = 'active' | 'inactive' | 'pending';

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: UserStatus;
  joinedAt: string;
}

export const FIRST = ['Alice', 'Bob', 'Carlos', 'Diana', 'Eva', 'Frank', 'Grace', 'Hugo', 'Iris', 'Jake',
  'Karen', 'Liam', 'Mia', 'Noah', 'Olivia', 'Paul', 'Quinn', 'Rachel', 'Sam', 'Tara',
  'Uma', 'Victor', 'Wendy', 'Xander', 'Yara'];

export const LAST = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
  'Wilson', 'Anderson', 'Taylor', 'Thomas', 'Jackson', 'White', 'Harris', 'Martin'];

export const ROLES = ['Engineer', 'Designer', 'Product Manager', 'Data Analyst', 'QA Engineer',
  'DevOps', 'Marketing', 'Sales'];

export const STATUSES: UserStatus[] = ['active', 'inactive'];
