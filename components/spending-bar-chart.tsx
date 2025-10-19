"use client"

import { TrendingUp } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface ChartData {
  date: string
  total: number
}

interface SpendingBarChartProps {
  data: ChartData[]
}

const chartConfig = {
  total: {
    label: "Spent",
    color: "oklch(0.488 0.243 264.376)", // Vibrant Violet
  },
} satisfies ChartConfig

export function SpendingBarChart({ data }: SpendingBarChartProps) {
  const totalSpend = data.reduce((acc, curr) => acc + curr.total, 0)

  if (!data || data.length === 0) {
    return (
      <Card className="border-border/50 shadow-lg rounded-xl">
        <CardHeader>
          <CardTitle className="text-xl font-bold bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
            Spending Trend
          </CardTitle>
          <CardDescription>No spending data for this period.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center text-muted-foreground">
            Add transactions to see your spending trend.
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-border/50 shadow-lg hover:shadow-xl hover:shadow-primary/20 transition-all duration-300 rounded-xl">
      <CardHeader>
        <CardTitle className="text-xl font-bold bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
          Spending Trend
        </CardTitle>
        <CardDescription>Daily spending for the selected period.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-80 w-full">
          <BarChart accessibilityLayer data={data} margin={{ top: 20 }}>
            <defs>
              <linearGradient id="barFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="oklch(0.488 0.243 264.376)" stopOpacity={0.95} />
                <stop offset="95%" stopColor="oklch(0.488 0.243 264.376)" stopOpacity={0.5} />
              </linearGradient>
              <filter id="barShadow" height="150%" width="150%" x="-25%" y="-25%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="2" />
              </filter>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString("en-US", { day: "numeric", month: "short", timeZone: "UTC" })
              }}
            />
            <YAxis
              tickFormatter={(value) => `₹${value / 1000}k`}
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              width={50}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
            />
            <ChartTooltip
              cursor={{ fill: "hsl(var(--accent))", opacity: 0.15 }}
              content={
                <ChartTooltipContent
                  className="border-border/50 shadow-xl bg-background/95 backdrop-blur-md rounded-lg"
                  labelFormatter={(label) =>
                    new Date(label).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      timeZone: "UTC",
                    })
                  }
                  formatter={(value, name) => (
                    <div key={name} className="flex flex-col gap-0.5">
                      <span className="font-bold text-lg text-foreground">₹{Number(value).toFixed(2)}</span>
                      <span className="text-sm text-muted-foreground">
                        {chartConfig[name as keyof typeof chartConfig]?.label}
                      </span>
                    </div>
                  )}
                />
              }
            />
            <Bar dataKey="total" fill="url(#barFill)" radius={[8, 8, 0, 0]} maxBarSize={45} filter="url(#barShadow)" />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-3 text-sm border-t border-border/50 pt-4 bg-accent/10 rounded-b-xl">
        <div className="flex gap-2 leading-none font-semibold w-full">
          <div className="px-4 py-2 rounded-lg bg-primary/15 text-primary border border-primary/30 flex-1 text-center">
            Total of ₹{totalSpend.toFixed(2)} spent this period
          </div>
        </div>
        <div className="text-muted-foreground leading-none flex items-center gap-2 pt-1">
          <TrendingUp className="h-4 w-4 text-primary" />
          Showing a summary of your daily expenses.
        </div>
      </CardFooter>
    </Card>
  )
}
