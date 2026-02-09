import { useSearchParams, Link } from 'react-router-dom'

function TossPaymentFail() {
  const [searchParams] = useSearchParams()
  const errorCode = searchParams.get('code')
  const errorMessage = searchParams.get('message')

  const getErrorDescription = (code) => {
    const errorCodes = {
      'PAY_PROCESS_CANCELED': '결제가 취소되었습니다.',
      'PAY_PROCESS_ABORTED': '결제 진행 중 오류가 발생했습니다.',
      'REJECT_CARD_COMPANY': '카드사에서 결제를 거절했습니다.',
      'INVALID_CARD_NUMBER': '잘못된 카드 번호입니다.',
      'INVALID_CARD_EXPIRY_DATE': '카드 유효기간이 올바르지 않습니다.',
      'EXCEED_MAX_DAILY_PAYMENT_COUNT': '일일 결제 한도를 초과했습니다.',
      'NOT_SUPPORTED_INSTALLMENT_PLAN_CARD_OR_MERCHANT': '할부가 지원되지 않는 카드입니다.',
    }
    return errorCodes[code] || errorMessage || '결제 처리 중 오류가 발생했습니다.'
  }

  return (
    <div style={{
      paddingTop: '80px',
      minHeight: '100vh',
      background: '#000',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{ textAlign: 'center', maxWidth: '400px', padding: '0 24px' }}>
        <div style={{
          width: '80px',
          height: '80px',
          margin: '0 auto 24px',
          borderRadius: '50%',
          background: 'rgba(255, 0, 0, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ff6666" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="15" y1="9" x2="9" y2="15"/>
            <line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
        </div>
        <h1 style={{ fontSize: '24px', fontWeight: 300, marginBottom: '16px' }}>결제 실패</h1>
        <p style={{ fontSize: '14px', color: '#888', marginBottom: '8px' }}>
          {getErrorDescription(errorCode)}
        </p>
        {errorCode && (
          <p style={{ fontSize: '12px', color: '#666', marginBottom: '32px' }}>
            오류 코드: {errorCode}
          </p>
        )}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <Link
            to="/checkout"
            style={{
              display: 'inline-block',
              padding: '14px 32px',
              background: '#fff',
              color: '#000',
              fontSize: '14px',
              letterSpacing: '0.1em',
              textDecoration: 'none'
            }}
          >
            다시 시도
          </Link>
          <Link
            to="/cart"
            style={{
              display: 'inline-block',
              padding: '14px 32px',
              background: 'transparent',
              color: '#fff',
              fontSize: '14px',
              letterSpacing: '0.1em',
              textDecoration: 'none',
              border: '1px solid #333'
            }}
          >
            장바구니로
          </Link>
        </div>
      </div>
    </div>
  )
}

export default TossPaymentFail
