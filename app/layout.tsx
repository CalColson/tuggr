import { Inter } from 'next/font/google'
import AuthProvider from './auth/AuthProvider'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : 'http://localhost:3000'


export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: 'tuggr',
  description: 'collaborative word-building fun',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider />
        {children}
      </body>
    </html>
  )
}
