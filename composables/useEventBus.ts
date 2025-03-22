import { ref } from 'vue';

// Type for event callbacks
type EventCallback<T = any> = (payload: T) => void;

// Simple event bus implementation
class EventBus {
  private events: Record<string, EventCallback[]> = {};

  // Subscribe to an event
  on<T>(event: string, callback: EventCallback<T>) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback as EventCallback);
    
    // Return unsubscribe function
    return () => {
      this.events[event] = this.events[event].filter(cb => cb !== callback);
    };
  }

  // Emit an event
  emit<T>(event: string, data?: T) {
    if (this.events[event]) {
      this.events[event].forEach(callback => callback(data));
    }
  }
}

// Create a singleton event bus
const eventBus = new EventBus();

export const useEventBus = () => {
  return eventBus;
}; 