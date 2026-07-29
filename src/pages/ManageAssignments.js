import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../config/supabase';

const BackIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const SearchIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

// Bulk roster for assigning product groups. Edits save immediately (no modal,
// no opening each profile). Physicians see all lines, so their rows are read-only.
const ManageAssignments = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [assignments, setAssignments] = useState({}); // userId -> Set(productId)
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    (async () => {
      const [usersRes, productsRes, upRes] = await Promise.all([
        supabase.from('users').select('id, first_name, last_name, email, org_role, is_admin, all_products').order('created_at', { ascending: false }),
        supabase.from('products').select('id, name').eq('is_active', true).order('sort_order', { ascending: true }),
        supabase.from('user_products').select('user_id, product_id'),
      ]);
      const map = {};
      (upRes.data || []).forEach(r => {
        if (!map[r.user_id]) map[r.user_id] = new Set();
        map[r.user_id].add(r.product_id);
      });
      setUsers(usersRes.data || []);
      setProducts(productsRes.data || []);
      setAssignments(map);
      setLoading(false);
    })();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter(u =>
      `${u.first_name || ''} ${u.last_name || ''}`.toLowerCase().includes(q) ||
      (u.email || '').toLowerCase().includes(q)
    );
  }, [users, search]);

  const toggleProduct = async (userId, productId) => {
    const current = assignments[userId] || new Set();
    const has = current.has(productId);
    // Optimistic
    const next = new Set(current);
    has ? next.delete(productId) : next.add(productId);
    setAssignments(prev => ({ ...prev, [userId]: next }));
    try {
      if (has) {
        await supabase.from('user_products').delete().eq('user_id', userId).eq('product_id', productId);
      } else {
        await supabase.from('user_products').insert({ user_id: userId, product_id: productId });
      }
    } catch (e) {
      console.error('Assignment save failed:', e);
      setAssignments(prev => ({ ...prev, [userId]: current })); // revert
    }
  };

  const toggleAll = async (userId, value) => {
    setUsers(prev => prev.map(u => (u.id === userId ? { ...u, all_products: value } : u)));
    try {
      await supabase.from('users').update({ all_products: value }).eq('id', userId);
    } catch (e) {
      console.error('All-products save failed:', e);
      setUsers(prev => prev.map(u => (u.id === userId ? { ...u, all_products: !value } : u)));
    }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.headerInner}>
          <button style={styles.backButton} onClick={() => navigate('/profile')}><BackIcon /></button>
          <h1 style={styles.headerTitle}>Assign Groups</h1>
          <div style={{ width: 40 }} />
        </div>
        <div style={styles.headerBorder} />
      </header>

      <div style={styles.contentContainer}>
        <div style={styles.content}>
          <p style={styles.intro}>
            Tap a group to assign or unassign it for each person. Changes save instantly.
            Physicians see all product lines and aren't assigned here.
          </p>

          <div style={styles.searchWrapper}>
            <div style={styles.searchIcon}><SearchIcon /></div>
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={styles.searchInput}
            />
          </div>

          {loading ? (
            <div style={styles.loading}><div style={styles.spinner} /></div>
          ) : products.length === 0 ? (
            <p style={styles.muted}>No products yet. Create them in Manage Products first.</p>
          ) : (
            <div style={styles.list}>
              {filtered.map(u => {
                const isPhysician = u.org_role === 'physician';
                const assigned = assignments[u.id] || new Set();
                return (
                  <div key={u.id} style={styles.card}>
                    <div style={styles.cardHead}>
                      <div style={{ minWidth: 0 }}>
                        <div style={styles.name}>{u.first_name} {u.last_name}</div>
                        <div style={styles.email}>{u.email}</div>
                      </div>
                      <span style={{ ...styles.roleBadge, ...(isPhysician ? styles.rolePhys : styles.roleRep) }}>
                        {isPhysician ? 'Physician' : 'Rep'}
                      </span>
                    </div>

                    {isPhysician ? (
                      <p style={styles.physNote}>Sees all product lines.</p>
                    ) : (
                      <>
                        <div style={styles.chips}>
                          <button
                            type="button"
                            onClick={() => toggleAll(u.id, !u.all_products)}
                            style={{ ...styles.chip, ...(u.all_products ? styles.chipAll : {}) }}
                          >
                            All
                          </button>
                          {products.map(p => {
                            const sel = !u.all_products && assigned.has(p.id);
                            return (
                              <button
                                key={p.id}
                                type="button"
                                disabled={u.all_products}
                                onClick={() => toggleProduct(u.id, p.id)}
                                style={{
                                  ...styles.chip,
                                  ...(sel ? styles.chipActive : {}),
                                  ...(u.all_products ? styles.chipDisabled : {}),
                                }}
                              >
                                {p.name}
                              </button>
                            );
                          })}
                        </div>
                        {!u.all_products && assigned.size === 0 && (
                          <p style={styles.pending}>No groups yet — this rep is waiting for assignment.</p>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}
          <div style={{ height: 40 }} />
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: { minHeight: '100vh', backgroundColor: 'var(--background-off-white)', display: 'flex', flexDirection: 'column' },
  header: { width: '100%', backgroundColor: '#ffffff', position: 'sticky', top: 0, zIndex: 100 },
  headerInner: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px 8px 16px', maxWidth: 'var(--content-max)', margin: '0 auto' },
  backButton: { width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'transparent', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--primary-blue)' },
  headerTitle: { color: 'var(--primary-blue)', fontSize: '24px', fontWeight: '700', margin: 0 },
  headerBorder: { maxWidth: 'var(--content-max)', margin: '0 auto 16px auto', height: '2px', backgroundColor: 'rgba(var(--primary-blue-rgb), 0.15)', borderRadius: '1px' },
  contentContainer: { flex: 1, display: 'flex', justifyContent: 'center', overflow: 'auto' },
  content: { width: '100%', maxWidth: 'var(--content-max)', padding: '16px' },
  intro: { fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.5', margin: '0 0 16px 0', padding: '0 4px' },
  searchWrapper: { position: 'relative', marginBottom: '16px' },
  searchIcon: { position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' },
  searchInput: { width: '100%', padding: '12px 16px 12px 44px', borderRadius: '12px', border: '1px solid #e2e8f0', backgroundColor: 'var(--background-off-white)', fontSize: '15px', color: 'var(--text-dark)', outline: 'none', boxSizing: 'border-box' },
  loading: { display: 'flex', justifyContent: 'center', padding: '40px' },
  spinner: { width: '32px', height: '32px', border: '3px solid #e2e8f0', borderTop: '3px solid var(--primary-blue)', borderRadius: '50%', animation: 'spin 1s linear infinite' },
  muted: { color: 'var(--text-muted)', fontSize: '14px', textAlign: 'center', padding: '24px' },
  list: { display: 'flex', flexDirection: 'column', gap: '12px' },
  card: { backgroundColor: '#ffffff', borderRadius: '14px', padding: '14px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' },
  cardHead: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', marginBottom: '10px' },
  name: { fontSize: '15px', fontWeight: '600', color: 'var(--text-dark)' },
  email: { fontSize: '12px', color: 'var(--text-light)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  roleBadge: { fontSize: '11px', fontWeight: '600', padding: '2px 8px', borderRadius: '10px', textTransform: 'uppercase', letterSpacing: '0.3px', flexShrink: 0 },
  rolePhys: { color: '#7c3aed', backgroundColor: '#f3e8ff' },
  roleRep: { color: 'var(--primary-blue)', backgroundColor: '#eff6ff' },
  physNote: { fontSize: '13px', color: 'var(--text-muted)', margin: 0 },
  chips: { display: 'flex', flexWrap: 'wrap', gap: '8px' },
  chip: { padding: '7px 12px', backgroundColor: 'var(--background-off-white)', border: '1px solid #e2e8f0', borderRadius: '16px', cursor: 'pointer', fontSize: '13px', fontWeight: '500', color: 'var(--text-muted)' },
  chipActive: { backgroundColor: '#eff6ff', border: '1px solid var(--primary-blue)', color: 'var(--primary-blue)' },
  chipAll: { backgroundColor: 'var(--primary-blue)', border: '1px solid var(--primary-blue)', color: '#ffffff' },
  chipDisabled: { opacity: 0.45, cursor: 'not-allowed' },
  pending: { fontSize: '12px', color: '#b45309', margin: '8px 0 0 0' },
};

export default ManageAssignments;
