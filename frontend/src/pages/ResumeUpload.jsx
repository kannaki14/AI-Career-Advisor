import { useRef, useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  CloudUpload,
  FileText,
  GraduationCap,
  BriefcaseBusiness,
  Award,
  FolderKanban,
  X,
  Upload,
} from 'lucide-react';
import { Link } from 'react-router-dom';

function ResumeUpload() {
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState('');

  const validateFile = (file) => {
    if (!file) return;

    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    const fileName = file.name.toLowerCase();
    const isValidExtension =
      fileName.endsWith('.pdf') || fileName.endsWith('.docx');

    if (!allowedTypes.includes(file.type) && !isValidExtension) {
      setError('Please choose a PDF or DOCX file.');
      setSelectedFile(null);
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('Your resume must be smaller than 10 MB.');
      setSelectedFile(null);
      return;
    }

    setError('');
    setSelectedFile(file);
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    validateFile(file);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    validateFile(file);
  };

  const removeFile = () => {
    setSelectedFile(null);
    setError('');

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  return (
    <main className="page-section">
      <div className="page-container">
        <div style={{ marginBottom: '2rem' }}>
          <Link to="/dashboard" className="link">
            <ArrowLeft size={18} />
            Back to Dashboard
          </Link>
        </div>

        <div
          style={{
            maxWidth: '760px',
            margin: '0 auto',
          }}
        >
          <div
            style={{
              textAlign: 'center',
              marginBottom: '2rem',
            }}
          >
            <div
              style={{
                width: '56px',
                height: '56px',
                margin: '0 auto 1rem',
                borderRadius: '16px',
                display: 'grid',
                placeItems: 'center',
                background: '#ede9fe',
                color: '#5b45e6',
              }}
            >
              <CloudUpload size={28} />
            </div>

            <h1 className="heading">Upload Your Resume</h1>

            <p
              style={{
                maxWidth: '620px',
                margin: '0.75rem auto 0',
                color: '#64748b',
                lineHeight: 1.7,
              }}
            >
              Upload your resume and we'll analyze your skills, education,
              projects, and experience.
            </p>
          </div>

          <section
            className="card"
            style={{
              padding: '1.5rem',
              marginBottom: '1.5rem',
            }}
          >
            {!selectedFile ? (
              <div
                onDragOver={(event) => event.preventDefault()}
                onDrop={handleDrop}
                onClick={openFilePicker}
                style={{
                  minHeight: '280px',
                  border: '2px dashed #cbd5e1',
                  borderRadius: '18px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  padding: '2rem',
                  cursor: 'pointer',
                  background: '#fafbff',
                }}
              >
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '18px',
                    display: 'grid',
                    placeItems: 'center',
                    background: '#ede9fe',
                    color: '#5b45e6',
                    marginBottom: '1rem',
                  }}
                >
                  <CloudUpload size={32} />
                </div>

                <h2
                  style={{
                    margin: 0,
                    fontSize: '1.2rem',
                    color: '#0f172a',
                  }}
                >
                  Drag & drop your resume here
                </h2>

                <p
                  style={{
                    margin: '0.5rem 0 1rem',
                    color: '#64748b',
                  }}
                >
                  or choose a file from your device
                </p>

                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={(event) => {
                    event.stopPropagation();
                    openFilePicker();
                  }}
                >
                  <FileText size={18} />
                  Choose Resume
                </button>

                <p
                  style={{
                    margin: '1rem 0 0',
                    fontSize: '0.85rem',
                    color: '#94a3b8',
                  }}
                >
                  PDF or DOCX • Maximum 10 MB
                </p>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={handleFileChange}
                  hidden
                />
              </div>
            ) : (
              <div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '1rem',
                    border: '1px solid #e2e8f0',
                    borderRadius: '14px',
                    background: '#fafbff',
                  }}
                >
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      flexShrink: 0,
                      borderRadius: '12px',
                      display: 'grid',
                      placeItems: 'center',
                      background: '#ede9fe',
                      color: '#5b45e6',
                    }}
                  >
                    <FileText size={24} />
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p
                      style={{
                        margin: 0,
                        fontWeight: 600,
                        color: '#0f172a',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {selectedFile.name}
                    </p>

                    <p
                      style={{
                        margin: '0.25rem 0 0',
                        color: '#64748b',
                        fontSize: '0.85rem',
                      }}
                    >
                      {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={removeFile}
                    aria-label="Remove selected resume"
                    style={{
                      width: '40px',
                      height: '40px',
                      border: 'none',
                      borderRadius: '10px',
                      display: 'grid',
                      placeItems: 'center',
                      background: '#f1f5f9',
                      color: '#475569',
                      cursor: 'pointer',
                    }}
                  >
                    <X size={20} />
                  </button>
                </div>

                <button
                  type="button"
                  className="btn btn-primary"
                  style={{
                    width: '100%',
                    marginTop: '1rem',
                  }}
                  onClick={() => {
                    alert('Resume upload will be connected to the backend later.');
                  }}
                >
                  <Upload size={18} />
                  Analyze Resume
                </button>
              </div>
            )}

            {error && (
              <p
                role="alert"
                style={{
                  margin: '1rem 0 0',
                  padding: '0.75rem 1rem',
                  borderRadius: '10px',
                  background: '#fef2f2',
                  color: '#b91c1c',
                  fontSize: '0.9rem',
                }}
              >
                {error}
              </p>
            )}
          </section>

          <section
            className="card"
            style={{
              padding: '1.5rem',
              marginBottom: '1.5rem',
            }}
          >
            <h2
              style={{
                margin: '0 0 1rem',
                fontSize: '1.1rem',
                color: '#0f172a',
              }}
            >
              We'll extract
            </h2>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                gap: '0.85rem',
              }}
            >
              {[
                ['Skills', CheckCircle2],
                ['Education', GraduationCap],
                ['Projects', FolderKanban],
                ['Certifications', Award],
                ['Experience', BriefcaseBusiness],
              ].map(([label, Icon]) => (
                <div
                  key={label}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.65rem',
                    color: '#475569',
                  }}
                >
                  <Icon size={18} color="#5b45e6" />
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </section>

          <div
            style={{
              textAlign: 'center',
              color: '#64748b',
              fontSize: '0.9rem',
              lineHeight: 1.6,
            }}
          >
            <p style={{ margin: 0 }}>
              🔒 Your resume is used only to create your personalized career
              profile.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

export default ResumeUpload;