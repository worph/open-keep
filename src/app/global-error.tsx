'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body>
        <div className="flex flex-col items-center justify-center min-h-screen">
          <h2 className="text-2xl mb-4">Something went wrong</h2>
          <button onClick={() => reset()} className="text-blue-500 hover:underline">
            Try again
          </button>
        </div>
      </body>
    </html>
  )
}
