import api from './axios';

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authApi = {
  register:               (data)         => api.post('/auth/register', data),
  login:                  (data)         => api.post('/auth/login', data),
  getMe:                  ()             => api.get('/auth/me'),
  updateProfile:          (data)         => api.put('/auth/profile', data),   // FormData
  changePassword:         (data)         => api.put('/auth/change-password', data),
  getNotifications:       ()             => api.get('/auth/notifications'),
  markNotificationsRead:  ()             => api.put('/auth/notifications/read'),
  markConversationNotificationsRead: (conversationId) => api.put(`/auth/notifications/read/conversation/${conversationId}`),
  getSavedItems:          ()             => api.get('/auth/saved'),
  toggleSavedItem:        (data)         => api.post('/auth/saved', data),
  logout:                 ()             => api.post('/auth/logout'),

  // OAuth URLs (redirect, not axios)
  googleAuthUrl:    () => `${import.meta.env.VITE_API_URL || '/api'}/auth/google`,
  facebookAuthUrl:  () => `${import.meta.env.VITE_API_URL || '/api'}/auth/facebook`,
};

// ── Feed ──────────────────────────────────────────────────────────────────────
export const feedApi = {
  list: (params) => api.get('/feed', { params }),
  getComments: (itemType, itemId) => api.get(`/feed/${itemType}/${itemId}/comments`),
  addComment: (itemType, itemId, data) => api.post(`/feed/${itemType}/${itemId}/comments`, data),
  toggleLike: (itemType, itemId) => api.post(`/feed/${itemType}/${itemId}/like`),
};

// ── Uploads ───────────────────────────────────────────────────────────────────
export const uploadApi = {
  image: (data) => api.post('/upload/image', data, { timeout: 60000 }),
  images: (data) => api.post('/upload/images', data, { timeout: 120000 }),
  cover: (data) => api.post('/upload/cover', data, { timeout: 60000 }),
  logo:  (data) => api.post('/upload/logo', data, { timeout: 60000 }),
};

// ── Universities ──────────────────────────────────────────────────────────────
export const universityApi = {
  list:           (params)       => api.get('/universities', { params }),
  getFeatured:    ()             => api.get('/universities/featured'),
  getMine:        ()             => api.get('/universities/owner/mine'),
  getBySlug:      (slug)         => api.get(`/universities/${slug}`),
  create:         (data)         => api.post('/universities', data),
  update:         (id, data)     => api.put(`/universities/${id}`, data),
  remove:         (id)           => api.delete(`/universities/${id}`),

  // Gallery
  getGallery:     (uniId)        => api.get(`/universities/${uniId}/gallery`),
  uploadGallery:  (uniId, data)  => api.post(`/universities/${uniId}/gallery`, data),   // FormData
  reorderGallery: (uniId, data)  => api.put(`/universities/${uniId}/gallery/reorder`, data),
  deleteGallery:  (uniId, imgId) => api.delete(`/universities/${uniId}/gallery/${imgId}`),

  // Faculties
  getFaculties:   (uniId)        => api.get(`/universities/${uniId}/faculties`),
  createFaculty:  (uniId, data)  => api.post(`/universities/${uniId}/faculties`, data),
  updateFaculty:  (uniId, id, data) => api.put(`/universities/${uniId}/faculties/${id}`, data),
  deleteFaculty:  (uniId, id)    => api.delete(`/universities/${uniId}/faculties/${id}`),

  // Programs
  getPrograms:    (uniId)        => api.get(`/universities/${uniId}/programs`),
  createProgram:  (uniId, data)  => api.post(`/universities/${uniId}/programs`, data),
  updateProgram:  (uniId, id, data) => api.put(`/universities/${uniId}/programs/${id}`, data),
  deleteProgram:  (uniId, id)    => api.delete(`/universities/${uniId}/programs/${id}`),

  // News
  getNews:        (uniId)        => api.get(`/universities/${uniId}/news`),
  createNews:     (uniId, data)  => api.post(`/universities/${uniId}/news`, data),
  updateNews:     (uniId, id, d) => api.put(`/universities/${uniId}/news/${id}`, d),
  deleteNews:     (uniId, id)    => api.delete(`/universities/${uniId}/news/${id}`),

  // Events
  getEvents:      (uniId)        => api.get(`/universities/${uniId}/events`),
  createEvent:    (uniId, data)  => api.post(`/universities/${uniId}/events`, data),
  updateEvent:    (uniId, id, d) => api.put(`/universities/${uniId}/events/${id}`, d),
  deleteEvent:    (uniId, id)    => api.delete(`/universities/${uniId}/events/${id}`),

  // FAQs
  getFAQs:        (uniId)        => api.get(`/universities/${uniId}/faqs`),
  createFAQ:      (uniId, data)  => api.post(`/universities/${uniId}/faqs`, data),
  updateFAQ:      (uniId, id, d) => api.put(`/universities/${uniId}/faqs/${id}`, d),
  deleteFAQ:      (uniId, id)    => api.delete(`/universities/${uniId}/faqs/${id}`),

  // Contact
  getContact:     (uniId)        => api.get(`/universities/${uniId}/contact`),
  upsertContact:  (uniId, data)  => api.put(`/universities/${uniId}/contact`, data),

  // Reviews
  getReviews:     (uniId)        => api.get(`/universities/${uniId}/reviews`),
  createReview:   (uniId, data)  => api.post(`/universities/${uniId}/reviews`, data),
  getOwnerReviews:(uniId)        => api.get(`/universities/${uniId}/reviews/owner`),
  approveReview:  (uniId, id)    => api.put(`/universities/${uniId}/reviews/${id}/approve`),
  replyToReview:  (uniId, id, data) => api.put(`/universities/${uniId}/reviews/${id}/owner-reply`, data),
  flagReview:     (uniId, id, data) => api.put(`/universities/${uniId}/reviews/${id}/flag`, data),
  deleteReview:   (uniId, id)    => api.delete(`/universities/${uniId}/reviews/${id}`),

  // Analytics
  getAnalytics:   (uniId)        => api.get(`/analytics/${uniId}`),
  trackClick:     (data)         => api.post('/analytics/track', data),
};

