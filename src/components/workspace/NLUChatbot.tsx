"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Send, Bot, User, Loader2, MessageSquare, Server, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface NLUChatbotProps {
  workspaceId: string;
}

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  intent?: string;
  confidence?: number;
  timestamp: Date;
}

export default function NLUChatbot({ workspaceId }: NLUChatbotProps) {
  const [models, setModels] = useState<any[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [sending, setSending] = useState(false);
  const [backendStatus, setBackendStatus] = useState<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchNLUModels();
    checkBackendStatus();
  }, [workspaceId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const checkBackendStatus = async () => {
    try {
      const response = await fetch("/api/backend-status");
      if (response.ok) {
        const data = await response.json();
        setBackendStatus(data);
      }
    } catch (error) {
      console.error("Failed to check backend status:", error);
    }
  };

  const fetchNLUModels = async () => {
    try {
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
    }
  };

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText("");
    setSending(true);

    try {
      const token = localStorage.getItem("bearer_token");
      const response = await fetch("/api/rasa/parse", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          text: inputText,
          modelId: selectedModel,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: data.response || "I understand that.",
          isUser: false,
          intent: data.intent,
          confidence: data.confidence,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, botMessage]);
        
        // Show backend mode
        if (data.backend === 'rasa') {
          console.log('✅ Response from Rasa NLU Backend');
        } else {
          console.log('⚠️ Response from Simulation Mode');
        }
      } else {
        toast.error("Failed to get response from chatbot");
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Rasa NLU Chatbot</h2>
        <p className="text-muted-foreground">
          Test your RASA-powered NLU models with interactive conversation
        </p>
      </div>

      {/* Backend Status */}
      {backendStatus && (
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Server className="w-4 h-4" />
            <span className="font-semibold text-sm">Python Backend Status</span>
          </div>
          <div className="grid grid-cols-3 gap-3 text-xs">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${backendStatus.rasaService.available ? 'bg-green-500' : 'bg-yellow-500'}`} />
              <span>Rasa Service: {backendStatus.rasaService.available ? 'Connected' : 'Simulation'}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${backendStatus.rasaServer.available ? 'bg-green-500' : 'bg-yellow-500'}`} />
              <span>Rasa Server: {backendStatus.rasaServer.available ? 'Connected' : 'Offline'}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${backendStatus.mlService.available ? 'bg-green-500' : 'bg-yellow-500'}`} />
              <span>ML Service: {backendStatus.mlService.available ? 'Connected' : 'Simulation'}</span>
            </div>
          </div>
          {!backendStatus.rasaService.available && (
            <div className="mt-3 p-2 bg-yellow-500/10 rounded flex items-start gap-2 text-xs">
              <AlertCircle className="w-3 h-3 text-yellow-500 mt-0.5 flex-shrink-0" />
              <span className="text-yellow-700 dark:text-yellow-300">
                Python Rasa backend not connected. Using simulation mode. See <code className="px-1 bg-background rounded">PYTHON_BACKEND_SETUP.md</code> to set up real Rasa NLU.
              </span>
            </div>
          )}
        </Card>
      )}

      {/* Model Selection */}
      <Card className="p-6">
        <div>
          <label className="text-sm font-medium mb-2 block">Select NLU Model</label>
          <Select value={selectedModel} onValueChange={setSelectedModel}>
            <SelectTrigger>
              <SelectValue placeholder="Choose an NLU model" />
            </SelectTrigger>
            <SelectContent>
              {models.length === 0 && (
                <SelectItem value="default">Default Simulation Model</SelectItem>
              )}
              {models.map((model) => (
                <SelectItem key={model.id} value={model.id.toString()}>
                  {model.modelName} - Accuracy: {(model.accuracy * 100).toFixed(1)}%
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Chat Interface */}
      <Card className="p-0 overflow-hidden">
        <div className="bg-primary/5 p-4 border-b border-border flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-primary" />
          <span className="font-semibold">Chat Interface</span>
          {backendStatus?.rasaService.available ? (
            <Badge variant="default" className="ml-auto">Live Rasa</Badge>
          ) : (
            <Badge variant="secondary" className="ml-auto">Simulation</Badge>
          )}
        </div>

        <ScrollArea className="h-[500px] p-4">
          <div className="space-y-4">
            {messages.length === 0 && (
              <div className="text-center py-12">
                <Bot className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Start a conversation with the NLU bot</p>
                <p className="text-xs text-muted-foreground mt-2">
                  Try: "Hello", "What's the weather?", "Thank you"
                </p>
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.isUser ? "justify-end" : "justify-start"}`}
              >
                {!message.isUser && (
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-primary" />
                  </div>
                )}
                <div className={`max-w-[70%] ${message.isUser ? "order-first" : ""}`}>
                  <div
                    className={`p-3 rounded-lg ${
                      message.isUser
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    <p>{message.text}</p>
                  </div>
                  {message.intent && message.confidence !== undefined && (
                    <div className="mt-2 flex gap-2">
                      <Badge variant="outline" className="text-xs">Intent: {message.intent}</Badge>
                      <Badge variant="outline" className="text-xs">
                        {(message.confidence * 100).toFixed(1)}%
                      </Badge>
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
                {message.isUser && (
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-primary-foreground" />
                  </div>
                )}
              </div>
            ))}
            <div ref={scrollRef} />
          </div>
        </ScrollArea>

        <div className="p-4 border-t border-border">
          <div className="flex gap-2">
            <Input
              placeholder="Type your message..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={sending}
            />
            <Button
              onClick={handleSendMessage}
              disabled={sending || !inputText.trim()}
            >
              {sending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}