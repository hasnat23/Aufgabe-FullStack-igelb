import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { AlertCircle } from "lucide-react";
// Zeigt eine Fehler-Benachrichtigung an
export function ErrorAlert({ message, onDismiss }) {
    return (_jsxs("div", { className: "bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3", children: [_jsx(AlertCircle, { className: "text-red-600 flex-shrink-0 mt-0.5", size: 20 }), _jsx("div", { className: "flex-1", children: _jsx("p", { className: "text-red-800", children: message }) }), onDismiss && (_jsx("button", { onClick: onDismiss, className: "text-red-600 hover:text-red-800 flex-shrink-0", children: "\u2715" }))] }));
}
