import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import api from '../api'

function PaymentComplete() {
  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState('processing')
  const [error, setError] = useState('')
  const [order, setOrder] = useState(null)

  const orderId = searchParams.get('orderId')
  const paymentId = searchParams.get('paymentId')

  useEffect(() => {
    if (!orderId) {
      setStatus('error')
      setError('주문 정보가 없습니다.')
      return
    }
    processPayment()
  }, [orderId])

  const processPayment = async () => {
    try {
      const response = await api.post('/payments/approve', { orderId, paymentId })
      if (response.data.success) {
        setStatus('success')
        const orderResponse = await api.get(`/orders/${orderId}`)
        setOrder(orderResponse.data.order)
      } else {
        setStatus('error')
        setError(response.data.error || '결제 승인에 실패했습니다.')
      }
    } catch (err) {
      setStatus('error')
      setError(err.response?.data?.error || '결제 처리 중 오류가 발생했습니다.')
    }
  }

  const formatPrice = (price) => new Intl.NumberFormat('ko-KR').format(price)

  // 처리 중
  if (status === 'processing') {
    return (
      <div style={{ paddingTop: '80px', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '48px', height: '48px', border: '2px solid #fff', borderTop: '2px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: '24px' }} />
        <p style={{ color: '#888' }}>결제를 처리하고 있습니다...</p>
        <p style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>잠시만 기다려주세요.</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  // 에러
  if (status === 'error') {
    return (
      <div style={{ paddingTop: '80px', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '64px', height: '64px', margin: '0 auto 24px', border: '2px solid #ff4444', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: '24px', color: '#ff4444' }}>✕</span>
        </div>
        <h1 style={{ fontSize: '24px', fontWeight: 300, letterSpacing: '0.2em', marginBottom: '16px' }}>결제 실패</h1>
        <p style={{ color: '#888', marginBottom: '32px' }}>{error}</p>
        <div style={{ display: 'flex', gap: '16px' }}>
          <Link to="/cart" style={{ padding: '12px 32px', border: '1px solid #444', fontSize: '14px', letterSpacing: '0.2em', color: '#888' }}>
            장바구니로
          </Link>
          <Link to="/" style={{ padding: '12px 32px', background: '#fff', color: '#000', fontSize: '14px', letterSpacing: '0.2em' }}>
            홈으로
          </Link>
        </div>
      </div>
    )
  }

  // 성공
  return (
    <div style={{ paddingTop: '80px', minHeight: '100vh', background: '#000' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '64px 80px' }}>
        {/* 완료 메시지 */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <div style={{ width: '64px', height: '64px', margin: '0 auto 24px', border: '2px solid #fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: '24px' }}>✓</span>
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 300, letterSpacing: '0.2em', marginBottom: '16px' }}>결제 완료</h1>
          <p style={{ color: '#888' }}>결제가 성공적으로 완료되었습니다.</p>
        </div>

        {order && (
          <div style={{ border: '1px solid #333', padding: '32px', marginBottom: '32px' }}>
            <div style={{ textAlign: 'center', marginBottom: '32px', paddingBottom: '32px', borderBottom: '1px solid #333' }}>
              <p style={{ fontSize: '12px', color: '#888', marginBottom: '8px' }}>주문번호</p>
              <p style={{ fontSize: '18px', letterSpacing: '0.1em' }}>{order.order_number}</p>
            </div>

            {/* 주문 상품 */}
            <div style={{ marginBottom: '32px' }}>
              <h3 style={{ fontSize: '14px', letterSpacing: '0.1em', color: '#888', marginBottom: '16px' }}>주문 상품</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {order.items?.map((item) => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                    <span>{item.product_name} x {item.quantity}</span>
                    <span>₩ {formatPrice(item.product_price * item.quantity)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 배송 정보 */}
            <div style={{ marginBottom: '32px' }}>
              <h3 style={{ fontSize: '14px', letterSpacing: '0.1em', color: '#888', marginBottom: '16px' }}>배송 정보</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px', color: '#ccc' }}>
                <p>{order.recipient_name}</p>
                <p>{order.recipient_phone}</p>
                <p>{order.recipient_address}{order.recipient_address_detail && ` ${order.recipient_address_detail}`}</p>
              </div>
            </div>

            {/* 결제 정보 */}
            <div style={{ paddingTop: '24px', borderTop: '1px solid #333' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px' }}>
                <span>결제 금액</span>
                <span>₩ {formatPrice(order.total_amount)}</span>
              </div>
              <p style={{ fontSize: '12px', color: '#888', marginTop: '8px' }}>
                {order.payment_method === 'toss' ? '토스페이먼츠로' : '네이버페이로'} 결제되었습니다.
              </p>
            </div>
          </div>
        )}

        {/* 버튼 */}
        <div style={{ display: 'flex', gap: '16px' }}>
          <Link to="/mypage" style={{ flex: 1, padding: '16px', border: '1px solid #fff', textAlign: 'center', fontSize: '14px', letterSpacing: '0.2em' }}>
            주문 내역 보기
          </Link>
          <Link to="/" style={{ flex: 1, padding: '16px', background: '#fff', color: '#000', textAlign: 'center', fontSize: '14px', letterSpacing: '0.2em' }}>
            쇼핑 계속하기
          </Link>
        </div>
      </div>
    </div>
  )
}

export default PaymentComplete
