import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import ScrollToTop from './components/ScrollToTop'
import Layout from './components/Layout'
import Home from './pages/Home'
import ProductList from './pages/ProductList'
import ProductDetail from './pages/ProductDetail'
import Rental from './pages/Rental'
import Ando from './pages/Ando'
import Login from './pages/Login'
import Register from './pages/Register'
import MyPage from './pages/MyPage'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import OrderComplete from './pages/OrderComplete'
import OrderDetail from './pages/OrderDetail'
import PaymentComplete from './pages/PaymentComplete'
import AuthCallback from './pages/AuthCallback'
import TossPaymentSuccess from './pages/TossPaymentSuccess'
import TossPaymentFail from './pages/TossPaymentFail'
import AdminLayout from './components/AdminLayout'
import AdminDashboard from './pages/admin/Dashboard'
import AdminProducts from './pages/admin/Products'
import AdminOrders from './pages/admin/Orders'
import AdminUsers from './pages/admin/Users'
import AdminRentalInquiries from './pages/admin/RentalInquiries'

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
    <>
      <ScrollToTop />
      <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="terrarium" element={<ProductList />} />
        <Route path="vivarium" element={<ProductList />} />
        <Route path="kit" element={<ProductList />} />
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
    </>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
