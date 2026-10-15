import ICAL from 'ical.js';

/**
 * Parses raw iCalendar text string and extracts events within a window around now
 * @param {string} icalRaw
 * @param {Date} [now]
 * @param {number} [daysForward]
 */
export function parseIcalData(icalRaw, now = new Date(), daysForward = 14) {
  try {
    const jcalData = ICAL.parse(icalRaw);
    const comp = new ICAL.Component(jcalData);
    const vevents = comp.getAllSubcomponents('vevent');

    const windowStart = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 1 day ago
    const windowEnd = new Date(now.getTime() + daysForward * 24 * 60 * 60 * 1000); // N days forward

    const events = [];

    for (const vevent of vevents) {
      try {
        const event = new ICAL.Event(vevent);

        const summary = event.summary || '（タイトルなし）';
        const description = event.description || '';
        const location = event.location || '';
        const uid = event.uid || `${summary}-${event.startDate.toJSDate().getTime()}`;

        if (event.isRecurring()) {
          const iter = event.iterator();
          let nextTime = null;
          let count = 0;

          // Limit iterations to prevent infinite loop
          while ((nextTime = iter.next()) && count < 50) {
            count++;
            const jsStart = nextTime.toJSDate();
            if (jsStart > windowEnd) break;
            if (jsStart >= windowStart) {
              const duration = event.duration;
              const jsEnd = new Date(jsStart.getTime() + duration.toSeconds() * 1000);

              events.push({
                id: `${uid}-${jsStart.toISOString()}`,
                summary,
                description,
                location,
                start: jsStart.toISOString(),
                end: jsEnd.toISOString(),
                isAllDay: !nextTime.isDate ? false : true,
              });
            }
          }
        } else {
          const jsStart = event.startDate.toJSDate();
          const jsEnd = event.endDate ? event.endDate.toJSDate() : jsStart;

          if (jsEnd >= windowStart && jsStart <= windowEnd) {
            events.push({
              id: uid,
              summary,
              description,
              location,
              start: jsStart.toISOString(),
              end: jsEnd.toISOString(),
              isAllDay: Boolean(event.startDate.isDate),
            });
          }
        }
      } catch (err) {
        // Skip malformed event silently
      }
    }

    // Sort by start time ascending
    events.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

    return events;
  } catch (error) {
    console.error('[daily-station] Failed to parse iCal data:', error);
    return [];
  }
}
