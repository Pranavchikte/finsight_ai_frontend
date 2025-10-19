"use client"

import * as React from "react"
import { Label, Pie, PieChart } from "recharts"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

interface ChartData {
  category: string
  total: number
}

interface CategoryPieChartProps {
  data: ChartData[]
}

const CATEGORY_COLOR_MAP: { [key: string]: { light: string; dark: string } } = {
  "Food & Dining": { light: "oklch(0.645 0.246 16.439)", dark: "oklch(0.645 0.246 16.439)" }, // Vibrant Red
  Shopping: { light: "oklch(0.696 0.17 162.48)", dark: "oklch(0.696 0.17 162.48)" }, // Vibrant Cyan
  Transportation: { light: "oklch(0.769 0.188 70.08)", dark: "oklch(0.769 0.188 70.08)" }, // Vibrant Yellow
  Utilities: { light: "oklch(0.627 0.265 303.9)", dark: "oklch(0.627 0.265 303.9)" }, // Vibrant Magenta
  Entertainment: { light: "oklch(0.488 0.243 264.376)", dark: "oklch(0.488 0.243 264.376)" }, // Vibrant Violet
  Groceries: { light: "oklch(0.696 0.17 162.48)", dark: "oklch(0.696 0.17 162.48)" }, // Vibrant Cyan
  "Health & Wellness": { light: "oklch(0.488 0.243 264.376)", dark: "oklch(0.488 0.243 264.376)" }, // Vibrant Violet
  Travel: { light: "oklch(0.769 0.188 70.08)", dark: "oklch(0.769 0.188 70.08)" }, // Vibrant Yellow
  Other: { light: "oklch(0.627 0.265 303.9)", dark: "oklch(0.627 0.265 303.9)" }, // Vibrant Magenta
}

export function CategoryPieChart({ data }: CategoryPieChartProps) {
  const { chartData, chartConfig } = React.useMemo(() => {
    const config: ChartConfig = {}
    const processedData = data.map((item) => {
      const colorMapping = CATEGORY_COLOR_MAP[item.category]
      const color = colorMapping ? colorMapping.dark : "hsl(var(--chart-1))"
      const safeCategoryKey = item.category.replace(/[^a-zA-Z0-9]/g, "").toLowerCase()

      config[safeCategoryKey] = {
        label: item.category,
        color: color,
      }

      return {
        name: safeCategoryKey,
        value: item.total,
        fill: color,
        label: item.category,
      }
    })
    return { chartData: processedData, chartConfig: config }
  }, [data])

  const totalValue = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.value, 0)
  }, [chartData])

  if (!chartData || chartData.length === 0) {
    return (
      <Card className="flex flex-col h-full border-border/50 shadow-lg rounded-xl">
        <CardHeader>
          <CardTitle className="text-xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
            Spending by Category
          </CardTitle>
          <CardDescription>No spending data for this period.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center text-muted-foreground">
            Add transactions to see your spending breakdown.
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="flex flex-col h-full border-border/50 shadow-lg hover:shadow-xl hover:shadow-primary/20 transition-all duration-300 rounded-xl">
      <CardHeader className="items-center pb-0">
        <CardTitle className="text-xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
          Spending by Category
        </CardTitle>
        <CardDescription>Distribution for the selected period</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-4">
        <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[320px]">
          <PieChart>
            <defs>
              <filter id="pieGlow" height="150%" width="150%" x="-25%" y="-25%">
                <feGaussianBlur stdDeviation="6" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  className="border-border/50 shadow-xl bg-background/95 backdrop-blur-md rounded-lg"
                  formatter={(value, name) => (
                    <div key={name} className="flex items-center gap-2">
                      <div
                        className="h-3 w-3 shrink-0 rounded-full"
                        style={{ backgroundColor: chartConfig[name as keyof typeof chartConfig]?.color }}
                      />
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm text-muted-foreground">
                          {chartConfig[name as keyof typeof chartConfig]?.label}
                        </span>
                        <span className="font-bold text-foreground">₹{Number(value).toFixed(2)}</span>
                      </div>
                    </div>
                  )}
                  hideLabel
                />
              }
            />
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              innerRadius={70}
              outerRadius={100}
              strokeWidth={2}
              stroke="var(--color-background)"
              paddingAngle={4}
              filter="url(#pieGlow)"
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                        <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground text-3xl font-bold">
                          {`₹${totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                        </tspan>
                        <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 24} className="fill-muted-foreground text-sm">
                          Total
                        </tspan>
                      </text>
                    )
                  }
                }}
              />
            </Pie>

            <ChartLegend
              content={<ChartLegendContent nameKey="label" className="text-xs sm:text-sm pt-4" />}
              className="flex-wrap gap-x-6 gap-y-3 [&>*]:basis-auto"
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
