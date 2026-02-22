import { create } from 'zustand'
import type { Label } from '@/types'

interface LabelState {
  labels: Label[]
  loading: boolean
  error: string | null
  fetchLabels: () => Promise<void>
  createLabel: (name: string) => Promise<Label | null>
  updateLabel: (id: string, name: string) => Promise<void>
  deleteLabel: (id: string) => Promise<void>
}

export const useLabelStore = create<LabelState>((set) => ({
  labels: [],
  loading: false,
  error: null,

  fetchLabels: async () => {
    set({ loading: true, error: null })
    try {
      const res = await fetch('/api/labels')
      if (!res.ok) throw new Error('Failed to fetch labels')
      const labels = await res.json()
      set({ labels, loading: false })
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
    }
  },

  createLabel: async (name) => {
    try {
      const res = await fetch('/api/labels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })
      if (!res.ok) throw new Error('Failed to create label')
      const label = await res.json()
      set((state) => ({ labels: [...state.labels, label] }))
      return label
    } catch (error) {
      set({ error: (error as Error).message })
      return null
    }
  },

  updateLabel: async (id, name) => {
    try {
      const res = await fetch(`/api/labels/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })
      if (!res.ok) throw new Error('Failed to update label')
      const updatedLabel = await res.json()
      set((state) => ({
        labels: state.labels.map((l) => (l.id === id ? updatedLabel : l)),
      }))
    } catch (error) {
      set({ error: (error as Error).message })
    }
  },

  deleteLabel: async (id) => {
    try {
      const res = await fetch(`/api/labels/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete label')
      set((state) => ({ labels: state.labels.filter((l) => l.id !== id) }))
    } catch (error) {
      set({ error: (error as Error).message })
    }
  },
}))
