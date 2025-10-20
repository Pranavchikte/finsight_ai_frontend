"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient";
import { Loader2, Sparkles, AlertTriangle } from "lucide-react";
import api from "@/lib/api";

export function AiSummaryCard() {
  const [taskId, setTaskId] = useState<string | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // The useEffect polling and handleGenerateSummary functions remain the same
  useEffect(() => {
    if (!taskId) return;
    const interval = setInterval(async () => {
      try {
        const res = await api.get(`/ai/summary/result/${taskId}`);
        const { status, summary: resultSummary } = res.data.data;
        if (status === 'completed') {
          setSummary(resultSummary);
          setIsLoading(false);
          setTaskId(null);
          clearInterval(interval);
        } else if (status === 'failed') {
          setError("Failed to generate summary. Please try again.");
          setIsLoading(false);
          setTaskId(null);
          clearInterval(interval);
        }
      } catch (err) {
        console.error("Polling error:", err);
        setError("An error occurred while fetching the summary.");
        setIsLoading(false);
        setTaskId(null);
        clearInterval(interval);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [taskId]);

  const handleGenerateSummary = async () => {
    setIsLoading(true);
    setError(null);
    setSummary(null);
    try {
      const res = await api.post("/ai/summary");
      setTaskId(res.data.data.task_id);
    } catch (err) {
      console.error("Failed to trigger summary generation:", err);
      setError("Could not start summary generation. Please try again later.");
      setIsLoading(false);
    }
  };


  return (
    <Card className="border-border/50 shadow-lg hover:shadow-primary/10 transition-shadow duration-300">
      <CardHeader>
        <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <CardTitle className="text-xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
              AI-Powered Summary
            </CardTitle>
        </div>
        <CardDescription>Get a quick summary of your spending over the last 30 days.</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-24 gap-4 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span>FinSight AI is analyzing your spending...</span>
          </div>
        ) : error ? (
          <div className="flex items-center gap-3 bg-destructive/10 text-destructive border border-destructive/20 p-3 rounded-lg text-sm">
              <AlertTriangle className="h-5 w-5" />
              <p>{error}</p>
          </div>
        ) : summary ? (
          <div className="text-foreground/90 text-sm leading-relaxed p-4 bg-accent/20 rounded-lg border border-border/50">
            {summary}
          </div>
        ) : (
          // --- THIS IS THE FIX ---
          // Wrap the HoverBorderGradient in a button element
          // Apply disabled and onClick to the wrapper button
          <button
            onClick={handleGenerateSummary}
            disabled={isLoading}
            className="w-full rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <HoverBorderGradient
              containerClassName="rounded-md w-full"
              as="div" // Render as a div, not a button
              className="dark:bg-black bg-white text-black dark:text-white flex items-center justify-center gap-2 w-full py-2 px-4"
            >
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-semibold">Generate AI Summary</span>
            </HoverBorderGradient>
          </button>
          // ------------------------
        )}
      </CardContent>
    </Card>
  );
}