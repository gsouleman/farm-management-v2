import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import useAuthStore from '../store/authStore';
import useFarmStore from '../store/farmStore';
import useActivityStore from '../store/activityStore';
import useUIStore from '../store/uiStore';
import '../App.css';

import RegionalIntelligence from '../components/calendar/RegionalIntelligence.jsx';
import RegionalSummary from '../components/calendar/RegionalSummary.jsx';
import ActivityForm from '../components/activities/ActivityForm';

const AgriCalendar = () => {
    const { currentFarm } = useFarmStore();
    const { activities, fetchActivitiesByFarm, deleteActivity } = useActivityStore();
    const { showNotification, showAlert } = useUIStore();

    const [events, setEvents] = useState([]);
    const [viewMode, setViewMode] = useState('calendar'); // 'calendar', 'regional', 'summary'
    const [showActivityModal, setShowActivityModal] = useState(false);
    const [selectedActivity, setSelectedActivity] = useState(null);

    useEffect(() => {
        if (currentFarm) {
            fetchActivitiesByFarm(currentFarm.id);
        }
    }, [currentFarm, fetchActivitiesByFarm]);

    useEffect(() => {
        if (activities && activities.length > 0) {
            const mappedEvents = activities.map(act => ({
                id: act.id,
                title: `${act.activity_type} - ${act.field?.name || 'Field'}`,
                date: act.activity_date,
                extendedProps: { ...act },
                color: getEventColor(act.activity_type)
            }));
            setEvents(mappedEvents);
        } else {
            setEvents([]);
        }
    }, [activities]);

    const getEventColor = (type) => {
        switch (type) {
            case 'planting': return '#2f855a';
            case 'harvesting': return '#c05621';
            case 'fertilizing': return '#dd6b20';
            case 'spraying': return '#e53e3e';
            case 'irrigation': return '#3182ce';
            default: return '#718096';
        }
    };

    const handleDateClick = (arg) => {
        setSelectedActivity(null); // Clear selection for new event
        // Optional: Pass clicked date as initialData if ActivityForm supports it
        // For now just open clean form
        setShowActivityModal(true);
    };

    const handleEventClick = (info) => {
        const activityData = info.event.extendedProps;
        setSelectedActivity(activityData);
        setShowActivityModal(true);
    };

    const handleDelete = async () => {
        if (!selectedActivity) return;

        if (window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
            try {
                await deleteActivity(selectedActivity.id);
                showNotification('Event deleted successfully', 'success');
                setShowActivityModal(false);
            } catch (error) {
                console.error('Failed to delete activity:', error);
                showAlert('DELETE_FAILED');
            }
        }
    };

    return (
        <div className="animate-fade-in" style={{ padding: '24px', height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
            <div className="flex j-between a-center" style={{ marginBottom: '24px' }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: '800', margin: 0, color: 'var(--secondary)' }}>Scheduler</h1>
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
                    <button
                        className="primary"
                        onClick={() => {
                            setSelectedActivity(null);
                            setShowActivityModal(true);
                        }}
                    >
                        + Add Event
                    </button>
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
                        eventClick={handleEventClick}
                        editable={true}
                        selectable={true}
                    />
                )}
                {viewMode === 'regional' && <RegionalIntelligence currentFarm={currentFarm} />}
                {viewMode === 'summary' && <RegionalSummary />}
            </div>

            {/* Activity Form Modal */}
            {showActivityModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 1000,
                    backdropFilter: 'blur(5px)'
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        width: '90%',
                        maxWidth: '1000px',
                        height: '90vh',
                        borderRadius: '16px',
                        overflowY: 'auto',
                        padding: '20px',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                        position: 'relative'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            {/* Delete Button (Only if editing) */}
                            {selectedActivity ? (
                                <button
                                    onClick={handleDelete}
                                    style={{
                                        backgroundColor: '#fff5f5',
                                        color: '#c53030',
                                        border: '1px solid #fc8181',
                                        borderRadius: '8px',
                                        padding: '8px 16px',
                                        fontWeight: '700',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px'
                                    }}
                                >
                                    🗑️ Delete Event
                                </button>
                            ) : <div></div>}

                            <button
                                onClick={() => setShowActivityModal(false)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    fontSize: '24px',
                                    cursor: 'pointer',
                                    padding: '8px'
                                }}
                            >
                                ✕
                            </button>
                        </div>
                        <ActivityForm
                            onComplete={() => setShowActivityModal(false)}
                            initialData={selectedActivity}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default AgriCalendar;
