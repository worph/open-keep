'use client'

import { useEffect, useRef } from 'react'
import { Check } from 'lucide-react'
import { noteColors } from '@/lib/utils'
import { useUIStore } from '@/stores/uiStore'

interface ColorPickerProps {
  selectedColor: string
  onSelect: (color: string) => void
  onClose: () => void
}

export function ColorPicker({
  selectedColor,
  onSelect,
  onClose,
}: ColorPickerProps) {
  const ref = useRef<HTMLDivElement>(null)
  const { darkMode } = useUIStore()

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  return (
    <div
      ref={ref}
      className="absolute bottom-full left-0 mb-2 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 z-50"
    >
      <div className="grid grid-cols-4 gap-1">
        {noteColors.map((color) => (
          <button
            key={color.id}
            onClick={() => onSelect(color.id)}
            className="w-8 h-8 rounded-full border-2 flex items-center justify-center transition-transform hover:scale-110"
            style={{
              backgroundColor: darkMode ? color.dark : color.light,
              borderColor:
                selectedColor === color.id
                  ? '#1a73e8'
                  : darkMode
                  ? '#5f6368'
                  : '#dadce0',
            }}
            title={color.name}
          >
            {selectedColor === color.id && (
              <Check className="w-4 h-4 text-gray-700 dark:text-gray-200" />
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
