import { useEffect, useState } from "react";
import { useAdminHistory } from "../hooks/useAdminHistory";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";

export default function AdminHistoryPage() {
  const {
    history,
    loading,
    error,
    page,
    size,
    setPage,
    fetchHistory,
    doSearch,
    doExport,
    doDeleteEntry,
    doDeleteAll,
  } = useAdminHistory();

  useEffect(() => {
    fetchHistory();
    // eslint-disable-next-line
  }, []);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader
        title="Admin History"
        description="Prehľad všetkých PDF operácií v aplikácii. Môžete exportovať alebo mazať históriu."
      />
      <Card className="p-6 mb-6">
        <div className="flex flex-wrap gap-2 mb-4">
          <Button variant="outline" onClick={doExport} disabled={loading}>
            Exportovať do CSV
          </Button>
          <Button variant="destructive" onClick={doDeleteAll} disabled={loading}>
            Vymazať celú históriu
          </Button>
        </div>
        {error && <div className="text-red-500 mb-2">{error}</div>}
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm border">
            <thead>
              <tr className="bg-muted">
                <th className="p-2 border">#</th>
                <th className="p-2 border">Používateľ</th>
                <th className="p-2 border">Email</th>
                <th className="p-2 border">Operácia</th>
                <th className="p-2 border">Zdroj</th>
                <th className="p-2 border">IP</th>
                <th className="p-2 border">Krajina</th>
                <th className="p-2 border">Stav</th>
                <th className="p-2 border">Agent</th>
                <th className="p-2 border">Dátum</th>
                <th className="p-2 border">Akcia</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={11} className="text-center p-4">Načítavam...</td></tr>
              ) : history && history.items.length > 0 ? (
                history.items.map((h) => (
                  <tr key={h.id} className="border-b">
                    <td className="p-2 border text-center">{h.id}</td>
                    <td className="p-2 border">{h.user_name}</td>
                    <td className="p-2 border">{h.user_email}</td>
                    <td className="p-2 border">{h.operation_type}</td>
                    <td className="p-2 border">{h.source_type}</td>
                    <td className="p-2 border">{h.ip_address}</td>
                    <td className="p-2 border">{h.country}</td>
                    <td className="p-2 border">{h.state}</td>
                    <td className="p-2 border max-w-xs truncate" title={h.user_agent}>{h.user_agent}</td>
                    <td className="p-2 border">{h.timestamp}</td>
                    <td className="p-2 border text-center">
                      <Button variant="destructive" size="sm" onClick={() => doDeleteEntry(h.id)} disabled={loading}>
                        Vymazať
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={11} className="text-center p-4">Žiadne záznamy</td></tr>
              )}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        {history && history.pages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-4">
            <Button variant="outline" size="sm" disabled={page === 0 || loading} onClick={() => fetchHistory(page - 1)}>
              Predchádzajúca
            </Button>
            <span>Strana {page + 1} z {history.pages}</span>
            <Button variant="outline" size="sm" disabled={page === history.pages - 1 || loading} onClick={() => fetchHistory(page + 1)}>
              Ďalšia
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
} 