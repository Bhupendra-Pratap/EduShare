import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "EduShare", template: "%s | EduShare" },
  description: "Verified academic note-sharing platform for students and teachers",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-body antialiased">
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              fontFamily: "var(--font-outfit)",
              fontSize: "14px",
              borderRadius: "12px",
              boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
            },
          }}
        />
      </body>
    </html>
  );
}
