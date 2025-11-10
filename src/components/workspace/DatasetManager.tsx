"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Download, FileText, Loader2, AlertCircle, FileJson, FileCode } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";

interface DatasetManagerProps {
  workspaceId: string;
}

export default function DatasetManager({ workspaceId }: DatasetManagerProps) {
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [datasets, setDatasets] = useState<any[]>([]);
  const [selectedDataset, setSelectedDataset] = useState<any>(null);
  const [preview, setPreview] = useState<any[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchDatasets();
  }, [workspaceId]);

  const fetchDatasets = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("bearer_token");
      const response = await fetch(`/api/datasets?workspaceId=${workspaceId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setDatasets(data);
        if (data.length > 0 && !selectedDataset) {
          setSelectedDataset(data[0]);
          if (data[0].columnsJson) {
            setColumns(Array.isArray(data[0].columnsJson) ? data[0].columnsJson : JSON.parse(data[0].columnsJson));
          }
        }
      }
    } catch (error) {
      console.error("Failed to fetch datasets:", error);
      toast.error("Failed to load datasets");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (!['csv', 'json', 'yml', 'yaml'].includes(fileExtension || '')) {
      toast.error("Please upload a CSV, JSON, or YML file");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("workspaceId", workspaceId);

    try {
      const token = localStorage.getItem("bearer_token");
      const response = await fetch("/api/datasets/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setSelectedDataset(data.dataset);
        setPreview(data.preview);
        setColumns(data.columns);
        await fetchDatasets();
        toast.success(`${data.fileFormat.toUpperCase()} file uploaded successfully!`);
      } else {
        const error = await response.json();
        toast.error(error.error || "Upload failed");
      }
    } catch (error) {
      console.error("Upload failed:", error);
      toast.error("Upload failed. Please try again.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDownload = async () => {
    if (!selectedDataset) return;
    window.open(`/api/datasets/${selectedDataset.id}/download`, "_blank");
  };

  const getFileIcon = (format: string) => {
    switch (format) {
      case 'json':
        return <FileJson className="w-4 h-4 text-blue-500" />;
      case 'yml':
      case 'yaml':
        return <FileCode className="w-4 h-4 text-purple-500" />;
      default:
        return <FileText className="w-4 h-4 text-green-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Dataset Management</h2>
        <p className="text-muted-foreground">
          Upload and manage your datasets in CSV, JSON, or YML format for ML training
        </p>
      </div>

      {/* Upload Section */}
      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <Label>Upload Dataset</Label>
            <div className="mt-2 flex gap-4 items-center">
              <Input
                ref={fileInputRef}
                type="file"
                accept=".csv,.json,.yml,.yaml"
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
                    Upload File
                  </>
                )}
              </Button>
              {selectedDataset && (
                <Button variant="outline" onClick={handleDownload}>
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              )}
            </div>
          </div>

          <div className="bg-muted/30 p-4 rounded-lg">
            <div className="flex gap-2 text-sm text-muted-foreground">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-foreground mb-1">Supported Formats:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li><strong>CSV</strong> - Comma-separated values with headers</li>
                  <li><strong>JSON</strong> - Array of objects or single object</li>
                  <li><strong>YML/YAML</strong> - YAML structured data</li>
                  <li>Maximum file size: 100MB</li>
                  <li>Supports large datasets for ML training</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Dataset Selection */}
      {datasets.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Available Datasets ({datasets.length})</h3>
          <div className="grid gap-3">
            {datasets.map((dataset) => (
              <div
                key={dataset.id}
                onClick={() => {
                  setSelectedDataset(dataset);
                  if (dataset.columnsJson) {
                    setColumns(Array.isArray(dataset.columnsJson) ? dataset.columnsJson : JSON.parse(dataset.columnsJson));
                  }
                }}
                className={`p-4 rounded-lg border-2 cursor-pointer transition ${
                  selectedDataset?.id === dataset.id
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getFileIcon(dataset.fileFormat || 'csv')}
                    <div>
                      <p className="font-semibold">{dataset.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {dataset.rowCount?.toLocaleString()} rows • {dataset.columnCount} columns • {dataset.fileFormat?.toUpperCase() || 'CSV'}
                      </p>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {(dataset.fileSize / 1024).toFixed(2)} KB
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Dataset Info */}
      {selectedDataset && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Dataset Information</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Name</p>
              <p className="font-medium">{selectedDataset.name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Format</p>
              <p className="font-medium uppercase">{selectedDataset.fileFormat || 'CSV'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Rows</p>
              <p className="font-medium">{selectedDataset.rowCount?.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Columns</p>
              <p className="font-medium">{selectedDataset.columnCount}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Size</p>
              <p className="font-medium">{(selectedDataset.fileSize / 1024).toFixed(2)} KB</p>
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
      {preview.length > 0 && selectedDataset?.fileFormat !== 'yml' && (
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

      {!selectedDataset && !uploading && datasets.length === 0 && (
        <Card className="p-12 text-center">
          <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No dataset uploaded</h3>
          <p className="text-muted-foreground mb-4">
            Upload a CSV, JSON, or YML file to get started with ML training
          </p>
          <Button onClick={() => fileInputRef.current?.click()}>
            <Upload className="w-4 h-4 mr-2" />
            Upload Your First Dataset
          </Button>
        </Card>
      )}
    </div>
  );
}