"use client";

import Image from "next/image";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { Brain, Upload, Cpu, LineChart, MessageSquare, Tag, ArrowRight, CheckCircle2, Zap, Shield, Sparkles } from "lucide-react";
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
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Enhanced Parallax Background - Better Positioning */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {/* Soft gradient base */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/80 via-purple-50/50 to-pink-50/30" />
        
        {/* Neural network - top right, better aligned */}
        <div 
          className="absolute -top-20 -right-20 w-[600px] h-[600px] opacity-[0.06]"
          style={{
            backgroundImage: `url('https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/586a0e30-c7a5-438f-8c09-f250c2d77bab/generated_images/abstract-technology-background-with-neur-9f595ec8-20251110172318.jpg')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            transform: `translateY(${scrollY * 0.12}px) rotate(15deg)`,
            borderRadius: '40%',
          }}
        />

        {/* AI brain - bottom left, properly positioned */}
        <div 
          className="absolute -bottom-32 -left-20 w-[500px] h-[500px] opacity-[0.05]"
          style={{
            backgroundImage: `url('https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/586a0e30-c7a5-438f-8c09-f250c2d77bab/generated_images/abstract-artificial-intelligence-brain-n-872b5f5a-20251110172318.jpg')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            transform: `translateY(${scrollY * -0.08}px)`,
            borderRadius: '40%',
          }}
        />

        {/* Decorative gradient orbs */}
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 left-1/3 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      {/* Navigation - Enhanced Contrast */}
      <nav className="border-b-2 border-gray-200 bg-white/95 backdrop-blur-xl sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl shadow-lg">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">NLU ML Platform</span>
            </div>
            <div className="flex items-center gap-4">
              {session?.user ? (
                <Link
                  href="/dashboard"
                  className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold hover:shadow-xl transition-all shadow-md transform hover:scale-105"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="px-5 py-2 text-gray-700 font-semibold hover:text-blue-600 transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold hover:shadow-xl transition-all shadow-md transform hover:scale-105"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - Enhanced Design */}
      <section className="relative py-16 sm:py-24 bg-white z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8" style={{ animation: 'fadeInUp 0.8s ease-out' }}>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border-2 border-blue-200 rounded-full">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-bold text-blue-700">AI-Powered Platform</span>
              </div>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-gray-900 leading-tight">
                Build Intelligent{" "}
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  NLU + ML
                </span>{" "}
                Chatbots
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed font-medium">
                Create, train, and deploy powerful Natural Language Understanding chatbots with advanced Machine Learning algorithms. All in one comprehensive platform.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href={session?.user ? "/dashboard" : "/register"}
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold hover:shadow-2xl transition-all shadow-lg transform hover:scale-105"
                >
                  {session?.user ? "Go to Dashboard" : "Start Building Free"}
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <Link
                  href="#features"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:border-blue-500 hover:text-blue-600 transition-all shadow-md hover:shadow-lg"
                >
                  Explore Features
                </Link>
              </div>
              
              {/* Trust indicators */}
              <div className="flex items-center gap-6 pt-4">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-amber-500" />
                  <span className="text-sm font-semibold text-gray-700">6+ ML Algorithms</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-green-500" />
                  <span className="text-sm font-semibold text-gray-700">RASA Powered</span>
                </div>
              </div>
            </div>
            
            <div className="relative" style={{ animation: 'fadeInUp 0.8s ease-out 0.2s both' }}>
              <div className="absolute -inset-4 bg-gradient-to-br from-blue-400/20 to-purple-500/20 rounded-3xl blur-2xl" />
              <div className="relative bg-white p-2 rounded-2xl shadow-2xl border-2 border-gray-200">
                <Image
                  src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/586a0e30-c7a5-438f-8c09-f250c2d77bab/generated_images/modern-ai-and-machine-learning-dashboard-a9b59c52-20251110154558.jpg"
                  alt="NLU ML Platform Dashboard"
                  width={800}
                  height={600}
                  className="rounded-xl w-full h-auto"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Enhanced Cards */}
      <section id="features" className="py-20 bg-gradient-to-b from-white to-gray-50 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-50 border-2 border-purple-200 rounded-full mb-4">
              <Cpu className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-bold text-purple-700">Powerful Features</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-4">
              Everything You Need for AI Development
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto font-medium">
              Build, train, and deploy intelligent chatbots with state-of-the-art ML algorithms and comprehensive tools.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Workspace Management",
                icon: Brain,
                description: "Organize your projects with dedicated workspaces. Manage multiple chatbots and datasets efficiently.",
                image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/586a0e30-c7a5-438f-8c09-f250c2d77bab/generated_images/workspace-and-project-management-illustr-f847cbbe-20251110154558.jpg",
                gradient: "from-blue-500 to-cyan-500",
                bgGradient: "from-blue-50 to-cyan-50"
              },
              {
                title: "Smart Dataset Management",
                icon: Upload,
                description: "Upload CSV datasets, preview data, select columns, and prepare your training data with ease.",
                image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/586a0e30-c7a5-438f-8c09-f250c2d77bab/generated_images/professional-illustration-of-dataset-upl-52b41147-20251110154558.jpg",
                gradient: "from-purple-500 to-pink-500",
                bgGradient: "from-purple-50 to-pink-50"
              },
              {
                title: "Multiple ML Algorithms",
                icon: Cpu,
                description: "Train with Random Forest, SVM, Logistic Regression, Decision Tree, KNN, and XGBoost. Auto-select the best model.",
                image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/586a0e30-c7a5-438f-8c09-f250c2d77bab/generated_images/machine-learning-model-training-visualiz-ab0f39a7-20251110154558.jpg",
                gradient: "from-green-500 to-emerald-500",
                bgGradient: "from-green-50 to-emerald-50"
              },
              {
                title: "Advanced Model Evaluation",
                icon: LineChart,
                description: "Comprehensive metrics including accuracy, precision, recall, F1-score, and confusion matrix visualizations.",
                gradient: "from-orange-500 to-red-500",
                bgGradient: "from-orange-50 to-red-50"
              },
              {
                title: "RASA-Powered Chatbots",
                icon: MessageSquare,
                description: "Build conversational AI with RASA integration. Train and test your NLU models in real-time.",
                image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/586a0e30-c7a5-438f-8c09-f250c2d77bab/generated_images/ai-chatbot-and-nlu-training-interface-il-fb6e291f-20251110154559.jpg",
                gradient: "from-teal-500 to-cyan-500",
                bgGradient: "from-teal-50 to-cyan-50"
              },
              {
                title: "NLU Annotation Tool",
                icon: Tag,
                description: "Label intents and entities with an intuitive annotation interface. Improve your chatbot's understanding.",
                gradient: "from-pink-500 to-rose-500",
                bgGradient: "from-pink-50 to-rose-50"
              },
            ].map((feature, index) => (
              <div 
                key={index}
                className="bg-white border-2 border-gray-200 rounded-2xl overflow-hidden hover:shadow-2xl hover:border-blue-300 transition-all duration-300 group hover:-translate-y-2"
              >
                {feature.image && (
                  <div className="overflow-hidden h-48 bg-gradient-to-br from-gray-50 to-gray-100">
                    <Image
                      src={feature.image}
                      alt={feature.title}
                      width={400}
                      height={300}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                )}
                <div className="p-6">
                  <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${feature.bgGradient} border-2 border-gray-200 mb-4`}>
                    <feature.icon className={`h-6 w-6 bg-gradient-to-r ${feature.gradient} bg-clip-text text-transparent`} style={{ WebkitTextFillColor: 'transparent', backgroundClip: 'text' }} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed font-medium">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 border-2 border-green-200 rounded-full mb-4">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span className="text-sm font-bold text-green-700">Simple Workflow</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto font-medium">
              Get started in minutes with our streamlined workflow
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { step: "1", title: "Create Workspace", description: "Sign up and create your first workspace to organize your projects", color: "from-blue-500 to-cyan-500" },
              { step: "2", title: "Upload Dataset", description: "Upload your CSV dataset and preview the data structure", color: "from-purple-500 to-pink-500" },
              { step: "3", title: "Train Models", description: "Run multiple ML algorithms and automatically select the best performer", color: "from-green-500 to-emerald-500" },
              { step: "4", title: "Deploy & Test", description: "Deploy your chatbot and test with real conversations", color: "from-orange-500 to-red-500" },
            ].map((item, index) => (
              <div key={index} className="text-center group">
                <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br ${item.color} text-white mb-6 shadow-xl group-hover:shadow-2xl transition-all group-hover:scale-110`}>
                  <span className="text-3xl font-extrabold">{item.step}</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-600 leading-relaxed font-medium">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border-2 border-blue-200 rounded-full mb-6">
                <Shield className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-bold text-blue-700">Premium Platform</span>
              </div>
              <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-8">
                Why Choose Our Platform?
              </h2>
              <div className="space-y-5">
                {[
                  { title: "6+ ML Algorithms", description: "Compare and select the best performing model automatically", icon: Cpu },
                  { title: "RASA Integration", description: "Industry-standard NLU framework for conversational AI", icon: MessageSquare },
                  { title: "Model Export", description: "Download trained models as .pickle or .h5 files for deployment", icon: Upload },
                  { title: "Comprehensive Metrics", description: "Track accuracy, precision, recall, F1-score, and confusion matrices", icon: LineChart },
                  { title: "Annotation Tools", description: "Label intents and entities to improve chatbot understanding", icon: Tag },
                  { title: "Retraining Support", description: "Continuously improve your models with new data", icon: Brain },
                ].map((benefit, index) => (
                  <div key={index} className="flex gap-4 p-5 rounded-xl bg-white border-2 border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200 rounded-xl flex items-center justify-center">
                        <benefit.icon className="w-6 h-6 text-blue-600" />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-gray-900 mb-1">{benefit.title}</h3>
                      <p className="text-gray-600 font-medium">{benefit.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative order-1 lg:order-2">
              <div className="absolute -inset-4 bg-gradient-to-br from-purple-400/20 to-pink-500/20 rounded-3xl blur-2xl" />
              <div className="relative bg-white p-2 rounded-2xl shadow-2xl border-2 border-gray-200">
                <Image
                  src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/586a0e30-c7a5-438f-8c09-f250c2d77bab/generated_images/machine-learning-model-training-visualiz-ab0f39a7-20251110154558.jpg"
                  alt="Platform Benefits"
                  width={600}
                  height={500}
                  className="rounded-xl w-full h-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white relative z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl" />
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnoiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLW9wYWNpdHk9Ii4xIi8+PC9nPjwvc3ZnPg==')] opacity-10" />
            <div className="relative p-12 text-center">
              <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-4">
                Ready to Build Your AI Chatbot?
              </h2>
              <p className="text-xl text-white/95 mb-8 font-medium max-w-2xl mx-auto">
                Join developers and teams using our platform to create intelligent conversational experiences.
              </p>
              <Link
                href={session?.user ? "/dashboard" : "/register"}
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-600 rounded-xl font-bold hover:bg-gray-50 transition-all shadow-2xl hover:shadow-xl transform hover:scale-105"
              >
                {session?.user ? "Go to Dashboard" : "Get Started Free"}
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t-2 border-gray-200 py-12 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl">
                  <Brain className="h-5 w-5 text-white" />
                </div>
                <span className="font-bold text-gray-900">NLU ML Platform</span>
              </div>
              <p className="text-gray-600 text-sm font-medium">
                Build intelligent NLU chatbots with advanced Machine Learning
              </p>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-4">Product</h3>
              <ul className="space-y-2 text-sm text-gray-600 font-medium">
                <li><Link href="#features" className="hover:text-blue-600 transition-colors">Features</Link></li>
                <li><Link href="/dashboard" className="hover:text-blue-600 transition-colors">Dashboard</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-4">Resources</h3>
              <ul className="space-y-2 text-sm text-gray-600 font-medium">
                <li><Link href="#" className="hover:text-blue-600 transition-colors">Documentation</Link></li>
                <li><Link href="#" className="hover:text-blue-600 transition-colors">Help Center</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-gray-600 font-medium">
                <li><Link href="#" className="hover:text-blue-600 transition-colors">About</Link></li>
                <li><Link href="#" className="hover:text-blue-600 transition-colors">Contact</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t-2 border-gray-200 pt-8 text-center text-sm text-gray-600 font-medium">
            <p>&copy; 2024 NLU ML Platform. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}