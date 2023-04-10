import { ClerkProvider } from "@clerk/nextjs/app-beta";

import "./globals.css";

export const metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

// This is the root layout for the entire app, we wrap the ClerkProvider
// so that the Clerk provider is available to all pages.
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          <title>Next.js 13 with Clerk</title>
        </head>
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
