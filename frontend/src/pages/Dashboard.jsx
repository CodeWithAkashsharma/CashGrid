import React, { useState, useEffect } from 'react';

const StatCard = ({ title, amount, color, icon }) => (
  <div className="card" style={{ display: 'flex', flexDirection: 'column', padding: 'clamp(14px, 3vw, 24px)', position: 'relative', minWidth: 0, boxSizing: 'border-box' }}>
    <h3 style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: '500', marginBottom: '8px', paddingRight: '40px', wordBreak: 'break-word' }}>{title}</h3>
    <div className="stat-value" style={{ margin: 0, color: 'var(--text-main)', fontSize: 'clamp(1.25rem, 5vw, 1.8rem)', fontWeight: '700', wordBreak: 'break-word' }}>
      {typeof amount === 'number' ? `₹${amount.toLocaleString()}` : amount}
    </div>

    <div className="stat-icon-wrapper" style={{
      position: 'absolute', top: 'clamp(14px, 3vw, 24px)', right: 'clamp(14px, 3vw, 24px)',
      background: `${color}15`, color: color,
      width: '36px', height: '36px', borderRadius: '8px',
      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem'
    }}>
      {icon}
    </div>
  </div>
);

// Transaction Timeline Component
const TimelineItem = ({ amount, status, icon, isError }) => (
  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
    <div style={{
      width: '35px', height: '35px', borderRadius: '50%', background: isError ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.2)',
      color: isError ? '#EF4444' : '#10B981', display: 'flex', justifyContent: 'center', alignItems: 'center', marginRight: '15px', fontSize: '1.2rem'
    }}>{icon}</div>
    <div style={{ flex: 1 }}>
      <div style={{ fontWeight: '600', color: isError ? '#EF4444' : 'var(--text-main)' }}>{status}</div>
      <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>₹{amount.toLocaleString()}</div>
    </div>
  </div>
);

