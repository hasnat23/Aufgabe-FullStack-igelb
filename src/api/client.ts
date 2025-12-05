import axios, { AxiosError } from "axios";
import type { Website, CrawlResponse, ChangeResponse } from "../types";

const API_BASE = "";

// Benutzerdefinierte Fehlerklasse für besseres Fehlerhandling
export class APIError extends Error {
  constructor(
    public statusCode: number | null,
    public originalError: unknown,
    message: string
  ) {
    super(message);
    this.name = "APIError";
  }
}

/**
 * Behandle HTTP-Fehler mit aussagekräftigen Fehlermeldungen
 */
function handleError(error: unknown, context: string): APIError {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ error?: string }>;
    const statusCode = axiosError.response?.status ?? null;
    const message = `${context}: ${
      axiosError.response?.status ?? "Netzwerkfehler"
    } - ${axiosError.response?.data?.error || axiosError.message}`;
    return new APIError(statusCode, error, message);
  }

  const message = `${context}: ${
    error instanceof Error ? error.message : String(error)
  }`;
  return new APIError(null, error, message);
}

// Hole alle überwachten Websites vom Server
export async function fetchWebsites(): Promise<Website[]> {
  try {
    const response = await axios.get(`${API_BASE}/websites`, {
      timeout: 10000,
    });
    return response.data;
  } catch (error) {
    throw handleError(error, "Fehler beim Abrufen von Websites");
  }
}

// Erstelle eine neue Website zur Überwachung
export async function createWebsite(
  website: Omit<Website, "id" | "createdAt">
): Promise<Website> {
  try {
    const response = await axios.post(`${API_BASE}/websites`, website, {
      timeout: 10000,
    });
    return response.data;
  } catch (error) {
    throw handleError(error, "Fehler beim Erstellen der Website");
  }
}

// Starte einen Crawl der Website um Änderungen zu erkennen
export async function triggerCrawl(websiteId: string): Promise<CrawlResponse> {
  try {
    const response = await axios.post(
      `${API_BASE}/crawl/${websiteId}`,
      {},
      { timeout: 30000 }
    );
    return response.data;
  } catch (error) {
    throw handleError(error, `Fehler beim Crawl der Website ${websiteId}`);
  }
}

// Hole den Änderungsverlauf einer Website
export async function getChangeHistory(
  websiteId: string
): Promise<ChangeResponse[]> {
  try {
    const response = await axios.get(`${API_BASE}/changes/${websiteId}`, {
      timeout: 10000,
    });
    return response.data;
  } catch (error) {
    throw handleError(
      error,
      `Fehler beim Abrufen des Änderungsverlaufs für ${websiteId}`
    );
  }
}

// Lösche eine Website aus der Überwachung
export async function deleteWebsite(websiteId: string): Promise<void> {
  try {
    await axios.delete(`${API_BASE}/websites/${websiteId}`, { timeout: 10000 });
  } catch (error) {
    throw handleError(error, `Fehler beim Löschen der Website ${websiteId}`);
  }
}
