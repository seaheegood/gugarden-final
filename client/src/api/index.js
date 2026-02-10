import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  withCredentials: true,
})

// 요청 인터셉터 - Content-Type 설정
api.interceptors.request.use(
  (config) => {
    // FormData가 아닌 경우에만 Content-Type을 application/json으로 설정
    // FormData인 경우 axios가 자동으로 multipart/form-data와 boundary를 설정
    if (!(config.data instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json'
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 응답 인터셉터 - 에러 처리
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
