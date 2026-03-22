import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-gray-400 dark:text-gray-500">
      <h2 className="text-2xl mb-4">Page Not Found</h2>
      <p className="mb-4">Could not find the requested page.</p>
      <Link href="/" className="text-blue-500 hover:underline">
        Go back home
      </Link>
    </div>
  )
}
