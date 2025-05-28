import React, { useState } from 'react';
import { askDocumentQuestion } from '../services/api';

function DocumentItem({ document, onDelete }) {
    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState('');
    const [isLoadingQA, setIsLoadingQA] = useState(false);
    const [qaError, setQaError] = useState('');

    const handleAskQuestion = async (e) => {
        e.preventDefault();
        if (!question.trim()) {
            setQaError("Please enter a question.");
            return;
        }
        setIsLoadingQA(true);
        setAnswer('');
        setQaError('');
        try {
            const response = await askDocumentQuestion(document.id, question);
            setAnswer(response.data.answer);
        } catch (err) {
            setQaError(err.response?.data?.error || "Failed to get an answer.");
            console.error("QA Error:", err);
        }
        setIsLoadingQA(false);
    };

    return (
        <li className="document-item">
            <h4>{document.original_filename}</h4>
            <p><small>Uploaded: {new Date(document.uploaded_at).toLocaleString()}</small></p>
            {document.file && <p><a href={document.file} target="_blank" rel="noopener noreferrer">View/Download File</a></p>}
            <p>
                <strong>Extracted Text (Preview):</strong>
                <em style={{ display: 'block', maxHeight: '100px', overflowY: 'auto', fontSize: '0.9em', color: '#555' }}>
                    {document.extracted_text ? document.extracted_text.substring(0, 300) + '...' : 'No text extracted or processing.'}
                </em>
            </p>
            <button onClick={() => onDelete(document.id)} style={{backgroundColor: '#d9534f', marginRight: '10px'}}>Delete</button>

            <div className="qa-section">
                <form onSubmit={handleAskQuestion}>
                    <input
                        type="text"
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        placeholder="Ask a question about this document"
                    />
                    <button type="submit" disabled={isLoadingQA}>
                        {isLoadingQA ? 'Asking...' : 'Ask AI'}
                    </button>
                </form>
                {qaError && <p className="error-message" style={{marginTop: '10px'}}>{qaError}</p>}
                {answer && (
                    <div className="qa-result">
                        <p><strong>Q:</strong> {question}</p>
                        <p><strong>A:</strong> {answer}</p>
                    </div>
                )}
            </div>
        </li>
    );
}

export default DocumentItem;