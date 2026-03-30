import React, { useState, useCallback, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Plus, X, Clock, MapPin, Calendar } from 'lucide-react';
import { cn } from '../../design-system';

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
  audit: 'var(--color-info)',
  training: 'var(--color-success)',
  meeting: 'var(--color-warning)',
  deadline: 'var(--color-error)',
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

const inputClasses = "w-full py-2.5 px-3.5 bg-bg-input border border-border rounded-[10px] text-white text-sm font-inherit outline-none";

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

  return (
    <div className="min-h-screen bg-bg-primary font-base p-6 max-w-[900px] mx-auto relative">
      <h1 className="text-2xl font-bold text-white mb-6">
        Schedule
      </h1>

      {/* Calendar Card */}
      <div
        className="border border-border-glass rounded-xl p-6 mb-6"
        style={{
          backgroundColor: 'var(--glass-bg)',
          backdropFilter: 'var(--glass-blur)',
          WebkitBackdropFilter: 'var(--glass-blur)',
        }}
      >
        {/* Month Navigation */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={prevMonth}
            className="w-9 h-9 rounded-[10px] bg-border-glass border-none text-white cursor-pointer flex items-center justify-center"
          >
            <ChevronLeft size={18} />
          </button>
          <h2 className="text-lg font-semibold text-white">{monthName}</h2>
          <button
            onClick={nextMonth}
            className="w-9 h-9 rounded-[10px] bg-border-glass border-none text-white cursor-pointer flex items-center justify-center"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 gap-0.5 mb-2">
          {DAYS_OF_WEEK.map(d => (
            <div
              key={d}
              className="text-center text-[0.688rem] font-semibold text-text-tertiary uppercase tracking-widest py-2"
            >
              {d}
            </div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 gap-0.5">
          {/* Empty cells */}
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square p-1" />
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
                className={cn(
                  "aspect-square flex flex-col items-center justify-center gap-[3px] rounded-[10px] text-sm cursor-pointer font-inherit transition-all duration-100 p-1 border-2",
                  isSelected ? "border-accent" : "border-transparent",
                  isToday ? "bg-accent/15 text-accent font-bold" : isSelected ? "bg-accent/[0.06] text-white" : "text-white font-normal"
                )}
              >
                <span>{day}</span>
                {dayEvents.length > 0 && (
                  <div className="flex gap-0.5">
                    {dayEvents.slice(0, 3).map(ev => (
                      <div
                        key={ev.id}
                        className="w-[5px] h-[5px] rounded-full"
                        style={{ backgroundColor: EVENT_COLORS[ev.type] }}
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
        <div className="bg-bg-card rounded-lg border border-border-glass p-5 mb-6">
          <h3 className="text-[0.938rem] font-semibold text-white mb-3.5">
            Events for {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </h3>
          {selectedEvents.length === 0 ? (
            <p className="text-text-tertiary text-sm">No events scheduled for this day</p>
          ) : (
            <div className="flex flex-col gap-2.5">
              {selectedEvents.map(ev => (
                <div
                  key={ev.id}
                  className="py-3.5 px-4 bg-white/[0.03] rounded-xl"
                  style={{ borderLeft: `3px solid ${EVENT_COLORS[ev.type]}` }}
                >
                  <div className="flex justify-between items-start mb-1.5">
                    <span className="text-[0.938rem] font-medium text-white">{ev.title}</span>
                    <span
                      className="py-[3px] px-2 rounded-[6px] text-[0.688rem] font-semibold uppercase"
                      style={{
                        backgroundColor: `${EVENT_COLORS[ev.type]}20`,
                        color: EVENT_COLORS[ev.type],
                      }}
                    >
                      {EVENT_LABELS[ev.type]}
                    </span>
                  </div>
                  <div className="flex gap-4 flex-wrap">
                    <span className="flex items-center gap-1 text-xs text-text-tertiary">
                      <Clock size={12} /> {ev.time}
                    </span>
                    {ev.location && (
                      <span className="flex items-center gap-1 text-xs text-text-tertiary">
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
      <div className="bg-bg-card rounded-lg border border-border-glass p-5 mb-20">
        <h3 className="text-[0.938rem] font-semibold text-white mb-3.5">
          Upcoming Events
        </h3>
        {upcomingEvents.length === 0 ? (
          <p className="text-text-tertiary text-sm">No upcoming events</p>
        ) : (
          <div className="flex flex-col gap-2.5">
            {upcomingEvents.map(ev => (
              <div
                key={ev.id}
                className="flex items-center gap-3 p-3 rounded-[10px] bg-white/[0.02]"
              >
                <div
                  className="w-10 h-10 rounded-[10px] flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${EVENT_COLORS[ev.type]}15` }}
                >
                  <Calendar size={16} style={{ color: EVENT_COLORS[ev.type] }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white overflow-hidden text-ellipsis whitespace-nowrap">
                    {ev.title}
                  </div>
                  <div className="text-xs text-text-tertiary mt-0.5">
                    {new Date(ev.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at {ev.time}
                    {ev.location ? ` \u00b7 ${ev.location}` : ''}
                  </div>
                </div>
                <span
                  className="py-[3px] px-2 rounded-[6px] text-[0.625rem] font-semibold uppercase shrink-0"
                  style={{
                    backgroundColor: `${EVENT_COLORS[ev.type]}20`,
                    color: EVENT_COLORS[ev.type],
                  }}
                >
                  {EVENT_LABELS[ev.type]}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FAB — desktop only (mobile uses bottom nav pill center button) */}
      <button
        onClick={() => {
          setNewEvent(prev => ({
            ...prev,
            date: selectedDate || formatDate(today.getFullYear(), today.getMonth(), today.getDate()),
          }));
          setShowModal(true);
        }}
        className="hidden md:flex fixed bottom-8 right-8 w-14 h-14 rounded-full bg-accent text-black border-none cursor-pointer items-center justify-center shadow-[var(--shadow-glow-accent-lg)] transition-transform duration-150 z-50 hover:scale-105"
        title="Add Event"
      >
        <Plus size={24} />
      </button>

      {/* Create Event Modal */}
      {showModal && (
        <div
          className="fixed inset-0 bg-overlay flex items-center justify-center z-[1000] p-6"
          onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}
        >
          <div className="w-full max-w-[440px] bg-bg-tertiary rounded-xl border border-border overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
            {/* Modal Header */}
            <div className="flex justify-between items-center px-6 py-5 border-b border-border-glass">
              <h3 className="text-lg font-semibold text-white">New Event</h3>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-sm bg-border-glass border-none text-text-secondary cursor-pointer flex items-center justify-center"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 flex flex-col gap-4">
              <div>
                <label className="block text-xs font-medium text-text-tertiary mb-1">Title</label>
                <input
                  type="text"
                  value={newEvent.title}
                  onChange={e => setNewEvent(p => ({ ...p, title: e.target.value }))}
                  placeholder="Event title"
                  className={inputClasses}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-text-tertiary mb-1">Type</label>
                <div className="flex gap-2 flex-wrap">
                  {(Object.keys(EVENT_LABELS) as EventType[]).map(type => {
                    const selected = newEvent.type === type;
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setNewEvent(p => ({ ...p, type }))}
                        className="py-2 px-3.5 rounded-sm text-[0.813rem] font-medium cursor-pointer font-inherit"
                        style={{
                          border: `2px solid ${selected ? EVENT_COLORS[type] : 'var(--color-border)'}`,
                          backgroundColor: selected ? `${EVENT_COLORS[type]}15` : 'transparent',
                          color: selected ? EVENT_COLORS[type] : 'var(--color-text-secondary)',
                        }}
                      >
                        {EVENT_LABELS[type]}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-text-tertiary mb-1">Date</label>
                  <input
                    type="date"
                    value={newEvent.date}
                    onChange={e => setNewEvent(p => ({ ...p, date: e.target.value }))}
                    className={`${inputClasses} [color-scheme:dark]`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-tertiary mb-1">Time</label>
                  <input
                    type="time"
                    value={newEvent.time}
                    onChange={e => setNewEvent(p => ({ ...p, time: e.target.value }))}
                    className={`${inputClasses} [color-scheme:dark]`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-text-tertiary mb-1">Location</label>
                <input
                  type="text"
                  value={newEvent.location}
                  onChange={e => setNewEvent(p => ({ ...p, location: e.target.value }))}
                  placeholder="Event location"
                  className={inputClasses}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-text-tertiary mb-1">Notes</label>
                <textarea
                  value={newEvent.notes}
                  onChange={e => setNewEvent(p => ({ ...p, notes: e.target.value }))}
                  placeholder="Additional notes..."
                  rows={3}
                  className={`${inputClasses} resize-y`}
                />
              </div>

              <button
                type="button"
                onClick={handleCreateEvent}
                disabled={!newEvent.title.trim()}
                className={cn(
                  "w-full py-3 border-none rounded-xl text-[0.938rem] font-semibold font-inherit mt-2",
                  newEvent.title.trim()
                    ? "bg-accent text-black cursor-pointer"
                    : "bg-accent/30 text-black/50 cursor-not-allowed"
                )}
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
