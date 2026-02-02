import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import useAuthStore from '../store/authStore';
import useFarmStore from '../store/farmStore';
import '../App.css';

// Basic mock data fetcher or store connector in the future
// For now, we will use some placeholder events or try to fetch from an activities store if available.
// Since we don't have a direct "calendar events" endpoint, we might map activities to events.

import RegionalIntelligence from '../components/calendar/RegionalIntelligence.jsx';

import RegionalSummary from '../components/calendar/RegionalSummary.jsx';

const AgriCalendar = () => {
    const { currentFarm } = useFarmStore();
    const [events, setEvents] = useState([]);
    const [viewMode, setViewMode] = useState('calendar'); // 'calendar', 'regional', 'summary'

    // Sample events to demonstrate functionality
    useEffect(() => {
        if (currentFarm) {
            setEvents([
                { title: 'Planting Season Start', date: new Date().toISOString().split('T')[0], color: '#2f855a' },
                { title: 'Fertilizer Application', date: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0], color: '#dd6b20' },
                { title: 'Harvest Estimate', date: new Date(Date.now() + 86400000 * 14).toISOString().split('T')[0], color: '#e53e3e' }
            ]);
        }
    }, [currentFarm]);

    const handleDateClick = (arg) => {
        // Placeholder for adding new events
        alert('Date clicked: ' + arg.dateStr);
    };

    return (
        <div className="animate-fade-in" style={{ padding: '24px', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div className="flex j-between a-center" style={{ marginBottom: '24px' }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: '800', margin: 0, color: 'var(--secondary)' }}>Planner</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>Schedule and track farm operations for <strong>{currentFarm?.name || 'Loading...'}</strong></p>
                </div>

                {/* View Switcher */}
                <div style={{ display: 'flex', backgroundColor: 'var(--bg-main)', padding: '4px', borderRadius: '12px', gap: '4px', border: '1px solid var(--border)' }}>
                    <button
                        onClick={() => setViewMode('calendar')}
                        style={{
                            padding: '8px 16px',
                            borderRadius: '8px',
                            border: viewMode === 'calendar' ? '1px solid var(--border)' : 'none',
                            backgroundColor: viewMode === 'calendar' ? 'var(--bg-card)' : 'transparent',
                            color: viewMode === 'calendar' ? 'var(--primary)' : 'var(--text-muted)',
                            fontWeight: '600',
                            boxShadow: viewMode === 'calendar' ? 'var(--shadow-sm)' : 'none',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                    >
                        Calendar View
                    </button>
                    <button
                        onClick={() => setViewMode('regional')}
                        style={{
                            padding: '8px 16px',
                            borderRadius: '8px',
                            border: viewMode === 'regional' ? '1px solid var(--border)' : 'none',
                            backgroundColor: viewMode === 'regional' ? 'var(--bg-card)' : 'transparent',
                            color: viewMode === 'regional' ? 'var(--primary)' : 'var(--text-muted)',
                            fontWeight: '600',
                            boxShadow: viewMode === 'regional' ? 'var(--shadow-sm)' : 'none',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                    >
                        Regional Guidelines
                    </button>
                    <button
                        onClick={() => setViewMode('summary')}
                        style={{
                            padding: '8px 16px',
                            borderRadius: '8px',
                            border: viewMode === 'summary' ? '1px solid var(--border)' : 'none',
                            backgroundColor: viewMode === 'summary' ? 'var(--bg-card)' : 'transparent',
                            color: viewMode === 'summary' ? 'var(--primary)' : 'var(--text-muted)',
                            fontWeight: '600',
                            boxShadow: viewMode === 'summary' ? 'var(--shadow-sm)' : 'none',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                    >
                        Summary
                    </button>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                    <button className="primary">+ Add Event</button>
                </div>
            </div>

            <div className="card" style={{ flex: 1, padding: '20px', borderRadius: '16px', overflow: viewMode === 'calendar' ? 'hidden' : 'auto' }}>
                {viewMode === 'calendar' && (
                    <FullCalendar
                        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                        initialView="dayGridMonth"
                        headerToolbar={{
                            left: 'prev,next today',
                            center: 'title',
                            right: 'dayGridMonth,timeGridWeek,timeGridDay'
                        }}
                        height="100%"
                        events={events}
                        dateClick={handleDateClick}
                        eventClick={(info) => {
                            alert('Event: ' + info.event.title);
                        }}
                        editable={true}
                        selectable={true}
                    />
                )}
                {viewMode === 'regional' && <RegionalIntelligence currentFarm={currentFarm} />}
                {viewMode === 'summary' && <RegionalSummary />}
            </div>
        </div>
    );
};

export default AgriCalendar;
