"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Calendar, MapPin } from "lucide-react";
import Link from "next/link";

interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  type: string;
  location: string | null;
  isCompleted: boolean;
}

export function CalendarPageClient() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadEvents() {
      try {
        const { getDateEvents } = await import("@/app/actions/dates");
        const data = await getDateEvents();
        setEvents(
          data.map((e) => ({
            id: e.id,
            title: e.title,
            date: new Date(e.date),
            type: e.type || "Other",
            location: e.location,
            isCompleted: e.isCompleted,
          }))
        );
      } catch {
        console.error("Failed to load events");
      } finally {
        setLoading(false);
      }
    }
    loadEvents();
  }, []);

  const daysInMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0
  ).getDate();

  const firstDayOfMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1
  ).getDay();

  const monthName = currentMonth.toLocaleString("default", { month: "long", year: "numeric" });

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const getEventsForDay = (day: number) => {
    return events.filter((event) => {
      const eventDate = new Date(event.date);
      return (
        eventDate.getDate() === day &&
        eventDate.getMonth() === currentMonth.getMonth() &&
        eventDate.getFullYear() === currentMonth.getFullYear()
      );
    });
  };

  const today = new Date();
  const isToday = (day: number) =>
    day === today.getDate() &&
    currentMonth.getMonth() === today.getMonth() &&
    currentMonth.getFullYear() === today.getFullYear();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Calendar</h1>
          <p className="text-muted-foreground">Your shared dates and activities</p>
        </div>
        <Link href="/dates/new">
          <Button className="w-full sm:w-auto">
            <Calendar className="size-4 mr-2" />
            Plan Date
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="icon" onClick={prevMonth}>
              <ChevronLeft className="size-4" />
            </Button>
            <CardTitle>{monthName}</CardTitle>
            <Button variant="ghost" size="icon" onClick={nextMonth}>
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-2 sm:p-6">
          <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
            {["S", "M", "T", "W", "T", "F", "S"].map((day, i) => (
              <div key={day} className="p-1 sm:p-2 text-center text-xs sm:text-sm font-medium text-muted-foreground">
                <span className="hidden sm:inline">{["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][i]}</span>
                <span className="sm:hidden">{day}</span>
              </div>
            ))}
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} className="p-1 sm:p-2" />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dayEvents = getEventsForDay(day);
              return (
                <div
                  key={day}
                  className={`min-h-[40px] sm:min-h-[80px] p-1 sm:p-2 rounded-lg border ${
                    isToday(day) ? "bg-primary/10 border-primary" : "hover:bg-muted/50"
                  }`}
                >
                  <span className={`text-xs sm:text-sm ${isToday(day) ? "font-bold text-primary" : ""}`}>
                    {day}
                  </span>
                  <div className="mt-0.5 sm:mt-1 space-y-0.5 sm:space-y-1 hidden sm:block">
                    {dayEvents.slice(0, 2).map((event) => (
                      <Link key={event.id} href={`/dates/${event.id}`}>
                        <div
                          className={`text-xs p-1 rounded truncate ${
                            event.isCompleted
                              ? "bg-green-100 text-green-800"
                              : "bg-primary/10 text-primary"
                          }`}
                        >
                          {event.title}
                        </div>
                      </Link>
                    ))}
                    {dayEvents.length > 2 && (
                      <span className="text-xs text-muted-foreground">
                        +{dayEvents.length - 2}
                      </span>
                    )}
                  </div>
                  {dayEvents.length > 0 && (
                    <div className="sm:hidden flex justify-center">
                      <span className="w-1 h-1 rounded-full bg-primary"></span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Events */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Upcoming Events</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : events.filter((e) => !e.isCompleted && new Date(e.date) > today).length === 0 ? (
            <p className="text-sm text-muted-foreground">No upcoming events</p>
          ) : (
            events
              .filter((e) => !e.isCompleted && new Date(e.date) > today)
              .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
              .slice(0, 5)
              .map((event) => (
                <Link key={event.id} href={`/dates/${event.id}`}>
                  <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <Calendar className="size-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{event.title}</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        {new Date(event.date).toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                    {event.location && (
                      <div className="hidden sm:flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="size-3" />
                        <span className="truncate max-w-[100px]">{event.location}</span>
                      </div>
                    )}
                  </div>
                </Link>
              ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
