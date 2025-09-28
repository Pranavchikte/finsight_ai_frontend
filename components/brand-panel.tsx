import { Brain, TrendingUp, Zap, Shield } from "lucide-react"

export function BrandPanel() {
  return (
    <div className="relative flex flex-col justify-center px-16 py-20 bg-background overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-40 h-40 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute top-60 right-16 w-32 h-32 bg-accent/15 rounded-lg rotate-45 blur-2xl animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute bottom-40 left-8 w-48 h-48 bg-secondary/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
        <div
          className="absolute bottom-20 right-20 w-24 h-24 bg-primary/25 rounded-lg rotate-12 blur-xl animate-pulse"
          style={{ animationDelay: "0.5s" }}
        ></div>

        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 600" fill="none">
          <path
            d="M50 100 L150 200 L100 300 L200 400 L150 500"
            stroke="currentColor"
            strokeWidth="1"
            className="text-muted-foreground/20"
            strokeDasharray="4 4"
          />
          <path
            d="M300 150 L350 250 L280 350 L320 450"
            stroke="currentColor"
            strokeWidth="1"
            className="text-primary/30"
            strokeDasharray="6 6"
          />
          <circle
            cx="200"
            cy="300"
            r="80"
            stroke="currentColor"
            strokeWidth="1"
            className="text-accent/20"
            strokeDasharray="8 8"
            fill="none"
          />
        </svg>
      </div>

      <div className="relative z-10 max-w-lg animate-slide-in-left">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
            <Brain className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-6xl font-bold text-foreground text-balance tracking-tight">FinSight AI</h1>
        </div>

        <p className="text-2xl text-muted-foreground leading-relaxed text-pretty mb-12 font-medium">
          Intelligent Expense Tracking, Simplified.
        </p>

        <div className="space-y-6">
          <div className="flex items-center gap-4 group">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300">
              <Brain className="h-5 w-5 text-primary" />
            </div>
            <span className="text-foreground font-semibold text-lg">AI-powered categorization</span>
          </div>
          <div className="flex items-center gap-4 group">
            <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center group-hover:bg-accent/20 transition-colors duration-300">
              <TrendingUp className="h-5 w-5 text-accent" />
            </div>
            <span className="text-foreground font-semibold text-lg">Real-time insights & analytics</span>
          </div>
          <div className="flex items-center gap-4 group">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300">
              <Zap className="h-5 w-5 text-primary" />
            </div>
            <span className="text-foreground font-semibold text-lg">Lightning-fast processing</span>
          </div>
          <div className="flex items-center gap-4 group">
            <div className="w-10 h-10 bg-secondary/10 rounded-xl flex items-center justify-center group-hover:bg-secondary/20 transition-colors duration-300">
              <Shield className="h-5 w-5 text-secondary" />
            </div>
            <span className="text-foreground font-semibold text-lg">Bank-level security</span>
          </div>
        </div>

        <div className="mt-16 p-6 bg-card/30 backdrop-blur-sm rounded-2xl border border-border/50">
          <p className="text-muted-foreground text-sm leading-relaxed">
            Join thousands of users who have transformed their financial tracking with intelligent automation.
          </p>
        </div>
      </div>
    </div>
  )
}
