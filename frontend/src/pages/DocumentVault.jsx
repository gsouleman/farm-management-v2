import React, { useEffect, useState } from 'react';
import useFarmStore from '../store/farmStore';
import useDocumentStore from '../store/documentStore';
import useUIStore from '../store/uiStore';

const DocumentVault = () => {
    const { currentFarm } = useFarmStore();
    const { documents, fetchDocuments, uploadDocument, deleteDocument, loading } = useDocumentStore();
    const { showNotification } = useUIStore();
    const [selectedFile, setSelectedFile] = useState(null);
    const [metadata, setMetadata] = useState({ document_type: 'photo', description: '' });

    useEffect(() => {
        if (currentFarm) {
            fetchDocuments(currentFarm.id);
        }
    }, [currentFarm, fetchDocuments]);

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!selectedFile) return;
        try {
            await uploadDocument(currentFarm.id, selectedFile, metadata);
            showNotification('Document uploaded successfully to the vault.', 'success');
            setSelectedFile(null);
            setMetadata({ document_type: 'photo', description: '' });
        } catch (error) {
            showNotification('Document upload failed. Please try again.', 'error');
        }
    };

    return (
        <div className="animate-fade-in" style={{ padding: '24px' }}>
            <div className="flex j-between a-center" style={{ marginBottom: '32px' }}>
                <div>
                    <h1 style={{ fontSize: '24px', margin: 0 }}>Document Vault</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Secure storage for farm deeds, soil reports, and harvest photos.</p>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '350px 1fr', gap: '24px' }}>
                {/* Upload Section */}
                <div className="card" style={{ alignSelf: 'start' }}>
                    <h3 style={{ fontSize: '16px', marginBottom: '16px' }}>Upload Document</h3>
                    <form onSubmit={handleUpload}>
                        <div style={{ marginBottom: '16px' }}>
                            <label>Select File</label>
                            <input
                                type="file"
                                onChange={(e) => setSelectedFile(e.target.files[0])}
                                style={{ fontSize: '12px' }}
                                required
                            />
                        </div>
                        <div style={{ marginBottom: '16px' }}>
                            <label>Category</label>
                            <select
                                value={metadata.document_type}
                                onChange={(e) => setMetadata({ ...metadata, document_type: e.target.value })}
                            >
                                <option value="photo">Photo (Crop/Field)</option>
                                <option value="invoice">Invoice / Receipt</option>
                                <option value="contract">Legal / Contract</option>
                                <option value="report">Soil / Lab Report</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                        <div style={{ marginBottom: '20px' }}>
                            <label>Description</label>
                            <textarea
                                value={metadata.description}
                                onChange={(e) => setMetadata({ ...metadata, description: e.target.value })}
                                placeholder="Brief summary of the document..."
                                rows="3"
                                style={{ fontSize: '12px' }}
                            />
                        </div>
                        <button type="submit" className="primary" style={{ width: '100%' }} disabled={loading || !selectedFile}>
                            {loading ? 'Uploading...' : 'Upload to Vault'}
                        </button>
                    </form>
                </div>

                {/* Document List */}
                <div className="card">
                    <h3 style={{ fontSize: '16px', marginBottom: '20px' }}>Stored Files</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
                        {documents.map(doc => (
                            <div key={doc.id} className="card" style={{ padding: '12px', position: 'relative' }}>
                                <div style={{ fontSize: '32px', marginBottom: '12px', textAlign: 'center' }}>
                                    {doc.file_type?.includes('image') ? '🖼️' : '📄'}
                                </div>
                                <div style={{ fontSize: '13px', fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{doc.file_name}</div>
                                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px' }}>{doc.document_type} • {(doc.file_size / 1024).toFixed(1)} KB</div>
                                <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                                    <a href={doc.file_url} target="_blank" rel="noreferrer" className="outline" style={{ flex: 1, fontSize: '11px', textAlign: 'center', textDecoration: 'none', padding: '4px' }}>View</a>
                                    <button
                                        className="outline"
                                        style={{ flex: 1, fontSize: '11px', color: 'var(--error)', borderColor: '#ffcdd2' }}
                                        onClick={() => deleteDocument(doc.id)}
                                    >Delete</button>
                                </div>
                            </div>
                        ))}
                        {documents.length === 0 && (
                            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                                Your vault is empty. Keep your farm records organized by uploading documents.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DocumentVault;
