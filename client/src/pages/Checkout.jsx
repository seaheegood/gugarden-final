import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api'

const TOSS_CLIENT_KEY = import.meta.env.VITE_TOSS_CLIENT_KEY || 'test_ck_D5GePWvyJnrK0W0k6q8gLzN97Eoq'

function Checkout() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [items, setItems] = useState([])
  const [totalAmount, setTotalAmount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('naverpay')

  const [formData, setFormData] = useState({
    recipientName: '',
    recipientPhone: '',
    recipientZipcode: '',
    recipientAddress: '',
    recipientAddressDetail: '',
    memo: '',
    sameAsUser: false,
  })

  useEffect(() => {
    fetchCart()
  }, [])

  useEffect(() => {
    if (user && formData.sameAsUser) {
      setFormData((prev) => ({
        ...prev,
        recipientName: user.name || '',
        recipientPhone: user.phone || '',
        recipientZipcode: user.zipcode || '',
        recipientAddress: user.address || '',
        recipientAddressDetail: user.address_detail || '',
      }))
    }
  }, [user, formData.sameAsUser])

  const fetchCart = async () => {
    try {
      const response = await api.get('/cart')
      if (response.data.items.length === 0) {
        navigate('/cart')
        return
      }
      setItems(response.data.items)
      setTotalAmount(response.data.totalAmount)
    } catch (error) {
      navigate('/cart')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.recipientName || !formData.recipientPhone || !formData.recipientAddress) {
      alert('배송 정보를 모두 입력해주세요.')
      return
    }
    setSubmitting(true)
    try {
      // 주문 생성
      const orderResponse = await api.post('/orders', {
        recipientName: formData.recipientName,
        recipientPhone: formData.recipientPhone,
        recipientZipcode: formData.recipientZipcode,
        recipientAddress: formData.recipientAddress,
        recipientAddressDetail: formData.recipientAddressDetail,
        memo: formData.memo,
        paymentMethod: paymentMethod === 'toss' ? 'toss' : 'naverpay',
      })
      const orderId = orderResponse.data.orderId

      if (paymentMethod === 'naverpay') {
        // 네이버페이 결제
        const paymentResponse = await api.post('/payments/prepare', { orderId })
        if (paymentResponse.data.testMode) {
          const approveResponse = await api.post('/payments/approve', { orderId })
          if (approveResponse.data.success) {
            navigate(`/payment/complete?orderId=${orderId}`)
          } else {
            alert(approveResponse.data.error || '결제 승인에 실패했습니다.')
          }
        } else if (paymentResponse.data.paymentUrl) {
          window.location.href = paymentResponse.data.paymentUrl
        }
      } else if (paymentMethod === 'toss') {
        // 토스페이먼츠 결제
        const paymentResponse = await api.post('/payments/toss/prepare', { orderId })

        if (paymentResponse.data.testMode) {
          // 테스트 모드: 바로 결제 완료 처리
          const confirmResponse = await api.post('/payments/toss/confirm', {
            orderId,
            paymentKey: 'test_payment_key',
            amount: paymentResponse.data.amount
          })
          if (confirmResponse.data.success) {
            navigate(`/payment/complete?orderId=${orderId}`)
          } else {
            alert(confirmResponse.data.error || '결제 승인에 실패했습니다.')
          }
        } else {
          // 토스페이먼츠 SDK로 결제창 호출
          const tossPayments = window.TossPayments(TOSS_CLIENT_KEY)
          const clientUrl = import.meta.env.VITE_CLIENT_URL || window.location.origin

          await tossPayments.requestPayment('카드', {
            amount: paymentResponse.data.amount,
            orderId: paymentResponse.data.orderNumber,
            orderName: paymentResponse.data.orderName,
            customerName: paymentResponse.data.customerName,
            customerEmail: paymentResponse.data.customerEmail,
            successUrl: `${clientUrl}/payment/toss/success?orderId=${orderId}`,
            failUrl: `${clientUrl}/payment/toss/fail?orderId=${orderId}`
          })
        }
      }
    } catch (error) {
      alert(error.response?.data?.error || '주문에 실패했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('ko-KR').format(price)
  }

  const shippingFee = totalAmount >= 50000 ? 0 : 3000
  const finalAmount = totalAmount + shippingFee

  if (loading) {
    return (
      <div style={{ paddingTop: '80px', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#888' }}>로딩 중...</p>
      </div>
    )
  }

  const inputStyle = { width: '100%', background: 'transparent', border: '1px solid #333', padding: '12px 16px', fontSize: '14px', color: '#fff' }

  return (
    <div style={{ paddingTop: '80px', minHeight: '100vh', background: '#000' }}>
      <div className="responsive-container" style={{ maxWidth: '1000px', paddingTop: '64px', paddingBottom: '64px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 300, letterSpacing: '0.2em', textAlign: 'center', marginBottom: '48px' }}>CHECKOUT</h1>

        <form onSubmit={handleSubmit}>
          <div className="grid-2" style={{ alignItems: 'start' }}>
            {/* 배송 정보 */}
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 300, letterSpacing: '0.1em', marginBottom: '24px' }}>배송 정보</h2>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', cursor: 'pointer' }}>
                <input type="checkbox" name="sameAsUser" checked={formData.sameAsUser} onChange={handleChange} />
                <span style={{ fontSize: '14px', color: '#888' }}>회원 정보와 동일</span>
              </label>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#888', marginBottom: '8px' }}>받는 분 *</label>
                  <input type="text" name="recipientName" value={formData.recipientName} onChange={handleChange} required style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#888', marginBottom: '8px' }}>연락처 *</label>
                  <input type="tel" name="recipientPhone" value={formData.recipientPhone} onChange={handleChange} required placeholder="010-0000-0000" style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#888', marginBottom: '8px' }}>우편번호</label>
                  <input type="text" name="recipientZipcode" value={formData.recipientZipcode} onChange={handleChange} style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#888', marginBottom: '8px' }}>주소 *</label>
                  <input type="text" name="recipientAddress" value={formData.recipientAddress} onChange={handleChange} required style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#888', marginBottom: '8px' }}>상세주소</label>
                  <input type="text" name="recipientAddressDetail" value={formData.recipientAddressDetail} onChange={handleChange} style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#888', marginBottom: '8px' }}>배송 메모</label>
                  <input type="text" name="memo" value={formData.memo} onChange={handleChange} placeholder="배송 시 요청사항" style={inputStyle} />
                </div>
              </div>

              {/* 결제 수단 */}
              <div style={{ marginTop: '48px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 300, letterSpacing: '0.1em', marginBottom: '24px' }}>결제 수단</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {/* 네이버페이 */}
                  <label
                    style={{
                      padding: '16px',
                      border: paymentMethod === 'naverpay' ? '1px solid #03C75A' : '1px solid #333',
                      background: '#0a0a0a',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      cursor: 'pointer'
                    }}
                    onClick={() => setPaymentMethod('naverpay')}
                  >
                    <div style={{
                      width: '20px',
                      height: '20px',
                      border: paymentMethod === 'naverpay' ? '2px solid #03C75A' : '2px solid #666',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {paymentMethod === 'naverpay' && (
                        <div style={{ width: '10px', height: '10px', background: '#03C75A', borderRadius: '50%' }} />
                      )}
                    </div>
                    <div style={{ background: '#03C75A', padding: '6px 12px', borderRadius: '4px' }}>
                      <span style={{ color: '#fff', fontSize: '14px', fontWeight: 'bold' }}>N Pay</span>
                    </div>
                    <span style={{ fontSize: '14px', color: '#ccc' }}>네이버페이</span>
                  </label>

                  {/* 토스페이먼츠 */}
                  <label
                    style={{
                      padding: '16px',
                      border: paymentMethod === 'toss' ? '1px solid #0064FF' : '1px solid #333',
                      background: '#0a0a0a',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      cursor: 'pointer'
                    }}
                    onClick={() => setPaymentMethod('toss')}
                  >
                    <div style={{
                      width: '20px',
                      height: '20px',
                      border: paymentMethod === 'toss' ? '2px solid #0064FF' : '2px solid #666',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {paymentMethod === 'toss' && (
                        <div style={{ width: '10px', height: '10px', background: '#0064FF', borderRadius: '50%' }} />
                      )}
                    </div>
                    <div style={{ background: '#0064FF', padding: '6px 12px', borderRadius: '4px' }}>
                      <span style={{ color: '#fff', fontSize: '14px', fontWeight: 'bold' }}>toss</span>
                    </div>
                    <span style={{ fontSize: '14px', color: '#ccc' }}>토스페이먼츠 (카드)</span>
                  </label>
                </div>
              </div>
            </div>

            {/* 주문 요약 */}
            <div>
              <div className="checkout-summary" style={{ padding: '24px', border: '1px solid #333', background: '#0a0a0a' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 300, letterSpacing: '0.1em', marginBottom: '24px' }}>주문 요약</h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px', paddingBottom: '24px', borderBottom: '1px solid #333' }}>
                  {items.map((item) => (
                    <div key={item.id} style={{ display: 'flex', gap: '12px' }}>
                      <div style={{ width: '48px', height: '48px', background: '#1a1a1a', overflow: 'hidden' }}>
                        <img src={item.thumbnail || '/images/placeholder.jpg'} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: '12px', marginBottom: '4px' }}>{item.name}</p>
                        <p style={{ fontSize: '12px', color: '#888' }}>₩ {formatPrice(item.sale_price || item.price)} x {item.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                    <span style={{ color: '#888' }}>상품 금액</span>
                    <span>₩ {formatPrice(totalAmount)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                    <span style={{ color: '#888' }}>배송비</span>
                    <span>{shippingFee === 0 ? '무료' : `₩ ${formatPrice(shippingFee)}`}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', paddingTop: '12px', borderTop: '1px solid #333' }}>
                    <span>총 결제 금액</span>
                    <span>₩ {formatPrice(finalAmount)}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    width: '100%',
                    padding: '16px',
                    background: '#fff',
                    color: '#000',
                    fontSize: '14px',
                    letterSpacing: '0.2em',
                    border: 'none',
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    opacity: submitting ? 0.5 : 1,
                  }}
                >
                  {submitting ? '처리 중...' : `₩ ${formatPrice(finalAmount)} 결제하기`}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Checkout
