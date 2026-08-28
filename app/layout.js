import { Wix_Madefor_Text, Wix_Madefor_Display } from "next/font/google";
import "./globals.css";
import ScrollToTop from "./components/ScrollToTop";

const wixText = Wix_Madefor_Text({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-wix-text",
});

const wixDisplay = Wix_Madefor_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-wix-display",
});

export const metadata = {
  title: "Sema - Cours de langue en ligne",
  description: "Apprends et pratique le lingala, le swahili, le tshiluba et le kikongo en ligne.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr" className={`${wixText.variable} ${wixDisplay.variable}`}>
      <body className="min-h-screen font-body">
        {children}
        <ScrollToTop />
      </body>
    </html>
  );
}
