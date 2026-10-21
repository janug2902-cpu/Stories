import React, { Suspense } from 'react'
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { AgeGateModal } from '@/components/AgeGateModal'
import { Navbar } from '@/components/Navbar'
import { LanguageProvider } from '@/lib/language-context'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Kinkyomen | Adult Romance & Erotic Fantasy Stories',
  description:
    'An exclusive adult realm for fantasy, taboo romances, and provocative stories. Read, write, and personalize your own tales on Kinkyomen.',
  icons: {
    icon: [
      { url: '/logo.png', type: 'image/png' },
      { url: '/favicon.ico' },
    ],
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
}

function NavbarSkeleton() {
  return (
    <header className="sticky top-0 z-40 h-16 border-b border-zinc-800/80 bg-[#09090b]/85 backdrop-blur-xl" />
  )
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#09090b] text-foreground selection:bg-rose-600 selection:text-white relative">
        {/* Global Website Translucent Background Poster */}
        <div
          className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none"
          aria-hidden="true"
        >
          {/* Ambient Translucent Background Artwork */}
          <div
            className="absolute inset-0 bg-cover bg-top sm:bg-center bg-no-repeat opacity-40 sm:opacity-45 filter brightness-100 contrast-110"
            style={{
              backgroundImage: `url('/background.png')`,
              backgroundAttachment: 'fixed',
            }}
          />
          {/* Soft dark vignette & gradient overlay to preserve contrast and readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#09090b]/70 via-[#09090b]/25 to-[#09090b]/85" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,#09090b_85%)]" />
        </div>

        <LanguageProvider>
          {/* Unclosable 18+ Age Verification Modal */}
          <AgeGateModal />

          {/* Global Navigation Bar wrapped in Suspense for Next 16 PPR */}
          <Suspense fallback={<NavbarSkeleton />}>
            <Navbar />
          </Suspense>

          {/* Page Content */}
          <div className="relative z-10 flex-1 flex flex-col">{children}</div>
        </LanguageProvider>
      </body>
    </html>
  )
}
