import { useState } from "react";
import { Trash2, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";
import type { Website, ChangeResponse } from "../types";

interface WebsiteItemProps {
  website: Website;
  changes: ChangeResponse[];
  onCrawl: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  crawling?: boolean;
  deleting?: boolean;
}

export function WebsiteItem({
  website,
  changes,
  onCrawl,
  onDelete,
  crawling = false,
  deleting = false,
}: WebsiteItemProps) {
  const [expanded, setExpanded] = useState(false);
  const lastChange = changes[0];

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition">
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">
              {website.name}
            </h3>
            <p className="text-sm text-gray-500 truncate">{website.url}</p>
            <p className="text-xs text-gray-400 mt-1">
              Hinzugefügt am{" "}
              {new Date(website.createdAt).toLocaleDateString("de-DE")}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onCrawl(website.id)}
              disabled={crawling || deleting}
              title="Starte Crawl"
              className="p-2 text-blue-600 hover:bg-blue-50 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw size={18} className={crawling ? "animate-spin" : ""} />
            </button>
            <button
              onClick={() => onDelete(website.id)}
              disabled={deleting || crawling}
              title="Website löschen"
              className="p-2 text-red-600 hover:bg-red-50 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>

        {lastChange && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-sm text-gray-600">
              <span className="font-medium">Letzte Überprüfung:</span>{" "}
              {new Date(lastChange.data.timestamp).toLocaleString("de-DE")}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              <span className="font-medium">Status:</span>{" "}
              <span
                className={
                  (lastChange.data.similarity ?? 1) > 0.95
                    ? "text-green-600"
                    : "text-orange-600"
                }
              >
                {lastChange.data.similarity
                  ? `${(lastChange.data.similarity * 100).toFixed(0)}% ähnlich`
                  : "Änderungen erkannt"}
              </span>
            </p>
          </div>
        )}

        {changes.length > 0 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-3 w-full flex items-center justify-between p-2 text-sm text-gray-600 hover:bg-gray-50 rounded"
          >
            <span>Verlauf anzeigen ({changes.length})</span>
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        )}
      </div>

      {expanded && changes.length > 0 && (
        <div className="border-t border-gray-200 bg-gray-50 p-4">
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {changes.map((change) => (
              <div
                key={change.id}
                className="bg-white p-3 rounded border border-gray-200 text-sm"
              >
                <p className="text-gray-500 mb-2">
                  {new Date(change.data.timestamp).toLocaleString("de-DE")}
                </p>
                <p className="text-gray-700 whitespace-pre-wrap max-h-48 overflow-y-auto">
                  {change.data.changes ||
                    "Keine Änderungsbeschreibung verfügbar"}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
