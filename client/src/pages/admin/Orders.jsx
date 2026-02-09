import { useState, useEffect } from 'react'
import api from '../../api'

function Orders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 })
  const [statusFilter, setStatusFilter] = useState('')
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [showModal, setShowModal] = useState(false)

  const statusList = [
    { value: '', label: '전체' },
    { value: 'pending', label: '결제 대기' },
    { value: 'paid', label: '결제 완료' },
    { value: 'preparing', label: '준비중' },
    { value: 'shipped', label: '배송중' },
    { value: 'delivered', label: '배송 완료' },
    { value: 'cancelled', label: '취소' },
  ]

  useEffect(() => {
    fetchOrders()
  }, [pagination.page, statusFilter])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: pagination.page,
        limit: 20,
      })
      if (statusFilter) params.append('status', statusFilter)

      const response = await api.get(`/admin/orders?${params}`)
      setOrders(response.data.orders)
      setPagination((prev) => ({
        ...prev,
        totalPages: response.data.pagination.totalPages,
      }))
    } catch (error) {
      console.error('주문 조회 에러:', error)
    } finally {
      setLoading(false)
    }
  }

  const openOrderDetail = async (orderId) => {
    try {
      const response = await api.get(`/admin/orders/${orderId}`)
      setSelectedOrder(response.data.order)
      setShowModal(true)
    } catch (error) {
      alert('주문 정보를 불러오는데 실패했습니다.')
    }
  }

  const updateStatus = async (orderId, newStatus) => {
    if (!confirm(`주문 상태를 "${getStatusText(newStatus)}"(으)로 변경하시겠습니까?`)) return

    try {
      await api.put(`/admin/orders/${orderId}/status`, { status: newStatus })
      alert('주문 상태가 변경되었습니다.')
      fetchOrders()
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder((prev) => ({ ...prev, status: newStatus }))
      }
    } catch (error) {
      alert(error.response?.data?.error || '상태 변경에 실패했습니다.')
    }
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('ko-KR').format(price)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('ko-KR')
  }

  const getStatusText = (status) => {
    const map = statusList.find((s) => s.value === status)
    return map ? map.label : status
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

  return (
    <div className="p-6 lg:p-8">
      {/* 헤더 */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-wide text-gray-800">주문 관리</h1>
        <p className="text-sm text-gray-500 mt-2">주문 내역을 확인하고 상태를 관리하세요</p>
      </div>

      {/* 필터 */}
      <div className="flex flex-wrap gap-2 mb-4 lg:mb-6">
        {statusList.map((status) => (
          <button
            key={status.value}
            onClick={() => {
              setStatusFilter(status.value)
              setPagination((prev) => ({ ...prev, page: 1 }))
            }}
            className={`px-2.5 lg:px-3 py-1.5 text-xs lg:text-sm font-medium rounded-md transition-colors ${
              statusFilter === status.value
                ? 'bg-gray-900 text-white'
                : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {status.label}
          </button>
        ))}
      </div>

      {/* 주문 목록 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-2 border-gray-400 border-t-gray-700 rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-gray-600 text-sm">로딩 중...</p>
          </div>
        ) : (
          <>
          {/* 데스크톱 테이블 */}
          <div className="overflow-x-auto hidden lg:block">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 text-left bg-gray-50">
                  <th className="px-5 py-3 text-xs font-semibold text-gray-600">주문번호</th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-600">주문자</th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-600">상품</th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-600">금액</th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-600">상태</th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-600">일시</th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-600">관리</th>
                </tr>
              </thead>
              <tbody>
                {orders.length > 0 ? (
                  orders.map((order) => (
                    <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3">
                        <button
                          onClick={() => openOrderDetail(order.id)}
                          className="text-sm font-medium text-gray-800 hover:text-blue-600 transition-colors"
                        >
                          {order.order_number}
                        </button>
                      </td>
                      <td className="px-5 py-3">
                        <p className="text-sm font-medium text-gray-800">{order.user_name}</p>
                        <p className="text-xs text-gray-500">{order.user_email}</p>
                      </td>
                      <td className="px-5 py-3 text-sm text-gray-600">
                        {order.item_count}개 상품
                      </td>
                      <td className="px-5 py-3 text-sm font-semibold text-gray-800">
                        ₩{formatPrice(order.total_amount)}
                      </td>
                      <td className="px-5 py-3">
                        <span className={`text-xs font-medium px-3 py-1.5 rounded-full ${getStatusStyle(order.status)}`}>
                          {getStatusText(order.status)}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-sm text-gray-500">
                        {formatDate(order.created_at)}
                      </td>
                      <td className="px-5 py-3">
                        <select
                          value={order.status}
                          onChange={(e) => updateStatus(order.id, e.target.value)}
                          className="bg-white border border-gray-300 text-xs font-medium text-gray-700 px-2 py-1.5 pr-7 rounded-md focus:outline-none focus:border-gray-500 appearance-none cursor-pointer"
                          style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.3rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1em 1em' }}
                        >
                          {statusList.slice(1).map((s) => (
                            <option key={s.value} value={s.value}>
                              {s.label}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center text-gray-500 text-sm">
                      주문이 없습니다.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* 모바일 카드 */}
          <div className="lg:hidden divide-y divide-gray-100">
            {orders.length > 0 ? (
              orders.map((order) => (
                <div key={order.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <button
                    onClick={() => openOrderDetail(order.id)}
                    className="w-full text-left mb-3"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 mb-1">{order.order_number}</p>
                        <p className="text-xs font-medium text-gray-800">{order.user_name}</p>
                        <p className="text-xs text-gray-500">{order.user_email}</p>
                      </div>
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap ml-2 flex-shrink-0 ${getStatusStyle(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-600">{order.item_count}개 상품</span>
                      <span className="font-semibold text-gray-800">₩{formatPrice(order.total_amount)}</span>
                    </div>
                    <p className="text-xs text-gray-500">{formatDate(order.created_at)}</p>
                  </button>
                  <select
                    value={order.status}
                    onChange={(e) => updateStatus(order.id, e.target.value)}
                    className="w-full bg-white border border-gray-300 text-sm font-medium text-gray-700 px-3 py-2 pr-8 rounded-md focus:outline-none focus:border-gray-500 appearance-none cursor-pointer"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.25em 1.25em' }}
                  >
                    {statusList.slice(1).map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
              ))
            ) : (
              <div className="px-4 py-12 text-center text-gray-500 text-sm">
                주문이 없습니다.
              </div>
            )}
          </div>
          </>
        )}

        {/* 페이지네이션 */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-center gap-2 p-4 border-t border-gray-200 bg-gray-50">
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setPagination((prev) => ({ ...prev, page }))}
                className={`w-8 h-8 text-sm font-medium rounded-lg transition-colors ${
                  pagination.page === page
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-600 hover:bg-gray-200 border border-gray-300'
                }`}
              >
                {page}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 주문 상세 모달 */}
      {showModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 lg:p-4 p-0">
          <div className="bg-white rounded-2xl lg:rounded-2xl rounded-none w-full max-w-2xl max-h-[90vh] lg:max-h-[90vh] h-full lg:h-auto overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between px-4 lg:px-8 py-4 lg:py-6 border-b border-gray-200 bg-gray-50">
              <div className="flex-1 min-w-0">
                <h2 className="text-base lg:text-lg font-semibold text-gray-800">주문 상세</h2>
                <p className="text-xs text-gray-500 mt-1">{selectedOrder.order_number}</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors p-1 flex-shrink-0"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-4 lg:p-8 space-y-5 lg:space-y-6">
              {/* 주문 상태 */}
              <div className="flex items-center justify-between">
                <span className={`text-sm font-medium px-4 py-2 rounded-full ${getStatusStyle(selectedOrder.status)}`}>
                  {getStatusText(selectedOrder.status)}
                </span>
                <select
                  value={selectedOrder.status}
                  onChange={(e) => updateStatus(selectedOrder.id, e.target.value)}
                  className="bg-gray-50 border border-gray-300 text-sm font-medium text-gray-700 px-4 py-2.5 rounded-lg focus:outline-none"
                >
                  {statusList.slice(1).map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* 주문자 정보 */}
              <div>
                <h3 className="text-sm font-semibold text-gray-800 mb-3">주문자 정보</h3>
                <div className="bg-gray-50 rounded-xl p-5 space-y-2 border border-gray-200">
                  <p className="text-sm text-gray-700">{selectedOrder.user_name} ({selectedOrder.user_email})</p>
                  <p className="text-sm text-gray-500">{selectedOrder.user_phone}</p>
                </div>
              </div>

              {/* 배송 정보 */}
              <div>
                <h3 className="text-sm font-semibold text-gray-800 mb-3">배송 정보</h3>
                <div className="bg-gray-50 rounded-xl p-5 space-y-2 border border-gray-200">
                  <p className="text-sm text-gray-700">{selectedOrder.recipient_name} / {selectedOrder.recipient_phone}</p>
                  <p className="text-sm text-gray-600">{selectedOrder.recipient_address} {selectedOrder.recipient_address_detail}</p>
                  {selectedOrder.memo && (
                    <p className="text-sm text-gray-500">메모: {selectedOrder.memo}</p>
                  )}
                </div>
              </div>

              {/* 주문 상품 */}
              <div>
                <h3 className="text-sm font-semibold text-gray-800 mb-3">주문 상품</h3>
                <div className="border border-gray-200 rounded-xl divide-y divide-gray-200 overflow-hidden">
                  {selectedOrder.items?.map((item) => (
                    <div key={item.id} className="flex gap-4 p-5 bg-white">
                      <div className="w-16 h-16 bg-gray-100 rounded-md overflow-hidden flex-shrink-0 border border-gray-200">
                        {item.thumbnail ? (
                          <img
                            src={item.thumbnail}
                            alt={item.product_name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                            No img
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800">{item.product_name}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          ₩{formatPrice(item.product_price)} x {item.quantity}
                        </p>
                      </div>
                      <div className="text-sm font-semibold text-gray-800">
                        ₩{formatPrice(item.product_price * item.quantity)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 결제 정보 */}
              <div>
                <h3 className="text-sm font-semibold text-gray-800 mb-3">결제 정보</h3>
                <div className="bg-gray-50 rounded-xl p-5 space-y-3 border border-gray-200">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">상품 금액</span>
                    <span className="text-gray-800 font-medium">₩{formatPrice(selectedOrder.total_amount - selectedOrder.shipping_fee)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">배송비</span>
                    <span className="text-gray-800 font-medium">
                      {selectedOrder.shipping_fee === 0
                        ? '무료'
                        : `₩${formatPrice(selectedOrder.shipping_fee)}`}
                    </span>
                  </div>
                  <div className="flex justify-between pt-3 border-t border-gray-200 text-base font-semibold">
                    <span className="text-gray-800">총 결제 금액</span>
                    <span className="text-gray-900">₩{formatPrice(selectedOrder.total_amount)}</span>
                  </div>
                  <div className="flex justify-between pt-2 text-gray-500 text-xs">
                    <span>주문일시</span>
                    <span>{formatDate(selectedOrder.created_at)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Orders
