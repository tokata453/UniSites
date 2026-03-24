import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '@/api';
import { useAuthStore } from '@/store/authStore';

// ── Icons ─────────────────────────────────────────────────────────────────────
const GOOGLE_ICON = (
  <svg width="18" height="18" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

const FACEBOOK_ICON = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

// ── Shared UI ─────────────────────────────────────────────────────────────────
const EyeIcon = ({ open }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    {open
      ? <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>
      : <><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></>
    }
  </svg>
);

const FloatInput = ({ label, type='text', value, onChange, error, autoComplete }) => {
  const [focused,  setFocused]  = useState(false);
  const [showPass, setShowPass] = useState(false);
  const raised    = focused || value.length > 0;
  const isPassword = type === 'password';
  const inputType  = isPassword ? (showPass ? 'text' : 'password') : type;

  return (
    <div style={{ position:'relative' }}>
      <label style={{
        position:'absolute', left:'14px',
        top: raised ? '7px' : '50%',
        transform: raised ? 'none' : 'translateY(-50%)',
        fontSize: raised ? '10px' : '13px',
        color: focused ? '#1B3A6B' : '#94a3b8',
        fontWeight: raised ? 700 : 400,
        letterSpacing: raised ? '0.06em' : '0',
        textTransform: raised ? 'uppercase' : 'none',
        transition:'all 0.18s ease',
        pointerEvents:'none', zIndex:1,
        fontFamily:"'DM Sans',sans-serif",
      }}>
        {label}
      </label>
      <input
        type={inputType} value={value} autoComplete={autoComplete}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width:'100%',
          paddingTop: raised ? '22px' : '14px',
          paddingBottom: raised ? '8px' : '14px',
          paddingLeft:'14px',
          paddingRight: isPassword ? '42px' : '14px',
          background: focused ? '#f8faff' : '#f8fafc',
          border:`1.5px solid ${error ? '#ef4444' : focused ? '#1B3A6B' : '#e2e8f0'}`,
          borderRadius:'12px',
          color:'#1e293b',
          fontSize:'14px', outline:'none',
          transition:'all 0.18s ease',
          fontFamily:"'DM Sans',sans-serif",
          boxSizing:'border-box', display:'block',
          boxShadow: focused ? '0 0 0 3px rgba(27,58,107,0.08)' : 'none',
        }}
        required
      />
      {isPassword && (
        <button
          type="button"
          onClick={() => setShowPass(p => !p)}
          style={{
            position:'absolute', right:'12px', top:'50%', transform:'translateY(-50%)',
            background:'none', border:'none', cursor:'pointer', padding:'4px',
            color: showPass ? '#1B3A6B' : '#94a3b8',
            display:'flex', alignItems:'center', justifyContent:'center',
            transition:'color 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.color='#1B3A6B'}
          onMouseLeave={e => e.currentTarget.style.color = showPass ? '#1B3A6B' : '#94a3b8'}
        >
          <EyeIcon open={showPass} />
        </button>
      )}
      {error && <p style={{ fontSize:'11px', color:'#ef4444', marginTop:'4px', paddingLeft:'4px', marginBottom:0 }}>{error}</p>}
    </div>
  );
};

const OAuthBtn = ({ icon, label, onClick }) => (
  <button onClick={onClick} type="button"
    style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'center', gap:'10px', padding:'11px 16px', background:'#fff', border:'1.5px solid #e2e8f0', borderRadius:'12px', color:'#475569', fontSize:'13px', fontWeight:600, cursor:'pointer', transition:'all 0.15s ease', fontFamily:"'DM Sans',sans-serif", boxShadow:'0 1px 3px rgba(0,0,0,0.06)' }}
    onMouseEnter={e => { e.currentTarget.style.background='#f8fafc'; e.currentTarget.style.borderColor='#cbd5e1'; e.currentTarget.style.boxShadow='0 2px 8px rgba(0,0,0,0.08)'; }}
    onMouseLeave={e => { e.currentTarget.style.background='#fff'; e.currentTarget.style.borderColor='#e2e8f0'; e.currentTarget.style.boxShadow='0 1px 3px rgba(0,0,0,0.06)'; }}
  >
    {icon}{label}
  </button>
);

