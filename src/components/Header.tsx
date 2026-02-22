'use client'

import {
  Menu,
  Search,
  RefreshCw,
  Grid,
  List,
  Moon,
  Sun,
} from 'lucide-react'
import { useUIStore } from '@/stores/uiStore'
import { useNoteStore } from '@/stores/noteStore'
import { SearchBar } from './SearchBar'

export function Header() {
  const { toggleSidebar, toggleDarkMode, toggleGridView, darkMode, gridView } =
    useUIStore()
  const { fetchNotes } = useNoteStore()

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-white dark:bg-[#202124] border-b border-gray-200 dark:border-gray-700 flex items-center px-4">
      <button
        onClick={toggleSidebar}
        className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
        aria-label="Toggle sidebar"
      >
        <Menu className="w-5 h-5 text-gray-600 dark:text-gray-300" />
      </button>

      <div className="flex items-center ml-2">
        <div className="w-10 h-10 bg-amber-400 rounded-lg flex items-center justify-center mr-2">
          <span className="text-white font-bold text-lg">K</span>
        </div>
        <span className="text-xl text-gray-700 dark:text-gray-200 font-normal hidden sm:block">
          OpenKeep
        </span>
      </div>

      <div className="flex-1 max-w-2xl mx-8">
        <SearchBar />
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={() => fetchNotes()}
          className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
          aria-label="Refresh"
        >
          <RefreshCw className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </button>

        <button
          onClick={toggleGridView}
          className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
          aria-label="Toggle view"
        >
          {gridView ? (
            <List className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          ) : (
            <Grid className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          )}
        </button>

        <button
          onClick={toggleDarkMode}
          className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
          aria-label="Toggle dark mode"
        >
          {darkMode ? (
            <Sun className="w-5 h-5 text-gray-300" />
          ) : (
            <Moon className="w-5 h-5 text-gray-600" />
          )}
        </button>
      </div>
    </header>
  )
}
