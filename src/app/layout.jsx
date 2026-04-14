import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer"
import Link from "next/link";
import { AuthProvider } from "@/lib/AuthContext"

export const metadata = {
  title: "Python 9ja",
  description: "Python 9ja Official Website",
};


export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Clash+Display:wght@600;700&family=Space+Grotesk:wght@300;400;500;600;700&family=Syne:wght@700;800&display=swap"
          rel="stylesheet"
        />
        <script src="/tailwind.cdn.js"></script>
      </head>
      <body>
      <AuthProvider>
        <Navbar />
        {children}
        <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}


