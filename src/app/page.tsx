import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Brain, Database, Zap, BarChart3, MessageSquare, Download, Settings, CheckCircle } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium mb-6">
                AI-Powered NLU + ML Platform
              </div>
              <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
                Build Intelligent Chatbots with
                <span className="text-primary"> Advanced NLU</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Train multiple ML models simultaneously, annotate data, and deploy production-ready chatbots powered by RASA and cutting-edge machine learning algorithms.
              </p>
              <div className="flex gap-4">
                <Link href="/register">
                  <Button size="lg" className="text-lg px-8">
                    Start Building Free
                  </Button>
                </Link>
                <Link href="#how-it-works">
                  <Button size="lg" variant="outline" className="text-lg px-8">
                    Learn More
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative">
              <Image
                src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/586a0e30-c7a5-438f-8c09-f250c2d77bab/generated_images/modern-futuristic-ai-neural-network-visu-645e3cbf-20251110154251.jpg"
                alt="AI Neural Network"
                width={800}
                height={600}
                className="rounded-2xl shadow-2xl"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Powerful Features</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to build, train, and deploy intelligent conversational AI
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="p-6 hover:shadow-lg transition">
              <Database className="w-12 h-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Dataset Management</h3>
              <p className="text-muted-foreground">
                Upload, view, and manage large CSV datasets with column selection and data preprocessing capabilities.
              </p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition">
              <Zap className="w-12 h-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Multi-Algorithm Training</h3>
              <p className="text-muted-foreground">
                Train 5-6 ML algorithms simultaneously including Random Forest, XGBoost, SVM, and more. Auto-select the best model.
              </p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition">
              <BarChart3 className="w-12 h-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Model Evaluation</h3>
              <p className="text-muted-foreground">
                Comprehensive metrics including accuracy, precision, recall, F1-score, confusion matrices, and training graphs.
              </p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition">
              <MessageSquare className="w-12 h-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">RASA NLU Integration</h3>
              <p className="text-muted-foreground">
                Built-in RASA support for intent recognition, entity extraction, and natural language understanding.
              </p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition">
              <Brain className="w-12 h-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">NLU Annotation Tool</h3>
              <p className="text-muted-foreground">
                Annotate training data with intents and entities using an intuitive interface for better model performance.
              </p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition">
              <Download className="w-12 h-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Model Export & Retrain</h3>
              <p className="text-muted-foreground">
                Download trained models as pickle or H5 files. Easily retrain with new data to improve accuracy.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              From data to deployment in four simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            <div className="relative">
              <Image
                src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/586a0e30-c7a5-438f-8c09-f250c2d77bab/generated_images/abstract-data-science-visualization-show-84e3f64b-20251110154250.jpg"
                alt="Data Science Visualization"
                width={600}
                height={400}
                className="rounded-xl shadow-xl"
              />
            </div>

            <div className="space-y-8">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                  1
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Create Workspace</h3>
                  <p className="text-muted-foreground">
                    Start by creating a new workspace for your project. Add a name and description to organize your chatbot development.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                  2
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Upload Dataset</h3>
                  <p className="text-muted-foreground">
                    Upload your CSV dataset. View, analyze, and select target columns for training. Our platform handles large datasets efficiently.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                  3
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Train Models</h3>
                  <p className="text-muted-foreground">
                    Train multiple ML algorithms simultaneously. The system automatically selects the best performing model based on accuracy metrics.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                  4
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Deploy & Test</h3>
                  <p className="text-muted-foreground">
                    Test your chatbot with the integrated NLU interface. Export models, retrain as needed, and deploy to production.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Workspace Preview */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Professional Workspace</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              A complete development environment for your NLU and ML projects
            </p>
          </div>

          <div className="max-w-6xl mx-auto">
            <Image
              src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/586a0e30-c7a5-438f-8c09-f250c2d77bab/generated_images/machine-learning-workspace-dashboard-moc-f1d7f9da-20251110154249.jpg"
              alt="Workspace Dashboard"
              width={1200}
              height={600}
              className="rounded-2xl shadow-2xl border border-border"
            />
          </div>

          <div className="grid md:grid-cols-3 gap-6 mt-12 max-w-4xl mx-auto">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold mb-1">Real-time Metrics</h4>
                <p className="text-sm text-muted-foreground">Monitor training progress and model performance in real-time</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold mb-1">Interactive Charts</h4>
                <p className="text-sm text-muted-foreground">Visualize confusion matrices, ROC curves, and training history</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold mb-1">Multi-Workspace</h4>
                <p className="text-sm text-muted-foreground">Manage multiple projects with isolated environments</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="bg-gradient-to-r from-primary to-primary/80 rounded-3xl p-12 md:p-16 text-center text-primary-foreground">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Build Your Chatbot?
            </h2>
            <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
              Join developers who are building the next generation of intelligent conversational AI
            </p>
            <Link href="/register">
              <Button size="lg" variant="secondary" className="text-lg px-8">
                Get Started Now - It's Free
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}