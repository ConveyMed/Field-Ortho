import { useViewMode } from '../context/ViewModeContext';

const EyeIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

// Sales-side admins use this to preview the physician experience. Hidden for
// everyone else (physicians, non-admins). Toggling re-filters instantly and the
// choice persists across tabs + app restart (device-based, in ViewModeContext).
const PhysicianViewToggle = ({ style }) => {
  const { canSwitchView, isPhysicianView, togglePhysicianView } = useViewMode();
  if (!canSwitchView) return null;

  return (
    <button
      type="button"
      onClick={togglePhysicianView}
      title={isPhysicianView ? 'Viewing as physician — tap to switch back' : 'Preview physician view'}
      style={{
        ...styles.button,
        ...(isPhysicianView ? styles.buttonActive : {}),
        ...style,
      }}
    >
      <EyeIcon />
      <span>{isPhysicianView ? 'Physician' : 'Sales'}</span>
    </button>
  );
};

const styles = {
  button: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    padding: '6px 10px',
    backgroundColor: 'var(--background-off-white)',
    border: '1px solid #e2e8f0',
    borderRadius: '16px',
    cursor: 'pointer',
    color: 'var(--text-muted)',
    fontSize: '12px',
    fontWeight: '600',
  },
  buttonActive: {
    backgroundColor: '#eff6ff',
    border: '1px solid var(--primary-blue)',
    color: 'var(--primary-blue)',
  },
};

export default PhysicianViewToggle;
