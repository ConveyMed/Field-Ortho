import { useAuth } from '../context/AuthContext';

// Shown to a representative who has signed in but has no product lines assigned
// yet (and isn't flagged "all products"). They wait here until an admin assigns
// products. Admins and physicians never see this.
const ProductWaiting = () => {
  const { signOut } = useAuth();

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.iconContainer}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--primary-blue, #1e40af)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        </div>
        <h1 style={styles.title}>You're almost set</h1>
        <p style={styles.subtitle}>
          Your account is ready. An admin still needs to assign your product lines. Once that's done,
          your resources, updates, and AI assistant will appear here automatically.
        </p>
        <button style={styles.button} onClick={signOut}>
          Log Out
        </button>
      </div>
      <p style={{ marginTop: '24px', fontSize: '0.65rem', color: 'rgba(255,255,255,0.15)' }}>
        Produced by <a href="https://appcatalyst.org" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>AppCatalyst</a> for ConveyMed
      </p>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'var(--primary-blue, #1e40af)',
    padding: '24px',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '20px',
    padding: '40px 32px',
    width: '100%',
    maxWidth: '400px',
    textAlign: 'center',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
  },
  iconContainer: {
    marginBottom: '20px',
  },
  title: {
    fontSize: '22px',
    fontWeight: '700',
    color: '#1e293b',
    margin: '0 0 8px 0',
  },
  subtitle: {
    fontSize: '15px',
    color: '#64748b',
    margin: '0 0 28px 0',
    lineHeight: '1.6',
  },
  button: {
    width: '100%',
    padding: '14px',
    fontSize: '16px',
    fontWeight: '600',
    color: 'var(--primary-blue, #1e40af)',
    backgroundColor: 'rgba(var(--primary-blue-rgb, 30, 64, 175), 0.08)',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
  },
};

export default ProductWaiting;
