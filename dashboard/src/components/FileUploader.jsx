'use client';
import { useState } from 'react';
import { api } from '@/lib/api';

export default function FileUploader({ onUploaded }) {
  const [files, setFiles] = useState(null);
  const [uploading, setUploading] = useState(false);

  const onChange = (e) => setFiles(e.target.files);

  const onUpload = async () => {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      // simple fallback: upload files to backend endpoint /api/uploads using form-data
      const form = new FormData();
      for (let f of files) form.append('files', f);
      const res = await fetch((process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000/api') + '/uploads', {
        method: 'POST',
        body: form,
        credentials: 'include',
        headers: { /* no content-type here */ }
      });
      const payload = await res.json();
      setUploading(false);
      onUploaded && onUploaded(payload);
    } catch (err) {
      setUploading(false);
      console.error(err);
      alert('Upload failed');
    }
  };

  return (
    <div className="space-y-2">
      <input type="file" multiple onChange={onChange} />
      <button onClick={onUpload} disabled={uploading} className="bg-gray-700 text-white px-3 py-1 rounded">
        {uploading ? 'Uploading...' : 'Upload'}
      </button>
    </div>
  );
}