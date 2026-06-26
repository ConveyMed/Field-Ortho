// Inline empty-state shown on Home / Resources / Field AI when a representative
// has signed in but an admin hasn't assigned their product groups yet. Mirrors
// the look of the Downloads empty state (soft, in-app — not a full-screen block).
const ClockIcon = () => (
  <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const PendingAssignmentNotice = ({ screen }) => (
  <div style={styles.wrap}>
    <div style={styles.icon}><ClockIcon /></div>
    <h3 style={styles.title}>Pending group assignment</h3>
    <p style={styles.text}>
      Your account is ready{screen ? ` — ${screen} will fill in here` : ''}. An admin still needs to
      assign your product groups. Once that's done, your content will appear automatically.
    </p>
  </div>
);

const styles = {
  wrap: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    padding: '60px 24px',
    color: 'var(--text-light, #94a3b8)',
  },
  icon: {
    color: 'var(--primary-blue, #1e40af)',
    opacity: 0.6,
    marginBottom: '14px',
  },
  title: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#475569',
    margin: '0 0 8px 0',
  },
  text: {
    fontSize: '14px',
    color: 'var(--text-muted, #64748b)',
    lineHeight: '1.5',
    maxWidth: '300px',
    margin: 0,
  },
};

export default PendingAssignmentNotice;
