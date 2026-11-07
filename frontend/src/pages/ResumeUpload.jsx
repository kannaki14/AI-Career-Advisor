import { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { setUserStorageItem } from '../utils/sessionUser';
import { Upload, FileText, ArrowLeft } from 'lucide-react';

function ResumeUpload() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const allowedTypes = ['application/pdf'];

    if (!allowedTypes.includes(file.type)) {
      setError('Please upload a PDF resume.');
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
    setError('');
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please choose a resume first.');
      return;
    }

    setIsUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch(
        'http://127.0.0.1:8000/resume/upload',
        {
          method: 'POST',
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Resume upload failed.');
      }

      const saved = setUserStorageItem('skillProfile', JSON.stringify(data));

      if (!saved) {
        throw new Error('Please log in again before saving your profile.');
}

      navigate('/skill-profile');
    } catch (error) {
      setError(
        error.message ||
        'Unable to connect to the backend.'
      );
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="page-shell">
      <div className="container">
        <Link to="/dashboard" className="back-link">
          <ArrowLeft size={18} />
          Back to Dashboard
        </Link>

        <div className="page-header">
          <p className="eyebrow">Resume Analysis</p>
          <h1>Upload Your Resume</h1>
          <p>
            Upload your resume and let AI analyze your skills,
            education, projects, and certifications.
          </p>
        </div>

        <div className="card">
          <div
            className="upload-area"
            onClick={() => fileInputRef.current?.click()}
            style={{
              cursor: 'pointer',
              textAlign: 'center',
              padding: '3rem 1.5rem',
              border: '2px dashed var(--color-border-focus)',
              borderRadius: '12px',
            }}
          >
            <Upload size={40} />

            <h2>Choose your resume</h2>

            <p>
              PDF files are supported
            </p>

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />

            {selectedFile && (
              <div
                style={{
                  marginTop: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                }}
              >
                <FileText size={18} />
                <span>{selectedFile.name}</span>
              </div>
            )}
          </div>

          {error && (
            <p
              style={{
                color: '#dc2626',
                marginTop: '1rem',
              }}
            >
              {error}
            </p>
          )}

          <button
            type="button"
            className="btn btn-primary"
            style={{
              width: '100%',
              marginTop: '1rem',
            }}
            onClick={handleUpload}
            disabled={isUploading}
          >
            <Upload size={18} />
            {isUploading
              ? 'Analyzing Resume...'
              : 'Analyze Resume'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ResumeUpload;