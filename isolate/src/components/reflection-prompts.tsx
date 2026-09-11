"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  reflectionPrompts,
  getCategories,
  getRandomPrompt,
  ReflectionPrompt,
} from "@/lib/reflection-prompts";
import { Lightbulb, RefreshCw, Sparkles } from "lucide-react";

interface ReflectionPromptsProps {
  onSelectPrompt?: (prompt: string) => void;
}

export function ReflectionPrompts({ onSelectPrompt }: ReflectionPromptsProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [currentPrompt, setCurrentPrompt] = useState<ReflectionPrompt>(
    getRandomPrompt()
  );

  const categories = getCategories();

  const filteredPrompts = selectedCategory
    ? reflectionPrompts.filter((p) => p.category === selectedCategory)
    : reflectionPrompts;

  function handleRefresh() {
    setCurrentPrompt(getRandomPrompt(selectedCategory || undefined));
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Lightbulb className="size-4 text-yellow-500" />
          Reflection Prompts
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Random Prompt */}
        <div className="rounded-lg bg-primary/5 p-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {currentPrompt.category}
              </p>
              <p className="mt-1 text-lg font-medium">{currentPrompt.prompt}</p>
              {currentPrompt.description && (
                <p className="mt-1 text-sm text-muted-foreground">
                  {currentPrompt.description}
                </p>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRefresh}
              className="shrink-0"
            >
              <RefreshCw className="size-4" />
            </Button>
          </div>
          {onSelectPrompt && (
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={() => onSelectPrompt(currentPrompt.prompt)}
            >
              <Sparkles className="size-4 mr-2" />
              Use this prompt
            </Button>
          )}
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedCategory === null ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(null)}
          >
            All
          </Button>
          {categories.map((cat) => (
            <Button
              key={cat}
              variant={selectedCategory === cat ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </Button>
          ))}
        </div>

        {/* Prompt List */}
        <div className="space-y-2 max-h-[300px] overflow-y-auto">
          {filteredPrompts.map((prompt) => (
            <div
              key={prompt.id}
              className="rounded-lg border p-3 hover:bg-muted/50 transition-colors cursor-pointer"
              onClick={() => {
                setCurrentPrompt(prompt);
                if (onSelectPrompt) {
                  onSelectPrompt(prompt.prompt);
                }
              }}
            >
              <p className="text-sm font-medium">{prompt.prompt}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-muted-foreground">
                  {prompt.category}
                </span>
                {prompt.description && (
                  <>
                    <span className="text-muted-foreground">·</span>
                    <span className="text-xs text-muted-foreground">
                      {prompt.description}
                    </span>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
