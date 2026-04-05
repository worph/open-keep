'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Lightbulb,
  Archive,
  Trash2,
  Tag,
  Edit,
  Upload,
  Cpu,
  ChevronDown,
  ChevronRight,
  Copy,
  Check,
} from 'lucide-react'
import { useUIStore } from '@/stores/uiStore'
import { useLabelStore } from '@/stores/labelStore'

export function Sidebar() {
  const pathname = usePathname()
  const { sidebarOpen, setLabelManagerOpen, setImportModalOpen } = useUIStore()
  const { labels } = useLabelStore()
  const [mcpExpanded, setMcpExpanded] = useState(false)
  const [copied, setCopied] = useState(false)

  const mcpUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/api/mcp`
    : '/api/mcp'

  const copyMcpUrl = () => {
    navigator.clipboard.writeText(mcpUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

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
      <nav className="py-2 h-full overflow-y-auto overflow-x-hidden">
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

        <button
          onClick={() => setImportModalOpen(true)}
          className="flex items-center w-full h-12 px-6 mx-2 rounded-r-full transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
        >
          <Upload className="w-5 h-5 flex-shrink-0" />
          {sidebarOpen && <span className="ml-5">Import</span>}
        </button>

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

        <div className="border-t border-gray-200 dark:border-gray-700 my-2 mx-4" />

        <button
          onClick={() => setMcpExpanded(!mcpExpanded)}
          className="flex items-center w-full h-12 px-6 mx-2 rounded-r-full transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
        >
          <Cpu className="w-5 h-5 flex-shrink-0" />
          {sidebarOpen && (
            <>
              <span className="ml-5">MCP Integration</span>
              {mcpExpanded ? (
                <ChevronDown className="w-4 h-4 ml-auto" />
              ) : (
                <ChevronRight className="w-4 h-4 ml-auto" />
              )}
            </>
          )}
        </button>

        {mcpExpanded && sidebarOpen && (
          <div className="px-6 mx-2 py-3 text-xs text-gray-500 dark:text-gray-400 space-y-3">
            <p>
              Connect AI assistants to OpenKeep using the{' '}
              <a
                href="https://modelcontextprotocol.io"
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-600 dark:text-amber-400 underline"
              >
                Model Context Protocol
              </a>.
            </p>
            <div>
              <span className="font-medium text-gray-700 dark:text-gray-300">Endpoint:</span>
              <div className="mt-1 flex items-center gap-1">
                <code className="flex-1 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-[11px] break-all">
                  {mcpUrl}
                </code>
                <button
                  onClick={copyMcpUrl}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded flex-shrink-0"
                  aria-label="Copy MCP URL"
                >
                  {copied ? (
                    <Check className="w-3.5 h-3.5 text-green-500" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>
            <div>
              <span className="font-medium text-gray-700 dark:text-gray-300">Available tools:</span>
              <ul className="mt-1 space-y-0.5 list-disc list-inside text-gray-400 dark:text-gray-500">
                <li>list_notes, get_note</li>
                <li>create_note, update_note</li>
                <li>delete_note, archive_note</li>
                <li>trash_note</li>
                <li>list_labels, create_label</li>
                <li>delete_label</li>
              </ul>
            </div>
          </div>
        )}
      </nav>
    </aside>
  )
}
