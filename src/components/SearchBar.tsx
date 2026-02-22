'use client'

import { useState, useEffect, useCallback } from 'react'
import { Search, X } from 'lucide-react'
import { useNoteStore } from '@/stores/noteStore'

export function SearchBar() {
  const { searchQuery, setSearchQuery, fetchNotes } = useNoteStore()
  const [localQuery, setLocalQuery] = useState(searchQuery)

  const debouncedSearch = useCallback(
    debounce((query: string) => {
      setSearchQuery(query)
      fetchNotes()
    }, 300),
    [setSearchQuery, fetchNotes]
  )

  useEffect(() => {
    debouncedSearch(localQuery)
  }, [localQuery, debouncedSearch])

  const handleClear = () => {
    setLocalQuery('')
    setSearchQuery('')
    fetchNotes()
  }

  return (
    <div className="relative flex items-center w-full">
      <div className="absolute left-3">
        <Search className="w-5 h-5 text-gray-400" />
      </div>
      <input
        type="text"
        placeholder="Search"
        value={localQuery}
        onChange={(e) => setLocalQuery(e.target.value)}
        className="w-full pl-10 pr-10 py-3 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-700 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 outline-none focus:bg-white dark:focus:bg-gray-600 focus:shadow-md transition-all"
      />
      {localQuery && (
        <button
          onClick={handleClear}
          className="absolute right-3 p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full"
        >
          <X className="w-4 h-4 text-gray-500" />
        </button>
      )}
    </div>
  )
}

function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}
