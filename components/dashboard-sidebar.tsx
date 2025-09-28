// components/dashboard-sidebar.tsx
import { BarChart3, LayoutDashboard, ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import clsx from "clsx"

interface DashboardSidebarProps {
  isCollapsed: boolean;
  toggleSidebar: () => void;
}

export function DashboardSidebar({ isCollapsed, toggleSidebar }: DashboardSidebarProps) {
  return (
    <div
      className={clsx(
        "bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-300 ease-in-out",
        isCollapsed ? "w-20" : "w-72"
      )}
    >
      {/* Brand/Logo Section */}
      <div className="p-4 border-b border-sidebar-border flex items-center justify-center h-20">
        <h1
          className={clsx(
            "font-bold text-sidebar-foreground tracking-tight transition-all duration-300",
            isCollapsed ? "text-xl" : "text-3xl"
          )}
        >
          {isCollapsed ? "F" : "FinSight AI"}
        </h1>
      </div>

      {/* Navigation Section */}
      <nav className="flex-1 p-4 space-y-2">
        <Button
          variant="ghost"
          className="w-full justify-start gap-4 h-12 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground nav-item rounded-xl font-medium"
        >
          <LayoutDashboard className="h-5 w-5" />
          {!isCollapsed && "Dashboard"}
        </Button>

        <Button
          variant="ghost"
          className="w-full justify-start gap-4 h-12 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground nav-item rounded-xl font-medium"
        >
          <BarChart3 className="h-5 w-5" />
          {!isCollapsed && "Analytics"}
        </Button>
      </nav>

      {/* Toggle Button Section */}
      <div className="p-4 border-t border-sidebar-border">
        <Button 
          variant="ghost" 
          onClick={toggleSidebar} 
          className="w-full justify-center h-12 text-sidebar-foreground hover:bg-sidebar-accent"
        >
          <ChevronLeft
            className={clsx(
              "h-6 w-6 transition-transform duration-300",
              isCollapsed && "rotate-180"
            )}
          />
        </Button>
      </div>
    </div>
  )
}