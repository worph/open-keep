import { Inter } from 'next/font/google'
import { ClientLayout } from '@/components/ClientLayout'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-white dark:bg-[#202124] min-h-screen`}>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  )
}
