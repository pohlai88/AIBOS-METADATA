// packages/metadata-sdk/src/http-client.ts

import type { MetadataSdkConfig } from './config';

/**
 * HTTP Client for Metadata SDK
 * 
 * Handles all HTTP communication with the metadata service.
 */
export class HttpClient {
  constructor(private readonly config: MetadataSdkConfig) {}

  /**
   * Build headers for HTTP requests
   */
  private buildHeaders(extra?: Record<string, string>): Headers {
    const headers = new Headers({
      'Content-Type': 'application/json',
      ...extra,
    });

    if (this.config.apiKey) {
      headers.set('x-api-key', this.config.apiKey);
    }

    if (this.config.defaultTenantId) {
      headers.set('x-tenant-id', this.config.defaultTenantId);
    }

    return headers;
  }

  /**
   * GET request
   */
  async get<T>(path: string, query?: Record<string, string | undefined>): Promise<T> {
    const url = new URL(path, this.config.baseUrl);

    if (query) {
      for (const [key, value] of Object.entries(query)) {
        if (value !== undefined) {
          url.searchParams.set(key, value);
        }
      }
    }

    const res = await fetch(url.toString(), {
      method: 'GET',
      headers: this.buildHeaders(),
    });

    if (!res.ok) {
      const errorText = await res.text().catch(() => res.statusText);
      throw new Error(
        `Metadata SDK GET ${path} failed: ${res.status} ${res.statusText}\n${errorText}`,
      );
    }

    return res.json() as Promise<T>;
  }

  /**
   * POST request
   */
  async post<T>(path: string, body?: unknown): Promise<T> {
    const url = new URL(path, this.config.baseUrl);

    const res = await fetch(url.toString(), {
      method: 'POST',
      headers: this.buildHeaders(),
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
      const errorText = await res.text().catch(() => res.statusText);
      throw new Error(
        `Metadata SDK POST ${path} failed: ${res.status} ${res.statusText}\n${errorText}`,
      );
    }

    return res.json() as Promise<T>;
  }
}

