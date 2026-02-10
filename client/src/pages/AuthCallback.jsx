import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function AuthCallback() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { socialLogin } = useAuth()
  const [error, setError] = useState(null)

  useEffect(() => {
    const code = searchParams.get('code')
    const errorParam = searchParams.get('error')

    if (errorParam) {
      setError('소셜 로그인에 실패했습니다. 다시 시도해주세요.')
      setTimeout(() => navigate('/login'), 3000)
      return
    }

    if (code) {
      handleSocialLogin(code)
    } else {
      setError('인증 정보를 찾을 수 없습니다.')
      setTimeout(() => navigate('/login'), 3000)
    }
  }, [searchParams])

  const handleSocialLogin = async (code) => {
    try {
      const user = await socialLogin(code)
      if (user?.role === 'admin') {
        navigate('/admin', { replace: true })
      } else {
        navigate('/', { replace: true })
      }
    } catch (err) {
      setError('로그인 처리 중 오류가 발생했습니다.')
      setTimeout(() => navigate('/login'), 3000)
    }
  }

  return (
    <div style={{
      paddingTop: '80px',
      minHeight: '100vh',
      background: '#000',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      gap: '24px'
    }}>
      {error ? (
        <>
          <p style={{ fontSize: '16px', color: '#ff6666' }}>{error}</p>
          <p style={{ fontSize: '14px', color: '#888' }}>잠시 후 로그인 페이지로 이동합니다...</p>
        </>
      ) : (
        <>
          <div style={{
            width: '40px',
            height: '40px',
            border: '3px solid #333',
            borderTop: '3px solid #fff',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          <p style={{ fontSize: '14px', color: '#888' }}>로그인 처리 중...</p>
          <style>
            {`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}
          </style>
        </>
      )}
    </div>
  )
}

export default AuthCallback
