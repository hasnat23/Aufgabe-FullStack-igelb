import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { Globe } from "lucide-react";
import { AddWebsiteForm, WebsiteItem, ErrorAlert } from "./components";
import { fetchWebsites, createWebsite, triggerCrawl, getChangeHistory, deleteWebsite, APIError, } from "./api/client";
import "./App.css";
function App() {
    const [websites, setWebsites] = useState([]);
    const [changes, setChanges] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [crawlingId, setCrawlingId] = useState(null);
    const [deletingId, setDeletingId] = useState(null);
    // Lade anfängliche Daten
    useEffect(() => {
        loadData();
    }, []);
    // Lade alle Websites und deren Änderungsverlauf
    const loadData = async () => {
        try {
            setLoading(true);
            setError("");
            const sites = await fetchWebsites();
            setWebsites(sites);
            // Lade Änderungsverlauf für jede Website
            const changesMap = {};
            for (const site of sites) {
                try {
                    changesMap[site.id] = await getChangeHistory(site.id);
                }
                catch (err) {
                    console.warn(`Fehler beim Laden von Änderungen für ${site.id}`, err);
                    changesMap[site.id] = [];
                }
            }
            setChanges(changesMap);
        }
        catch (err) {
            const message = err instanceof APIError ? err.message : "Fehler beim Laden der Daten";
            setError(message);
        }
        finally {
            setLoading(false);
        }
    };
    // Verarbeite das Hinzufügen einer neuen Website
    const handleAddWebsite = async (name, url) => {
        try {
            setError("");
            const newSite = await createWebsite({ name, url });
            setWebsites((prev) => [...prev, newSite]);
            setChanges((prev) => ({ ...prev, [newSite.id]: [] }));
        }
        catch (err) {
            const message = err instanceof APIError
                ? err.message
                : "Fehler beim Hinzufügen der Website";
            setError(message);
            throw err;
        }
    };
    // Starte einen Crawl einer Website
    const handleCrawl = async (websiteId) => {
        try {
            setCrawlingId(websiteId);
            setError("");
            const result = await triggerCrawl(websiteId);
            if (!result.success) {
                throw new Error(result.error || "Crawl fehlgeschlagen");
            }
            // Aktualisiere Änderungsverlauf nach dem Crawl
            try {
                const updatedChanges = await getChangeHistory(websiteId);
                setChanges((prev) => ({ ...prev, [websiteId]: updatedChanges }));
            }
            catch (err) {
                console.warn("Fehler beim Neuladen des Änderungsverlaufs", err);
            }
        }
        catch (err) {
            const message = err instanceof Error ? err.message : "Fehler beim Crawl der Website";
            setError(message);
        }
        finally {
            setCrawlingId(null);
        }
    };
    // Lösche eine Website aus der Überwachung
    const handleDelete = async (websiteId) => {
        try {
            setDeletingId(websiteId);
            setError("");
            await deleteWebsite(websiteId);
            setWebsites((prev) => prev.filter((s) => s.id !== websiteId));
            setChanges((prev) => {
                const updated = { ...prev };
                delete updated[websiteId];
                return updated;
            });
        }
        catch (err) {
            const message = err instanceof APIError
                ? err.message
                : "Fehler beim Löschen der Website";
            setError(message);
        }
        finally {
            setDeletingId(null);
        }
    };
    return (_jsxs("div", { className: "min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100", children: [_jsx("header", { className: "bg-white shadow-sm sticky top-0 z-10", children: _jsxs("div", { className: "max-w-6xl mx-auto px-4 py-4 flex items-center gap-3", children: [_jsx(Globe, { size: 32, className: "text-blue-600" }), _jsx("h1", { className: "text-3xl font-bold text-gray-900", children: "Website-\u00C4nderungs-Monitor" })] }) }), _jsxs("main", { className: "max-w-6xl mx-auto px-4 py-8", children: [error && (_jsx("div", { className: "mb-6", children: _jsx(ErrorAlert, { message: error, onDismiss: () => setError("") }) })), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-8", children: [_jsx("div", { className: "lg:col-span-1", children: _jsx(AddWebsiteForm, { onSubmit: handleAddWebsite, loading: loading }) }), _jsx("div", { className: "lg:col-span-2", children: loading ? (_jsxs("div", { className: "bg-white p-8 rounded-lg shadow-md text-center", children: [_jsx("div", { className: "inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4" }), _jsx("p", { className: "text-gray-600", children: "Websites werden geladen..." })] })) : websites.length === 0 ? (_jsx("div", { className: "bg-white p-8 rounded-lg shadow-md text-center", children: _jsx("p", { className: "text-gray-600", children: "Noch keine Websites hinzugef\u00FCgt. Starten Sie mit einer neuen Website!" }) })) : (_jsx("div", { className: "space-y-4", children: websites.map((site) => (_jsx(WebsiteItem, { website: site, changes: changes[site.id] || [], onCrawl: handleCrawl, onDelete: handleDelete, crawling: crawlingId === site.id, deleting: deletingId === site.id }, site.id))) })) })] })] })] }));
}
export default App;
