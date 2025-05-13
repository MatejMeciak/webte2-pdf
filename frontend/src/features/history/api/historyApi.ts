import api from "@/api/axios";
import type {
  HistoryResponse,
  HistorySearchRequest,
  PaginatedHistoryResponse,
} from "../types/history";

export async function getHistory(page = 0, size = 20) {
  const res = await api.get<PaginatedHistoryResponse>(`/history`, {
    params: { page, size },
  });
  return res.data;
}

export async function searchHistory(
  search: HistorySearchRequest,
  page = 0,
  size = 20
) {
  const res = await api.post<PaginatedHistoryResponse>(
    `/history/search`,
    search,
    { params: { page, size } }
  );
  return res.data;
}

export async function exportHistory() {
  const res = await api.get(`/history/export`, {
    responseType: "blob",
  });
  return res;
}

export async function deleteHistoryEntry(id: number) {
  return api.delete(`/history/${id}`);
}

export async function deleteAllHistory() {
  return api.delete(`/history`);
} 