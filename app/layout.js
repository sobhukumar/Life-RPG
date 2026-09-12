import { Rubik } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'

const rubik = Rubik({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-rubik',
})

export const metadata = {
  title: 'Neon Drift — Life RPG',
  description: 'Turn your daily missions into an arcade RPG. Level up your real life.',
  keywords: 'life rpg, productivity game, neon drift, tasks, gamification',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${rubik.variable} font-rubik bg-[#170f27] text-[#eaddff] overscroll-none`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