function Dashboard({ token, user, customerTab, setCustomerTab }) {
  const [stats, setStats] = useState({ total_collected: 0, total_deposited: 0 });
  const [activeTab, setActiveTab] = useState('overview');
  const [loans, setLoans] = useState([]);
  const [collections, setCollections] = useState([]);
  const [bankDeposits, setBankDeposits] = useState([]);
  const [previewSlipModal, setPreviewSlipModal] = useState(null);
  const [adminReceiptsSearch, setAdminReceiptsSearch] = useState('');
  const [adminReceiptsPage, setAdminReceiptsPage] = useState(1);
  const [adminDepositsPage, setAdminDepositsPage] = useState(1);
  const [saReceiptsPage, setSaReceiptsPage] = useState(1);
  const [saDepositsPage, setSaDepositsPage] = useState(1);
  const [bankDepositForm, setBankDepositForm] = useState({
    bank_name: 'State Bank of India',
    account_number: '38921102938',
    amount: 88500,
    reference_number: '',
    shortfall_reason: '',
    source: 'media',
    slip_file: null,
    slip_preview: null
  });
  const adminVideoRef = React.useRef(null);
  const adminCanvasRef = React.useRef(null);
  const [isAdminCameraActive, setIsAdminCameraActive] = useState(false);
  const [adminFacingMode, setAdminFacingMode] = useState('environment');

  useEffect(() => {
    if (previewSlipModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => { document.body.style.overflow = 'auto'; };
  }, [previewSlipModal]);

  const startAdminCamera = async (mode) => {
    stopAdminCamera();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: mode } });
      if (adminVideoRef.current) {
        adminVideoRef.current.srcObject = stream;
        setIsAdminCameraActive(true);
        setAdminFacingMode(mode);
      }
    } catch (err) {
      if (window.showAppModal) {
        window.showAppModal("Camera Access Required", "Camera access was denied or is unavailable on this device.", "warning");
      }
    }
  };

  const stopAdminCamera = () => {
    if (adminVideoRef.current && adminVideoRef.current.srcObject) {
      adminVideoRef.current.srcObject.getTracks().forEach(t => t.stop());
    }
    setIsAdminCameraActive(false);
  };

  const getSlipImageUrl = (path) => {
    if (!path) return null;
    if (typeof path !== 'string') return null;
    if (path.startsWith('http') || path.startsWith('blob:') || path.startsWith('data:')) return path;
    const cleanPath = path.startsWith('/') ? path : '/' + path;
    if (cleanPath.startsWith('/media/')) {
      return `https://akash999.pythonanywhere.com${cleanPath}`;
    }
    return `https://akash999.pythonanywhere.com/media${cleanPath}`;
  };

  const getEasyStatusBadge = (status) => {
    switch (status) {
      case 'branch_received':
        return {
          icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>,
          label: 'Cash Received',
          bg: '#D1FAE5',
          color: '#065F46',
          border: '#A7F3D0'
        };
      case 'collected':
        return {
          icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>,
          label: 'Handover Pending',
          bg: '#FEF3C7',
          color: '#92400E',
          border: '#FDE68A'
        };
      case 'discrepancy':
        return {
          icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>,
          label: 'Amount Mismatch',
          bg: '#FEE2E2',
          color: '#991B1B',
          border: '#FECACA'
        };
      case 'deposited':
        return {
          icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="10" width="18" height="11" rx="2" /><path d="M7 10V7a5 5 0 0 1 10 0v3" /></svg>,
          label: 'In Bank Review',
          bg: '#EFF6FF',
          color: '#1E40AF',
          border: '#BFDBFE'
        };
      case 'settled':
        return {
          icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>,
          label: 'Bank Confirmed',
          bg: '#D1FAE5',
          color: '#065F46',
          border: '#A7F3D0'
        };
      default:
        return { icon: null, label: status, bg: '#F1F5F9', color: '#475569', border: '#E2E8F0' };
    }
  };


  const TablePagination = ({ currentPage, totalPages, totalItems, onPageChange }) => {
    if (!totalItems || totalItems === 0) return null;
    const pagesCount = Math.max(1, totalPages || 1);
    const startItem = (currentPage - 1) * 5 + 1;
    const endItem = Math.min(currentPage * 5, totalItems);

    return (
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #E2E8F0', fontSize: '0.85rem', color: '#64748B', flexWrap: 'wrap', gap: '12px' }}>
        <span>Showing {startItem} to {endItem} of {totalItems} entries</span>
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            disabled={currentPage <= 1}
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            style={{
              padding: '5px 12px',
              fontSize: '0.8rem',
              color: currentPage <= 1 ? '#94A3B8' : '#334155',
              border: '1px solid #CBD5E1',
              borderRadius: '6px',
              cursor: currentPage <= 1 ? 'not-allowed' : 'pointer',
              background: currentPage <= 1 ? '#F8FAFC' : '#FFFFFF',
              fontWeight: '500'
            }}
          >
            Previous
          </button>
          {Array.from({ length: pagesCount }, (_, i) => i + 1).map(pageNum => (
            <button
              key={pageNum}
              onClick={() => onPageChange(pageNum)}
              style={{
                padding: '5px 12px',
                fontSize: '0.8rem',
                border: '1px solid',
                borderRadius: '6px',
                borderColor: pageNum === currentPage ? '#2563EB' : '#CBD5E1',
                color: pageNum === currentPage ? '#2563EB' : '#475569',
                background: pageNum === currentPage ? '#EFF6FF' : '#FFFFFF',
                fontWeight: pageNum === currentPage ? '700' : '500',
                cursor: 'pointer'
              }}
            >
              {pageNum}
            </button>
          ))}
          <button
            disabled={currentPage >= pagesCount}
            onClick={() => onPageChange(Math.min(pagesCount, currentPage + 1))}
            style={{
              padding: '5px 12px',
              fontSize: '0.8rem',
              color: currentPage >= pagesCount ? '#94A3B8' : '#334155',
              border: '1px solid #CBD5E1',
              borderRadius: '6px',
              cursor: currentPage >= pagesCount ? 'not-allowed' : 'pointer',
              background: currentPage >= pagesCount ? '#F8FAFC' : '#FFFFFF',
              fontWeight: '500'
            }}
          >
            Next
          </button>
        </div>
      </div>
    );
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [collectionForm, setCollectionForm] = useState(null);
  const [collectionData, setCollectionData] = useState({ amount: '', source: 'media', remarks: '', file: null });
  const videoRef = React.useRef(null);
  const canvasRef = React.useRef(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [facingMode, setFacingMode] = useState('environment');
  const [depositReason, setDepositReason] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const getLoanEmi = (loan) => {
    if (!loan) return 0;
    if (loan.emi_amount && Number(loan.emi_amount) > 0) return Number(loan.emi_amount);
    return loan.id === 8921 ? 5000 : loan.id === 4412 ? 10000 : loan.id === 6190 ? 15000 : 7500;
  };

  const startCamera = async (mode) => {
    stopCamera();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: mode } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
        setFacingMode(mode);
      }
    } catch (err) {
      if (window.showAppModal) {
        window.showAppModal("Camera Access Required", "Camera access was denied or is unavailable on this device.", "warning");
      }
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(t => t.stop());
    }
    setIsCameraActive(false);
  };
  const [paymentAmount, setPaymentAmount] = useState(5000);
  const [paymentReason, setPaymentReason] = useState('');
  const [selectedEMI, setSelectedEMI] = useState('Nov 2026');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [scheduledVisits, setScheduledVisits] = useState({});
  const [selectedHistoryId, setSelectedHistoryId] = useState('8921');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeForm, setUpgradeForm] = useState({ requestedRole: 'agent', reason: '' });
  const [hasRequestedUpgrade, setHasRequestedUpgrade] = useState(localStorage.getItem('upgradeRequested') === 'true');
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });

  const showToast = (message, type = 'info') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'info' }), 3500);
  };

  const [upgradeRequests, setUpgradeRequests] = useState([
    { id: 1, user: 'raj_kumar', requestedRole: 'admin', reason: 'I am a new branch manager.', status: 'pending' },
    { id: 2, user: 'vikas_sharma', requestedRole: 'agent', reason: 'Joined as a field collection agent.', status: 'pending' }
  ]);

  // Super Admin Panel State
  const [saMainTab, setSaMainTab] = useState('dashboard'); // 'information' | 'dashboard'
  const [saInfoTab, setSaInfoTab] = useState('users'); // 'users' | 'agents' | 'agent_requests' | 'admins' | 'admin_requests'
  const [saDashTab, setSaDashTab] = useState('slips'); // 'slips' | 'deposits'
  const [saDepositAudit, setSaDepositAudit] = useState({}); // { [id]: 'approved' | 'rejected' }
  const [saUsersPage, setSaUsersPage] = useState(1);
  const [saAgentsPage, setSaAgentsPage] = useState(1);
  const [saAdminsPage, setSaAdminsPage] = useState(1);

  // Demo user data for super admin information panel
  const allUsers = [
    { id: 1, username: 'akash_sharma', name: 'Akash Sharma', role: 'customer', email: 'akash@example.com', joined: '2026-01-15', status: 'active' },
    { id: 2, username: 'raj_kumar', name: 'Raj Kumar', role: 'agent', email: 'raj@example.com', joined: '2026-02-10', status: 'active' },
    { id: 3, username: 'vikas_sharma', name: 'Vikas Sharma', role: 'customer', email: 'vikas@example.com', joined: '2026-03-05', status: 'active' },
    { id: 4, username: 'priya_admin', name: 'Priya Verma', role: 'admin', email: 'priya@example.com', joined: '2025-11-20', status: 'active' },
    { id: 5, username: 'amit_agent', name: 'Amit Joshi', role: 'agent', email: 'amit@example.com', joined: '2026-04-01', status: 'active' },
    { id: 6, username: 'sunita_c', name: 'Sunita Choudhary', role: 'customer', email: 'sunita@example.com', joined: '2026-05-12', status: 'active' },
    { id: 7, username: 'deepak_adm', name: 'Deepak Singh', role: 'admin', email: 'deepak@example.com', joined: '2025-09-14', status: 'active' },
    { id: 8, username: 'neha_agent', name: 'Neha Gupta', role: 'agent', email: 'neha@example.com', joined: '2026-06-20', status: 'inactive' },
  ];
  const activeAgents = allUsers.filter(u => u.role === 'agent' && u.status === 'active');
  const activeAdmins = allUsers.filter(u => u.role === 'admin' && u.status === 'active');
  const agentRequests = upgradeRequests.filter(r => r.requestedRole === 'agent');
  const adminRequests = upgradeRequests.filter(r => r.requestedRole === 'admin');

  const historyLoans = [
    {
      id: '8921', status: 'Active', borrower: 'Akash Sharma', date: 'Jan 2026 - Present', amount: 50000, transactions: [
        { date: 'Oct 01, 2026', time: '10:45 AM', amount: 5000, ref: 'REC-A83BD91', by: 'Field Agent (RK)', status: 'Cleared' },
        { date: 'Sep 01, 2026', time: '11:20 AM', amount: 5000, ref: 'REC-A72CC12', by: 'Branch Drop-off', status: 'Cleared' },
        { date: 'Aug 05, 2026', time: '01:15 PM', amount: 5000, ref: 'REC-B21MN99', by: 'Field Agent (AJ)', status: 'Cleared' }
      ]
    },
    {
      id: '7420', status: 'Closed', borrower: 'Akash Sharma', date: 'Jan 2025 - Dec 2025', amount: 72000, transactions: [
        { date: 'Dec 01, 2025', time: '11:30 AM', amount: 6000, ref: 'REC-C92XZ44', by: 'Branch Drop-off', status: 'Cleared' },
        { date: 'Nov 02, 2025', time: '09:15 AM', amount: 6000, ref: 'REC-B31MP12', by: 'Field Agent (AJ)', status: 'Cleared' },
        { date: 'Oct 10, 2025', time: '04:45 PM', amount: 6000, ref: 'REC-X88QW11', by: 'Field Agent (RK)', status: 'Cleared' },
        { date: 'Sep 05, 2025', time: '10:20 AM', amount: 6000, ref: 'REC-Z99AB33', by: 'Branch Drop-off', status: 'Cleared' },
        { date: 'Aug 02, 2025', time: '02:15 PM', amount: 6000, ref: 'REC-H77UI88', by: 'Field Agent (AJ)', status: 'Cleared' },
        { date: 'Jul 08, 2025', time: '01:40 PM', amount: 6000, ref: 'REC-J55KL99', by: 'Field Agent (RK)', status: 'Cleared' },
        { date: 'Jun 04, 2025', time: '11:05 AM', amount: 6000, ref: 'REC-N44OP66', by: 'Branch Drop-off', status: 'Cleared' },
        { date: 'May 02, 2025', time: '09:50 AM', amount: 6000, ref: 'REC-Q22ST33', by: 'Field Agent (AJ)', status: 'Cleared' },
        { date: 'Apr 07, 2025', time: '03:30 PM', amount: 6000, ref: 'REC-R11VW88', by: 'Field Agent (RK)', status: 'Cleared' },
        { date: 'Mar 05, 2025', time: '10:10 AM', amount: 6000, ref: 'REC-T99YX22', by: 'Branch Drop-off', status: 'Cleared' },
        { date: 'Feb 03, 2025', time: '01:25 PM', amount: 6000, ref: 'REC-U88ZA44', by: 'Field Agent (AJ)', status: 'Cleared' },
        { date: 'Jan 02, 2025', time: '11:45 AM', amount: 6000, ref: 'REC-W66CB11', by: 'Field Agent (RK)', status: 'Cleared' }
      ]
    },
    {
      id: '6105', status: 'Closed', borrower: 'Akash Sharma', date: 'Feb 2024 - Jan 2025', amount: 48000, transactions: [
        { date: 'Jan 05, 2025', time: '02:10 PM', amount: 4000, ref: 'REC-D44LM01', by: 'Field Agent (RK)', status: 'Cleared' },
        { date: 'Dec 12, 2024', time: '10:05 AM', amount: 4000, ref: 'REC-Y77OP22', by: 'Field Agent (AJ)', status: 'Cleared' },
        { date: 'Nov 04, 2024', time: '11:30 AM', amount: 4000, ref: 'REC-A11BC33', by: 'Branch Drop-off', status: 'Cleared' },
        { date: 'Oct 08, 2024', time: '09:25 AM', amount: 4000, ref: 'REC-F44GH55', by: 'Field Agent (AJ)', status: 'Cleared' },
        { date: 'Sep 03, 2024', time: '04:15 PM', amount: 4000, ref: 'REC-K77LM99', by: 'Field Agent (RK)', status: 'Cleared' },
        { date: 'Aug 05, 2024', time: '11:50 AM', amount: 4000, ref: 'REC-P22QR11', by: 'Branch Drop-off', status: 'Cleared' },
        { date: 'Jul 07, 2024', time: '02:40 PM', amount: 4000, ref: 'REC-U55VW44', by: 'Field Agent (AJ)', status: 'Cleared' },
        { date: 'Jun 02, 2024', time: '10:10 AM', amount: 4000, ref: 'REC-Z88AB77', by: 'Field Agent (RK)', status: 'Cleared' },
        { date: 'May 06, 2024', time: '01:20 PM', amount: 4000, ref: 'REC-C11DE22', by: 'Branch Drop-off', status: 'Cleared' },
        { date: 'Apr 03, 2024', time: '09:45 AM', amount: 4000, ref: 'REC-H44IJ66', by: 'Field Agent (AJ)', status: 'Cleared' },
        { date: 'Mar 08, 2024', time: '03:55 PM', amount: 4000, ref: 'REC-M77NO33', by: 'Field Agent (RK)', status: 'Cleared' },
        { date: 'Feb 05, 2024', time: '11:15 AM', amount: 4000, ref: 'REC-R22ST88', by: 'Branch Drop-off', status: 'Cleared' }
      ]
    }
  ];

  const fetchDashboardData = () => {
    fetch('https://akash999.pythonanywhere.com/api/deposits/dashboard/', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(console.error);

    fetch('https://akash999.pythonanywhere.com/api/collections/', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setCollections(Array.isArray(data) ? data : []))
      .catch(console.error);

    fetch('https://akash999.pythonanywhere.com/api/deposits/', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setBankDeposits(Array.isArray(data) ? data : []))
      .catch(console.error);

    fetch('https://akash999.pythonanywhere.com/api/loans/', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setLoans(Array.isArray(data) ? data : []))
      .catch(console.error);
  };

  useEffect(() => {
    if (token) {
      fetchDashboardData();
    }
  }, [token, user]);

  const todayDropOff = 88500;
  const totalCollectedAmount = collections.reduce((acc, c) => acc + Number(c.amount_collected || 0), 0) || 50000;
  const totalDepositedAmount = bankDeposits.reduce((acc, d) => acc + Number(d.amount || 0), 0) || 35000;

  // Calculate cash in branch vault from collections awaiting bank deposit
  const unbankedCollections = collections.filter(c => c.status === 'collected' || c.status === 'branch_received');
  const vaultCashAmount = unbankedCollections.reduce((acc, c) => acc + Number(c.amount_collected || 0), 0);
  const cashInHand = vaultCashAmount > 0 ? vaultCashAmount : 48500;

  // Auto-fit deposit form amount to Today's Drop-Off (₹88,500)
  useEffect(() => {
    if (!bankDepositForm.amount) {
      setBankDepositForm(prev => ({ ...prev, amount: todayDropOff }));
    }
  }, [todayDropOff]);

  const handleVerifyReceiptAtBranch = async (collectionId, amount) => {
    try {
      const res = await fetch(`https://akash999.pythonanywhere.com/api/collections/${collectionId}/receive_at_branch/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ actual_amount: amount })
      });
      if (res.ok) {
        if (window.showAppModal) {
          window.showAppModal("Receipt Verified ✓", `Successfully verified ₹${Number(amount).toLocaleString()} into the branch vault.`, "success");
        }
        fetchDashboardData();
      }
    } catch (err) {
      if (window.showAppModal) {
        window.showAppModal("Verification Error", "Could not verify collection receipt at this time.", "warning");
      }
    }
  };

  const handleBankDepositSubmit = async (e) => {
    e.preventDefault();
    const amountNum = Number(bankDepositForm.amount);
    if (!amountNum || amountNum <= 0) {
      if (window.showAppModal) {
        window.showAppModal("Invalid Amount", "Please enter a valid deposit amount greater than ₹0.", "warning");
      }
      return;
    }

    const isShortfall = amountNum < todayDropOff;
    if (isShortfall && !bankDepositForm.shortfall_reason.trim()) {
      if (window.showAppModal) {
        window.showAppModal(
          "Shortfall Reason Mandatory",
          `The deposit amount (₹${amountNum.toLocaleString()}) is ₹${(todayDropOff - amountNum).toLocaleString()} less than today's dropped off cash (₹${todayDropOff.toLocaleString()}). You must state a valid reason before submitting.`,
          "warning"
        );
      }
      return;
    }

    if (!bankDepositForm.slip_file) {
      if (window.showAppModal) {
        window.showAppModal(
          "Deposit Slip Mandatory",
          "Attaching the physical bank deposit slip / stamped bank counterfoil is strictly mandatory. Please choose File or use Camera.",
          "warning"
        );
      }
      return;
    }

    const refNo = bankDepositForm.reference_number.trim() || `DEP-UTR-${Date.now().toString().slice(-6)}`;
    const formData = new FormData();
    formData.append('amount', amountNum);
    formData.append('bank_name', bankDepositForm.bank_name || 'State Bank of India');
    formData.append('account_number', bankDepositForm.account_number || '38921102938');
    formData.append('reference_number', refNo);
    formData.append('status', 'deposited');
    if (bankDepositForm.shortfall_reason.trim()) {
      formData.append('notes', bankDepositForm.shortfall_reason.trim());
    }
    formData.append('deposit_slip', bankDepositForm.slip_file);

    try {
      const res = await fetch('https://akash999.pythonanywhere.com/api/deposits/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (res.ok) {
        const created = await res.json();
        setBankDeposits(prev => [created, ...prev]);
        setBankDepositForm({
          bank_name: 'State Bank of India',
          account_number: '38921102938',
          amount: todayDropOff,
          reference_number: '',
          shortfall_reason: '',
          source: 'media',
          slip_file: null,
          slip_preview: null
        });
        stopAdminCamera();
        fetchDashboardData();
        if (window.showAppModal) {
          window.showAppModal(
            "Deposit Slip Submitted ✓",
            `Successfully submitted ₹${amountNum.toLocaleString()} to ${bankDepositForm.bank_name}.\nReference: ${refNo}\nDeposit slip has been filed for Super Admin review.`,
            "success"
          );
        }
      } else {
        const errData = await res.json().catch(() => ({}));
        if (window.showAppModal) {
          window.showAppModal("Deposit Submission Failed", JSON.stringify(errData), "warning");
        }
      }
    } catch (err) {
      if (window.showAppModal) {
        window.showAppModal("Network Error", "Unable to submit bank deposit at this time.", "warning");
      }
    }
  };

  if (!user) return <div style={{ textAlign: 'center', marginTop: '50px' }}>Loading...</div>;

  const renderSuperAdminDashboard = () => {
    // ─── Helpers ─────────────────────────────────────────────
    const filteredReceipts = collections.filter(c => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        (c.receipt_number && c.receipt_number.toLowerCase().includes(q)) ||
        (c.agent_name && c.agent_name.toLowerCase().includes(q)) ||
        (c.customer_name && c.customer_name.toLowerCase().includes(q))
      );
    });
    const saReceiptsTotalPages = Math.ceil(filteredReceipts.length / 5) || 1;
    const paginatedSaReceipts = filteredReceipts.slice((saReceiptsPage - 1) * 5, saReceiptsPage * 5);
    const saDepositsTotalPages = Math.ceil(bankDeposits.length / 5) || 1;
    const paginatedSaDeposits = bankDeposits.slice((saDepositsPage - 1) * 5, saDepositsPage * 5);

    // Paginate user lists
    const paginatedUsers = allUsers.slice((saUsersPage - 1) * 5, saUsersPage * 5);
    const paginatedAgents = activeAgents.slice((saAgentsPage - 1) * 5, saAgentsPage * 5);
    const paginatedAdmins = activeAdmins.slice((saAdminsPage - 1) * 5, saAdminsPage * 5);

    const tabBtnStyle = (active) => ({
      padding: 'clamp(8px, 2vw, 11px) clamp(16px, 3vw, 32px)',
      fontWeight: '600',
      fontSize: 'clamp(0.85rem, 2.5vw, 0.95rem)',
      borderRadius: '8px',
      border: 'none',
      background: active ? '#FFFFFF' : 'transparent',
      color: active ? '#2563EB' : '#64748B',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      whiteSpace: 'nowrap',
      boxShadow: active ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
    });

    const subTabBtnStyle = (active, color = '#059669') => ({
      padding: 'clamp(6px, 2vw, 9px) clamp(12px, 3vw, 24px)',
      fontWeight: '600',
      fontSize: 'clamp(0.75rem, 2.5vw, 0.82rem)',
      borderRadius: '8px',
      border: 'none',
      background: active ? '#FFFFFF' : 'transparent',
      color: active ? color : '#64748B',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      whiteSpace: 'nowrap',
      boxShadow: active ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
    });

    const RoleBadge = ({ role }) => {
      const map = {
        customer: { label: 'Customer', bg: '#F1F5F9', color: '#475569' },
        agent: { label: 'Field Agent', bg: '#ECFDF5', color: '#065F46' },
        admin: { label: 'Admin', bg: '#EFF6FF', color: '#1E40AF' },
        super_admin: { label: 'Super Admin', bg: '#FDF4FF', color: '#6B21A8' },
      };
      const s = map[role] || { label: role, bg: '#F1F5F9', color: '#475569' };
      return <span style={{ padding: '3px 9px', borderRadius: '6px', fontSize: '0.76rem', fontWeight: '700', background: s.bg, color: s.color, whiteSpace: 'nowrap' }}>{s.label}</span>;
    };

    const UserTable = ({ rows, emptyMsg }) => (
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.87rem' }}>
          <thead>
            <tr style={{ background: '#F8FAFC', borderBottom: '2px solid #E2E8F0', color: '#475569', textAlign: 'left' }}>
              <th style={{ padding: '11px 14px' }}>#</th>
              <th style={{ padding: '11px 14px' }}>Name</th>
              <th style={{ padding: '11px 14px' }}>Username</th>
              <th style={{ padding: '11px 14px' }}>Role</th>
              <th style={{ padding: '11px 14px' }}>Email</th>
              <th style={{ padding: '11px 14px' }}>Joined</th>
              <th style={{ padding: '11px 14px', textAlign: 'center' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr><td colSpan="7" style={{ textAlign: 'center', padding: '24px', color: '#94A3B8' }}>{emptyMsg}</td></tr>
            ) : rows.map((u) => (
              <tr key={u.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                <td style={{ padding: '11px 14px', color: '#94A3B8', fontSize: '0.8rem' }}>{u.id}</td>
                <td style={{ padding: '11px 14px', fontWeight: '600', color: '#0F172A', whiteSpace: 'nowrap' }}>{u.name}</td>
                <td style={{ padding: '11px 14px', color: '#475569', whiteSpace: 'nowrap' }}>@{u.username}</td>
                <td style={{ padding: '11px 14px' }}><RoleBadge role={u.role} /></td>
                <td style={{ padding: '11px 14px', color: '#64748B', fontSize: '0.82rem' }}>{u.email}</td>
                <td style={{ padding: '11px 14px', color: '#64748B', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>{u.joined}</td>
                <td style={{ padding: '11px 14px', textAlign: 'center' }}>
                  <span style={{
                    padding: '3px 9px', borderRadius: '6px', fontSize: '0.76rem', fontWeight: '700',
                    background: u.status === 'active' ? '#D1FAE5' : '#FEE2E2',
                    color: u.status === 'active' ? '#065F46' : '#991B1B'
                  }}>
                    {u.status === 'active' ? 'Active' : 'Inactive'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );

    const RequestTable = ({ rows, emptyMsg }) => (
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.87rem' }}>
          <thead>
            <tr style={{ background: '#F8FAFC', borderBottom: '2px solid #E2E8F0', textAlign: 'left', color: '#475569' }}>
              <th style={{ padding: '11px 14px' }}>User</th>
              <th style={{ padding: '11px 14px' }}>Requested Role</th>
              <th style={{ padding: '11px 14px' }}>Reason</th>
              <th style={{ padding: '11px 14px', textAlign: 'center' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr><td colSpan="4" style={{ textAlign: 'center', padding: '24px', color: '#94A3B8' }}>{emptyMsg}</td></tr>
            ) : rows.map(req => (
              <tr key={req.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                <td style={{ padding: '11px 14px', fontWeight: '600' }}>{req.user}</td>
                <td style={{ padding: '11px 14px' }}>
                  <span style={{ background: '#EFF6FF', color: '#2563EB', padding: '3px 9px', borderRadius: '5px', fontSize: '0.78rem', fontWeight: '600' }}>
                    {req.requestedRole === 'admin' ? 'Branch Admin' : 'Field Agent'}
                  </span>
                </td>
                <td style={{ padding: '11px 14px', fontSize: '0.82rem', color: '#475569' }}>{req.reason}</td>
                <td style={{ padding: '11px 14px', textAlign: 'center' }}>
                  <div style={{ display: 'inline-flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
                    <button style={{ padding: '6px 14px', fontSize: '0.78rem', fontWeight: '600', background: '#10B981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                      onClick={() => { setUpgradeRequests(upgradeRequests.filter(r => r.id !== req.id)); if (window.showAppModal) window.showAppModal('Role Approved ✓', `${req.user} approved as ${req.requestedRole}.`, 'success'); }}>
                      Approve
                    </button>
                    <button style={{ padding: '6px 14px', fontSize: '0.78rem', fontWeight: '600', background: '#EF4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                      onClick={() => { setUpgradeRequests(upgradeRequests.filter(r => r.id !== req.id)); if (window.showAppModal) window.showAppModal('Request Rejected', `Request for ${req.user} was declined.`, 'info'); }}>
                      Reject
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );

    // ─── Main Render ──────────────────────────────────────────
    return (
      <div style={{ minWidth: 0 }}>
        {/* ── Main Tabs ── */}
        <div style={{ display: 'flex', justifyContent: 'center', width: '100%', marginBottom: '24px' }}>
          <div style={{ display: 'inline-flex', background: '#F1F5F9', padding: '4px', borderRadius: '12px', flexWrap: 'nowrap', overflowX: 'auto', maxWidth: '100%' }}>
          <button style={tabBtnStyle(saMainTab === 'dashboard')} onClick={() => setSaMainTab('dashboard')}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '7px' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>
              Dashboard
            </span>
          </button>
          <button style={tabBtnStyle(saMainTab === 'information')} onClick={() => setSaMainTab('information')}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '7px' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
              Information
            </span>
          </button>
          </div>
        </div>
        {saMainTab === 'dashboard' && (
          <div>
            {/* Stats Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'clamp(14px, 2vw, 20px)', marginBottom: '24px' }}>
              <StatCard title="Expected Target" amount={500000} color="#3B82F6" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></svg>} />
              <StatCard title="Total Collected" amount={totalCollectedAmount} color="#10B981" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>} />
              <StatCard title="Cash in Branch" amount={cashInHand} color="#8B5CF6" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>} />
              <StatCard title="Secured in Bank" amount={totalDepositedAmount} color="#F59E0B" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="10" width="18" height="11" rx="2" /><path d="M7 10V7a5 5 0 0 1 10 0v3" /></svg>} />
            </div>

            {/* Sub-tabs */}
            <div style={{ display: 'flex', justifyContent: 'center', width: '100%', marginBottom: '20px' }}>
              <div style={{ display: 'flex', width: '100%', background: '#F1F5F9', padding: '4px', borderRadius: '12px', flexWrap: 'nowrap', overflow: 'hidden' }}>
              <button style={{ ...subTabBtnStyle(saDashTab === 'slips', '#059669'), flex: 1, display: 'flex', justifyContent: 'center', padding: 'clamp(6px, 1.5vw, 10px) clamp(2px, 1vw, 12px)', fontSize: 'clamp(0.65rem, 2.5vw, 0.82rem)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} onClick={() => setSaDashTab('slips')}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'clamp(3px, 1vw, 6px)' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>Agent Collection Slips</span>
                </span>
              </button>
              <button style={{ ...subTabBtnStyle(saDashTab === 'deposits', '#059669'), flex: 1, display: 'flex', justifyContent: 'center', padding: 'clamp(6px, 1.5vw, 10px) clamp(2px, 1vw, 12px)', fontSize: 'clamp(0.65rem, 2.5vw, 0.82rem)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} onClick={() => setSaDashTab('deposits')}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'clamp(3px, 1vw, 6px)' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><rect x="3" y="10" width="18" height="11" rx="2" /><path d="M7 10V7a5 5 0 0 1 10 0v3" /></svg>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>Admin Deposit Reports</span>
                </span>
              </button>
              </div>
            </div>

            {/* Agent Collection Slips */}
            {saDashTab === 'slips' && (
              <div className="card" style={{ padding: 'clamp(14px, 3vw, 24px)', boxSizing: 'border-box' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px', marginBottom: '18px' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: 'clamp(1rem, 3.5vw, 1.2rem)', color: '#0F172A', fontWeight: '700' }}>Agent Collection Slips 📄</h3>
                    <p style={{ margin: '4px 0 0', fontSize: '0.83rem', color: '#64748B' }}>All field agent receipts — view slip & mismatch reasons.</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', flex: '1 1 auto', justifyContent: 'flex-end' }}>
                    <span style={{ background: '#EFF6FF', color: '#1D4ED8', padding: '5px 12px', borderRadius: '8px', fontSize: '0.82rem', fontWeight: '700', whiteSpace: 'nowrap' }}>
                      Total: ₹{totalCollectedAmount.toLocaleString()} ({collections.length})
                    </span>
                    <input type="text" placeholder="Search here" value={searchQuery}
                      onChange={(e) => { setSearchQuery(e.target.value); setSaReceiptsPage(1); }}
                      style={{ padding: '7px 12px', border: '1.5px solid #CBD5E1', borderRadius: '8px', fontSize: '0.83rem', outline: 'none', minWidth: '150px', flex: 1 }}
                    />
                  </div>
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.86rem', minWidth: '500px' }}>
                    <thead>
                      <tr style={{ background: '#F8FAFC', borderBottom: '2px solid #E2E8F0', color: '#475569', textAlign: 'left' }}>
                        <th style={{ padding: '11px 12px' }}>Receipt #</th>
                        <th style={{ padding: '11px 12px' }}>Agent</th>
                        <th style={{ padding: '11px 12px' }}>Customer</th>
                        <th style={{ padding: '11px 12px' }}>Amount</th>
                        <th style={{ padding: '11px 12px' }}>Date</th>
                        <th style={{ padding: '11px 12px' }}>Status</th>
                        <th style={{ padding: '11px 12px', textAlign: 'center' }}>Slip</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedSaReceipts.length === 0 ? (
                        <tr><td colSpan="7" style={{ textAlign: 'center', padding: '24px', color: '#94A3B8' }}>No slips found.</td></tr>
                      ) : paginatedSaReceipts.map((c) => {
                        const badge = getEasyStatusBadge(c.status);
                        const isMismatch = c.status === 'discrepancy' || c.discrepancy_reason || c.remarks;
                        return (
                          <tr key={c.id || c.receipt_number} style={{ borderBottom: '1px solid #F1F5F9' }}>
                            <td style={{ padding: '11px 12px', fontWeight: '700', color: '#1E293B', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>{c.receipt_number}</td>
                            <td style={{ padding: '11px 12px', fontWeight: '600', color: '#0F172A' }}>{c.agent_name || c.agent || 'Agent'}</td>
                            <td style={{ padding: '11px 12px', color: '#475569' }}>
                              {c.customer_name || 'Borrower'} <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>({c.loan_id_display || `LN-${c.loan}`})</span>
                            </td>
                            <td style={{ padding: '11px 12px', fontWeight: '700', color: '#059669' }}>₹{Number(c.amount_collected).toLocaleString()}</td>
                            <td style={{ padding: '11px 12px', color: '#64748B', fontSize: '0.78rem', whiteSpace: 'nowrap' }}>
                              {c.collected_at ? new Date(c.collected_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Today'}
                            </td>
                            <td style={{ padding: '11px 12px' }}>
                              <div>
                                <span style={{ padding: '4px 9px', borderRadius: '6px', fontSize: '0.74rem', fontWeight: '700', background: badge.bg, color: badge.color, border: `1px solid ${badge.border}`, display: 'inline-flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}>
                                  {badge.icon && badge.icon} <span>{badge.label}</span>
                                </span>

                              </div>
                            </td>
                            <td style={{ padding: '11px 12px', textAlign: 'center' }}>
                              <button onClick={() => setPreviewSlipModal({ type: 'receipt', data: c })}
                                style={{ background: '#EFF6FF', color: '#2563EB', border: '1px solid #BFDBFE', padding: '5px 10px', borderRadius: '6px', fontSize: '0.76rem', fontWeight: '600', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg> View
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <TablePagination currentPage={saReceiptsPage} totalPages={saReceiptsTotalPages} totalItems={filteredReceipts.length} onPageChange={setSaReceiptsPage} />
              </div>
            )}

            {/* Admin Deposit Reports */}
            {saDashTab === 'deposits' && (
              <div className="card" style={{ padding: 'clamp(14px, 3vw, 24px)', boxSizing: 'border-box' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px', marginBottom: '18px' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: 'clamp(1rem, 3.5vw, 1.2rem)', color: '#0F172A', fontWeight: '700' }}>Admin Deposit Reports 🏦</h3>
                    <p style={{ margin: '4px 0 0', fontSize: '0.83rem', color: '#64748B' }}>Audit admin bank deposits — approve or reject each report.</p>
                  </div>
                  <span style={{ background: '#ECFDF5', color: '#047857', padding: '5px 12px', borderRadius: '8px', fontSize: '0.82rem', fontWeight: '700', whiteSpace: 'nowrap' }}>
                    Banked: ₹{totalDepositedAmount.toLocaleString()} ({bankDeposits.length})
                  </span>
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.86rem', minWidth: '580px' }}>
                    <thead>
                      <tr style={{ background: '#F8FAFC', borderBottom: '2px solid #E2E8F0', color: '#475569', textAlign: 'left' }}>
                        <th style={{ padding: '11px 12px' }}>Ref / UTR</th>
                        <th style={{ padding: '11px 12px' }}>Admin</th>
                        <th style={{ padding: '11px 12px' }}>Bank</th>
                        <th style={{ padding: '11px 12px' }}>Amount</th>
                        <th style={{ padding: '11px 12px' }}>Date</th>
                        <th style={{ padding: '11px 12px', textAlign: 'center' }}>Slip</th>
                        <th style={{ padding: '11px 12px', textAlign: 'center' }}>Audit</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedSaDeposits.length === 0 ? (
                        <tr><td colSpan="7" style={{ textAlign: 'center', padding: '24px', color: '#94A3B8' }}>No deposits submitted yet.</td></tr>
                      ) : paginatedSaDeposits.map((d) => {
                        const auditStatus = saDepositAudit[d.id];
                        return (
                          <tr key={d.id || d.reference_number} style={{ borderBottom: '1px solid #F1F5F9' }}>
                            <td style={{ padding: '11px 12px', fontWeight: '700', color: '#1E293B', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>{d.reference_number}</td>
                            <td style={{ padding: '11px 12px', fontWeight: '600' }}>{d.branch_manager_name || 'Admin'}</td>
                            <td style={{ padding: '11px 12px', color: '#475569' }}>{d.bank_name}</td>
                            <td style={{ padding: '11px 12px', fontWeight: '700', color: '#2563EB' }}>₹{Number(d.amount).toLocaleString()}</td>
                            <td style={{ padding: '11px 12px', color: '#64748B', fontSize: '0.78rem', whiteSpace: 'nowrap' }}>
                              {d.deposited_at ? new Date(d.deposited_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Today'}
                            </td>
                            <td style={{ padding: '11px 12px', textAlign: 'center' }}>
                              <button onClick={() => setPreviewSlipModal({ type: 'deposit', data: d })}
                                style={{ background: '#F0FDF4', color: '#16A34A', border: '1px solid #BBF7D0', padding: '5px 10px', borderRadius: '6px', fontSize: '0.76rem', fontWeight: '600', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg> View
                              </button>
                            </td>
                            <td style={{ padding: '11px 12px', textAlign: 'center' }}>
                              {auditStatus === 'approved' ? (
                                <span style={{ background: '#D1FAE5', color: '#065F46', padding: '4px 10px', borderRadius: '6px', fontSize: '0.76rem', fontWeight: '700' }}>✓ Approved</span>
                              ) : auditStatus === 'rejected' ? (
                                <span style={{ background: '#FEE2E2', color: '#991B1B', padding: '4px 10px', borderRadius: '6px', fontSize: '0.76rem', fontWeight: '700' }}>✗ Rejected</span>
                              ) : (
                                <div style={{ display: 'inline-flex', gap: '6px' }}>
                                  <button
                                    onClick={() => { setSaDepositAudit(prev => ({ ...prev, [d.id]: 'approved' })); if (window.showAppModal) window.showAppModal('Deposit Approved ✓', `Deposit ${d.reference_number} has been approved.`, 'success'); }}
                                    style={{ padding: '5px 10px', fontSize: '0.76rem', fontWeight: '600', background: '#10B981', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => { setSaDepositAudit(prev => ({ ...prev, [d.id]: 'rejected' })); if (window.showAppModal) window.showAppModal('Deposit Rejected', `Deposit ${d.reference_number} has been rejected.`, 'info'); }}
                                    style={{ padding: '5px 10px', fontSize: '0.76rem', fontWeight: '600', background: '#EF4444', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                                    Reject
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <TablePagination currentPage={saDepositsPage} totalPages={saDepositsTotalPages} totalItems={bankDeposits.length} onPageChange={setSaDepositsPage} />
              </div>
            )}
          </div>
        )}

        {/* ════════════ INFORMATION TAB ════════════ */}
        {saMainTab === 'information' && (
          <div>
            {/* Summary counters */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 150px), 1fr))', gap: 'clamp(10px, 2vw, 16px)', marginBottom: '22px' }}>
              {[
                { id: 'users', label: 'Total Users', value: allUsers.length, color: '#3B82F6' },
                { id: 'agents', label: 'Active Agents', value: activeAgents.length, color: '#10B981' },
                { id: 'admins', label: 'Active Admins', value: activeAdmins.length, color: '#8B5CF6' },
                { id: 'requests', label: 'Pending Requests', value: agentRequests.length + adminRequests.length, color: '#F59E0B' },
              ].map(({ id, label, value, color }) => (
                <div key={id} className="card" onClick={() => setSaInfoTab(id)} style={{ padding: 'clamp(12px, 2.5vw, 20px)', textAlign: 'center', cursor: 'pointer', border: saInfoTab === id ? `2px solid ${color}` : '2px solid transparent', transition: 'all 0.2s ease', boxShadow: saInfoTab === id ? '0 4px 12px rgba(0,0,0,0.1)' : '0 1px 3px rgba(0,0,0,0.05)' }}>
                  <div style={{ fontSize: 'clamp(1.4rem, 5vw, 2rem)', fontWeight: '800', color }}>{value}</div>
                  <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '4px', fontWeight: saInfoTab === id ? '600' : '500' }}>{label}</div>
                </div>
              ))}
            </div>

            <div className="card" style={{ padding: 'clamp(14px, 3vw, 24px)', boxSizing: 'border-box' }}>
              {saInfoTab === 'users' && (
                <>
                  <div style={{ marginBottom: '14px' }}>
                    <h3 style={{ margin: 0, fontSize: 'clamp(1rem, 3vw, 1.15rem)', fontWeight: '700', color: '#0F172A' }}>All Users</h3>
                    <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: '#64748B' }}>Complete list of all registered users across all roles.</p>
                  </div>
                  <UserTable rows={paginatedUsers} emptyMsg="No users found." />
                  <TablePagination currentPage={saUsersPage} totalPages={Math.ceil(allUsers.length / 5) || 1} totalItems={allUsers.length} onPageChange={setSaUsersPage} />
                </>
              )}
              {saInfoTab === 'agents' && (
                <>
                  <div style={{ marginBottom: '14px' }}>
                    <h3 style={{ margin: 0, fontSize: 'clamp(1rem, 3vw, 1.15rem)', fontWeight: '700', color: '#0F172A' }}>Active Field Agents</h3>
                    <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: '#64748B' }}>All currently active collection agents in the field.</p>
                  </div>
                  <UserTable rows={paginatedAgents} emptyMsg="No active agents." />
                  <TablePagination currentPage={saAgentsPage} totalPages={Math.ceil(activeAgents.length / 5) || 1} totalItems={activeAgents.length} onPageChange={setSaAgentsPage} />
                </>
              )}
              {saInfoTab === 'admins' && (
                <>
                  <div style={{ marginBottom: '14px' }}>
                    <h3 style={{ margin: 0, fontSize: 'clamp(1rem, 3vw, 1.15rem)', fontWeight: '700', color: '#0F172A' }}>Active Branch Admins</h3>
                    <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: '#64748B' }}>All active branch managers / admins.</p>
                  </div>
                  <UserTable rows={paginatedAdmins} emptyMsg="No active admins." />
                  <TablePagination currentPage={saAdminsPage} totalPages={Math.ceil(activeAdmins.length / 5) || 1} totalItems={activeAdmins.length} onPageChange={setSaAdminsPage} />
                </>
              )}
              {saInfoTab === 'requests' && (
                <>
                  <div style={{ marginBottom: '14px' }}>
                    <h3 style={{ margin: 0, fontSize: 'clamp(1rem, 3vw, 1.15rem)', fontWeight: '700', color: '#0F172A' }}>Role Upgrade Requests</h3>
                    <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: '#64748B' }}>Users requesting to be upgraded to Field Agent or Branch Admin roles.</p>
                  </div>
                  <RequestTable rows={[...agentRequests, ...adminRequests]} emptyMsg="No pending role requests." />
                </>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderAdminDashboard = () => {
    const filteredAdminReceipts = collections.filter(c => {
      if (!adminReceiptsSearch) return true;
      const q = adminReceiptsSearch.toLowerCase();
      return (
        (c.receipt_number && c.receipt_number.toLowerCase().includes(q)) ||
        (c.agent_name && c.agent_name.toLowerCase().includes(q)) ||
        (c.customer_name && c.customer_name.toLowerCase().includes(q))
      );
    });

    const adminReceiptsTotalPages = Math.ceil(filteredAdminReceipts.length / 5) || 1;
    const paginatedAdminReceipts = filteredAdminReceipts.slice((adminReceiptsPage - 1) * 5, adminReceiptsPage * 5);

    const adminDepositsTotalPages = Math.ceil(bankDeposits.length / 5) || 1;
    const paginatedAdminDeposits = bankDeposits.slice((adminDepositsPage - 1) * 5, adminDepositsPage * 5);

    const isDepositShortfall = Number(bankDepositForm.amount) < todayDropOff;

    return (
      <>
        {/* Top Summary Cards */}
        <div className="manager-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: 'clamp(12px, 2vw, 20px)', marginBottom: '24px' }}>
          <StatCard title="Expected Today" amount={90000} color="#3B82F6" icon="📦" />
          <StatCard title="Today Drop Off" amount={todayDropOff} color="#10B981" icon="💵" />
          <StatCard title="Verified Cash in Hand (To Be Banked)" amount={cashInHand} color="#F59E0B" icon="🏢" />
          <StatCard title="Total Banked" amount={totalDepositedAmount} color="#6366F1" icon="🏦" />
        </div>

        {/* Section 1: Agent Submitted Receipts */}
        <div className="card" style={{ marginBottom: '24px', padding: 'clamp(14px, 3vw, 24px)', boxSizing: 'border-box' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', marginBottom: '18px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: 'clamp(1.05rem, 3.5vw, 1.25rem)', color: '#0F172A', fontWeight: '700', whiteSpace: 'nowrap' }}>
                Cash Handovers 💵
              </h3>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', flex: '1 1 auto', minWidth: '150px' }}>
              <input
                type="text"
                placeholder="Search here"
                value={adminReceiptsSearch}
                onChange={(e) => { setAdminReceiptsSearch(e.target.value); setAdminReceiptsPage(1); }}
                style={{ width: '100%', padding: '8px 14px', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', width: '100%' }}>
            <table className="repayment-table" style={{ width: '100%', minWidth: '650px', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '2px solid #E2E8F0', color: '#475569', textAlign: 'left' }}>
                  <th style={{ padding: '12px' }}>Receipt #</th>
                  <th style={{ padding: '12px' }}>Agent Name</th>
                  <th style={{ padding: '12px' }}>Customer / Loan</th>
                  <th style={{ padding: '12px' }}>Collected Amount</th>
                  <th style={{ padding: '12px' }}>Date</th>
                  <th style={{ padding: '12px' }}>Status</th>
                  <th style={{ padding: '12px', textAlign: 'center' }}>Slip</th>
                  <th style={{ padding: '12px', textAlign: 'center' }}>Vault Action</th>
                </tr>
              </thead>
              <tbody>
                {paginatedAdminReceipts.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '24px', color: '#94A3B8' }}>
                      No agent receipts found matching search.
                    </td>
                  </tr>
                ) : (
                  paginatedAdminReceipts.map((c) => (
                    <tr key={c.id || c.receipt_number} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '12px', fontWeight: '700', color: '#1E293B', whiteSpace: 'nowrap' }}>{c.receipt_number}</td>
                      <td style={{ padding: '12px', fontWeight: '600', color: '#0F172A' }}>{c.agent_name || c.agent || 'Field Agent'}</td>
                      <td style={{ padding: '12px', color: '#475569' }}>
                        {c.customer_name || 'Borrower'} <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>({c.loan_id_display || `LN-${c.loan}`})</span>
                      </td>
                      <td style={{ padding: '12px', fontWeight: '700', color: '#059669' }}>
                        ₹{Number(c.amount_collected).toLocaleString()}
                      </td>
                      <td style={{ padding: '12px', color: '#64748B', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                        {c.collected_at ? new Date(c.collected_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : 'Today'}
                      </td>
                      <td style={{ padding: '12px' }}>
                        {(() => {
                          const badge = getEasyStatusBadge(c.status);
                          const isMismatch = c.status === 'discrepancy' || c.discrepancy_reason || c.remarks;
                          return (
                            <div>
                              <span style={{
                                padding: '4px 10px', borderRadius: '6px', fontSize: '0.76rem', fontWeight: '700',
                                background: badge.bg, color: badge.color, border: `1px solid ${badge.border}`,
                                display: 'inline-flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap'
                              }}>
                                {badge.icon && badge.icon} <span>{badge.label}</span>
                              </span>

                            </div>
                          );
                        })()}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        <button
                          onClick={() => setPreviewSlipModal({ type: 'receipt', data: c })}
                          style={{
                            background: '#EFF6FF', color: '#2563EB', border: '1px solid #BFDBFE',
                            padding: '6px 12px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: '600',
                            cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap'
                          }}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg> View Slip
                        </button>
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        {c.status === 'collected' ? (
                          <button
                            onClick={() => handleVerifyReceiptAtBranch(c.id, c.amount_collected)}
                            style={{
                              background: '#10B981', color: 'white', border: 'none',
                              padding: '6px 12px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: '600',
                              cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px'
                            }}
                          >
                            ✓ Accept Cash
                          </button>
                        ) : (
                          <span style={{ fontSize: '0.78rem', color: '#10B981', fontWeight: '600' }}>✓ In Vault</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <TablePagination
            currentPage={adminReceiptsPage}
            totalPages={adminReceiptsTotalPages}
            totalItems={filteredAdminReceipts.length}
            onPageChange={setAdminReceiptsPage}
          />
        </div>

        {/* Section 2: Bank Cash Deposit Form (Admin Deposits to Bank) */}
        <div className="card" style={{ marginTop: '45px', marginBottom: '24px', padding: 'clamp(14px, 3vw, 24px)', boxSizing: 'border-box', border: '1.5px solid #E2E8F0', borderRadius: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', marginBottom: '18px' }}>
            <h3 style={{ margin: 0, fontSize: 'clamp(1.05rem, 3.5vw, 1.25rem)', color: '#0F172A', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
              Bank Cash Deposit Form 🏦
            </h3>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: '500' }}>Today Drop Off</div>
              <div style={{ fontSize: '1.2rem', fontWeight: '800', color: '#059669' }}>₹{todayDropOff.toLocaleString()}</div>
            </div>
          </div>

          <form onSubmit={handleBankDepositSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: 'clamp(12px, 2vw, 18px)', marginBottom: '18px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.82rem', fontWeight: '600', color: '#334155' }}>
                  Select Bank <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <select
                  value={bankDepositForm.bank_name}
                  onChange={(e) => setBankDepositForm({ ...bankDepositForm, bank_name: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.9rem', outline: 'none', background: 'white' }}
                  required
                >
                  <option value="State Bank of India">State Bank of India (SBI)</option>
                  <option value="HDFC Bank">HDFC Bank</option>
                  <option value="ICICI Bank">ICICI Bank</option>
                  <option value="Punjab National Bank">Punjab National Bank (PNB)</option>
                  <option value="Bank of Baroda">Bank of Baroda</option>
                  <option value="Axis Bank">Axis Bank</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.82rem', fontWeight: '600', color: '#334155' }}>
                  Branch Bank Account / Branch Name
                </label>
                <input
                  type="text"
                  value={bankDepositForm.account_number}
                  onChange={(e) => setBankDepositForm({ ...bankDepositForm, account_number: e.target.value })}
                  placeholder="e.g. 38921102938 (Current Account)"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.9rem', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.82rem', fontWeight: '600', color: '#334155' }}>
                  Deposit Amount (₹) <span style={{ color: '#EF4444' }}>*</span> (Auto-fitted)
                </label>
                <input
                  type="number"
                  value={bankDepositForm.amount}
                  onChange={(e) => setBankDepositForm({ ...bankDepositForm, amount: e.target.value })}
                  placeholder={`Auto-fitted: ₹${todayDropOff}`}
                  style={{
                    width: '100%', padding: '10px 12px', borderRadius: '8px',
                    border: isDepositShortfall ? '2px solid #F59E0B' : '1px solid #CBD5E1',
                    fontSize: '0.95rem', fontWeight: '700', color: '#0F172A', outline: 'none'
                  }}
                  required
                >
                </input>
                <span style={{ fontSize: '0.72rem', color: '#64748B', display: 'block', marginTop: '4px' }}>
                  {isDepositShortfall ? (
                    <strong style={{ color: '#D97706' }}>
                      ⚠️ Less than today drop off by ₹{(todayDropOff - Number(bankDepositForm.amount)).toLocaleString()}
                    </strong>
                  ) : (
                    "✓ Matches or exceeds today drop off"
                  )}
                </span>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.82rem', fontWeight: '600', color: '#334155' }}>
                  Bank UTR / Challan Reference #
                </label>
                <input
                  type="text"
                  value={bankDepositForm.reference_number}
                  onChange={(e) => setBankDepositForm({ ...bankDepositForm, reference_number: e.target.value })}
                  placeholder="e.g. UTR-982104 or DEP-202610"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.9rem', outline: 'none' }}
                />
              </div>
            </div>

            {/* If amount is less than today drop off, require reason */}
            {isDepositShortfall && (
              <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '8px', padding: 'clamp(12px, 2.5vw, 18px)', marginBottom: '18px', boxSizing: 'border-box' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span style={{ fontSize: '1.1rem' }}>⚠️</span>
                  <span style={{ fontSize: '0.88rem', fontWeight: '700', color: '#B45309' }}>
                    Reason for Shortfall is Mandatory
                  </span>
                </div>
                <p style={{ margin: '0 0 10px 0', fontSize: '0.8rem', color: '#78350F' }}>
                  You are depositing ₹{Number(bankDepositForm.amount).toLocaleString()}, which is ₹{(todayDropOff - Number(bankDepositForm.amount)).toLocaleString()} less than today drop off (₹{todayDropOff.toLocaleString()}). Please state the reason.
                </p>
                <textarea
                  rows="2"
                  value={bankDepositForm.shortfall_reason}
                  onChange={(e) => setBankDepositForm({ ...bankDepositForm, shortfall_reason: e.target.value })}
                  placeholder="Reason for shortfall (e.g. kept for small change)..."
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #F59E0B', fontSize: '0.78rem', outline: 'none', boxSizing: 'border-box' }}
                  required
                />
              </div>
            )}

            {/* Bank Deposit Slip Upload (Same Camera or Files Options as Agent) */}
            <div style={{ background: '#F8FAFC', border: '1.5px dashed #94A3B8', borderRadius: '10px', padding: 'clamp(12px, 2.5vw, 18px)', marginBottom: '20px', boxSizing: 'border-box' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '1.3rem' }}>📄</span>
                  <div>
                    <span style={{ fontSize: '0.9rem', fontWeight: '700', color: '#0F172A', display: 'block' }}>
                      Attach Bank Deposit Slip <span style={{ color: '#EF4444' }}>*</span>
                    </span>
                    <span style={{ fontSize: '0.78rem', color: '#64748B' }}>
                      Upload photo or use camera to capture stamped deposit slip
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: '500', cursor: 'pointer', color: '#334155' }}>
                    <input
                      type="radio"
                      name="adminSlipSource"
                      value="media"
                      checked={bankDepositForm.source === 'media'}
                      onChange={() => {
                        stopAdminCamera();
                        setBankDepositForm({ ...bankDepositForm, source: 'media' });
                      }}
                      style={{ cursor: 'pointer', margin: 0, width: '16px', height: '16px', accentColor: '#2563EB' }}
                    />
                    Files
                  </label>
                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: '500', cursor: 'pointer', color: '#334155' }}>
                    <input
                      type="radio"
                      name="adminSlipSource"
                      value="camera"
                      checked={bankDepositForm.source === 'camera'}
                      onChange={() => {
                        setBankDepositForm({ ...bankDepositForm, source: 'camera' });
                      }}
                      style={{ cursor: 'pointer', margin: 0, width: '16px', height: '16px', accentColor: '#2563EB' }}
                    />
                    Camera
                  </label>
                </div>
              </div>

              {bankDepositForm.source === 'camera' ? (
                <div style={{ border: '1.5px dashed #CBD5E1', borderRadius: '8px', padding: '16px', background: '#EFF6FF', textAlign: 'center' }}>
                  {!isAdminCameraActive && !bankDepositForm.slip_file && (
                    <div style={{ cursor: 'pointer', padding: '12px' }} onClick={() => startAdminCamera(adminFacingMode)}>
                      <div style={{ fontSize: '2.4rem' }}>📷</div>
                      <div style={{ fontSize: '0.9rem', color: '#2563EB', fontWeight: '700', marginTop: '6px' }}>Tap to Open Camera</div>
                      <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '2px' }}>Capture live photo of the bank stamped deposit slip</div>
                    </div>
                  )}

                  <div style={{ display: isAdminCameraActive ? 'block' : 'none' }}>
                    <video ref={adminVideoRef} autoPlay playsInline style={{ width: '100%', maxWidth: '420px', borderRadius: '8px', marginBottom: '10px', background: '#000', transform: adminFacingMode === 'user' ? 'scaleX(-1)' : 'none' }}></video>
                    <div style={{ display: 'flex', gap: '10px', maxWidth: '420px', margin: '0 auto', flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        onClick={() => startAdminCamera(adminFacingMode === 'environment' ? 'user' : 'environment')}
                        style={{ flex: '1 1 120px', background: '#F1F5F9', border: '1px solid #CBD5E1', padding: '8px', borderRadius: '6px', color: '#475569', fontWeight: '600', cursor: 'pointer' }}
                      >
                        Flip Camera
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const video = adminVideoRef.current;
                          const canvas = adminCanvasRef.current;
                          if (video && canvas) {
                            canvas.width = video.videoWidth || 640;
                            canvas.height = video.videoHeight || 480;
                            canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
                            canvas.toBlob((blob) => {
                              if (blob) {
                                const file = new File([blob], `bank_slip_${Date.now()}.jpg`, { type: "image/jpeg" });
                                const previewUrl = URL.createObjectURL(blob);
                                setBankDepositForm({
                                  ...bankDepositForm,
                                  slip_file: file,
                                  slip_preview: previewUrl
                                });
                                stopAdminCamera();
                              }
                            }, 'image/jpeg', 0.9);
                          }
                        }}
                        style={{ flex: '2 1 160px', background: '#2563EB', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: '700', cursor: 'pointer' }}
                      >
                        📸 Capture Bank Slip
                      </button>
                    </div>
                    <canvas ref={adminCanvasRef} style={{ display: 'none' }}></canvas>
                  </div>

                  {bankDepositForm.slip_file && !isAdminCameraActive && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '8px' }}>
                      <div style={{ fontSize: '1.8rem', marginBottom: '4px' }}>🖼️</div>
                      <div style={{ fontSize: '0.85rem', color: '#059669', fontWeight: '700' }}>✓ Photo Captured Successfully</div>
                      <img
                        src={bankDepositForm.slip_preview}
                        alt="Captured Bank Slip"
                        style={{ maxHeight: '160px', maxWidth: '100%', objectFit: 'contain', borderRadius: '8px', border: '1px solid #CBD5E1', marginTop: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setBankDepositForm({ ...bankDepositForm, slip_file: null, slip_preview: null });
                          startAdminCamera(adminFacingMode);
                        }}
                        style={{ marginTop: '12px', background: '#FFFFFF', border: '1px solid #CBD5E1', color: '#475569', padding: '6px 14px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer' }}
                      >
                        🔄 Retake Photo
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ textAlign: 'center' }}>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    id="adminDepositSlipFile"
                    style={{ display: 'none' }}
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const previewUrl = URL.createObjectURL(file);
                        setBankDepositForm({
                          ...bankDepositForm,
                          slip_file: file,
                          slip_preview: previewUrl
                        });
                      }
                    }}
                  />
                  <label
                    htmlFor="adminDepositSlipFile"
                    style={{
                      background: '#3B82F6', color: 'white', padding: '10px 20px', borderRadius: '8px',
                      fontSize: '0.88rem', fontWeight: '600', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px',
                      boxShadow: '0 2px 6px rgba(59,130,246,0.3)'
                    }}
                  >
                    📁 Select Bank Slip File
                  </label>

                  {bankDepositForm.slip_preview && (
                    <div style={{ marginTop: '14px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.82rem', color: '#059669', fontWeight: '700', marginBottom: '6px', wordBreak: 'break-all' }}>
                        ✓ Slip Attached: {bankDepositForm.slip_file ? bankDepositForm.slip_file.name : 'deposit_slip.jpg'}
                      </span>
                      <img
                        src={bankDepositForm.slip_preview}
                        alt="Deposit Slip Preview"
                        style={{ maxHeight: '160px', maxWidth: '100%', objectFit: 'contain', borderRadius: '6px', border: '1px solid #CBD5E1', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            <button
              type="submit"
              style={{
                width: '100%', padding: '14px', borderRadius: '10px', background: '#059669', color: 'white',
                border: 'none', fontSize: '0.95rem', fontWeight: '700', cursor: 'pointer',
                display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px',
                boxShadow: '0 4px 12px rgba(5, 150, 105, 0.25)', transition: 'background 0.2s', boxSizing: 'border-box'
              }}
              onMouseOver={(e) => e.target.style.background = '#047857'}
              onMouseOut={(e) => e.target.style.background = '#059669'}
            >
              <span>🏦</span> Submit Bank Deposit & Upload Slip
            </button>
          </form>
        </div>

        {/* Section 3: Branch Bank Deposits History */}
        <div className="card" style={{ padding: 'clamp(14px, 3vw, 24px)', boxSizing: 'border-box', marginBottom: '24px', marginTop: '45px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontSize: 'clamp(1.05rem, 3.5vw, 1.25rem)', color: '#0F172A', fontWeight: '700' }}>
              Branch Bank Deposits Submitted (Audited by Super Admin) 📋
            </h3>
            <span style={{ background: '#ECFDF5', color: '#047857', padding: '4px 12px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '700' }}>
              Total Banked: ₹{totalDepositedAmount.toLocaleString()}
            </span>
          </div>

          <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', width: '100%' }}>
            <table className="repayment-table" style={{ width: '100%', minWidth: '650px', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '2px solid #E2E8F0', color: '#475569', textAlign: 'left' }}>
                  <th style={{ padding: '12px' }}>Reference / UTR</th>
                  <th style={{ padding: '12px' }}>Bank Name</th>
                  <th style={{ padding: '12px' }}>Deposited Amount</th>
                  <th style={{ padding: '12px' }}>Status</th>

                  <th style={{ padding: '12px' }}>Date</th>
                  <th style={{ padding: '12px', textAlign: 'center' }}>Slip</th>
                </tr>
              </thead>
              <tbody>
                {paginatedAdminDeposits.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '24px', color: '#94A3B8' }}>
                      No bank deposits submitted yet. Use the form above to record your first bank deposit.
                    </td>
                  </tr>
                ) : (
                  paginatedAdminDeposits.map((d) => (
                    <tr key={d.id || d.reference_number} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '12px', fontWeight: '700', color: '#1E293B', whiteSpace: 'nowrap' }}>{d.reference_number}</td>
                      <td style={{ padding: '12px', color: '#334155' }}>{d.bank_name}</td>
                      <td style={{ padding: '12px', fontWeight: '700', color: '#059669' }}>
                        ₹{Number(d.amount).toLocaleString()}
                      </td>
                      <td style={{ padding: '12px' }}>
                        {(() => {
                          const badge = getEasyStatusBadge(d.status);
                          return (
                            <span style={{
                              padding: '4px 10px', borderRadius: '6px', fontSize: '0.76rem', fontWeight: '700',
                              background: badge.bg, color: badge.color, border: `1px solid ${badge.border}`,
                              display: 'inline-flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap'
                            }}>
                              {badge.icon && badge.icon} <span>{badge.label}</span>
                            </span>
                          );
                        })()}
                      </td>

                      <td style={{ padding: '12px', color: '#64748B', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                        {d.deposited_at ? new Date(d.deposited_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : 'Today'}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        <button
                          onClick={() => setPreviewSlipModal({ type: 'deposit', data: d })}
                          style={{
                            background: '#EFF6FF', color: '#2563EB', border: '1px solid #BFDBFE',
                            padding: '6px 12px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: '600',
                            cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap'
                          }}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg> View Slip
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <TablePagination
            currentPage={adminDepositsPage}
            totalPages={adminDepositsTotalPages}
            totalItems={bankDeposits.length}
            onPageChange={setAdminDepositsPage}
          />
        </div>
      </>
    );
  };

  const handleRecordSubmit = (e) => {
    e.preventDefault();
    const amount = Number(collectionData.amount);
    const expectedEmi = getLoanEmi(collectionForm);

    if (!collectionData.file) {
      if (window.showAppModal) {
        window.showAppModal("Receipt Mandatory", "Receipt photo is mandatory. Please upload or capture an image.", "warning");
      }
      return;
    }
    if (amount !== expectedEmi && !collectionData.remarks.trim()) {
      if (window.showAppModal) {
        window.showAppModal("Remarks Mandatory", "Collected amount differs from expected EMI. Remarks are mandatory.", "warning");
      }
      return;
    }

    const receipt = 'REC-' + Math.random().toString(36).substr(2, 6).toUpperCase();

    const formData = new FormData();
    formData.append('loan', collectionForm.id);
    formData.append('agent', user.id);
    formData.append('amount_collected', amount);
    formData.append('receipt_number', receipt);
    const isMismatch = amount !== expectedEmi;
    formData.append('status', isMismatch ? 'discrepancy' : 'collected');
    if (isMismatch) {
      formData.append('discrepancy_amount', Math.abs(expectedEmi - amount));
      formData.append('discrepancy_reason', collectionData.remarks);
    }
    if (collectionData.remarks) {
      formData.append('remarks', collectionData.remarks);
      formData.append('discrepancy_reason', collectionData.remarks);
    }
    if (collectionData.file) {
      formData.append('receipt_image', collectionData.file);
    }

    fetch('https://akash999.pythonanywhere.com/api/collections/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    }).then(res => {
      if (res.ok) {
        setCollectionForm(null);
        setCollectionData({ amount: '', source: 'media', remarks: '', file: null });
        if (window.showAppModal) {
          window.showAppModal("Collection Recorded ✓", `Payment of ₹${amount.toLocaleString()} recorded successfully!\nReceipt: ${receipt}`, "success", () => {
            window.location.reload();
          });
        } else {
          window.location.reload();
        }
      }
    });
  };

  const renderAgentDashboard = () => {
    const isCollectedToday = (dateStr) => {
      if (!dateStr) return false;
      const d = new Date(dateStr);
      const now = new Date();
      return d.getFullYear() === now.getFullYear() &&
        d.getMonth() === now.getMonth() &&
        d.getDate() === now.getDate();
    };

    const todayCollections = collections.filter(c => isCollectedToday(c.collected_at));
    const activeCollections = todayCollections.length > 0 ? todayCollections : collections;
    const dynamicCollectedToday = activeCollections.length > 0
      ? activeCollections.reduce((sum, c) => sum + Number(c.amount_collected || 0), 0)
      : 30000;

    const dynamicReceiptsCount = activeCollections.length > 0 ? activeCollections.length : 6;

    const pendingQueue = loans.filter(l => Number(l.outstanding_amount) > 0);
    const dynamicPendingRecovery = pendingQueue.length > 0
      ? pendingQueue.reduce((sum, l) => sum + getLoanEmi(l), 0)
      : 0;

    const dynamicRemainingCount = pendingQueue.length;

    const dynamicExpectedToday = dynamicCollectedToday + dynamicPendingRecovery;

    const dynamicTargetProgress = dynamicExpectedToday > 0
      ? ((dynamicCollectedToday / dynamicExpectedToday) * 100).toFixed(1)
      : '100.0';

    const dynamicCashInHand = dynamicCollectedToday;

    const filteredLoans = loans.filter(loan =>
      Number(loan.outstanding_amount) > 0 &&
      ((loan.customer_name && loan.customer_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        String(loan.id).includes(searchQuery) ||
        (loan.customer_phone && loan.customer_phone.includes(searchQuery)))
    );
    const pageSize = 5;
    const totalPages = Math.max(1, Math.ceil(filteredLoans.length / pageSize));
    const activePage = Math.min(currentPage, totalPages);
    const startIndex = (activePage - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, filteredLoans.length);
    const paginatedLoans = filteredLoans.slice(startIndex, endIndex);

    return (
      <>
        <div className="agent-portal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'clamp(4px, 1.5vw, 15px)', marginTop: '45px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 'clamp(1.3rem, 5vw, 1.75rem)', color: '#0F172A' }}>Agent Field Portal</h2>
          </div>
        </div>

        <div className="agent-stats-grid">
          <div className="card" style={{ padding: 'clamp(12px, 3vw, 20px)', position: 'relative' }}>
            <h3 style={{ color: '#64748B', fontSize: 'clamp(0.75rem, 3vw, 0.85rem)', fontWeight: '500', marginBottom: '8px' }}>Today's Expected</h3>
            <div className="stat-card-value" style={{ margin: 0, color: '#0F172A', fontSize: 'clamp(1.4rem, 6vw, 2rem)', fontWeight: '700', letterSpacing: '-0.5px' }}>₹{dynamicExpectedToday.toLocaleString()}</div>
            <div className="stat-icon-wrapper" style={{ position: 'absolute', top: '15px', right: '15px', background: '#EFF6FF', color: '#2563EB', width: 'clamp(24px, 4vw, 32px)', height: 'clamp(24px, 4vw, 32px)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 'clamp(0.8rem, 2vw, 1rem)' }}>◎</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'clamp(12px, 3vw, 20px)', fontSize: 'clamp(0.7rem, 2.5vw, 0.8rem)', color: '#64748B' }}>
              <span>Target Progress</span>
              <strong style={{ color: '#2563EB' }}>{dynamicTargetProgress}%</strong>
            </div>
          </div>

          <div className="card" style={{ padding: 'clamp(12px, 3vw, 20px)', position: 'relative' }}>
            <h3 style={{ color: '#64748B', fontSize: 'clamp(0.75rem, 3vw, 0.85rem)', fontWeight: '500', marginBottom: '8px' }}>Collected Today</h3>
            <div className="stat-card-value" style={{ margin: 0, color: '#059669', fontSize: 'clamp(1.4rem, 6vw, 2rem)', fontWeight: '700', letterSpacing: '-0.5px' }}>₹{dynamicCollectedToday.toLocaleString()}</div>
            <div className="stat-icon-wrapper" style={{ position: 'absolute', top: '15px', right: '15px', background: '#D1FAE5', color: '#059669', width: 'clamp(24px, 4vw, 32px)', height: 'clamp(24px, 4vw, 32px)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 'clamp(0.8rem, 2vw, 1rem)' }}>✓</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'clamp(12px, 3vw, 20px)', fontSize: 'clamp(0.7rem, 2.5vw, 0.8rem)', color: '#64748B' }}>
              <span>Receipts Issued</span>
              <strong style={{ color: '#334155' }}>{dynamicReceiptsCount} Verified</strong>
            </div>
          </div>

          <div className="card" style={{ padding: 'clamp(12px, 3vw, 20px)', position: 'relative' }}>
            <h3 style={{ color: '#64748B', fontSize: 'clamp(0.75rem, 3vw, 0.85rem)', fontWeight: '500', marginBottom: '8px' }}>Physical Cash in Hand</h3>
            <div className="stat-card-value" style={{ margin: 0, color: '#0F172A', fontSize: 'clamp(1.4rem, 6vw, 2rem)', fontWeight: '700', letterSpacing: '-0.5px' }}>₹{dynamicCashInHand.toLocaleString()}</div>
            <div className="stat-icon-wrapper" style={{ position: 'absolute', top: '15px', right: '15px', background: '#F1F5F9', color: '#475569', width: 'clamp(24px, 4vw, 32px)', height: 'clamp(24px, 4vw, 32px)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 'clamp(0.8rem, 2vw, 1rem)' }}>💵</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'clamp(12px, 3vw, 20px)', fontSize: 'clamp(0.7rem, 2.5vw, 0.8rem)', color: '#64748B' }}>
              <span style={{ color: '#D97706', display: 'flex', alignItems: 'center', gap: '4px' }}><strong style={{ fontSize: '1rem' }}>!</strong> Vault Deposit Due</span>
              <span style={{ color: '#94A3B8' }}>Ready</span>
            </div>
          </div>

          <div className="card" style={{ padding: 'clamp(12px, 3vw, 20px)', position: 'relative' }}>
            <h3 style={{ color: '#64748B', fontSize: 'clamp(0.75rem, 3vw, 0.85rem)', fontWeight: '500', marginBottom: '8px' }}>Pending Recovery</h3>
            <div className="stat-card-value" style={{ margin: 0, color: '#0F172A', fontSize: 'clamp(1.4rem, 6vw, 2rem)', fontWeight: '700', letterSpacing: '-0.5px' }}>₹{dynamicPendingRecovery.toLocaleString()}</div>
            <div className="stat-icon-wrapper" style={{ position: 'absolute', top: '15px', right: '15px', background: '#FEF3C7', color: '#D97706', width: 'clamp(24px, 4vw, 32px)', height: 'clamp(24px, 4vw, 32px)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 'clamp(0.8rem, 2vw, 1rem)' }}>⏱</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'clamp(12px, 3vw, 20px)', fontSize: 'clamp(0.7rem, 2.5vw, 0.8rem)', color: '#64748B' }}>
              <span>Remaining Queue</span>
              <strong style={{ color: '#334155' }}>{dynamicRemainingCount} Customers</strong>
            </div>
          </div>
        </div>

        <div className="agent-main-grid" style={{ marginTop: '45px' }}>
          <div className="card" style={{ padding: '0', display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
            <div className="agent-table-header" style={{ padding: 'clamp(16px, 4vw, 24px)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E2E8F0', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h3 style={{ margin: '0 0 5px 0', fontSize: 'clamp(1rem, 3.5vw, 1.1rem)' }}>Assigned Customers & Recovery</h3>
              </div>
              <div className="agent-table-search" style={{ width: '100%', maxWidth: '250px', display: 'flex', alignItems: 'center', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '6px', padding: '0 10px', boxSizing: 'border-box', transition: 'all 0.2s' }}>
                <svg style={{ width: '16px', height: '16px', color: '#94A3B8', flexShrink: 0 }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search by name or loan ID..."
                  value={searchQuery}
                  onChange={e => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  style={{ flex: 1, padding: '8px 10px', background: 'transparent', border: 'none', outline: 'none', boxShadow: 'none', fontSize: '0.85rem', width: '100%' }}
                />
              </div>
            </div>

            <div className="repayment-table-container" style={{ flex: 1, overflowX: 'auto', WebkitOverflowScrolling: 'touch', width: '100%' }}>
              <table className="repayment-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ padding: '12px 24px' }}>CUSTOMER</th>
                    <th>LOAN ID</th>
                    <th>EMI DUE</th>
                    <th>TOTAL OUTSTANDING</th>
                    <th>STATUS</th>
                    <th style={{ textAlign: 'right', paddingRight: '24px' }}>ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedLoans.length > 0 ? (
                    paginatedLoans.map((loan, index) => {
                      let emi = getLoanEmi(loan);
                      return (
                        <tr key={loan.id || index}>
                          <td style={{ padding: '16px 24px' }}>
                            <div style={{ fontWeight: '600', color: '#0F172A', fontSize: '0.9rem' }}>{loan.customer_name}</div>
                            <div style={{ color: '#94A3B8', fontSize: '0.75rem' }}>{loan.customer_phone}</div>
                          </td>
                          <td style={{ color: '#64748B', fontSize: '0.85rem' }}>LN - {loan.id}</td>
                          <td style={{ fontWeight: '600', color: '#0F172A', fontSize: '0.9rem' }}>₹{emi.toLocaleString()}</td>
                          <td style={{ color: '#64748B', fontSize: '0.85rem' }}>₹{loan.outstanding_amount?.toLocaleString() || 0}</td>
                          <td>
                            {loan.outstanding_amount > 0 ? (
                              <span className={loan.id === 6190 ? "badge" : "badge badge-warning"} style={loan.id === 6190 ? { background: '#F1F5F9', color: '#64748B' } : {}}>
                                {loan.id === 6190 ? "Scheduled" : "Pending"}
                              </span>
                            ) : (
                              <span className="badge badge-success" style={{ paddingLeft: '8px' }}>✓ Paid</span>
                            )}
                          </td>
                          <td style={{ textAlign: 'right', paddingRight: '24px' }}>
                            {loan.outstanding_amount > 0 ? (
                              <button onClick={() => setCollectionForm(loan)} style={{ padding: '6px 14px', fontSize: '0.85rem', display: 'inline-flex', gap: '6px' }}>+ Record Cash</button>
                            ) : (
                              <button className="btn-outline" style={{ padding: '6px 14px', fontSize: '0.85rem', display: 'inline-flex', gap: '6px' }} disabled>📄 Receipt</button>
                            )}
                          </td>
                        </tr>
                      )
                    })
                  ) : (
                    <tr>
                      <td colSpan="6" style={{ padding: '30px', textAlign: 'center', color: '#64748B' }}>No upcoming collection requests for today.</td>
                    </tr>
                  )}
                </tbody>
                {pendingQueue.length > 0 && (
                  <tfoot>
                    <tr style={{ background: '#F8FAFC', borderTop: '2px solid #E2E8F0', fontWeight: '600' }}>
                      <td colSpan="2" style={{ padding: '14px 24px', color: '#0F172A', fontSize: '0.85rem' }}>
                        <strong>Queue Total ({pendingQueue.length} Pending Customers)</strong>
                      </td>
                      <td style={{ color: '#2563EB', fontSize: '0.95rem', fontWeight: '700' }}>
                        ₹{dynamicPendingRecovery.toLocaleString()}
                      </td>
                      <td style={{ color: '#64748B', fontSize: '0.85rem' }}>
                        ₹{pendingQueue.reduce((sum, l) => sum + Number(l.outstanding_amount || 0), 0).toLocaleString()}
                      </td>
                      <td colSpan="2" style={{ textAlign: 'right', paddingRight: '24px', color: '#059669', fontSize: '0.8rem', fontWeight: '600' }}>
                        ✓ Matches Pending Recovery
                      </td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>

            <div className="agent-pagination-footer" style={{ marginTop: 'auto', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #E2E8F0', fontSize: '0.85rem', color: '#64748B', flexWrap: 'wrap', gap: '12px' }}>
              <span>Showing {filteredLoans.length > 0 ? `${startIndex + 1} to ${endIndex}` : '0'} of {filteredLoans.length} upcoming requests</span>
              <div className="pagination-buttons" style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                <button
                  className="btn-outline"
                  style={{
                    padding: '5px 12px',
                    fontSize: '0.8rem',
                    color: activePage <= 1 ? '#94A3B8' : '#334155',
                    borderColor: '#E2E8F0',
                    cursor: activePage <= 1 ? 'not-allowed' : 'pointer',
                    background: '#FFFFFF'
                  }}
                  disabled={activePage <= 1}
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                  <button
                    key={pageNum}
                    className="btn-outline"
                    onClick={() => setCurrentPage(pageNum)}
                    style={{
                      padding: '5px 12px',
                      fontSize: '0.8rem',
                      borderColor: pageNum === activePage ? '#2563EB' : '#E2E8F0',
                      color: pageNum === activePage ? '#2563EB' : '#475569',
                      background: pageNum === activePage ? '#EFF6FF' : '#FFFFFF',
                      fontWeight: pageNum === activePage ? '600' : '400',
                      cursor: 'pointer'
                    }}
                  >
                    {pageNum}
                  </button>
                ))}
                <button
                  className="btn-outline"
                  style={{
                    padding: '5px 12px',
                    fontSize: '0.8rem',
                    color: activePage >= totalPages ? '#94A3B8' : '#334155',
                    borderColor: '#E2E8F0',
                    cursor: activePage >= totalPages ? 'not-allowed' : 'pointer',
                    background: '#FFFFFF'
                  }}
                  disabled={activePage >= totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                >
                  Next
                </button>
              </div>
            </div>
          </div>

          <div className="card" style={{ padding: '0', marginTop: '35px' }}>
            <div style={{ padding: '24px', borderBottom: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px', flexWrap: 'wrap', gap: '8px' }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Deposit Cash at Branch</h3>
              </div>
              <p style={{ margin: 0, color: '#64748B', fontSize: '0.85rem' }}>Submit today's collected cash to the branch desk.</p>
            </div>

            <div style={{ padding: '24px' }}>
              <div style={{ border: '1px solid #E2E8F0', borderRadius: '8px', padding: '20px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '0.9rem' }}>
                  <span style={{ color: '#64748B' }}>Expected Today</span>
                  <span style={{ fontWeight: '600' }}>₹{dynamicExpectedToday.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '0.9rem' }}>
                  <span style={{ color: '#64748B' }}>Collected Cash</span>
                  <span style={{ fontWeight: '600', color: '#059669' }}>₹{dynamicCollectedToday.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', fontSize: '0.9rem' }}>
                  <span style={{ color: dynamicPendingRecovery > 0 ? '#DC2626' : '#059669', fontWeight: '500' }}>
                    {dynamicPendingRecovery > 0 ? 'Short Amount (Missing)' : 'Discrepancy (Nil)'}
                  </span>
                  <span style={{ fontWeight: '700', color: dynamicPendingRecovery > 0 ? '#DC2626' : '#059669' }}>
                    {dynamicPendingRecovery > 0 ? `- ₹${dynamicPendingRecovery.toLocaleString()}` : '₹0'}
                  </span>
                </div>

                <div style={{ borderTop: '1px dashed #E2E8F0', margin: '0 -20px 20px -20px' }}></div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                  <span style={{ fontWeight: '600', fontSize: '0.95rem' }}>Cash to Deposit:</span>
                  <span style={{ fontWeight: '700', fontSize: '1.5rem', letterSpacing: '-0.5px', color: '#0F172A' }}>₹{dynamicCashInHand.toLocaleString()}</span>
                </div>
              </div>

              {dynamicPendingRecovery > 0 && (
                <div style={{ marginBottom: '18px' }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: '600', color: '#DC2626' }}>
                    Reason for Short Amount (- ₹{dynamicPendingRecovery.toLocaleString()}) <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <textarea
                    required
                    rows={2}
                    placeholder="e.g. Borrower unavailable, promised payment on Monday..."
                    value={depositReason}
                    onChange={e => setDepositReason(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1.5px solid #FCA5A5',
                      background: '#FEF2F2',
                      fontSize: '0.85rem',
                      boxSizing: 'border-box',
                      minHeight: '52px',
                      outline: 'none',
                      resize: 'vertical'
                    }}
                  />
                </div>
              )}

              <button
                onClick={() => {
                  if (dynamicPendingRecovery > 0 && !depositReason.trim()) {
                    if (window.showAppModal) {
                      window.showAppModal("Reason Required", `Please enter the reason for the short amount (- ₹${dynamicPendingRecovery.toLocaleString()}) before submitting.`, "warning");
                    }
                    return;
                  }
                  if (window.showAppModal) {
                    window.showAppModal("Branch Deposit Successful ✓", `Cash of ₹${dynamicCashInHand.toLocaleString()} successfully deposited to branch desk!${depositReason ? '\n\nReason noted: ' + depositReason : ''}`, "success");
                  }
                  setDepositReason('');
                }}
                style={{ width: '100%', padding: '14px', fontSize: '0.95rem', fontWeight: '600', display: 'flex', gap: '8px', justifyContent: 'center' }}
              >
                ↑ Submit Cash to Branch (₹{dynamicCashInHand.toLocaleString()})
              </button>
            </div>
          </div>
        </div>

        {collectionForm && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15,23,42,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(2px)', padding: '12px', boxSizing: 'border-box' }}>
            <div className="card" style={{ width: '100%', maxWidth: '420px', maxHeight: '90vh', overflowY: 'auto', margin: 0, padding: '24px' }}>
              <h3 style={{ marginTop: 0 }}>Record Collection</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Loan LN-{collectionForm.id} | Outstanding: ₹{collectionForm.outstanding_amount.toLocaleString()}</p>
              <form onSubmit={handleRecordSubmit}>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem', fontWeight: '600' }}>Amount Collected (Expected: ₹{getLoanEmi(collectionForm).toLocaleString()})</label>
                  <input
                    type="number"
                    name="amount"
                    required
                    placeholder="Enter amount..."
                    value={collectionData.amount}
                    onChange={e => setCollectionData({ ...collectionData, amount: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #CBD5E1', boxSizing: 'border-box' }}
                  />
                </div>

                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem', fontWeight: '600' }}>Upload Receipt Photo (Mandatory) <span style={{ color: '#EF4444' }}>*</span></label>
                  <div style={{ display: 'flex', gap: '10px', marginBottom: '8px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', cursor: 'pointer' }}>
                      <input type="radio" name="source" value="media" checked={collectionData.source === 'media'} onChange={() => { stopCamera(); setCollectionData({ ...collectionData, source: 'media', file: null }); }} />
                      Files
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', cursor: 'pointer' }}>
                      <input type="radio" name="source" value="camera" checked={collectionData.source === 'camera'} onChange={() => { setCollectionData({ ...collectionData, source: 'camera', file: null }); }} />
                      Camera
                    </label>
                  </div>
                  {collectionData.source === 'camera' ? (
                    <div style={{ border: '1.5px dashed #CBD5E1', borderRadius: '8px', padding: '15px', background: '#EFF6FF', textAlign: 'center', transition: 'background 0.2s' }}>

                      {!isCameraActive && !collectionData.file && (
                        <div style={{ cursor: 'pointer' }} onClick={() => startCamera(facingMode)}>
                          <div style={{ fontSize: '2rem' }}>📷</div>
                          <div style={{ fontSize: '0.85rem', color: '#2563EB', fontWeight: '600', marginTop: '5px' }}>Tap to Open Camera</div>
                        </div>
                      )}

                      <div style={{ display: isCameraActive ? 'block' : 'none' }}>
                        <video ref={videoRef} autoPlay playsInline style={{ width: '100%', borderRadius: '8px', marginBottom: '10px', background: '#000', transform: facingMode === 'user' ? 'scaleX(-1)' : 'none' }}></video>
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <button type="button" onClick={() => startCamera(facingMode === 'environment' ? 'user' : 'environment')} style={{ flex: 1, background: '#F1F5F9', border: '1px solid #CBD5E1', padding: '8px', borderRadius: '6px', color: '#475569', fontWeight: '600', cursor: 'pointer' }}>Flip Camera</button>
                          <button type="button" onClick={() => {
                            const video = videoRef.current;
                            const canvas = canvasRef.current;
                            if (video && canvas) {
                              canvas.width = video.videoWidth;
                              canvas.height = video.videoHeight;
                              canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
                              canvas.toBlob((blob) => {
                                if (blob) {
                                  const file = new File([blob], "camera_capture.jpg", { type: "image/jpeg" });
                                  setCollectionData({ ...collectionData, file: file });
                                  stopCamera();
                                }
                              }, 'image/jpeg', 0.9);
                            }
                          }} style={{ flex: 2, background: '#3B82F6', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }}>Capture Photo</button>
                        </div>
                        <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
                      </div>

                      {collectionData.file && !isCameraActive && (
                        <div>
                          <div style={{ fontSize: '2rem' }}>🖼️</div>
                          <div style={{ fontSize: '0.75rem', color: '#059669', marginTop: '5px', fontWeight: '600' }}>✓ Photo Captured</div>
                          <button type="button" onClick={() => {
                            setCollectionData({ ...collectionData, file: null });
                          }} style={{ marginTop: '10px', background: 'transparent', border: '1px solid #CBD5E1', color: '#475569', padding: '6px 12px', borderRadius: '4px', fontSize: '0.8rem', cursor: 'pointer' }}>Retake Photo</button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div style={{ border: '1.5px dashed #CBD5E1', borderRadius: '8px', padding: '10px', background: '#F8FAFC', textAlign: 'center' }}>
                      <input
                        type="file"
                        required={!collectionData.file}
                        accept="image/*"
                        onChange={e => e.target.files[0] && setCollectionData({ ...collectionData, file: e.target.files[0] })}
                        style={{ fontSize: '0.8rem', width: '100%' }}
                      />
                      {collectionData.file && <div style={{ fontSize: '0.75rem', color: '#059669', marginTop: '5px', fontWeight: '500', textAlign: 'left' }}>✓ {collectionData.file.name}</div>}
                    </div>
                  )}
                </div>

                {(collectionData.amount && Number(collectionData.amount) !== getLoanEmi(collectionForm)) ? (
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem', fontWeight: '600', color: '#EF4444' }}>Reason for Amount Mismatch (Mandatory) *</label>
                    <textarea
                      required
                      placeholder="Explain why the collected amount differs from expected EMI..."
                      value={collectionData.remarks}
                      onChange={e => setCollectionData({ ...collectionData, remarks: e.target.value })}
                      style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #EF4444', minHeight: '60px' }}
                    />
                  </div>
                ) : null}

                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
                  <button type="button" onClick={() => { stopCamera(); setCollectionForm(null); setCollectionData({ amount: '', source: 'media', remarks: '', file: null }); }} className="btn-outline">Cancel</button>
                  <button type="submit" style={{ background: '#3B82F6', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }}>Generate Receipt & Save</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </>
    );
  };

  const renderCustomerDashboard = () => {
    const HAS_ACTIVE_LOAN = true; // Toggle to true to see populated dashboard
    const myLoan = HAS_ACTIVE_LOAN ? { amount: 50000, outstanding_amount: 45000, id: 8921 } : null;
    const currentHistoryLoans = HAS_ACTIVE_LOAN ? historyLoans : [];

    const paidBack = myLoan ? myLoan.amount - myLoan.outstanding_amount : 0;
    const progress = myLoan ? ((paidBack / myLoan.amount) * 100).toFixed(1) : 0;

    const EmptyState = ({ icon, title, description }) => (
      <div style={{ background: 'white', borderRadius: '16px', padding: '60px 40px', textAlign: 'center', border: '1px dashed #CBD5E1', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
        <div style={{ width: '80px', height: '80px', background: '#F8FAFC', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', fontSize: '2.5rem' }}>
          {icon}
        </div>
        <h3 style={{ margin: '0 0 10px 0', color: '#0F172A', fontSize: '1.25rem' }}>{title}</h3>
        <p style={{ margin: 0, color: '#64748B', maxWidth: '350px', lineHeight: '1.5' }}>{description}</p>
      </div>
    );

    return (
      <div style={{ minHeight: 'calc(100vh - 150px)', marginTop: '-10px' }}>
        {/* Main Content Area */}
        <div style={{ width: '100%' }}>
          {customerTab === 'Dashboard' && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                <div>
                  <h2 style={{ marginBottom: '5px', fontSize: 'clamp(1.2rem, 4vw, 1.75rem)', color: '#0F172A' }}>Customer Portal</h2>
                  <p style={{ color: '#64748B', margin: 0, fontSize: 'clamp(0.8rem, 2.5vw, 0.95rem)' }}>View your active loans, upcoming EMIs, and complete payment history</p>
                </div>
              </div>

              {!myLoan ? (
                <EmptyState
                  icon="💸"
                  title="No Active Loans"
                  description="You currently don't have any active loans with CashGrid. When a loan is approved, it will appear here."
                />
              ) : (
                <div className="customer-stats-scroll-container">
                  <div className="card customer-stat-card" style={{ padding: 'clamp(14px, 3vw, 20px)', position: 'relative' }}>
                    <h3 style={{ color: '#64748B', fontSize: '0.85rem', fontWeight: '500', marginBottom: '8px', paddingRight: '45px', lineHeight: '1.4' }}>Total Loan (Incl. Interest)</h3>
                    <div style={{ margin: 0, color: '#0F172A', fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: '700', letterSpacing: '-0.5px' }}>₹{(myLoan.amount * 1.1).toLocaleString()}</div>
                    <div style={{ position: 'absolute', top: '20px', right: '20px', background: '#F1F5F9', color: '#475569', width: '38px', height: '38px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px', fontSize: '0.8rem', color: '#64748B' }}>
                      <span>Loan Account</span>
                      <strong style={{ color: '#334155' }}>LN-{myLoan.id}</strong>
                    </div>
                  </div>

                  <div className="card customer-stat-card" style={{ padding: 'clamp(14px, 3vw, 20px)', position: 'relative' }}>
                    <h3 style={{ color: '#64748B', fontSize: '0.85rem', fontWeight: '500', marginBottom: '8px', paddingRight: '45px', lineHeight: '1.4' }}>Total Paid Back</h3>
                    <div style={{ margin: 0, color: '#059669', fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: '700', letterSpacing: '-0.5px' }}>₹{paidBack.toLocaleString()}</div>
                    <div style={{ position: 'absolute', top: '20px', right: '20px', background: '#D1FAE5', color: '#059669', width: '38px', height: '38px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </div>
                  </div>

                  <div className="card customer-stat-card" style={{ padding: 'clamp(14px, 3vw, 20px)', position: 'relative' }}>
                    <h3 style={{ color: '#64748B', fontSize: '0.85rem', fontWeight: '500', marginBottom: '8px', paddingRight: '45px', lineHeight: '1.4' }}>Outstanding Amount</h3>
                    <div style={{ margin: 0, color: '#0F172A', fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: '700', letterSpacing: '-0.5px' }}>₹{myLoan.outstanding_amount?.toLocaleString()}</div>
                    <div style={{ position: 'absolute', top: '20px', right: '20px', background: '#FEF3C7', color: '#D97706', width: '38px', height: '38px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                    </div>
                  </div>

                  <div className="card customer-stat-card" style={{ padding: 'clamp(14px, 3vw, 20px)', position: 'relative' }}>
                    <h3 style={{ color: '#64748B', fontSize: '0.85rem', fontWeight: '500', marginBottom: '8px', paddingRight: '45px', lineHeight: '1.4' }}>Coming Up Next</h3>
                    <div style={{ margin: 0, color: '#0F172A', fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: '700', letterSpacing: '-0.5px' }}>₹5,000</div>
                    <div style={{ position: 'absolute', top: '20px', right: '20px', background: '#EFF6FF', color: '#2563EB', width: '38px', height: '38px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px', fontSize: '0.8rem', color: '#64748B' }}>
                      <span>Due Date</span>
                      <strong style={{ color: '#2563EB' }}>Nov 01, 2026</strong>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {customerTab === 'History' && currentHistoryLoans.length === 0 && (
            <div style={{ height: '100%' }}>
              <EmptyState
                icon="📜"
                title="No Transaction History"
                description="You haven't made any payments yet. Your complete payment history will be safely stored here."
              />
            </div>
          )}

          {customerTab === 'History' && currentHistoryLoans.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: '100%' }}>
              {/* Upper Section: Scrollable Vertical Loan Cards */}
              <div style={{ background: '#F8FAFC', borderRadius: '12px', padding: '15px', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748B', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '15px', paddingLeft: '5px' }}>ALL LOAN HISTORY</div>
                <div className="loan-history-list" style={{ display: 'flex', gap: '15px', maxHeight: '240px', overflowY: 'auto', overflowX: 'auto', paddingRight: '10px', paddingBottom: '10px' }}>
                  {historyLoans.map(loan => (
                    <div
                      key={loan.id}
                      onClick={() => setSelectedHistoryId(loan.id)}
                      style={{
                        padding: 'clamp(10px, 3vw, 15px) clamp(12px, 3vw, 20px)',
                        borderRadius: '12px',
                        border: selectedHistoryId === loan.id ? '2px solid #2563EB' : '1px solid #E2E8F0',
                        background: selectedHistoryId === loan.id ? '#EFF6FF' : 'white',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        boxShadow: selectedHistoryId === loan.id ? '0 4px 15px rgba(37,99,235,0.1)' : '0 1px 3px rgba(0,0,0,0.02)'
                      }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontWeight: '700', color: '#0F172A', fontSize: 'clamp(0.95rem, 3.5vw, 1.1rem)' }}>LN-{loan.id}</span>
                        <span style={{ background: loan.status === 'Active' ? '#ECFDF5' : '#F1F5F9', color: loan.status === 'Active' ? '#059669' : '#64748B', padding: 'clamp(2px, 1vw, 4px) clamp(6px, 2vw, 10px)', borderRadius: '20px', fontSize: 'clamp(0.65rem, 2.5vw, 0.75rem)', fontWeight: '600' }}>{loan.status}</span>
                      </div>
                      <div style={{ display: 'flex', gap: 'clamp(12px, 4vw, 24px)', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#475569', fontSize: 'clamp(0.7rem, 2.5vw, 0.85rem)' }}>
                          <span>📅</span> {loan.date}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#0F172A', fontSize: 'clamp(0.75rem, 2.5vw, 0.9rem)', fontWeight: '600', whiteSpace: 'nowrap' }}>
                          <span>👤</span> {loan.borrower}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Lower Section: Transactions for selected loan */}
              <div className="card" style={{ padding: '0', flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                {currentHistoryLoans.filter(l => l.id === selectedHistoryId).map(loan => (
                  <React.Fragment key={`details-${loan.id}`}>
                    <div style={{ padding: 'clamp(15px, 4vw, 24px)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', borderBottom: '1px solid #E2E8F0', background: '#F8FAFC', borderRadius: '12px 12px 0 0' }}>
                      <div>
                        <h3 style={{ margin: '0 0 5px 0', fontSize: 'clamp(1rem, 3.5vw, 1.15rem)', color: '#0F172A' }}>Transaction History</h3>
                        <p style={{ margin: 0, color: '#64748B', fontSize: 'clamp(0.75rem, 2.5vw, 0.85rem)' }}>All recorded payments for Loan Account: LN-{loan.id}</p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <div style={{ fontSize: 'clamp(0.75rem, 2.5vw, 0.9rem)', color: '#64748B' }}>Total Loan Value:</div>
                        <div style={{ fontSize: 'clamp(1rem, 3.5vw, 1.2rem)', fontWeight: '700', color: '#0F172A' }}>₹{loan.amount.toLocaleString()}</div>
                      </div>
                    </div>

                    <div className="repayment-table-container" style={{ overflowX: 'auto', overflowY: 'auto', maxHeight: '350px', WebkitOverflowScrolling: 'touch', width: '100%' }}>
                      <table className="repayment-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ position: 'sticky', top: 0, background: 'white', zIndex: 1, boxShadow: '0 1px 0 #E2E8F0' }}>
                          <tr>
                            <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '0.8rem', color: '#64748B' }}>DATE & TIME</th>
                            <th style={{ textAlign: 'left', fontSize: '0.8rem', color: '#64748B' }}>AMOUNT PAID</th>
                            <th style={{ textAlign: 'left', fontSize: '0.8rem', color: '#64748B' }}>RECEIPT / REF</th>
                            <th style={{ textAlign: 'left', fontSize: '0.8rem', color: '#64748B' }}>MODE / AGENT</th>
                            <th style={{ textAlign: 'left', fontSize: '0.8rem', color: '#64748B' }}>STATUS</th>
                          </tr>
                        </thead>
                        <tbody>
                          {loan.transactions.map((tx, idx) => (
                            <tr key={idx} style={{ borderBottom: '1px solid #F1F5F9', transition: 'background 0.2s', cursor: 'default' }} onMouseOver={(e) => e.currentTarget.style.background = '#F8FAFC'} onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>
                              <td style={{ padding: '16px 24px' }}>
                                <div style={{ fontWeight: '600', color: '#0F172A', fontSize: '0.9rem' }}>{tx.date}</div>
                                <div style={{ color: '#94A3B8', fontSize: '0.75rem' }}>{tx.time}</div>
                              </td>
                              <td style={{ fontWeight: '700', color: '#0F172A', fontSize: '0.95rem' }}>₹{tx.amount.toLocaleString()}</td>
                              <td style={{ color: '#64748B', fontSize: '0.85rem', fontFamily: 'monospace' }}>{tx.ref}</td>
                              <td style={{ color: '#64748B', fontSize: '0.85rem' }}>{tx.by}</td>
                              <td><span className="badge badge-success">✓ {tx.status}</span></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </React.Fragment>
                ))}
              </div>
            </div>
          )}

          {customerTab === 'Payments' && !myLoan && (
            <div style={{ height: '100%' }}>
              <EmptyState
                icon="💳"
                title="No Upcoming Payments"
                description="Since you have no active loans, there are no upcoming EMIs or payments due."
              />
            </div>
          )}

          {customerTab === 'Payments' && myLoan && (
            <div className="card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                <div style={{ fontSize: '2rem' }}>🤝</div>
                <div>
                  <h3 style={{ margin: '0 0 5px 0', fontSize: 'clamp(1rem, 4vw, 1.25rem)', color: '#0F172A', whiteSpace: 'nowrap' }}>Schedule Cash Collection</h3>
                  <p style={{ color: '#64748B', fontSize: 'clamp(0.7rem, 2.5vw, 0.85rem)', margin: 0 }}>An agent will visit your location to collect physical cash.</p>
                </div>
              </div>

              <div style={{ marginTop: '30px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', gap: '16px', marginBottom: '20px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: 'clamp(0.8rem, 2.5vw, 0.9rem)' }}>Select EMI Installment</label>
                    <select
                      value={selectedEMI}
                      onChange={(e) => {
                        const newEmi = e.target.value;
                        setSelectedEMI(newEmi);
                        setPaymentAmount(newEmi === 'Oct 2026' ? 3000 : 5000);
                      }}
                      style={{ width: '100%', padding: 'clamp(8px, 2vw, 12px)', borderRadius: '6px', border: '1px solid #E2E8F0', fontSize: 'clamp(0.85rem, 3vw, 1rem)', background: '#F8FAFC', color: '#0F172A', cursor: 'pointer' }}
                    >
                      <option value="Oct 2026">Oct 2026 - Partial (Due: ₹3,000)</option>
                      <option value="Nov 2026">Nov 2026 - Pending (Due)</option>
                      <option value="Dec 2026">Dec 2026 - Scheduled</option>
                      <option value="Jan 2027">Jan 2027 - Scheduled</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: 'clamp(0.8rem, 2.5vw, 0.9rem)' }}>Amount to Pay (₹) - <span style={{ color: '#64748B', fontWeight: 'normal', fontSize: 'clamp(0.7rem, 2.2vw, 0.85rem)' }}>Auto-fetched EMI</span></label>
                    <input
                      type="number"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(Number(e.target.value))}
                      style={{ width: '100%', padding: 'clamp(8px, 2vw, 12px)', borderRadius: '6px', border: paymentAmount < (selectedEMI === 'Oct 2026' ? 3000 : 5000) ? '1px solid #F59E0B' : '1px solid #E2E8F0', fontSize: 'clamp(0.95rem, 3.5vw, 1.1rem)', fontWeight: '600', color: '#0F172A', background: '#F8FAFC' }}
                    />
                  </div>
                </div>

                {paymentAmount < (selectedEMI === 'Oct 2026' ? 3000 : 5000) && (
                  <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                      <span style={{ color: '#D97706', fontSize: '1.2rem' }}>⚠️</span>
                      <div>
                        <h4 style={{ margin: '0 0 5px 0', color: '#92400E', fontSize: '0.9rem' }}>Partial Payment Warning</h4>
                        <p style={{ margin: 0, color: '#B45309', fontSize: '0.8rem', lineHeight: '1.4' }}>You are paying less than your scheduled due amount of ₹{(selectedEMI === 'Oct 2026' ? 3000 : 5000).toLocaleString()}. Late fees and additional interest charges may apply to the remaining balance.</p>
                      </div>
                    </div>

                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '0.85rem', color: '#92400E', marginTop: '15px' }}>Reason for partial payment</label>
                    <textarea
                      value={paymentReason}
                      onChange={(e) => setPaymentReason(e.target.value)}
                      placeholder="Please explain why you cannot make the full payment today..."
                      style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #FCD34D', fontSize: '0.85rem', minHeight: '60px', resize: 'vertical' }}
                    />
                  </div>
                )}

                {paymentAmount > (selectedEMI === 'Oct 2026' ? 3000 : 5000) && (
                  <div style={{ background: '#ECFDF5', border: '1px solid #6EE7B7', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <span style={{ color: '#059669', fontSize: '1.2rem' }}>💰</span>
                      <div>
                        <h4 style={{ margin: '0 0 5px 0', color: '#065F46', fontSize: '0.9rem' }}>Surplus Payment Detected</h4>
                        <p style={{ margin: 0, color: '#047857', fontSize: '0.8rem', lineHeight: '1.4' }}>Your scheduled due amount is ₹{(selectedEMI === 'Oct 2026' ? 3000 : 5000).toLocaleString()}. The extra ₹{(paymentAmount - (selectedEMI === 'Oct 2026' ? 3000 : 5000)).toLocaleString()} you are paying will be automatically added as a surplus to offset your future scheduled payments or principal.</p>
                      </div>
                    </div>
                  </div>
                )}

                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: 'clamp(0.8rem, 2.5vw, 0.9rem)' }}>Preferred Collection Date & Time</label>
                <div style={{ display: 'flex', gap: 'clamp(8px, 2vw, 15px)', marginBottom: '24px' }}>
                  {(() => {
                    const months = { "Jan": '01', "Feb": '02', "Mar": '03', "Apr": '04', "May": '05', "Jun": '06', "Jul": '07', "Aug": '08', "Sep": '09', "Oct": '10', "Nov": '11', "Dec": '12' };
                    let minDate = "", maxDate = "";
                    if (selectedEMI) {
                      const parts = selectedEMI.split(' ');
                      if (parts.length === 2 && months[parts[0]]) {
                        const month = months[parts[0]];
                        const year = parts[1];
                        const lastDay = new Date(parseInt(year), parseInt(month), 0).getDate();
                        minDate = `${year}-${month}-01`;
                        maxDate = `${year}-${month}-${lastDay}`;
                      }
                    }
                    return (
                      <>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 'clamp(0.65rem, 2vw, 0.75rem)', color: '#64748B', marginBottom: '4px' }}>Select Date</div>
                          <input
                            type="date"
                            min={minDate}
                            max={maxDate}
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            style={{ width: '100%', padding: 'clamp(8px, 2vw, 12px)', borderRadius: '6px', border: '1px solid #E2E8F0', fontSize: 'clamp(0.8rem, 2.8vw, 1rem)', color: '#475569', boxSizing: 'border-box' }}
                          />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 'clamp(0.65rem, 2vw, 0.75rem)', color: '#64748B', marginBottom: '4px' }}>Select Time</div>
                          <input
                            type="time"
                            value={selectedTime}
                            onChange={(e) => setSelectedTime(e.target.value)}
                            style={{ width: '100%', padding: 'clamp(8px, 2vw, 12px)', borderRadius: '6px', border: '1px solid #E2E8F0', fontSize: 'clamp(0.8rem, 2.8vw, 1rem)', color: '#475569', boxSizing: 'border-box' }}
                          />
                        </div>
                      </>
                    );
                  })()}
                </div>

                <button
                  onClick={() => {
                    if (!selectedDate || !selectedTime) {
                      showToast("Please select both date and time.", "error");
                      return;
                    }
                    setScheduledVisits(prev => {
                      const isReschedule = !!prev[selectedEMI];
                      if (isReschedule && prev[selectedEMI].rescheduled) {
                        showToast("You can only reschedule a collection once.", "error");
                        return prev;
                      }
                      return {
                        ...prev,
                        [selectedEMI]: {
                          date: selectedDate,
                          time: selectedTime,
                          amount: paymentAmount,
                          rescheduled: isReschedule
                        }
                      };
                    });
                    if (scheduledVisits[selectedEMI] && !scheduledVisits[selectedEMI].rescheduled) {
                      showToast(`Collection rescheduled successfully for ${selectedEMI}!`, "success");
                    } else if (!scheduledVisits[selectedEMI]) {
                      showToast(`Collection scheduled successfully for ${selectedEMI}!`, "success");
                    }
                  }}
                  style={{ width: '100%', padding: '14px', fontSize: '1rem', fontWeight: '600', background: '#2563EB', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', transition: 'background 0.2s' }} onMouseOver={(e) => e.target.style.background = '#1D4ED8'} onMouseOut={(e) => e.target.style.background = '#2563EB'}>
                  {scheduledVisits[selectedEMI] ? 'Confirm Rescheduling Request' : 'Confirm Scheduling Request'}
                </button>
              </div>
            </div>
          )}

          {customerTab === 'Dashboard' && myLoan && (
            <div className="card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
                <h3 style={{ margin: 0, fontSize: 'clamp(1.1rem, 4vw, 1.25rem)', color: '#0F172A', wordBreak: 'break-word' }}>Loan Details: LN-{myLoan.id}</h3>
                <span style={{ background: '#ECFDF5', color: '#059669', padding: '4px 12px', borderRadius: '20px', fontSize: 'clamp(0.75rem, 2.5vw, 0.85rem)', fontWeight: '600' }}>Active</span>
              </div>

              <div className="loan-details-grid">
                <div className="loan-details-section">
                  <p style={{ color: '#64748B', fontSize: 'clamp(0.75rem, 2.5vw, 0.85rem)', margin: '0 0 5px 0' }}>Borrower Name</p>
                  <p style={{ fontWeight: '600', margin: '0 0 16px 0', color: '#0F172A', fontSize: 'clamp(0.9rem, 3vw, 1rem)' }}>{user?.username || 'Rajesh Kumar'}</p>

                  <p style={{ color: '#64748B', fontSize: 'clamp(0.75rem, 2.5vw, 0.85rem)', margin: '0 0 5px 0' }}>Principal Amount</p>
                  <p style={{ fontWeight: '600', margin: '0 0 16px 0', color: '#0F172A', fontSize: 'clamp(0.9rem, 3vw, 1rem)' }}>₹{myLoan.amount?.toLocaleString()}</p>

                  <p style={{ color: '#64748B', fontSize: 'clamp(0.75rem, 2.5vw, 0.85rem)', margin: '0 0 5px 0' }}>Issuing Bank</p>
                  <p style={{ fontWeight: '600', margin: 0, color: '#0F172A', fontSize: 'clamp(0.9rem, 3vw, 1rem)' }}>HDFC Bank Ltd.</p>
                </div>

                <div className="loan-details-section">
                  <p style={{ color: '#64748B', fontSize: 'clamp(0.75rem, 2.5vw, 0.85rem)', margin: '0 0 5px 0' }}>Disbursement Date</p>
                  <p style={{ fontWeight: '600', margin: '0 0 16px 0', color: '#0F172A', fontSize: 'clamp(0.9rem, 3vw, 1rem)' }}>Jan 15, 2026</p>

                  <p style={{ color: '#64748B', fontSize: 'clamp(0.75rem, 2.5vw, 0.85rem)', margin: '0 0 5px 0' }}>Interest Rate</p>
                  <p style={{ fontWeight: '600', margin: '0 0 16px 0', color: '#0F172A', fontSize: 'clamp(0.9rem, 3vw, 1rem)' }}>10.0% p.a.</p>

                  <p style={{ color: '#64748B', fontSize: 'clamp(0.75rem, 2.5vw, 0.85rem)', margin: '0 0 5px 0' }}>Bank Branch</p>
                  <p style={{ fontWeight: '600', margin: 0, color: '#0F172A', fontSize: 'clamp(0.9rem, 3vw, 1rem)' }}>South Extension #03</p>
                </div>

                <div className="loan-details-section">
                  <p style={{ color: '#64748B', fontSize: 'clamp(0.75rem, 2.5vw, 0.85rem)', margin: '0 0 5px 0' }}>Expected End Date</p>
                  <p style={{ fontWeight: '600', margin: '0 0 16px 0', color: '#0F172A', fontSize: 'clamp(0.9rem, 3vw, 1rem)' }}>Jan 15, 2027</p>

                  <p style={{ color: '#64748B', fontSize: 'clamp(0.75rem, 2.5vw, 0.85rem)', margin: '0 0 5px 0' }}>Total (Incl. Interest)</p>
                  <p style={{ fontWeight: '600', margin: '0 0 16px 0', color: '#2563EB', fontSize: 'clamp(1rem, 3.5vw, 1.1rem)' }}>₹{(myLoan.amount * 1.1).toLocaleString()}</p>

                  <p style={{ color: '#64748B', fontSize: 'clamp(0.75rem, 2.5vw, 0.85rem)', margin: '0 0 5px 0' }}>Disbursement Account</p>
                  <p style={{ fontWeight: '600', margin: 0, color: '#0F172A', fontSize: 'clamp(0.9rem, 3vw, 1rem)' }}>XXXX-XXXX-8921</p>
                </div>
              </div>
            </div>
          )}

          {customerTab === 'Payments' && myLoan && (
            <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #E2E8F0' }}>
                <h3 style={{ margin: '0 0 5px 0', fontSize: '1.1rem' }}>Repayment Schedule</h3>
              </div>
              <div className="repayment-table-container" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', width: '100%' }}>
                <table className="repayment-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={{ padding: '12px 24px', textAlign: 'left' }}>DUE DATE</th>
                      <th style={{ textAlign: 'left' }}>EMI AMOUNT</th>
                      <th style={{ textAlign: 'left' }}>PAID AMOUNT</th>
                      <th style={{ textAlign: 'left' }}>COLLECTION VISIT</th>
                      <th style={{ textAlign: 'left' }}>STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ padding: '16px 24px', fontWeight: '600', color: '#0F172A' }}>Oct 01, 2026</td>
                      <td style={{ fontWeight: '600' }}>₹5,000</td>
                      <td>₹2,000</td>
                      <td>
                        {scheduledVisits['Oct 2026'] ? (
                          <div style={{ background: '#EFF6FF', padding: '8px 12px', borderRadius: '6px', border: '1px solid #BFDBFE', display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ fontSize: '0.85rem', color: '#1E3A8A', fontWeight: '600' }}>
                              {scheduledVisits['Oct 2026'].date} at {scheduledVisits['Oct 2026'].time}
                            </div>
                            <button
                              disabled={scheduledVisits['Oct 2026'].rescheduled}
                              onClick={() => {
                                setSelectedEMI('Oct 2026');
                                setPaymentAmount(3000);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                                showToast('Please select a new date and time above, then confirm.', 'info');
                              }}
                              style={{
                                padding: '4px 10px', fontSize: '0.75rem', fontWeight: '600', borderRadius: '4px', border: 'none',
                                background: scheduledVisits['Oct 2026'].rescheduled ? '#CBD5E1' : '#3B82F6',
                                color: 'white', cursor: scheduledVisits['Oct 2026'].rescheduled ? 'not-allowed' : 'pointer',
                                transition: 'background 0.2s'
                              }}
                            >
                              {scheduledVisits['Oct 2026'].rescheduled ? 'Rescheduled' : 'Reschedule'}
                            </button>
                          </div>
                        ) : (
                          <span style={{ color: '#D97706', fontSize: '0.85rem', fontWeight: '500' }}>Not Scheduled (₹3,000 Due)</span>
                        )}
                      </td>
                      <td><span className="badge" style={{ background: '#FEF3C7', color: '#D97706', padding: '4px 8px', borderRadius: '4px', fontWeight: '600', fontSize: '0.75rem' }}>Partial</span></td>
                    </tr>
                    <tr style={{ background: '#F8FAFC' }}>
                      <td style={{ padding: '16px 24px', fontWeight: '600', color: '#0F172A' }}>Nov 01, 2026</td>
                      <td style={{ fontWeight: '600' }}>₹5,000</td>
                      <td>₹0</td>
                      <td>
                        {scheduledVisits['Nov 2026'] ? (
                          <div style={{ background: '#EFF6FF', padding: '8px 12px', borderRadius: '6px', border: '1px solid #BFDBFE', display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ fontSize: '0.85rem', color: '#1E3A8A', fontWeight: '600' }}>
                              {scheduledVisits['Nov 2026'].date} at {scheduledVisits['Nov 2026'].time}
                            </div>
                            <button
                              disabled={scheduledVisits['Nov 2026'].rescheduled}
                              onClick={() => {
                                setSelectedEMI('Nov 2026');
                                setPaymentAmount(5000);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                                showToast('Please select a new date and time above, then confirm.', 'info');
                              }}
                              style={{
                                padding: '4px 10px', fontSize: '0.75rem', fontWeight: '600', borderRadius: '4px', border: 'none',
                                background: scheduledVisits['Nov 2026'].rescheduled ? '#CBD5E1' : '#3B82F6',
                                color: 'white', cursor: scheduledVisits['Nov 2026'].rescheduled ? 'not-allowed' : 'pointer',
                                transition: 'background 0.2s'
                              }}
                            >
                              {scheduledVisits['Nov 2026'].rescheduled ? 'Rescheduled' : 'Reschedule'}
                            </button>
                          </div>
                        ) : (
                          <span style={{ color: '#94A3B8', fontSize: '0.85rem' }}>Not Scheduled</span>
                        )}
                      </td>
                      <td><span className="badge badge-warning">Pending</span></td>
                    </tr>
                    <tr>
                      <td style={{ padding: '16px 24px', color: '#64748B' }}>Dec 01, 2026</td>
                      <td style={{ color: '#64748B' }}>₹5,000</td>
                      <td style={{ color: '#64748B' }}>₹0</td>
                      <td>
                        {scheduledVisits['Dec 2026'] ? (
                          <div style={{ background: '#EFF6FF', padding: '8px 12px', borderRadius: '6px', border: '1px solid #BFDBFE', display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ fontSize: '0.85rem', color: '#1E3A8A', fontWeight: '600' }}>
                              {scheduledVisits['Dec 2026'].date} at {scheduledVisits['Dec 2026'].time}
                            </div>
                            <button
                              disabled={scheduledVisits['Dec 2026'].rescheduled}
                              onClick={() => {
                                setSelectedEMI('Dec 2026');
                                setPaymentAmount(5000);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                                showToast('Please select a new date and time above, then confirm.', 'info');
                              }}
                              style={{
                                padding: '4px 10px', fontSize: '0.75rem', fontWeight: '600', borderRadius: '4px', border: 'none',
                                background: scheduledVisits['Dec 2026'].rescheduled ? '#CBD5E1' : '#3B82F6',
                                color: 'white', cursor: scheduledVisits['Dec 2026'].rescheduled ? 'not-allowed' : 'pointer',
                                transition: 'background 0.2s'
                              }}
                            >
                              {scheduledVisits['Dec 2026'].rescheduled ? 'Rescheduled' : 'Reschedule'}
                            </button>
                          </div>
                        ) : (
                          <span style={{ color: '#94A3B8', fontSize: '0.85rem' }}>Not Scheduled</span>
                        )}
                      </td>
                      <td><span className="badge" style={{ background: '#F1F5F9', color: '#64748B' }}>Scheduled</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {customerTab === 'Receipts' && (
            <div className="card" style={{ padding: '40px', textAlign: 'center', color: '#64748B' }}>
              <div style={{ fontSize: '3rem', marginBottom: '15px' }}>🧾</div>
              <h3 style={{ color: '#0F172A', marginBottom: '10px' }}>Receipts</h3>
              <p>You have no recent receipts to display here.</p>
            </div>
          )}

          {customerTab === 'Notifications' && (
            <div className="card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #E2E8F0', background: '#F8FAFC' }}>
                <h3 style={{ margin: 0, color: '#0F172A', fontSize: '1.1rem' }}>Notifications</h3>
              </div>
              <div style={{ overflowY: 'auto', maxHeight: '400px' }}>
                <div style={{ padding: '20px 24px', background: '#FEF2F2', borderBottom: '1px solid #FEE2E2', display: 'flex', gap: '15px' }}>
                  <div style={{ fontSize: '1.5rem' }}>⚠️</div>
                  <div>
                    <h4 style={{ margin: '0 0 5px 0', color: '#991B1B', fontSize: '1rem' }}>Important Notice</h4>
                    <p style={{ margin: 0, color: '#B91C1C', fontSize: '0.9rem', lineHeight: '1.4' }}>If you face any difficulty or problems, please contact your branch directly for help.</p>
                  </div>
                </div>

                <div style={{ padding: '20px 24px', borderBottom: '1px solid #F1F5F9', display: 'flex', gap: '15px' }}>
                  <div style={{ fontSize: '1.5rem' }}>📅</div>
                  <div>
                    <h4 style={{ margin: '0 0 5px 0', color: '#0F172A', fontSize: '1rem' }}>Payment Reminder</h4>
                    <p style={{ margin: '0 0 8px 0', color: '#475569', fontSize: '0.9rem', lineHeight: '1.4' }}>Your next EMI of ₹5,000 is due on Nov 01, 2026.</p>
                    <span style={{ color: '#94A3B8', fontSize: '0.8rem' }}>Just now</span>
                  </div>
                </div>

                <div style={{ padding: '20px 24px', borderBottom: '1px solid #F1F5F9', display: 'flex', gap: '15px' }}>
                  <div style={{ fontSize: '1.5rem' }}>✅</div>
                  <div>
                    <h4 style={{ margin: '0 0 5px 0', color: '#0F172A', fontSize: '1rem' }}>Payment Cleared</h4>
                    <p style={{ margin: '0 0 8px 0', color: '#475569', fontSize: '0.9rem', lineHeight: '1.4' }}>Your payment of ₹5,000 was successfully processed.</p>
                    <span style={{ color: '#94A3B8', fontSize: '0.8rem' }}>2 days ago</span>
                  </div>
                </div>

                <div style={{ padding: '20px 24px', borderBottom: '1px solid #F1F5F9', display: 'flex', gap: '15px' }}>
                  <div style={{ fontSize: '1.5rem' }}>✅</div>
                  <div>
                    <h4 style={{ margin: '0 0 5px 0', color: '#0F172A', fontSize: '1rem' }}>Payment Cleared</h4>
                    <p style={{ margin: '0 0 8px 0', color: '#475569', fontSize: '0.9rem', lineHeight: '1.4' }}>Your payment of ₹5,000 was successfully processed.</p>
                    <span style={{ color: '#94A3B8', fontSize: '0.8rem' }}>1 month ago</span>
                  </div>
                </div>

                <div style={{ padding: '20px 24px', borderBottom: '1px solid #F1F5F9', display: 'flex', gap: '15px' }}>
                  <div style={{ fontSize: '1.5rem' }}>ℹ️</div>
                  <div>
                    <h4 style={{ margin: '0 0 5px 0', color: '#0F172A', fontSize: '1rem' }}>Profile Updated</h4>
                    <p style={{ margin: '0 0 8px 0', color: '#475569', fontSize: '0.9rem', lineHeight: '1.4' }}>Your contact preferences were successfully updated.</p>
                    <span style={{ color: '#94A3B8', fontSize: '0.8rem' }}>2 months ago</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className={`dashboard-welcome-header role-${user.role}`}>
        <div className="dashboard-user-info">
          <div style={{ width: '52px', height: '52px', flexShrink: 0, background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem', color: 'white', fontWeight: '700', boxShadow: '0 4px 10px rgba(245,158,11,0.3)' }}>
            {user.username ? user.username.substring(0, 2).toUpperCase() : 'AS'}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <h2 style={{ margin: '0 0 4px 0', fontSize: 'clamp(1rem, 3vw, 1.35rem)', color: '#0F172A', overflowWrap: 'anywhere', wordBreak: 'break-word' }}>Welcome back, {user.username || 'Akash Sharma'}!</h2>
            <p className="dashboard-subtext" style={{ color: '#64748B', margin: 0, fontSize: 'clamp(0.82rem, 2.5vw, 0.95rem)' }}>{user.role === 'customer' ? 'Here is your latest financial summary and active loan status.' : 'Here is your operational overview and pending tasks for today.'}</p>
          </div>
        </div>
        <div className="dashboard-actions">
          <div style={{ background: '#F8FAFC', color: '#475569', padding: '8px 14px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '600', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}>
            <span style={{ fontSize: '1rem' }}>📅</span> {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </div>
          {['customer', 'agent'].includes(user.role) && (
            <button
              disabled={hasRequestedUpgrade}
              onClick={() => {
                if (!hasRequestedUpgrade) {
                  if (user.role === 'agent') {
                    setUpgradeForm(prev => ({ ...prev, requestedRole: 'admin' }));
                  }
                  setShowUpgradeModal(true);
                }
              }}
              style={{
                background: hasRequestedUpgrade ? '#F1F5F9' : '#3B82F6',
                color: hasRequestedUpgrade ? '#64748B' : 'white',
                padding: '10px 20px', borderRadius: '10px', border: hasRequestedUpgrade ? '1px solid #CBD5E1' : 'none', fontWeight: '600',
                cursor: hasRequestedUpgrade ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', gap: '8px',
                boxShadow: hasRequestedUpgrade ? 'none' : '0 4px 10px rgba(59,130,246,0.2)',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => { if (!hasRequestedUpgrade) e.target.style.background = '#2563EB'; }}
              onMouseOut={(e) => { if (!hasRequestedUpgrade) e.target.style.background = '#3B82F6'; }}
            >
              {hasRequestedUpgrade ? (
                <><span>⏳</span> Upgrade Requested</>
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                  </svg> Upgrade Role
                </>
              )}
            </button>
          )}
          {/* Record collection is strictly for field agents in the field */}
        </div>
      </div>

      {user.role === 'super_admin' && renderSuperAdminDashboard()}
      {user.role === 'admin' && renderAdminDashboard()}
      {user.role === 'agent' && renderAgentDashboard()}
      {user.role === 'customer' && renderCustomerDashboard()}

      {!['super_admin', 'admin', 'agent', 'customer'].includes(user.role) && renderCustomerDashboard()}

      {/* Slip Preview Modal (For Agent Receipts and Admin Bank Deposits) */}
      {previewSlipModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15,23,42,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, backdropFilter: 'blur(3px)', padding: '16px' }}>
          <div className="card" style={{ width: '560px', maxWidth: '100%', maxHeight: '80vh', overflowY: 'auto', background: 'white', borderRadius: '14px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)', padding: '24px' }}>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', borderBottom: '1px solid #E2E8F0', paddingBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.4rem' }}>{previewSlipModal.type === 'receipt' ? '📄' : '🏦'}</span>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#0F172A', fontWeight: '700' }}>
                    {previewSlipModal.type === 'receipt' ? 'Agent Collection Receipt Slip' : 'Bank Cash Deposit Slip / Challan'}
                  </h3>
                  <span style={{ fontSize: '0.78rem', color: '#64748B' }}>
                    {previewSlipModal.type === 'receipt' ? 'Field Collection Document' : 'Bank Verified Deposit Record'}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setPreviewSlipModal(null)}
                style={{ background: '#F1F5F9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', fontSize: '1.1rem', color: '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                ✕
              </button>
            </div>

            {/* Exact Uploaded Photo Container */}
            {(() => {
              const isReceipt = previewSlipModal.type === 'receipt';
              const rawImg = isReceipt
                ? (previewSlipModal.data.receipt_image || (previewSlipModal.data.receipt_number ? `/media/receipts/rec_${String(previewSlipModal.data.id || '001').padStart(3, '0')}.jpg` : '/media/receipts/rec_001.jpg'))
                : (previewSlipModal.data.deposit_slip || previewSlipModal.data.slip_preview || '/media/deposits/dep_sbi_881023.jpg');

              const photoUrl = getSlipImageUrl(rawImg) || (isReceipt ? 'https://akash999.pythonanywhere.com/media/receipts/rec_001.jpg' : 'https://akash999.pythonanywhere.com/media/deposits/dep_sbi_881023.jpg');

              return (
                <div style={{ background: '#0F172A', borderRadius: '12px', padding: '16px', marginBottom: '18px', textAlign: 'center', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', padding: '0 4px' }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: '700', color: '#E2E8F0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      📸 Exact Photo Uploaded by {isReceipt ? (previewSlipModal.data.agent_name || 'Agent') : (previewSlipModal.data.branch_manager_name || 'Admin')}
                    </span>
                    <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>
                      Physical Camera Capture / Uploaded Document
                    </span>
                  </div>
                  <div style={{ background: '#020617', borderRadius: '8px', padding: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '260px' }}>
                    <img
                      src={photoUrl}
                      alt={isReceipt ? "Agent Uploaded Receipt Photo" : "Admin Bank Deposit Slip Photo"}
                      style={{
                        maxWidth: '100%',
                        maxHeight: '380px',
                        objectFit: 'contain',
                        borderRadius: '6px',
                        boxShadow: '0 4px 14px rgba(0,0,0,0.6)',
                        border: '1px solid #334155'
                      }}
                      onError={(e) => {
                        e.target.src = isReceipt ? 'https://akash999.pythonanywhere.com/media/receipts/rec_001.jpg' : 'https://akash999.pythonanywhere.com/media/deposits/dep_sbi_881023.jpg';
                      }}
                    />
                  </div>
                </div>
              );
            })()}

            {/* Slip Summary Details Table with Easy Vocab Status */}
            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '14px 16px', marginBottom: '18px', fontSize: '0.85rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
                <div><span style={{ color: '#64748B' }}>Slip / Receipt #:</span> <strong style={{ color: '#0F172A', marginLeft: '6px' }}>{previewSlipModal.data.receipt_number || previewSlipModal.data.reference_number}</strong></div>
                <div><span style={{ color: '#64748B' }}>Amount:</span> <strong style={{ color: '#059669', marginLeft: '6px' }}>₹{Number(previewSlipModal.data.amount_collected || previewSlipModal.data.amount).toLocaleString()}</strong></div>
                <div><span style={{ color: '#64748B' }}>Submitted By:</span> <strong style={{ color: '#0F172A', marginLeft: '6px' }}>{previewSlipModal.data.agent_name || previewSlipModal.data.branch_manager_name || 'Authorized Staff'}</strong></div>
                <div><span style={{ color: '#64748B' }}>Date:</span> <strong style={{ color: '#0F172A', marginLeft: '6px' }}>{previewSlipModal.data.collected_at ? new Date(previewSlipModal.data.collected_at).toLocaleString() : (previewSlipModal.data.deposited_at ? new Date(previewSlipModal.data.deposited_at).toLocaleString() : 'Today')}</strong></div>
                <div>
                  <span style={{ color: '#64748B' }}>Status:</span>
                  <span style={{ marginLeft: '6px' }}>
                    {(() => {
                      const badge = getEasyStatusBadge(previewSlipModal.data.status);
                      return (
                        <span style={{
                          padding: '3px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '700',
                          background: badge.bg, color: badge.color, border: `1px solid ${badge.border}`,
                          display: 'inline-flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap'
                        }}>
                          {badge.icon && badge.icon} <span>{badge.label}</span>
                        </span>
                      );
                    })()}
                  </span>
                </div>
                {previewSlipModal.data.customer_name && (
                  <div><span style={{ color: '#64748B' }}>Borrower:</span> <strong style={{ color: '#0F172A', marginLeft: '6px' }}>{previewSlipModal.data.customer_name}</strong></div>
                )}
                {previewSlipModal.data.bank_name && (
                  <div><span style={{ color: '#64748B' }}>Bank:</span> <strong style={{ color: '#0F172A', marginLeft: '6px' }}>{previewSlipModal.data.bank_name}</strong></div>
                )}
              </div>
              {/* Bank Deposit Shortfall Reason (If Bank Deposit) */}
              {previewSlipModal.data.notes && (
                <div style={{ marginTop: '12px', padding: '10px 14px', background: '#FFFBEB', borderRadius: '8px', border: '1px solid #FDE68A', color: '#92400E', fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                    <span>⚠️</span>
                    <strong>Bank Deposit Shortfall Reason:</strong>
                  </div>
                  <div style={{ background: '#FFFFFF', padding: '8px 10px', borderRadius: '6px', border: '1px solid #FDE68A', color: '#78350F', marginTop: '4px' }}>
                    "{previewSlipModal.data.notes}"
                  </div>
                </div>
              )}

              {/* Agent Mismatch Reason (If Amount is Mismatched / Discrepancy) */}
              {(previewSlipModal.data.status === 'discrepancy' || previewSlipModal.data.discrepancy_reason || previewSlipModal.data.remarks || Number(previewSlipModal.data.discrepancy_amount) > 0) && (
                <div style={{
                  marginTop: '14px',
                  padding: '14px 16px',
                  background: '#FEF2F2',
                  border: '1.5px solid #FCA5A5',
                  borderRadius: '10px',
                  boxShadow: '0 2px 6px rgba(239, 68, 68, 0.08)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <span style={{ fontSize: '1.25rem' }}>⚠️</span>
                      <div>
                        <strong style={{ fontSize: '0.9rem', color: '#991B1B', display: 'block', fontWeight: '700' }}>
                          Reason for Amount Mismatch (Entered by Agent)
                        </strong>
                      </div>
                    </div>
                    {Number(previewSlipModal.data.discrepancy_amount) > 0 && (
                      <span style={{ background: '#FEE2E2', color: '#DC2626', border: '1px solid #FECACA', padding: '3px 10px', borderRadius: '6px', fontSize: '0.76rem', fontWeight: '700' }}>
                        ₹{Number(previewSlipModal.data.discrepancy_amount).toLocaleString()} Mismatch
                      </span>
                    )}
                  </div>

                  <div style={{
                    background: '#FFFFFF',
                    padding: '12px 14px',
                    borderRadius: '8px',
                    border: '1px solid #FECACA',
                    color: '#7F1D1D',
                    fontSize: '0.88rem',
                    lineHeight: '1.5',
                    fontStyle: 'italic',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word'
                  }}>
                    "{previewSlipModal.data.discrepancy_reason || previewSlipModal.data.remarks || 'Physical cash collected differs from scheduled EMI. Reason flagged by field agent.'}"
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', fontSize: '0.78rem', color: '#991B1B', flexWrap: 'wrap', gap: '6px' }}>
                    <span>Submitted by Agent: <strong>{previewSlipModal.data.agent_name || previewSlipModal.data.agent || 'Field Agent'}</strong></span>
                    <span style={{ background: '#FEE2E2', color: '#991B1B', padding: '2px 8px', borderRadius: '4px', fontWeight: '600' }}>
                      Audited by Branch Admin
                    </span>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => setPreviewSlipModal(null)}
              style={{
                width: '100%', padding: '11px', borderRadius: '8px', background: '#3B82F6', color: 'white',
                border: 'none', fontWeight: '600', fontSize: '0.9rem', cursor: 'pointer', transition: 'background 0.2s'
              }}
              onMouseOver={(e) => e.target.style.background = '#2563EB'}
              onMouseOut={(e) => e.target.style.background = '#3B82F6'}
            >
              Close Slip
            </button>
          </div>
        </div>
      )}

      {showUpgradeModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15,23,42,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(2px)' }}>
          <div className="card" style={{ width: '380px', background: 'white', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)', padding: '24px' }}>

            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ margin: '0 0 5px 0', fontSize: '1.2rem', color: '#0F172A', fontWeight: '600' }}>Request Role Upgrade</h3>
              <p style={{ margin: 0, color: '#64748B', fontSize: '0.85rem' }}>Submit a request to the Super Admin.</p>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.8rem', fontWeight: '600', color: '#475569' }}>Requested Role <span style={{ color: '#EF4444' }}>*</span></label>
              <div style={{ display: 'flex', gap: '10px' }}>
                {user.role !== 'agent' && (
                  <label style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', border: upgradeForm.requestedRole === 'agent' ? '2px solid #3B82F6' : '1px solid #E2E8F0', padding: '6px 10px', borderRadius: '6px', background: upgradeForm.requestedRole === 'agent' ? '#EFF6FF' : 'white', transition: 'all 0.2s' }}>
                    <input type="radio" name="role" value="agent" checked={upgradeForm.requestedRole === 'agent'} onChange={(e) => setUpgradeForm({ ...upgradeForm, requestedRole: e.target.value })} style={{ accentColor: '#3B82F6', width: '12px', height: '12px', margin: 0 }} />
                    <span style={{ fontSize: '0.8rem', fontWeight: '500', color: '#0F172A' }}>Agent</span>
                  </label>
                )}
                <label style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', border: upgradeForm.requestedRole === 'admin' ? '2px solid #3B82F6' : '1px solid #E2E8F0', padding: '6px 10px', borderRadius: '6px', background: upgradeForm.requestedRole === 'admin' ? '#EFF6FF' : 'white', transition: 'all 0.2s' }}>
                  <input type="radio" name="role" value="admin" checked={upgradeForm.requestedRole === 'admin'} onChange={(e) => setUpgradeForm({ ...upgradeForm, requestedRole: e.target.value })} style={{ accentColor: '#3B82F6', width: '12px', height: '12px', margin: 0 }} />
                  <span style={{ fontSize: '0.8rem', fontWeight: '500', color: '#0F172A' }}>Admin</span>
                </label>
              </div>
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem', fontWeight: '600', color: '#475569' }}>Support ID Document (PDF/Image) <span style={{ color: '#EF4444' }}>*</span></label>
              <div style={{ border: '1.5px dashed #CBD5E1', borderRadius: '8px', padding: '15px', textAlign: 'center', background: '#F8FAFC', cursor: 'pointer', transition: 'border-color 0.2s' }} onMouseOver={(e) => e.currentTarget.style.borderColor = '#3B82F6'} onMouseOut={(e) => e.currentTarget.style.borderColor = '#CBD5E1'}>
                <input type="file" onChange={(e) => setUpgradeForm({ ...upgradeForm, file: e.target.files[0] })} style={{ width: '100%', fontSize: '0.85rem', color: '#475569', cursor: 'pointer' }} accept=".pdf,image/*" />
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem', fontWeight: '600', color: '#475569' }}>Additional Details (Optional)</label>
              <textarea
                value={upgradeForm.reason}
                onChange={(e) => setUpgradeForm({ ...upgradeForm, reason: e.target.value })}
                placeholder="Why do you need this role?"
                style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #E2E8F0', minHeight: '80px', color: '#0F172A', boxSizing: 'border-box', outline: 'none', resize: 'vertical' }}
              />
            </div>

            <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', padding: '12px', borderRadius: '8px', marginBottom: '24px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <span style={{ color: '#EF4444', fontSize: '1.2rem', marginTop: '-2px' }}>⚠️</span>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#991B1B', lineHeight: '1.5' }}>
                <strong style={{ display: 'block', marginBottom: '2px' }}>Account Warning</strong>
                Submitting invalid or multiple spam requests may result in your account being permanently blocked by the administration.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', borderTop: '1px solid #E2E8F0', paddingTop: '20px' }}>
              <button onClick={() => setShowUpgradeModal(false)} style={{ padding: '10px 20px', background: 'transparent', border: '1px solid #CBD5E1', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', color: '#475569', transition: 'all 0.2s' }} onMouseOver={(e) => { e.target.style.background = '#F1F5F9'; e.target.style.borderColor = '#94A3B8' }} onMouseOut={(e) => { e.target.style.background = 'transparent'; e.target.style.borderColor = '#CBD5E1' }}>Cancel</button>
              <button
                onClick={() => {
                  if (!upgradeForm.file) {
                    showToast("You must upload a Support ID Document to request a role upgrade.", "error");
                    return;
                  }
                  showToast("Upgrade request submitted successfully to Super Admin!", "success");
                  setShowUpgradeModal(false);
                  setHasRequestedUpgrade(true);
                  localStorage.setItem('upgradeRequested', 'true');
                  setUpgradeForm({ requestedRole: 'agent', reason: '', file: null });
                }}
                style={{ padding: '10px 24px', background: '#3B82F6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.3)', transition: 'background 0.2s' }}
                onMouseOver={(e) => e.target.style.background = '#2563EB'}
                onMouseOut={(e) => e.target.style.background = '#3B82F6'}
              >
                Submit Request
              </button>
            </div>
          </div>
        </div>
      )}

      {toast.show && (
        <div style={{
          position: 'fixed', bottom: '30px', right: '30px', zIndex: 9999,
          background: toast.type === 'error' ? '#EF4444' : toast.type === 'success' ? '#10B981' : '#3B82F6',
          color: 'white', padding: '12px 20px', borderRadius: '8px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
          fontSize: '0.95rem', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '10px',
          animation: 'slideIn 0.3s ease-out', transition: 'all 0.3s'
        }}>
          <span style={{ fontSize: '1.2rem' }}>{toast.type === 'error' ? '⚠️' : toast.type === 'success' ? '✅' : 'ℹ️'}</span>
          {toast.message}
        </div>
      )}

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>

    </div>
  );
}

export default Dashboard;
