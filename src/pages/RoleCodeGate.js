import { useState } from 'react';
import { supabase } from '../config/supabase';

// 2.0.1 single front gate (before login/signup). The user enters their
// physician or sales access code once. We validate it anon via
// check_role_code() (no session exists yet), remember the code on-device,
// then reveal Login / Sign Up. The remembered code is applied to the user's
// org_role at sign-up (see the assign effect in App.js) — so a new user is
// never asked for a code a second time.
const RoleCodeGate = ({ onVerified }) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = code.trim();
    if (!trimmed) return;

    setLoading(true);
    setError('');

    try {
      const { data, error: rpcError } = await supabase.rpc('check_role_code', {
        p_code: trimmed,
      });

      if (rpcError) {
        setError('Unable to verify code. Please try again.');
        setLoading(false);
        return;
      }

      if (data?.valid) {
        // Remember the code so the matching role is assigned at sign-up.
        localStorage.setItem('pending_org_code', trimmed);
        onVerified();
      } else {
        setError('Incorrect access code.');
      }
    } catch (err) {
      setError('Unable to verify code. Please try again.');
    }

    setLoading(false);
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.iconContainer}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--primary-blue, #1e40af)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>
        <h1 style={styles.title}>Enter Your Access Code</h1>
        <p style={styles.subtitle}>
          This app is used by physicians and representatives. Enter the access code for your role to continue.
        </p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            type="text"
            value={code}
            onChange={(e) => { setCode(e.target.value); setError(''); }}
            placeholder="Enter code"
            style={styles.input}
            autoFocus
            autoComplete="off"
          />
          {error && <p style={styles.error}>{error}</p>}
          <button
            type="submit"
            disabled={loading || !code.trim()}
            style={{
              ...styles.button,
              opacity: loading || !code.trim() ? 0.6 : 1,
            }}
          >
            {loading ? 'Verifying...' : 'Continue'}
          </button>
        </form>
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
    lineHeight: '1.5',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  input: {
    width: '100%',
    padding: '14px 16px',
    fontSize: '16px',
    border: '2px solid #e2e8f0',
    borderRadius: '12px',
    outline: 'none',
    textAlign: 'center',
    letterSpacing: '4px',
    fontWeight: '600',
    transition: 'border-color 0.2s ease',
    boxSizing: 'border-box',
  },
  error: {
    color: '#dc2626',
    fontSize: '14px',
    margin: '0',
    fontWeight: '500',
  },
  button: {
    width: '100%',
    padding: '14px',
    fontSize: '16px',
    fontWeight: '600',
    color: '#ffffff',
    backgroundColor: 'var(--primary-blue, #1e40af)',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
};

export default RoleCodeGate;
