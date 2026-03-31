'use client';

import { useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import styles from './ImageUpload.module.css';

export default function ImageUpload({ value, onChange }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleUpload = async (event) => {
    try {
      setUploading(true);
      setError(null);

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Upload the file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Get the public URL for the uploaded file
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      onChange(publicUrl);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = () => {
    onChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={styles.uploadContainer}>
      <div className={styles.label}>Profile Photo</div>
      <div className={styles.content}>
        {value ? (
          <div className={styles.previewContainer}>
            <img src={value} alt="Profile" className={styles.preview} />
            <div className={styles.overlay}>
              <button 
                type="button" 
                onClick={() => fileInputRef.current?.click()}
                className={styles.changeBtn}
              >
                Change
              </button>
              <button 
                type="button" 
                onClick={removePhoto}
                className={styles.removeBtn}
              >
                Remove
              </button>
            </div>
          </div>
        ) : (
          <button 
            type="button"
            className={styles.uploadPlaceholder}
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            <div className={styles.icon}>
              {uploading ? (
                <span className={styles.spinner}></span>
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
                </svg>
              )}
            </div>
            <span>{uploading ? 'Uploading...' : 'Upload Photo'}</span>
          </button>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleUpload}
          style={{ display: 'none' }}
        />
      </div>
      {error && <p className={styles.error}>{error}</p>}
      <p className={styles.hint}>JPG, PNG or WEBP. Max 2MB.</p>
    </div>
  );
}
