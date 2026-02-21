import { Component } from 'react'
import { Link } from 'react-router-dom'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#000',
          color: '#fff',
          padding: '20px',
        }}>
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ fontSize: '24px', marginBottom: '16px' }}>
              문제가 발생했습니다
            </h1>
            <p style={{ color: '#888', marginBottom: '24px' }}>
              페이지를 새로고침하거나 홈으로 이동해주세요.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={() => window.location.reload()}
                style={{
                  padding: '10px 24px',
                  background: '#333',
                  color: '#fff',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                새로고침
              </button>
              <Link
                to="/"
                onClick={() => this.setState({ hasError: false })}
                style={{
                  padding: '10px 24px',
                  background: '#fff',
                  color: '#000',
                  textDecoration: 'none',
                }}
              >
                홈으로
              </Link>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