// ── Organizations ─────────────────────────────────────────────────────────────
export const organizationApi = {
  getMine: () => api.get('/organizations/mine'),
  updateMine: (data) => api.put('/organizations/mine', data),
};

// ── Majors ────────────────────────────────────────────────────────────────────
export const majorApi = {
  list:              (params) => api.get('/majors', { params }),
  getFeatured:       ()       => api.get('/majors/featured'),
  getBySlug:         (slug)   => api.get(`/majors/${slug}`),
  getQuizQuestions:  ()       => api.get('/majors/quiz/questions'),
  getRecommendations:(data)   => api.post('/majors/quiz/recommend', data),
  create:            (data)   => api.post('/majors', data),
  update:            (id, data) => api.put(`/majors/${id}`, data),
  remove:            (id)     => api.delete(`/majors/${id}`),
};

// ── Inbox ─────────────────────────────────────────────────────────────────────
export const inboxApi = {
  searchUsers:           (q)          => api.get('/inbox/users/search', { params: { q } }),
  getConversations:      (params)     => api.get('/inbox/conversations', { params }),
  createConversation:    (data)       => api.post('/inbox/conversations', data),
  getMessages:           (id)         => api.get(`/inbox/conversations/${id}/messages`),
  sendMessage:           (id, data)   => api.post(`/inbox/conversations/${id}/messages`, data),
  markConversationRead:  (id)         => api.put(`/inbox/conversations/${id}/read`),
};

// ── Opportunities ─────────────────────────────────────────────────────────────
export const opportunityApi = {
  list:           (params)   => api.get('/opportunities', { params }),
  getFeatured:    ()         => api.get('/opportunities/featured'),
  getMine:        ()         => api.get('/opportunities/mine'),
  getBySlug:      (slug)     => api.get(`/opportunities/${slug}`),
  create:         (data)     => api.post('/opportunities', data),
  update:         (id, data) => api.put(`/opportunities/${id}`, data),
  remove:         (id)       => api.delete(`/opportunities/${id}`),
  apply:          (id, data) => api.post(`/opportunities/${id}/apply`, data),
};

// ── Admin ─────────────────────────────────────────────────────────────────────
export const adminApi = {
  getStats:           ()             => api.get('/admin/stats'),
  // Users
  getUsers:           (params)       => api.get('/admin/users', { params }),
  getUser:            (id)           => api.get(`/admin/users/${id}`),
  updateUser:         (id, data)     => api.put(`/admin/users/${id}`, data),
  deleteUser:         (id)           => api.delete(`/admin/users/${id}`),
  // Universities
  getUniversities:    (params)       => api.get('/admin/universities', { params }),
  createUniversity:   (data)         => api.post('/admin/universities', data),
  updateUniversity:   (id, data)     => api.put(`/admin/universities/${id}`, data),
  deleteUniversity:   (id)           => api.delete(`/admin/universities/${id}`),
  // Organizations
  getOrganizations:   (params)       => api.get('/admin/organizations', { params }),
  createOrganization: (data)         => api.post('/admin/organizations', data),
  updateOrganization: (id, data)     => api.put(`/admin/organizations/${id}`, data),
  deleteOrganization: (id)           => api.delete(`/admin/organizations/${id}`),
  // Feed
  getFeed:            (params)       => api.get('/admin/feed', { params }),
  updateFeedNews:     (id, data)     => api.put(`/admin/feed/news/${id}`, data),
  // Opportunities
  getOpportunities:   (params)       => api.get('/admin/opportunities', { params }),
  updateOpportunity:  (id, data)     => api.put(`/admin/opportunities/${id}`, data),
  deleteOpportunity:  (id)           => api.delete(`/admin/opportunities/${id}`),
  // Reviews
  getReviews:         (params)       => api.get('/admin/reviews', { params }),
  approveReview:      (id)           => api.put(`/admin/reviews/${id}/approve`),
  deleteReview:       (id)           => api.delete(`/admin/reviews/${id}`),
};
