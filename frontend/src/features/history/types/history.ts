export interface HistoryResponse {
  id: number;
  userId: number;
  userName: string;
  userEmail: string;
  operationType: string;
  timestamp: string;
  sourceType: string;
  ipAddress: string;
  country: string;
  state: string;
  userAgent: string;
  // legacy/compat fields
  username?: string;
  operation?: string;
  details?: string;
  createdAt?: string;
}

export interface HistorySearchRequest {
  username?: string;
  operation?: string;
  dateFrom?: string;
  dateTo?: string;
  details?: string;
  sourceType?: string;
}

export interface HistoryExportRequest {
  // Placeholder if needed in the future
}

export interface PaginatedHistoryResponse {
  content: HistoryResponse[];
  totalElements: number;
  totalPages: number;
  number: number; // current page
  size: number;
} 