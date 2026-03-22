'use client'

import { useEffect } from 'react'
import { Header } from '@/components/Header'
import { Sidebar } from '@/components/Sidebar'
import { NoteEditor } from '@/components/NoteEditor'
import { LabelManager } from '@/components/LabelManager'
import { useUIStore } from '@/stores/uiStore'
import { useLabelStore } from '@/stores/labelStore'

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const { darkMode, sidebarOpen } = useUIStore()
  const { fetchLabels } = useLabelStore()

  useEffect(() => {
    fetchLabels()
  }, [fetchLabels])

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  return (
    <>
      <Header />
      <div className="flex pt-16">
        <Sidebar />
        <main
          className={`flex-1 transition-all duration-200 ${
            sidebarOpen ? 'ml-64' : 'ml-16'
          }`}
        >
          <div className="p-6">{children}</div>
        </main>
      </div>
      <NoteEditor />
      <LabelManager />
    </>
  )
}
