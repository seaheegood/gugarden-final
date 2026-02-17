import { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import api from '../api'
import ScrollIndicator from '../components/ScrollIndicator'

const categoryInfo = {
  terrarium: {
    title: 'TERRARIUM',
    subtitle: '밀폐된 유리 안의 작은 생태계',
    description: '테라리움은 밀폐된 유리 용기 안에서 자체적인 생태계를 형성하는 작은 정원입니다. 최소한의 관리로 자연의 아름다움을 오래도록 즐길 수 있습니다.',
    image: '/images/terrarium_main.jpeg',
  },
  vivarium: {
    title: 'VIVARIUM',
    subtitle: '살아있는 자연을 담은 공간',
    description: '비바리움은 식물과 동물이 함께 어우러진 살아있는 생태 공간입니다. 열대 우림부터 사막까지, 다양한 자연 환경을 재현합니다.',
    image: '/images/vivarium_main.jpeg',
  },
  paludarium: {
    title: 'PALUDARIUM',
    subtitle: '육지와 수중이 만나는 자연',
    description: '팔루다리움은 육지와 수중 환경이 결합된 독특한 생태계입니다. 물과 땅이 어우러진 자연의 조화를 경험할 수 있습니다.',
    image: '/images/paludarium_main.jpeg',
  },
  elements: {
    title: 'ELEMENTS',
    subtitle: '테라리움을 구성하는 재료와 소품',
    description: '테라리움 제작에 필요한 다양한 재료와 소품을 만나보세요. 용기, 식물, 토양, 장식 등 모든 구성 요소를 갖추고 있습니다.',
    image: '/images/elements_main.jpeg',
  },
}

function ProductList() {
  const location = useLocation()
  const category = location.pathname.replace('/', '')
  const [products, setProducts] = useState([])
  const [sortBy, setSortBy] = useState('newest')
  const [loading, setLoading] = useState(true)

  const contentRef = useRef(null)
  const info = categoryInfo[category] || categoryInfo.terrarium

  useEffect(() => {
    fetchProducts()
  }, [category])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/products/category/${category}`)
      setProducts(response.data.products)
    } catch (error) {
      console.error('상품 목록 조회 에러:', error)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  const sortedProducts = [...products].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return (a.sale_price || a.price) - (b.sale_price || b.price)
      case 'price-high':
        return (b.sale_price || b.price) - (a.sale_price || a.price)
      default:
        return new Date(b.created_at) - new Date(a.created_at)
    }
  })

  const formatPrice = (price) => {
    return new Intl.NumberFormat('ko-KR').format(price)
  }

  return (
    <div style={{ background: '#000', minHeight: '100vh' }}>
      {/* 히어로 섹션 - 이미지가 있는 카테고리만 표시 */}
      {info.image ? (
        <>
          <section className="hero-section" style={{
            height: '80vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundImage: `url(${info.image})`,
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
              <h1 className="hero-title" style={{ fontWeight: 200, letterSpacing: '0.3em', marginBottom: '16px', color: '#fff' }}>
                {info.title}
              </h1>
              <p style={{ color: '#ccc', letterSpacing: '0.1em' }}>{info.subtitle}</p>
            </div>
            <ScrollIndicator onClick={() => contentRef.current?.scrollIntoView({ behavior: 'smooth' })} />
          </section>

          {/* 소개 */}
          <section ref={contentRef} className="responsive-section" style={{ borderBottom: '1px solid #222' }}>
            <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
              <p style={{ color: '#888', lineHeight: 1.8 }}>{info.description}</p>
            </div>
          </section>
        </>
      ) : (
        /* 히어로 이미지 없는 카테고리 - 타이틀만 표시 */
        <section style={{ paddingTop: '140px', paddingBottom: '48px', textAlign: 'center', borderBottom: '1px solid #222' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 200, letterSpacing: '0.3em', marginBottom: '16px', color: '#fff' }}>
            {info.title}
          </h1>
          <p style={{ color: '#888', letterSpacing: '0.1em', marginBottom: '24px' }}>{info.subtitle}</p>
          <p style={{ color: '#666', lineHeight: 1.8, maxWidth: '800px', margin: '0 auto', padding: '0 20px' }}>{info.description}</p>
        </section>
      )}

      {/* 상품 목록 */}
      <section className="responsive-section">
        <div className="responsive-container">
          {/* 필터 & 정렬 */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '48px', paddingBottom: '24px', borderBottom: '1px solid #222' }}>
            <p style={{ fontSize: '14px', color: '#888' }}>
              {loading ? '로딩 중...' : `${products.length}개의 상품`}
            </p>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                background: 'transparent',
                border: '1px solid #333',
                padding: '8px 32px 8px 16px',
                fontSize: '14px',
                color: '#fff',
                cursor: 'pointer',
                appearance: 'none',
                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23888888' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                backgroundPosition: 'right 10px center',
                backgroundRepeat: 'no-repeat',
                backgroundSize: '16px 16px',
              }}
            >
              <option value="newest" style={{ background: '#000' }}>최신순</option>
              <option value="price-low" style={{ background: '#000' }}>가격 낮은순</option>
              <option value="price-high" style={{ background: '#000' }}>가격 높은순</option>
            </select>
          </div>

          {/* 상품 그리드 */}
          {!loading && sortedProducts.length > 0 && (
            <div className="grid-4">
              {sortedProducts.map((product) => (
                <Link key={product.id} to={`/product/${product.id}`} className="product-card" style={{ display: 'block' }}>
                  <div className="product-image-wrap" style={{ aspectRatio: '1/1', background: '#1a1a1a', position: 'relative', marginBottom: '16px' }}>
                    {product.thumbnail && (
                      <img
                        src={product.thumbnail}
                        alt={product.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: product.stock === 0 ? 0.3 : 1, transition: 'opacity 0.3s' }}
                      />
                    )}
                    {product.sale_price && product.stock !== 0 && (
                      <span style={{ position: 'absolute', top: '12px', left: '12px', background: '#fff', color: '#000', fontSize: '10px', padding: '4px 8px', letterSpacing: '0.1em' }}>
                        SALE
                      </span>
                    )}
                    {product.stock === 0 && (
                      <span style={{ position: 'absolute', bottom: '12px', right: '12px', background: 'rgba(0,0,0,0.8)', color: '#fff', fontSize: '11px', padding: '6px 12px', letterSpacing: '0.15em', fontWeight: 500 }}>
                        SOLD OUT
                      </span>
                    )}
                  </div>
                  <h3 style={{ fontSize: '14px', marginBottom: '8px' }}>{product.name}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {product.sale_price ? (
                      <>
                        <span style={{ fontSize: '14px' }}>₩ {formatPrice(product.sale_price)}</span>
                        <span style={{ fontSize: '12px', color: '#666', textDecoration: 'line-through' }}>
                          ₩ {formatPrice(product.price)}
                        </span>
                      </>
                    ) : (
                      <span style={{ fontSize: '14px', color: '#888' }}>₩ {formatPrice(product.price)}</span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* 로딩 */}
          {loading && (
            <div className="grid-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i}>
                  <div style={{ aspectRatio: '1/1', background: '#1a1a1a', marginBottom: '16px' }} />
                  <div style={{ height: '16px', background: '#1a1a1a', width: '75%', marginBottom: '8px' }} />
                  <div style={{ height: '12px', background: '#1a1a1a', width: '50%' }} />
                </div>
              ))}
            </div>
          )}

          {/* 상품이 없을 때 */}
          {!loading && products.length === 0 && (
            <div style={{ textAlign: 'center', padding: '100px 0' }}>
              <p style={{ color: '#888', marginBottom: '24px' }}>등록된 상품이 없습니다.</p>
              <Link to="/" style={{ border: '1px solid #444', padding: '12px 32px', fontSize: '12px', letterSpacing: '0.2em', color: '#888' }}>
                홈으로 돌아가기
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

export default ProductList
