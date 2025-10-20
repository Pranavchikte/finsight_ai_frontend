"use client";

import { TrendingUp } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface ChartData {
  date: string;
  total: number;
}

interface SpendingBarChartProps {
  data: ChartData[];
}

const chartConfig = {
  total: {
    label: "Spent",
    color: "hsl(217 91% 60%)", // Modern blue
  },
} satisfies ChartConfig;

export function SpendingBarChart({ data }: SpendingBarChartProps) {
  const trendingUp =
    data.length > 1 && data[data.length - 1].total > data[0].total;

  if (!data || data.length === 0) {
    return (
      <Card className="border-border/50 shadow-lg rounded-xl">
        <CardHeader>
          <CardTitle className="text-xl font-bold">Spending Trend</CardTitle>
          <CardDescription>No spending data for this period.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center text-muted-foreground">
            Add transactions to see your spending trend.
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate percentage change, handling division by zero
  const firstDayTotal = data[0].total;
  const lastDayTotal = data[data.length - 1].total;
  const percentageChange =
    firstDayTotal > 0
      ? Math.abs(((lastDayTotal - firstDayTotal) / firstDayTotal) * 100)
      : lastDayTotal > 0
        ? 100
        : 0;

  return (
    <Card className="border-border/50 shadow-lg rounded-xl">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-2xl font-bold">Spending Trend</CardTitle>
            <CardDescription className="mt-1">
              {data.length > 0 &&
                `${data[0].date} - ${data[data.length - 1].date}`}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-6">
        <ChartContainer config={chartConfig} className="h-80 w-full">
          <BarChart
            accessibilityLayer
            data={data}
            margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="barFill" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor="hsl(217 91% 60%)"
                  stopOpacity={1}
                />
                <stop
                  offset="100%"
                  stopColor="hsl(217 91% 60%)"
                  stopOpacity={0.6}
                />
              </linearGradient>
            </defs>
            <CartesianGrid
              vertical={false}
              strokeDasharray="3 3"
              stroke="hsl(var(--border))"
              opacity={0.2}
            />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={12}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString("en-US", {
                  day: "numeric",
                  month: "short",
                  timeZone: "UTC",
                });
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
              cursor={{ fill: "hsl(217 91% 60%)", opacity: 0.1 }}
              content={
                <ChartTooltipContent
                  className="border-border/50 shadow-xl bg-background/95 backdrop-blur-md rounded-lg"
                  labelFormatter={(label) =>
                    new Date(label).toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      timeZone: "UTC",
                    })
                  }
                  formatter={(value) => (
                    <div className="flex flex-col gap-1">
                      <span className="font-semibold text-foreground">
                        ₹{Number(value).toFixed(0)}
                      </span>
                    </div>
                  )}
                />
              }
            />
            <Bar
              dataKey="total"
              fill="url(#barFill)"
              radius={[12, 12, 0, 0]}
              maxBarSize={50}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-3 text-sm border-t border-border/50 pt-4">
        <div className="flex items-center gap-2 font-semibold text-foreground">
          <TrendingUp
            className={`h-4 w-4 ${
              trendingUp ? "text-green-500" : "text-red-500"
            }`}
          />
          <span>
            {trendingUp ? "Trending up" : "Trending down"} by{" "}
            {percentageChange.toFixed(1)}% this period
          </span>
        </div>
        <p className="text-muted-foreground">
          Showing total spending for the last {data.length} days
        </p>
      </CardFooter>
    </Card>
  );
}