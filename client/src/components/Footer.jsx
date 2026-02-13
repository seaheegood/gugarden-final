import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer style={{ background: "#0a0a0a", borderTop: "1px solid #222" }}>
      <div className="responsive-container">
        {/* 메인 푸터 */}
        <div
          className="footer-grid"
          style={{
            padding: "48px 0",
          }}
        >
          {/* 브랜드 */}
          <div>
            <Link
              to="/"
              style={{
                fontSize: "20px",
                fontWeight: 300,
                letterSpacing: "0.3em",
              }}
            >
              구의정원
            </Link>
            <p
              style={{
                marginTop: "16px",
                fontSize: "14px",
                color: "#888",
                lineHeight: 1.8,
              }}
            >
              자연을 담은 작은 정원,
              <br />
              테라리움과 비바리움 전문 브랜드
            </p>
          </div>

          {/* 쇼핑 */}
          <div>
            <h4
              style={{
                fontSize: "12px",
                letterSpacing: "0.2em",
                color: "#666",
                marginBottom: "16px",
              }}
            >
              SHOP
            </h4>
            <ul
              style={{
                listStyle: "none",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
              }}
            >
              <li>
                <Link
                  to="/terrarium"
                  style={{ fontSize: "14px", color: "#888" }}
                >
                  Terrarium
                </Link>
              </li>
              <li>
                <Link
                  to="/vivarium"
                  style={{ fontSize: "14px", color: "#888" }}
                >
                  Vivarium
                </Link>
              </li>
              <li>
                <Link to="/paludarium" style={{ fontSize: "14px", color: "#888" }}>
                  Paludarium
                </Link>
              </li>
              <li>
                <Link to="/elements" style={{ fontSize: "14px", color: "#888" }}>
                  Elements
                </Link>
              </li>
              <li>
                <Link to="/rental" style={{ fontSize: "14px", color: "#888" }}>
                  Rental Service
                </Link>
              </li>
            </ul>
          </div>

          {/* 고객 지원 */}
          <div>
            <h4
              style={{
                fontSize: "12px",
                letterSpacing: "0.2em",
                color: "#666",
                marginBottom: "16px",
              }}
            >
              SUPPORT
            </h4>
            <ul
              style={{
                listStyle: "none",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
              }}
            >
              <li>
                <Link to="/about" style={{ fontSize: "14px", color: "#888" }}>
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/faq" style={{ fontSize: "14px", color: "#888" }}>
                  FAQ
                </Link>
              </li>
              <li>
                <Link
                  to="/shipping"
                  style={{ fontSize: "14px", color: "#888" }}
                >
                  Shipping & Returns
                </Link>
              </li>
            </ul>
          </div>

          {/* 연락처 */}
          <div>
            <h4
              style={{
                fontSize: "12px",
                letterSpacing: "0.2em",
                color: "#666",
                marginBottom: "16px",
              }}
            >
              CONTACT
            </h4>
            <ul
              style={{
                listStyle: "none",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                fontSize: "14px",
                color: "#888",
              }}
            >
              <li>
                <a href="tel:0507-1424-7573" style={{ color: "#888" }}>
                  0507-1424-7573
                </a>
              </li>
              <li style={{ lineHeight: 1.6 }}>
                경기 고양시 일산동구
                <br />
                호수로446번길 8-14
                <br />
                1층 101호
              </li>
              <li style={{ fontSize: "13px", color: "#666" }}>
                문의: 인스타그램 DM
              </li>
            </ul>
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
          <p style={{ fontSize: "12px", color: "#555" }}>
            &copy; 2026 구의정원. All rights reserved.
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
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
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
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
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
