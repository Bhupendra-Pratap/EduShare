import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string) {
  return new Intl.DateTimeFormat("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(date));
}

export function formatFileSize(bytes: number) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

export function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function roleColor(role: string) {
  switch (role) {
    case "ADMIN":
    case "SUPER_ADMIN":
      return "bg-purple-100 text-purple-800";
    case "TEACHER":
      return "bg-blue-100 text-blue-800";
    case "STUDENT":
      return "bg-green-100 text-green-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

export function verificationBadge(status: string) {
  switch (status) {
    case "APPROVED":
      return { color: "bg-emerald-100 text-emerald-800", label: "Verified" };
    case "PENDING":
      return { color: "bg-yellow-100 text-yellow-800", label: "Pending" };
    case "REJECTED":
      return { color: "bg-red-100 text-red-800", label: "Rejected" };
    default:
      return { color: "bg-gray-100 text-gray-800", label: status };
  }
}
