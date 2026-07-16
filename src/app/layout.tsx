import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Gestión Interna",
  description: "Sistema de administración y control de documentos.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
