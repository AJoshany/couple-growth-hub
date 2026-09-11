"use client";

import { useState } from "react";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { GoalForm } from "@/components/goals/goal-form";
import { GoalTemplatePicker } from "@/components/goal-template-picker";
import { GoalTemplate } from "@/lib/goal-templates";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function NewGoalPage() {
  const [selectedTemplate, setSelectedTemplate] = useState<GoalTemplate | null>(null);

  if (selectedTemplate) {
    return (
      <div className="flex justify-center py-6">
        <div className="w-full max-w-2xl space-y-4">
          <Button
            variant="ghost"
            onClick={() => setSelectedTemplate(null)}
          >
            <ArrowLeft className="size-4 mr-2" />
            Back to templates
          </Button>
          <GoalForm mode="create" template={selectedTemplate} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 py-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Create Goal</h1>
          <p className="text-muted-foreground">
            Start from scratch or use a template
          </p>
        </div>
      </div>

      <GoalTemplatePicker onSelect={setSelectedTemplate} />

      <div className="flex justify-center">
        <GoalForm mode="create" />
      </div>
    </div>
  );
}
