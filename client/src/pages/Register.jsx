import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Register() {
  const navigate = useNavigate()
  const { register } = useAuth()

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    passwordConfirm: '',
    name: '',
    phone: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (formData.password !== formData.passwordConfirm) {
      setError('비밀번호가 일치하지 않습니다.')
      return
    }

    if (formData.password.length < 6) {
      setError('비밀번호는 6자 이상이어야 합니다.')
      return
    }

    setLoading(true)

    try {
      await register({
        email: formData.email,
        password: formData.password,
        name: formData.name,
        phone: formData.phone,
      })
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.error || '회원가입에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = { width: '100%', background: 'transparent', border: '1px solid #333', padding: '12px 16px', fontSize: '14px', color: '#fff' }

  return (
    <div style={{ paddingTop: '80px', minHeight: '100vh', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '64px 24px' }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 300, letterSpacing: '0.2em', marginBottom: '16px' }}>REGISTER</h1>
          <p style={{ fontSize: '14px', color: '#888' }}>구의정원 회원가입</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {error && (
            <div style={{ padding: '16px', background: 'rgba(255,0,0,0.1)', border: '1px solid rgba(255,0,0,0.2)', color: '#ff6666', fontSize: '14px', textAlign: 'center' }}>
              {error}
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '12px', color: '#888', marginBottom: '8px' }}>이메일 *</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="example@email.com" style={inputStyle} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', color: '#888', marginBottom: '8px' }}>비밀번호 *</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} required placeholder="6자 이상 입력해주세요" style={inputStyle} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', color: '#888', marginBottom: '8px' }}>비밀번호 확인 *</label>
            <input type="password" name="passwordConfirm" value={formData.passwordConfirm} onChange={handleChange} required placeholder="비밀번호를 다시 입력해주세요" style={inputStyle} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', color: '#888', marginBottom: '8px' }}>이름 *</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="홍길동" style={inputStyle} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', color: '#888', marginBottom: '8px' }}>연락처</label>
            <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="010-0000-0000" style={inputStyle} />
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
            {loading ? 'LOADING...' : 'REGISTER'}
          </button>
        </form>

        <div style={{ marginTop: '32px', textAlign: 'center' }}>
          <p style={{ fontSize: '14px', color: '#888' }}>
            이미 회원이신가요?{' '}
            <Link to="/login" style={{ color: '#fff' }}>로그인</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Register
