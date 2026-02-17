import type { Metadata } from "next";
import { Rubik, Heebo } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Providers from "@/components/Providers";

const rubik = Rubik({
  variable: "--font-rubik",
  subsets: ["hebrew", "latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const heebo = Heebo({
  variable: "--font-heebo",
  subsets: ["hebrew", "latin"],
  weight: ["300", "400", "500", "700", "900"],
});

export const metadata: Metadata = {
  title: "סטודיו דוריאן | כישרונות צעירים. שירותים אמיתיים.",
  description: "סטודיו דוריאן — יוזמת נוער יצירתית מתיכון החממה בהוד השרון. שירותים מקצועיים לעמותות ועסקים קטנים.",
  openGraph: {
    title: "סטודיו דוריאן",
    description: "כישרונות צעירים. שירותים אמיתיים. השפעה אמיתית.",
    locale: "he_IL",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl">
      <body className={`${rubik.variable} ${heebo.variable} antialiased`}>
        <Providers>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            {children}
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
