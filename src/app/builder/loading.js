import LoadingSkeleton from '@/components/UI/LoadingSkeleton';

export default function BuilderLoading() {
  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* Sidebar Skeleton */}
      <aside style={{ width: '320px', borderRight: '1px solid var(--cr-border)', padding: '1.5rem' }}>
        <LoadingSkeleton variant="title" width="200px" style={{ marginBottom: '2rem' }} />
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} style={{ marginBottom: '1.5rem' }}>
            <LoadingSkeleton variant="text" width="60%" />
            <LoadingSkeleton variant="text" />
          </div>
        ))}
      </aside>

      {/* Main Preview Area Skeleton */}
      <main style={{ flex: 1, backgroundColor: 'var(--cr-background-subtle)', padding: '3rem', overflow: 'auto' }}>
        <div style={{ 
          maxWidth: '800px', 
          margin: '0 auto', 
          backgroundColor: 'white', 
          aspectRatio: '1/1.414', 
          boxShadow: 'var(--cr-shadow-lg)',
          padding: '4rem' 
        }}>
          <LoadingSkeleton variant="title" width="400px" height="3rem" />
          <LoadingSkeleton variant="text" width="300px" />
          <div style={{ marginTop: '3rem' }}>
            <LoadingSkeleton variant="text" />
            <LoadingSkeleton variant="text" />
            <LoadingSkeleton variant="text" width="80%" />
          </div>
          <div style={{ marginTop: '2rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            <div style={{ flex: 1 }}><LoadingSkeleton variant="card" height="150px" /></div>
            <div style={{ flex: 1 }}><LoadingSkeleton variant="card" height="150px" /></div>
          </div>
        </div>
      </main>
    </div>
  );
}
