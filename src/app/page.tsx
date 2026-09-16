import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowRight,
  Zap,
  Users,
  BarChart3,
  CheckCircle,
  Sparkles,
  KanbanSquare,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Clarix - AI Project Management",
  description:
    "Manage projects, collaborate with your team, and use AI to plan smarter. Built for modern teams.",
};

const FEATURES = [
  {
    icon: KanbanSquare,
    title: "Kanban Boards",
    description:
      "Drag-and-drop tasks across customizable boards. Visualize your workflow instantly.",
  },
  {
    icon: Sparkles,
    title: "AI Assistant",
    description:
      "Generate task descriptions, break down complex projects, and get AI-powered insights.",
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description:
      "Invite your team, assign tasks, and track progress together in real-time.",
  },
  {
    icon: BarChart3,
    title: "Analytics",
    description:
      "Track completion rates, identify bottlenecks, and make data-driven decisions.",
  },
  {
    icon: Zap,
    title: "Fast & Reliable",
    description:
      "Built with Next.js for blazing fast performance. Your data is always up to date.",
  },
  {
    icon: CheckCircle,
    title: "Role-Based Access",
    description:
      "Control who can do what. Owners, admins, and members each have the right permissions.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-primary rounded-md flex items-center justify-center">
              <span className="text-primary-foreground text-xs font-bold">
                C
              </span>
            </div>
            <span className="font-bold text-lg">Clarix</span>
          </div>

          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="#features"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Features
            </Link>
            <Link
              href="/login"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="text-sm px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-medium"
            >
              Get Started
            </Link>
          </nav>

          <div className="flex md:hidden items-center gap-3">
            <Link
              href="/login"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="text-sm px-3 py-1.5 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 font-medium"
            >
              Start Free
            </Link>
          </div>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-4 pt-20 pb-16 text-center">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6 max-w-3xl mx-auto leading-tight">
          Ship projects faster with{" "}
          <span className="text-primary">AI assistance</span>
        </h1>

        <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
          Clarix combines powerful project management with AI to help your team
          plan better, collaborate smarter, and deliver on time.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/register"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors text-sm"
          >
            Start for free
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center justify-center px-6 py-3 border rounded-lg font-medium hover:bg-accent transition-colors text-sm"
          >
            Sign in
          </Link>
        </div>

        <p className="text-xs text-muted-foreground mt-4">
          No credit card required
        </p>
      </section>

      <section id="features" className="max-w-6xl mx-auto px-4 py-16 border-t">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight mb-3">
            Everything your team needs
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            From task management to AI-powered planning, Clarix has all the
            tools to help your team succeed.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="p-5 border rounded-xl bg-card hover:border-primary/50 transition-colors group"
              >
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
                <h3 className="font-semibold mb-1.5">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-16 border-t">
        <div className="bg-primary rounded-2xl p-8 md:p-12 text-center text-primary-foreground">
          <h2 className="text-3xl font-bold mb-3">
            Ready to build something great?
          </h2>
          <p className="text-primary-foreground/80 mb-6 max-w-md mx-auto">
            Join teams already using Clarix to manage their projects smarter.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-6 py-3 bg-background text-foreground rounded-lg font-medium hover:bg-background/90 transition-colors text-sm"
          >
            Get started free
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <footer className="border-t">
        <div className="max-w-6xl mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-primary rounded flex items-center justify-center">
              <span className="text-primary-foreground text-xs font-bold">
                C
              </span>
            </div>
            <span className="text-sm font-medium">Clarix</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Built with Next.js, MongoDB, and AI
          </p>
        </div>
      </footer>
    </div>
  );
}