const SubmitBtn = ({ label, loading }) => (
  <button type="submit" disabled={loading}
    style={{ width:'100%', padding:'13px', background: loading ? '#94a3b8' : '#1B3A6B', border:'none', borderRadius:'12px', color:'#fff', fontSize:'14px', fontWeight:700, cursor: loading ? 'not-allowed' : 'pointer', transition:'all 0.15s ease', letterSpacing:'0.02em', fontFamily:"'DM Sans',sans-serif", boxShadow: loading ? 'none' : '0 4px 16px rgba(27,58,107,0.3)', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px' }}
    onMouseEnter={e => { if (!loading) e.currentTarget.style.background='#15305a'; }}
    onMouseLeave={e => { if (!loading) e.currentTarget.style.background='#1B3A6B'; }}
  >
    {loading && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation:'spin 0.8s linear infinite' }}><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>}
    {label}
  </button>
);

const Divider = () => (
  <div style={{ display:'flex', alignItems:'center', gap:'12px', margin:'4px 0' }}>
    <div style={{ flex:1, height:'1px', background:'#e2e8f0' }} />
    <span style={{ fontSize:'11px', color:'#94a3b8', fontWeight:600, letterSpacing:'0.08em', textTransform:'uppercase' }}>or</span>
    <div style={{ flex:1, height:'1px', background:'#e2e8f0' }} />
  </div>
);

const ErrorAlert = ({ message }) => message ? (
  <div style={{ padding:'10px 14px', background:'#fef2f2', border:'1px solid #fecaca', borderRadius:'10px', color:'#dc2626', fontSize:'13px', display:'flex', alignItems:'center', gap:'8px' }}>
    ⚠️ {message}
  </div>
) : null;

const STYLES = `
  @keyframes spin   { to { transform: rotate(360deg); } }
  @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
`;

const PAGE_STYLE = {
  minHeight:'calc(100vh - 64px)',
  display:'flex', alignItems:'center', justifyContent:'center',
  padding:'24px', position:'relative', zIndex:10,
  fontFamily:"'DM Sans',sans-serif", background:'#f8fafc',
};

const CARD_STYLE = {
  background:'#fff',
  border:'1px solid #e2e8f0',
  borderRadius:'20px',
  padding:'32px',
  boxShadow:'0 4px 24px rgba(0,0,0,0.07)',
};

