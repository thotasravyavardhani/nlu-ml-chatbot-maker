"use client";

import Image from "next/image";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { Brain, Upload, Cpu, LineChart, MessageSquare, Tag, ArrowRight, CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";

export default function Home() {
  const { data: session } = useSession();
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Parallax Background Layers */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Base gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50/30 to-pink-50/20" />
        
        {/* Neural network pattern - subtle */}
        <div 
          className="absolute top-0 right-0 w-1/2 h-full opacity-10"
          style={{
            backgroundImage: `url('https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/586a0e30-c7a5-438f-8c09-f250c2d77bab/generated_images/abstract-technology-background-with-neur-9f595ec8-20251110172318.jpg')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            transform: `translateY(${scrollY * 0.15}px) scale(1.05)`,
          }}
        />

        {/* AI brain - bottom left */}
        <div 
          className="absolute bottom-0 left-0 w-1/3 h-2/3 opacity-8"
          style={{
            backgroundImage: `url('https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/586a0e30-c7a5-438f-8c09-f250c2d77bab/generated_images/abstract-artificial-intelligence-brain-n-872b5f5a-20251110172318.jpg')`,
            backgroundSize: 'cover',
            backgroundPosition: 'left bottom',
            transform: `translateY(${scrollY * -0.08}px)`,
          }}
        />
      </div>

      {/* Navigation */}
      <nav className="border-b border-border bg-white/80 backdrop-blur-xl sticky top-0 z-50 shadow-sm">
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
                  className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-all shadow-md hover:shadow-lg transform hover:scale-105"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="px-4 py-2 text-foreground font-medium hover:text-primary transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-all shadow-md hover:shadow-lg transform hover:scale-105"
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
      <section className="relative py-20 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8" style={{ animation: 'fadeInUp 0.8s ease-out' }}>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-foreground leading-tight">
                Build Intelligent{" "}
                <span className="text-primary bg-clip-text">NLU + ML</span>{" "}
                Chatbots
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Create, train, and deploy powerful Natural Language Understanding chatbots with advanced Machine Learning algorithms. All in one platform.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href={session?.user ? "/dashboard" : "/register"}
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  {session?.user ? "Go to Dashboard" : "Start Building"}
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <Link
                  href="#features"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white border-2 border-primary/20 rounded-xl font-semibold hover:border-primary/40 transition-all shadow-md hover:shadow-lg"
                >
                  Learn More
                </Link>
              </div>
            </div>
            <div className="relative" style={{ animation: 'fadeInUp 0.8s ease-out 0.2s both' }}>
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-3xl blur-3xl" />
              <Image
                src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/586a0e30-c7a5-438f-8c09-f250c2d77bab/generated_images/modern-ai-and-machine-learning-dashboard-a9b59c52-20251110154558.jpg"
                alt="NLU ML Platform Dashboard"
                width={800}
                height={600}
                className="rounded-3xl shadow-2xl relative z-10 border-4 border-white"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white/60 backdrop-blur-sm relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
              Powerful Features for AI Development
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to build, train, and deploy intelligent chatbots with state-of-the-art ML algorithms.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature cards with enhanced styling */}
            {[
              {
                title: "Workspace Management",
                icon: Brain,
                description: "Organize your projects with dedicated workspaces. Manage multiple chatbots and datasets efficiently.",
                image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/586a0e30-c7a5-438f-8c09-f250c2d77bab/generated_images/workspace-and-project-management-illustr-f847cbbe-20251110154558.jpg",
                gradient: "from-blue-500/10 to-cyan-500/10"
              },
              {
                title: "Smart Dataset Management",
                icon: Upload,
                description: "Upload CSV datasets, preview data, select columns, and prepare your training data with ease.",
                image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/586a0e30-c7a5-438f-8c09-f250c2d77bab/generated_images/professional-illustration-of-dataset-upl-52b41147-20251110154558.jpg",
                gradient: "from-purple-500/10 to-pink-500/10"
              },
              {
                title: "Multiple ML Algorithms",
                icon: Cpu,
                description: "Train with Random Forest, SVM, Logistic Regression, Decision Tree, KNN, and XGBoost. Auto-select the best model.",
                image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/586a0e30-c7a5-438f-8c09-f250c2d77bab/generated_images/machine-learning-model-training-visualiz-ab0f39a7-20251110154558.jpg",
                gradient: "from-green-500/10 to-emerald-500/10"
              },
              {
                title: "Advanced Model Evaluation",
                icon: LineChart,
                description: "Comprehensive metrics including accuracy, precision, recall, F1-score, and confusion matrix visualizations.",
                gradient: "from-orange-500/10 to-red-500/10"
              },
              {
                title: "RASA-Powered Chatbots",
                icon: MessageSquare,
                description: "Build conversational AI with RASA integration. Train and test your NLU models in real-time.",
                image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/586a0e30-c7a5-438f-8c09-f250c2d77bab/generated_images/ai-chatbot-and-nlu-training-interface-il-fb6e291f-20251110154559.jpg",
                gradient: "from-teal-500/10 to-cyan-500/10"
              },
              {
                title: "NLU Annotation Tool",
                icon: Tag,
                description: "Label intents and entities with an intuitive annotation interface. Improve your chatbot's understanding.",
                gradient: "from-pink-500/10 to-rose-500/10"
              },
            ].map((feature, index) => (
              <div 
                key={index}
                className="bg-white border-2 border-border rounded-2xl p-6 hover:shadow-2xl hover:border-primary/30 transition-all duration-300 group hover:-translate-y-2"
              >
                {feature.image && (
                  <div className="mb-4 overflow-hidden rounded-xl">
                    <Image
                      src={feature.image}
                      alt={feature.title}
                      width={400}
                      height={300}
                      className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                )}
                <div className={`inline-block p-3 rounded-xl bg-gradient-to-br ${feature.gradient} mb-4`}>
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
              How It Works
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Get started in minutes with our streamlined workflow
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { step: "1", title: "Create Workspace", description: "Sign up and create your first workspace to organize your projects" },
              { step: "2", title: "Upload Dataset", description: "Upload your CSV dataset and preview the data structure" },
              { step: "3", title: "Train Models", description: "Run multiple ML algorithms and automatically select the best performer" },
              { step: "4", title: "Deploy & Test", description: "Deploy your chatbot and test with real conversations" },
            ].map((item, index) => (
              <div key={index} className="text-center group">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-purple-600 text-white mb-4 shadow-lg group-hover:shadow-xl transition-all group-hover:scale-110">
                  <span className="text-3xl font-bold">{item.step}</span>
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">{item.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white/60 backdrop-blur-sm relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
                Why Choose Our Platform?
              </h2>
              <div className="space-y-4">
                {[
                  { title: "6+ ML Algorithms", description: "Compare and select the best performing model automatically" },
                  { title: "RASA Integration", description: "Industry-standard NLU framework for conversational AI" },
                  { title: "Model Export", description: "Download trained models as .pickle or .h5 files for deployment" },
                  { title: "Comprehensive Metrics", description: "Track accuracy, precision, recall, F1-score, and confusion matrices" },
                  { title: "Annotation Tools", description: "Label intents and entities to improve chatbot understanding" },
                  { title: "Retraining Support", description: "Continuously improve your models with new data" },
                ].map((benefit, index) => (
                  <div key={index} className="flex gap-4 p-4 rounded-xl hover:bg-white/80 transition-all">
                    <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-bold text-foreground mb-1">{benefit.title}</h3>
                      <p className="text-muted-foreground">{benefit.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-3xl blur-3xl" />
              <Image
                src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/586a0e30-c7a5-438f-8c09-f250c2d77bab/generated_images/machine-learning-model-training-visualiz-ab0f39a7-20251110154558.jpg"
                alt="Platform Benefits"
                width={600}
                height={500}
                className="rounded-3xl shadow-2xl relative z-10 border-4 border-white"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-gradient-to-r from-primary to-purple-600 rounded-3xl p-12 shadow-2xl">
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              Ready to Build Your AI Chatbot?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Join developers and teams using our platform to create intelligent conversational experiences.
            </p>
            <Link
              href={session?.user ? "/dashboard" : "/register"}
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary rounded-xl font-bold hover:bg-gray-50 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              {session?.user ? "Go to Dashboard" : "Get Started Free"}
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t-2 border-border py-12 relative z-10">
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
              <h3 className="font-bold text-foreground mb-4">Product</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#features" className="hover:text-primary transition-colors">Features</Link></li>
                <li><Link href="/dashboard" className="hover:text-primary transition-colors">Dashboard</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-foreground mb-4">Resources</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-primary transition-colors">Documentation</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Help Center</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-foreground mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-primary transition-colors">About</Link></li>
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