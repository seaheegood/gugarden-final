function ScrollIndicator({ onClick }) {
  return (
    <div
      style={{
        position: 'absolute',
        bottom: '36px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '6px',
        cursor: onClick ? 'pointer' : 'default',
      }}
      onClick={onClick}
    >
      <p style={{
        fontSize: '11px',
        letterSpacing: '0.25em',
        color: '#fff',
        fontWeight: 300,
      }}>
        SCROLL
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
        <svg
          width="18" height="10" viewBox="0 0 18 10"
          style={{ animation: 'scrollChevron 1.8s ease-in-out infinite' }}
        >
          <polyline
            points="1,1 9,8 17,1"
            fill="none"
            stroke="#fff"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <svg
          width="18" height="10" viewBox="0 0 18 10"
          style={{ animation: 'scrollChevron 1.8s ease-in-out infinite', animationDelay: '0.3s', opacity: 0 }}
        >
          <polyline
            points="1,1 9,8 17,1"
            fill="none"
            stroke="#fff"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  )
}

export default ScrollIndicator
