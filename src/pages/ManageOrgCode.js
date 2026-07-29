import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../config/supabase';

const BackIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

// The role codes entered at the single front gate. Each sets the new member's
// org_role at sign-up via verify_org_code. Stored in the dedicated role_codes
// table (the legacy 1.0 shared code lives in organization_code and is not
// managed here, so it can never be disturbed).
const ROLE_CARDS = [
  { key: 'physician', role: 'physician', title: 'Physician Code', desc: 'Entered at the front gate to unlock the physician experience.', label: 'Physician' },
  { key: 'sales', role: 'sales', title: 'Sales Team Code', desc: 'Entered at the front gate to unlock the full sales experience.', label: 'Sales Team' },
];

const CodeCard = ({ config, row, onSaved }) => {
  const [editing, setEditing] = useState(false);
  const [newCode, setNewCode] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    const code = newCode.trim();
    if (!code) return;
    setSaving(true);
    let error;
    if (row?.id) {
      ({ error } = await supabase
        .from('role_codes')
        .update({ code, label: config.label, updated_at: new Date().toISOString() })
        .eq('id', row.id));
    } else {
      ({ error } = await supabase
        .from('role_codes')
        .insert({ code, role: config.role, label: config.label, is_active: true }));
    }
    setSaving(false);
    if (!error) {
      setEditing(false);
      setNewCode('');
      onSaved();
    }
  };

  return (
    <div style={styles.card}>
      <div style={styles.label}>{config.title}</div>
      <p style={styles.cardDesc}>{config.desc}</p>
      {!editing ? (
        <>
          <div style={styles.codeDisplay}>{row?.code || 'Not set'}</div>
          <button style={styles.editButton} onClick={() => { setEditing(true); setNewCode(row?.code || ''); }}>
            {row?.code ? 'Change Code' : 'Set Code'}
          </button>
        </>
      ) : (
        <>
          <input
            type="text"
            value={newCode}
            onChange={(e) => setNewCode(e.target.value)}
            placeholder="Enter code"
            autoFocus
            style={styles.input}
          />
          <div style={styles.buttonRow}>
            <button style={styles.cancelButton} onClick={() => { setEditing(false); setNewCode(''); }}>
              Cancel
            </button>
            <button
              style={{ ...styles.saveButton, opacity: saving || !newCode.trim() ? 0.6 : 1 }}
              onClick={handleSave}
              disabled={saving || !newCode.trim()}
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

const ManageOrgCode = () => {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCodes = async () => {
    const { data } = await supabase.from('role_codes').select('*');
    setRows(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchCodes();
  }, []);

  const rowFor = (role) => rows.find(r => r.role === role);

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.headerInner}>
          <button style={styles.backButton} onClick={() => navigate('/profile')}>
            <BackIcon />
          </button>
          <h1 style={styles.headerTitle}>Access Codes</h1>
          <div style={{ width: '24px' }} />
        </div>
        <div style={styles.headerBorder} />
      </header>

      <div style={styles.contentContainer}>
        <div style={styles.content}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted, #64748b)' }}>Loading...</div>
          ) : (
            <>
              <p style={styles.description}>
                These codes are entered at the front gate. The code a new member uses sets their role
                (physician or sales) and what they can see in the app.
              </p>
              {ROLE_CARDS.map(cfg => (
                <div key={cfg.key} style={{ marginBottom: '16px' }}>
                  <CodeCard config={cfg} row={rowFor(cfg.role)} onSaved={fetchCodes} />
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100%',
    backgroundColor: 'var(--background-off-white, #f8fafc)',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    width: '100%',
    backgroundColor: '#ffffff',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  headerInner: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 16px 8px 16px',
    maxWidth: 'var(--content-max)',
    margin: '0 auto',
  },
  backButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: 'var(--primary-blue, #1e40af)',
    padding: '4px',
  },
  headerTitle: {
    color: 'var(--primary-blue, #1e40af)',
    fontSize: '20px',
    fontWeight: '700',
    margin: 0,
  },
  headerBorder: {
    maxWidth: 'var(--content-max)',
    margin: '0 auto',
    height: '2px',
    backgroundColor: 'rgba(var(--primary-blue-rgb, 30, 64, 175), 0.15)',
    borderRadius: '1px',
  },
  contentContainer: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    overflow: 'auto',
  },
  content: {
    width: '100%',
    maxWidth: 'var(--content-max)',
    padding: '24px 16px',
  },
  description: {
    fontSize: '15px',
    color: 'var(--text-muted, #64748b)',
    lineHeight: '1.6',
    margin: '0 0 24px 0',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
  },
  label: {
    fontSize: '13px',
    fontWeight: '600',
    color: 'var(--text-muted, #64748b)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '6px',
  },
  cardDesc: {
    fontSize: '13px',
    color: 'var(--text-light, #94a3b8)',
    lineHeight: '1.5',
    margin: '0 0 12px 0',
  },
  codeDisplay: {
    fontSize: '28px',
    fontWeight: '700',
    color: 'var(--text-dark, #1e293b)',
    letterSpacing: '6px',
    textAlign: 'center',
    padding: '16px 0 20px 0',
  },
  editButton: {
    width: '100%',
    padding: '12px',
    fontSize: '15px',
    fontWeight: '600',
    color: 'var(--primary-blue, #1e40af)',
    backgroundColor: 'rgba(var(--primary-blue-rgb, 30, 64, 175), 0.08)',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
  },
  input: {
    width: '100%',
    padding: '14px 16px',
    fontSize: '20px',
    border: '2px solid var(--primary-blue, #1e40af)',
    borderRadius: '12px',
    outline: 'none',
    textAlign: 'center',
    letterSpacing: '4px',
    fontWeight: '600',
    marginBottom: '16px',
    boxSizing: 'border-box',
  },
  buttonRow: {
    display: 'flex',
    gap: '10px',
  },
  cancelButton: {
    flex: 1,
    padding: '12px',
    fontSize: '15px',
    fontWeight: '600',
    color: 'var(--text-muted, #64748b)',
    backgroundColor: 'var(--bg-light, #f1f5f9)',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
  },
  saveButton: {
    flex: 1,
    padding: '12px',
    fontSize: '15px',
    fontWeight: '600',
    color: '#ffffff',
    backgroundColor: 'var(--primary-blue, #1e40af)',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
  },
};

export default ManageOrgCode;
