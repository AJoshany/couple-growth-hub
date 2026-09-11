"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { LoadingSpinner } from "@/components/ui/loading";
import { toast } from "sonner";
import { sendLoveNote, getLoveNotes, markAllAsRead } from "@/app/actions/love-notes";
import { Heart, Send, Check, CheckCheck } from "lucide-react";

interface LoveNote {
  id: string;
  content: string;
  isRead: boolean;
  createdAt: Date;
  sender: {
    id: string;
    name: string;
  };
}

export function LoveNotesPageClient() {
  const [notes, setNotes] = useState<LoveNote[]>([]);
  const [newNote, setNewNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadNotes() {
      try {
        const data = await getLoveNotes();
        setNotes(data as LoveNote[]);
        // Mark all incoming notes as read
        await markAllAsRead();
      } catch {
        toast.error("Failed to load love notes");
      } finally {
        setLoading(false);
      }
    }
    loadNotes();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [notes]);

  async function handleSend() {
    if (!newNote.trim()) return;

    setSending(true);
    try {
      const result = await sendLoveNote(newNote);
      if (result?.error) {
        toast.error("Failed to send note");
      } else {
        setNewNote("");
        // Reload notes
        const data = await getLoveNotes();
        setNotes(data as LoveNote[]);
        toast.success("Love note sent! 💕");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSending(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="flex flex-col h-[calc(100dvh-8rem)] sm:h-[calc(100vh-8rem)]">
      <div className="mb-4">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Heart className="size-6 text-pink-500" fill="currentColor" />
          Love Notes
        </h1>
        <p className="text-muted-foreground">Send sweet messages to your partner</p>
      </div>

      <Card className="flex-1 flex flex-col min-h-0">
        <CardContent className="flex-1 flex flex-col p-2 sm:p-4 min-h-0">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto space-y-4 mb-4 scrollbar-slim">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <LoadingSpinner size="sm" />
              </div>
            ) : notes.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <Heart className="size-12 text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground">
                  No love notes yet. Send the first one!
                </p>
              </div>
            ) : (
              notes.map((note) => {
                const isMine = note.sender.id === "current"; // Will be replaced with actual user ID
                return (
                  <div
                    key={note.id}
                    className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                        isMine
                          ? "bg-primary text-primary-foreground rounded-br-md"
                          : "bg-muted rounded-bl-md"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{note.content}</p>
                      <div className={`flex items-center gap-1 mt-1 text-xs ${
                        isMine ? "text-primary-foreground/70" : "text-muted-foreground"
                      }`}>
                        <span>
                          {new Date(note.createdAt).toLocaleTimeString("en-US", {
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                        </span>
                        {isMine && (
                          note.isRead ? (
                            <CheckCheck className="size-3" />
                          ) : (
                            <Check className="size-3" />
                          )
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="flex gap-2 p-2 sm:p-0 border-t sm:border-t-0 bg-background sm:bg-transparent sticky bottom-0">
            <Textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Write a love note..."
              className="min-h-[44px] max-h-[120px] resize-none"
              rows={1}
            />
            <Button
              onClick={handleSend}
              disabled={!newNote.trim() || sending}
              size="icon"
              className="shrink-0 h-[44px] w-[44px]"
            >
              {sending ? (
                <LoadingSpinner size="xs" />
              ) : (
                <Send className="size-4" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
