import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { AppStateProvider } from "@/providers/app-state-provider";
import type React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Invoice Heaven Calculator",
  description:
    "Calculate and manage monthly reimbursement calculations for InvoiceHeaven invoicing system. Track benefits, manage calculations, and generate formatted output strings.",
  keywords: [
    "invoice heaven",
    "reimbursement calculator",
    "benefit tracking",
    "expense management",
  ],
  authors: [{ name: "Jakub Reczko" }],
  creator: "Jakub Reczko",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
  ),
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Invoice Heaven Calculator",
    title: "Invoice Heaven Calculator",
    description:
      "Calculate and manage monthly reimbursement calculations for InvoiceHeaven invoicing system.",
  },
  twitter: {
    card: "summary",
    title: "Invoice Heaven Calculator",
    description:
      "Calculate and manage monthly reimbursement calculations for InvoiceHeaven invoicing system.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AppStateProvider>{children}</AppStateProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
