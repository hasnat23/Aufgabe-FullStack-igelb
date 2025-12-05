import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Plus } from "lucide-react";
export function AddWebsiteForm({ onSubmit, loading = false, }) {
    const [name, setName] = useState("");
    const [url, setUrl] = useState("");
    const [error, setError] = useState("");
    // Validiere die URL-Format
    const validateUrl = (urlStr) => {
        try {
            new URL(urlStr);
            return true;
        }
        catch {
            return false;
        }
    };
    // Verarbeite das Formular-Absenden
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        if (!name.trim() || !url.trim()) {
            setError("Name und URL sind erforderlich");
            return;
        }
        if (!validateUrl(url)) {
            setError("Ungültiges URL-Format");
            return;
        }
        try {
            await onSubmit(name, url);
            setName("");
            setUrl("");
        }
        catch (err) {
            setError(err instanceof Error
                ? err.message
                : "Fehler beim Hinzufügen der Website");
        }
    };
    return (_jsxs("form", { onSubmit: handleSubmit, className: "bg-white p-6 rounded-lg shadow-md", children: [_jsx("h2", { className: "text-xl font-bold mb-4", children: "Neue Website hinzuf\u00FCgen" }), error && (_jsx("div", { className: "mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded", children: error })), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { htmlFor: "name", className: "block text-sm font-medium text-gray-700", children: "Website-Name" }), _jsx("input", { id: "name", type: "text", value: name, onChange: (e) => setName(e.target.value), placeholder: "z.B. Google Startseite", className: "mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500", disabled: loading })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "url", className: "block text-sm font-medium text-gray-700", children: "URL" }), _jsx("input", { id: "url", type: "url", value: url, onChange: (e) => setUrl(e.target.value), placeholder: "https://example.com", className: "mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500", disabled: loading })] }), _jsxs("button", { type: "submit", disabled: loading, className: "w-full bg-blue-600 text-white py-2 rounded-md font-medium hover:bg-blue-700 disabled:bg-gray-400 flex items-center justify-center gap-2", children: [_jsx(Plus, { size: 18 }), loading ? "Wird hinzugefügt..." : "Website hinzufügen"] })] })] }));
}
