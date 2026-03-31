import LoadingSkeleton from '@/components/UI/LoadingSkeleton';

export default function DashboardLoading() {
  return (
    <main style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ marginBottom: '3rem' }}>
        <LoadingSkeleton variant="title" width="300px" />
        <LoadingSkeleton variant="text" width="600px" />
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem' }}>
        <LoadingSkeleton variant="card" />
        <LoadingSkeleton variant="card" />
        <LoadingSkeleton variant="card" />
        <LoadingSkeleton variant="card" />
      </div>
    </main>
  );
}
