import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDocuments, uploadDocument, deleteDocument } from '../services/api';
import DocumentItem from '../components/DocumentItem';

function DashboardPage() {
    const [documents, setDocuments] = useState([]);
    const [file, setFile] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0); // Optional
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const fetchDocuments = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await getDocuments();
            setDocuments(response.data);
            setError('');
        } catch (err) {
            console.error("Error fetching documents:", err);
            setError('Failed to fetch documents.');
        }
        setIsLoading(false);
    }, []);

    useEffect(() => {
        fetchDocuments();
    }, [fetchDocuments]);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        setUploadProgress(0);
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file) {
            setError('Please select a file to upload.');
            return;
        }
        const formData = new FormData();
        formData.append('file', file);

        setIsLoading(true);
        setError('');
        try {
            // Note: uploadDocument from api.js uses apiClient which has interceptors
            await uploadDocument(formData, {
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgress(percentCompleted);
                }
            });
            setFile(null);
            const fileInput = document.getElementById('file-input');
            if (fileInput) fileInput.value = "";
            setUploadProgress(100);
            fetchDocuments();
            setTimeout(() => setUploadProgress(0), 2000);
        } catch (err) {
            console.error("Upload error:", err);
            setError(err.response?.data?.detail || err.response?.data?.file?.[0] || 'Failed to upload document.');
            setUploadProgress(0);
        }
        setIsLoading(false);
    };

    const handleDeleteDocument = async (docId) => {
        if (window.confirm('Are you sure you want to delete this document?')) {
            setIsLoading(true);
            try {
                await deleteDocument(docId);
                fetchDocuments();
            } catch (err) {
                console.error("Delete error:", err);
                setError('Failed to delete document.');
            }
            setIsLoading(false);
        }
    };

    return (
        <div className="container">
            <h2>My Dashboard</h2>
            {error && <p className="error-message">{error}</p>}

            <h3>Upload New Document</h3>
            <form onSubmit={handleUpload}>
                <input type="file" id="file-input" onChange={handleFileChange} accept=".pdf,.txt,.png,.jpg,.jpeg"/>
                {uploadProgress > 0 && (
                    <div style={{ width: '100%', backgroundColor: '#ddd', borderRadius: '5px', margin: '10px 0' }}>
                        <div style={{ width: `${uploadProgress}%`, backgroundColor: 'green', color: 'white', textAlign: 'center', lineHeight: '20px', borderRadius: '5px' }}>
                            {uploadProgress}%
                        </div>
                    </div>
                )}
                <button type="submit" disabled={isLoading || !file}>
                    {isLoading && file ? 'Uploading...' : 'Upload Document'}
                </button>
            </form>

            <h3>My Documents</h3>
            {isLoading && documents.length === 0 && <p>Loading documents...</p>}
            {!isLoading && documents.length === 0 && <p>No documents uploaded yet.</p>}
            <ul>
                {documents.map(doc => (
                    <DocumentItem key={doc.id} document={doc} onDelete={handleDeleteDocument} />
                ))}
            </ul>
        </div>
    );
}

export default DashboardPage;