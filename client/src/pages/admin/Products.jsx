import { useState, useEffect, useRef } from 'react'
import api from '../../api'

function Products() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 })
  const [filter, setFilter] = useState({ category: '', search: '' })
  const [showModal, setShowModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [formData, setFormData] = useState({
    categoryId: '',
    name: '',
    description: '',
    price: '',
    salePrice: '',
    stock: '',
    thumbnail: '',
    isActive: true,
    isFeatured: false,
    isRentable: false,
  })

  // 이미지 업로드 관련 상태
  const [thumbnailFile, setThumbnailFile] = useState(null)
  const [thumbnailPreview, setThumbnailPreview] = useState('')
  const [productImages, setProductImages] = useState([])
  const [uploadingImages, setUploadingImages] = useState(false)
  const thumbnailInputRef = useRef(null)
  const imagesInputRef = useRef(null)

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    fetchProducts()
  }, [pagination.page, filter.category])

  const fetchCategories = async () => {
    try {
      const response = await api.get('/admin/categories')
      setCategories(response.data.categories)
    } catch (error) {
      console.error('카테고리 조회 에러:', error)
    }
  }

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: pagination.page,
        limit: 20,
      })
      if (filter.category) params.append('category', filter.category)
      if (filter.search) params.append('search', filter.search)

      const response = await api.get(`/admin/products?${params}`)
      setProducts(response.data.products)
      setPagination((prev) => ({
        ...prev,
        totalPages: response.data.pagination.totalPages,
      }))
    } catch (error) {
      console.error('상품 조회 에러:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchProductImages = async (productId) => {
    try {
      const response = await api.get(`/admin/products/${productId}/images`)
      setProductImages(response.data.images || [])
    } catch (error) {
      console.error('상품 이미지 조회 에러:', error)
      setProductImages([])
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    setPagination((prev) => ({ ...prev, page: 1 }))
    fetchProducts()
  }

  const openModal = async (product = null) => {
    if (product) {
      setEditingProduct(product)
      setFormData({
        categoryId: product.category_id,
        name: product.name,
        description: product.description || '',
        price: product.price,
        salePrice: product.sale_price || '',
        stock: product.stock,
        thumbnail: product.thumbnail || '',
        isActive: product.is_active,
        isFeatured: product.is_featured,
        isRentable: product.is_rentable || false,
      })
      setThumbnailPreview(product.thumbnail || '')
      await fetchProductImages(product.id)
    } else {
      setEditingProduct(null)
      setFormData({
        categoryId: categories[0]?.id || '',
        name: '',
        description: '',
        price: '',
        salePrice: '',
        stock: '',
        thumbnail: '',
        isActive: true,
        isFeatured: false,
        isRentable: false,
      })
      setThumbnailPreview('')
      setProductImages([])
    }
    setThumbnailFile(null)
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingProduct(null)
    setThumbnailFile(null)
    setThumbnailPreview('')
    setProductImages([])
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('이미지 파일만 업로드 가능합니다.')
        return
      }
      if (file.size > 10 * 1024 * 1024) {
        alert('파일 크기는 10MB 이하여야 합니다.')
        return
      }
      setThumbnailFile(file)
      setThumbnailPreview(URL.createObjectURL(file))
      setFormData((prev) => ({ ...prev, thumbnail: '' }))
    }
  }

  const removeThumbnail = () => {
    setThumbnailFile(null)
    setThumbnailPreview('')
    setFormData((prev) => ({ ...prev, thumbnail: '' }))
    if (thumbnailInputRef.current) {
      thumbnailInputRef.current.value = ''
    }
  }

  const handleImagesUpload = async (e) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    if (!editingProduct) {
      alert('상품을 먼저 저장한 후 추가 이미지를 업로드해주세요.')
      return
    }

    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        alert('이미지 파일만 업로드 가능합니다.')
        return
      }
      if (file.size > 10 * 1024 * 1024) {
        alert('파일 크기는 10MB 이하여야 합니다.')
        return
      }
    }

    if (productImages.length + files.length > 10) {
      alert('상품당 최대 10개의 이미지만 등록 가능합니다.')
      return
    }

    try {
      setUploadingImages(true)
      const formData = new FormData()
      for (const file of files) {
        formData.append('images', file)
      }

      const response = await api.post(
        `/admin/products/${editingProduct.id}/images`,
        formData
      )

      setProductImages(response.data.images || [])
      alert('이미지가 추가되었습니다.')
    } catch (error) {
      alert(error.response?.data?.error || '이미지 업로드에 실패했습니다.')
    } finally {
      setUploadingImages(false)
      if (imagesInputRef.current) {
        imagesInputRef.current.value = ''
      }
    }
  }

  const handleImageDelete = async (imageId) => {
    if (!confirm('이 이미지를 삭제하시겠습니까?')) return

    try {
      await api.delete(`/admin/products/images/${imageId}`)
      setProductImages((prev) => prev.filter((img) => img.id !== imageId))
    } catch (error) {
      alert(error.response?.data?.error || '이미지 삭제에 실패했습니다.')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.categoryId || !formData.name || !formData.price) {
      alert('필수 항목을 입력해주세요.')
      return
    }

    try {
      const submitData = new FormData()
      submitData.append('categoryId', parseInt(formData.categoryId))
      submitData.append('name', formData.name)
      submitData.append('description', formData.description || '')
      submitData.append('price', parseInt(formData.price))
      if (formData.salePrice) {
        submitData.append('salePrice', parseInt(formData.salePrice))
      }
      submitData.append('stock', parseInt(formData.stock) || 0)
      submitData.append('isActive', formData.isActive)
      submitData.append('isFeatured', formData.isFeatured)
      submitData.append('isRentable', formData.isRentable)

      if (thumbnailFile) {
        submitData.append('thumbnailFile', thumbnailFile)
      } else if (formData.thumbnail) {
        submitData.append('thumbnail', formData.thumbnail)
      }

      if (editingProduct) {
        await api.put(`/admin/products/${editingProduct.id}`, submitData)
        alert('상품이 수정되었습니다.')
      } else {
        await api.post('/admin/products', submitData)
        alert('상품이 등록되었습니다.')
      }

      closeModal()
      fetchProducts()
    } catch (error) {
      alert(error.response?.data?.error || '저장에 실패했습니다.')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('정말 삭제하시겠습니까?')) return

    try {
      await api.delete(`/admin/products/${id}`)
      alert('상품이 삭제되었습니다.')
      fetchProducts()
    } catch (error) {
      alert(error.response?.data?.error || '삭제에 실패했습니다.')
    }
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('ko-KR').format(price)
  }

  return (
    <div className="p-6 lg:p-8">
      {/* 헤더 */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-wide text-gray-800">상품 관리</h1>
          <p className="text-sm text-gray-500 mt-2">상품을 등록하고 관리하세요</p>
        </div>
        <button
          onClick={() => openModal()}
          className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-md hover:bg-gray-800 transition-colors flex items-center gap-1.5 whitespace-nowrap"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          상품 등록
        </button>
      </div>

      {/* 필터 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 lg:p-4 mb-4 lg:mb-6">
        <form onSubmit={handleSearch} className="flex flex-col lg:flex-row flex-wrap gap-2 lg:gap-3 items-stretch lg:items-center">
          <select
            value={filter.category}
            onChange={(e) => setFilter((prev) => ({ ...prev, category: e.target.value }))}
            className="bg-white border border-gray-300 rounded-md px-3 py-2 pr-8 text-sm text-gray-700 focus:border-gray-500 focus:outline-none appearance-none cursor-pointer"
            style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.25em 1.25em' }}
          >
            <option value="">전체 카테고리</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.slug}>
                {cat.name}
              </option>
            ))}
          </select>

          <div className="flex gap-2 lg:flex-1">
            <input
              type="text"
              value={filter.search}
              onChange={(e) => setFilter((prev) => ({ ...prev, search: e.target.value }))}
              placeholder="상품명 검색"
              className="flex-1 min-w-0 bg-white border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-700 placeholder-gray-400 focus:border-gray-500 focus:outline-none"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-200 transition-colors whitespace-nowrap"
            >
              검색
            </button>
          </div>
        </form>
      </div>

      {/* 상품 목록 */}
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
                  <th className="px-5 py-3 text-xs font-semibold text-gray-600">이미지</th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-600">상품명</th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-600">카테고리</th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-600">가격</th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-600">재고</th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-600">상태</th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-600">관리</th>
                </tr>
              </thead>
              <tbody>
                {products.length > 0 ? (
                  products.map((product) => (
                    <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3">
                        <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                          {product.thumbnail ? (
                            <img
                              src={product.thumbnail}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                              No img
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <p className="text-sm font-medium text-gray-800 mb-1">{product.name}</p>
                        {product.is_featured && (
                          <span className="text-xs text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-200">추천</span>
                        )}
                        {product.is_rentable && (
                          <span className="text-xs text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full border border-blue-200 ml-1">렌탈</span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-sm text-gray-600">
                        {product.category_name}
                      </td>
                      <td className="px-5 py-3">
                        <p className="text-sm font-semibold text-gray-800">₩{formatPrice(product.price)}</p>
                        {product.sale_price && (
                          <p className="text-xs text-red-600 font-medium mt-1">
                            ₩{formatPrice(product.sale_price)}
                          </p>
                        )}
                      </td>
                      <td className="px-5 py-3 text-sm">
                        <span className={product.stock < 5 ? 'text-red-600 font-semibold' : 'text-gray-700'}>
                          {product.stock}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`text-xs font-medium px-3 py-1.5 rounded-full ${
                            product.is_active
                              ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                              : 'bg-gray-100 text-gray-600 border border-gray-200'
                          }`}
                        >
                          {product.is_active ? '활성' : '비활성'}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => openModal(product)}
                            className="text-xs font-medium text-gray-600 hover:text-gray-900 transition-colors px-2.5 py-1.5 bg-gray-100 rounded-md hover:bg-gray-200"
                          >
                            수정
                          </button>
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="text-xs font-medium text-red-600 hover:text-red-700 transition-colors px-2.5 py-1.5 bg-red-50 rounded-md hover:bg-red-100"
                          >
                            삭제
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center text-gray-500 text-sm">
                      상품이 없습니다.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* 모바일 카드 */}
          <div className="lg:hidden divide-y divide-gray-100">
            {products.length > 0 ? (
              products.map((product) => (
                <div key={product.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex gap-3 mb-3">
                    <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0">
                      {product.thumbnail ? (
                        <img
                          src={product.thumbnail}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                          No img
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className="text-sm font-semibold text-gray-800 line-clamp-2">{product.name}</p>
                        <span
                          className={`text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap flex-shrink-0 ${
                            product.is_active
                              ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                              : 'bg-gray-100 text-gray-600 border border-gray-200'
                          }`}
                        >
                          {product.is_active ? '활성' : '비활성'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mb-2">{product.category_name}</p>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-gray-800">₩{formatPrice(product.price)}</p>
                        {product.sale_price && (
                          <p className="text-xs text-red-600 font-medium">
                            ₩{formatPrice(product.sale_price)}
                          </p>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 mt-1">
                        재고: <span className={product.stock < 5 ? 'text-red-600 font-semibold' : 'text-gray-700'}>{product.stock}</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openModal(product)}
                      className="flex-1 text-xs font-medium text-gray-700 py-2 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                    >
                      수정
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="flex-1 text-xs font-medium text-red-600 py-2 bg-red-50 rounded-md hover:bg-red-100 transition-colors"
                    >
                      삭제
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-4 py-12 text-center text-gray-500 text-sm">
                상품이 없습니다.
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

      {/* 상품 등록/수정 모달 */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 lg:p-4 p-0">
          <div className="bg-white rounded-2xl lg:rounded-2xl rounded-none w-full max-w-2xl max-h-[90vh] lg:max-h-[90vh] h-full lg:h-auto overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between px-4 lg:px-8 py-4 lg:py-6 border-b border-gray-200 bg-gray-50">
              <div>
                <h2 className="text-base lg:text-lg font-semibold text-gray-800">
                  {editingProduct ? '상품 수정' : '상품 등록'}
                </h2>
                <p className="text-xs text-gray-500 mt-1">상품 정보를 입력하세요</p>
              </div>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-700 transition-colors p-1 flex-shrink-0">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 lg:p-6 space-y-4 lg:space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">카테고리 *</label>
                <select
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleChange}
                  required
                  className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 pr-8 text-sm text-gray-700 focus:border-gray-500 focus:outline-none appearance-none cursor-pointer"
                  style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.25em 1.25em' }}
                >
                  <option value="">선택하세요</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">상품명 *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-700 focus:border-gray-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">설명</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-700 focus:border-gray-500 focus:outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">정가 *</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    required
                    className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-700 focus:border-gray-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">할인가</label>
                  <input
                    type="number"
                    name="salePrice"
                    value={formData.salePrice}
                    onChange={handleChange}
                    className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-700 focus:border-gray-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">재고</label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-700 focus:border-gray-500 focus:outline-none"
                />
              </div>

              {/* 썸네일 이미지 업로드 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">썸네일 이미지</label>
                <div className="space-y-2">
                  {thumbnailPreview && (
                    <div className="relative inline-block">
                      <img
                        src={thumbnailPreview}
                        alt="썸네일 미리보기"
                        className="w-24 h-24 object-cover rounded-md border border-gray-300"
                      />
                      <button
                        type="button"
                        onClick={removeThumbnail}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full text-xs hover:bg-red-600 flex items-center justify-center"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  )}

                  <div className="flex gap-2 items-center">
                    <input
                      ref={thumbnailInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleThumbnailChange}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => thumbnailInputRef.current?.click()}
                      className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-200 transition-colors"
                    >
                      파일 선택
                    </button>
                    <span className="text-xs text-gray-500">
                      {thumbnailFile ? thumbnailFile.name : '선택된 파일 없음'}
                    </span>
                  </div>

                  <input
                    type="text"
                    name="thumbnail"
                    value={formData.thumbnail}
                    onChange={(e) => {
                      handleChange(e)
                      if (e.target.value) {
                        setThumbnailFile(null)
                        setThumbnailPreview(e.target.value)
                      }
                    }}
                    placeholder="또는 이미지 URL 직접 입력"
                    className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-700 placeholder-gray-400 focus:border-gray-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* 추가 이미지 (수정 모드에서만) */}
              {editingProduct && (
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    추가 이미지 ({productImages.length}/10)
                  </label>

                  {productImages.length > 0 && (
                    <div className="flex flex-wrap gap-3 mb-3">
                      {productImages.map((img) => (
                        <div key={img.id} className="relative">
                          <img
                            src={img.image_url}
                            alt="상품 이미지"
                            className="w-20 h-20 object-cover rounded-md border border-gray-300"
                          />
                          <button
                            type="button"
                            onClick={() => handleImageDelete(img.id)}
                            className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs hover:bg-red-600 shadow-md"
                          >
                            <svg className="w-3 h-3 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {productImages.length < 10 && (
                    <div>
                      <input
                        ref={imagesInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImagesUpload}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => imagesInputRef.current?.click()}
                        disabled={uploadingImages}
                        className="px-4 py-2 border border-dashed border-gray-400 text-sm font-medium text-gray-600 rounded-md hover:border-gray-500 hover:text-gray-800 transition-colors disabled:opacity-50"
                      >
                        {uploadingImages ? '업로드 중...' : '+ 이미지 추가'}
                      </button>
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-6 py-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleChange}
                    className="w-4 h-4 rounded border-gray-400 text-gray-900 focus:ring-gray-500"
                  />
                  <span className="text-sm font-medium text-gray-700">활성화</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="isFeatured"
                    checked={formData.isFeatured}
                    onChange={handleChange}
                    className="w-4 h-4 rounded border-gray-400 text-gray-900 focus:ring-gray-500"
                  />
                  <span className="text-sm font-medium text-gray-700">추천 상품</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="isRentable"
                    checked={formData.isRentable}
                    onChange={handleChange}
                    className="w-4 h-4 rounded border-gray-400 text-gray-900 focus:ring-gray-500"
                  />
                  <span className="text-sm font-medium text-gray-700">렌트 가능</span>
                </label>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 py-2.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50 transition-colors"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-md hover:bg-gray-800 transition-colors"
                >
                  {editingProduct ? '수정' : '등록'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Products
