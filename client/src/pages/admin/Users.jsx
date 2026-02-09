import { useState, useEffect } from 'react'
import api from '../../api'

function Users() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 })
  const [search, setSearch] = useState('')
  const [selectedUser, setSelectedUser] = useState(null)
  const [userOrders, setUserOrders] = useState([])
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [pagination.page])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: pagination.page,
        limit: 20,
      })
      if (search) params.append('search', search)

      const response = await api.get(`/admin/users?${params}`)
      setUsers(response.data.users)
      setPagination((prev) => ({
        ...prev,
        totalPages: response.data.pagination.totalPages,
      }))
    } catch (error) {
      console.error('회원 조회 에러:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    setPagination((prev) => ({ ...prev, page: 1 }))
    fetchUsers()
  }

  const openUserDetail = async (userId) => {
    try {
      const response = await api.get(`/admin/users/${userId}`)
      setSelectedUser(response.data.user)
      setUserOrders(response.data.orders)
      setShowModal(true)
    } catch (error) {
      alert('회원 정보를 불러오는데 실패했습니다.')
    }
  }

  const updateRole = async (userId, newRole) => {
    if (!confirm(`회원 역할을 "${newRole === 'admin' ? '관리자' : '일반 회원'}"(으)로 변경하시겠습니까?`)) {
      return
    }

    try {
      await api.put(`/admin/users/${userId}/role`, { role: newRole })
      alert('회원 역할이 변경되었습니다.')
      fetchUsers()
      if (selectedUser && selectedUser.id === userId) {
        setSelectedUser((prev) => ({ ...prev, role: newRole }))
      }
    } catch (error) {
      alert(error.response?.data?.error || '역할 변경에 실패했습니다.')
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

  return (
    <div className="p-6 lg:p-8">
      {/* 헤더 */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-wide text-gray-800">회원 관리</h1>
        <p className="text-sm text-gray-500 mt-2">회원 정보를 조회하고 관리하세요</p>
      </div>

      {/* 검색 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 lg:p-4 mb-4 lg:mb-6">
        <form onSubmit={handleSearch} className="flex gap-2 lg:gap-3 items-center">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="이름 또는 이메일로 검색"
            className="flex-1 bg-white border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-700 placeholder-gray-400 focus:border-gray-500 focus:outline-none"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-200 transition-colors"
          >
            검색
          </button>
        </form>
      </div>

      {/* 회원 목록 */}
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
                  <th className="px-5 py-3 text-xs font-semibold text-gray-600">ID</th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-600">이름</th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-600">이메일</th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-600">연락처</th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-600">주문</th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-600">총 구매액</th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-600">역할</th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-600">가입일</th>
                </tr>
              </thead>
              <tbody>
                {users.length > 0 ? (
                  users.map((user) => (
                    <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3 text-sm text-gray-500">{user.id}</td>
                      <td className="px-5 py-3">
                        <button
                          onClick={() => openUserDetail(user.id)}
                          className="text-sm font-medium text-gray-800 hover:text-blue-600 transition-colors"
                        >
                          {user.name}
                        </button>
                      </td>
                      <td className="px-5 py-3 text-sm text-gray-600">{user.email}</td>
                      <td className="px-5 py-3 text-sm text-gray-600">{user.phone || '-'}</td>
                      <td className="px-5 py-3 text-sm font-medium text-gray-800">{user.order_count}건</td>
                      <td className="px-5 py-3 text-sm font-semibold text-gray-800">₩{formatPrice(user.total_spent)}</td>
                      <td className="px-5 py-3">
                        <select
                          value={user.role}
                          onChange={(e) => updateRole(user.id, e.target.value)}
                          className={`text-xs font-medium px-2 py-1.5 pr-7 rounded-md border focus:outline-none appearance-none cursor-pointer ${
                            user.role === 'admin'
                              ? 'border-amber-300 bg-amber-50 text-amber-700'
                              : 'border-gray-300 bg-white text-gray-700'
                          }`}
                          style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.3rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1em 1em' }}
                        >
                          <option value="user">일반</option>
                          <option value="admin">관리자</option>
                        </select>
                      </td>
                      <td className="px-5 py-3 text-sm text-gray-500">
                        {formatDate(user.created_at)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="px-5 py-12 text-center text-gray-500 text-sm">
                      회원이 없습니다.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* 모바일 카드 */}
          <div className="lg:hidden divide-y divide-gray-100">
            {users.length > 0 ? (
              users.map((user) => (
                <div key={user.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <button
                    onClick={() => openUserDetail(user.id)}
                    className="w-full text-left mb-3"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 mb-1">{user.name}</p>
                        <p className="text-xs text-gray-600">{user.email}</p>
                        {user.phone && <p className="text-xs text-gray-500 mt-1">{user.phone}</p>}
                      </div>
                      <div className="ml-2 flex-shrink-0">
                        <select
                          value={user.role}
                          onChange={(e) => {
                            e.stopPropagation()
                            updateRole(user.id, e.target.value)
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className={`text-xs font-medium px-2 py-1 pr-6 rounded-md border focus:outline-none appearance-none cursor-pointer ${
                            user.role === 'admin'
                              ? 'border-amber-300 bg-amber-50 text-amber-700'
                              : 'border-gray-300 bg-white text-gray-700'
                          }`}
                          style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.3rem center', backgroundRepeat: 'no-repeat', backgroundSize: '0.9em 0.9em' }}
                        >
                          <option value="user">일반</option>
                          <option value="admin">관리자</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div>
                        <span className="text-gray-600">{user.order_count}건 주문</span>
                        <span className="text-gray-400 mx-1.5">·</span>
                        <span className="font-semibold text-gray-800">₩{formatPrice(user.total_spent)}</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">{formatDate(user.created_at)} 가입</p>
                  </button>
                </div>
              ))
            ) : (
              <div className="px-4 py-12 text-center text-gray-500 text-sm">
                회원이 없습니다.
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

      {/* 회원 상세 모달 */}
      {showModal && selectedUser && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 lg:p-4 p-0">
          <div className="bg-white rounded-2xl lg:rounded-2xl rounded-none w-full max-w-xl max-h-[90vh] lg:max-h-[90vh] h-full lg:h-auto overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between px-4 lg:px-8 py-4 lg:py-6 border-b border-gray-200 bg-gray-50">
              <div className="flex-1 min-w-0">
                <h2 className="text-base lg:text-lg font-semibold text-gray-800">회원 상세</h2>
                <p className="text-xs text-gray-500 mt-1 truncate">{selectedUser.email}</p>
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
              {/* 기본 정보 */}
              <div>
                <h3 className="text-sm font-semibold text-gray-800 mb-3">기본 정보</h3>
                <div className="bg-gray-50 rounded-xl p-5 space-y-4 border border-gray-200">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">이름</span>
                    <span className="text-gray-800 font-medium">{selectedUser.name}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">이메일</span>
                    <span className="text-gray-800">{selectedUser.email}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">연락처</span>
                    <span className="text-gray-800">{selectedUser.phone || '-'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">주소</span>
                    <span className="text-gray-800 text-right">
                      {selectedUser.address
                        ? `${selectedUser.address} ${selectedUser.address_detail || ''}`
                        : '-'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">역할</span>
                    <span className={selectedUser.role === 'admin' ? 'text-amber-700 font-semibold' : 'text-gray-800'}>
                      {selectedUser.role === 'admin' ? '관리자' : '일반 회원'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">가입일</span>
                    <span className="text-gray-800">{formatDate(selectedUser.created_at)}</span>
                  </div>
                </div>
              </div>

              {/* 최근 주문 */}
              <div>
                <h3 className="text-sm font-semibold text-gray-800 mb-3">최근 주문 (최대 10건)</h3>
                {userOrders.length > 0 ? (
                  <div className="border border-gray-200 rounded-xl divide-y divide-gray-200 overflow-hidden">
                    {userOrders.map((order) => (
                      <div key={order.id} className="flex justify-between items-center p-5 bg-white">
                        <div>
                          <p className="text-sm font-medium text-gray-800">{order.order_number}</p>
                          <p className="text-xs text-gray-500 mt-1">{formatDate(order.created_at)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-gray-800">₩{formatPrice(order.total_amount)}</p>
                          <p className="text-xs text-gray-500 mt-1">{getStatusText(order.status)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 text-center py-10 bg-gray-50 rounded-xl border border-gray-200">주문 내역이 없습니다.</p>
                )}
              </div>

              {/* 역할 변경 */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                {selectedUser.role === 'user' ? (
                  <button
                    onClick={() => updateRole(selectedUser.id, 'admin')}
                    className="flex-1 py-2.5 border border-amber-300 text-amber-700 text-sm font-medium rounded-md hover:bg-amber-50 transition-colors"
                  >
                    관리자로 변경
                  </button>
                ) : (
                  <button
                    onClick={() => updateRole(selectedUser.id, 'user')}
                    className="flex-1 py-2.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50 transition-colors"
                  >
                    일반 회원으로 변경
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Users
