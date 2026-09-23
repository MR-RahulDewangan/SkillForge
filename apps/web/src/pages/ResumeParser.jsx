import React, { useState } from 'react';
import { Upload, FileText, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import axios from 'axios';

const ResumeParser = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState('idle'); // idle | parsing | filling | success | error
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setStatus('idle');
      setError(null);
    } else {
      setError('Please upload a valid PDF file');
      setFile(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setStatus('parsing');
    setError(null);

    try {
      // 1. Upload to AI Service for parsing
      const formData = new FormData();
      formData.append('file', file);

      const parseRes = await axios.post('http://localhost:8000/parse-resume', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const parsedData = parseRes.data;

      // 2. Send parsed data to Backend for auto-filling profile
      setStatus('filling');
      await axios.post('/api/resume/autofill', { parsedData }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      setStatus('success');
    } catch (err) {
      console.error('Parsing error:', err);
      setError(err.response?.data?.detail || err.message || 'An error occurred while processing your resume');
      setStatus('error');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white p-8 rounded-3xl border shadow-sm space-y-8 text-center">
          <div className="space-y-2">
            <div className="mx-auto w-16 h-16 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mb-4">
              <Upload size={32} />
            </div>
            <h1 className="text-3xl font-bold text-slate-900">AI Resume Import</h1>
            <p className="text-slate-500">Upload your resume in PDF format and let our AI automatically populate your professional profile.</p>
          </div>

          <div className="relative group">
            <div className={`border-2 border-dashed rounded-2xl p-12 transition-all ${
              file ? 'border-green-400 bg-green-50' : 'border-slate-200 group-hover:border-indigo-400'
            }`}>
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="flex flex-col items-center gap-3">
                <FileText size={48} className={file ? 'text-green-500' : 'text-slate-300'} />
                <p className="text-sm font-medium text-slate-600">
                  {file ? `Selected: ${file.name}` : 'Click or drag and drop your resume PDF here'}
                </p>
                <p className="text-xs text-slate-400">Max file size: 5MB</p>
              </div>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-50 text-red-600 rounded-xl flex items-center gap-3 text-sm border border-red-100">
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="w-full bg-indigo-600 text-white p-4 rounded-2xl font-bold hover:bg-indigo-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {uploading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                {status === 'parsing' ? 'Parsing Resume...' : 'Updating Profile...'}
              </>
            ) : (
              'Magic Import'
            )}
          </button>

          {status === 'success' && (
            <div className="p-4 bg-green-50 text-green-600 rounded-xl flex items-center justify-center gap-3 text-sm border border-green-100 animate-bounce">
              <CheckCircle2 size={20} />
              Profile successfully updated from resume!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResumeParser;
