import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import api from '../api'

function OrderDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
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
      // error silently handled
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async () => {
    if (!confirm('주문을 취소하시겠습니까?')) return
    try {
      await api.put(`/orders/${id}/cancel`)
      alert('주문이 취소되었습니다.')
      fetchOrder()
    } catch (error) {
      alert(error.response?.data?.error || '주문 취소에 실패했습니다.')
    }
  }

  const formatPrice = (price) => new Intl.NumberFormat('ko-KR').format(price)
  const formatDate = (dateString) => new Date(dateString).toLocaleString('ko-KR')

  const getStatusText = (status) => {
    const statusMap = {
      pending: '결제 대기',
      paid: '결제 완료',
      preparing: '상품 준비중',
      shipped: '배송중',
      delivered: '배송 완료',
      cancelled: '주문 취소',
    }
    return statusMap[status] || status
  }

  const canCancel = order && ['pending', 'paid'].includes(order.status)

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
        <Link to="/mypage" style={{ fontSize: '14px', color: '#888' }}>주문 내역으로 돌아가기</Link>
      </div>
    )
  }

  return (
    <div style={{ paddingTop: '80px', minHeight: '100vh', background: '#000' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '64px 80px' }}>
        {/* 헤더 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <button onClick={() => navigate(-1)} style={{ background: 'transparent', border: 'none', color: '#888', fontSize: '14px', cursor: 'pointer' }}>
            ← 뒤로가기
          </button>
          <span style={{
            fontSize: '12px',
            padding: '4px 12px',
            background: order.status === 'cancelled' ? 'rgba(255,0,0,0.2)' : '#222',
            color: order.status === 'cancelled' ? '#ff6666' : '#fff',
          }}>
            {getStatusText(order.status)}
          </span>
        </div>

        <h1 style={{ fontSize: '24px', fontWeight: 300, letterSpacing: '0.2em', marginBottom: '8px' }}>주문 상세</h1>
        <p style={{ fontSize: '14px', color: '#888', marginBottom: '32px' }}>주문번호: {order.order_number}</p>

        {/* 주문 상품 */}
        <div style={{ border: '1px solid #333', marginBottom: '24px' }}>
          <div style={{ padding: '16px', borderBottom: '1px solid #333', background: '#111' }}>
            <h2 style={{ fontSize: '14px', letterSpacing: '0.1em' }}>주문 상품</h2>
          </div>
          <div>
            {order.items?.map((item) => (
              <div key={item.id} style={{ display: 'flex', gap: '16px', padding: '16px', borderBottom: '1px solid #222' }}>
                <div style={{ width: '64px', height: '64px', background: '#1a1a1a', overflow: 'hidden' }}>
                  <img src={item.thumbnail || '/images/placeholder.jpg'} alt={item.product_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '14px', marginBottom: '4px' }}>{item.product_name}</p>
                  <p style={{ fontSize: '12px', color: '#888' }}>₩ {formatPrice(item.product_price)} x {item.quantity}</p>
                </div>
                <div style={{ fontSize: '14px' }}>₩ {formatPrice(item.product_price * item.quantity)}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 배송 정보 */}
        <div style={{ border: '1px solid #333', marginBottom: '24px' }}>
          <div style={{ padding: '16px', borderBottom: '1px solid #333', background: '#111' }}>
            <h2 style={{ fontSize: '14px', letterSpacing: '0.1em' }}>배송 정보</h2>
          </div>
          <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px' }}>
            <div style={{ display: 'flex' }}><span style={{ width: '80px', color: '#888' }}>받는 분</span><span>{order.recipient_name}</span></div>
            <div style={{ display: 'flex' }}><span style={{ width: '80px', color: '#888' }}>연락처</span><span>{order.recipient_phone}</span></div>
            <div style={{ display: 'flex' }}><span style={{ width: '80px', color: '#888' }}>주소</span><span>{order.recipient_address}{order.recipient_address_detail && ` ${order.recipient_address_detail}`}</span></div>
            {order.memo && <div style={{ display: 'flex' }}><span style={{ width: '80px', color: '#888' }}>메모</span><span>{order.memo}</span></div>}
          </div>
        </div>

        {/* 결제 정보 */}
        <div style={{ border: '1px solid #333', marginBottom: '32px' }}>
          <div style={{ padding: '16px', borderBottom: '1px solid #333', background: '#111' }}>
            <h2 style={{ fontSize: '14px', letterSpacing: '0.1em' }}>결제 정보</h2>
          </div>
          <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#888' }}>상품 금액</span><span>₩ {formatPrice(order.total_amount - order.shipping_fee)}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#888' }}>배송비</span><span>{order.shipping_fee === 0 ? '무료' : `₩ ${formatPrice(order.shipping_fee)}`}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', paddingTop: '16px', borderTop: '1px solid #333' }}><span>총 결제 금액</span><span>₩ {formatPrice(order.total_amount)}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '8px', fontSize: '12px', color: '#888' }}><span>주문일시</span><span>{formatDate(order.created_at)}</span></div>
          </div>
        </div>

        {/* 버튼 */}
        <div style={{ display: 'flex', gap: '16px' }}>
          {canCancel && (
            <button onClick={handleCancel} style={{ flex: 1, padding: '16px', border: '1px solid #444', background: 'transparent', color: '#888', fontSize: '14px', letterSpacing: '0.2em', cursor: 'pointer' }}>
              주문 취소
            </button>
          )}
          <Link to="/mypage" style={{ flex: 1, padding: '16px', background: '#fff', color: '#000', textAlign: 'center', fontSize: '14px', letterSpacing: '0.2em' }}>
            주문 내역으로
          </Link>
        </div>
      </div>
    </div>
  )
}

export default OrderDetail
