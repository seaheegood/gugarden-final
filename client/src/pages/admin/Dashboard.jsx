import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api'

function Dashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboard()
  }, [])

  const fetchDashboard = async () => {
    try {
      const response = await api.get('/admin/dashboard')
      setData(response.data)
    } catch (error) {
      // error silently handled
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('ko-KR').format(price)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ko-KR')
  }

  const getStatusText = (status) => {
    const statusMap = {
      pending: '결제 대기',
      paid: '결제 완료',
      preparing: '준비중',
      shipped: '배송중',
      delivered: '배송 완료',
      cancelled: '취소',
    }
    return statusMap[status] || status
  }

  const getStatusStyle = (status) => {
    const styles = {
      pending: 'bg-amber-100 text-amber-700 border border-amber-200',
      paid: 'bg-blue-100 text-blue-700 border border-blue-200',
      preparing: 'bg-purple-100 text-purple-700 border border-purple-200',
      shipped: 'bg-cyan-100 text-cyan-700 border border-cyan-200',
      delivered: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
      cancelled: 'bg-red-100 text-red-700 border border-red-200',
    }
    return styles[status] || 'bg-gray-100 text-gray-700 border border-gray-200'
  }

  if (loading) {
    return (
      <div className="p-10 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gray-400 border-t-gray-700 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-sm">로딩 중...</p>
        </div>
      </div>
    )
  }

  const { stats, recentOrders } = data || {}

  return (
    <div className="p-6 lg:p-8">
      {/* 헤더 */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-wide text-gray-800">대시보드</h1>
        <p className="text-sm text-gray-500 mt-2">오늘의 현황을 확인하세요</p>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-5 mb-6 lg:mb-8">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-11 h-11 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            {stats?.pendingOrders > 0 && (
              <span className="text-xs font-medium bg-amber-100 text-amber-700 px-3 py-1 rounded-full border border-amber-200">
                {stats.pendingOrders}건 대기
              </span>
            )}
          </div>
          <p className="text-xs font-medium text-gray-500 mb-2">오늘 주문</p>
          <p className="text-2xl font-bold text-gray-800">{stats?.todayOrders || 0}</p>
          <p className="text-xs text-gray-500 mt-2">전체 {stats?.totalOrders || 0}건</p>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-11 h-11 bg-emerald-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-xs font-medium text-gray-500 mb-2">오늘 매출</p>
          <p className="text-2xl font-bold text-gray-800">₩{formatPrice(stats?.todayRevenue || 0)}</p>
          <p className="text-xs text-gray-500 mt-2">총 매출 ₩{formatPrice(stats?.totalRevenue || 0)}</p>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-11 h-11 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>
          <p className="text-xs font-medium text-gray-500 mb-2">총 회원수</p>
          <p className="text-2xl font-bold text-gray-800">{stats?.totalUsers || 0}</p>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-11 h-11 bg-cyan-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
          </div>
          <p className="text-xs font-medium text-gray-500 mb-2">등록 상품</p>
          <p className="text-2xl font-bold text-gray-800">{stats?.totalProducts || 0}</p>
        </div>
      </div>

      {/* 최근 주문 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between px-4 lg:px-6 py-4 border-b border-gray-200">
          <div>
            <h2 className="text-base lg:text-lg font-semibold text-gray-800">최근 주문</h2>
            <p className="text-xs text-gray-500 mt-1">최근 5건의 주문 내역</p>
          </div>
          <Link
            to="/admin/orders"
            className="text-xs lg:text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-1.5 px-2 lg:px-3 py-1.5 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            전체 보기
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* 데스크톱 테이블 */}
        <div className="overflow-x-auto hidden lg:block">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 text-left bg-gray-50">
                <th className="px-6 py-3 text-xs font-semibold text-gray-600">주문번호</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-600">주문자</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-600">금액</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-600">상태</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-600">일시</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders?.length > 0 ? (
                recentOrders.map((order) => (
                  <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-3">
                      <Link
                        to={`/admin/orders`}
                        className="text-sm font-medium text-gray-800 hover:text-blue-600 transition-colors"
                      >
                        {order.order_number}
                      </Link>
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-600">
                      {order.user_name || order.user_email}
                    </td>
                    <td className="px-6 py-3 text-sm font-semibold text-gray-800">
                      ₩{formatPrice(order.total_amount)}
                    </td>
                    <td className="px-6 py-3">
                      <span className={`text-xs font-medium px-3 py-1.5 rounded-full ${getStatusStyle(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-500">
                      {formatDate(order.created_at)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500 text-sm">
                    주문 내역이 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 모바일 카드 */}
        <div className="lg:hidden divide-y divide-gray-100">
          {recentOrders?.length > 0 ? (
            recentOrders.map((order) => (
              <Link
                key={order.id}
                to={`/admin/orders`}
                className="block p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 mb-1">{order.order_number}</p>
                    <p className="text-xs text-gray-600">{order.user_name || order.user_email}</p>
                  </div>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap ml-2 ${getStatusStyle(order.status)}`}>
                    {getStatusText(order.status)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-gray-800">₩{formatPrice(order.total_amount)}</span>
                  <span className="text-xs text-gray-500">{formatDate(order.created_at)}</span>
                </div>
              </Link>
            ))
          ) : (
            <div className="px-4 py-12 text-center text-gray-500 text-sm">
              주문 내역이 없습니다.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard
