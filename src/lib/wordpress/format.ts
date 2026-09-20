export function stripHtml(value = "") {
  return value.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}

export function calculateReadingTime(content = ""): string {
  const text = stripHtml(content);
  const words = text.split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / 200));
  return `${minutes} min read`;
}

export function formatIndianDate(dateString: string): string {
  try {
    return new Intl.DateTimeFormat("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date(dateString));
  } catch {
    return dateString;
  }
}

