"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Save, Trash2, Tag, Loader2, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface AnnotationToolProps {
  workspaceId: string;
}

interface Entity {
  entity: string;
  value: string;
  start: number;
  end: number;
}

export default function AnnotationTool({ workspaceId }: AnnotationToolProps) {
  const [models, setModels] = useState<any[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>("none");
  const [text, setText] = useState("");
  const [intent, setIntent] = useState("");
  const [entities, setEntities] = useState<Entity[]>([]);
  const [annotations, setAnnotations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newEntity, setNewEntity] = useState({ type: "", value: "" });

  useEffect(() => {
    fetchNLUModels();
  }, [workspaceId]);

  const fetchNLUModels = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("bearer_token");
      const response = await fetch(`/api/nlu-models?workspaceId=${workspaceId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setModels(data);
        if (data.length > 0) {
          setSelectedModel(data[0].id.toString());
        }
      }
    } catch (error) {
      console.error("Failed to fetch NLU models:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddEntity = () => {
    if (!newEntity.type || !newEntity.value) {
      toast.error("Please provide entity type and value");
      return;
    }

    const start = text.indexOf(newEntity.value);
    if (start === -1) {
      toast.error("Entity value not found in text");
      return;
    }

    const entity: Entity = {
      entity: newEntity.type,
      value: newEntity.value,
      start,
      end: start + newEntity.value.length,
    };

    setEntities([...entities, entity]);
    setNewEntity({ type: "", value: "" });
    toast.success("Entity added");
  };

  const handleRemoveEntity = (index: number) => {
    setEntities(entities.filter((_, i) => i !== index));
    toast.success("Entity removed");
  };

  const handleSaveAnnotation = async () => {
    if (!text || !intent) {
      toast.error("Please provide text and intent");
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem("bearer_token");
      const response = await fetch("/api/annotations", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nluModelId: selectedModel === "none" ? null : selectedModel,
          workspaceId,
          text,
          intent,
          entities,
        }),
      });

      if (response.ok) {
        setText("");
        setIntent("");
        setEntities([]);
        toast.success("Annotation saved successfully!");
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to save annotation");
      }
    } catch (error) {
      console.error("Failed to save annotation:", error);
      toast.error("Failed to save annotation");
    } finally {
      setSaving(false);
    }
  };

  // Safe JSON parsing for entities
  const parseEntities = (entitiesJson: any): Entity[] => {
    if (!entitiesJson) return [];
    if (Array.isArray(entitiesJson)) return entitiesJson;
    try {
      return JSON.parse(entitiesJson);
    } catch {
      return [];
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
        <h2 className="text-2xl font-bold mb-2">NLU Annotation Tool</h2>
        <p className="text-muted-foreground">
          Annotate training data with intents and entities for RASA models
        </p>
      </div>

      {/* Model Selection */}
      <Card className="p-6">
        <div>
          <Label>Select NLU Model (Optional)</Label>
          <Select value={selectedModel} onValueChange={setSelectedModel}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Choose an NLU model or leave unassigned" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Unassigned</SelectItem>
              {models.map((model) => (
                <SelectItem key={model.id} value={model.id.toString()}>
                  {model.modelName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Annotation Form */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Create Annotation</h3>
        <div className="space-y-4">
          <div>
            <Label>Training Text</Label>
            <Textarea
              placeholder="Enter the text to annotate..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={3}
              className="mt-1"
            />
          </div>

          <div>
            <Label>Intent</Label>
            <Input
              placeholder="e.g., greet, track_order, ask_refund"
              value={intent}
              onChange={(e) => setIntent(e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <Label>Entities</Label>
            <div className="mt-2 space-y-3">
              {entities.map((entity, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2 bg-muted rounded">
                  <Badge>{entity.entity}</Badge>
                  <span className="flex-1 text-sm">{entity.value}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveEntity(idx)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}

              <div className="flex gap-2">
                <Input
                  placeholder="Entity type (e.g., order_id)"
                  value={newEntity.type}
                  onChange={(e) => setNewEntity({ ...newEntity, type: e.target.value })}
                />
                <Input
                  placeholder="Entity value"
                  value={newEntity.value}
                  onChange={(e) => setNewEntity({ ...newEntity, value: e.target.value })}
                />
                <Button onClick={handleAddEntity} variant="outline">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          <Button onClick={handleSaveAnnotation} disabled={saving} className="w-full">
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Annotation
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* Info Card */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Annotation Guidelines</h3>
        <div className="space-y-3 text-sm text-muted-foreground">
          <div className="flex gap-2">
            <FileText className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <p>Annotations are stored in simulation mode and ready for NLU training</p>
          </div>
          <div className="flex gap-2">
            <Tag className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <p>Define clear intents like "greet", "goodbye", "ask_weather", "track_order"</p>
          </div>
          <div className="flex gap-2">
            <Tag className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <p>Mark entities like person names, dates, locations, product IDs in your text</p>
          </div>
        </div>
      </Card>
    </div>
  );
}