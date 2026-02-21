import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api'

function MyPage() {
  const navigate = useNavigate()
  const { user, logout, updateUser } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)

  const [profileData, setProfileData] = useState({
    name: '',
    phone: '',
    address: '',
    address_detail: '',
    zipcode: '',
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const [message, setMessage] = useState({ type: '', text: '' })

  // 관리자는 Admin 페이지로 리다이렉트
  useEffect(() => {
    if (user?.role === 'admin') {
      navigate('/admin', { replace: true })
    }
  }, [user, navigate])

  useEffect(() => {
    if (user && user.role !== 'admin') {
      setProfileData({
        name: user.name || '',
        phone: user.phone || '',
        address: user.address || '',
        address_detail: user.address_detail || '',
        zipcode: user.zipcode || '',
      })
    }
  }, [user])

  useEffect(() => {
    if (activeTab === 'orders') {
      fetchOrders()
    }
  }, [activeTab])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const response = await api.get('/orders')
      setOrders(response.data.orders)
    } catch (error) {
      // error silently handled
    } finally {
      setLoading(false)
    }
  }

  const handleProfileChange = (e) => {
    const { name, value } = e.target
    setProfileData((prev) => ({ ...prev, [name]: value }))
  }

  const handlePasswordChange = (e) => {
    const { name, value } = e.target
    setPasswordData((prev) => ({ ...prev, [name]: value }))
  }

  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    setMessage({ type: '', text: '' })
    try {
      await api.put('/auth/me', profileData)
      updateUser(profileData)
      setMessage({ type: 'success', text: '정보가 수정되었습니다.' })
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.error || '정보 수정에 실패했습니다.' })
    }
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    setMessage({ type: '', text: '' })
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: '새 비밀번호가 일치하지 않습니다.' })
      return
    }
    try {
      await api.put('/auth/password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      })
      setMessage({ type: 'success', text: '비밀번호가 변경되었습니다.' })
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.error || '비밀번호 변경에 실패했습니다.' })
    }
  }

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const handleWithdraw = async () => {
    const confirmed = window.confirm(
      '정말 탈퇴하시겠습니까?\n\n' +
      '• 탈퇴 시 개인정보는 즉시 삭제됩니다.\n' +
      '• 주문 내역은 법적 의무에 따라 일정 기간 보관됩니다.\n' +
      '• 이 작업은 되돌릴 수 없습니다.'
    )

    if (!confirmed) return

    const finalConfirm = window.confirm('마지막 확인입니다. 정말 탈퇴하시겠습니까?')
    if (!finalConfirm) return

    try {
      await api.delete('/auth/me')
      alert('회원 탈퇴가 완료되었습니다. 이용해 주셔서 감사합니다.')
      await logout()
      navigate('/')
    } catch (error) {
      alert(error.response?.data?.error || '회원 탈퇴에 실패했습니다.')
    }
  }

  const formatPrice = (price) => new Intl.NumberFormat('ko-KR').format(price)
  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('ko-KR')

  const getStatusText = (status) => {
    const statusMap = {
      pending: '결제 대기',
      paid: '결제 완료',
      preparing: '상품 준비중',
      shipped: '배송중',
      delivered: '배송 완료',
      cancelled: '주문 취소',
    }
    return statusMap[status] || status
  }

  const tabs = [
    { id: 'profile', label: '회원정보' },
    { id: 'orders', label: '주문내역' },
    { id: 'password', label: '비밀번호 변경' },
  ]

  const inputStyle = { width: '100%', background: 'transparent', border: '1px solid #333', padding: '12px 16px', fontSize: '14px', color: '#fff' }

  return (
    <div style={{ paddingTop: '80px', minHeight: '100vh', background: '#000' }}>
      <div className="responsive-container" style={{ maxWidth: '800px', paddingTop: '64px', paddingBottom: '64px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 300, letterSpacing: '0.2em', textAlign: 'center', marginBottom: '48px' }}>MY PAGE</h1>

        {/* 탭 메뉴 */}
        <div className="mypage-tabs" style={{ display: 'flex', justifyContent: 'center', gap: '32px', marginBottom: '48px', borderBottom: '1px solid #333', paddingBottom: '16px' }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setMessage({ type: '', text: '' }) }}
              style={{
                background: 'transparent',
                border: 'none',
                color: activeTab === tab.id ? '#fff' : '#888',
                fontSize: '14px',
                letterSpacing: '0.1em',
                cursor: 'pointer',
                borderBottom: activeTab === tab.id ? '2px solid #fff' : '2px solid transparent',
                paddingBottom: '16px',
                marginBottom: '-17px',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 메시지 */}
        {message.text && (
          <div style={{
            marginBottom: '32px',
            padding: '16px',
            textAlign: 'center',
            fontSize: '14px',
            background: message.type === 'success' ? 'rgba(0,255,0,0.1)' : 'rgba(255,0,0,0.1)',
            border: `1px solid ${message.type === 'success' ? 'rgba(0,255,0,0.2)' : 'rgba(255,0,0,0.2)'}`,
            color: message.type === 'success' ? '#66ff66' : '#ff6666',
          }}>
            {message.text}
          </div>
        )}

        {/* 회원정보 탭 */}
        {activeTab === 'profile' && (
          <form onSubmit={handleProfileSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: '#888', marginBottom: '8px' }}>이메일</label>
              <input type="email" value={user?.email || ''} disabled style={{ ...inputStyle, color: '#666', background: '#111' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: '#888', marginBottom: '8px' }}>이름</label>
              <input type="text" name="name" value={profileData.name} onChange={handleProfileChange} style={inputStyle} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: '#888', marginBottom: '8px' }}>연락처</label>
              <input type="tel" name="phone" value={profileData.phone} onChange={handleProfileChange} style={inputStyle} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: '#888', marginBottom: '8px' }}>우편번호</label>
              <input type="text" name="zipcode" value={profileData.zipcode} onChange={handleProfileChange} style={inputStyle} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: '#888', marginBottom: '8px' }}>주소</label>
              <input type="text" name="address" value={profileData.address} onChange={handleProfileChange} style={inputStyle} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: '#888', marginBottom: '8px' }}>상세주소</label>
              <input type="text" name="address_detail" value={profileData.address_detail} onChange={handleProfileChange} style={inputStyle} />
            </div>
            <button type="submit" style={{ width: '100%', padding: '16px', border: '1px solid #fff', background: 'transparent', color: '#fff', fontSize: '14px', letterSpacing: '0.2em', cursor: 'pointer', marginTop: '16px' }}>
              정보 수정
            </button>
          </form>
        )}

        {/* 주문내역 탭 */}
        {activeTab === 'orders' && (
          <div>
            {loading ? (
              <p style={{ textAlign: 'center', color: '#888', padding: '48px 0' }}>로딩 중...</p>
            ) : orders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 0' }}>
                <p style={{ color: '#888', marginBottom: '16px' }}>주문 내역이 없습니다.</p>
                <Link to="/terrarium" style={{ border: '1px solid #444', padding: '12px 32px', fontSize: '14px', letterSpacing: '0.1em', color: '#888' }}>
                  쇼핑하러 가기
                </Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {orders.map((order) => (
                  <div key={order.id} style={{ border: '1px solid #333', padding: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                      <div>
                        <p style={{ fontSize: '12px', color: '#888', marginBottom: '4px' }}>{formatDate(order.created_at)}</p>
                        <p style={{ fontSize: '14px' }}>주문번호: {order.order_number}</p>
                      </div>
                      <span style={{ fontSize: '12px', padding: '4px 12px', background: '#222' }}>{getStatusText(order.status)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid #333' }}>
                      <p style={{ fontSize: '18px' }}>₩ {formatPrice(order.total_amount)}</p>
                      <Link to={`/order/${order.id}`} style={{ fontSize: '12px', color: '#888' }}>상세보기</Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 비밀번호 변경 탭 */}
        {activeTab === 'password' && (
          <form onSubmit={handlePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: '#888', marginBottom: '8px' }}>현재 비밀번호</label>
              <input type="password" name="currentPassword" value={passwordData.currentPassword} onChange={handlePasswordChange} required style={inputStyle} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: '#888', marginBottom: '8px' }}>새 비밀번호</label>
              <input type="password" name="newPassword" value={passwordData.newPassword} onChange={handlePasswordChange} required placeholder="6자 이상" style={inputStyle} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: '#888', marginBottom: '8px' }}>새 비밀번호 확인</label>
              <input type="password" name="confirmPassword" value={passwordData.confirmPassword} onChange={handlePasswordChange} required style={inputStyle} />
            </div>
            <button type="submit" style={{ width: '100%', padding: '16px', border: '1px solid #fff', background: 'transparent', color: '#fff', fontSize: '14px', letterSpacing: '0.2em', cursor: 'pointer', marginTop: '16px' }}>
              비밀번호 변경
            </button>
          </form>
        )}

        {/* 로그아웃 / 회원탈퇴 */}
        <div style={{ marginTop: '48px', paddingTop: '32px', borderTop: '1px solid #333', textAlign: 'center', display: 'flex', justifyContent: 'center', gap: '32px' }}>
          <button onClick={handleLogout} style={{ background: 'transparent', border: 'none', color: '#888', fontSize: '14px', cursor: 'pointer' }}>
            로그아웃
          </button>
          <button onClick={handleWithdraw} style={{ background: 'transparent', border: 'none', color: '#666', fontSize: '14px', cursor: 'pointer' }}>
            회원탈퇴
          </button>
        </div>
      </div>
    </div>
  )
}

export default MyPage
