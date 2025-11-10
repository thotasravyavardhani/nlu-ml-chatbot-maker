"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Brain, ArrowLeft, Save, Loader2 } from "lucide-react";

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const response = await fetch("/api/auth/me");
      if (response.ok) {
        const data = await response.json();
        setUser(data);
        setFullName(data.fullName || "");
        setEmail(data.email);
      }
    } catch (error) {
      console.error("Failed to fetch user:", error);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    // In a real app, this would call an update API
    setTimeout(() => {
      setSaving(false);
      setMessage("Settings saved successfully!");
      setTimeout(() => setMessage(""), 3000);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <Link href="/dashboard" className="flex items-center gap-2">
            <Brain className="w-8 h-8 text-primary" />
            <span className="font-bold text-xl">NLU Studio</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>

        <Card className="p-6">
          <form onSubmit={handleSave} className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">Account Information</h2>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="John Doe"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Email cannot be changed
                  </p>
                </div>
              </div>
            </div>

            {message && (
              <div className="bg-green-500/10 text-green-500 p-3 rounded-md text-sm">
                {message}
              </div>
            )}

            <Button type="submit" disabled={saving} className="w-full">
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </form>
        </Card>

        <Card className="p-6 mt-6">
          <h2 className="text-xl font-semibold mb-4">About NLU Studio</h2>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p><strong>Version:</strong> 1.0.0</p>
            <p><strong>Features:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Dataset Management with CSV upload</li>
              <li>Multi-Algorithm ML Training (6+ algorithms)</li>
              <li>Comprehensive Model Evaluation</li>
              <li>RASA NLU Integration</li>
              <li>Annotation Tools</li>
              <li>Model Export & Retraining</li>
            </ul>
          </div>
        </Card>
      </main>
    </div>
  );
}
