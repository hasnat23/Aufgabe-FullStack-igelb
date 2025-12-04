import { useState } from 'react'
import { Plus } from 'lucide-react'

interface AddWebsiteFormProps {
  onSubmit: (name: string, url: string) => Promise<void>
  loading?: boolean
}

export function AddWebsiteForm({ onSubmit, loading = false }: AddWebsiteFormProps) {
  const [name, setName] = useState('')
  const [url, setUrl] = useState('')
  const [error, setError] = useState('')

  const validateUrl = (urlStr: string): boolean => {
    try {
      new URL(urlStr)
      return true
    } catch {
      return false
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!name.trim() || !url.trim()) {
      setError('Name and URL are required')
      return
    }

    if (!validateUrl(url)) {
      setError('Invalid URL format')
      return
    }

    try {
      await onSubmit(name, url)
      setName('')
      setUrl('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add website')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Add New Website</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Website Name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Google Homepage"
            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
        </div>

        <div>
          <label htmlFor="url" className="block text-sm font-medium text-gray-700">
            URL
          </label>
          <input
            id="url"
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded-md font-medium hover:bg-blue-700 disabled:bg-gray-400 flex items-center justify-center gap-2"
        >
          <Plus size={18} />
          {loading ? 'Adding...' : 'Add Website'}
        </button>
      </div>
    </form>
  )
}
