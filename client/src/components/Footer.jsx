import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer style={{ background: "#0a0a0a", borderTop: "1px solid #222" }}>
      <div className="responsive-container">
        {/* 브랜드 로고 */}
        <div style={{ padding: "40px 0 24px" }}>
          <Link
            to="/"
            style={{
              fontSize: "22px",
              fontWeight: 300,
              letterSpacing: "0.3em",
            }}
          >
            구의정원
          </Link>
        </div>

        {/* 네비게이션 링크 */}
        <div
          style={{
            display: "flex",
            gap: "28px",
            flexWrap: "wrap",
            paddingBottom: "28px",
            borderBottom: "1px solid #222",
          }}
        >
          <Link to="/terrarium" style={{ fontSize: "13px", color: "#999" }}>Terrarium</Link>
          <Link to="/vivarium" style={{ fontSize: "13px", color: "#999" }}>Vivarium</Link>
          <Link to="/paludarium" style={{ fontSize: "13px", color: "#999" }}>Paludarium</Link>
          <Link to="/elements" style={{ fontSize: "13px", color: "#999" }}>Elements</Link>
          <Link to="/rental" style={{ fontSize: "13px", color: "#999" }}>Rental</Link>
          <Link to="/ando" style={{ fontSize: "13px", color: "#999" }}>Ando</Link>
        </div>

        {/* 사업자 정보 + 고객센터 + 결제정보 */}
        <div
          className="footer-info-grid"
          style={{ padding: "28px 0" }}
        >
          {/* 쇼핑몰 기본정보 */}
          <div>
            <h4 style={{ fontSize: "13px", fontWeight: 600, color: "#ccc", marginBottom: "14px" }}>
              쇼핑몰 기본정보
            </h4>
            <div style={{ fontSize: "12px", color: "#777", lineHeight: 2 }}>
              <p><span style={{ color: "#999" }}>상호명</span> 안도 &nbsp;&nbsp;<span style={{ color: "#999" }}>성명</span> 김윤구</p>
              <p><span style={{ color: "#999" }}>사업장</span> 경기도 고양시 일산동구 호수로446번길 8-14, 1층 101호(백석동)</p>
              <p><span style={{ color: "#999" }}>대표전화</span> <a href="tel:0507-1424-7573" style={{ color: "#777" }}>0507-1424-7573</a></p>
              <p><span style={{ color: "#999" }}>사업자 등록번호</span> 642-21-02296</p>
            </div>
          </div>

          {/* 고객센터 정보 */}
          <div>
            <h4 style={{ fontSize: "13px", fontWeight: 600, color: "#ccc", marginBottom: "14px" }}>
              고객센터 정보
            </h4>
            <div style={{ fontSize: "12px", color: "#777", lineHeight: 2 }}>
              <p><span style={{ color: "#999" }}>상담/주문 전화</span> &nbsp;<a href="tel:0507-1424-7573" style={{ color: "#777" }}>0507-1424-7573</a></p>
              <p><span style={{ color: "#999" }}>상담/주문 이메일</span></p>
              <p><a href="mailto:koo0403@naver.com" style={{ color: "#777" }}>koo0403@naver.com</a></p>
              <p style={{ marginTop: "4px" }}><span style={{ color: "#999" }}>Instagram</span> &nbsp;<a href="https://www.instagram.com/gu.garden/" target="_blank" rel="noopener noreferrer" style={{ color: "#777" }}>@gu.garden</a></p>
              <p style={{ color: "#666", fontSize: "11px" }}>문의는 인스타그램 DM으로 편하게 보내주세요</p>
            </div>
          </div>

          {/* 결제정보 */}
          <div>
            <h4 style={{ fontSize: "13px", fontWeight: 600, color: "#ccc", marginBottom: "14px" }}>
              결제정보
            </h4>
            <div style={{ fontSize: "12px", color: "#777", lineHeight: 2 }}>
              <p><span style={{ color: "#999" }}>무통장 계좌정보</span></p>
              <p>신한은행 &nbsp;110489326152 &nbsp;김윤구</p>
            </div>
          </div>
        </div>

        {/* 하단 */}
        <div
          className="footer-bottom"
          style={{
            padding: "20px 0",
            borderTop: "1px solid #222",
          }}
        >
          <p style={{ fontSize: "11px", color: "#555", display: "flex", alignItems: "center", flexWrap: "wrap", gap: "4px" }}>
            <span>&copy; 2026 구의정원(안도). All rights reserved.</span>
            <span>&nbsp;·&nbsp;</span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
              Developed by{" "}
              <a
                href="https://github.com/seaheegood"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#666", transition: "color 0.2s", display: "inline-flex", alignItems: "center", gap: "3px" }}
                onMouseOver={(e) => (e.currentTarget.style.color = "#aaa")}
                onMouseOut={(e) => (e.currentTarget.style.color = "#666")}
              >
                Sehee Hong
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
              </a>
            </span>
          </p>
          <div style={{ display: "flex", gap: "20px" }}>
            <a
              href="https://www.youtube.com/@gugarden"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#555", transition: "color 0.2s" }}
              onMouseOver={(e) => (e.currentTarget.style.color = "#888")}
              onMouseOut={(e) => (e.currentTarget.style.color = "#555")}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
              </svg>
            </a>
            <a
              href="https://www.instagram.com/gu.garden/"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#555", transition: "color 0.2s" }}
              onMouseOver={(e) => (e.currentTarget.style.color = "#888")}
              onMouseOut={(e) => (e.currentTarget.style.color = "#555")}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      {/* 이미지 섹션 */}
      <div
        className="footer-image"
        style={{
          width: "100%",
          backgroundImage: "url(/images/footer.jpeg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
    </footer>
  );
}

export default Footer;
