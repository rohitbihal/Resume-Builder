'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { ResumeDB } from '@/lib/db';
import styles from './dashboard.module.css';
import Navbar from '@/components/Navbar';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [resumes, setResumes] = useState([]);
  const [deleteModal, setDeleteModal] = useState({ show: false, resumeId: null });

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        const userResumes = await ResumeDB.getUserResumes(user.id);
        setResumes(userResumes);
      }
      setLoading(false);
    };
    checkUser();
  }, []);

  const handleDeleteClick = (id) => {
    setDeleteModal({ show: true, resumeId: id });
  };

  const handleConfirmDelete = async () => {
    if (!deleteModal.resumeId) return;
    
    const { error } = await supabase.from('resumes').delete().eq('id', deleteModal.resumeId);
    if (!error) {
      setResumes(resumes.filter(r => r.id !== deleteModal.resumeId));
      setDeleteModal({ show: false, resumeId: null });
    } else {
      alert('Error deleting resume: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div className={styles.dashboard} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p>Loading your creative space...</p>
      </div>
    );
  }

  return (
    <main className={styles.dashboard}>
      <Navbar />

      <div className={styles.content}>
        <header className={styles.welcome}>
          <h1 className={styles.title}>Welcome Back, {user?.email?.split('@')[0] || 'Creative'}.</h1>
          <p className={styles.subtitle}>Manage your resumes and career tracks from one place.</p>
        </header>

        {resumes.length > 0 ? (
          <section className={styles.savedSection}>
            <h2 className={styles.sectionTitle}>Your Saved Resumes</h2>
            <div className={styles.resumeGrid}>
              {resumes.map(resume => (
                <div key={resume.id} className={styles.resumeCard}>
                  <div className={styles.resumeCardContent}>
                    <h3 className={styles.resumeCardTitle}>{resume.title}</h3>
                    <p className={styles.resumeCardMeta}>
                      Track: <span style={{ textTransform: 'capitalize' }}>{resume.track}</span> • 
                      Updated {new Date(resume.updated_at).toLocaleDateString(undefined, { 
                        year: 'numeric', month: 'short', day: 'numeric' 
                      })}
                    </p>
                  </div>
                  <div className={styles.resumeCardActions}>
                    <Link href={`/builder?id=${resume.id}&preview=true`} className="cr-btn cr-btn-sm cr-btn-ghost">
                      Preview
                    </Link>
                    <Link href={`/builder?id=${resume.id}`} className="cr-btn cr-btn-sm cr-btn-secondary">
                      Edit
                    </Link>
                    <Link 
                      href={`/builder?id=${resume.id}&download=true`} 
                      className="cr-btn cr-btn-sm cr-btn-primary"
                    >
                      Download PDF
                    </Link>
                    <button 
                      className="cr-btn cr-btn-sm cr-btn-danger" 
                      onClick={() => handleDeleteClick(resume.id)}
                      title="Delete Resume"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ) : (
          <section className={styles.emptyState}>
            <div className={styles.emptyIcon}>📄</div>
            <h2 className={styles.emptyTitle}>No saved resumes yet.</h2>
            <p className={styles.emptyDesc}>Create your first professional resume in minutes using our creative templates.</p>
            <Link href="/builder" className="cr-btn cr-btn-primary">
              Create Your First Resume
            </Link>
          </section>
        )}

        <h2 className={styles.sectionTitle} style={{ marginTop: 'var(--cr-space-2xl)' }}>Create Something New</h2>
        <div className={styles.grid}>
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>New Resume</h3>
            <p className={styles.cardDesc}>
              Start with a fresh template and choose your career track to get the most relevant suggestions.
            </p>
            <div className={styles.cardCta}>
              <Link href="/builder" className="cr-btn cr-btn-primary" style={{ width: '100%', textAlign: 'center' }}>
                Create New Resume
              </Link>
            </div>
          </div>

          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Browse Templates</h3>
            <p className={styles.cardDesc}>
              Explore our collection of 5 premium creative templates designed to stand out in any industry.
            </p>
            <div className={styles.cardCta}>
              <Link href="/templates" className="cr-btn cr-btn-secondary" style={{ width: '100%', textAlign: 'center' }}>
                View Templates
              </Link>
            </div>
          </div>

          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Upgrade to Pro</h3>
            <p className={styles.cardDesc}>
              Get unlimited downloads, remove watermarks, and access all future templates.
            </p>
            <div className={styles.cardCta}>
              <Link href="/pricing" className="cr-btn cr-btn-secondary" style={{ width: '100%', textAlign: 'center' }}>
                View Plans
              </Link>
            </div>
          </div>
        </div>
      </div>

      {deleteModal.show && (
        <div className={styles.modalOverlay} onClick={() => setDeleteModal({ show: false, resumeId: null })}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Delete Resume</h3>
              <p className={styles.modalDesc}>
                Are you sure you want to delete this resume? This action cannot be undone.
              </p>
            </div>
            <div className={styles.modalActions}>
              <button 
                className="cr-btn cr-btn-ghost" 
                onClick={() => setDeleteModal({ show: false, resumeId: null })}
              >
                Cancel
              </button>
              <button 
                className="cr-btn cr-btn-danger" 
                onClick={handleConfirmDelete}
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
