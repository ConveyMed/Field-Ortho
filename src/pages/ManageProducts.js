import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../config/supabase';

const BackIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const PlusIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const CloseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const PackageIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16.5 9.4 7.5 4.21" />
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
    <line x1="12" y1="22.08" x2="12" y2="12" />
  </svg>
);

const TrashIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

const ManageProducts = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Modal: null = closed, 'new' = creating, object = editing
  const [editing, setEditing] = useState(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editActive, setEditActive] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: true });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const openNew = () => {
    setEditing('new');
    setEditName('');
    setEditDescription('');
    setEditActive(true);
    setShowDeleteConfirm(false);
  };

  const openEdit = (product) => {
    setEditing(product);
    setEditName(product.name || '');
    setEditDescription(product.description || '');
    setEditActive(product.is_active !== false);
    setShowDeleteConfirm(false);
  };

  const closeModal = () => {
    setEditing(null);
    setShowDeleteConfirm(false);
  };

  const handleSave = async () => {
    if (!editName.trim()) {
      alert('Product name is required');
      return;
    }
    setSaving(true);
    try {
      if (editing === 'new') {
        const { data: { user } } = await supabase.auth.getUser();
        const nextSort = products.length
          ? Math.max(...products.map(p => p.sort_order || 0)) + 1
          : 0;
        const { data, error } = await supabase
          .from('products')
          .insert({
            name: editName.trim(),
            description: editDescription.trim() || null,
            is_active: editActive,
            sort_order: nextSort,
            created_by: user?.id || null,
          })
          .select()
          .single();
        if (error) throw error;
        setProducts(prev => [...prev, data]);
      } else {
        const updateData = {
          name: editName.trim(),
          description: editDescription.trim() || null,
          is_active: editActive,
          updated_at: new Date().toISOString(),
        };
        const { error } = await supabase
          .from('products')
          .update(updateData)
          .eq('id', editing.id);
        if (error) throw error;
        setProducts(prev => prev.map(p => (p.id === editing.id ? { ...p, ...updateData } : p)));
      }
      closeModal();
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Failed to save product: ' + (error.message || 'Unknown error'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!editing || editing === 'new') return;
    setDeleting(true);
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', editing.id);
      if (error) throw error;
      setProducts(prev => prev.filter(p => p.id !== editing.id));
      closeModal();
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product: ' + (error.message || 'Unknown error'));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.headerInner}>
          <button style={styles.backButton} onClick={() => navigate(-1)}>
            <BackIcon />
          </button>
          <h1 style={styles.headerTitle}>Manage Products</h1>
          <button style={styles.backButton} onClick={openNew}>
            <PlusIcon />
          </button>
        </div>
        <div style={styles.headerBorder} />
      </header>

      <div style={styles.contentContainer}>
        <div style={styles.content}>
          <p style={styles.introText}>
            Product lines power what each user sees across Home, AI, and Resources.
            Create a product here, then assign it to users in Manage Users.
          </p>

          {loading ? (
            <div style={styles.loadingContainer}>
              <div style={styles.spinner} />
              <p style={styles.loadingText}>Loading products...</p>
            </div>
          ) : products.length === 0 ? (
            <div style={styles.emptyState}>
              <PackageIcon />
              <p style={styles.emptyText}>No products yet</p>
              <button style={styles.emptyButton} onClick={openNew}>
                <PlusIcon />
                <span>Create your first product</span>
              </button>
            </div>
          ) : (
            <div style={styles.productList}>
              {products.map(product => (
                <button
                  key={product.id}
                  style={styles.productCard}
                  onClick={() => openEdit(product)}
                >
                  <div style={styles.productIcon}>
                    <PackageIcon />
                  </div>
                  <div style={styles.productInfo}>
                    <div style={styles.productNameRow}>
                      <span style={styles.productName}>{product.name}</span>
                      {product.is_active === false && (
                        <span style={styles.inactiveBadge}>Hidden</span>
                      )}
                    </div>
                    {product.description && (
                      <span style={styles.productDescription}>{product.description}</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}

          <div style={{ height: '40px' }} />
        </div>
      </div>

      {editing && (
        <div style={styles.modalOverlay} onClick={closeModal}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>
                {showDeleteConfirm ? 'Delete Product' : editing === 'new' ? 'New Product' : 'Edit Product'}
              </h2>
              <button style={styles.closeButton} onClick={closeModal}>
                <CloseIcon />
              </button>
            </div>

            {showDeleteConfirm ? (
              <>
                <div style={styles.deleteConfirmSection}>
                  <div style={styles.deleteIconWrapper}>
                    <span style={styles.deleteIconLarge}><TrashIcon /></span>
                  </div>
                  <h3 style={styles.deleteConfirmTitle}>Delete {editing.name}?</h3>
                  <p style={styles.deleteConfirmText}>
                    This removes the product and unassigns it from all users and content.
                    This cannot be undone. To simply hide it, edit and turn off "Active" instead.
                  </p>
                </div>
                <div style={styles.modalActions}>
                  <button style={styles.cancelButton} onClick={() => setShowDeleteConfirm(false)} disabled={deleting}>
                    Cancel
                  </button>
                  <button style={styles.deleteConfirmButton} onClick={handleDelete} disabled={deleting}>
                    {deleting ? 'Deleting...' : 'Yes, Delete'}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div style={styles.detailsSection}>
                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>Product Name</label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      style={styles.formInput}
                      placeholder="e.g. Griplasty"
                      autoFocus
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>Description (optional)</label>
                    <textarea
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      style={{ ...styles.formInput, minHeight: '72px', resize: 'vertical' }}
                      placeholder="Short description of this product line"
                    />
                  </div>

                  <div style={styles.toggleRow}>
                    <div>
                      <div style={styles.toggleLabel}>Active</div>
                      <p style={styles.toggleHint}>When off, this product is hidden from assignment and filtering.</p>
                    </div>
                    <button
                      style={{
                        ...styles.toggle,
                        backgroundColor: editActive ? 'var(--primary-blue)' : 'var(--border-light)',
                      }}
                      onClick={() => setEditActive(!editActive)}
                    >
                      <div style={{
                        ...styles.toggleKnob,
                        transform: editActive ? 'translateX(20px)' : 'translateX(0)',
                      }} />
                    </button>
                  </div>

                  {editing !== 'new' && (
                    <button style={styles.deleteButton} onClick={() => setShowDeleteConfirm(true)}>
                      <TrashIcon />
                      <span>Delete Product</span>
                    </button>
                  )}
                </div>

                <div style={styles.modalActions}>
                  <button style={styles.cancelButton} onClick={closeModal} disabled={saving}>
                    Cancel
                  </button>
                  <button style={styles.saveButton} onClick={handleSave} disabled={saving}>
                    {saving ? 'Saving...' : editing === 'new' ? 'Create Product' : 'Save Changes'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: 'var(--background-off-white)',
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
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: 'transparent',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: 'var(--primary-blue)',
  },
  headerTitle: {
    color: 'var(--primary-blue)',
    fontSize: '24px',
    fontWeight: '700',
    margin: 0,
  },
  headerBorder: {
    maxWidth: 'var(--content-max)',
    margin: '0 auto 16px auto',
    height: '2px',
    backgroundColor: 'rgba(var(--primary-blue-rgb), 0.15)',
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
    padding: '16px',
  },
  introText: {
    fontSize: '13px',
    color: 'var(--text-muted)',
    lineHeight: '1.5',
    margin: '0 0 16px 0',
    padding: '0 4px',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 20px',
  },
  spinner: {
    width: '32px',
    height: '32px',
    border: '3px solid #e2e8f0',
    borderTop: '3px solid var(--primary-blue)',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  loadingText: {
    marginTop: '16px',
    color: 'var(--text-muted)',
    fontSize: '14px',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 20px',
    color: 'var(--text-light)',
    gap: '12px',
  },
  emptyText: {
    color: 'var(--text-muted)',
    fontSize: '15px',
    margin: 0,
  },
  emptyButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 20px',
    backgroundColor: 'var(--primary-blue)',
    color: '#ffffff',
    border: 'none',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  productList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  productCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    padding: '16px',
    backgroundColor: '#ffffff',
    borderRadius: '14px',
    border: 'none',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.06)',
    cursor: 'pointer',
    textAlign: 'left',
    width: '100%',
  },
  productIcon: {
    width: '44px',
    height: '44px',
    borderRadius: '12px',
    backgroundColor: 'var(--bg-light)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--primary-blue)',
    flexShrink: 0,
  },
  productInfo: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  productNameRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  productName: {
    fontSize: '16px',
    fontWeight: '600',
    color: 'var(--text-dark)',
  },
  inactiveBadge: {
    fontSize: '11px',
    fontWeight: '600',
    padding: '2px 8px',
    borderRadius: '10px',
    textTransform: 'uppercase',
    letterSpacing: '0.3px',
    color: 'var(--text-muted)',
    backgroundColor: 'var(--bg-light)',
  },
  productDescription: {
    fontSize: '13px',
    color: 'var(--text-muted)',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px',
    paddingTop: 'calc(20px + env(safe-area-inset-top, 0px))',
    paddingBottom: 'calc(100px + env(safe-area-inset-bottom, 0px))',
  },
  modal: {
    backgroundColor: '#ffffff',
    borderRadius: '24px',
    width: '100%',
    maxWidth: '420px',
    maxHeight: 'calc(100vh - 140px - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px))',
    overflow: 'auto',
  },
  modalHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '20px',
    borderBottom: '1px solid #f1f5f9',
  },
  modalTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: 'var(--text-dark)',
    margin: 0,
  },
  closeButton: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    backgroundColor: 'var(--bg-light)',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: 'var(--text-muted)',
  },
  detailsSection: {
    padding: '20px',
  },
  formGroup: {
    marginBottom: '16px',
  },
  formLabel: {
    display: 'block',
    fontSize: '13px',
    fontWeight: '500',
    color: '#374151',
    marginBottom: '6px',
  },
  formInput: {
    width: '100%',
    padding: '10px 14px',
    borderRadius: '10px',
    border: '1px solid #e2e8f0',
    fontSize: '15px',
    color: 'var(--text-dark)',
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
  },
  toggleRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '16px',
    padding: '4px 0 8px 0',
  },
  toggleLabel: {
    fontSize: '15px',
    fontWeight: '500',
    color: 'var(--text-dark)',
  },
  toggleHint: {
    fontSize: '12px',
    color: 'var(--text-light)',
    margin: '4px 0 0 0',
    lineHeight: '1.4',
    maxWidth: '240px',
  },
  toggle: {
    width: '48px',
    height: '28px',
    borderRadius: '14px',
    border: 'none',
    cursor: 'pointer',
    position: 'relative',
    transition: 'background-color 0.2s ease',
    padding: 0,
    flexShrink: 0,
  },
  toggleKnob: {
    width: '24px',
    height: '24px',
    borderRadius: '12px',
    backgroundColor: '#ffffff',
    position: 'absolute',
    top: '2px',
    left: '2px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.2)',
    transition: 'transform 0.2s ease',
  },
  deleteButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    width: '100%',
    padding: '12px',
    marginTop: '12px',
    backgroundColor: '#fef2f2',
    color: '#dc2626',
    border: '1px solid #fecaca',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
  },
  modalActions: {
    display: 'flex',
    gap: '12px',
    padding: '20px',
    borderTop: '1px solid #f1f5f9',
  },
  cancelButton: {
    flex: 1,
    padding: '12px 20px',
    backgroundColor: 'var(--bg-light)',
    color: 'var(--text-muted)',
    border: 'none',
    borderRadius: '10px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  saveButton: {
    flex: 1,
    padding: '12px 20px',
    backgroundColor: 'var(--primary-blue)',
    color: '#ffffff',
    border: 'none',
    borderRadius: '10px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  deleteConfirmSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '40px 20px',
    textAlign: 'center',
  },
  deleteIconWrapper: {
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    backgroundColor: '#fef2f2',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#dc2626',
    marginBottom: '16px',
  },
  deleteIconLarge: {
    display: 'flex',
    transform: 'scale(2)',
  },
  deleteConfirmTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: 'var(--text-dark)',
    margin: '0 0 8px 0',
  },
  deleteConfirmText: {
    fontSize: '14px',
    color: 'var(--text-muted)',
    margin: 0,
    lineHeight: '1.5',
    maxWidth: '300px',
  },
  deleteConfirmButton: {
    flex: 1,
    padding: '12px 20px',
    backgroundColor: '#dc2626',
    color: '#ffffff',
    border: 'none',
    borderRadius: '10px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
  },
};

export default ManageProducts;
