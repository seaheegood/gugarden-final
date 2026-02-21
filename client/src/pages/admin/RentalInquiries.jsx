import { useState, useEffect } from 'react'
import api from '../../api'

function RentalInquiries() {
  const [inquiries, setInquiries] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 })
  const [filter, setFilter] = useState({ status: '' })
  const [selectedInquiry, setSelectedInquiry] = useState(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    fetchInquiries()
  }, [pagination.page, filter.status])

  const fetchInquiries = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: pagination.page,
        limit: 20,
      })
      if (filter.status) params.append('status', filter.status)

      const response = await api.get(`/admin/rental-inquiries?${params}`)
      setInquiries(response.data.inquiries)
      setPagination((prev) => ({
        ...prev,
        totalPages: response.data.pagination.totalPages,
      }))
    } catch (error) {
      // error silently handled
    } finally {
      setLoading(false)
    }
  }

  const openModal = async (inquiry) => {
    try {
      const response = await api.get(`/admin/rental-inquiries/${inquiry.id}`)
      setSelectedInquiry(response.data.inquiry)
      setShowModal(true)
    } catch (error) {
      alert('문의 정보를 불러오는데 실패했습니다.')
    }
  }

  const closeModal = () => {
    setShowModal(false)
    setSelectedInquiry(null)
  }

  const handleStatusChange = async (id, status) => {
    try {
      await api.put(`/admin/rental-inquiries/${id}/status`, { status })
      alert('상태가 변경되었습니다.')
      fetchInquiries()
      if (selectedInquiry && selectedInquiry.id === id) {
        setSelectedInquiry({ ...selectedInquiry, status })
      }
    } catch (error) {
      alert(error.response?.data?.error || '상태 변경에 실패했습니다.')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('정말 삭제하시겠습니까?')) return

    try {
      await api.delete(`/admin/rental-inquiries/${id}`)
      alert('문의가 삭제되었습니다.')
      fetchInquiries()
      closeModal()
    } catch (error) {
      alert(error.response?.data?.error || '삭제에 실패했습니다.')
    }
  }

  const getStatusLabel = (status) => {
    const labels = {
      pending: '대기중',
      contacted: '연락완료',
      completed: '완료',
      cancelled: '취소',
    }
    return labels[status] || status
  }

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      contacted: 'bg-blue-100 text-blue-700 border-blue-200',
      completed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      cancelled: 'bg-gray-100 text-gray-600 border-gray-200',
    }
    return colors[status] || 'bg-gray-100 text-gray-600 border-gray-200'
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('ko-KR')
  }

  return (
    <div className="p-6 lg:p-8">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-wide text-gray-800">렌탈 문의 관리</h1>
          <p className="text-sm text-gray-500 mt-2">렌탈 서비스 문의를 관리하세요</p>
        </div>
      </div>

      {/* 필터 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex gap-3 items-center">
          <label className="text-sm font-medium text-gray-700">상태:</label>
          <select
            value={filter.status}
            onChange={(e) => {
              setFilter({ status: e.target.value })
              setPagination((prev) => ({ ...prev, page: 1 }))
            }}
            className="bg-white border border-gray-300 rounded-md px-3 py-2 pr-8 text-sm text-gray-700 focus:border-gray-500 focus:outline-none appearance-none cursor-pointer"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
              backgroundPosition: 'right 0.5rem center',
              backgroundRepeat: 'no-repeat',
              backgroundSize: '1.25em 1.25em',
            }}
          >
            <option value="">전체</option>
            <option value="pending">대기중</option>
            <option value="contacted">연락완료</option>
            <option value="completed">완료</option>
            <option value="cancelled">취소</option>
          </select>
        </div>
      </div>

      {/* 문의 목록 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-2 border-gray-400 border-t-gray-700 rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-gray-600 text-sm">로딩 중...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 text-left bg-gray-50">
                  <th className="px-5 py-3 text-xs font-semibold text-gray-600">문의일시</th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-600">이름</th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-600">작품명</th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-600">연락처</th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-600">용도</th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-600">상태</th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-600">관리</th>
                </tr>
              </thead>
              <tbody>
                {inquiries.length > 0 ? (
                  inquiries.map((inquiry) => (
                    <tr
                      key={inquiry.id}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-5 py-3 text-sm text-gray-600">
                        {formatDate(inquiry.created_at)}
                      </td>
                      <td className="px-5 py-3 text-sm font-medium text-gray-800">
                        {inquiry.name}
                      </td>
                      <td className="px-5 py-3 text-sm text-gray-600">
                        {inquiry.work_name || '-'}
                      </td>
                      <td className="px-5 py-3 text-sm text-gray-600">{inquiry.phone}</td>
                      <td className="px-5 py-3 text-sm text-gray-600">
                        {inquiry.purpose || '-'}
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`text-xs font-medium px-3 py-1.5 rounded-full border ${getStatusColor(
                            inquiry.status
                          )}`}
                        >
                          {getStatusLabel(inquiry.status)}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <button
                          onClick={() => openModal(inquiry)}
                          className="text-xs font-medium text-gray-600 hover:text-gray-900 transition-colors px-2.5 py-1.5 bg-gray-100 rounded-md hover:bg-gray-200"
                        >
                          상세보기
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center text-gray-500 text-sm">
                      문의가 없습니다.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
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

      {/* 상세보기 모달 */}
      {showModal && selectedInquiry && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between px-8 py-6 border-b border-gray-200 bg-gray-50">
              <div>
                <h2 className="text-lg font-semibold text-gray-800">렌탈 문의 상세</h2>
                <p className="text-xs text-gray-500 mt-1">
                  문의 ID: {selectedInquiry.id}
                </p>
              </div>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700 transition-colors p-1"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    이름
                  </label>
                  <p className="text-sm text-gray-800">{selectedInquiry.name}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    작품명(번호)
                  </label>
                  <p className="text-sm text-gray-800">
                    {selectedInquiry.work_name || '-'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    이메일
                  </label>
                  <p className="text-sm text-gray-800">{selectedInquiry.email}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    연락처
                  </label>
                  <p className="text-sm text-gray-800">{selectedInquiry.phone}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    렌탈 기간
                  </label>
                  <p className="text-sm text-gray-800">
                    {selectedInquiry.rental_period || '-'}
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    용도
                  </label>
                  <p className="text-sm text-gray-800">
                    {selectedInquiry.purpose || '-'}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  문의 내용
                </label>
                <p className="text-sm text-gray-800 whitespace-pre-wrap">
                  {selectedInquiry.message || '-'}
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  문의 일시
                </label>
                <p className="text-sm text-gray-800">
                  {formatDate(selectedInquiry.created_at)}
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  상태 변경
                </label>
                <div className="flex gap-2">
                  {['pending', 'contacted', 'completed', 'cancelled'].map((status) => (
                    <button
                      key={status}
                      onClick={() => handleStatusChange(selectedInquiry.id, status)}
                      className={`text-xs font-medium px-4 py-2 rounded-md transition-colors ${
                        selectedInquiry.status === status
                          ? 'bg-gray-900 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {getStatusLabel(status)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 px-8 py-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => handleDelete(selectedInquiry.id)}
                className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100 transition-colors"
              >
                삭제
              </button>
              <button
                onClick={closeModal}
                className="flex-1 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default RentalInquiries
