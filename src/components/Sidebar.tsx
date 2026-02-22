'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Lightbulb,
  Archive,
  Trash2,
  Tag,
  Edit,
} from 'lucide-react'
import { useUIStore } from '@/stores/uiStore'
import { useLabelStore } from '@/stores/labelStore'

export function Sidebar() {
  const pathname = usePathname()
  const { sidebarOpen, setLabelManagerOpen } = useUIStore()
  const { labels } = useLabelStore()

  const navItems = [
    { href: '/', icon: Lightbulb, label: 'Notes' },
    { href: '/archive', icon: Archive, label: 'Archive' },
    { href: '/trash', icon: Trash2, label: 'Trash' },
  ]

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <aside
      className={`fixed left-0 top-16 h-[calc(100vh-4rem)] bg-white dark:bg-[#202124] transition-all duration-200 z-40 overflow-hidden ${
        sidebarOpen ? 'w-64' : 'w-16'
      }`}
    >
      <nav className="py-2">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center h-12 px-6 mx-2 rounded-r-full transition-colors ${
              isActive(item.href)
                ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-900 dark:text-amber-200'
                : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span className="ml-5">{item.label}</span>}
          </Link>
        ))}

        <div className="border-t border-gray-200 dark:border-gray-700 my-2 mx-4" />

        <div
          className={`flex items-center justify-between h-12 px-6 mx-2 text-gray-500 dark:text-gray-400 ${
            sidebarOpen ? '' : 'hidden'
          }`}
        >
          <span className="text-sm font-medium">Labels</span>
          <button
            onClick={() => setLabelManagerOpen(true)}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            aria-label="Edit labels"
          >
            <Edit className="w-4 h-4" />
          </button>
        </div>

        {labels.map((label) => (
          <Link
            key={label.id}
            href={`/label/${label.id}`}
            className={`flex items-center h-12 px-6 mx-2 rounded-r-full transition-colors ${
              pathname === `/label/${label.id}`
                ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-900 dark:text-amber-200'
                : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            <Tag className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && (
              <span className="ml-5 truncate">{label.name}</span>
            )}
          </Link>
        ))}
      </nav>
    </aside>
  )
}
