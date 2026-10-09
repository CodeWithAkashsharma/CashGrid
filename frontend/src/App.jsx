import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import ModalDialog from './components/ModalDialog';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || sessionStorage.getItem('token'));
  const [user, setUser] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [hasUnreadNotifs, setHasUnreadNotifs] = useState(localStorage.getItem('notifsRead') !== 'true');
  const [customerTab, setCustomerTab] = useState('Dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [globalModal, setGlobalModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
    onClose: null
  });
  const notifRef = useRef(null);

  useEffect(() => {
    window.showAppModal = (title, message, type = 'info', onCloseCallback = null) => {
      setGlobalModal({
        isOpen: true,
        title,
        message,
        type,
        onClose: onCloseCallback
      });
    };

    window.alert = (message) => {
      window.showAppModal('Notice', String(message), 'info');
    };
  }, []);

  const [agentNotifs, setAgentNotifs] = useState([
    {
      id: 'ag-1',
      category: 'rejection',
      title: 'Payment Collection Rejected ❌',
      sender: 'Branch Admin (Audit & Verification)',
      badge: 'ACTION REQUIRED',
      badgeColor: '#DC2626',
      badgeBg: '#FEE2E2',
      bg: '#FEF2F2',
      borderColor: '#FECACA',
      message: 'Receipt photo for Loan LN-4412 (Rajesh Kumar - ₹10,000) was REJECTED by Admin. Reason: Uploaded receipt image is blurry and physical serial number does not match. Please re-collect or submit valid physical slip to branch.',
      time: '35m ago',
      unread: true
    },
    {
      id: 'ag-2',
      category: 'message',
      title: 'Message from Admin 📢',
      sender: 'Branch Manager (R. Sharma)',
      badge: 'ADMIN NOTICE',
      badgeColor: '#2563EB',
      badgeBg: '#EFF6FF',
      bg: '#F0F9FF',
      borderColor: '#BAE6FD',
      message: 'Urgent: All field agents must complete assigned customer visits before 4:30 PM. Vault cash deposit counter closes strictly at 5:00 PM today.',
      time: '1h ago',
      unread: true
    },
    {
      id: 'ag-3',
      category: 'review',
      title: 'Payment Under Review ⏳',
      sender: 'Branch Admin (Reconciliation Desk)',
      badge: 'IN REVIEW',
      badgeColor: '#D97706',
      badgeBg: '#FEF3C7',
      bg: '#FFFBEB',
      borderColor: '#FDE68A',
      message: 'Cash collection of ₹15,000 for Loan LN-6190 (Pooja Verma) is undergoing discrepancy review by Admin prior to final ledger sign-off (₹500 mismatch reported).',
      time: '2h ago',
      unread: true
    },
    {
      id: 'ag-4',
      category: 'message',
      title: 'Direct Instruction from Admin 💬',
      sender: 'Branch Admin Desk',
      badge: 'DIRECT MSG',
      badgeColor: '#0284C7',
      badgeBg: '#E0F2FE',
      bg: '#F8FAFC',
      borderColor: '#E2E8F0',
      message: 'Customer Rajesh Kumar reported that he requested a digital receipt copy via SMS. Please verify mobile number during your next visit.',
      time: '3h ago',
      unread: false
    },
    {
      id: 'ag-5',
      category: 'review',
      title: 'Payment Approved & Reconciled ✓',
      sender: 'Branch Admin (Vault Operations)',
      badge: 'APPROVED',
      badgeColor: '#059669',
      badgeBg: '#D1FAE5',
      bg: '#F0FDF4',
      borderColor: '#BBF7D0',
      message: 'Cash payment of ₹5,000 for Loan LN-8921 (Amit Patel) has been successfully verified, approved, and booked into branch vault balance.',
      time: '4h ago',
      unread: false
    },
    {
      id: 'ag-6',
      category: 'review',
      title: 'Role Upgrade Status 🛡️',
      sender: 'Admin Team (Head Office)',
      badge: 'ADMIN REVIEW',
      badgeColor: '#7C3AED',
      badgeBg: '#EDE9FE',
      bg: '#FAF5FF',
      borderColor: '#E9D5FF',
      message: 'Your role upgrade request from Field Agent to Branch Admin is currently under review by Central Operations.',
      time: 'Yesterday',
      unread: false
    }
  ]);

  const [adminNotifs, setAdminNotifs] = useState([
    {
      id: 'adm-1',
      title: 'Super Admin Directive 🏛️',
      sender: 'Super Admin (Head Office)',
      badge: 'SUPER ADMIN DIRECTIVE',
      badgeColor: '#7C3AED',
      badgeBg: '#EDE9FE',
      message: 'All counter collections must be deposited into official branch bank account daily before 4:00 PM with deposit slip attached.',
      time: '10m ago',
      unread: true
    },
    {
      id: 'adm-2',
      title: 'Agent Cash Drop-off Ready 💵',
      sender: 'Agent (Field Staff)',
      badge: 'CASH HANDOVER',
      badgeColor: '#059669',
      badgeBg: '#D1FAE5',
      message: 'Field Agent has submitted ₹48,500 cash collection with receipt REC-D55KL88 awaiting manager verification & bank deposit.',
      time: '35m ago',
      unread: true
    },
    {
      id: 'adm-3',
      title: 'Agent Cash Collection Submitted 💵',
      sender: 'Agent (Rajesh)',
      badge: 'CASH HANDOVER',
      badgeColor: '#059669',
      badgeBg: '#D1FAE5',
      message: 'Agent Rajesh submitted ₹25,000 cash collection with receipt REC-A83BD91.',
      time: '2h ago',
      unread: false
    },
    {
      id: 'adm-4',
      title: 'Super Admin Vault Limit Approval ✅',
      sender: 'Super Admin',
      badge: 'SUPER ADMIN APPROVAL',
      badgeColor: '#2563EB',
      badgeBg: '#EFF6FF',
      message: 'Super Admin approved overnight cash limit of ₹1,00,000 for vault retention.',
      time: 'Yesterday',
      unread: false
    }
  ]);

  const [superAdminNotifs, setSuperAdminNotifs] = useState([
    {
      id: 'sa-1',
      title: 'Role Upgrade Request 🛡️',
      sender: 'Agent (vikas_sharma)',
      badge: 'ROLE UPGRADE',
      badgeColor: '#7C3AED',
      badgeBg: '#EDE9FE',
      message: 'Field Agent vikas_sharma requested promotion to Branch Admin role with verification ID attached.',
      time: '1h ago',
      unread: true
    },
    {
      id: 'sa-2',
      title: 'Branch Bank Deposit Submitted 🏦',
      sender: 'Admin (Delhi Branch)',
      badge: 'SLIP ATTACHED',
      badgeColor: '#059669',
      badgeBg: '#D1FAE5',
      message: 'Branch Admin deposited ₹35,000 into SBI (Ref: DEP-SBI-881023). Deposit slip attached for super admin verification.',
      time: '3h ago',
      unread: true
    },
    {
      id: 'sa-3',
      title: 'Role Upgrade Request 🛡️',
      sender: 'Agent (raj_kumar)',
      badge: 'ROLE UPGRADE',
      badgeColor: '#2563EB',
      badgeBg: '#EFF6FF',
      message: 'Field Agent raj_kumar requested upgrade to Branch Admin. Reason: Newly assigned branch head.',
      time: '1 day ago',
      unread: false
    }
  ]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (token) {
      fetch('https://akash999.pythonanywhere.com/api/auth/me/', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => {
        if (!res.ok) throw new Error('Token invalid');
        return res.json();
      })
      .then(data => setUser(data))
      .catch(err => {
        console.error(err);
        handleLogout();
      });
    } else {
      setUser(null);
    }
  }, [token]);

  useEffect(() => {
    if (showNotifications) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => { document.body.style.overflow = 'auto'; };
  }, [showNotifications]);

  const handleLogin = (newToken, rememberMe) => {
    if (rememberMe) {
      localStorage.setItem('token', newToken);
    } else {
      sessionStorage.setItem('token', newToken);
    }
    setToken(newToken);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    setToken(null);
  };

  return (
    <Router>
      <div>
        {token && (
          <nav style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            padding: 'clamp(12px, 2.5vw, 16px) clamp(14px, 4vw, 40px)', 
            background: 'linear-gradient(90deg, #0F172A 0%, #1E293B 100%)', 
            borderBottom: '1px solid rgba(255,255,255,0.05)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            position: 'sticky',
            top: 0,
            zIndex: 100,
            backdropFilter: 'blur(10px)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <img src="/logo.png" alt="CashGrid Logo" style={{ width: 'clamp(32px, 4vw, 40px)', height: 'clamp(32px, 4vw, 40px)', objectFit: 'contain', filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.2))' }} />
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <span style={{ fontSize: 'clamp(1.15rem, 3.5vw, 1.4rem)', fontWeight: '800', letterSpacing: '0.5px', textShadow: '0 2px 4px rgba(0,0,0,0.3)', lineHeight: '1' }}>
                  <span style={{ color: 'white' }}>Cash</span><span style={{ color: '#10B981' }}>Grid</span>
                </span>
                <span className="nav-tagline" style={{ fontSize: '0.55rem', color: '#94A3B8', fontWeight: '700', letterSpacing: '1.5px', textTransform: 'uppercase', marginTop: '4px' }}>Track • Collect • Recognise</span>
              </div>
            </div>

            {user && !['super_admin', 'admin', 'agent'].includes(user.role) && (
              <div className="desktop-customer-tabs">
                {['Dashboard', 'Payments', 'History'].map(tab => (
                  <div 
                    key={tab}
                    onClick={() => setCustomerTab(tab)}
                    style={{
                      padding: '8px 20px',
                      cursor: 'pointer',
                      color: 'white',
                      background: customerTab === tab ? '#10B981' : 'transparent',
                      borderRadius: '10px',
                      fontWeight: customerTab === tab ? '700' : '500',
                      fontSize: '0.9rem',
                      letterSpacing: '0.5px',
                      transition: 'all 0.2s',
                      boxShadow: customerTab === tab ? '0 4px 12px rgba(16,185,129,0.4)' : 'none',
                      opacity: customerTab === tab ? 1 : 0.7
                    }}
                    onMouseOver={(e) => { if(customerTab !== tab) { e.currentTarget.style.opacity = 1; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; } }}
                    onMouseOut={(e) => { if(customerTab !== tab) { e.currentTarget.style.opacity = 0.7; e.currentTarget.style.background = 'transparent'; } }}
                  >
                    {tab}
                  </div>
                ))}
              </div>
            )}

            {/* Mobile Drawer Dropdown for Customer Portal */}
            {user && mobileMenuOpen && (
              <div className="mobile-customer-drawer">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {!['super_admin', 'admin', 'agent'].includes(user.role) && (
                    <>
                  <div style={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px', paddingLeft: '6px' }}>
                    Customer Portal Menu
                  </div>
                  {[
                    { name: 'Dashboard', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg> },
                    { name: 'Payments', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg> },
                    { name: 'History', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg> }
                  ].map(tab => (
                    <button
                      key={tab.name}
                      onClick={() => { setCustomerTab(tab.name); setMobileMenuOpen(false); }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-start',
                        gap: '10px',
                        padding: '11px 16px',
                        background: customerTab === tab.name ? '#10B981' : 'rgba(255,255,255,0.06)',
                        color: 'white',
                        borderRadius: '10px',
                        fontWeight: customerTab === tab.name ? '700' : '500',
                        fontSize: '0.92rem',
                        border: 'none',
                        cursor: 'pointer',
                        width: '100%',
                        transition: 'all 0.2s',
                        boxShadow: customerTab === tab.name ? '0 4px 12px rgba(16,185,129,0.3)' : 'none'
                      }}
                    >
                      {tab.icon}
                      <span>{tab.name}</span>
                      {customerTab === tab.name && (
                        <span style={{ marginLeft: 'auto', fontSize: '0.75rem', background: 'rgba(255,255,255,0.25)', padding: '2px 8px', borderRadius: '12px' }}>Active</span>
                      )}
                    </button>
                      ))}
                    </>
                  )}
                  <div style={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px', paddingLeft: '6px', marginTop: !['super_admin', 'admin', 'agent'].includes(user.role) ? '12px' : '0' }}>
                    Account Actions
                  </div>
                  <button onClick={() => { setShowNotifications(!showNotifications); setMobileMenuOpen(false); }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', padding: '11px 16px', background: 'rgba(255,255,255,0.06)', color: 'white', borderRadius: '10px', fontWeight: '500', fontSize: '0.92rem', border: 'none', cursor: 'pointer' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                        <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                      </svg>
                      <span>Notifications</span>
                    </div>
                    {((user?.role === 'agent' && agentNotifs.some(n => n.unread)) || (user?.role === 'admin' && adminNotifs.some(n => n.unread)) || (user?.role === 'super_admin' && superAdminNotifs.some(n => n.unread)) || (user?.role === 'customer' && hasUnreadNotifs)) && (
                      <span style={{ background: '#EF4444', width: '8px', height: '8px', borderRadius: '50%', display: 'inline-block', position: 'absolute', right: '16px' }}></span>
                    )}
                  </button>
                  <button onClick={() => window.location.reload()} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '11px 16px', background: 'rgba(255,255,255,0.06)', color: 'white', borderRadius: '10px', fontWeight: '500', fontSize: '0.92rem', border: 'none', cursor: 'pointer' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="23 4 23 10 17 10"></polyline>
                      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
                    </svg>
                    <span>Refresh Dashboard</span>
                  </button>
                  <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '11px 16px', background: 'rgba(239,68,68,0.15)', color: '#EF4444', borderRadius: '10px', fontWeight: '700', fontSize: '0.92rem', border: 'none', cursor: 'pointer' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M10 22H5a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h5"></path>
                      <polyline points="17 16 21 12 17 8"></polyline>
                      <line x1="21" y1="12" x2="9" y2="12"></line>
                    </svg>
                    <span>Log Out</span>
                  </button>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {/* Burger Menu Button */}
              {user && (
                <button
                  type="button"
                  className="mobile-burger-btn"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  aria-label="Toggle Menu"
                  title="Menu"
                >
                  {mobileMenuOpen ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="3" y1="12" x2="21" y2="12"></line>
                      <line x1="3" y1="6" x2="21" y2="6"></line>
                      <line x1="3" y1="18" x2="21" y2="18"></line>
                    </svg>
                  )}
                </button>
              )}

              <div className="desktop-only-actions" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div ref={notifRef} style={{ position: 'relative' }}>
                <div 
                  onClick={() => setShowNotifications(!showNotifications)}
                  style={{ cursor: 'pointer', color: '#CBD5E1', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', width: '38px', height: '38px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', transition: 'all 0.2s', border: '1px solid rgba(255,255,255,0.05)' }}
                  onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.15)'; e.currentTarget.style.transform = 'scale(1.05)'; }}
                  onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.transform = 'scale(1)'; }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                  </svg>
                  {((user?.role === 'agent' && agentNotifs.some(n => n.unread)) || (user?.role === 'admin' && adminNotifs.some(n => n.unread)) || (user?.role === 'super_admin' && superAdminNotifs.some(n => n.unread)) || (user?.role === 'customer' && hasUnreadNotifs)) && (
                    <span style={{ position: 'absolute', top: '6px', right: '8px', width: '8px', height: '8px', background: '#EF4444', borderRadius: '50%', border: '2px solid #1E293B' }}></span>
                  )}
                </div>
                
                
              </div>

              <button 
                onClick={() => window.location.reload()} 
                style={{ background: 'rgba(255,255,255,0.05)', color: '#F8FAFC', border: '1px solid rgba(255,255,255,0.1)', padding: '8px 16px', borderRadius: '8px', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '500', transition: 'all 0.2s' }} 
                onMouseOver={(e) => { e.currentTarget.style.background='rgba(255,255,255,0.15)'; e.currentTarget.style.transform='translateY(-1px)'; }} 
                onMouseOut={(e) => { e.currentTarget.style.background='rgba(255,255,255,0.05)'; e.currentTarget.style.transform='translateY(0)'; }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="23 4 23 10 17 10"></polyline>
                  <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
                </svg>
                <span className="nav-btn-text">Refresh</span>
              </button>
              
              <button 
                onClick={handleLogout} 
                style={{ background: 'rgba(239,68,68,0.15)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.3)', padding: '6px 14px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', transition: 'all 0.2s', fontWeight: '700', letterSpacing: '0.5px' }} 
                onMouseOver={(e) => { e.currentTarget.style.background='rgba(239,68,68,0.25)'; e.currentTarget.style.color='#FCA5A5'; e.currentTarget.style.transform='scale(1.05)'; }} 
                onMouseOut={(e) => { e.currentTarget.style.background='rgba(239,68,68,0.15)'; e.currentTarget.style.color='#EF4444'; e.currentTarget.style.transform='scale(1)'; }} 
                title="Logout"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10 22H5a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h5"></path>
                  <polyline points="17 16 21 12 17 8"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
                <span className="nav-btn-text">EXIT</span>
              </button>
              </div>
            </div>
          
{showNotifications && (
                  <div className="notification-dropdown" style={{ position: 'absolute', top: '100%', right: '10px', width: user?.role === 'agent' ? '360px' : '340px', maxWidth: 'calc(100vw - 20px)', background: 'white', borderRadius: '12px', boxShadow: '0 12px 30px rgba(0,0,0,0.15)', border: '1px solid #E2E8F0', overflow: 'hidden', zIndex: 1000 }}>
                    {user?.role === 'agent' ? (
                      <>
                        <div style={{ padding: '14px 18px', borderBottom: '1px solid #E2E8F0', background: '#F8FAFC', display: 'flex', justifyContent: 'center', position: 'relative', alignItems: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center', flex: 1, paddingRight: '60px' }}>
                            <h4 style={{ textAlign: 'center', margin: 0, color: '#0F172A', fontSize: '0.95rem', fontWeight: '700' }}>Notifications</h4>
                            {agentNotifs.filter(n => n.unread).length > 0 && (
                              <span style={{ background: '#FEE2E2', color: '#DC2626', padding: '1px 7px', borderRadius: '10px', fontSize: '0.7rem', fontWeight: '700' }}>
                                {agentNotifs.filter(n => n.unread).length} New
                              </span>
                            )}
                          </div>
                          <button 
                            onClick={() => setAgentNotifs(agentNotifs.map(n => ({ ...n, unread: false })))} 
                            style={{ position: 'absolute', right: '16px',  background: 'none', border: 'none', color: '#2563EB', fontSize: '0.75rem', cursor: 'pointer', padding: 0, fontWeight: '600' }}
                          >
                            Mark all read
                          </button>
                        </div>

                        <div style={{ padding: '0', maxHeight: '380px', overflowY: 'auto' }}>
                          {agentNotifs.map(notif => (
                              <div 
                                key={notif.id}
                                onClick={() => setAgentNotifs(agentNotifs.map(n => n.id === notif.id ? { ...n, unread: false } : n))}
                                style={{
                                  padding: '12px 16px',
                                  borderBottom: '1px solid #F1F5F9',
                                  background: notif.unread ? notif.bg : 'white',
                                  cursor: 'pointer',
                                  borderLeft: notif.category === 'rejection' ? '4px solid #EF4444' : notif.category === 'message' ? '4px solid #2563EB' : notif.category === 'review' ? '4px solid #F59E0B' : '4px solid #10B981',
                                  transition: 'background 0.2s'
                                }}
                              >
                                <div style={{ display: 'flex', justifyContent: 'center', position: 'relative', alignItems: 'flex-start', marginBottom: '4px' }}>
                                  <span style={{ fontWeight: '700', fontSize: '0.82rem', color: notif.category === 'rejection' ? '#DC2626' : '#0F172A' }}>
                                    {notif.title}
                                  </span>
                                  <span style={{ background: notif.badgeBg, color: notif.badgeColor, padding: '2px 6px', borderRadius: '4px', fontSize: '0.62rem', fontWeight: '700', letterSpacing: '0.5px' }}>
                                    {notif.badge}
                                  </span>
                                </div>
                                <p style={{ margin: '0 0 6px 0', fontSize: '0.78rem', color: '#475569', lineHeight: '1.4' }}>
                                  {notif.message}
                                </p>
                                <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', fontSize: '0.7rem', color: '#94A3B8' }}>
                                  <span>{notif.time}</span>
                                </div>
                              </div>
                            ))}
                        </div>
                      </>
                    ) : user?.role === 'super_admin' ? (
                      <>
                        <div style={{ padding: '14px 18px', borderBottom: '1px solid #E2E8F0', background: '#F8FAFC', display: 'flex', justifyContent: 'center', position: 'relative', alignItems: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center', flex: 1, paddingRight: '60px' }}>
                            <h4 style={{ textAlign: 'center', margin: 0, color: '#0F172A', fontSize: '0.95rem', fontWeight: '700' }}>Super Admin Center</h4>
                            {superAdminNotifs.filter(n => n.unread).length > 0 && (
                              <span style={{ background: '#EDE9FE', color: '#7C3AED', padding: '1px 7px', borderRadius: '10px', fontSize: '0.7rem', fontWeight: '700' }}>
                                {superAdminNotifs.filter(n => n.unread).length} New
                              </span>
                            )}
                          </div>
                          <button 
                            onClick={() => setSuperAdminNotifs(superAdminNotifs.map(n => ({ ...n, unread: false })))} 
                            style={{ position: 'absolute', right: '16px',  background: 'none', border: 'none', color: '#7C3AED', fontSize: '0.75rem', cursor: 'pointer', padding: 0, fontWeight: '600' }}
                          >
                            Mark all read
                          </button>
                        </div>
                        <div style={{ padding: '0', maxHeight: '350px', overflowY: 'auto' }}>
                          {superAdminNotifs.map(notif => (
                            <div 
                              key={notif.id}
                              onClick={() => setSuperAdminNotifs(superAdminNotifs.map(n => n.id === notif.id ? { ...n, unread: false } : n))}
                              style={{ padding: '14px 16px', borderBottom: '1px solid #F1F5F9', background: notif.unread ? '#FAF5FF' : 'white', cursor: 'pointer' }}
                            >
                              <div style={{ display: 'flex', justifyContent: 'center', position: 'relative', alignItems: 'center', marginBottom: '4px' }}>
                                <p style={{ margin: 0, color: '#0F172A', fontSize: '0.85rem', fontWeight: '600' }}>{notif.title}</p>
                                <span style={{ background: notif.badgeBg, color: notif.badgeColor, padding: '2px 6px', borderRadius: '4px', fontSize: '0.65rem', fontWeight: '700' }}>{notif.badge}</span>
                              </div>
                              <p style={{ margin: '0 0 5px 0', color: '#475569', fontSize: '0.8rem' }}>{notif.message}</p>
                              <div style={{ display: 'flex', justifyContent: 'flex-end', fontSize: '0.7rem', color: '#94A3B8' }}>
                                <span>{notif.time}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    ) : user?.role === 'admin' ? (
                      <>
                        <div style={{ padding: '14px 18px', borderBottom: '1px solid #E2E8F0', background: '#F8FAFC', display: 'flex', justifyContent: 'center', position: 'relative', alignItems: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center', flex: 1, paddingRight: '60px' }}>
                            <h4 style={{ textAlign: 'center', margin: 0, color: '#0F172A', fontSize: '0.95rem', fontWeight: '700' }}>Branch Admin Alerts</h4>
                            {adminNotifs.filter(n => n.unread).length > 0 && (
                              <span style={{ background: '#EFF6FF', color: '#2563EB', padding: '1px 7px', borderRadius: '10px', fontSize: '0.7rem', fontWeight: '700' }}>
                                {adminNotifs.filter(n => n.unread).length} New
                              </span>
                            )}
                          </div>
                          <button 
                            onClick={() => setAdminNotifs(adminNotifs.map(n => ({ ...n, unread: false })))} 
                            style={{ position: 'absolute', right: '16px',  background: 'none', border: 'none', color: '#2563EB', fontSize: '0.75rem', cursor: 'pointer', padding: 0, fontWeight: '600' }}
                          >
                            Mark all read
                          </button>
                        </div>
                        <div style={{ padding: '0', maxHeight: '350px', overflowY: 'auto' }}>
                          {adminNotifs.map(notif => (
                            <div 
                              key={notif.id}
                              onClick={() => setAdminNotifs(adminNotifs.map(n => n.id === notif.id ? { ...n, unread: false } : n))}
                              style={{ padding: '14px 16px', borderBottom: '1px solid #F1F5F9', background: notif.unread ? '#F0F9FF' : 'white', cursor: 'pointer' }}
                            >
                              <div style={{ display: 'flex', justifyContent: 'center', position: 'relative', alignItems: 'center', marginBottom: '4px' }}>
                                <p style={{ margin: 0, color: '#0F172A', fontSize: '0.85rem', fontWeight: '600' }}>{notif.title}</p>
                                <span style={{ background: notif.badgeBg, color: notif.badgeColor, padding: '2px 6px', borderRadius: '4px', fontSize: '0.65rem', fontWeight: '700' }}>{notif.badge}</span>
                              </div>
                              <p style={{ margin: '0 0 5px 0', color: '#475569', fontSize: '0.8rem' }}>{notif.message}</p>
                              <div style={{ display: 'flex', justifyContent: 'flex-end', fontSize: '0.7rem', color: '#94A3B8' }}>
                                <span>{notif.time}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      <>
                        <div style={{ padding: '14px 18px', borderBottom: '1px solid #E2E8F0', background: '#F8FAFC', display: 'flex', justifyContent: 'center', position: 'relative', alignItems: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center', flex: 1, paddingRight: '60px' }}>
                            <h4 style={{ textAlign: 'center', margin: 0, color: '#0F172A', fontSize: '0.95rem', fontWeight: '700' }}>Notifications</h4>
                            {hasUnreadNotifs && (
                              <span style={{ background: '#EFF6FF', color: '#2563EB', padding: '1px 7px', borderRadius: '10px', fontSize: '0.7rem', fontWeight: '700' }}>
                                1 New
                              </span>
                            )}
                          </div>
                          <button 
                            onClick={() => { setHasUnreadNotifs(false); localStorage.setItem('notifsRead', 'true'); }} 
                            style={{ position: 'absolute', right: '16px',  background: 'none', border: 'none', color: '#2563EB', fontSize: '0.75rem', cursor: 'pointer', padding: 0, fontWeight: '600' }}
                          >
                            Mark all read
                          </button>
                        </div>
                        <div style={{ padding: '0', maxHeight: '350px', overflowY: 'auto' }}>
                          <div style={{ padding: '16px', borderBottom: '1px solid #F1F5F9', background: '#FEF2F2', cursor: 'default' }}>
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                              <span style={{ color: '#EF4444', fontSize: '1.2rem', marginTop: '-2px' }}>⚠️</span>
                              <div>
                                <p style={{ margin: '0 0 4px 0', color: '#991B1B', fontSize: '0.85rem', fontWeight: '600' }}>Important Notice</p>
                                <p style={{ margin: 0, color: '#B91C1C', fontSize: '0.8rem', lineHeight: '1.4' }}>If you face any difficulty or problems, please contact your branch directly for help.</p>
                              </div>
                            </div>
                          </div>
                          <div 
                            onClick={() => { setHasUnreadNotifs(false); localStorage.setItem('notifsRead', 'true'); }}
                            style={{ padding: '16px', borderBottom: '1px solid #F1F5F9', background: hasUnreadNotifs ? '#F0F9FF' : 'white', cursor: 'pointer', transition: 'background 0.3s' }}
                          >
                            <p style={{ margin: '0 0 5px 0', color: '#0F172A', fontSize: '0.85rem', fontWeight: '500' }}>Payment Reminder 📅</p>
                            <p style={{ margin: '0 0 5px 0', color: '#475569', fontSize: '0.8rem' }}>Your next EMI of ₹5,000 is due on Nov 01, 2026.</p>
                            <span style={{ color: '#94A3B8', fontSize: '0.7rem' }}>Just now</span>
                          </div>
                          <div style={{ padding: '16px', borderBottom: '1px solid #F1F5F9', cursor: 'pointer' }}>
                            <p style={{ margin: '0 0 5px 0', color: '#0F172A', fontSize: '0.85rem', fontWeight: '500' }}>Payment Cleared ✓</p>
                            <p style={{ margin: '0 0 5px 0', color: '#475569', fontSize: '0.8rem' }}>Your payment of ₹5,000 was successfully processed.</p>
                            <span style={{ color: '#94A3B8', fontSize: '0.7rem' }}>2 days ago</span>
                          </div>
                          <div style={{ padding: '16px', borderBottom: '1px solid #F1F5F9', cursor: 'pointer' }}>
                            <p style={{ margin: '0 0 5px 0', color: '#0F172A', fontSize: '0.85rem', fontWeight: '500' }}>Profile Updated ℹ️</p>
                            <p style={{ margin: '0 0 5px 0', color: '#475569', fontSize: '0.8rem' }}>Your contact preferences were successfully updated.</p>
                            <span style={{ color: '#94A3B8', fontSize: '0.7rem' }}>1 week ago</span>
                          </div>
                          <div style={{ padding: '16px', borderBottom: '1px solid #F1F5F9', cursor: 'pointer' }}>
                            <p style={{ margin: '0 0 5px 0', color: '#0F172A', fontSize: '0.85rem', fontWeight: '500' }}>Payment Cleared ✓</p>
                            <p style={{ margin: '0 0 5px 0', color: '#475569', fontSize: '0.8rem' }}>Your payment of ₹5,000 was successfully processed.</p>
                            <span style={{ color: '#94A3B8', fontSize: '0.7rem' }}>1 month ago</span>
                          </div>
                          <div style={{ padding: '16px', cursor: 'pointer' }}>
                            <p style={{ margin: '0 0 5px 0', color: '#0F172A', fontSize: '0.85rem', fontWeight: '500' }}>Welcome to ARTH Finance 👋</p>
                            <p style={{ margin: '0 0 5px 0', color: '#475569', fontSize: '0.8rem' }}>Your account has been successfully created.</p>
                            <span style={{ color: '#94A3B8', fontSize: '0.7rem' }}>2 months ago</span>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}
</nav>
        )}
        <Routes>
          <Route path="/login" element={!token ? <Login onLogin={handleLogin} /> : <Navigate to="/" />} />
          <Route path="/" element={token ? <div className="container"><Dashboard token={token} user={user} customerTab={customerTab} setCustomerTab={setCustomerTab} /></div> : <Navigate to="/login" />} />
          <Route path="*" element={token ? (
            <div style={{ padding: '100px 20px', textAlign: 'center', minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <h1 style={{ fontSize: '5rem', margin: '0', color: '#1E293B', fontWeight: '800' }}>404</h1>
              <h2 style={{ fontSize: '1.5rem', margin: '10px 0 20px', color: '#475569' }}>Page Not Found</h2>
              <p style={{ fontSize: '1rem', color: '#64748B', maxWidth: '400px', marginBottom: '30px' }}>Oops! The URL you requested doesn't match any page in CashGrid.</p>
              <Link to="/" style={{ background: '#10B981', color: 'white', padding: '12px 24px', borderRadius: '8px', textDecoration: 'none', fontWeight: '600', transition: 'background 0.2s', boxShadow: '0 4px 12px rgba(16,185,129,0.3)' }} onMouseOver={(e) => e.currentTarget.style.background = '#059669'} onMouseOut={(e) => e.currentTarget.style.background = '#10B981'}>Return to Dashboard</Link>
            </div>
          ) : <Navigate to="/login" />} />
        </Routes>

        <ModalDialog 
          isOpen={globalModal.isOpen}
          title={globalModal.title}
          message={globalModal.message}
          type={globalModal.type}
          onClose={() => {
            if (globalModal.onClose) globalModal.onClose();
            setGlobalModal(prev => ({ ...prev, isOpen: false }));
          }}
        />
      </div>
    </Router>
  );
}

export default App;
