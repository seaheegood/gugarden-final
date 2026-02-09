import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import api from '../api'

function TossPaymentSuccess() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [orderInfo, setOrderInfo] = useState(null)

  useEffect(() => {
    confirmPayment()
  }, [])

  const confirmPayment = async () => {
    try {
      const paymentKey = searchParams.get('paymentKey')
      const orderId = searchParams.get('orderId')
      const amount = Number(searchParams.get('amount'))

      if (!paymentKey || !orderId || !amount) {
        setError('결제 정보가 올바르지 않습니다.')
        setLoading(false)
        return
      }

      // 결제 승인 요청
      const response = await api.post('/payments/toss/confirm', {
        paymentKey,
        orderId,
        amount
      })

      if (response.data.success) {
        setOrderInfo({
          orderId: response.data.orderId,
          orderNumber: response.data.orderNumber
        })
      } else {
        setError(response.data.error || '결제 승인에 실패했습니다.')
      }
    } catch (err) {
      setError(err.response?.data?.error || '결제 처리 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
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
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid #333',
          borderTop: '3px solid #fff',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <p style={{ fontSize: '14px', color: '#888' }}>결제 승인 중...</p>
        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
        </style>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{
        paddingTop: '80px',
        minHeight: '100vh',
        background: '#000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center', maxWidth: '400px', padding: '0 24px' }}>
          <div style={{
            width: '80px',
            height: '80px',
            margin: '0 auto 24px',
            borderRadius: '50%',
            background: 'rgba(255, 0, 0, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ff6666" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="15" y1="9" x2="9" y2="15"/>
              <line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 300, marginBottom: '16px' }}>결제 실패</h1>
          <p style={{ fontSize: '14px', color: '#888', marginBottom: '32px' }}>{error}</p>
          <Link
            to="/checkout"
            style={{
              display: 'inline-block',
              padding: '14px 32px',
              background: '#fff',
              color: '#000',
              fontSize: '14px',
              letterSpacing: '0.1em',
              textDecoration: 'none'
            }}
          >
            다시 시도
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      paddingTop: '80px',
      minHeight: '100vh',
      background: '#000',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{ textAlign: 'center', maxWidth: '400px', padding: '0 24px' }}>
        <div style={{
          width: '80px',
          height: '80px',
          margin: '0 auto 24px',
          borderRadius: '50%',
          background: 'rgba(0, 255, 100, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#00ff64" strokeWidth="2">
            <path d="M20 6L9 17l-5-5"/>
          </svg>
        </div>
        <h1 style={{ fontSize: '24px', fontWeight: 300, marginBottom: '16px' }}>결제 완료</h1>
        <p style={{ fontSize: '14px', color: '#888', marginBottom: '8px' }}>주문이 성공적으로 완료되었습니다.</p>
        {orderInfo && (
          <p style={{ fontSize: '14px', color: '#666', marginBottom: '32px' }}>
            주문번호: {orderInfo.orderNumber}
          </p>
        )}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <Link
            to={orderInfo ? `/order/${orderInfo.orderId}` : '/mypage'}
            style={{
              display: 'inline-block',
              padding: '14px 32px',
              background: '#fff',
              color: '#000',
              fontSize: '14px',
              letterSpacing: '0.1em',
              textDecoration: 'none'
            }}
          >
            주문 상세 보기
          </Link>
          <Link
            to="/"
            style={{
              display: 'inline-block',
              padding: '14px 32px',
              background: 'transparent',
              color: '#fff',
              fontSize: '14px',
              letterSpacing: '0.1em',
              textDecoration: 'none',
              border: '1px solid #333'
            }}
          >
            홈으로
          </Link>
        </div>
      </div>
    </div>
  )
}

export default TossPaymentSuccess
