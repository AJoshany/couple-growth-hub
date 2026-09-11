export interface Anniversary {
  id: string;
  title: string;
  date: Date;
  type: "relationship" | "first_date" | "first_memory" | "custom";
  daysUntil: number;
  isPast: boolean;
}

export function calculateAnniversaries(
  startDate: Date | null,
  firstDate: Date | null,
  firstMemory: Date | null
): Anniversary[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const anniversaries: Anniversary[] = [];

  if (startDate) {
    const nextAnniversary = getNextAnniversary(startDate, today);
    anniversaries.push({
      id: "relationship",
      title: "Relationship Anniversary",
      date: nextAnniversary.date,
      type: "relationship",
      daysUntil: nextAnniversary.daysUntil,
      isPast: false,
    });
  }

  if (firstDate) {
    const nextAnniversary = getNextAnniversary(firstDate, today);
    anniversaries.push({
      id: "first-date",
      title: "First Date Anniversary",
      date: nextAnniversary.date,
      type: "first_date",
      daysUntil: nextAnniversary.daysUntil,
      isPast: false,
    });
  }

  if (firstMemory) {
    const nextAnniversary = getNextAnniversary(firstMemory, today);
    anniversaries.push({
      id: "first-memory",
      title: "First Memory Anniversary",
      date: nextAnniversary.date,
      type: "first_memory",
      daysUntil: nextAnniversary.daysUntil,
      isPast: false,
    });
  }

  return anniversaries.sort((a, b) => a.daysUntil - b.daysUntil);
}

function getNextAnniversary(date: Date, today: Date): { date: Date; daysUntil: number } {
  const anniversary = new Date(date);
  anniversary.setFullYear(today.getFullYear());

  if (anniversary < today) {
    anniversary.setFullYear(today.getFullYear() + 1);
  }

  const diffTime = anniversary.getTime() - today.getTime();
  const daysUntil = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return { date: anniversary, daysUntil };
}

export function getAnniversaryMessage(anniversary: Anniversary): string {
  const days = anniversary.daysUntil;

  if (days === 0) {
    return `🎉 Happy ${anniversary.title}! Today is the day!`;
  } else if (days === 1) {
    return `💕 Tomorrow is your ${anniversary.title}!`;
  } else if (days <= 7) {
    return `💝 Your ${anniversary.title} is in ${days} days!`;
  } else if (days <= 30) {
    return `📅 ${anniversary.title} in ${days} days`;
  } else {
    return `🗓️ ${anniversary.title} in ${days} days`;
  }
}

export function getYearsTogether(startDate: Date | null): number | null {
  if (!startDate) return null;

  const today = new Date();
  const start = new Date(startDate);

  let years = today.getFullYear() - start.getFullYear();
  const monthDiff = today.getMonth() - start.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < start.getDate())) {
    years--;
  }

  return years;
}

export function getMonthsTogether(startDate: Date | null): number | null {
  if (!startDate) return null;

  const today = new Date();
  const start = new Date(startDate);

  return (today.getFullYear() - start.getFullYear()) * 12 + (today.getMonth() - start.getMonth());
}
