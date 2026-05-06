import axios from 'axios';

// const API_BASE_URL = 'http://localhost:3001/api/v1';
// export const IMG_BASE_URL = 'http://localhost:3000';

const API_BASE_URL = 'https://api.patelmanufacturing.com/api/v1';
export const IMG_BASE_URL = 'https://api.patelmanufacturing.com';


const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    // 'X-API-Key': '05050b9a15df3cfce1349dce8b197c5300996ae60bf191dddb063af09b7aa54d'
  }
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

const getDeviceInfo = () => {
  if (typeof navigator === 'undefined') return 'Web Admin Panel';
  const ua = navigator.userAgent;
  if (/iPad|iPhone|iPod/.test(ua)) return 'iOS App';
  if (/Android/.test(ua)) return 'Android App';
  if (/Chrome/.test(ua)) return 'Chrome on MacOS';
  if (/Firefox/.test(ua)) return 'Firefox on MacOS';
  if (/Safari/.test(ua)) return 'Safari on MacOS';
  return 'Web Admin Panel';
};

const getTokenExpiry = (token) => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000;
  } catch {
    return 0;
  }
};

const shouldRefreshToken = () => {
  const token = localStorage.getItem('token');
  if (!token) return false;
  const exp = getTokenExpiry(token);
  const hoursUntilExpiry = (exp - Date.now()) / (1000 * 60 * 60);
  return hoursUntilExpiry < 1;
};

// Add token and device info to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');

    // Inject X-Device-Info header
    config.headers = config.headers || {};
    config.headers['X-Device-Info'] = getDeviceInfo();

    // Allow auth requests to pass through without a token
    if (config.url && config.url.startsWith('/auth/')) {
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    }

    // If no token, reject the request (except for auth routes)
    if (!token) {
      const error = new Error('Authentication required');
      error.status = 401;
      return Promise.reject(error);
    }

    config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle token refresh on 401 errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Extract standardized error message if available
    if (error.response?.data?.message) {
      error.message = error.response.data.message;
    }

    // Handle 401 - try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken && !isRefreshing) {
        isRefreshing = true;

        try {
          const response = await api.post('/auth/refresh', { refreshToken });
          const data = response.data;

          if (data.success && data.data && data.data[0]) {
            const newToken = data.data[0].token;
            const newRefreshToken = data.data[0].refreshToken;

            localStorage.setItem('token', newToken);
            localStorage.setItem('refreshToken', newRefreshToken);

            processQueue(null, newToken);
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            isRefreshing = false;
            return api(originalRequest);
          } else {
            processQueue(new Error('Token refresh failed'), null);
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            window.location.href = '/login';
            isRefreshing = false;
            return Promise.reject(error);
          }
        } catch (refreshError) {
          processQueue(refreshError, null);
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          window.location.href = '/login';
          isRefreshing = false;
          return Promise.reject(refreshError);
        }
      }

      // Queue the failed request for retry after refresh
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      });
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  refreshToken: (refreshToken) => api.post('/auth/refresh', { refreshToken }),
  logout: (refreshToken) => api.post('/auth/logout', { refreshToken }),
  getSessions: () => api.get('/auth/sessions'),
  revokeSession: (id) => api.delete(`/auth/sessions/${id}`),
  revokeAllSessions: () => api.delete('/auth/sessions/all'),
  register: (userData) => api.post('/auth/register', userData),
};

// product API
export const productAPI = {
  getAll: (params) => api.get('/product', { params }),
  getOne: (id) => api.get(`/product/${id}`),
  create: (data) => api.post('/product', data),
  update: (id, data) => api.put(`/product/${id}`, data),
  delete: (id) => api.delete(`/product/${id}`),
  checkSlug: (slug, excludeId) => api.get('/product/check-slug', { params: { slug, exclude_id: excludeId } }),
};

