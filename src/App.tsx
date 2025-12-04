import { useState, useEffect } from 'react'
import { Globe } from 'lucide-react'
import { AddWebsiteForm, WebsiteItem, ErrorAlert } from './components'
import { fetchWebsites, createWebsite, triggerCrawl, getChangeHistory, deleteWebsite, APIError } from './api/client'
import type { Website, ChangeResponse } from './types'
import './App.css'

function App() {
  const [websites, setWebsites] = useState<Website[]>([])
  const [changes, setChanges] = useState<Record<string, ChangeResponse[]>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')
  const [crawlingId, setCrawlingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Load initial data
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      setError('')
      const sites = await fetchWebsites()
      setWebsites(sites)

      // Load change history for each website
      const changesMap: Record<string, ChangeResponse[]> = {}
      for (const site of sites) {
        try {
          changesMap[site.id] = await getChangeHistory(site.id)
        } catch (err) {
          console.warn(`Failed to load changes for ${site.id}`, err)
          changesMap[site.id] = []
        }
      }
      setChanges(changesMap)
    } catch (err) {
      const message = err instanceof APIError ? err.message : 'Failed to load data'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const handleAddWebsite = async (name: string, url: string) => {
    try {
      setError('')
      const newSite = await createWebsite({ name, url })
      setWebsites((prev) => [...prev, newSite])
      setChanges((prev) => ({ ...prev, [newSite.id]: [] }))
    } catch (err) {
      const message = err instanceof APIError ? err.message : 'Failed to add website'
      setError(message)
      throw err
    }
  }

  const handleCrawl = async (websiteId: string) => {
    try {
      setCrawlingId(websiteId)
      setError('')
      const result = await triggerCrawl(websiteId)

      if (!result.success) {
        throw new Error(result.error || 'Crawl failed')
      }

      // Reload change history
      try {
        const updatedChanges = await getChangeHistory(websiteId)
        setChanges((prev) => ({ ...prev, [websiteId]: updatedChanges }))
      } catch (err) {
        console.warn('Failed to reload change history', err)
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to crawl website'
      setError(message)
    } finally {
      setCrawlingId(null)
    }
  }

  const handleDelete = async (websiteId: string) => {
    try {
      setDeletingId(websiteId)
      setError('')
      await deleteWebsite(websiteId)
      setWebsites((prev) => prev.filter((s) => s.id !== websiteId))
      setChanges((prev) => {
        const updated = { ...prev }
        delete updated[websiteId]
        return updated
      })
    } catch (err) {
      const message = err instanceof APIError ? err.message : 'Failed to delete website'
      setError(message)
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-3">
          <Globe size={32} className="text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">Website Change Monitor</h1>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-6">
            <ErrorAlert
              message={error}
              onDismiss={() => setError('')}
            />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <AddWebsiteForm
              onSubmit={handleAddWebsite}
              loading={loading}
            />
          </div>

          <div className="lg:col-span-2">
            {loading ? (
              <div className="bg-white p-8 rounded-lg shadow-md text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                <p className="text-gray-600">Loading websites...</p>
              </div>
            ) : websites.length === 0 ? (
              <div className="bg-white p-8 rounded-lg shadow-md text-center">
                <p className="text-gray-600">No websites added yet. Add one to get started!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {websites.map((site) => (
                  <WebsiteItem
                    key={site.id}
                    website={site}
                    changes={changes[site.id] || []}
                    onCrawl={handleCrawl}
                    onDelete={handleDelete}
                    crawling={crawlingId === site.id}
                    deleting={deletingId === site.id}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
