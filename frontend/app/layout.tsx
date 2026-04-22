import type { Metadata } from 'next'
import '@/styles/globals.css'

export const metadata: Metadata = {
  title: 'MedBridge AI — Consultation médicale multilingue',
  description:
    'POC de consultation médicale assistée par IA avec transcription et traduction automatique pour langues africaines et arabes.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="min-h-screen bg-surface-subtle" suppressHydrationWarning>{children}</body>
    </html>
  )
}
