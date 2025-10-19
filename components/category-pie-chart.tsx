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

const CATEGORY_COLOR_MAP: { [key: string]: string } = {
  "Food & Dining": "hsl(217 91% 60%)", // Bright Blue
  Shopping: "hsl(217 91% 50%)", // Medium Blue
  Transportation: "hsl(217 91% 40%)", // Dark Blue
  Utilities: "hsl(217 91% 70%)", // Light Blue
  Entertainment: "hsl(217 91% 55%)", // Blue variant
  Groceries: "hsl(217 91% 45%)", // Dark Blue variant
  "Health & Wellness": "hsl(217 91% 65%)", // Light Blue variant
  Travel: "hsl(217 91% 35%)", // Very Dark Blue
  Other: "hsl(217 91% 75%)", // Very Light Blue
}

export function CategoryPieChart({ data }: CategoryPieChartProps) {
  const { chartData, chartConfig } = React.useMemo(() => {
    const config: ChartConfig = {}
    const processedData = data.map((item) => {
      const color = CATEGORY_COLOR_MAP[item.category] || "hsl(217 91% 60%)"
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
          <CardTitle className="text-2xl font-bold">Spending by Category</CardTitle>
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
    <Card className="flex flex-col h-full border-border/50 shadow-lg rounded-xl">
      <CardHeader className="pb-4">
        <CardTitle className="text-2xl font-bold">Spending by Category</CardTitle>
        <CardDescription>Distribution of expenses across categories</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-4">
        <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[300px]">
          <PieChart>
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
                        <span className="font-bold text-foreground">₹{Number(value).toFixed(0)}</span>
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
              innerRadius={60}
              outerRadius={100}
              strokeWidth={2}
              stroke="hsl(var(--background))"
              paddingAngle={2}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                        <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground text-3xl font-bold">
                          {`₹${(totalValue / 1000).toFixed(1)}k`}
                        </tspan>
                        <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 24} className="fill-muted-foreground text-xs">
                          Total
                        </tspan>
                      </text>
                    )
                  }
                }}
              />
            </Pie>

            <ChartLegend
              content={<ChartLegendContent nameKey="label" className="text-xs pt-4" />}
              className="flex-wrap gap-x-4 gap-y-2 [&>*]:basis-auto justify-center"
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
