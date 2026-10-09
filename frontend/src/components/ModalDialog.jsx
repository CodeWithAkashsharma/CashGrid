import React from 'react';

function ModalDialog({ isOpen, title, message, type = 'info', onClose, confirmText = 'Got it' }) {
  if (!isOpen) return null;

  const getTheme = () => {
    switch (type) {
      case 'success':
        return {
          icon: '✓',
          iconBg: '#DCFCE7',
          iconColor: '#16A34A',
          borderColor: '#BBF7D0',
          btnBg: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
          btnColor: '#FFFFFF'
        };
      case 'warning':
        return {
          icon: '⚠️',
          iconBg: '#FEF3C7',
          iconColor: '#D97706',
          borderColor: '#FDE68A',
          btnBg: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
          btnColor: '#FFFFFF'
        };
      case 'error':
        return {
          icon: '✕',
          iconBg: '#FEE2E2',
          iconColor: '#DC2626',
          borderColor: '#FECACA',
          btnBg: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
          btnColor: '#FFFFFF'
        };
      default:
        return {
          icon: 'ℹ️',
          iconBg: '#EFF6FF',
          iconColor: '#2563EB',
          borderColor: '#BFDBFE',
          btnBg: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
          btnColor: '#FFFFFF'
        };
    }
  };

  const theme = getTheme();

  return (
    <div 
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(5px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '16px',
        boxSizing: 'border-box'
      }}
    >
      <div 
        onClick={e => e.stopPropagation()}
        style={{
          background: '#FFFFFF',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '380px',
          padding: '24px 22px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          border: `1px solid ${theme.borderColor}`,
          textAlign: 'center',
          position: 'relative',
          boxSizing: 'border-box'
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            background: 'none',
            border: 'none',
            color: '#94A3B8',
            fontSize: '1.2rem',
            cursor: 'pointer',
            padding: '4px',
            lineHeight: 1
          }}
          title="Close"
        >
          ✕
        </button>

        <div style={{
          width: '52px',
          height: '52px',
          borderRadius: '50%',
          background: theme.iconBg,
          color: theme.iconColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.5rem',
          margin: '0 auto 16px auto',
          fontWeight: '700',
          boxShadow: `0 4px 12px ${theme.iconBg}`
        }}>
          {theme.icon}
        </div>

        <h3 style={{
          margin: '0 0 8px 0',
          fontSize: '1.2rem',
          fontWeight: '700',
          color: '#0F172A'
        }}>
          {title || 'Notification'}
        </h3>

        <p style={{
          margin: '0 0 20px 0',
          fontSize: '0.9rem',
          color: '#475569',
          lineHeight: '1.5',
          whiteSpace: 'pre-line'
        }}>
          {message}
        </p>

        <button
          onClick={onClose}
          style={{
            width: '100%',
            padding: '12px',
            background: theme.btnBg,
            color: theme.btnColor,
            border: 'none',
            borderRadius: '10px',
            fontWeight: '600',
            fontSize: '0.95rem',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            transition: 'all 0.2s'
          }}
        >
          {confirmText}
        </button>
      </div>
    </div>
  );
}

export default ModalDialog;
