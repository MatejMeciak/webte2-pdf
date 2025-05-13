import { useState } from "react";
import {
  getHistory,
  searchHistory,
  exportHistory,
  deleteHistoryEntry,
  deleteAllHistory,
} from "../api/historyApi";
import type { HistoryResponse, HistorySearchRequest, PaginatedHistoryResponse } from "../types/history";

export function useAdminHistory() {
  const [history, setHistory] = useState<PaginatedHistoryResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useState<HistorySearchRequest | null>(null);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(20);

  const fetchHistory = async (pageOverride?: number, sizeOverride?: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = searchParams
        ? await searchHistory(searchParams, pageOverride ?? page, sizeOverride ?? size)
        : await getHistory(pageOverride ?? page, sizeOverride ?? size);
      setHistory(data);
      setPage(data.number);
      setSize(data.size);
    } catch (e: any) {
      setError(e?.response?.data || "Failed to fetch history");
    } finally {
      setLoading(false);
    }
  };

  const doSearch = async (params: HistorySearchRequest) => {
    setSearchParams(params);
    setPage(0);
    setLoading(true);
    setError(null);
    try {
      const data = await searchHistory(params, 0, size);
      setHistory(data);
    } catch (e: any) {
      setError(e?.response?.data || "Failed to search history");
    } finally {
      setLoading(false);
    }
  };

  const doExport = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await exportHistory();
      // Download logic
      const contentDisposition = res.headers['content-disposition'];
      let filename = 'pdf_operations_history.csv';
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="?([^";]+)"?/);
        if (match && match[1]) filename = match[1];
      }
      const blob = new Blob([res.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (e: any) {
      setError(e?.response?.data || "Failed to export history");
    } finally {
      setLoading(false);
    }
  };

  const doDeleteEntry = async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      await deleteHistoryEntry(id);
      await fetchHistory();
    } catch (e: any) {
      setError(e?.response?.data || "Failed to delete entry");
    } finally {
      setLoading(false);
    }
  };

  const doDeleteAll = async () => {
    setLoading(true);
    setError(null);
    try {
      await deleteAllHistory();
      await fetchHistory();
    } catch (e: any) {
      setError(e?.response?.data || "Failed to delete all history");
    } finally {
      setLoading(false);
    }
  };

  return {
    history,
    loading,
    error,
    page,
    size,
    setPage,
    setSize,
    fetchHistory,
    doSearch,
    doExport,
    doDeleteEntry,
    doDeleteAll,
  };
} 