import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { StorageInitializer } from "@/components/providers/StorageInitializer";
import { Toaster } from "@/components/ui/Toaster";

const inter = Inter({ subsets: ["latin"] });
const poppins = Poppins({ 
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins"
});

export const metadata: Metadata = {
  title: "Dairy Sustainability Reporting Hub",
  description: "A comprehensive platform for dairy sustainability reporting and management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} ${poppins.variable} h-full gradient-bg`}>
        <AuthProvider>
          <StorageInitializer />
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
