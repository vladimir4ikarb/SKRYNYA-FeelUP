export interface CalendarEvent {
  id?: string;
  summary: string;
  description?: string;
  start: {
    dateTime: string;
    timeZone?: string;
  };
  end: {
    dateTime: string;
    timeZone?: string;
  };
}

export const calendarService = {
  createEvent: async (token: string, event: CalendarEvent) => {
    try {
      const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(event)
      });
      if (!response.ok) throw new Error('Failed to create calendar event');
      return await response.ok;
    } catch (error) {
      console.error('Calendar error:', error);
      return false;
    }
  },

  listEvents: async (token: string, timeMin: string) => {
    try {
      const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${timeMin}&orderBy=startTime&singleEvents=true`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) return [];
      const data = await response.json();
      return data.items || [];
    } catch (error) {
      console.error('Calendar list error:', error);
      return [];
    }
  }
};
