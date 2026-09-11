"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { goalTemplates, GoalTemplate } from "@/lib/goal-templates";
import { Sparkles, ArrowRight, Check } from "lucide-react";

interface GoalTemplatePickerProps {
  onSelect: (template: GoalTemplate) => void;
}

const categories = [
  { value: "CAREER", label: "Career", icon: "💼" },
  { value: "HEALTH", label: "Health", icon: "🏥" },
  { value: "FITNESS", label: "Fitness", icon: "💪" },
  { value: "FINANCE", label: "Finance", icon: "💰" },
  { value: "LEARNING", label: "Learning", icon: "📖" },
  { value: "PERSONAL", label: "Personal", icon: "🌟" },
];

export function GoalTemplatePicker({ onSelect }: GoalTemplatePickerProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredTemplates = selectedCategory
    ? goalTemplates.filter((t) => t.category === selectedCategory)
    : goalTemplates;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="size-4 text-primary" />
          Start from a Template
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
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
              key={cat.value}
              variant={selectedCategory === cat.value ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(cat.value)}
            >
              {cat.icon} {cat.label}
            </Button>
          ))}
        </div>

        {/* Templates Grid */}
        <div className="grid gap-3 sm:grid-cols-2">
          {filteredTemplates.map((template) => (
            <div
              key={template.id}
              className="group relative rounded-lg border p-4 transition-colors hover:border-primary hover:bg-primary/5"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{template.icon}</span>
                  <div>
                    <p className="font-medium">{template.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {template.description}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-3">
                <Badge variant="secondary" className="text-xs">
                  {template.category}
                </Badge>
              </div>

              <div className="mt-3 space-y-1">
                <p className="text-xs font-medium text-muted-foreground">
                  {template.milestones.length} milestones
                </p>
                <ul className="space-y-0.5">
                  {template.milestones.slice(0, 3).map((milestone, i) => (
                    <li
                      key={i}
                      className="flex items-center gap-1 text-xs text-muted-foreground"
                    >
                      <Check className="size-3" />
                      {milestone}
                    </li>
                  ))}
                  {template.milestones.length > 3 && (
                    <li className="text-xs text-muted-foreground">
                      +{template.milestones.length - 3} more
                    </li>
                  )}
                </ul>
              </div>

              <Button
                variant="ghost"
                size="sm"
                className="mt-3 w-full"
                onClick={() => onSelect(template)}
              >
                Use Template
                <ArrowRight className="size-4 ml-1" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
