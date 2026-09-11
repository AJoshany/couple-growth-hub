"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading";
import { toast } from "sonner";
import { exportData } from "@/app/actions/export";
import { downloadAsJSON, downloadAsCSV, type ExportData } from "@/lib/export";
import { Download, FileJson, FileSpreadsheet } from "lucide-react";

export function ExportSettings() {
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState<"json" | "csv">("json");

  const handleExport = async (format: "json" | "csv") => {
    setIsExporting(true);
    setExportFormat(format);

    try {
      const result = await exportData(format);
      
      if (format === "json") {
        downloadAsJSON(result.data as ExportData, `${result.filename}.json`);
      } else {
        downloadAsCSV(result.data as ExportData);
      }

      toast.success("Export complete!", {
        description: `Your data has been downloaded as ${format.toUpperCase()}.`,
      });
    } catch {
      toast.error("Export failed", {
        description: "Something went wrong while exporting your data.",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Download className="size-4" /> Export Data
        </CardTitle>
        <CardDescription>
          Download your journal entries, goals, and memories
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Export your data to keep a backup or transfer it elsewhere. Choose your preferred format:
        </p>

        <div className="grid gap-3 sm:grid-cols-2">
          <Button
            variant="outline"
            onClick={() => handleExport("json")}
            disabled={isExporting}
            className="flex items-center gap-2"
          >
            {isExporting && exportFormat === "json" ? (
              <LoadingSpinner size="xs" />
            ) : (
              <FileJson className="size-4" />
            )}
            Export as JSON
          </Button>

          <Button
            variant="outline"
            onClick={() => handleExport("csv")}
            disabled={isExporting}
            className="flex items-center gap-2"
          >
            {isExporting && exportFormat === "csv" ? (
              <LoadingSpinner size="xs" />
            ) : (
              <FileSpreadsheet className="size-4" />
            )}
            Export as CSV
          </Button>
        </div>

        <div className="rounded-lg bg-muted p-3">
          <p className="text-xs text-muted-foreground">
            <strong>JSON:</strong> Complete backup including all data and relationships.
            Best for importing back into the app.
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            <strong>CSV:</strong> Spreadsheet-friendly format for journal entries and goals.
            Great for analysis in Excel or Google Sheets.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
