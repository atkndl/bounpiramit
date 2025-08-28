// Request deduplication and session management utility
import { Session } from '@supabase/supabase-js';

class RequestManager {
  private ongoingRequests = new Map<string, Promise<any>>();
  private session: Session | null = null;
  private isSessionLoaded = false;

  setSession(session: Session | null, isLoaded: boolean) {
    this.session = session;
    this.isSessionLoaded = isLoaded;
  }

  async execute<T>(
    key: string,
    requestFn: () => Promise<T>,
    requiresAuth = false
  ): Promise<T> {
    // Check if session is loaded when required
    if (!this.isSessionLoaded) {
      throw new Error('Session not loaded yet');
    }

    // Check authentication if required
    if (requiresAuth && !this.session) {
      throw new Error('Authentication required');
    }

    // Check if request is already ongoing
    if (this.ongoingRequests.has(key)) {
      return this.ongoingRequests.get(key)!;
    }

    // Create and store the request promise
    const requestPromise = requestFn()
      .finally(() => {
        // Remove from ongoing requests when completed
        this.ongoingRequests.delete(key);
      });

    this.ongoingRequests.set(key, requestPromise);
    return requestPromise;
  }

  clearCache(key?: string) {
    if (key) {
      this.ongoingRequests.delete(key);
    } else {
      this.ongoingRequests.clear();
    }
  }

  isRequestOngoing(key: string): boolean {
    return this.ongoingRequests.has(key);
  }
}

export const requestManager = new RequestManager();