// product API
export const uploadAPI = {
  single: (data) => api.post('/upload/single', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  multiple: (data) => api.post('/upload/multiple', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (filename, productId) => api.delete(`/upload/${filename}`, { data: { product_id: productId } }),
};

// Categories API
export const categoriesAPI = {
  getAll: (params) => api.get('/category', { params }),
  create: (data) => api.post('/category', data),
  update: (id, data) => api.put(`/category/${id}`, data),
  delete: (id) => api.delete(`/category/${id}`),
  uploadImage: (id, formData) => api.post(`/category/${id}/upload-image`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteImage: (id) => api.delete(`/category/${id}/delete-image`),
};

// filter API
export const filterAPI = {
  getAll: (params) => api.get('/filter', { params }),
  create: (data) => api.post('/filter', data),
  update: (id, data) => api.put(`/filter/${id}`, data),
  delete: (id) => api.delete(`/filter/${id}`),
};

// tech API
// export const techAPI = {
//   getAll: () => api.get('/tech'),
//   create: (data) => api.post('/tech', data),
//   update: (id, data) => api.put(`/tech/${id}`, data),
//   delete: (id) => api.delete(`/tech/${id}`),
// };

// project API
// export const projectAPI = {
//   getAll: () => api.get('/project'),
//   create: (data) => api.post('/project', data),
//   update: (id, data) => api.put(`/project/${id}`, data),
//   delete: (id) => api.delete(`/project/${id}`),
// };

// Order API
export const orderAPI = {
  create: (data) => api.post('/order', data),
  getAll: (params) => api.get('/order', { params }),
  getOne: (id) => api.get(`/order/${id}`),
  update: (id, data) => api.put(`/order/${id}`, data),
  delete: (id, restoreStock = 'true') => api.delete(`/order/${id}?restore_stock=${restoreStock}`),
};

export const userOrderAPI = {
  getAll: (params) => api.get('/order/user-orders', { params }),
  delete: (id, restoreStock = 'true') => api.delete(`/order/user-order/${id}?restore_stock=${restoreStock}`),
};

// Links API
// export const linksAPI = {
//   getAll: () => api.get('/links'),
//   create: (data) => api.post('/links', data),
//   update: (id, data) => api.put(`/links/${id}`, data),
//   delete: (id) => api.delete(`/links/${id}`),
//   activate: (id) => api.put(`/links/active/${id}`),
// };

// Contacts API
export const contactsAPI = {
  getAll: (params) => api.get('/contact', { params }),
  delete: (id) => api.delete(`/contact/${id}`),
};

// Coupon API
export const couponAPI = {
  getAll: (params) => api.get('/coupon', { params }),
  create: (data) => api.post('/coupon', data),
  update: (id, data) => api.put(`/coupon/${id}`, data),
  delete: (id) => api.delete(`/coupon/${id}`),
  validate: (data) => api.post('/coupon/validate', data),
};

// User API
export const userAPI = {
  getBulkUsers: () => api.get('/user/outstanding'),
  getBulkUserOutstanding: (userID) => api.get(`/user/outstanding/${userID}`),
  upsertBulkOutstanding: (data) => api.post('/user/outstanding', data),
  assignProductsToBulkUser: (data) => api.post('/user/assign-products', data),
  getBulkUserProducts: (userID) => api.get(`/user/products/${userID}`),
  bulkUpdate: (data) => api.put('/user/bulk-update', data),
  updateUser: (data) => api.put('/user/update', data),
  getAdminUsers: () => api.get('/user/admin-users'),
};

// Bulk Product API (Specialized Box Data)
export const bulkProductAPI = {
  create: (data) => api.post('/bulk-product', data),
  getByUser: (userID) => api.get(`/bulk-product/user/${userID}`),
  update: (id, data) => api.put(`/bulk-product/${id}`, data),
  delete: (id) => api.delete(`/bulk-product/${id}`),
};

// Bulk Order API
export const bulkOrderAPI = {
  getAll: (params) => api.get('/bulk-order/all', { params }),
  place: (data) => api.post('/bulk-order/place', data),
  getHistory: () => api.get('/bulk-order/history'),
  updateStatus: (id, status) => api.put(`/bulk-order/${id}/status`, { status }),
};

export const bulkMasterAPI = {
  getAll: () => api.get('/bulk-master'),
  create: (data) => api.post('/bulk-master', data),
  delete: (id) => api.delete(`/bulk-master/${id}`),
};

export const bulkMasterProductAPI = {
  getAll: () => api.get('/bulk-master-product'),
  create: (data) => api.post('/bulk-master-product', data),
  update: (id, data) => api.put(`/bulk-master-product/${id}`, data),
  delete: (id) => api.delete(`/bulk-master-product/${id}`),
  assign: (data) => api.post('/bulk-master-product/assign', data)
};

export const notificationAPI = {
  getAll: (params) => api.get('/notifications', { params }),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
  deleteNotification: (id) => api.delete(`/notifications/${id}`),
  deleteAllNotifications: () => api.delete('/notifications/delete-all'),
  registerToken: (data) => api.post('/notifications/register-token', data),
};

export default api;
