export interface HistoryResponse {
  id: number;
  user_id: number;
  userName: string;
  userEmail: string;
  operation_type: string;
  timestamp: string;
  source_type: string;
  ip_address: string;
  country: string;
  state: string;
  user_agent: string;
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