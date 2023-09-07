import React, { useEffect } from "react";

export type CalendarEvent = {
  summary: string
}

export const CalendarView: React.FC = () => {
  const [events, setEvents] = React.useState<CalendarEvent[]>([]);
  const [googleAuthUrl, setGoogleAuthUrl] = React.useState<string>("");

  const getEvents = async () => {
    const response = await fetch("http://localhost:3000/calendar/events", { headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` } });
    const data = await response.json();

    if (response.status === 401) {
      const googleAuthUrlResponse = await fetch("http://localhost:3000/calendar/google-auth-url", { headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` } });
      const googleAuthUrlResponseData = await googleAuthUrlResponse.json();

      setGoogleAuthUrl(googleAuthUrlResponseData.data.authorizationUrl);
      return;
    }
    setEvents(data.data.events);
  };

  useEffect(() => {
    getEvents();
  }, []);

  return (
    <div>
      <h1>Calendar View:</h1>
      {(events && events.length) ? <div>
        <ul>
          {events.map(event => <li>{event.summary}</li>)}
        </ul>
      </div> : <></>}
      {googleAuthUrl && <div>
        <a href={googleAuthUrl}>Authorize google</a>
      </div>}
    </div>
  );
};