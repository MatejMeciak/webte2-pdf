export interface HistoryResponse {
  id: number;
  user_id: number;
  user_name: string;
  user_email: string;
  operation_type: string;
  timestamp: string;
  source_type: string;
  ip_address: string;
  country: string;
  state: string;
  user_agent: string;
}

export interface HistorySearchRequest {
  username?: string;
  operation?: string;
  dateFrom?: string;
  dateTo?: string;
  details?: string;
  sourceType?: string;
}

export interface PaginatedHistoryResponse {
  items: HistoryResponse[];
  total: number;
  pages: number;
  page: number;
  size: number;
} 