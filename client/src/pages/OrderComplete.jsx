import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../api'

function OrderComplete() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrder()
  }, [id])

  const fetchOrder = async () => {
    try {
      const response = await api.get(`/orders/${id}`)
      setOrder(response.data.order)
    } catch (error) {
      console.error('주문 조회 에러:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price) => new Intl.NumberFormat('ko-KR').format(price)

  if (loading) {
    return (
      <div style={{ paddingTop: '80px', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#888' }}>로딩 중...</p>
      </div>
    )
  }

  if (!order) {
    return (
      <div style={{ paddingTop: '80px', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#888', marginBottom: '16px' }}>주문 정보를 찾을 수 없습니다.</p>
        <Link to="/" style={{ fontSize: '14px', color: '#888' }}>홈으로 돌아가기</Link>
      </div>
    )
  }

  return (
    <div style={{ paddingTop: '80px', minHeight: '100vh', background: '#000' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '64px 80px' }}>
        {/* 완료 메시지 */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <div style={{ width: '64px', height: '64px', margin: '0 auto 24px', border: '2px solid #fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: '24px' }}>✓</span>
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 300, letterSpacing: '0.2em', marginBottom: '16px' }}>주문 완료</h1>
          <p style={{ color: '#888' }}>주문이 성공적으로 접수되었습니다.</p>
        </div>

        {/* 주문 정보 */}
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
              {order.memo && <p style={{ color: '#888' }}>메모: {order.memo}</p>}
            </div>
          </div>

          {/* 결제 정보 */}
          <div style={{ paddingTop: '24px', borderTop: '1px solid #333' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                <span style={{ color: '#888' }}>상품 금액</span>
                <span>₩ {formatPrice(order.total_amount - order.shipping_fee)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                <span style={{ color: '#888' }}>배송비</span>
                <span>{order.shipping_fee === 0 ? '무료' : `₩ ${formatPrice(order.shipping_fee)}`}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', paddingTop: '16px', borderTop: '1px solid #333' }}>
                <span>총 결제 금액</span>
                <span>₩ {formatPrice(order.total_amount)}</span>
              </div>
            </div>
          </div>
        </div>

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

export default OrderComplete
