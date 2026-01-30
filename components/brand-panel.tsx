import { Brain, TrendingUp, Zap, Shield } from "lucide-react"

export function BrandPanel() {
  return (
    <div className="relative flex flex-col justify-center px-8 md:px-16 py-12 md:py-20 bg-background overflow-hidden min-h-screen">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 opacity-5">
        {/* Gradient Orbs */}
        <div className="absolute top-20 left-20 w-64 h-64 bg-primary/30 rounded-full blur-[100px] animate-pulse"></div>
        <div
          className="absolute top-60 right-16 w-48 h-48 bg-ai-accent/20 rounded-full blur-[80px] animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute bottom-40 left-8 w-72 h-72 bg-success/15 rounded-full blur-[120px] animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
        
        {/* Grid Pattern */}
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
          opacity: 0.3
        }}></div>
      </div>

      <div className="relative z-10 max-w-xl animate-slide-in-left">
        {/* Logo & Title */}
        <div className="flex items-center gap-4 mb-10">
          <div className="relative group">
            <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-xl group-hover:bg-primary/30 transition-all duration-500"></div>
            <div className="relative w-16 h-16 bg-gradient-to-br from-primary/20 to-ai-accent/20 rounded-2xl flex items-center justify-center border border-primary/30">
              <Brain className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
            <span className="text-foreground">FinSight</span>
            {" "}
            <span className="text-gradient-ai">AI</span>
          </h1>
        </div>

        {/* Tagline */}
        <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed mb-14 font-medium">
          Intelligent Expense Tracking,{" "}
          <span className="text-foreground font-semibold">Simplified</span>.
        </p>

        {/* Features List */}
        <div className="space-y-5 mb-16">
          <div className="flex items-center gap-4 group cursor-default">
            <div className="relative">
              <div className="absolute inset-0 bg-ai-accent/10 rounded-xl blur-md group-hover:blur-lg transition-all duration-300"></div>
              <div className="relative w-12 h-12 bg-gradient-to-br from-ai-accent/10 to-purple-500/10 rounded-xl flex items-center justify-center border border-ai-accent/20 group-hover:border-ai-accent/40 transition-all duration-300">
                <Brain className="h-5 w-5 text-ai-accent" />
              </div>
            </div>
            <span className="text-foreground font-semibold text-lg group-hover:text-ai-accent transition-colors duration-300">
              AI-powered categorization
            </span>
          </div>

          <div className="flex items-center gap-4 group cursor-default">
            <div className="relative">
              <div className="absolute inset-0 bg-success/10 rounded-xl blur-md group-hover:blur-lg transition-all duration-300"></div>
              <div className="relative w-12 h-12 bg-gradient-to-br from-success/10 to-success/5 rounded-xl flex items-center justify-center border border-success/20 group-hover:border-success/40 transition-all duration-300">
                <TrendingUp className="h-5 w-5 text-success" />
              </div>
            </div>
            <span className="text-foreground font-semibold text-lg group-hover:text-success transition-colors duration-300">
              Real-time insights & analytics
            </span>
          </div>

          <div className="flex items-center gap-4 group cursor-default">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/10 rounded-xl blur-md group-hover:blur-lg transition-all duration-300"></div>
              <div className="relative w-12 h-12 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl flex items-center justify-center border border-primary/20 group-hover:border-primary/40 transition-all duration-300">
                <Zap className="h-5 w-5 text-primary" />
              </div>
            </div>
            <span className="text-foreground font-semibold text-lg group-hover:text-primary transition-colors duration-300">
              Lightning-fast processing
            </span>
          </div>

          <div className="flex items-center gap-4 group cursor-default">
            <div className="relative">
              <div className="absolute inset-0 bg-foreground/10 rounded-xl blur-md group-hover:blur-lg transition-all duration-300"></div>
              <div className="relative w-12 h-12 bg-gradient-to-br from-muted/50 to-muted/20 rounded-xl flex items-center justify-center border border-border/50 group-hover:border-border transition-all duration-300">
                <Shield className="h-5 w-5 text-foreground" />
              </div>
            </div>
            <span className="text-foreground font-semibold text-lg group-hover:text-foreground/80 transition-colors duration-300">
              Bank-level security
            </span>
          </div>
        </div>

        {/* Bottom Card */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-ai-accent/10 to-success/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500 opacity-50"></div>
          <div className="relative p-6 bg-card/40 backdrop-blur-md rounded-2xl border border-border/50 group-hover:border-border transition-all duration-300">
            <p className="text-muted-foreground text-sm leading-relaxed">
              Join thousands of users who have transformed their financial tracking with{" "}
              <span className="text-foreground font-semibold">intelligent automation</span>.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}