import React, { Suspense } from 'react'
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { AgeGateModal } from '@/components/AgeGateModal'
import { Navbar } from '@/components/Navbar'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'DesiFantasy / VelvetTales | Adult Romance & Erotic Fantasy Stories',
  description:
    'An exclusive adult realm for fantasy, taboo romances, and provocative stories. Read, write, and create with community authors and state-of-the-art AI.',
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
      <body className="min-h-full flex flex-col bg-background text-foreground selection:bg-rose-600 selection:text-white">
        {/* Unclosable 18+ Age Verification Modal */}
        <AgeGateModal />

        {/* Global Navigation Bar wrapped in Suspense for Next 16 PPR */}
        <Suspense fallback={<NavbarSkeleton />}>
          <Navbar />
        </Suspense>

        {/* Page Content */}
        <div className="flex-1 flex flex-col">{children}</div>
      </body>
    </html>
  )
}
