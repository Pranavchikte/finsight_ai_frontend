"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles, Zap } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import axios from "axios";
import { cn } from "@/lib/utils";

export function AiSummaryCard() {
  const [taskId, setTaskId] = useState<string | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (!taskId) return;
    const interval = setInterval(async () => {
      try {
        const res = await api.get(`/ai/summary/result/${taskId}`);
        const { status, summary: resultSummary } = res.data.data;
        if (status === 'completed') {
          setSummary(resultSummary);
          setIsLoading(false);
          setIsGenerating(false);
          setTaskId(null);
          toast.success("AI summary generated successfully!");
          clearInterval(interval);
        } else if (status === 'failed') {
          setIsLoading(false);
          setIsGenerating(false);
          setTaskId(null);
          toast.error("Failed to generate summary. Please try again.");
          clearInterval(interval);
        }
      } catch (err) {
        console.error("Polling error:", err);
        toast.error("An error occurred while fetching the summary");
        setIsLoading(false);
        setIsGenerating(false);
        setTaskId(null);
        clearInterval(interval);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [taskId]);

  const handleGenerateSummary = async () => {
    if (isGenerating) {
      return;
    }

    setIsLoading(true);
    setIsGenerating(true);
    setSummary(null);
    try {
      const res = await api.post("/ai/summary");
      setTaskId(res.data.data.task_id);
      toast.info("Generating AI summary...");
    } catch (err) {
      console.error("Failed to trigger summary generation:", err);
      if (axios.isAxiosError(err) && err.response?.status === 429) {
        toast.error("Summary generation already in progress. Please wait.");
      } else {
        toast.error("Could not start summary generation. Please try again later.");
      }
      setIsLoading(false);
      setIsGenerating(false);
    }
  };

  return (
    <Card className="relative overflow-hidden border-ai-accent/20 bg-card/80 backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:border-ai-accent/40">
      {/* Animated gradient border effect */}
      <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-ai-accent/10 via-purple-500/10 to-ai-accent/10 animate-shimmer" />
      </div>

      <CardHeader className="relative space-y-2">
        <div className="flex items-center gap-3">
          <div className={cn(
            "flex h-10 w-10 items-center justify-center rounded-lg transition-all duration-300",
            "bg-gradient-to-br from-ai-accent/20 to-purple-500/20",
            isLoading && "animate-pulse-glow"
          )}>
            <Sparkles className="h-5 w-5 text-ai-accent" />
          </div>
          <div>
            <CardTitle className="text-xl font-bold text-gradient-ai">
              AI-Powered Insights
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Analyze your spending patterns with AI
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="relative">
        {isLoading ? (
          /* Loading State */
          <div className="flex flex-col items-center justify-center py-12 gap-4 animate-fade-in">
            <div className="relative">
              <Loader2 className="h-10 w-10 animate-spin text-ai-accent" />
              <div className="absolute inset-0 h-10 w-10 rounded-full bg-ai-accent/20 animate-ping" />
            </div>
            <div className="text-center space-y-1">
              <p className="text-sm font-medium text-foreground">
                FinSight AI is analyzing your spending...
              </p>
              <p className="text-xs text-muted-foreground">
                This may take a few moments
              </p>
            </div>
          </div>
        ) : summary ? (
          /* Summary Display */
          <div className="space-y-4 animate-fade-in">
            <div className="relative p-5 bg-muted/30 rounded-lg border border-border/50 backdrop-blur-sm">
              <div className="absolute top-3 right-3">
                <Zap className="h-4 w-4 text-ai-accent" />
              </div>
              <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-line">
                {summary}
              </p>
            </div>
            
            <Button
              onClick={handleGenerateSummary}
              variant="outline"
              size="sm"
              disabled={isGenerating}
              className="w-full text-xs gap-2 border-ai-accent/30 hover:bg-ai-accent/10 hover:border-ai-accent/50 transition-all"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Regenerate Summary
            </Button>
          </div>
        ) : (
          /* Generate Button */
          <div className="space-y-3 animate-fade-in">
            <Button
              onClick={handleGenerateSummary}
              disabled={isLoading || isGenerating}
              className={cn(
                "w-full relative overflow-hidden group transition-all duration-300",
                "bg-gradient-to-r from-ai-accent to-purple-500 hover:shadow-lg hover:scale-105",
                "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              )}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-ai-accent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative flex items-center justify-center gap-2">
                <Sparkles className="h-4 w-4" />
                <span className="font-semibold">Generate AI Summary</span>
              </div>
            </Button>
            
            <p className="text-xs text-center text-muted-foreground">
              Get insights on your last 30 days of spending
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}