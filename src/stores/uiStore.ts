import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UIState {
  sidebarOpen: boolean
  darkMode: boolean
  gridView: boolean
  editingNoteId: string | null
  labelManagerOpen: boolean
  importModalOpen: boolean
  toggleSidebar: () => void
  toggleDarkMode: () => void
  toggleGridView: () => void
  setEditingNoteId: (id: string | null) => void
  setLabelManagerOpen: (open: boolean) => void
  setImportModalOpen: (open: boolean) => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      darkMode: false,
      gridView: true,
      editingNoteId: null,
      labelManagerOpen: false,
      importModalOpen: false,

      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
      toggleGridView: () => set((state) => ({ gridView: !state.gridView })),
      setEditingNoteId: (id) => set({ editingNoteId: id }),
      setLabelManagerOpen: (open) => set({ labelManagerOpen: open }),
      setImportModalOpen: (open) => set({ importModalOpen: open }),
    }),
    {
      name: 'openkeep-ui',
      partialize: (state) => ({
        darkMode: state.darkMode,
        gridView: state.gridView,
        sidebarOpen: state.sidebarOpen,
      }),
    }
  )
)