// ── LoginPage ─────────────────────────────────────────────────────────────────
export function LoginPage() {
  const setAuth    = useAuthStore(s => s.setAuth);
  const navigate   = useNavigate();
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [loading,  setLoading]  = useState(false);
  const [err,      setErr]      = useState('');

  const handleSubmit = async e => {
    e.preventDefault();
    setErr('');
    setLoading(true);
    try {
      const res = await authApi.login({ email, password });
      setAuth(res.data.user, res.data.token);
      navigate('/');
    } catch (e) {
      setErr(e.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{STYLES}</style>
      <div style={PAGE_STYLE}>
        <div style={{ width:'100%', maxWidth:'400px', animation:'fadeUp 0.4s ease-out both' }}>
          <div style={CARD_STYLE}>
            <div style={{ marginBottom:'24px' }}>
              <h1 style={{ fontSize:'22px', fontWeight:800, color:'#0f172a', margin:'0 0 4px', fontFamily:"'Syne',sans-serif" }}>Welcome back</h1>
              <p style={{ fontSize:'13px', color:'#64748b', margin:0 }}>Sign in to continue to your account</p>
            </div>

            <div style={{ display:'flex', flexDirection:'column', gap:'10px', marginBottom:'20px' }}>
              <OAuthBtn icon={GOOGLE_ICON}   label="Continue with Google"   onClick={() => window.location.href = authApi.googleAuthUrl()} />
              <OAuthBtn icon={FACEBOOK_ICON} label="Continue with Facebook" onClick={() => window.location.href = authApi.facebookAuthUrl()} />
            </div>

            <Divider />

            <form onSubmit={handleSubmit} style={{ marginTop:'20px', display:'flex', flexDirection:'column', gap:'12px' }}>
              <ErrorAlert message={err} />
              <FloatInput label="Email address" type="email"    value={email}    onChange={setEmail}    autoComplete="email" />
              <FloatInput label="Password"      type="password" value={password} onChange={setPassword} autoComplete="current-password" />
              <div style={{ paddingTop:'4px' }}><SubmitBtn label="Sign in" loading={loading} /></div>
            </form>
          </div>

          <p style={{ textAlign:'center', fontSize:'13px', color:'#64748b', marginTop:'16px' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color:'#1B3A6B', textDecoration:'none', fontWeight:700 }}>Sign up</Link>
          </p>
        </div>
      </div>
    </>
  );
}

// ── RegisterPage ──────────────────────────────────────────────────────────────
export function RegisterPage() {
  const setAuth    = useAuthStore(s => s.setAuth);
  const navigate   = useNavigate();
  const [name,     setName]     = useState('');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [role,     setRole]     = useState('student');
  const [loading,  setLoading]  = useState(false);
  const [err,      setErr]      = useState('');
  const [errors,   setErrors]   = useState({});

  const validate = () => {
    const e = {};
    if (!name.trim())         e.name     = 'Name is required';
    if (!email.includes('@')) e.email    = 'Enter a valid email';
    if (password.length < 8)  e.password = 'Minimum 8 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async ev => {
    ev.preventDefault();
    setErr('');
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await authApi.register({ name, email, password, role });
      setAuth(res.data.user, res.data.token);
      navigate('/');
    } catch (e) {
      setErr(e.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const strength = password.length >= 12 ? 4 : password.length >= 10 ? 3 : password.length >= 8 ? 2 : password.length > 0 ? 1 : 0;
  const strengthColors = ['','#ef4444','#f97316','#eab308','#22c55e'];
  const strengthLabels = ['','Too short','Weak','Good','Strong'];

  return (
    <>
      <style>{STYLES}</style>
      <div style={PAGE_STYLE}>
        <div style={{ width:'100%', maxWidth:'420px', animation:'fadeUp 0.4s ease-out both' }}>

          <div style={CARD_STYLE}>
            <div style={{ marginBottom:'20px' }}>
              <h1 style={{ fontSize:'22px', fontWeight:800, color:'#0f172a', margin:'0 0 4px', fontFamily:"'Syne',sans-serif" }}>Create account</h1>
              <p style={{ fontSize:'13px', color:'#64748b', margin:0 }}>Start your university discovery journey</p>
            </div>

            <div style={{ display:'flex', flexDirection:'column', gap:'10px', marginBottom:'20px' }}>
              <OAuthBtn icon={GOOGLE_ICON}   label="Sign up with Google"   onClick={() => window.location.href = authApi.googleAuthUrl()} />
              <OAuthBtn icon={FACEBOOK_ICON} label="Sign up with Facebook" onClick={() => window.location.href = authApi.facebookAuthUrl()} />
            </div>

            <Divider />

            <form onSubmit={handleSubmit} style={{ marginTop:'20px', display:'flex', flexDirection:'column', gap:'12px' }}>
              <ErrorAlert message={err} />
              <div>
                <p style={{ fontSize:'11px', color:'#64748b', fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', margin:'0 0 8px' }}>Account Type</p>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px' }}>
                  {[
                    { value: 'student', label: 'Student', desc: 'Browse universities, save items, and follow the feed.' },
                    { value: 'organization', label: 'Organization', desc: 'Post and manage official opportunities.' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setRole(option.value)}
                      style={{
                        textAlign:'left',
                        padding:'12px',
                        borderRadius:'12px',
                        border: `1.5px solid ${role === option.value ? '#1B3A6B' : '#e2e8f0'}`,
                        background: role === option.value ? '#eff6ff' : '#f8fafc',
                        cursor:'pointer',
                        transition:'all 0.15s ease',
                      }}
                    >
                      <div style={{ fontSize:'13px', fontWeight:700, color:'#0f172a' }}>{option.label}</div>
                      <div style={{ fontSize:'11px', color:'#64748b', marginTop:'4px', lineHeight:1.5 }}>{option.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
              <FloatInput label="Full name"     type="text"     value={name}     onChange={setName}     error={errors.name} />
              <FloatInput label="Email address" type="email"    value={email}    onChange={setEmail}    error={errors.email}    autoComplete="email" />
              <FloatInput label="Password"       type="password" value={password} onChange={setPassword} error={errors.password} autoComplete="new-password" />

              {/* Password strength */}
              {password.length > 0 && (
                <div>
                  <div style={{ display:'flex', gap:'4px', marginBottom:'4px' }}>
                    {[1,2,3,4].map(i => (
                      <div key={i} style={{ flex:1, height:'3px', borderRadius:'2px', background: i <= strength ? strengthColors[strength] : '#e2e8f0', transition:'background 0.2s ease' }} />
                    ))}
                  </div>
                  <p style={{ fontSize:'11px', color: strength > 0 ? strengthColors[strength] : '#94a3b8', margin:0, fontWeight:600 }}>
                    {strengthLabels[strength]}
                  </p>
                </div>
              )}

              <div style={{ paddingTop:'4px' }}><SubmitBtn label="Create account" loading={loading} /></div>

              <p style={{ fontSize:'11px', color:'#94a3b8', textAlign:'center', margin:0, lineHeight:1.6 }}>
                By signing up you agree to our{' '}
                <a href="#" style={{ color:'#1B3A6B', textDecoration:'none', fontWeight:600 }}>Terms</a>
                {' '}and{' '}
                <a href="#" style={{ color:'#1B3A6B', textDecoration:'none', fontWeight:600 }}>Privacy Policy</a>
              </p>
            </form>
          </div>

          <p style={{ textAlign:'center', fontSize:'13px', color:'#64748b', marginTop:'16px' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color:'#1B3A6B', textDecoration:'none', fontWeight:700 }}>Sign in</Link>
          </p>
        </div>
      </div>
    </>
  );
}

// ── OAuthCallback ─────────────────────────────────────────────────────────────
export function OAuthCallback() {
  const setAuth  = useAuthStore(s => s.setAuth);
  const navigate = useNavigate();
  const [err, setErr] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token  = params.get('token');
    const error  = params.get('error');

    if (error || !token) {
      setErr('OAuth login failed. Redirecting...');
      setTimeout(() => navigate('/login'), 2000);
      return;
    }

    fetch(`${import.meta.env.VITE_API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => {
        if (!data.user) throw new Error('No user');
        setAuth(data.user, token);
        navigate('/', { replace: true });
      })
      .catch(() => {
        setErr('Failed to load profile. Redirecting...');
        setTimeout(() => navigate('/login'), 2000);
      });
  }, [navigate, setAuth]);

  return (
    <>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'16px', background:'#f8fafc', fontFamily:"'DM Sans',sans-serif" }}>
        {err ? (
          <div style={{ textAlign:'center' }}>
            <p style={{ color:'#ef4444', fontSize:'14px', marginBottom:'8px' }}>⚠️ {err}</p>
            <Link to="/login" style={{ fontSize:'13px', color:'#1B3A6B', fontWeight:600 }}>Go to Login</Link>
          </div>
        ) : (
          <>
            <div style={{ width:'40px', height:'40px', border:'3px solid #e2e8f0', borderTop:'3px solid #1B3A6B', borderRadius:'50%', animation:'spin 0.7s linear infinite' }} />
            <p style={{ color:'#64748b', fontSize:'14px', margin:0 }}>Signing you in...</p>
          </>
        )}
      </div>
    </>
  );
}

// ── OAuthErrorPage ───────────────────────────────────────────────────────────
export function OAuthErrorPage() {
  const navigate = useNavigate();
  const [message, setMessage] = useState('Authentication failed');
  const [provider, setProvider] = useState('OAuth');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setMessage(params.get('message') || 'Authentication failed. Please try again.');
    setProvider(params.get('provider') || 'oauth');
  }, []);

  return (
    <>
      <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#f8fafc', padding:'24px', fontFamily:"'DM Sans',sans-serif" }}>
        <div style={{ width:'100%', maxWidth:'440px', background:'#fff', border:'1px solid #e2e8f0', borderRadius:'20px', padding:'32px', boxShadow:'0 8px 28px rgba(15,23,42,0.08)' }}>
          <div style={{ width:'56px', height:'56px', borderRadius:'16px', background:'#fef2f2', color:'#dc2626', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'28px', marginBottom:'18px' }}>
            !
          </div>
          <p style={{ fontSize:'11px', fontWeight:700, color:'#94a3b8', letterSpacing:'0.1em', textTransform:'uppercase', margin:'0 0 8px' }}>
            {provider}
          </p>
          <h1 style={{ fontSize:'24px', fontWeight:800, color:'#0f172a', margin:'0 0 8px', fontFamily:"'Syne',sans-serif" }}>
            Sign-in didn&apos;t complete
          </h1>
          <p style={{ fontSize:'14px', color:'#64748b', lineHeight:1.7, margin:'0 0 24px' }}>
            {message}
          </p>
          <div style={{ display:'flex', gap:'10px', flexWrap:'wrap' }}>
            <button
              type="button"
              onClick={() => navigate('/login')}
              style={{ padding:'12px 16px', borderRadius:'12px', border:'none', background:'#1B3A6B', color:'#fff', fontWeight:700, cursor:'pointer' }}
            >
              Back to Login
            </button>
            <button
              type="button"
              onClick={() => window.location.href = authApi.googleAuthUrl()}
              style={{ padding:'12px 16px', borderRadius:'12px', border:'1px solid #e2e8f0', background:'#fff', color:'#334155', fontWeight:700, cursor:'pointer' }}
            >
              Try Google Again
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
