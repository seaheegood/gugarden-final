import { useRef } from 'react'
import ScrollIndicator from '../components/ScrollIndicator'

function Ando() {
  const contentRef = useRef(null)
  const classes = [
    {
      title: "데일리 테라리움 클래스 (소)",
      price: "35,000원",
    },
    {
      title: "데일리 테라리움 클래스 (중)",
      price: "60,000원",
    },
  ];

  const products = [
    {
      title: "미니 테라리움 완성품",
      price: "12,000원",
    },
    {
      title: "원형 테라리움 완성품",
      price: "32,000원",
    },
    {
      title: "사각 테라리움 완성품",
      price: "30,000원",
    },
  ];

  const customOrders = [
    {
      title: "비바리움 주문 제작",
      price: "변동",
    },
    {
      title: "팔루다리움 주문제작",
      price: "변동",
    },
  ];

  const materials = [
    {
      title: "비단이끼 소분",
      price: "5,000원",
    },
  ];

  const studioImages = [
    { id: 1, alt: "작업실 전경" },
    { id: 2, alt: "작업 공간" },
    { id: 3, alt: "작품 전시" },
    { id: 4, alt: "원데이 클래스 진행 모습" },
  ];

  return (
    <div>
      {/* 히어로 섹션 */}
      <section
        className="hero-section"
        style={{
          height: "80vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundImage: "url(/images/ando_main.jpeg)",
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
        <div
          style={{
            textAlign: "center",
            position: "relative",
            zIndex: 1,
            padding: "0 20px",
          }}
        >
          <p
            style={{
              fontSize: "12px",
              letterSpacing: "0.4em",
              color: "#ccc",
              marginBottom: "24px",
            }}
          >
            STUDIO
          </p>
          <h1
            className="hero-title"
            style={{
              fontWeight: 200,
              letterSpacing: "0.2em",
              marginBottom: "24px",
              color: "#fff",
            }}
          >
            ANDO
          </h1>
          <p style={{ color: "#ccc" }}>구의정원 작가의 작업실</p>
        </div>
        <ScrollIndicator onClick={() => contentRef.current?.scrollIntoView({ behavior: 'smooth' })} />
      </section>

      {/* 소개 섹션 */}
      <section ref={contentRef} className="responsive-section">
        <div
          style={{ maxWidth: "800px", margin: "0 auto", textAlign: "center" }}
        >
          <h2
            className="section-title-large"
            style={{ fontWeight: 200, marginBottom: "32px", lineHeight: 1.6 }}
          >
            자연과 함께하는
            <br />
            창작의 공간
          </h2>
          <p style={{ color: "#888", lineHeight: 1.8 }}>
            ANDO는 구의정원 작가의 작업실로, 테라리움과 비바리움 작품이 탄생하는
            곳입니다. 이곳에서는 원데이 클래스를 통해 직접 작은 정원을
            만들어보실 수 있습니다.
          </p>
        </div>
      </section>

      {/* 클래스 & 작품 메뉴 */}
      <section className="responsive-section" style={{ background: "#0a0a0a" }}>
        <div className="responsive-container">
          {/* 데일리 클래스 */}
          <div style={{ marginBottom: "80px" }}>
            <div style={{ textAlign: "center", marginBottom: "48px" }}>
              <p
                style={{
                  fontSize: "12px",
                  letterSpacing: "0.4em",
                  color: "#888",
                  marginBottom: "16px",
                }}
              >
                DAILY CLASS
              </p>
              <h2
                className="section-title"
                style={{ fontWeight: 200, letterSpacing: "0.15em" }}
              >
                데일리 클래스
              </h2>
            </div>
            <div
              className="grid-2"
              style={{ maxWidth: "800px", margin: "0 auto" }}
            >
              {classes.map((item, index) => (
                <div
                  key={index}
                  style={{
                    padding: "32px",
                    border: "1px solid #333",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <h3
                    style={{
                      fontSize: "16px",
                      fontWeight: 300,
                      letterSpacing: "0.05em",
                    }}
                  >
                    {item.title}
                  </h3>
                  <p style={{ fontSize: "18px", fontWeight: 300 }}>
                    {item.price}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* 완성품 */}
          <div style={{ marginBottom: "80px" }}>
            <div style={{ textAlign: "center", marginBottom: "48px" }}>
              <p
                style={{
                  fontSize: "12px",
                  letterSpacing: "0.4em",
                  color: "#888",
                  marginBottom: "16px",
                }}
              >
                READY-MADE
              </p>
              <h2
                className="section-title"
                style={{ fontWeight: 200, letterSpacing: "0.15em" }}
              >
                완성품
              </h2>
            </div>
            <div className="grid-3">
              {products.map((item, index) => (
                <div
                  key={index}
                  style={{
                    padding: "32px",
                    border: "1px solid #333",
                    textAlign: "center",
                  }}
                >
                  <h3
                    style={{
                      fontSize: "16px",
                      fontWeight: 300,
                      letterSpacing: "0.05em",
                      marginBottom: "16px",
                    }}
                  >
                    {item.title}
                  </h3>
                  <p style={{ fontSize: "18px", fontWeight: 300 }}>
                    {item.price}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* 주문 제작 */}
          <div style={{ marginBottom: "80px" }}>
            <div style={{ textAlign: "center", marginBottom: "48px" }}>
              <p
                style={{
                  fontSize: "12px",
                  letterSpacing: "0.4em",
                  color: "#888",
                  marginBottom: "16px",
                }}
              >
                CUSTOM ORDER
              </p>
              <h2
                className="section-title"
                style={{ fontWeight: 200, letterSpacing: "0.15em" }}
              >
                주문 제작
              </h2>
            </div>
            <div
              className="grid-2"
              style={{ maxWidth: "800px", margin: "0 auto" }}
            >
              {customOrders.map((item, index) => (
                <div
                  key={index}
                  style={{
                    padding: "32px",
                    border: "1px solid #333",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <h3
                    style={{
                      fontSize: "16px",
                      fontWeight: 300,
                      letterSpacing: "0.05em",
                    }}
                  >
                    {item.title}
                  </h3>
                  <p
                    style={{ fontSize: "18px", fontWeight: 300, color: "#888" }}
                  >
                    {item.price}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* 재료 */}
          <div>
            <div style={{ textAlign: "center", marginBottom: "48px" }}>
              <p
                style={{
                  fontSize: "12px",
                  letterSpacing: "0.4em",
                  color: "#888",
                  marginBottom: "16px",
                }}
              >
                MATERIALS
              </p>
              <h2
                className="section-title"
                style={{ fontWeight: 200, letterSpacing: "0.15em" }}
              >
                재료
              </h2>
            </div>
            <div style={{ maxWidth: "400px", margin: "0 auto" }}>
              {materials.map((item, index) => (
                <div
                  key={index}
                  style={{
                    padding: "32px",
                    border: "1px solid #333",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <h3
                    style={{
                      fontSize: "16px",
                      fontWeight: 300,
                      letterSpacing: "0.05em",
                    }}
                  >
                    {item.title}
                  </h3>
                  <p style={{ fontSize: "18px", fontWeight: 300 }}>
                    {item.price}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div style={{ textAlign: "center", marginTop: "64px" }}>
            <p style={{ fontSize: "14px", color: "#888", lineHeight: 1.8 }}>
              클래스 예약 및 주문 제작 문의는
              <br />
              인스타그램 DM으로 연락 부탁드립니다.
            </p>
          </div>
        </div>
      </section>

      {/* 위치 */}
      <section className="responsive-section" style={{ background: "#0a0a0a" }}>
        <div className="responsive-container">
          <div style={{ textAlign: "center", marginBottom: "64px" }}>
            <p
              style={{
                fontSize: "12px",
                letterSpacing: "0.4em",
                color: "#888",
                marginBottom: "16px",
              }}
            >
              LOCATION
            </p>
            <h2
              className="section-title"
              style={{ fontWeight: 200, letterSpacing: "0.15em" }}
            >
              오시는 길
            </h2>
          </div>
          <div className="grid-2" style={{ alignItems: "center" }}>
            <div>
              <div style={{ marginBottom: "24px" }}>
                <p
                  style={{
                    fontSize: "12px",
                    color: "#888",
                    marginBottom: "8px",
                  }}
                >
                  주소
                </p>
                <p style={{ fontSize: "16px", lineHeight: 1.6 }}>
                  경기 고양시 일산동구 호수로446번길 8-14
                  <br />
                  1층 101호
                </p>
              </div>
              <div>
                <p
                  style={{
                    fontSize: "12px",
                    color: "#888",
                    marginBottom: "8px",
                  }}
                >
                  주차
                </p>
                <p style={{ fontSize: "14px", color: "#888", lineHeight: 1.6 }}>
                  작업실 앞 1대 가능
                </p>
              </div>
            </div>
            <div
              style={{
                width: "100%",
                height: "400px",
                background: "#1a1a1a",
                border: "1px solid #333",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {/* 네이버 지도 iframe */}
              <iframe
                src="https://map.naver.com/p/entry/place/2002609344?c=15.00,0,0,0,dh"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                title="작업실 위치"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 문의 섹션 */}
      <section className="responsive-section">
        <div
          style={{ maxWidth: "600px", margin: "0 auto", textAlign: "center" }}
        >
          <h3
            style={{ fontSize: "20px", fontWeight: 300, marginBottom: "24px" }}
          >
            방문 예약 및 문의
          </h3>
          <p style={{ color: "#888", lineHeight: 1.8, marginBottom: "32px" }}>
            작업실 방문은 예약제로 운영됩니다.
            <br />
            원데이 클래스 예약 및 작업실 방문 문의는 인스타그램 DM으로
            부탁드립니다.
          </p>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "16px" }}
          >
            <div>
              <p
                style={{ fontSize: "12px", color: "#888", marginBottom: "8px" }}
              >
                Instagram DM
              </p>
              <a
                href="https://www.instagram.com/gu.garden/"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontSize: "16px",
                  color: "#fff",
                  textDecoration: "none",
                }}
              >
                @gu.garden
              </a>
            </div>
            <div>
              <p
                style={{ fontSize: "12px", color: "#888", marginBottom: "8px" }}
              >
                Tel
              </p>
              <a
                href="tel:0507-1424-7573"
                style={{
                  fontSize: "16px",
                  color: "#fff",
                  textDecoration: "none",
                }}
              >
                0507-1424-7573
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Ando;
