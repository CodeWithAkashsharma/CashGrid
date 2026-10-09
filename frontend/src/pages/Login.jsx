import React, { useState } from 'react';

function Login({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [regName, setRegName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [regError, setRegError] = useState('');
  const [successNotice, setSuccessNotice] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [containerHeight, setContainerHeight] = useState(null);
  const [hasFlipped, setHasFlipped] = useState(false);
  const frontRef = React.useRef(null);
  const backRef = React.useRef(null);

  const toggleForm = (toLogin) => {
    setLoginError('');
    setRegError('');
    setHasFlipped(true);
    const currentEl = isLogin ? frontRef.current : backRef.current;
    const targetEl = toLogin ? frontRef.current : backRef.current;

    if (currentEl && targetEl) {
      const currentH = currentEl.offsetHeight;
      const targetH = targetEl.offsetHeight;

      setContainerHeight(`${currentH}px`);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsLogin(toLogin);
          setContainerHeight(`${targetH}px`);
        });
      });
    } else {
      setIsLogin(toLogin);
    }
  };

  React.useEffect(() => {
    const handleResize = () => {
      if (hasFlipped) {
        const activeEl = isLogin ? frontRef.current : backRef.current;
        if (activeEl) {
          setContainerHeight(`${activeEl.offsetHeight}px`);
        }
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [hasFlipped, isLogin]);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');
    setIsLoading(true);
    try {
      const response = await fetch('https://akash999.pythonanywhere.com/api/auth/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, rememberMe }),
      });
      const data = await response.json();
      if (response.ok) {
        onLogin(data.access, rememberMe);
      } else {
        setLoginError(data.detail || data.error || 'Invalid credentials. Please verify your email/phone and password.');
      }
    } catch (error) {
      console.error('Error logging in:', error);
      setLoginError('Unable to connect to the authentication service. Please check your network.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setRegError('');
    if (regPassword !== regConfirmPassword) {
      setRegError("Passwords do not match! Please check and re-enter.");
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch('https://akash999.pythonanywhere.com/api/auth/register/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: regName, username: regUsername, password: regPassword }),
      });
      const data = await response.json();
      if (response.ok) {
        setSuccessNotice('Account created successfully! Please sign in with your credentials.');
        setLoginError('');
        toggleForm(true);
      } else {
        setRegError(data.error || data.detail || 'Registration failed. Username may already exist.');
      }
    } catch (error) {
      console.error('Error registering:', error);
      setRegError('Unable to connect to registration service. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column',
      minHeight: '100vh', 
      width: '100%',
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #064e3b 100%)',
      position: 'relative',
      overflowX: 'hidden',
      overflowY: 'auto',
      padding: '40px 0',
      boxSizing: 'border-box'
    }}>
      <style>
        {`
          @keyframes float1 {
            0% { transform: translateY(0px) scale(1); }
            50% { transform: translateY(-20px) scale(1.05); }
            100% { transform: translateY(0px) scale(1); }
          }
          @keyframes float2 {
            0% { transform: translateY(0px) scale(1) translateX(0px); }
            50% { transform: translateY(20px) scale(0.95) translateX(-20px); }
            100% { transform: translateY(0px) scale(1) translateX(0px); }
          }
          .input-field { transition: all 0.3s ease; }
          .input-field:focus {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
            border-color: #10B981 !important;
          }
          .flip-container {
            perspective: 1000px;
            width: 100%;
            max-width: 400px;
            z-index: 10;
          }
          .flipper {
            position: relative;
            width: 100%;
            height: 100%;
            transition: transform 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55);
            transform-style: preserve-3d;
          }
          .flipper.flipped {
            transform: rotateY(180deg);
          }
          .front, .back {
            position: absolute;
            width: 100%;
            backface-visibility: hidden;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            padding: 32px 36px;
            border-radius: 20px;
            box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.4);
            border: 1px solid rgba(255,255,255,0.2);
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(20px);
            box-sizing: border-box;
          }
          .back {
            transform: rotateY(180deg);
          }
          .toggle-link {
            color: #2563eb;
            cursor: pointer;
            font-weight: 700;
            text-decoration: none;
            transition: color 0.2s;
          }
          .toggle-link:hover { color: #10B981; }
          
          /* Layout styling for split view */
          .login-wrapper {
            display: flex;
            width: 100%;
            max-width: 1200px;
            padding: 0 40px;
            align-items: center;
            justify-content: space-between;
            z-index: 10;
            box-sizing: border-box;
          }
          
          .hero-text {
            color: white;
            max-width: 500px;
          }
          
          .mobile-logo {
            display: none;
            align-items: center;
            justify-content: center;
            gap: 12px;
            margin-bottom: 24px;
            z-index: 20;
          }

          @media (max-width: 900px) {
            .login-wrapper {
              flex-direction: column;
              justify-content: center;
              padding: 0 24px;
            }
            .hero-text {
              display: none;
            }
            .mobile-logo {
              display: flex;
            }
            .flip-container {
              margin-top: 0px;
            }
          }
          
          /* Form Sizing for Small Screens */
          @media (max-width: 480px) {
            .login-wrapper {
              padding: 0 24px;
            }
            .mobile-logo {
              margin-bottom: 16px;
            }
            .mobile-logo img {
              width: 32px !important;
            }
            .mobile-logo h1 {
              font-size: 1.25rem !important;
            }
            .front, .back {
              padding: 24px 20px;
            }
            .flip-container {
              margin-top: 36px;
            }
            .form-title {
              font-size: 1.5rem !important;
              margin-bottom: 4px !important;
            }
            .form-subtitle {
              font-size: 0.85rem !important;
            }
            .form-header-box {
              margin-bottom: 40px !important;
              margin-top: 0 !important;
            }
            .form-group {
              margin-bottom: 14px !important;
            }
            .form-group label {
              font-size: 0.8rem !important;
              margin-bottom: 4px !important;
            }
            .input-field {
              padding: 10px 12px !important;
              font-size: 0.9rem !important;
            }
            .submit-btn {
              padding: 12px !important;
              font-size: 0.95rem !important;
            }
            .checkbox-group {
              margin-bottom: 28px !important;
            }
            .bottom-text {
              font-size: 0.8rem !important;
              margin-bottom: 12px !important;
            }
            .bottom-security {
              font-size: 0.7rem !important;
            }
          }
          
          @media (max-width: 350px) {
            .front, .back {
              padding: 20px 16px;
            }
            .form-group {
              margin-bottom: 12px !important;
            }
            .form-header-box {
              margin-bottom: 16px !important;
            }
            .bottom-text {
              font-size: 0.75rem !important;
            }
          }
        `}
      </style>

      {/* Interactive Background Elements */}
      <div style={{ position: 'absolute', top: '10%', left: '15%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(16, 185, 129, 0.4) 0%, transparent 70%)', borderRadius: '50%', filter: 'blur(40px)', animation: 'float1 8s ease-in-out infinite' }}></div>
      <div style={{ position: 'absolute', bottom: '10%', right: '15%', width: '350px', height: '350px', background: 'radial-gradient(circle, rgba(59, 130, 246, 0.4) 0%, transparent 70%)', borderRadius: '50%', filter: 'blur(40px)', animation: 'float2 10s ease-in-out infinite' }}></div>

      {/* Mobile Logo (only visible <900px) */}
      <div className="mobile-logo">
        <img src="/logo.png" alt="Logo" style={{ width: '40px', height: 'auto', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }} />
        <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '800', letterSpacing: '-0.5px' }}>
          <span style={{ color: 'white' }}>Cash</span><span style={{ color: '#10B981' }}>Grid</span>
        </h1>
      </div>

      <div className="login-wrapper">
        
        {/* Left Side: Engaging Heading outside the form */}
        <div className="hero-text">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
            <img src="/logo.png" alt="Logo" style={{ width: '60px', height: 'auto', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.3))' }} />
            <h1 style={{ margin: 0, fontSize: '2.5rem', fontWeight: '800', letterSpacing: '-1px' }}>
              <span style={{ color: 'white' }}>Cash</span><span style={{ color: '#10B981' }}>Grid</span>
            </h1>
          </div>
          <h2 style={{ fontSize: '3.5rem', fontWeight: '800', lineHeight: '1.1', marginBottom: '24px', letterSpacing: '-1px', background: 'linear-gradient(135deg, #ffffff 0%, #a7f3d0 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Next-Gen Cash <br/> Recovery & Management.
          </h2>
          <p style={{ fontSize: '1.15rem', color: '#cbd5e1', lineHeight: '1.6', fontWeight: '400', marginBottom: '40px' }}>
            Empowering field agents, branch admins, and customers with a unified platform to track, collect, and recognise loan cash flows securely.
          </p>
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981', fontWeight: '600' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              Fast Setup
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981', fontWeight: '600' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              Secure
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981', fontWeight: '600' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              Real-time
            </div>
          </div>
        </div>

        {/* Right Side: The Flip Form */}
        {/* Right Side: The Flip Form */}
        <div 
          className="flip-container" 
          style={{ 
            height: hasFlipped && containerHeight ? containerHeight : 'auto',
            transition: hasFlipped ? 'height 0.6s cubic-bezier(0.4, 0, 0.2, 1)' : 'none'
          }}
        >
          <div className={`flipper ${!isLogin ? 'flipped' : ''}`}>
            
            {/* LOGIN SIDE */}
            <div 
              className="front" 
              ref={frontRef}
              style={{
                position: hasFlipped ? 'absolute' : 'relative',
                top: 0,
                left: 0
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div className="form-header-box" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '32px', marginTop: '4px' }}>
                  <h2 className="form-title" style={{ textAlign: 'center', margin: '0 0 6px 0', fontSize: '1.6rem', fontWeight: '800', color: '#0F172A' }}>
                    Welcome back!
                  </h2>
                  <p className="form-subtitle" style={{ textAlign: 'center', color: '#475569', margin: 0, fontSize: '0.9rem', fontWeight: '500' }}>Manage your loan cash flows securely</p>
                </div>
                
                <form onSubmit={handleLoginSubmit}>
                  {loginError && (
                    <div style={{
                      background: '#FEF2F2',
                      border: '1.5px solid #FCA5A5',
                      color: '#991B1B',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      marginBottom: '16px',
                      fontSize: '0.85rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px'
                    }}>
                      <span style={{ fontSize: '1.2rem', color: '#EF4444', flexShrink: 0 }}>⚠️</span>
                      <span style={{ fontWeight: '600', lineHeight: '1.3' }}>{loginError}</span>
                    </div>
                  )}

                  {successNotice && (
                    <div style={{
                      background: '#ECFDF5',
                      border: '1.5px solid #6EE7B7',
                      color: '#065F46',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      marginBottom: '16px',
                      fontSize: '0.85rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px'
                    }}>
                      <span style={{ fontSize: '1.2rem', color: '#10B981', flexShrink: 0 }}>✓</span>
                      <span style={{ fontWeight: '600', lineHeight: '1.3' }}>{successNotice}</span>
                    </div>
                  )}

                  <div className="form-group" style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '6px', color: '#1E293B', fontSize: '0.85rem', fontWeight: '700' }}>Email or Phone</label>
                    <input className="input-field" value={username} onChange={e => { setUsername(e.target.value); setLoginError(''); setSuccessNotice(''); }} required placeholder="e.g. user@example.com" style={{ padding: '12px 14px', width: '100%', borderRadius: '10px', border: '2px solid #E2E8F0', fontSize: '0.95rem', backgroundColor: '#F8FAFC', boxSizing: 'border-box', outline: 'none' }} />
                  </div>
                  <div className="form-group" style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '6px', color: '#1E293B', fontSize: '0.85rem', fontWeight: '700' }}>Password</label>
                    <input className="input-field" type="password" value={password} onChange={e => { setPassword(e.target.value); setLoginError(''); }} required placeholder="••••••••" style={{ padding: '12px 14px', width: '100%', borderRadius: '10px', border: '2px solid #E2E8F0', fontSize: '0.95rem', backgroundColor: '#F8FAFC', boxSizing: 'border-box', outline: 'none' }} />
                  </div>
                  
                  <div className="checkbox-group" style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
                    <input type="checkbox" id="remember" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)} style={{ width: '16px', height: '16px', marginRight: '8px', cursor: 'pointer', accentColor: '#10B981' }} />
                    <label htmlFor="remember" style={{ fontSize: '0.85rem', color: '#475569', cursor: 'pointer', fontWeight: '500' }}>Remember me for 30 days</label>
                  </div>

                  <button className="submit-btn" type="submit" disabled={isLoading} style={{ width: '100%', padding: '14px', fontSize: '1rem', fontWeight: '700', borderRadius: '10px', color: 'white', border: 'none', background: 'linear-gradient(135deg, #2563EB 0%, #10B981 100%)', boxShadow: '0 8px 15px -3px rgba(16, 185, 129, 0.3)', cursor: isLoading ? 'not-allowed' : 'pointer', transition: 'transform 0.2s' }}>
                    {isLoading ? 'Authenticating...' : 'Log In'}
                  </button>
                </form>
                
                <div style={{ marginTop: '24px' }}>
                  <div className="bottom-text" style={{ textAlign: 'center', fontSize: '0.95rem', color: '#475569', marginBottom: '20px' }}>
                    New to CashGrid? <span className="toggle-link" onClick={() => toggleForm(false)}>Create an account</span>
                  </div>
                  <div className="bottom-security" style={{ textAlign: 'center', fontSize: '0.8rem', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: '600' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                    Enterprise-Grade Security
                  </div>
                </div>
              </div>
            </div>

            {/* REGISTER SIDE */}
            <div 
              className="back" 
              ref={backRef}
              style={{
                position: 'absolute',
                top: 0,
                left: 0
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div className="form-header-box" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '20px', marginTop: '4px' }}>
                  <h2 className="form-title" style={{ textAlign: 'center', margin: '0 0 6px 0', fontSize: '1.6rem', fontWeight: '800', color: '#0F172A' }}>
                    Join <span style={{ color: '#0F172A' }}>Cash</span><span style={{ color: '#10B981' }}>Grid</span>
                  </h2>
                  <p className="form-subtitle" style={{ textAlign: 'center', color: '#475569', margin: 0, fontSize: '0.9rem', fontWeight: '500' }}>Get started with your account</p>
                </div>
                
                <form onSubmit={handleRegisterSubmit}>
                  {regError && (
                    <div style={{
                      background: '#FEF2F2',
                      border: '1.5px solid #FCA5A5',
                      color: '#991B1B',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      marginBottom: '14px',
                      fontSize: '0.85rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px'
                    }}>
                      <span style={{ fontSize: '1.2rem', color: '#EF4444', flexShrink: 0 }}>⚠️</span>
                      <span style={{ fontWeight: '600', lineHeight: '1.3' }}>{regError}</span>
                    </div>
                  )}

                  <div className="form-group" style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', marginBottom: '4px', color: '#1E293B', fontSize: '0.8rem', fontWeight: '700' }}>Full Name</label>
                    <input className="input-field" value={regName} onChange={e => { setRegName(e.target.value); setRegError(''); }} required placeholder="e.g. John Doe" style={{ padding: '10px 12px', width: '100%', borderRadius: '8px', border: '2px solid #E2E8F0', fontSize: '0.9rem', backgroundColor: '#F8FAFC', boxSizing: 'border-box', outline: 'none' }} />
                  </div>
                  <div className="form-group" style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', marginBottom: '4px', color: '#1E293B', fontSize: '0.8rem', fontWeight: '700' }}>Email or Phone</label>
                    <input className="input-field" value={regUsername} onChange={e => { setRegUsername(e.target.value); setRegError(''); }} required placeholder="e.g. user@example.com" style={{ padding: '10px 12px', width: '100%', borderRadius: '8px', border: '2px solid #E2E8F0', fontSize: '0.9rem', backgroundColor: '#F8FAFC', boxSizing: 'border-box', outline: 'none' }} />
                  </div>
                  <div className="form-group" style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', marginBottom: '4px', color: '#1E293B', fontSize: '0.8rem', fontWeight: '700' }}>Password</label>
                    <input className="input-field" type="password" value={regPassword} onChange={e => { setRegPassword(e.target.value); setRegError(''); }} required placeholder="••••••••" style={{ padding: '10px 12px', width: '100%', borderRadius: '8px', border: '2px solid #E2E8F0', fontSize: '0.9rem', backgroundColor: '#F8FAFC', boxSizing: 'border-box', outline: 'none' }} />
                  </div>
                  <div className="form-group" style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '4px', color: '#1E293B', fontSize: '0.8rem', fontWeight: '700' }}>Confirm Password</label>
                    <input className="input-field" type="password" value={regConfirmPassword} onChange={e => { setRegConfirmPassword(e.target.value); setRegError(''); }} required placeholder="••••••••" style={{ padding: '10px 12px', width: '100%', borderRadius: '8px', border: '2px solid #E2E8F0', fontSize: '0.9rem', backgroundColor: '#F8FAFC', boxSizing: 'border-box', outline: 'none' }} />
                  </div>
                  
                  <button className="submit-btn" type="submit" disabled={isLoading} style={{ width: '100%', padding: '12px', fontSize: '0.95rem', fontWeight: '700', borderRadius: '8px', color: 'white', border: 'none', background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', boxShadow: '0 8px 15px -3px rgba(16, 185, 129, 0.3)', cursor: isLoading ? 'not-allowed' : 'pointer', transition: 'transform 0.2s' }}>
                    {isLoading ? 'Creating Account...' : 'Register Account'}
                  </button>
                </form>
                
                <div style={{ textAlign: 'center', paddingBottom: '10px', marginTop: '24px' }}>
                  <div className="bottom-text" style={{ fontSize: '0.95rem', color: '#475569' }}>
                    Already have an account? <span className="toggle-link" onClick={() => toggleForm(true)}>Log in</span>
                  </div>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
