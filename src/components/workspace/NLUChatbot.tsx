"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Send, Bot, User, Loader2, MessageSquare, Server, AlertCircle, Sparkles, Trash2 } from "lucide-react";
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

interface MLModel {
  id: number;
  modelName: string;
  algorithmType: string;
  accuracy: number;
  targetColumn: string;
  isSelected: boolean;
}

// Demo messages to show how the chatbot works
const DEMO_MESSAGES: Message[] = [
  {
    id: "demo-1",
    text: "Hello! I'm looking for a new laptop",
    isUser: true,
    timestamp: new Date(Date.now() - 120000),
  },
  {
    id: "demo-2",
    text: "Hello! Welcome to our store. How can I help you today?",
    isUser: false,
    intent: "greet",
    confidence: 0.94,
    timestamp: new Date(Date.now() - 119000),
  },
  {
    id: "demo-3",
    text: "Show me laptops under $1000",
    isUser: true,
    timestamp: new Date(Date.now() - 100000),
  },
  {
    id: "demo-4",
    text: "I'd be happy to help you find products! What are you looking for?",
    isUser: false,
    intent: "product_search",
    confidence: 0.92,
    timestamp: new Date(Date.now() - 99000),
  },
  {
    id: "demo-5",
    text: "Add the Dell XPS 15 to my cart",
    isUser: true,
    timestamp: new Date(Date.now() - 80000),
  },
  {
    id: "demo-6",
    text: "Great choice! I'll add that to your cart right away.",
    isUser: false,
    intent: "add_to_cart",
    confidence: 0.96,
    timestamp: new Date(Date.now() - 79000),
  },
  {
    id: "demo-7",
    text: "What's your return policy?",
    isUser: true,
    timestamp: new Date(Date.now() - 60000),
  },
  {
    id: "demo-8",
    text: "We have a 30-day return policy. Items must be unused with original packaging.",
    isUser: false,
    intent: "return_policy",
    confidence: 0.98,
    timestamp: new Date(Date.now() - 59000),
  },
];

