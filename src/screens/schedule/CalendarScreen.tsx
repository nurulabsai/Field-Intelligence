import React, { useState, useCallback, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Plus, X, Clock, MapPin, Calendar } from 'lucide-react';

type EventType = 'audit' | 'training' | 'meeting' | 'deadline';

interface CalendarEvent {
  id: string;
  title: string;
  type: EventType;
  date: string; // YYYY-MM-DD
  time: string;
  location: string;
  notes?: string;
}

interface CalendarScreenProps {
  events?: CalendarEvent[];
  onAddEvent?: (event: Omit<CalendarEvent, 'id'>) => void;
}

const EVENT_COLORS: Record<EventType, string> = {
  audit: '#3B82F6',
  training: '#22C55E',
  meeting: '#F59E0B',
  deadline: '#EF4444',
};

const EVENT_LABELS: Record<EventType, string> = {
  audit: 'Audit',
  training: 'Training',
  meeting: 'Meeting',
  deadline: 'Deadline',
};

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

function formatDate(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

const MOCK_EVENTS: CalendarEvent[] = [
  { id: '1', title: 'Farm Audit - Dodoma', type: 'audit', date: '2026-03-15', time: '09:00', location: 'Dodoma Region' },
  { id: '2', title: 'Soil Testing Training', type: 'training', date: '2026-03-17', time: '10:00', location: 'Arusha HQ' },
  { id: '3', title: 'Regional Review Meeting', type: 'meeting', date: '2026-03-20', time: '14:00', location: 'Virtual' },
  { id: '4', title: 'Q1 Report Deadline', type: 'deadline', date: '2026-03-31', time: '17:00', location: '' },
  { id: '5', title: 'Farm Audit - Kilimanjaro', type: 'audit', date: '2026-03-18', time: '08:00', location: 'Moshi' },
  { id: '6', title: 'Extension Officer Meeting', type: 'meeting', date: '2026-03-22', time: '11:00', location: 'District Office' },
  { id: '7', title: 'Crop Assessment - Mbeya', type: 'audit', date: '2026-03-25', time: '07:30', location: 'Mbeya Rural' },
  { id: '8', title: 'GPS Training Workshop', type: 'training', date: '2026-03-28', time: '09:00', location: 'Iringa Training Centre' },
];

interface NewEventForm {
  title: string;
  type: EventType;
  date: string;
  time: string;
  location: string;
  notes: string;
}

const CalendarScreen: React.FC<CalendarScreenProps> = ({ events: propEvents, onAddEvent }) => {
  const events = propEvents || MOCK_EVENTS;
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(formatDate(today.getFullYear(), today.getMonth(), today.getDate()));
  const [showModal, setShowModal] = useState(false);
  const [newEvent, setNewEvent] = useState<NewEventForm>({
    title: '',
    type: 'audit',
    date: formatDate(today.getFullYear(), today.getMonth(), today.getDate()),
    time: '09:00',
    location: '',
    notes: '',
  });

  const monthName = new Date(currentYear, currentMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const prevMonth = useCallback(() => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(y => y - 1);
    } else {
      setCurrentMonth(m => m - 1);
    }
  }, [currentMonth]);

  const nextMonth = useCallback(() => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(y => y + 1);
    } else {
      setCurrentMonth(m => m + 1);
    }
  }, [currentMonth]);

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

  const eventsByDate = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {};
    events.forEach(ev => {
      if (!map[ev.date]) map[ev.date] = [];
      map[ev.date]!.push(ev);
    });
    return map;
  }, [events]);

  const selectedEvents = useMemo(() => {
    return selectedDate ? (eventsByDate[selectedDate] || []) : [];
  }, [selectedDate, eventsByDate]);

  const upcomingEvents = useMemo(() => {
    const todayStr = formatDate(today.getFullYear(), today.getMonth(), today.getDate());
    return events
      .filter(ev => ev.date >= todayStr)
      .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))
      .slice(0, 5);
  }, [events, today]);

  const handleCreateEvent = useCallback(() => {
    if (!newEvent.title.trim()) return;
    onAddEvent?.({
      title: newEvent.title,
      type: newEvent.type,
      date: newEvent.date,
      time: newEvent.time,
      location: newEvent.location,
      notes: newEvent.notes,
    });
    setShowModal(false);
    setNewEvent({
      title: '',
      type: 'audit',
      date: selectedDate || formatDate(today.getFullYear(), today.getMonth(), today.getDate()),
      time: '09:00',
      location: '',
      notes: '',
    });
  }, [newEvent, onAddEvent, selectedDate, today]);

  const todayStr = formatDate(today.getFullYear(), today.getMonth(), today.getDate());

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 14px',
    backgroundColor: 'var(--color-bg-input, #252525)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '10px',
    color: '#FFFFFF',
    fontSize: '0.875rem',
    fontFamily: 'inherit',
    outline: 'none',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '0.75rem',
    fontWeight: 500,
    color: '#6B7280',
    marginBottom: '4px',
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--color-bg-primary, #0D0D0D)',
        fontFamily: 'var(--font-family-base, Inter, sans-serif)',
        padding: '24px',
        maxWidth: '900px',
        margin: '0 auto',
        position: 'relative',
      }}
    >
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '24px' }}>
        Schedule
      </h1>

      {/* Calendar Card */}
      <div
        style={{
          backgroundColor: 'var(--glass-bg, rgba(30,30,30,0.8))',
          backdropFilter: 'var(--glass-blur, blur(16px))',
          WebkitBackdropFilter: 'var(--glass-blur, blur(16px))',
          border: '1px solid var(--glass-border, rgba(255,255,255,0.06))',
          borderRadius: '20px',
          padding: '24px',
          marginBottom: '24px',
        }}
      >
        {/* Month Navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <button
            onClick={prevMonth}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              backgroundColor: 'rgba(255,255,255,0.06)',
              border: 'none',
              color: '#FFFFFF',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ChevronLeft size={18} />
          </button>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#FFFFFF' }}>{monthName}</h2>
          <button
            onClick={nextMonth}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              backgroundColor: 'rgba(255,255,255,0.06)',
              border: 'none',
              color: '#FFFFFF',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Day headers */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px', marginBottom: '8px' }}>
          {DAYS_OF_WEEK.map(d => (
            <div
              key={d}
              style={{
                textAlign: 'center',
                fontSize: '0.688rem',
                fontWeight: 600,
                color: '#6B7280',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                padding: '8px 0',
              }}
            >
              {d}
            </div>
          ))}
        </div>

        {/* Days grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px' }}>
          {/* Empty cells */}
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} style={{ aspectRatio: '1', padding: '4px' }} />
          ))}
          {/* Day cells */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dateStr = formatDate(currentYear, currentMonth, day);
            const isToday = dateStr === todayStr;
            const isSelected = dateStr === selectedDate;
            const dayEvents = eventsByDate[dateStr] || [];

            return (
              <button
                key={day}
                onClick={() => setSelectedDate(dateStr)}
                style={{
                  aspectRatio: '1',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '3px',
                  borderRadius: '10px',
                  border: isSelected ? '2px solid #F0513E' : '2px solid transparent',
                  backgroundColor: isToday ? 'rgba(240,81,62,0.15)' : isSelected ? 'rgba(240,81,62,0.06)' : 'transparent',
                  color: isToday ? '#F0513E' : '#FFFFFF',
                  fontWeight: isToday ? 700 : 400,
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  transition: 'all 0.1s ease',
                  padding: '4px',
                }}
              >
                <span>{day}</span>
                {dayEvents.length > 0 && (
                  <div style={{ display: 'flex', gap: '2px' }}>
                    {dayEvents.slice(0, 3).map(ev => (
                      <div
                        key={ev.id}
                        style={{
                          width: '5px',
                          height: '5px',
                          borderRadius: '50%',
                          backgroundColor: EVENT_COLORS[ev.type],
                        }}
                      />
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Day Events */}
      {selectedDate && (
        <div
          style={{
            backgroundColor: 'var(--color-bg-card, #1E1E1E)',
            borderRadius: '16px',
            border: '1px solid rgba(255,255,255,0.06)',
            padding: '20px',
            marginBottom: '24px',
          }}
        >
          <h3 style={{ fontSize: '0.938rem', fontWeight: 600, color: '#FFFFFF', marginBottom: '14px' }}>
            Events for {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </h3>
          {selectedEvents.length === 0 ? (
            <p style={{ color: '#6B7280', fontSize: '0.875rem' }}>No events scheduled for this day</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {selectedEvents.map(ev => (
                <div
                  key={ev.id}
                  style={{
                    padding: '14px 16px',
                    backgroundColor: 'rgba(255,255,255,0.03)',
                    borderRadius: '12px',
                    borderLeft: `3px solid ${EVENT_COLORS[ev.type]}`,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                    <span style={{ fontSize: '0.938rem', fontWeight: 500, color: '#FFFFFF' }}>{ev.title}</span>
                    <span
                      style={{
                        padding: '3px 8px',
                        borderRadius: '6px',
                        fontSize: '0.688rem',
                        fontWeight: 600,
                        backgroundColor: `${EVENT_COLORS[ev.type]}20`,
                        color: EVENT_COLORS[ev.type],
                        textTransform: 'uppercase',
                      }}
                    >
                      {EVENT_LABELS[ev.type]}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: '#6B7280' }}>
                      <Clock size={12} /> {ev.time}
                    </span>
                    {ev.location && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: '#6B7280' }}>
                        <MapPin size={12} /> {ev.location}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Upcoming Events */}
      <div
        style={{
          backgroundColor: 'var(--color-bg-card, #1E1E1E)',
          borderRadius: '16px',
          border: '1px solid rgba(255,255,255,0.06)',
          padding: '20px',
          marginBottom: '80px',
        }}
      >
        <h3 style={{ fontSize: '0.938rem', fontWeight: 600, color: '#FFFFFF', marginBottom: '14px' }}>
          Upcoming Events
        </h3>
        {upcomingEvents.length === 0 ? (
          <p style={{ color: '#6B7280', fontSize: '0.875rem' }}>No upcoming events</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {upcomingEvents.map(ev => (
              <div
                key={ev.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(255,255,255,0.02)',
                }}
              >
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    backgroundColor: `${EVENT_COLORS[ev.type]}15`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Calendar size={16} style={{ color: EVENT_COLORS[ev.type] }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: 500, color: '#FFFFFF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {ev.title}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#6B7280', marginTop: '2px' }}>
                    {new Date(ev.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at {ev.time}
                    {ev.location ? ` \u00b7 ${ev.location}` : ''}
                  </div>
                </div>
                <span
                  style={{
                    padding: '3px 8px',
                    borderRadius: '6px',
                    fontSize: '0.625rem',
                    fontWeight: 600,
                    backgroundColor: `${EVENT_COLORS[ev.type]}20`,
                    color: EVENT_COLORS[ev.type],
                    textTransform: 'uppercase',
                    flexShrink: 0,
                  }}
                >
                  {EVENT_LABELS[ev.type]}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FAB - Add Event */}
      <button
        onClick={() => {
          setNewEvent(prev => ({
            ...prev,
            date: selectedDate || formatDate(today.getFullYear(), today.getMonth(), today.getDate()),
          }));
          setShowModal(true);
        }}
        style={{
          position: 'fixed',
          bottom: '32px',
          right: '32px',
          width: '56px',
          height: '56px',
          borderRadius: '16px',
          backgroundColor: '#F0513E',
          color: '#FFFFFF',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 8px 24px rgba(240,81,62,0.4)',
          transition: 'transform 0.15s ease',
          zIndex: 50,
        }}
        title="Add Event"
      >
        <Plus size={24} />
      </button>

      {/* Create Event Modal */}
      {showModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '24px',
          }}
          onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '440px',
              backgroundColor: '#1E1E1E',
              borderRadius: '20px',
              border: '1px solid rgba(255,255,255,0.1)',
              overflow: 'hidden',
              boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '20px 24px',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#FFFFFF' }}>New Event</h3>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(255,255,255,0.06)',
                  border: 'none',
                  color: '#9CA3AF',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Title</label>
                <input
                  type="text"
                  value={newEvent.title}
                  onChange={e => setNewEvent(p => ({ ...p, title: e.target.value }))}
                  placeholder="Event title"
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>Type</label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {(Object.keys(EVENT_LABELS) as EventType[]).map(type => {
                    const selected = newEvent.type === type;
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setNewEvent(p => ({ ...p, type }))}
                        style={{
                          padding: '8px 14px',
                          borderRadius: '8px',
                          fontSize: '0.813rem',
                          fontWeight: 500,
                          border: `2px solid ${selected ? EVENT_COLORS[type] : 'rgba(255,255,255,0.08)'}`,
                          backgroundColor: selected ? `${EVENT_COLORS[type]}15` : 'transparent',
                          color: selected ? EVENT_COLORS[type] : '#9CA3AF',
                          cursor: 'pointer',
                          fontFamily: 'inherit',
                        }}
                      >
                        {EVENT_LABELS[type]}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={labelStyle}>Date</label>
                  <input
                    type="date"
                    value={newEvent.date}
                    onChange={e => setNewEvent(p => ({ ...p, date: e.target.value }))}
                    style={{ ...inputStyle, colorScheme: 'dark' }}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Time</label>
                  <input
                    type="time"
                    value={newEvent.time}
                    onChange={e => setNewEvent(p => ({ ...p, time: e.target.value }))}
                    style={{ ...inputStyle, colorScheme: 'dark' }}
                  />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Location</label>
                <input
                  type="text"
                  value={newEvent.location}
                  onChange={e => setNewEvent(p => ({ ...p, location: e.target.value }))}
                  placeholder="Event location"
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>Notes</label>
                <textarea
                  value={newEvent.notes}
                  onChange={e => setNewEvent(p => ({ ...p, notes: e.target.value }))}
                  placeholder="Additional notes..."
                  rows={3}
                  style={{ ...inputStyle, resize: 'vertical' }}
                />
              </div>

              <button
                type="button"
                onClick={handleCreateEvent}
                disabled={!newEvent.title.trim()}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: newEvent.title.trim() ? '#F0513E' : 'rgba(240,81,62,0.3)',
                  color: newEvent.title.trim() ? '#FFFFFF' : 'rgba(255,255,255,0.5)',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '0.938rem',
                  fontWeight: 600,
                  cursor: newEvent.title.trim() ? 'pointer' : 'not-allowed',
                  fontFamily: 'inherit',
                  marginTop: '8px',
                }}
              >
                Create Event
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarScreen;
