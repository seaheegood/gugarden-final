import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import api from '../api'

function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [addingToCart, setAddingToCart] = useState(false)

  useEffect(() => {
    fetchProduct()
  }, [id])

  const fetchProduct = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/products/${id}`)
      setProduct(response.data.product)
    } catch (err) {
      setError('상품을 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('ko-KR').format(price)
  }

  const handleAddToCart = async () => {
    try {
      setAddingToCart(true)
      await api.post('/cart', { productId: id, quantity })
      if (confirm('장바구니에 추가되었습니다. 장바구니로 이동하시겠습니까?')) {
        navigate('/cart')
      }
    } catch (err) {
      if (err.response?.status === 401) {
        if (confirm('로그인이 필요합니다. 로그인 페이지로 이동하시겠습니까?')) {
          navigate('/login')
        }
      } else {
        alert('장바구니 추가에 실패했습니다.')
      }
    } finally {
      setAddingToCart(false)
    }
  }

  const handleBuyNow = async () => {
    try {
      await api.post('/cart', { productId: id, quantity })
      navigate('/checkout')
    } catch (err) {
      if (err.response?.status === 401) {
        if (confirm('로그인이 필요합니다. 로그인 페이지로 이동하시겠습니까?')) {
          navigate('/login')
        }
      } else {
        alert('오류가 발생했습니다.')
      }
    }
  }

  if (loading) {
    return (
      <div style={{ paddingTop: '80px', minHeight: '100vh', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#888' }}>로딩 중...</p>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div style={{ paddingTop: '80px', minHeight: '100vh', background: '#000', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#888', marginBottom: '24px' }}>{error || '상품을 찾을 수 없습니다.'}</p>
        <Link to="/" style={{ border: '1px solid #444', padding: '12px 32px', fontSize: '12px', letterSpacing: '0.2em', color: '#888' }}>
          홈으로 돌아가기
        </Link>
      </div>
    )
  }

  const images = [product.thumbnail, ...(product.images || []).map((img) => img.image_url)].filter(Boolean)
  const discountPercent = product.sale_price ? Math.round((1 - product.sale_price / product.price) * 100) : 0

  return (
    <div style={{ paddingTop: '80px', background: '#000', minHeight: '100vh' }}>
      {/* 브레드크럼 */}
      <div className="responsive-container" style={{ paddingTop: '24px', paddingBottom: '24px' }}>
        <nav style={{ fontSize: '12px', color: '#666', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Link to="/">HOME</Link>
          <span>/</span>
          <Link to={`/${product.category_slug}`} style={{ textTransform: 'uppercase' }}>{product.category_slug}</Link>
          <span>/</span>
          <span style={{ color: '#888' }}>{product.name}</span>
        </nav>
      </div>

      {/* 상품 정보 */}
      <div className="responsive-container" style={{ paddingTop: '32px', paddingBottom: '32px' }}>
        <div className="grid-2">
          {/* 이미지 섹션 */}
          <div>
            <div style={{ aspectRatio: '1/1', background: '#1a1a1a', position: 'relative', marginBottom: '16px' }}>
              {images[selectedImage] && (
                <img src={images[selectedImage]} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              )}
              {product.sale_price && (
                <span style={{ position: 'absolute', top: '16px', left: '16px', background: '#fff', color: '#000', fontSize: '12px', padding: '6px 12px', letterSpacing: '0.1em' }}>
                  {discountPercent}% OFF
                </span>
              )}
            </div>
            {images.length > 1 && (
              <div style={{ display: 'flex', gap: '8px' }}>
                {images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    style={{
                      width: '80px',
                      height: '80px',
                      background: '#1a1a1a',
                      border: selectedImage === index ? '2px solid #fff' : '2px solid transparent',
                      padding: 0,
                      cursor: 'pointer',
                    }}
                  >
                    <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 정보 섹션 */}
          <div style={{ paddingTop: '16px' }}>
            <p style={{ fontSize: '12px', letterSpacing: '0.3em', color: '#666', marginBottom: '16px', textTransform: 'uppercase' }}>
              {product.category_name}
            </p>
            <h1 style={{ fontSize: '28px', fontWeight: 300, letterSpacing: '0.1em', marginBottom: '32px' }}>
              {product.name}
            </h1>

            {/* 가격 */}
            <div style={{ marginBottom: '40px', paddingBottom: '40px', borderBottom: '1px solid #333' }}>
              {product.sale_price ? (
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '16px' }}>
                  <span style={{ fontSize: '28px', fontWeight: 300 }}>₩ {formatPrice(product.sale_price)}</span>
                  <span style={{ fontSize: '18px', color: '#666', textDecoration: 'line-through' }}>₩ {formatPrice(product.price)}</span>
                </div>
              ) : (
                <span style={{ fontSize: '28px', fontWeight: 300 }}>₩ {formatPrice(product.price)}</span>
              )}
            </div>

            {/* 설명 */}
            {product.description && (
              <div style={{ marginBottom: '40px' }}>
                <p style={{ color: '#888', lineHeight: 1.8, whiteSpace: 'pre-line' }}>{product.description}</p>
              </div>
            )}

            {/* 수량 선택 */}
            <div style={{ marginBottom: '32px' }}>
              <label style={{ display: 'block', fontSize: '12px', letterSpacing: '0.2em', color: '#888', marginBottom: '16px' }}>QUANTITY</label>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  style={{ width: '48px', height: '48px', border: '1px solid #333', background: 'transparent', color: '#888', cursor: 'pointer', fontSize: '18px' }}
                >
                  -
                </button>
                <span style={{ width: '64px', textAlign: 'center', fontSize: '18px' }}>{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock || 99, quantity + 1))}
                  style={{ width: '48px', height: '48px', border: '1px solid #333', background: 'transparent', color: '#888', cursor: 'pointer', fontSize: '18px' }}
                >
                  +
                </button>
              </div>
            </div>

            {/* 재고 상태 */}
            <div style={{ marginBottom: '32px' }}>
              {product.stock === 0 ? (
                <span style={{ fontSize: '14px', color: '#ff4444' }}>품절</span>
              ) : product.stock < 5 ? (
                <span style={{ fontSize: '14px', color: '#ffaa00' }}>재고 {product.stock}개 남음</span>
              ) : (
                <span style={{ fontSize: '14px', color: '#666' }}>재고 {product.stock}개</span>
              )}
            </div>

            {/* 버튼 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0 || addingToCart}
                style={{
                  width: '100%',
                  padding: '16px',
                  border: '1px solid #fff',
                  background: 'transparent',
                  color: '#fff',
                  fontSize: '14px',
                  letterSpacing: '0.2em',
                  cursor: product.stock === 0 ? 'not-allowed' : 'pointer',
                  opacity: product.stock === 0 ? 0.3 : 1,
                }}
              >
                {addingToCart ? '추가 중...' : '장바구니 담기'}
              </button>
              <button
                onClick={handleBuyNow}
                disabled={product.stock === 0}
                style={{
                  width: '100%',
                  padding: '16px',
                  border: 'none',
                  background: '#fff',
                  color: '#000',
                  fontSize: '14px',
                  letterSpacing: '0.2em',
                  cursor: product.stock === 0 ? 'not-allowed' : 'pointer',
                  opacity: product.stock === 0 ? 0.3 : 1,
                }}
              >
                바로 구매
              </button>
            </div>

            {/* 추가 정보 */}
            <div style={{ marginTop: '48px', paddingTop: '32px', borderTop: '1px solid #333' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#888' }}>
                  <span>배송비</span>
                  <span>3,000원 (50,000원 이상 무료)</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#888' }}>
                  <span>배송기간</span>
                  <span>주문 후 2-3일 이내</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#888' }}>
                  <span>교환/반품</span>
                  <span>수령 후 7일 이내</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductDetail
