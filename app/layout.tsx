import { type Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import { Geist, Geist_Mono } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import './globals.css'
import TopLoaderWrapper from '@/components/top-loader-wrapper' // Import here

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Exam Portal',
  description: 'Manage your exams',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
          {/* Add the wrapper here at the top of the body */}
          <TopLoaderWrapper />
          
          {children}
          
          <Toaster position="bottom-right" reverseOrder={false} />
        </body>
      </html>
    </ClerkProvider>
  )
}