import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api";

function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([]);

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  const fetchFeaturedProducts = async () => {
    try {
      const response = await api.get("/products/featured");
      setFeaturedProducts(response.data.products);
    } catch (error) {
      console.error("피처드 상품 조회 에러:", error);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("ko-KR").format(price);
  };

  return (
    <div>
      {/* 히어로 */}
      <section
        className="hero-section"
        style={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundImage: "url(/images/home_main.jpeg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.4)",
          }}
        />
        <div style={{ textAlign: "center", position: "relative", zIndex: 1, padding: "0 20px" }}>
          <p
            className="hero-subtitle"
            style={{
              letterSpacing: "0.4em",
              color: "#ccc",
              marginBottom: "24px",
            }}
          >
            Nature in Glass
          </p>
          <h1
            className="hero-title"
            style={{
              fontWeight: 200,
              letterSpacing: "0.2em",
              marginBottom: "16px",
              color: "#fff",
            }}
          >
            구의정원
          </h1>
          <p style={{ color: "#ccc", marginBottom: "48px" }}>
            자연을 담은 작은 정원
          </p>
          <Link
            to="/terrarium"
            style={{
              border: "1px solid #fff",
              padding: "12px 40px",
              fontSize: "12px",
              letterSpacing: "0.2em",
              color: "#fff",
            }}
          >
            EXPLORE
          </Link>
        </div>
      </section>

      {/* 소개 */}
      <section className="responsive-section" style={{ background: "#000" }}>
        <div
          style={{ maxWidth: "800px", margin: "0 auto", textAlign: "center" }}
        >
          <h2
            className="section-title"
            style={{
              fontWeight: 200,
              marginBottom: "24px",
              lineHeight: 1.6,
            }}
          >
            유리 안에 담긴 작은 생태계,
            <br />
            자연의 아름다움을 일상으로
          </h2>
          <p style={{ color: "#999", fontSize: "15px", lineHeight: 1.8 }}>
            구의정원은 테라리움과 비바리움을 통해 도시 속에서도 자연과 함께하는
            삶을 제안합니다.
          </p>
        </div>
      </section>

      {/* 카테고리 */}
      <section style={{ padding: "0 20px 60px", paddingTop: 0, background: "#000" }}>
        <div className="responsive-container">
          <p
            style={{
              fontSize: "12px",
              letterSpacing: "0.3em",
              color: "#666",
              marginBottom: "12px",
            }}
          >
            Products
          </p>
          <h2
            className="section-title"
            style={{ fontWeight: 200, marginBottom: "48px" }}
          >
            Our Collection
          </h2>

          <div
            className="grid-3"
          >
            <Link to="/terrarium" style={{ display: "block" }}>
              <div
                style={{
                  aspectRatio: "4/3",
                  backgroundImage: "url(/images/terrarium_main.jpeg)",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  marginBottom: "16px",
                }}
              />
              <h3 style={{ fontSize: "16px", marginBottom: "8px" }}>
                Terrarium
              </h3>
              <p style={{ fontSize: "13px", color: "#888" }}>
                밀폐된 유리 안의 작은 생태계
              </p>
            </Link>
            <Link to="/vivarium" style={{ display: "block" }}>
              <div
                style={{
                  aspectRatio: "4/3",
                  backgroundImage: "url(/images/vivarium_main.jpeg)",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  marginBottom: "16px",
                }}
              />
              <h3 style={{ fontSize: "16px", marginBottom: "8px" }}>
                Vivarium
              </h3>
              <p style={{ fontSize: "13px", color: "#888" }}>
                살아있는 자연을 담은 공간
              </p>
            </Link>
            <Link to="/kit" style={{ display: "block" }}>
              <div
                style={{
                  aspectRatio: "4/3",
                  backgroundImage: "url(/images/kit_main.jpeg)",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  marginBottom: "16px",
                }}
              />
              <h3 style={{ fontSize: "16px", marginBottom: "8px" }}>Kit</h3>
              <p style={{ fontSize: "13px", color: "#888" }}>
                직접 만드는 나만의 정원
              </p>
            </Link>
          </div>
        </div>
      </section>

      {/* 피처드 상품 - 상품이 있을 때만 표시 */}
      {featuredProducts.length > 0 && (
        <section className="responsive-section" style={{ background: "#0a0a0a" }}>
          <div className="responsive-container">
            <p
              style={{
                fontSize: "12px",
                letterSpacing: "0.3em",
                color: "#666",
                marginBottom: "12px",
              }}
            >
              Featured
            </p>
            <h2
              className="section-title"
              style={{ fontWeight: 200, marginBottom: "48px" }}
            >
              Selected Products
            </h2>

            <div className="grid-4">
              {featuredProducts.slice(0, 4).map((product) => (
                <Link
                  key={product.id}
                  to={`/product/${product.id}`}
                  style={{ display: "block" }}
                >
                  <div
                    style={{
                      aspectRatio: "1/1",
                      background: "#1a1a1a",
                      marginBottom: "12px",
                    }}
                  >
                    {product.thumbnail && (
                      <img
                        src={product.thumbnail}
                        alt={product.name}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    )}
                  </div>
                  <h4 style={{ fontSize: "14px", marginBottom: "4px" }}>
                    {product.name}
                  </h4>
                  <p style={{ fontSize: "13px", color: "#888" }}>
                    ₩ {formatPrice(product.sale_price || product.price)}
                  </p>
                </Link>
              ))}
            </div>

            <div style={{ textAlign: "center", marginTop: "64px" }}>
              <Link
                to="/terrarium"
                style={{
                  border: "1px solid #444",
                  padding: "12px 40px",
                  fontSize: "12px",
                  letterSpacing: "0.2em",
                  color: "#888",
                }}
              >
                VIEW ALL PRODUCTS
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* 렌탈 */}
      <section className="responsive-section" style={{ background: "#000" }}>
        <div
          className="responsive-container grid-2"
          style={{
            alignItems: "center",
          }}
        >
          <div
            style={{
              aspectRatio: "4/3",
              backgroundImage: "url(/images/rental_main.jpeg)",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
          <div>
            <p
              style={{
                fontSize: "12px",
                letterSpacing: "0.3em",
                color: "#666",
                marginBottom: "12px",
              }}
            >
              For Business
            </p>
            <h2
              style={{
                fontSize: "24px",
                fontWeight: 200,
                marginBottom: "24px",
              }}
            >
              Rental Service
            </h2>
            <p
              style={{
                fontSize: "15px",
                color: "#999",
                lineHeight: 1.8,
                marginBottom: "32px",
              }}
            >
              여러분의 공간에 자연의 분위기를 더해보세요. 정기적인 관리 서비스와
              함께 공간에 맞는 맞춤 테라리움을 제안합니다.
            </p>
            <Link
              to="/rental"
              style={{
                border: "1px solid #444",
                padding: "12px 32px",
                fontSize: "12px",
                letterSpacing: "0.2em",
                color: "#888",
              }}
            >
              LEARN MORE
            </Link>
          </div>
        </div>
      </section>

      {/* 특징 */}
      <section
        className="responsive-section"
        style={{
          background: "#0a0a0a",
          borderTop: "1px solid #222",
        }}
      >
        <div
          className="responsive-container grid-3"
        >
          <div>
            <h3 style={{ fontSize: "15px", marginBottom: "12px" }}>
              Handcrafted
            </h3>
            <p style={{ fontSize: "14px", color: "#999", lineHeight: 1.7 }}>
              모든 작품은 장인의 손으로 하나하나 정성껏 제작됩니다.
            </p>
          </div>
          <div>
            <h3 style={{ fontSize: "15px", marginBottom: "12px" }}>
              Safe Delivery
            </h3>
            <p style={{ fontSize: "14px", color: "#999", lineHeight: 1.7 }}>
              안전한 포장과 신속한 배송으로 완벽하게 전달합니다.
            </p>
          </div>
          <div>
            <h3 style={{ fontSize: "15px", marginBottom: "12px" }}>
              Care Guide
            </h3>
            <p style={{ fontSize: "14px", color: "#999", lineHeight: 1.7 }}>
              상세한 관리 가이드와 지속적인 케어 상담을 제공합니다.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
