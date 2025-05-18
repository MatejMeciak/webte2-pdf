export interface HistoryResponse {
  operation_type: string;
  source_type: string;
  request_details: string;
  id: number;
  user_id: number;
  user_name: string;
  user_email: string;
  timestamp: string;
  ip_address: string;
  country: string;
  state: string;
  user_agent: string;
}

export interface PaginatedHistoryResponse {
  items: HistoryResponse[];
  total: number;
  page: number;
  size: number;
  pages: number;
} 