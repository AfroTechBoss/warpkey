import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Providers } from "@/components/providers"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "WarpKey - Farcaster Mini App",
  description: "Secure wallet management and transaction signing for Farcaster users",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
  themeColor: "#000000",
  generator: 'v0.dev',
  manifest: '/manifest.json',
  icons: {
    icon: '/placeholder-logo.png',
    apple: '/placeholder-logo.png'
  },
  openGraph: {
    title: "WarpKey - Farcaster Mini App",
    description: "Secure wallet management and transaction signing for Farcaster users",
    images: ['/placeholder-logo.png']
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
