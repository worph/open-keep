export function cn(...inputs: (string | boolean | undefined | null)[]): string {
  return inputs.filter(Boolean).join(' ')
}

export const noteColors = [
  { id: 'default', name: 'Default', light: '#ffffff', dark: '#202124' },
  { id: 'red', name: 'Red', light: '#f28b82', dark: '#5c2b29' },
  { id: 'orange', name: 'Orange', light: '#fbbc04', dark: '#614a19' },
  { id: 'yellow', name: 'Yellow', light: '#fff475', dark: '#635d19' },
  { id: 'green', name: 'Green', light: '#ccff90', dark: '#345920' },
  { id: 'teal', name: 'Teal', light: '#a7ffeb', dark: '#16504b' },
  { id: 'blue', name: 'Blue', light: '#cbf0f8', dark: '#2d555e' },
  { id: 'darkblue', name: 'Dark Blue', light: '#aecbfa', dark: '#1e3a5f' },
  { id: 'purple', name: 'Purple', light: '#d7aefb', dark: '#42275e' },
  { id: 'pink', name: 'Pink', light: '#fdcfe8', dark: '#5b2245' },
  { id: 'brown', name: 'Brown', light: '#e6c9a8', dark: '#442f19' },
  { id: 'gray', name: 'Gray', light: '#e8eaed', dark: '#3c3f43' },
] as const

export function getNoteColor(colorId: string, isDark: boolean): string {
  const color = noteColors.find((c) => c.id === colorId)
  if (!color) return isDark ? '#202124' : '#ffffff'
  return isDark ? color.dark : color.light
}
