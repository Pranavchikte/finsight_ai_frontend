"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient";
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import axios from "axios"; // ADDED: For error handling

export function AiSummaryCard() {
  const [taskId, setTaskId] = useState<string | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false); // ADDED: Track generation state (FIX #24)

  useEffect(() => {
    if (!taskId) return;
    const interval = setInterval(async () => {
      try {
        const res = await api.get(`/ai/summary/result/${taskId}`);
        const { status, summary: resultSummary } = res.data.data;
        if (status === 'completed') {
          setSummary(resultSummary);
          setIsLoading(false);
          setIsGenerating(false); // ADDED: Unlock after completion (FIX #24)
          setTaskId(null);
          toast.success("AI summary generated successfully!");
          clearInterval(interval);
        } else if (status === 'failed') {
          setIsLoading(false);
          setIsGenerating(false); // ADDED: Unlock after failure (FIX #24)
          setTaskId(null);
          toast.error("Failed to generate summary. Please try again.");
          clearInterval(interval);
        }
      } catch (err) {
        console.error("Polling error:", err);
        toast.error("An error occurred while fetching the summary");
        setIsLoading(false);
        setIsGenerating(false); // ADDED: Unlock on polling error (FIX #24)
        setTaskId(null);
        clearInterval(interval);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [taskId]);

  const handleGenerateSummary = async () => {
    // ADDED: Prevent spam clicks (FIX #24)
    if (isGenerating) {
      return;
    }

    setIsLoading(true);
    setIsGenerating(true); // ADDED: Lock generation (FIX #24)
    setSummary(null);
    try {
      const res = await api.post("/ai/summary");
      setTaskId(res.data.data.task_id);
      toast.info("Generating AI summary...");
    } catch (err) {
      console.error("Failed to trigger summary generation:", err);
      // ADDED: Handle 429 rate limit specifically (FIX #24)
      if (axios.isAxiosError(err) && err.response?.status === 429) {
        toast.error("Summary generation already in progress. Please wait.");
      } else {
        toast.error("Could not start summary generation. Please try again later.");
      }
      setIsLoading(false);
      setIsGenerating(false); // ADDED: Unlock on error (FIX #24)
    }
  };

  return (
    <Card className="bg-card/50 backdrop-blur-sm border border-border/50 shadow-lg hover:shadow-xl transition-all duration-200">
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
        ) : summary ? (
          <div className="text-foreground/90 text-sm leading-relaxed p-4 bg-accent/20 rounded-lg border border-border/50">
            {summary}
          </div>
        ) : (
          <button
            onClick={handleGenerateSummary}
            disabled={isLoading || isGenerating} 
            className="w-full rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <HoverBorderGradient
              containerClassName="rounded-md w-full"
              as="div"
              className="dark:bg-black bg-white text-black dark:text-white flex items-center justify-center gap-2 w-full py-2 px-4"
            >
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-semibold">Generate AI Summary</span>
            </HoverBorderGradient>
          </button>
        )}
      </CardContent>
    </Card>
  );
}