import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();

  // 히어로 섹션이 있는 페이지들 (투명 헤더 적용)
  const heroPages = ['/', '/terrarium', '/vivarium', '/paludarium', '/rental', '/ando'];
  const hasHero = heroPages.includes(location.pathname);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  const navLinks = [
    { to: "/terrarium", label: "TERRARIUM" },
    { to: "/vivarium", label: "VIVARIUM" },
    { to: "/paludarium", label: "PALUDARIUM" },
    { to: "/elements", label: "ELEMENTS" },
    { to: "/rental", label: "RENTAL" },
    { to: "/ando", label: "ANDO" },
  ];

  return (
    <>
      {/* 헤더 상단 그라데이션 (배경 이미지 위에서 가독성 향상) */}
      {hasHero && !isScrolled && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            height: '120px',
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) 100%)',
            zIndex: 49,
            pointerEvents: 'none',
          }}
        />
      )}
      <header
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          height: (hasHero && !isScrolled) ? '100px' : '70px',
          background: (hasHero && !isScrolled) ? 'transparent' : 'rgba(0,0,0,0.95)',
          backdropFilter: (hasHero && !isScrolled) ? 'none' : 'blur(10px)',
          transition: 'all 0.3s ease',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {/* 로고 */}
            <div style={{ flex: '1 1 0', display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
              <Link to="/" style={{ display: 'flex', alignItems: 'center', lineHeight: 0 }}>
                <img
                  src="/gugarden.png"
                  alt="구의정원"
                  className="header-logo"
                  style={{ height: '48px', width: 'auto', display: 'block' }}
                />
              </Link>
            </div>

            {/* 데스크톱 네비게이션 */}
            <nav className="hide-mobile" style={{ display: 'flex', alignItems: 'center', gap: '48px' }}>
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  style={{
                    fontSize: '13px',
                    letterSpacing: '0.15em',
                    color: location.pathname === link.to ? '#fff' : (hasHero && !isScrolled) ? '#ddd' : '#888',
                    textShadow: (hasHero && !isScrolled) ? '0 1px 3px rgba(0,0,0,0.5)' : 'none',
                    transition: 'color 0.2s',
                  }}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* 유틸리티 메뉴 */}
            <div className="desktop-utils hide-mobile" style={{ flex: '1 1 0', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '32px' }}>
              <Link
                to="/cart"
                style={{
                  fontSize: '13px',
                  letterSpacing: '0.1em',
                  color: (hasHero && !isScrolled) ? '#ddd' : '#888',
                  textShadow: (hasHero && !isScrolled) ? '0 1px 3px rgba(0,0,0,0.5)' : 'none',
                }}
              >
                CART
              </Link>
              {isAuthenticated ? (
                <Link
                  to="/mypage"
                  style={{
                    fontSize: '13px',
                    letterSpacing: '0.1em',
                    color: (hasHero && !isScrolled) ? '#ddd' : '#888',
                    textShadow: (hasHero && !isScrolled) ? '0 1px 3px rgba(0,0,0,0.5)' : 'none',
                  }}
                >
                  {user?.name || "MY"}
                </Link>
              ) : (
                <Link
                  to="/login"
                  style={{
                    fontSize: '13px',
                    letterSpacing: '0.1em',
                    color: (hasHero && !isScrolled) ? '#ddd' : '#888',
                    textShadow: (hasHero && !isScrolled) ? '0 1px 3px rgba(0,0,0,0.5)' : 'none',
                  }}
                >
                  LOGIN
                </Link>
              )}
            </div>

            {/* 모바일 메뉴 버튼 */}
            <button
              className="show-mobile"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#fff',
                fontSize: '24px',
                cursor: 'pointer',
                padding: '8px',
              }}
            >
              {isMenuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>
      </header>

      {/* 모바일 메뉴 */}
      {isMenuOpen && (
        <div
          className="show-mobile"
          style={{
            position: 'fixed',
            top: '70px',
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.98)',
            zIndex: 40,
            padding: '32px 20px',
            overflow: 'auto',
          }}
        >
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                style={{
                  fontSize: '18px',
                  letterSpacing: '0.15em',
                  color: location.pathname === link.to ? '#fff' : '#888',
                  padding: '12px 0',
                  borderBottom: '1px solid #333',
                }}
              >
                {link.label}
              </Link>
            ))}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px', paddingTop: '24px', borderTop: '1px solid #444' }}>
              <Link
                to="/cart"
                style={{ fontSize: '16px', letterSpacing: '0.1em', color: '#888', padding: '8px 0' }}
              >
                CART
              </Link>
              {isAuthenticated ? (
                <Link
                  to="/mypage"
                  style={{ fontSize: '16px', letterSpacing: '0.1em', color: '#888', padding: '8px 0' }}
                >
                  {user?.name || "MY PAGE"}
                </Link>
              ) : (
                <Link
                  to="/login"
                  style={{ fontSize: '16px', letterSpacing: '0.1em', color: '#888', padding: '8px 0' }}
                >
                  LOGIN
                </Link>
              )}
            </div>
          </nav>
        </div>
      )}
    </>
  );
}

export default Header;
