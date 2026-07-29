import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('admin_token');
  if (token) config.headers['Authorization'] = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  res => res,
  err => {
    const status = err?.response?.status;
    const url    = err?.config?.url || '';

    console.error(`[API] ${err?.config?.method?.toUpperCase()} ${url} →`,
                  err.response?.data || err.message);

    if (status === 401 && !url.includes('/api/auth/login')) {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      if (window.location.pathname.startsWith('/admin')) {
        window.location.href = '/admin/login';
      }
    }

    return Promise.reject(err);
  }
);

// Auth
export const loginAdmin  = (data) => api.post('/api/auth/login', data);
export const logoutAdmin = ()     => api.post('/api/auth/logout');
export const verifyToken = ()     => api.post('/api/auth/verify');
export const getMe       = ()     => api.get('/api/auth/me');

// Products
export const getProducts    = (category) =>
  api.get('/api/products', { params: category ? { category } : {} });
export const getProductById = (id)       => api.get(`/api/products/${id}`);
export const createProduct  = (data)     => api.post('/api/products', data);
export const updateProduct  = (id, data) => api.put(`/api/products/${id}`, data);
export const deleteProduct  = (id)       => api.delete(`/api/products/${id}`);

// Orders — plain JSON, no multipart
export const createOrder = (orderData) => api.post('/api/orders', orderData);

export const getOrders          = ()           => api.get('/api/orders');
export const getOrderById       = (id)         => api.get(`/api/orders/${id}`);
export const confirmOrder       = (id)         => api.put(`/api/orders/${id}/confirm`);
export const deleteOrder        = (id)         => api.delete(`/api/orders/${id}`);
export const updateOrderStatus  = (id, status) =>
  api.put(`/api/orders/admin/${id}/status`, { status });
export const cancelOrder        = (id, reason = '') =>
  api.put(`/api/orders/${id}/cancel`, { reason });
export const getCancelledOrders = ()           => api.get('/api/orders/cancelled');
export const updateRefundStatus = (id, refundStatus) =>
  api.put(`/api/orders/admin/${id}/refund`, { refundStatus });
export const updatePaymentStatus = (id, paymentStatus) =>
  api.put(`/api/orders/admin/${id}/payment-status`, { paymentStatus });

// Reviews
export const getReviews   = (productId) => api.get(`/api/reviews/${productId}`);
export const createReview = (data)      => api.post('/api/reviews', data);
export const deleteReview = (reviewId)  => api.delete(`/api/reviews/${reviewId}`);

// Settings
export const getSettings    = ()     => api.get('/api/settings');
export const updateSettings = (data) => api.put('/api/settings', data);

// Contact
export const sendContactMessage = (data) => api.post('/api/contact', data);
export const sendQuickMessage   = (data) => api.post('/api/contact/quick', data);

// Product Variants
export const getVariants     = (productId)           => api.get(`/products/${productId}/variants`);
export const replaceVariants = (productId, variants) => api.put(`/products/${productId}/variants`, variants);
export const addVariant      = (productId, dto)      => api.post(`/products/${productId}/variants`, dto);
export const updateVariant   = (variantId, dto)      => api.put(`/variants/${variantId}`, dto);
export const deleteVariant   = (variantId)           => api.delete(`/variants/${variantId}`);

export default api;
