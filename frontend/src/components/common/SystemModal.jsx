import React from 'react';
import useUIStore from '../../store/uiStore';

const SystemModal = () => {
    const { modal, closeModal, confirmAction } = useUIStore();

    if (!modal.isOpen) return null;

    // Determine colors based on type, but default to the "Harvest" generic style or "Delete" danger style
    // The user asked for "Same look as Delete Confirmation", which usually implies a warning/danger state.
    // We will use a consistent distinct style.

    // Check if the title indicates a dangerous action
    const isDanger = modal.title.includes('REMOVAL') || modal.title.includes('DELETE') || modal.title.includes('CRITICAL');

    const stopPropagation = (e) => {
        e.stopPropagation();
    };

    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent black backdrop
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'start', // Align slightly to top like browser dialogs often do, or center
                paddingTop: '100px',
                zIndex: 9999, // Ensure it's on top of everything
                backdropFilter: 'blur(2px)'
            }}
            onClick={closeModal} // Click outside to close (optional, maybe distinct for confirm?)
        >
            <div
                style={{
                    backgroundColor: '#f8fdf9', // Very light green/white tint as per "Delete Confirmation" perception or standard clean UI
                    width: '450px',
                    maxWidth: '90%',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                    overflow: 'hidden',
                    animation: 'fadeIn 0.2s ease-out'
                }}
                onClick={stopPropagation}
            >
                {/* Header */}
                <div style={{ backgroundColor: 'var(--secondary)', padding: '12px 24px' }}>
                    <h3 style={{
                        margin: 0,
                        fontSize: '14px',
                        fontWeight: '900',
                        color: 'white',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                        <span style={{ fontSize: '16px' }}>{isDanger ? '⚠️' : '📢'}</span>
                        System Notification
                    </h3>
                </div>

                <div style={{ padding: '24px' }}>
                    <div style={{
                        fontSize: '14px',
                        fontWeight: '700',
                        color: '#000',
                        marginBottom: '8px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                    }}>
                        {modal.title}
                    </div>

                    <div style={{ borderBottom: '1px dashed #ccc', margin: '10px 0' }}></div>

                    <p style={{
                        fontSize: '14px',
                        lineHeight: '1.5',
                        color: '#333',
                        whiteSpace: 'pre-line' // Respect newlines in message
                    }}>
                        {modal.body}
                    </p>
                </div>

                {/* Footer / Actions */}
                <div style={{
                    padding: '16px 24px',
                    // backgroundColor: '#f0f0f0', 
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: '12px'
                }}>
                    {!modal.singleAction && (
                        <button
                            onClick={closeModal}
                            style={{
                                padding: '10px 24px',
                                borderRadius: '50px',
                                border: 'none',
                                backgroundColor: '#bbf7d0', // Light green
                                color: '#14532d', // Dark green text
                                fontWeight: '600',
                                cursor: 'pointer',
                                fontSize: '14px'
                            }}
                            onMouseOver={(e) => e.target.style.backgroundColor = '#86efac'}
                            onMouseOut={(e) => e.target.style.backgroundColor = '#bbf7d0'}
                        >
                            Cancel
                        </button>
                    )}

                    <button
                        onClick={modal.singleAction ? closeModal : confirmAction}
                        style={{
                            padding: '10px 24px',
                            borderRadius: '50px',
                            border: 'none',
                            backgroundColor: '#365314', // Dark green
                            color: '#fff',
                            fontWeight: '600',
                            cursor: 'pointer',
                            fontSize: '14px'
                        }}
                        onMouseOver={(e) => e.target.style.backgroundColor = '#1a2e05'}
                        onMouseOut={(e) => e.target.style.backgroundColor = '#365314'}
                    >
                        OK
                    </button>
                </div>
            </div>
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default SystemModal;
