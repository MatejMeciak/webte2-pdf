import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import api from "@/api/axios";
import type { PaginatedHistoryResponse } from "../types/history";

export function useAdminHistory() {
  const { t } = useTranslation();
  const [history, setHistory] = useState<PaginatedHistoryResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(20);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get<PaginatedHistoryResponse>(`/history?page=${page}&size=${size}`);
      setHistory(response.data);
    } catch (err) {
      setError(t('admin.history.fetchError'));
      console.error("Error fetching history:", err);
    } finally {
      setLoading(false);
    }
  }, [page, size, t]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const doDeleteEntry = async (id: number) => {
    setLoading(true);
    
    try {
      await api.delete(`/history/${id}`);
      fetchHistory();
    } catch (err) {
      console.error("Error deleting history entry:", err);
    } finally {
      setLoading(false);
    }
  };

  const doDeleteAll = async () => {
    setLoading(true);
    
    try {
      await api.delete('/history');
      fetchHistory();
    } catch (err) {
      console.error("Error deleting all history:", err);
    } finally {
      setLoading(false);
    }
  };

  const doExport = async () => {
    setLoading(true);
    
    try {
      // Direct download with blob handling
      const response = await api.get('/history/export', { responseType: 'blob' });
      
      // Create a URL for the blob
      const url = window.URL.createObjectURL(new Blob([response.data]));
      
      // Create a temporary link element
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'operation_history.csv');
      
      // Append to body, click, then remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Error exporting history:", err);
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
    doDeleteEntry,
    doDeleteAll,
    doExport
  };
}