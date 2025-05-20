import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { useAdminHistory } from "../hooks/useAdminHistory";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink
} from "@/components/ui/pagination";
import { Trash2, FileDown, Loader2, RefreshCcw, ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { Alert } from "@/components/ui/alert";

export default function AdminHistoryPage() {
  const { t } = useTranslation();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState<number | null>(null);
  const [deleteAllDialogOpen, setDeleteAllDialogOpen] = useState(false);
  
  const { 
    history, 
    loading, 
    error,
    setPage, 
    fetchHistory, 
    doDeleteEntry, 
    doDeleteAll, 
    doExport 
  } = useAdminHistory();

  // Fetch history on component mount
  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleDelete = (id: number) => {
    setDeleteItemId(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (deleteItemId !== null) {
      await doDeleteEntry(deleteItemId);
      setDeleteDialogOpen(false);
      setDeleteItemId(null);
    }
  };

  const confirmDeleteAll = async () => {
    await doDeleteAll();
    setDeleteAllDialogOpen(false);
  };

  const handleExport = async () => {
    await doExport();
  };

  // Format date using native JavaScript methods instead of date-fns
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    
    // Format: Month Day, Year, Hour:Minute AM/PM
    return new Intl.DateTimeFormat(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    }).format(date);
  };

  const getOperationTypeBadge = (type: string) => {
    const colorMap: Record<string, string> = {
      "ADD_PASSWORD": "bg-blue-100 text-blue-800",
      "REMOVE_PASSWORD": "bg-purple-100 text-purple-800",
      "MERGE_PDF": "bg-green-100 text-green-800",
      "SPLIT_PDF": "bg-amber-100 text-amber-800",
      "COMPRESS_PDF": "bg-cyan-100 text-cyan-800",
      "CONVERT_TO_IMAGES": "bg-pink-100 text-pink-800",
    };
    
    return (
      <Badge className={colorMap[type] || "bg-gray-100 text-gray-800"}>
        {type}
      </Badge>
    );
  };

  const getSourceTypeBadge = (type: string) => {
    return (
      <Badge variant={type === "FRONTEND" ? "outline" : "secondary"}>
        {type}
      </Badge>
    );
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <PageHeader
        title={t('admin.history.title')}
        description={t('admin.history.description')}
      />

      {error && (
        <Alert variant="destructive">
          {error}
        </Alert>
      )}

      <Card>
        <CardHeader className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>{t('admin.history.operations')}</CardTitle>
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchHistory()}
              disabled={loading}
              className="flex-1 sm:flex-none"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <RefreshCcw className="h-4 w-4 mr-1" />}
              {t('common.refresh')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              disabled={loading || !history?.items?.length}
              className="flex-1 sm:flex-none"
            >
              <FileDown className="h-4 w-4 mr-1" />
              {t('admin.history.export')}
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setDeleteAllDialogOpen(true)}
              disabled={loading || !history?.items?.length}
              className="flex-1 sm:flex-none"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              {t('common.deleteAll')}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : history?.items?.length ? (
            <>
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('admin.history.operation')}</TableHead>
                      <TableHead>{t('admin.history.source')}</TableHead>
                      <TableHead>{t('admin.history.details')}</TableHead>
                      <TableHead>{t('admin.history.user')}</TableHead>
                      <TableHead>{t('admin.history.location')}</TableHead>
                      <TableHead>{t('admin.history.timestamp')}</TableHead>
                      <TableHead className="w-[80px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {history.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          {getOperationTypeBadge(item.operation_type)}
                        </TableCell>
                        <TableCell>
                          {getSourceTypeBadge(item.source_type)}
                        </TableCell>
                        <TableCell className="max-w-xs truncate" title={item.request_details}>
                          {item.request_details}
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{item.user_name}</div>
                          <div className="text-xs text-muted-foreground">{item.user_email}</div>
                        </TableCell>
                        <TableCell>
                          {item.country && item.state ? (
                            <span>
                              {item.country}, {item.state}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">
                              {t('admin.history.unknownLocation')}
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          {formatDate(item.timestamp)}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {history.pages > 1 && (
                <div className="flex justify-center mt-4">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationLink 
                          onClick={() => setPage(Math.max(0, history.page - 1))}
                          className={history.page === 0 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                          aria-disabled={history.page === 0}
                          size="icon"
                        >
                          <ChevronLeftIcon className="h-4 w-4" />
                          <span className="sr-only">Previous page</span>
                        </PaginationLink>
                      </PaginationItem>
                      
                      {/* First page */}
                      {history.page > 1 && (
                        <PaginationItem>
                          <PaginationLink onClick={() => setPage(0)} isActive={history.page === 0}>
                            1
                          </PaginationLink>
                        </PaginationItem>
                      )}
                      
                      {/* Ellipsis if needed */}
                      {history.page > 2 && (
                        <PaginationItem>
                          <PaginationEllipsis />
                        </PaginationItem>
                      )}
                      
                      {/* Previous page if not on first page */}
                      {history.page > 0 && (
                        <PaginationItem>
                          <PaginationLink onClick={() => setPage(history.page - 1)}>
                            {history.page}
                          </PaginationLink>
                        </PaginationItem>
                      )}
                      
                      {/* Current page */}
                      <PaginationItem>
                        <PaginationLink isActive>{history.page + 1}</PaginationLink>
                      </PaginationItem>
                      
                      {/* Next page if not on last page */}
                      {history.page < history.pages - 1 && (
                        <PaginationItem>
                          <PaginationLink onClick={() => setPage(history.page + 1)}>
                            {history.page + 2}
                          </PaginationLink>
                        </PaginationItem>
                      )}
                      
                      {/* Ellipsis if needed */}
                      {history.page < history.pages - 3 && (
                        <PaginationItem>
                          <PaginationEllipsis />
                        </PaginationItem>
                      )}
                      
                      {/* Last page if not current */}
                      {history.page < history.pages - 2 && (
                        <PaginationItem>
                          <PaginationLink onClick={() => setPage(history.pages - 1)}>
                            {history.pages}
                          </PaginationLink>
                        </PaginationItem>
                      )}
                      
                      <PaginationItem>
                        <PaginationLink 
                          onClick={() => setPage(Math.min(history.pages - 1, history.page + 1))}
                          className={history.page === history.pages - 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                          aria-disabled={history.page === history.pages - 1}
                          size="icon"
                        >
                          <ChevronRightIcon className="h-4 w-4" />
                          <span className="sr-only">Next page</span>
                        </PaginationLink>
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          ) : (
            <div className="py-12 text-center text-muted-foreground">
              {t('admin.history.noRecords')}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete single item dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('admin.history.deleteEntryTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('admin.history.deleteEntryDescription')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete all dialog */}
      <AlertDialog open={deleteAllDialogOpen} onOpenChange={setDeleteAllDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('admin.history.deleteAllTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('admin.history.deleteAllDescription')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteAll}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t('common.deleteAll')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}