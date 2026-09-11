"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading";
import { toast } from "sonner";
import {
  addReadingItem,
  getReadingList,
  updateReadingItem,
  deleteReadingItem,
  getReadingStats,
} from "@/app/actions/reading-list";
import { BookOpen, Plus, Trash2, Star, ExternalLink } from "lucide-react";

interface ReadingItem {
  id: string;
  title: string;
  author: string | null;
  type: string;
  status: string;
  rating: number | null;
  notes: string | null;
  url: string | null;
  createdAt: Date;
  addedBy: {
    id: string;
    name: string;
  };
}

interface ReadingStats {
  total: number;
  completed: number;
  reading: number;
  toRead: number;
  avgRating: number;
}

export function ReadingPageClient() {
  const [items, setItems] = useState<ReadingItem[]>([]);
  const [stats, setStats] = useState<ReadingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState({
    title: "",
    author: "",
    type: "BOOK",
    url: "",
  });
  const [creating, setCreating] = useState(false);
  const [filter, setFilter] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [listData, statsData] = await Promise.all([
        getReadingList(),
        getReadingStats(),
      ]);
      setItems(listData as ReadingItem[]);
      setStats(statsData);
    } catch {
      toast.error("Failed to load reading list");
    } finally {
      setLoading(false);
    }
  }

  async function handleAdd() {
    if (!newItem.title.trim()) return;

    setCreating(true);
    try {
      const result = await addReadingItem(newItem);
      if (result?.error) {
        toast.error("Failed to add item");
      } else {
        toast.success("Added to reading list!");
        setNewItem({ title: "", author: "", type: "BOOK", url: "" });
        setShowAddForm(false);
        await loadData();
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setCreating(false);
    }
  }

  async function handleStatusChange(itemId: string, status: string) {
    try {
      await updateReadingItem(itemId, { status });
      await loadData();
    } catch {
      toast.error("Failed to update status");
    }
  }

  async function handleRate(itemId: string, rating: number) {
    try {
      await updateReadingItem(itemId, { rating });
      await loadData();
    } catch {
      toast.error("Failed to update rating");
    }
  }

  async function handleDelete(itemId: string) {
    if (!confirm("Remove this item from your list?")) return;

    try {
      await deleteReadingItem(itemId);
      toast.success("Removed from list");
      await loadData();
    } catch {
      toast.error("Failed to delete item");
    }
  }

  const statusColors: Record<string, string> = {
    TO_READ: "bg-blue-100 text-blue-800",
    READING: "bg-yellow-100 text-yellow-800",
    COMPLETED: "bg-green-100 text-green-800",
    ABANDONED: "bg-gray-100 text-gray-800",
  };

  const typeIcons: Record<string, string> = {
    BOOK: "📚",
    ARTICLE: "📰",
    PODCAST: "🎙️",
    VIDEO: "🎬",
  };

  const filteredItems = filter
    ? items.filter((item) => item.status === filter)
    : items;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="md" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Reading List</h1>
          <p className="text-muted-foreground">
            Books, articles, and content to enjoy together
          </p>
        </div>
        <Button onClick={() => setShowAddForm(!showAddForm)} className="w-full sm:w-auto">
          <Plus className="size-4 mr-2" />
          Add Item
        </Button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-xs text-muted-foreground">Total</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-blue-600">{stats.toRead}</p>
              <p className="text-xs text-muted-foreground">To Read</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-yellow-600">{stats.reading}</p>
              <p className="text-xs text-muted-foreground">Reading</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
              <p className="text-xs text-muted-foreground">Completed</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Add Form */}
      {showAddForm && (
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={newItem.title}
                  onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                  placeholder="Book or article title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="author">Author (optional)</Label>
                <Input
                  id="author"
                  value={newItem.author}
                  onChange={(e) => setNewItem({ ...newItem, author: e.target.value })}
                  placeholder="Author name"
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <select
                  id="type"
                  value={newItem.type}
                  onChange={(e) => setNewItem({ ...newItem, type: e.target.value })}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                >
                  <option value="BOOK">📚 Book</option>
                  <option value="ARTICLE">📰 Article</option>
                  <option value="PODCAST">🎙️ Podcast</option>
                  <option value="VIDEO">🎬 Video</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="url">URL (optional)</Label>
                <Input
                  id="url"
                  value={newItem.url}
                  onChange={(e) => setNewItem({ ...newItem, url: e.target.value })}
                  placeholder="https://..."
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAdd} disabled={creating}>
                {creating ? <LoadingSpinner size="xs" /> : "Add to List"}
              </Button>
              <Button variant="ghost" onClick={() => setShowAddForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filter */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={filter === null ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter(null)}
        >
          All ({items.length})
        </Button>
        <Button
          variant={filter === "TO_READ" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("TO_READ")}
        >
          To Read ({items.filter((i) => i.status === "TO_READ").length})
        </Button>
        <Button
          variant={filter === "READING" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("READING")}
        >
          Reading ({items.filter((i) => i.status === "READING").length})
        </Button>
        <Button
          variant={filter === "COMPLETED" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("COMPLETED")}
        >
          Completed ({items.filter((i) => i.status === "COMPLETED").length})
        </Button>
      </div>

      {/* Items List */}
      {filteredItems.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <BookOpen className="size-12 mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground">
              {filter ? "No items with this status" : "Your reading list is empty. Add something to read together!"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredItems.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <span className="text-2xl shrink-0">{typeIcons[item.type] || "📚"}</span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium truncate">{item.title}</p>
                        {item.url && (
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-primary shrink-0"
                          >
                            <ExternalLink className="size-3" />
                          </a>
                        )}
                      </div>
                      {item.author && (
                        <p className="text-sm text-muted-foreground truncate">by {item.author}</p>
                      )}
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <Badge className={statusColors[item.status]}>
                          {item.status.replace("_", " ")}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {item.addedBy.name}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(item.id)}
                    className="shrink-0"
                  >
                    <Trash2 className="size-4 text-muted-foreground" />
                  </Button>
                </div>

                {/* Rating and Status - Mobile friendly */}
                <div className="mt-3 flex items-center justify-between gap-2 pt-3 border-t">
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => handleRate(item.id, star)}
                        className="text-muted-foreground hover:text-yellow-500"
                      >
                        <Star
                          className="size-4"
                          fill={item.rating && item.rating >= star ? "currentColor" : "none"}
                        />
                      </button>
                    ))}
                  </div>

                  <select
                    value={item.status}
                    onChange={(e) => handleStatusChange(item.id, e.target.value)}
                    className="h-8 rounded-md border border-input bg-transparent px-2 text-xs"
                  >
                    <option value="TO_READ">To Read</option>
                    <option value="READING">Reading</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="ABANDONED">Abandoned</option>
                  </select>
                </div>

                {item.notes && (
                  <p className="mt-3 text-sm text-muted-foreground">
                    {item.notes}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
