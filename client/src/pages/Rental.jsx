import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'
import ScrollIndicator from '../components/ScrollIndicator'

function Rental() {
  const navigate = useNavigate()
  const contentRef = useRef(null)
  const [rentableProducts, setRentableProducts] = useState([])
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    workName: '',
    rentalPeriod: '',
    purpose: '',
    message: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    const fetchRentableProducts = async () => {
      try {
        const response = await api.get('/products/rentable')
        setRentableProducts(response.data.products || [])
      } catch (error) {
        // error silently handled
      }
    }
    fetchRentableProducts()
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await api.post('/rental/inquiry', formData)
      setSubmitted(true)
    } catch (error) {
      alert(error.response?.data?.error || '문의 제출에 실패했습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const inputStyle = { width: '100%', background: 'transparent', border: '1px solid #333', padding: '12px 16px', fontSize: '14px', color: '#fff' }

  return (
    <div>
      {/* 히어로 섹션 */}
      <section className="hero-section" style={{
        height: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundImage: 'url(/images/rental_main.jpeg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        position: 'relative',
      }}>
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.4)',
          }}
        />
        <div style={{ textAlign: 'center', position: 'relative', zIndex: 1, padding: '0 20px' }}>
          <p style={{ fontSize: '12px', letterSpacing: '0.4em', color: '#ccc', marginBottom: '24px' }}>FOR BUSINESS</p>
          <h1 className="hero-title" style={{ fontWeight: 200, letterSpacing: '0.2em', marginBottom: '24px', color: '#fff' }}>RENTAL SERVICE</h1>
          <p style={{ color: '#ccc' }}>공간에 자연을 더하는 테라리움 렌탈 서비스</p>
        </div>
        <ScrollIndicator onClick={() => contentRef.current?.scrollIntoView({ behavior: 'smooth' })} />
      </section>

      {/* 렌트 가능 상품 갤러리 */}
      {rentableProducts.length > 0 && (
        <section ref={contentRef} className="responsive-section">
          <div className="responsive-container">
            <div style={{ textAlign: 'center', marginBottom: '64px' }}>
              <p style={{ fontSize: '12px', letterSpacing: '0.4em', color: '#888', marginBottom: '16px' }}>AVAILABLE WORKS</p>
              <h2 className="section-title" style={{ fontWeight: 200, letterSpacing: '0.15em' }}>Rental Works</h2>
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '32px',
            }}>
              {rentableProducts.map((product, index) => (
                <div
                  key={product.id}
                  onClick={() => navigate(`/product/${product.id}`)}
                  style={{ cursor: 'pointer' }}
                >
                  <div style={{
                    aspectRatio: '1',
                    overflow: 'hidden',
                    marginBottom: '16px',
                    border: '1px solid #222',
                  }}>
                    {product.thumbnail ? (
                      <img
                        src={product.thumbnail}
                        alt={`Rental Work ${index + 1}`}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          transition: 'transform 0.5s ease',
                        }}
                        onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                        onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                      />
                    ) : (
                      <div style={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: '#111',
                        color: '#555',
                        fontSize: '14px',
                      }}>
                        No Image
                      </div>
                    )}
                  </div>
                  <p style={{
                    fontSize: '14px',
                    fontWeight: 300,
                    letterSpacing: '0.15em',
                    color: '#ccc',
                    textAlign: 'center',
                  }}>
                    Rental Work {index + 1}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 문의 폼 */}
      <section ref={rentableProducts.length === 0 ? contentRef : undefined} className="responsive-section" style={{ background: '#0a0a0a' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <p style={{ fontSize: '12px', letterSpacing: '0.4em', color: '#888', marginBottom: '16px' }}>INQUIRY</p>
            <h2 className="section-title" style={{ fontWeight: 200, letterSpacing: '0.15em' }}>렌탈 문의하기</h2>
          </div>

          {submitted ? (
            <div style={{ textAlign: 'center', padding: '64px 0' }}>
              <p style={{ fontSize: '20px', fontWeight: 300, marginBottom: '16px' }}>문의가 접수되었습니다</p>
              <p style={{ color: '#888' }}>빠른 시일 내에 연락드리겠습니다.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#888', marginBottom: '8px' }}>이름 *</label>
                  <input type="text" name="name" value={formData.name} onChange={handleChange} required style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#888', marginBottom: '8px' }}>이메일 *</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} required style={inputStyle} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#888', marginBottom: '8px' }}>연락처 *</label>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#888', marginBottom: '8px' }}>작품명(번호)</label>
                  <input type="text" name="workName" value={formData.workName} onChange={handleChange} placeholder="예: Rental Work 1" style={inputStyle} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#888', marginBottom: '8px' }}>렌탈 기간</label>
                  <input type="text" name="rentalPeriod" value={formData.rentalPeriod} onChange={handleChange} placeholder="예: 3개월" style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#888', marginBottom: '8px' }}>용도</label>
                  <input type="text" name="purpose" value={formData.purpose} onChange={handleChange} placeholder="예: 카페 인테리어" style={inputStyle} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#888', marginBottom: '8px' }}>문의 내용</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={5}
                  placeholder="궁금한 점을 자유롭게 작성해주세요."
                  style={{ ...inputStyle, resize: 'none' }}
                />
              </div>
              <div style={{ textAlign: 'center', paddingTop: '16px' }}>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    border: '1px solid #fff',
                    background: 'transparent',
                    color: '#fff',
                    padding: '16px 48px',
                    fontSize: '12px',
                    letterSpacing: '0.3em',
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    opacity: isSubmitting ? 0.5 : 1,
                  }}
                >
                  {isSubmitting ? 'SUBMITTING...' : 'SUBMIT'}
                </button>
              </div>
            </form>
          )}
        </div>
      </section>
    </div>
  )
}

export default Rental
