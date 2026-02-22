import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import ErrorBoundary from './components/ErrorBoundary'
import ScrollToTop from './components/ScrollToTop'
import Layout from './components/Layout'
import Home from './pages/Home'

const ProductList = lazy(() => import('./pages/ProductList'))
const ProductDetail = lazy(() => import('./pages/ProductDetail'))
const Rental = lazy(() => import('./pages/Rental'))
const Ando = lazy(() => import('./pages/Ando'))
const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))
const MyPage = lazy(() => import('./pages/MyPage'))
const Cart = lazy(() => import('./pages/Cart'))
const Checkout = lazy(() => import('./pages/Checkout'))
const OrderComplete = lazy(() => import('./pages/OrderComplete'))
const OrderDetail = lazy(() => import('./pages/OrderDetail'))
const PaymentComplete = lazy(() => import('./pages/PaymentComplete'))
const AuthCallback = lazy(() => import('./pages/AuthCallback'))
const TossPaymentSuccess = lazy(() => import('./pages/TossPaymentSuccess'))
const TossPaymentFail = lazy(() => import('./pages/TossPaymentFail'))
const AdminLayout = lazy(() => import('./components/AdminLayout'))
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'))
const AdminProducts = lazy(() => import('./pages/admin/Products'))
const AdminOrders = lazy(() => import('./pages/admin/Orders'))
const AdminUsers = lazy(() => import('./pages/admin/Users'))
const AdminRentalInquiries = lazy(() => import('./pages/admin/RentalInquiries'))

function PageLoader() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000' }}>
      <p style={{ color: '#888' }}>로딩 중...</p>
    </div>
  )
}

// 인증 필요 라우트
function PrivateRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">로딩 중...</p>
      </div>
    )
  }

  return isAuthenticated ? children : <Navigate to="/login" />
}

// 비로그인 전용 라우트
function PublicRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">로딩 중...</p>
      </div>
    )
  }

  return isAuthenticated ? <Navigate to="/" /> : children
}

function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <ScrollToTop />
      <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="terrarium" element={<ProductList />} />
        <Route path="vivarium" element={<ProductList />} />
        <Route path="paludarium" element={<ProductList />} />
        <Route path="elements" element={<ProductList />} />
        <Route path="product/:id" element={<ProductDetail />} />
        <Route path="rental" element={<Rental />} />
        <Route path="ando" element={<Ando />} />
        <Route path="cart" element={<Cart />} />
        <Route
          path="login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />
        <Route
          path="mypage"
          element={
            <PrivateRoute>
              <MyPage />
            </PrivateRoute>
          }
        />
        <Route
          path="checkout"
          element={
            <PrivateRoute>
              <Checkout />
            </PrivateRoute>
          }
        />
        <Route
          path="order/complete/:id"
          element={
            <PrivateRoute>
              <OrderComplete />
            </PrivateRoute>
          }
        />
        <Route
          path="order/:id"
          element={
            <PrivateRoute>
              <OrderDetail />
            </PrivateRoute>
          }
        />
        <Route
          path="payment/complete"
          element={
            <PrivateRoute>
              <PaymentComplete />
            </PrivateRoute>
          }
        />
        {/* 소셜 로그인 콜백 */}
        <Route path="auth/callback" element={<AuthCallback />} />
        {/* 토스페이먼츠 결제 결과 */}
        <Route
          path="payment/toss/success"
          element={
            <PrivateRoute>
              <TossPaymentSuccess />
            </PrivateRoute>
          }
        />
        <Route
          path="payment/toss/fail"
          element={
            <PrivateRoute>
              <TossPaymentFail />
            </PrivateRoute>
          }
        />
      </Route>

      {/* 관리자 라우트 */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="rental-inquiries" element={<AdminRentalInquiries />} />
        <Route path="users" element={<AdminUsers />} />
      </Route>
    </Routes>
    </Suspense>
  )
}

function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ErrorBoundary>
    </BrowserRouter>
  )
}

export default App
