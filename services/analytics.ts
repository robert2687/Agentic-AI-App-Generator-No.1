/**
 * Privacy-respecting analytics service
 * Tracks events locally without sending data to external services
 */

export interface AnalyticsEvent {
  timestamp: number;
  eventType: 'generation_start' | 'generation_complete' | 'generation_error' | 'generation_cancelled' | 'agent_complete' | 'retry_attempted' | 'refinement_start';
  agentName?: string;
  metadata?: Record<string, any>;
}

class AnalyticsService {
  private events: AnalyticsEvent[] = [];
  private readonly MAX_EVENTS = 100; // Keep only the last 100 events

  /**
   * Track an event
   */
  track(eventType: AnalyticsEvent['eventType'], agentName?: string, metadata?: Record<string, any>) {
    const event: AnalyticsEvent = {
      timestamp: Date.now(),
      eventType,
      agentName,
      metadata,
    };

    this.events.push(event);

    // Keep only the last MAX_EVENTS
    if (this.events.length > this.MAX_EVENTS) {
      this.events = this.events.slice(-this.MAX_EVENTS);
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[Analytics]', event);
    }
  }

  /**
   * Get all tracked events
   */
  getEvents(): AnalyticsEvent[] {
    return [...this.events];
  }

  /**
   * Get event summary statistics
   */
  getSummary() {
    const summary = {
      totalGenerations: this.events.filter(e => e.eventType === 'generation_start').length,
      completedGenerations: this.events.filter(e => e.eventType === 'generation_complete').length,
      failedGenerations: this.events.filter(e => e.eventType === 'generation_error').length,
      cancelledGenerations: this.events.filter(e => e.eventType === 'generation_cancelled').length,
      retriesAttempted: this.events.filter(e => e.eventType === 'retry_attempted').length,
      refinements: this.events.filter(e => e.eventType === 'refinement_start').length,
    };

    return summary;
  }

  /**
   * Clear all events
   */
  clear() {
    this.events = [];
  }

  /**
   * Export events as JSON for debugging
   */
  export(): string {
    return JSON.stringify(this.events, null, 2);
  }
}

export const analytics = new AnalyticsService();
