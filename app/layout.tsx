import "./globals.css";
import { ReactNode } from "react";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <title>Restaurant Reservation Agent</title>
        <meta
          name="description"
          content="Plan the perfect dining experience with an AI-powered reservation assistant."
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
