"use client";

import Image from "next/image";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { Brain, Upload, Cpu, LineChart, MessageSquare, Tag, ArrowRight, CheckCircle2 } from "lucide-react";

export default function Home() {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Brain className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold text-foreground">NLU ML Platform</span>
            </div>
            <div className="flex items-center gap-4">
              {session?.user ? (
                <Link
                  href="/dashboard"
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="px-4 py-2 text-foreground hover:text-primary transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/5 py-20 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                Build Intelligent{" "}
                <span className="text-primary">NLU + ML</span>{" "}
                Chatbots
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Create, train, and deploy powerful Natural Language Understanding chatbots with advanced Machine Learning algorithms. All in one platform.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href={session?.user ? "/dashboard" : "/register"}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
                >
                  {session?.user ? "Go to Dashboard" : "Start Building"}
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <Link
                  href="#features"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-border rounded-lg font-medium hover:bg-accent transition-colors"
                >
                  Learn More
                </Link>
              </div>
            </div>
            <div className="relative">
              <Image
                src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/586a0e30-c7a5-438f-8c09-f250c2d77bab/generated_images/modern-ai-and-machine-learning-dashboard-a9b59c52-20251110154558.jpg"
                alt="NLU ML Platform Dashboard"
                width={800}
                height={600}
                className="rounded-xl shadow-2xl"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Powerful Features for AI Development
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to build, train, and deploy intelligent chatbots with state-of-the-art ML algorithms.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1: Workspace Management */}
            <div className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div className="mb-4">
                <Image
                  src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/586a0e30-c7a5-438f-8c09-f250c2d77bab/generated_images/workspace-and-project-management-illustr-f847cbbe-20251110154558.jpg"
                  alt="Workspace Management"
                  width={400}
                  height={300}
                  className="rounded-lg w-full h-48 object-cover"
                />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2 flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                Workspace Management
              </h3>
              <p className="text-muted-foreground">
                Organize your projects with dedicated workspaces. Manage multiple chatbots and datasets efficiently.
              </p>
            </div>

            {/* Feature 2: Dataset Upload */}
            <div className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div className="mb-4">
                <Image
                  src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/586a0e30-c7a5-438f-8c09-f250c2d77bab/generated_images/professional-illustration-of-dataset-upl-52b41147-20251110154558.jpg"
                  alt="Dataset Upload"
                  width={400}
                  height={300}
                  className="rounded-lg w-full h-48 object-cover"
                />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2 flex items-center gap-2">
                <Upload className="h-5 w-5 text-primary" />
                Smart Dataset Management
              </h3>
              <p className="text-muted-foreground">
                Upload CSV datasets, preview data, select columns, and prepare your training data with ease.
              </p>
            </div>

            {/* Feature 3: ML Training */}
            <div className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div className="mb-4">
                <Image
                  src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/586a0e30-c7a5-438f-8c09-f250c2d77bab/generated_images/machine-learning-model-training-visualiz-ab0f39a7-20251110154558.jpg"
                  alt="ML Training"
                  width={400}
                  height={300}
                  className="rounded-lg w-full h-48 object-cover"
                />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2 flex items-center gap-2">
                <Cpu className="h-5 w-5 text-primary" />
                Multiple ML Algorithms
              </h3>
              <p className="text-muted-foreground">
                Train with Random Forest, SVM, Logistic Regression, Decision Tree, KNN, and XGBoost. Auto-select the best model.
              </p>
            </div>

            {/* Feature 4: Model Evaluation */}
            <div className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-semibold text-foreground mb-2 flex items-center gap-2">
                <LineChart className="h-5 w-5 text-primary" />
                Advanced Model Evaluation
              </h3>
              <p className="text-muted-foreground">
                Comprehensive metrics including accuracy, precision, recall, F1-score, and confusion matrix visualizations.
              </p>
            </div>

            {/* Feature 5: NLU Chatbot */}
            <div className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div className="mb-4">
                <Image
                  src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/586a0e30-c7a5-438f-8c09-f250c2d77bab/generated_images/ai-chatbot-and-nlu-training-interface-il-fb6e291f-20251110154559.jpg"
                  alt="NLU Chatbot"
                  width={400}
                  height={300}
                  className="rounded-lg w-full h-48 object-cover"
                />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2 flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                RASA-Powered Chatbots
              </h3>
              <p className="text-muted-foreground">
                Build conversational AI with RASA integration. Train and test your NLU models in real-time.
              </p>
            </div>

            {/* Feature 6: Annotation Tool */}
            <div className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-semibold text-foreground mb-2 flex items-center gap-2">
                <Tag className="h-5 w-5 text-primary" />
                NLU Annotation Tool
              </h3>
              <p className="text-muted-foreground">
                Label intents and entities with an intuitive annotation interface. Improve your chatbot's understanding.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gradient-to-br from-accent/5 via-background to-primary/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              How It Works
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Get started in minutes with our streamlined workflow
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4">
                <span className="text-2xl font-bold">1</span>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Create Workspace</h3>
              <p className="text-muted-foreground">
                Sign up and create your first workspace to organize your projects
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4">
                <span className="text-2xl font-bold">2</span>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Upload Dataset</h3>
              <p className="text-muted-foreground">
                Upload your CSV dataset and preview the data structure
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4">
                <span className="text-2xl font-bold">3</span>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Train Models</h3>
              <p className="text-muted-foreground">
                Run multiple ML algorithms and automatically select the best performer
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4">
                <span className="text-2xl font-bold">4</span>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Deploy & Test</h3>
              <p className="text-muted-foreground">
                Deploy your chatbot and test with real conversations
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">
                Why Choose Our Platform?
              </h2>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">6+ ML Algorithms</h3>
                    <p className="text-muted-foreground">Compare and select the best performing model automatically</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">RASA Integration</h3>
                    <p className="text-muted-foreground">Industry-standard NLU framework for conversational AI</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Model Export</h3>
                    <p className="text-muted-foreground">Download trained models as .pickle or .h5 files for deployment</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Comprehensive Metrics</h3>
                    <p className="text-muted-foreground">Track accuracy, precision, recall, F1-score, and confusion matrices</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Annotation Tools</h3>
                    <p className="text-muted-foreground">Label intents and entities to improve chatbot understanding</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Retraining Support</h3>
                    <p className="text-muted-foreground">Continuously improve your models with new data</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <Image
                src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/586a0e30-c7a5-438f-8c09-f250c2d77bab/generated_images/machine-learning-model-training-visualiz-ab0f39a7-20251110154558.jpg"
                alt="Platform Benefits"
                width={600}
                height={500}
                className="rounded-xl shadow-xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-primary/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-primary-foreground mb-4">
            Ready to Build Your AI Chatbot?
          </h2>
          <p className="text-xl text-primary-foreground/90 mb-8">
            Join developers and teams using our platform to create intelligent conversational experiences.
          </p>
          <Link
            href={session?.user ? "/dashboard" : "/register"}
            className="inline-flex items-center gap-2 px-8 py-4 bg-background text-foreground rounded-lg font-medium hover:bg-background/90 transition-colors shadow-lg"
          >
            {session?.user ? "Go to Dashboard" : "Get Started Free"}
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Brain className="h-6 w-6 text-primary" />
                <span className="font-bold text-foreground">NLU ML Platform</span>
              </div>
              <p className="text-muted-foreground text-sm">
                Build intelligent NLU chatbots with advanced Machine Learning
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-4">Product</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#features" className="hover:text-primary transition-colors">Features</Link></li>
                <li><Link href="/dashboard" className="hover:text-primary transition-colors">Dashboard</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Pricing</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-4">Resources</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-primary transition-colors">Documentation</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">API Reference</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Help Center</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-primary transition-colors">About</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Blog</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Contact</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2024 NLU ML Platform. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}