import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '@/api';
import { useAuthStore } from '@/store/authStore';

// ─────────────────────────────────────────────────────────────────────────────
// Icons
// ─────────────────────────────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────────────────────
// Shared UI
// ─────────────────────────────────────────────────────────────────────────────
const AuthBg = () => (
  <div style={{ position:'fixed', inset:0, overflow:'hidden', pointerEvents:'none', zIndex:0 }} aria-hidden="true">
    <div style={{
      position: 'absolute', inset: 0,
      backgroundImage: 'linear-gradient(rgba(99,102,241,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.04) 1px, transparent 1px)',
      backgroundSize: '48px 48px',
    }} />
    <div style={{ position:'absolute', top:'-20%', left:'50%', transform:'translateX(-50%)', width:'700px', height:'500px', background:'radial-gradient(ellipse, rgba(99,102,241,0.12) 0%, transparent 70%)' }} />
    <div style={{ position:'absolute', bottom:'-10%', right:'-10%', width:'400px', height:'400px', background:'radial-gradient(ellipse, rgba(16,185,129,0.07) 0%, transparent 70%)' }} />
  </div>
);

const Logo = ({ sub }) => (
  <div style={{ textAlign:'center', marginBottom:'32px' }}>
    <Link to="/" style={{ textDecoration:'none' }}>
      <div style={{ display:'inline-flex', alignItems:'center', gap:'10px', marginBottom:'8px' }}>
        <div style={{ width:'36px', height:'36px', borderRadius:'10px', background:'linear-gradient(135deg,#6366f1,#4f46e5)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 4px 16px rgba(99,102,241,0.4)' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
        </div>
        <span style={{ fontSize:'22px', fontFamily:"'Syne',sans-serif", fontWeight:800, color:'#f1f5f9', letterSpacing:'-0.02em' }}>
          Uni<span style={{ color:'#818cf8' }}>Sites</span>
        </span>
      </div>
      <p style={{ fontSize:'13px', color:'#64748b', margin:0 }}>{sub}</p>
    </Link>
  </div>
);

const FloatInput = ({ label, type='text', value, onChange, error, autoComplete }) => {
  const [focused, setFocused] = useState(false);
  const raised = focused || value.length > 0;
  return (
    <div style={{ position:'relative' }}>
      <label style={{ position:'absolute', left:'14px', top: raised ? '7px' : '50%', transform: raised ? 'none' : 'translateY(-50%)', fontSize: raised ? '10px' : '13px', color: focused ? '#818cf8' : '#64748b', fontWeight: raised ? 600 : 400, letterSpacing: raised ? '0.06em' : '0', textTransform: raised ? 'uppercase' : 'none', transition:'all 0.18s ease', pointerEvents:'none', zIndex:1, fontFamily:"'DM Sans',sans-serif" }}>
        {label}
      </label>
      <input type={type} value={value} autoComplete={autoComplete} onChange={e => onChange(e.target.value)} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        style={{ width:'100%', paddingTop: raised ? '22px' : '14px', paddingBottom: raised ? '8px' : '14px', paddingLeft:'14px', paddingRight:'14px', background: focused ? 'rgba(99,102,241,0.06)' : 'rgba(255,255,255,0.03)', border:`1.5px solid ${error ? '#f87171' : focused ? '#6366f1' : 'rgba(255,255,255,0.1)'}`, borderRadius:'12px', color:'#f1f5f9', fontSize:'14px', outline:'none', transition:'all 0.18s ease', fontFamily:"'DM Sans',sans-serif", boxSizing:'border-box', display:'block' }}
      />
      {error && <p style={{ fontSize:'11px', color:'#f87171', marginTop:'4px', paddingLeft:'4px', marginBottom:0 }}>{error}</p>}
    </div>
  );
};

const OAuthBtn = ({ icon, label, onClick }) => (
  <button onClick={onClick} type="button"
    style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'center', gap:'10px', padding:'11px 16px', background:'rgba(255,255,255,0.04)', border:'1.5px solid rgba(255,255,255,0.1)', borderRadius:'12px', color:'#cbd5e1', fontSize:'13px', fontWeight:500, cursor:'pointer', transition:'all 0.15s ease', fontFamily:"'DM Sans',sans-serif" }}
    onMouseEnter={e => { e.currentTarget.style.background='rgba(255,255,255,0.08)'; e.currentTarget.style.borderColor='rgba(255,255,255,0.2)'; }}
    onMouseLeave={e => { e.currentTarget.style.background='rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor='rgba(255,255,255,0.1)'; }}
  >
    {icon}{label}
  </button>
);

const SubmitBtn = ({ label, loading }) => (
  <button type="submit" disabled={loading}
    style={{ width:'100%', padding:'13px', background: loading ? 'rgba(99,102,241,0.5)' : 'linear-gradient(135deg,#6366f1 0%,#4f46e5 100%)', border:'none', borderRadius:'12px', color:'#fff', fontSize:'14px', fontWeight:600, cursor: loading ? 'not-allowed' : 'pointer', transition:'all 0.15s ease', letterSpacing:'0.02em', fontFamily:"'DM Sans',sans-serif", boxShadow: loading ? 'none' : '0 4px 24px rgba(99,102,241,0.35)', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px' }}>
    {loading && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation:'spin 0.8s linear infinite' }}><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>}
    {label}
  </button>
);

const Divider = () => (
  <div style={{ display:'flex', alignItems:'center', gap:'12px', margin:'4px 0' }}>
    <div style={{ flex:1, height:'1px', background:'rgba(255,255,255,0.08)' }} />
    <span style={{ fontSize:'11px', color:'#475569', fontWeight:500, letterSpacing:'0.08em', textTransform:'uppercase' }}>or</span>
    <div style={{ flex:1, height:'1px', background:'rgba(255,255,255,0.08)' }} />
  </div>
);

const ErrorAlert = ({ message }) => message ? (
  <div style={{ padding:'10px 14px', background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.25)', borderRadius:'10px', color:'#fca5a5', fontSize:'13px' }}>
    {message}
  </div>
) : null;

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Syne:wght@700;800&display=swap');
  @keyframes spin   { to { transform: rotate(360deg); } }
  @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
`;

const PAGE_STYLE = { minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:'24px', position:'relative', zIndex:10, fontFamily:"'DM Sans',sans-serif" };
const CARD_STYLE = { background:'rgba(255,255,255,0.03)', backdropFilter:'blur(20px)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'20px', padding:'32px' };

// ─────────────────────────────────────────────────────────────────────────────
// LoginPage
// ─────────────────────────────────────────────────────────────────────────────
export function LoginPage() {
  const setAuth    = useAuthStore(s => s.setAuth);
  const navigate   = useNavigate();
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await authApi.login({ email, password });
      setAuth(res.data.user, res.data.token);
      navigate(res.data.user?.Role?.name === 'owner' ? '/owner' : '/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{STYLES}</style>
      <AuthBg />
      <div style={PAGE_STYLE}>
        <div style={{ width:'100%', maxWidth:'400px', animation:'fadeUp 0.4s ease-out both' }}>
          <Logo sub="Discover universities in Cambodia" />
          <div style={CARD_STYLE}>
            <h1 style={{ fontSize:'20px', fontWeight:700, color:'#f1f5f9', margin:'0 0 6px', fontFamily:"'Syne',sans-serif" }}>Welcome back</h1>
            <p style={{ fontSize:'13px', color:'#64748b', margin:'0 0 24px' }}>Sign in to continue to your account</p>

            <div style={{ display:'flex', flexDirection:'column', gap:'10px', marginBottom:'20px' }}>
              <OAuthBtn icon={GOOGLE_ICON}   label="Continue with Google"   onClick={() => window.location.href = authApi.googleAuthUrl()} />
              <OAuthBtn icon={FACEBOOK_ICON} label="Continue with Facebook" onClick={() => window.location.href = authApi.facebookAuthUrl()} />
            </div>

            <Divider />

            <form onSubmit={handleSubmit} style={{ marginTop:'20px', display:'flex', flexDirection:'column', gap:'12px' }}>
              <ErrorAlert message={error} />
              <FloatInput label="Email address" type="email"    value={email}    onChange={setEmail}    autoComplete="email" />
              <FloatInput label="Password"      type="password" value={password} onChange={setPassword} autoComplete="current-password" />
              <div style={{ paddingTop:'4px' }}><SubmitBtn label="Sign in" loading={loading} /></div>
            </form>
          </div>
          <p style={{ textAlign:'center', fontSize:'13px', color:'#475569', marginTop:'20px' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color:'#818cf8', textDecoration:'none', fontWeight:600 }}>Sign up</Link>
          </p>
        </div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// RegisterPage
// ─────────────────────────────────────────────────────────────────────────────
export function RegisterPage() {
  const setAuth    = useAuthStore(s => s.setAuth);
  const navigate   = useNavigate();
  const [role,     setRole]     = useState('student');
  const [name,     setName]     = useState('');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
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
    setError('');
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await authApi.register({ name, email, password, role });
      setAuth(res.data.user, res.data.token);
      navigate(role === 'owner' ? '/owner' : '/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
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
      <AuthBg />
      <div style={PAGE_STYLE}>
        <div style={{ width:'100%', maxWidth:'420px', animation:'fadeUp 0.4s ease-out both' }}>
          <Logo sub="Join thousands of Cambodian students" />
          <div style={CARD_STYLE}>
            <h1 style={{ fontSize:'20px', fontWeight:700, color:'#f1f5f9', margin:'0 0 6px', fontFamily:"'Syne',sans-serif" }}>Create account</h1>
            <p style={{ fontSize:'13px', color:'#64748b', margin:'0 0 20px' }}>Start your university discovery journey</p>

            {/* Role toggle */}
            <div style={{ display:'flex', gap:'6px', padding:'5px', background:'rgba(0,0,0,0.2)', borderRadius:'12px', border:'1px solid rgba(255,255,255,0.06)', marginBottom:'20px' }}>
              {[{ value:'student', label:'🎓 Student' }, { value:'owner', label:'🏫 University' }].map(r => (
                <button key={r.value} type="button" onClick={() => setRole(r.value)} style={{ flex:1, padding:'9px 12px', borderRadius:'8px', border:'none', background: role === r.value ? 'linear-gradient(135deg,#6366f1,#4f46e5)' : 'transparent', color: role === r.value ? '#fff' : '#64748b', fontSize:'13px', fontWeight:600, cursor:'pointer', transition:'all 0.2s ease', boxShadow: role === r.value ? '0 2px 12px rgba(99,102,241,0.3)' : 'none', fontFamily:"'DM Sans',sans-serif" }}>
                  {r.label}
                </button>
              ))}
            </div>

            <div style={{ display:'flex', flexDirection:'column', gap:'10px', marginBottom:'20px' }}>
              <OAuthBtn icon={GOOGLE_ICON}   label="Sign up with Google"   onClick={() => window.location.href = authApi.googleAuthUrl()} />
              <OAuthBtn icon={FACEBOOK_ICON} label="Sign up with Facebook" onClick={() => window.location.href = authApi.facebookAuthUrl()} />
            </div>

            <Divider />

            <form onSubmit={handleSubmit} style={{ marginTop:'20px', display:'flex', flexDirection:'column', gap:'12px' }}>
              <ErrorAlert message={error} />
              <FloatInput label="Full name"      type="text"     value={name}     onChange={setName}     error={errors.name} />
              <FloatInput label="Email address"  type="email"    value={email}    onChange={setEmail}    error={errors.email}    autoComplete="email" />
              <FloatInput label="Password"        type="password" value={password} onChange={setPassword} error={errors.password} autoComplete="new-password" />

              {/* Password strength */}
              {password.length > 0 && (
                <div>
                  <div style={{ display:'flex', gap:'4px', marginBottom:'4px' }}>
                    {[1,2,3,4].map(i => (
                      <div key={i} style={{ flex:1, height:'3px', borderRadius:'2px', background: i <= strength ? strengthColors[strength] : 'rgba(255,255,255,0.1)', transition:'background 0.2s ease' }} />
                    ))}
                  </div>
                  <p style={{ fontSize:'11px', color:'#64748b', margin:0 }}>{strengthLabels[strength]}</p>
                </div>
              )}

              <div style={{ paddingTop:'4px' }}><SubmitBtn label="Create account" loading={loading} /></div>

              <p style={{ fontSize:'11px', color:'#475569', textAlign:'center', margin:0, lineHeight:1.6 }}>
                By signing up you agree to our <a href="#" style={{ color:'#818cf8', textDecoration:'none' }}>Terms</a> and <a href="#" style={{ color:'#818cf8', textDecoration:'none' }}>Privacy Policy</a>
              </p>
            </form>
          </div>
          <p style={{ textAlign:'center', fontSize:'13px', color:'#475569', marginTop:'20px' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color:'#818cf8', textDecoration:'none', fontWeight:600 }}>Sign in</Link>
          </p>
        </div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// OAuthCallback
// ─────────────────────────────────────────────────────────────────────────────
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
        navigate(data.user?.Role?.name === 'owner' ? '/owner' : '/dashboard', { replace: true });
      })
      .catch(() => {
        setErr('Failed to load profile. Redirecting...');
        setTimeout(() => navigate('/login'), 2000);
      });
  }, []);

  return (
    <>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'16px', background:'#080c14', fontFamily:"'DM Sans',sans-serif" }}>
        {err ? (
          <p style={{ color:'#f87171', fontSize:'14px' }}>{err}</p>
        ) : (
          <>
            <div style={{ width:'40px', height:'40px', border:'3px solid rgba(99,102,241,0.2)', borderTop:'3px solid #6366f1', borderRadius:'50%', animation:'spin 0.7s linear infinite' }} />
            <p style={{ color:'#64748b', fontSize:'14px', margin:0 }}>Signing you in...</p>
          </>
        )}
      </div>
    </>
  );
}