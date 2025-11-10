"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Save, Trash2, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [text, setText] = useState("");
  const [intent, setIntent] = useState("");
  const [entities, setEntities] = useState<Entity[]>([]);
  const [annotations, setAnnotations] = useState<any[]>([]);
  const [newEntity, setNewEntity] = useState({ type: "", value: "" });

  useEffect(() => {
    fetchNLUModels();
  }, [workspaceId]);

  useEffect(() => {
    if (selectedModel) {
      fetchAnnotations();
    }
  }, [selectedModel]);

  const fetchNLUModels = async () => {
    try {
      const response = await fetch(`/api/workspaces/${workspaceId}/nlu-models`);
      if (response.ok) {
        const data = await response.json();
        setModels(data);
        if (data.length > 0) {
          setSelectedModel(data[0].id.toString());
        }
      }
    } catch (error) {
      console.error("Failed to fetch NLU models:", error);
    }
  };

  const fetchAnnotations = async () => {
    try {
      const response = await fetch(`/api/nlu-models/${selectedModel}/annotations`);
      if (response.ok) {
        const data = await response.json();
        setAnnotations(data);
      }
    } catch (error) {
      console.error("Failed to fetch annotations:", error);
    }
  };

  const handleAddEntity = () => {
    if (!newEntity.type || !newEntity.value) return;

    const start = text.indexOf(newEntity.value);
    if (start === -1) return;

    const entity: Entity = {
      entity: newEntity.type,
      value: newEntity.value,
      start,
      end: start + newEntity.value.length,
    };

    setEntities([...entities, entity]);
    setNewEntity({ type: "", value: "" });
  };

  const handleRemoveEntity = (index: number) => {
    setEntities(entities.filter((_, i) => i !== index));
  };

  const handleSaveAnnotation = async () => {
    if (!text || !intent) return;

    try {
      const response = await fetch("/api/annotations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nluModelId: selectedModel,
          text,
          intent,
          entities,
        }),
      });

      if (response.ok) {
        setText("");
        setIntent("");
        setEntities([]);
        fetchAnnotations();
      }
    } catch (error) {
      console.error("Failed to save annotation:", error);
    }
  };

  const handleDeleteAnnotation = async (id: number) => {
    try {
      const response = await fetch(`/api/annotations/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchAnnotations();
      }
    } catch (error) {
      console.error("Failed to delete annotation:", error);
    }
  };

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
          <Label>Select NLU Model</Label>
          <Select value={selectedModel} onValueChange={setSelectedModel}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Choose an NLU model" />
            </SelectTrigger>
            <SelectContent>
              {models.map((model) => (
                <SelectItem key={model.id} value={model.id.toString()}>
                  {model.name}
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

          <Button onClick={handleSaveAnnotation} className="w-full">
            <Save className="w-4 h-4 mr-2" />
            Save Annotation
          </Button>
        </div>
      </Card>

      {/* Annotations List */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Existing Annotations ({annotations.length})</h3>
        <div className="space-y-3">
          {annotations.map((annotation) => (
            <div key={annotation.id} className="p-4 border border-border rounded-lg">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-primary" />
                  <Badge variant="outline">{annotation.intent}</Badge>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteAnnotation(annotation.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-sm mb-2">{annotation.text}</p>
              {annotation.entitiesJson && JSON.parse(annotation.entitiesJson).length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {JSON.parse(annotation.entitiesJson).map((entity: Entity, idx: number) => (
                    <Badge key={idx} variant="secondary">
                      {entity.entity}: {entity.value}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          ))}

          {annotations.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No annotations yet. Create your first annotation above.
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
