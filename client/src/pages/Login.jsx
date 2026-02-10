import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()

  const [formData, setFormData] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const from = location.state?.from?.pathname || '/'

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const user = await login(formData.email, formData.password)
      // 관리자인 경우 /admin으로 리다이렉트
      if (user?.role === 'admin') {
        navigate('/admin', { replace: true })
      } else {
        navigate(from, { replace: true })
      }
    } catch (err) {
      setError(err.response?.data?.error || '로그인에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = { width: '100%', background: 'transparent', border: '1px solid #333', padding: '12px 16px', fontSize: '14px', color: '#fff' }

  return (
    <div style={{ paddingTop: '80px', minHeight: '100vh', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: '400px', padding: '0 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 300, letterSpacing: '0.2em', marginBottom: '16px' }}>LOGIN</h1>
          <p style={{ fontSize: '14px', color: '#888' }}>구의정원에 오신 것을 환영합니다</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {error && (
            <div style={{ padding: '16px', background: 'rgba(255,0,0,0.1)', border: '1px solid rgba(255,0,0,0.2)', color: '#ff6666', fontSize: '14px', textAlign: 'center' }}>
              {error}
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '12px', color: '#888', marginBottom: '8px' }}>이메일</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="example@email.com" style={inputStyle} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', color: '#888', marginBottom: '8px' }}>비밀번호</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} required placeholder="••••••••" style={inputStyle} />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '16px',
              background: '#fff',
              color: '#000',
              fontSize: '14px',
              letterSpacing: '0.2em',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.5 : 1,
            }}
          >
            {loading ? 'LOADING...' : 'LOGIN'}
          </button>
        </form>

        {/* 소셜 로그인 구분선 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', margin: '32px 0' }}>
          <div style={{ flex: 1, height: '1px', background: '#333' }} />
          <span style={{ fontSize: '12px', color: '#666' }}>또는</span>
          <div style={{ flex: 1, height: '1px', background: '#333' }} />
        </div>

        {/* 소셜 로그인 버튼 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* 네이버 로그인 */}
          <button
            type="button"
            onClick={() => window.location.href = '/api/auth/naver'}
            style={{
              width: '100%',
              padding: '14px',
              background: '#03C75A',
              color: '#fff',
              fontSize: '14px',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <span style={{ fontWeight: 'bold' }}>N</span>
            네이버 로그인
          </button>

        </div>

        <div style={{ marginTop: '32px', textAlign: 'center' }}>
          <p style={{ fontSize: '14px', color: '#888' }}>
            아직 회원이 아니신가요?{' '}
            <Link to="/register" style={{ color: '#fff' }}>회원가입</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
