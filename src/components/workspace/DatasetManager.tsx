"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Download, FileText, Loader2, AlertCircle } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";

interface DatasetManagerProps {
  workspaceId: string;
}

export default function DatasetManager({ workspaceId }: DatasetManagerProps) {
  const [uploading, setUploading] = useState(false);
  const [dataset, setDataset] = useState<any>(null);
  const [preview, setPreview] = useState<any[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("workspaceId", workspaceId);

    try {
      const response = await fetch("/api/datasets/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setDataset(data.dataset);
        setPreview(data.preview);
        setColumns(data.columns);
      }
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async () => {
    if (!dataset) return;
    window.open(`/api/datasets/${dataset.id}/download`, "_blank");
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Dataset Management</h2>
        <p className="text-muted-foreground">
          Upload, view, and manage your CSV datasets for ML training
        </p>
      </div>

      {/* Upload Section */}
      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <Label>Upload Dataset (CSV)</Label>
            <div className="mt-2 flex gap-4 items-center">
              <Input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                disabled={uploading}
                className="hidden"
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload CSV File
                  </>
                )}
              </Button>
              {dataset && (
                <Button variant="outline" onClick={handleDownload}>
                  <Download className="w-4 h-4 mr-2" />
                  Download CSV
                </Button>
              )}
            </div>
          </div>

          <div className="bg-muted/30 p-4 rounded-lg">
            <div className="flex gap-2 text-sm text-muted-foreground">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-foreground mb-1">Requirements:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>CSV format only</li>
                  <li>First row should contain column headers</li>
                  <li>Maximum file size: 100MB</li>
                  <li>Supports large datasets for ML training</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Dataset Info */}
      {dataset && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Dataset Information</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Name</p>
              <p className="font-medium">{dataset.name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Rows</p>
              <p className="font-medium">{dataset.rowCount?.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Columns</p>
              <p className="font-medium">{dataset.columnCount}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Size</p>
              <p className="font-medium">{(dataset.fileSize / 1024).toFixed(2)} KB</p>
            </div>
          </div>
        </Card>
      )}

      {/* Column List */}
      {columns.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Columns ({columns.length})</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {columns.map((col, idx) => (
              <div key={idx} className="flex items-center gap-2 p-2 bg-muted rounded">
                <FileText className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium truncate">{col}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Data Preview */}
      {preview.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Data Preview (First 10 rows)</h3>
          <ScrollArea className="h-[400px] w-full rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  {columns.map((col, idx) => (
                    <TableHead key={idx} className="font-semibold">
                      {col}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {preview.map((row, rowIdx) => (
                  <TableRow key={rowIdx}>
                    {columns.map((col, colIdx) => (
                      <TableCell key={colIdx}>{row[col]}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </Card>
      )}

      {!dataset && !uploading && (
        <Card className="p-12 text-center">
          <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No dataset uploaded</h3>
          <p className="text-muted-foreground mb-4">
            Upload a CSV file to get started with ML training
          </p>
        </Card>
      )}
    </div>
  );
}
