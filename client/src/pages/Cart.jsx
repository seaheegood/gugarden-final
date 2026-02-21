import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api'

function Cart() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [items, setItems] = useState([])
  const [totalAmount, setTotalAmount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart()
    } else {
      setLoading(false)
    }
  }, [isAuthenticated])

  const fetchCart = async () => {
    try {
      const response = await api.get('/cart')
      setItems(response.data.items)
      setTotalAmount(response.data.totalAmount)
    } catch (error) {
      // error silently handled
    } finally {
      setLoading(false)
    }
  }

  const updateQuantity = async (id, quantity) => {
    if (quantity < 1) return
    try {
      await api.put(`/cart/${id}`, { quantity })
      fetchCart()
    } catch (error) {
      alert(error.response?.data?.error || '수량 변경에 실패했습니다.')
    }
  }

  const removeItem = async (id) => {
    if (!confirm('장바구니에서 삭제하시겠습니까?')) return
    try {
      await api.delete(`/cart/${id}`)
      fetchCart()
    } catch (error) {
      alert('삭제에 실패했습니다.')
    }
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('ko-KR').format(price)
  }

  const shippingFee = totalAmount >= 50000 ? 0 : 3000
  const finalAmount = totalAmount + shippingFee

  if (!isAuthenticated) {
    return (
      <div style={{ paddingTop: '80px', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#888', marginBottom: '24px' }}>로그인이 필요합니다.</p>
        <Link to="/login" style={{ border: '1px solid #fff', padding: '12px 32px', fontSize: '14px', letterSpacing: '0.1em' }}>
          로그인
        </Link>
      </div>
    )
  }

  if (loading) {
    return (
      <div style={{ paddingTop: '80px', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#888' }}>로딩 중...</p>
      </div>
    )
  }

  return (
    <div style={{ paddingTop: '80px', minHeight: '100vh', background: '#000' }}>
      <div className="responsive-container" style={{ maxWidth: '800px', paddingTop: '64px', paddingBottom: '64px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 300, letterSpacing: '0.2em', textAlign: 'center', marginBottom: '48px' }}>CART</h1>

        {items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px 0' }}>
            <p style={{ color: '#888', marginBottom: '32px' }}>장바구니가 비어있습니다.</p>
            <Link to="/terrarium" style={{ border: '1px solid #444', padding: '12px 32px', fontSize: '14px', letterSpacing: '0.1em', color: '#888' }}>
              쇼핑하러 가기
            </Link>
          </div>
        ) : (
          <>
            {/* 장바구니 목록 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginBottom: '48px' }}>
              {items.map((item) => (
                <div key={item.id} className="cart-item" style={{ padding: '24px', border: '1px solid #333' }}>
                  <Link to={`/product/${item.product_id}`}>
                    <div className="cart-item-image" style={{ background: '#1a1a1a', overflow: 'hidden' }}>
                      <img src={item.thumbnail || '/images/placeholder.jpg'} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  </Link>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <Link to={`/product/${item.product_id}`} style={{ fontSize: '14px', fontWeight: 300, letterSpacing: '0.1em' }}>
                        {item.name}
                      </Link>
                      <p style={{ fontSize: '14px', color: '#888', marginTop: '4px' }}>
                        ₩ {formatPrice(item.sale_price || item.price)}
                      </p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)} style={{ width: '32px', height: '32px', border: '1px solid #444', background: 'transparent', color: '#fff', cursor: 'pointer' }}>-</button>
                        <span style={{ width: '32px', textAlign: 'center', fontSize: '14px' }}>{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} style={{ width: '32px', height: '32px', border: '1px solid #444', background: 'transparent', color: '#fff', cursor: 'pointer' }}>+</button>
                      </div>
                      <button onClick={() => removeItem(item.id)} style={{ fontSize: '12px', color: '#888', background: 'transparent', border: 'none', cursor: 'pointer' }}>삭제</button>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: '14px' }}>₩ {formatPrice((item.sale_price || item.price) * item.quantity)}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* 주문 요약 */}
            <div style={{ borderTop: '1px solid #333', paddingTop: '32px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                  <span style={{ color: '#888' }}>상품 금액</span>
                  <span>₩ {formatPrice(totalAmount)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                  <span style={{ color: '#888' }}>배송비</span>
                  <span>{shippingFee === 0 ? '무료' : `₩ ${formatPrice(shippingFee)}`}</span>
                </div>
                {totalAmount < 50000 && (
                  <p style={{ fontSize: '12px', color: '#666' }}>₩ {formatPrice(50000 - totalAmount)} 더 구매 시 무료배송</p>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', paddingTop: '16px', borderTop: '1px solid #333' }}>
                  <span>총 결제 금액</span>
                  <span>₩ {formatPrice(finalAmount)}</span>
                </div>
              </div>
              <button
                onClick={() => navigate('/checkout')}
                style={{ width: '100%', padding: '16px', background: '#fff', color: '#000', fontSize: '14px', letterSpacing: '0.2em', border: 'none', cursor: 'pointer' }}
              >
                주문하기
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default Cart
