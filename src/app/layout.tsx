import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "פלטפורמת לידים למשלוחים",
  description: "חיבור בין לקוחות המחפשים משלוח לבין ספקי שילוח מקומיים",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="he" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
