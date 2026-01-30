import React, { useState } from 'react';
import useActivityStore from '../../store/activityStore';
import useFarmStore from '../../store/farmStore';

const BulkActivityModal = ({ isOpen, onClose }) => {
    const [file, setFile] = useState(null);
    const [status, setStatus] = useState('idle'); // idle, uploading, success, error
    const [message, setMessage] = useState('');
    const { bulkUploadActivities } = useActivityStore();
    const { currentFarm } = useFarmStore();

    if (!isOpen) return null;

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        setStatus('idle');
    };

    const handleUpload = async () => {
        if (!file || !currentFarm?.id) return;

        setStatus('uploading');
        try {
            const result = await bulkUploadActivities(currentFarm.id, file);
            setStatus('success');
            setMessage(result.message || 'Import successful!');
            setTimeout(() => {
                onClose();
                setFile(null);
                setStatus('idle');
            }, 2000);
        } catch (error) {
            setStatus('error');
            setMessage(error.response?.data?.message || 'Error uploading file. Please ensure columns match the ledger format.');
        }
    };

    return (
        <div className="modal-overlay" style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.85)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 10000,
            backdropFilter: 'blur(5px)'
        }}>
            <div className="glass-card" style={{
                width: '500px',
                padding: '30px',
                position: 'relative',
                border: '2px solid #bb1919',
                backgroundColor: '#fff'
            }}>
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '15px',
                        right: '15px',
                        background: 'none',
                        border: 'none',
                        fontSize: '20px',
                        cursor: 'pointer',
                        color: '#333'
                    }}
                >
                    &times;
                </button>

                <div style={{ textAlign: 'center', marginBottom: '25px' }}>
                    <h2 style={{
                        color: '#bb1919',
                        margin: 0,
                        fontSize: '24px',
                        fontWeight: '900',
                        textTransform: 'uppercase',
                        letterSpacing: '1px'
                    }}>
                        Bulk Log Activities
                    </h2>
                    <p style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                        Upload operational data to synchronize system ledgers.
                    </p>
                </div>

                <div style={{
                    border: '2px dashed #ddd',
                    padding: '40px 20px',
                    textAlign: 'center',
                    borderRadius: '8px',
                    backgroundColor: '#f9f9f9',
                    marginBottom: '20px'
                }}>
                    <input
                        type="file"
                        id="bulk-file"
                        onChange={handleFileChange}
                        accept=".csv, .xlsx, .xlsm, .xml, .pdf, .docx"
                        style={{ display: 'none' }}
                    />
                    <label htmlFor="bulk-file" style={{ cursor: 'pointer' }}>
                        <div style={{ fontSize: '40px', marginBottom: '10px' }}>📁</div>
                        <div style={{ fontWeight: 'bold', color: '#333' }}>
                            {file ? file.name : 'Click to select or drag document'}
                        </div>
                        <div style={{ fontSize: '11px', color: '#888', marginTop: '8px' }}>
                            Accepted: CSV, XLSX, XLSM, XML, PDF, DOCX
                        </div>
                    </label>
                </div>

                {status === 'success' && (
                    <div style={{
                        padding: '12px',
                        backgroundColor: '#e6fffa',
                        color: '#2c7a7b',
                        borderRadius: '4px',
                        fontSize: '13px',
                        textAlign: 'center',
                        marginBottom: '15px',
                        fontWeight: 'bold'
                    }}>
                        ✓ {message}
                    </div>
                )}

                {status === 'error' && (
                    <div style={{
                        padding: '12px',
                        backgroundColor: '#fff5f5',
                        color: '#c53030',
                        borderRadius: '4px',
                        fontSize: '13px',
                        textAlign: 'center',
                        marginBottom: '15px',
                        fontWeight: 'bold'
                    }}>
                        ⚠ {message}
                    </div>
                )}

                <div style={{ display: 'flex', gap: '15px' }}>
                    <button
                        className="outline"
                        onClick={onClose}
                        style={{ flex: 1, padding: '12px', fontWeight: 'bold' }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleUpload}
                        disabled={!file || status === 'uploading'}
                        style={{
                            flex: 1,
                            padding: '12px',
                            backgroundColor: '#000',
                            color: 'white',
                            fontWeight: 'bold',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: (!file || status === 'uploading') ? 'not-allowed' : 'pointer',
                            opacity: (!file || status === 'uploading') ? 0.6 : 1
                        }}
                    >
                        {status === 'uploading' ? 'Analyzing Files...' : 'Start Import'}
                    </button>
                </div>

                <div style={{ marginTop: '20px', fontSize: '10px', color: '#999', textAlign: 'center' }}>
                    * Files should be formatted with columns matching the Field Operations Timeline.
                </div>
            </div>
        </div>
    );
};

export default BulkActivityModal;