export default function NLUChatbot({ workspaceId }: NLUChatbotProps) {
  const [models, setModels] = useState<MLModel[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>(DEMO_MESSAGES);
  const [inputText, setInputText] = useState("");
  const [sending, setSending] = useState(false);
  const [backendStatus, setBackendStatus] = useState<any>(null);
  const [isDemoMode, setIsDemoMode] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchMLModels();
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

  const fetchMLModels = async () => {
    try {
      const response = await fetch(`/api/ml-models?workspaceId=${workspaceId}`, {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setModels(data);
        // Auto-select the model with highest accuracy
        if (data.length > 0) {
          const bestModel = data.reduce((prev: MLModel, current: MLModel) => 
            (current.accuracy > prev.accuracy) ? current : prev
          );
          setSelectedModel(bestModel.id.toString());
        }
      }
    } catch (error) {
      console.error("Failed to fetch ML models:", error);
    }
  };

  const getIntentResponse = (intent: string): string => {
    // Ecommerce intent responses
    const responses: Record<string, string> = {
      greet: "Hello! Welcome to our store. How can I help you today?",
      product_search: "I'd be happy to help you find products! What are you looking for?",
      add_to_cart: "Great choice! I'll add that to your cart right away.",
      view_cart: "Let me show you what's in your cart.",
      checkout: "Perfect! Let's proceed to checkout. Please review your order.",
      order_status: "I can help you track your order. Please provide your order number.",
      shipping_info: "We offer standard (5-7 days), express (2-3 days), and same-day delivery options.",
      return_policy: "We have a 30-day return policy. Items must be unused with original packaging.",
      product_details: "Let me get you the detailed product information.",
      price_inquiry: "I can help you with pricing information. Which item are you interested in?",
      stock_availability: "Let me check the stock availability for you.",
      payment_methods: "We accept credit cards, PayPal, Apple Pay, Google Pay, and more.",
      cancel_order: "I understand. Let me help you cancel your order.",
      complaint: "I'm sorry to hear that. Let me help resolve this issue for you.",
      thank_you: "You're very welcome! Happy to help!",
      goodbye: "Thank you for visiting! Have a wonderful day!",
    };

    return responses[intent] || "I understand. How else can I assist you today?";
  };

  const clearDemoMessages = () => {
    setMessages([]);
    setIsDemoMode(false);
    toast.success("Demo cleared - ready for your conversation!");
  };

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;
    
    if (!selectedModel) {
      toast.error("Please select a trained model first");
      return;
    }

    // Clear demo messages on first real message
    if (isDemoMode) {
      setMessages([]);
      setIsDemoMode(false);
    }

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
      const response = await fetch("/api/ml-models/predict", {
        method: "POST",
        credentials: "include",
        headers: { 
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          modelId: selectedModel,
          data: [{ text: inputText }],
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Prediction response:', data);
        
        // Handle both Python backend and simulation formats
        let predictedIntent;
        let confidence;
        
        if (data.predictions && Array.isArray(data.predictions) && data.predictions.length > 0) {
          const prediction = data.predictions[0];
          // Python backend format: { prediction: "greet", predicted_class: "greet", confidence: 0.95 }
          predictedIntent = prediction.predicted_class || prediction.prediction;
          confidence = prediction.confidence;
        } else {
          // Fallback to old format
          const prediction = data.predictions?.[0] || data.prediction;
          predictedIntent = prediction?.prediction || prediction?.predicted_class || prediction;
          confidence = prediction?.confidence || 0.85;
        }
        
        console.log('Predicted intent:', predictedIntent, 'Confidence:', confidence);
        
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: getIntentResponse(predictedIntent),
          isUser: false,
          intent: predictedIntent,
          confidence: confidence,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, botMessage]);
        
        if (data.backend === 'python') {
          console.log('✅ Using Trained ML Model:', selectedModel);
        } else {
          console.log('⚠️ Using Simulation Mode');
        }
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to get response from chatbot");
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
        <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-primary" />
          ML-Powered NLU Chatbot
        </h2>
        <p className="text-muted-foreground">
          Test your trained ML models with interactive conversation
        </p>
      </div>

      {/* Backend Status */}
      {backendStatus && (
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Server className="w-4 h-4" />
            <span className="font-semibold text-sm">ML Backend Status</span>
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${backendStatus.mlService.available ? 'bg-green-500' : 'bg-yellow-500'}`} />
              <span>ML Service: {backendStatus.mlService.available ? 'Connected' : 'Offline'}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${models.length > 0 ? 'bg-green-500' : 'bg-yellow-500'}`} />
              <span>Trained Models: {models.length}</span>
            </div>
          </div>
          {models.length === 0 && (
            <div className="mt-3 p-2 bg-yellow-500/10 rounded flex items-start gap-2 text-xs">
              <AlertCircle className="w-3 h-3 text-yellow-500 mt-0.5 flex-shrink-0" />
              <span className="text-yellow-700 dark:text-yellow-300">
                No trained models found. Please upload a dataset and train models first (Dataset Upload → Train Models).
              </span>
            </div>
          )}
        </Card>
      )}

      {/* Model Selection */}
      <Card className="p-6">
        <div>
          <label className="text-sm font-medium mb-2 block">Select Trained Model</label>
          <Select value={selectedModel} onValueChange={setSelectedModel}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a trained ML model" />
            </SelectTrigger>
            <SelectContent>
              {models.length === 0 ? (
                <SelectItem value="none" disabled>No models available - Train models first</SelectItem>
              ) : (
                models.map((model) => (
                  <SelectItem key={model.id} value={model.id.toString()}>
                    {model.algorithmType.toUpperCase()} - Accuracy: {(model.accuracy * 100).toFixed(1)}%
                    {model.isSelected && " ⭐"}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          {selectedModel && (
            <p className="text-xs text-muted-foreground mt-2">
              Using {models.find(m => m.id.toString() === selectedModel)?.algorithmType} algorithm for intent prediction
            </p>
          )}
        </div>
      </Card>

      {/* Chat Interface */}
      <Card className="p-0 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 p-4 border-b border-border flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-primary" />
          <span className="font-semibold">Chat Interface</span>
          {isDemoMode && (
            <Badge variant="secondary" className="ml-2">
              Demo Conversation
            </Badge>
          )}
          {models.length > 0 && selectedModel ? (
            <Badge variant="default" className="ml-auto">Live ML Model</Badge>
          ) : (
            <Badge variant="secondary" className="ml-auto">No Model</Badge>
          )}
          {isDemoMode && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearDemoMessages}
              className="ml-2"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Clear Demo
            </Button>
          )}
        </div>

        <ScrollArea className="h-[500px] p-4">
          <div className="space-y-4">
            {messages.length === 0 && (
              <div className="text-center py-12">
                <Bot className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground font-medium">Start a conversation with the ML-powered bot</p>
                <p className="text-xs text-muted-foreground mt-2">
                  {models.length > 0 
                    ? "Try: \"Show me laptops\", \"Add to cart\", \"Where is my order?\""
                    : "Train a model first to enable chat"}
                </p>
              </div>
            )}

            {isDemoMode && messages.length > 0 && (
              <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <div className="flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-xs">
                    <p className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                      Demo Conversation
                    </p>
                    <p className="text-blue-700 dark:text-blue-300">
                      This is a sample conversation showing how the ML chatbot detects intents and responds. 
                      Send your first message to start a real conversation!
                    </p>
                  </div>
                </div>
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.isUser ? "justify-end" : "justify-start"}`}
              >
                {!message.isUser && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                )}
                <div className={`max-w-[70%] ${message.isUser ? "order-first" : ""}`}>
                  <div
                    className={`p-3 rounded-lg ${
                      message.isUser
                        ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                        : "bg-muted"
                    }`}
                  >
                    <p>{message.text}</p>
                  </div>
                  {message.intent && message.confidence !== undefined && (
                    <div className="mt-2 flex gap-2">
                      <Badge variant="outline" className="text-xs">
                        Intent: {message.intent}
                      </Badge>
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
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
            ))}
            <div ref={scrollRef} />
          </div>
        </ScrollArea>

        <div className="p-4 border-t border-border bg-gradient-to-r from-blue-500/5 to-purple-500/5">
          <div className="flex gap-2">
            <Input
              placeholder={models.length > 0 ? "Type your message..." : "Train a model first..."}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={sending || models.length === 0}
              className="bg-background"
            />
            <Button
              onClick={handleSendMessage}
              disabled={sending || !inputText.trim() || models.length === 0}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
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