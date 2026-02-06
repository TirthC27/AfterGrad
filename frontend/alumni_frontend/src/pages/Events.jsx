import React, { useState } from 'react'
import Card from '../components/Card'
import Button from '../components/Button'
import Badge from '../components/Badge'
import { Calendar, Clock, User, MapPin } from 'lucide-react'

const mockEvents = [
  {
    id: 1,
    title: 'Alumni Reunion 2026',
    date: 'Feb 20, 2026',
    time: '6:00 PM',
    organizer: 'College',
    location: 'IIT Delhi Campus',
    attendees: 124,
  },
  {
    id: 2,
    title: 'Product Management Workshop',
    date: 'Feb 25, 2026',
    time: '3:00 PM',
    organizer: 'Alumni',
    location: 'Online (Zoom)',
    attendees: 45,
  },
  {
    id: 3,
    title: 'Career Fair: Tech Edition',
    date: 'Mar 5, 2026',
    time: '10:00 AM',
    organizer: 'College',
    location: 'Auditorium Hall',
    attendees: 200,
  },
  {
    id: 4,
    title: 'Startup Pitch Night',
    date: 'Mar 12, 2026',
    time: '7:00 PM',
    organizer: 'Alumni',
    location: 'Online (Google Meet)',
    attendees: 67,
  },
  {
    id: 5,
    title: 'Women in Tech Panel',
    date: 'Mar 18, 2026',
    time: '5:00 PM',
    organizer: 'College',
    location: 'Conference Room B',
    attendees: 89,
  },
]

export default function Events({ addToast }) {
  const [rsvps, setRsvps] = useState({})

  const handleRsvp = (id) => {
    setRsvps(prev => ({ ...prev, [id]: true }))
    addToast?.('Successfully registered for the event!')
  }

  return (
    <>
      <section className="section-label">Upcoming Events</section>
      <div className="grid grid-cols-1 gap-4 animate-[fadeInUp_0.5s_ease]">
        {mockEvents.map((event, i) => (
          <Card
            key={event.id}
            hover={true}
            className="!flex-row flex items-center gap-5"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            {/* Date pill */}
            <div className="flex flex-col items-center justify-center w-16 h-16 rounded-2xl bg-[rgba(134,239,172,0.12)] shrink-0">
              <span className="text-lg font-bold text-[var(--mint-500)]">{event.date.split(' ')[1].replace(',','')}</span>
              <span className="text-[10px] font-medium text-[var(--text-muted)] uppercase">{event.date.split(' ')[0]}</span>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[14px] font-semibold text-[var(--text-primary)] truncate">{event.title}</span>
                <Badge variant={event.organizer === 'College' ? 'info' : 'default'}>
                  {event.organizer}
                </Badge>
              </div>
              <div className="flex items-center gap-4 text-[11px] text-[var(--text-muted)]">
                <span className="flex items-center gap-1"><Clock size={12} /> {event.time}</span>
                <span className="flex items-center gap-1"><MapPin size={12} /> {event.location}</span>
                <span className="flex items-center gap-1"><User size={12} /> {event.attendees} attending</span>
              </div>
            </div>

            {/* RSVP */}
            <div className="shrink-0">
              {rsvps[event.id] ? (
                <Badge variant="success" glow>
                  ✓ Registered
                </Badge>
              ) : (
                <Button variant="primary" size="sm" onClick={(e) => { e.stopPropagation(); handleRsvp(event.id) }}>
                  RSVP
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>
    </>
  )
}
