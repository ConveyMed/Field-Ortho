import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../config/supabase';
import { useAuth } from './AuthContext';

// ViewModeContext centralizes the 2.0 role + product filtering model so every
// screen filters its data the same way. ALL filtering is client-side by design
// (RLS stays open) so un-updated 1.0 clients are unaffected.
//
// Rules:
//   - Physicians (org_role === 'physician') always view as physician.
//   - Sales-side admins can toggle into a physician PREVIEW (device-persisted).
//   - Physicians are NOT product-restricted; they see all product lines, minus
//     the Training topic and any item flagged hide_from_physician.
//   - Sales users are restricted to their assigned product lines (if any).
//   - A user with no role and no assignments sees everything (default view).
const ViewModeContext = createContext(undefined);

export const useViewMode = () => useContext(ViewModeContext);

const VIEW_KEY = 'physician_view_active';

export const ViewModeProvider = ({ children }) => {
  const { user, userProfile } = useAuth();
  const [assignedProductIds, setAssignedProductIds] = useState([]);
  const [productsLoaded, setProductsLoaded] = useState(false);
  const [physicianViewActive, setPhysicianViewActive] = useState(
    () => localStorage.getItem(VIEW_KEY) === 'true'
  );

  const isAdmin = userProfile?.is_admin === true;
  const orgRole = userProfile?.org_role || null; // 'physician' | 'sales' | null
  const isPhysician = orgRole === 'physician';
  const isRep = orgRole === 'sales';
  const seesAllProducts = userProfile?.all_products === true;

  // Only sales-side admins can preview the physician experience.
  const canSwitchView = isAdmin && !isPhysician;
  const isPhysicianView = isPhysician || (canSwitchView && physicianViewActive);

  const togglePhysicianView = useCallback(() => {
    setPhysicianViewActive(prev => {
      const next = !prev;
      try { localStorage.setItem(VIEW_KEY, String(next)); } catch (e) { /* ignore */ }
      return next;
    });
  }, []);

  // Load the current user's assigned product lines. Exposed as a refresh so
  // screens can re-pull after an admin changes assignments without a re-login
  // (stale-while-revalidate — existing data stays until the new data lands).
  const refreshAssignedProducts = useCallback(async () => {
    if (!user?.id) {
      setAssignedProductIds([]);
      setProductsLoaded(true);
      return;
    }
    const { data, error } = await supabase
      .from('user_products')
      .select('product_id')
      .eq('user_id', user.id);
    if (!error) setAssignedProductIds((data || []).map(r => r.product_id));
    setProductsLoaded(true);
  }, [user?.id]);

  useEffect(() => {
    refreshAssignedProducts();
  }, [refreshAssignedProducts]);

  // Reps are scoped to their assigned products, unless flagged "all products".
  const restrictByProduct = !isPhysicianView && !seesAllProducts && assignedProductIds.length > 0;

  // A representative with no products and no "all products" flag is waiting for an
  // admin to assign product lines. Admins bypass this (so they can still reach the
  // Manage tools and assign products); physicians are never product-scoped.
  const needsProductAssignment =
    isRep && !isAdmin && !seesAllProducts && productsLoaded && assignedProductIds.length === 0;

  // Unscoped content (no product tags) is visible to everyone (today's behavior),
  // EXCEPT a rep still pending product assignment sees nothing (shows the pending state).
  const productAllowed = useCallback((itemProductIds) => {
    if (needsProductAssignment) return false;
    if (!restrictByProduct) return true;
    if (!itemProductIds || itemProductIds.length === 0) return true;
    return itemProductIds.some(id => assignedProductIds.includes(id));
  }, [needsProductAssignment, restrictByProduct, assignedProductIds]);

  // Resources topic gate: physician view hides Training.
  const topicAllowed = useCallback((topicType) => {
    if (isPhysicianView) return topicType !== 'training';
    return true;
  }, [isPhysicianView]);

  // Content item gate: hidden-from-physician (in physician view) + product gate.
  const contentItemAllowed = useCallback((item, itemProductIds) => {
    if (isPhysicianView && item?.hide_from_physician) return false;
    return productAllowed(itemProductIds);
  }, [isPhysicianView, productAllowed]);

  // Post gate: physician role gate + product gate.
  const postAllowed = useCallback((post, postProductIds) => {
    if (isPhysicianView && post?.visible_to_physicians !== true) return false;
    return productAllowed(postProductIds);
  }, [isPhysicianView, productAllowed]);

  const value = {
    orgRole,
    isAdmin,
    isPhysician,
    isPhysicianView,
    physicianViewActive,
    canSwitchView,
    togglePhysicianView,
    assignedProductIds,
    refreshAssignedProducts,
    productsLoaded,
    restrictByProduct,
    seesAllProducts,
    needsProductAssignment,
    productAllowed,
    topicAllowed,
    contentItemAllowed,
    postAllowed,
  };

  return (
    <ViewModeContext.Provider value={value}>
      {children}
    </ViewModeContext.Provider>
  );
};
