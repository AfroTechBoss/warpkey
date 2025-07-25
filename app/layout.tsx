import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { FarcasterProvider } from "@/contexts/FarcasterContext"
import { PrivyWalletProvider } from "@/contexts/PrivyContext"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "WarpKey - Farcaster Mini App",
  description: "Connect your Farcaster wallet and interact with dApps",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
  themeColor: "#7c3aed",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const privyAppId = process.env.NEXT_PUBLIC_PRIVY_APP_ID || 'clpispdty00ycl80fpueukbhl';

  return (
    <html lang="en">
      <body className={inter.className}>
        <PrivyWalletProvider appId={privyAppId}>
          <FarcasterProvider>
            {children}
          </FarcasterProvider>
        </PrivyWalletProvider>
      </body>
    </html>
  )
}
