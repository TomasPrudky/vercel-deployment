import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Fantasy League Leaderboard | FPL & Serie A",
  description: "Kombinovaná tabulka fantasy ligy pro Premier League a Serie A (Tattico). Průběžné výsledky, statistiky a bodové rozdíly.",
  keywords: ["Fantasy Premier League", "FPL", "Serie A Fantasy", "Tattico", "Fantasy Leaderboard"],
  authors: [{ name: "Tomáš Prudký" }],
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "Fantasy League Leaderboard | FPL & Serie A",
    description: "Sleduj kombinované pořadí naší privátní fantasy ligy.",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}