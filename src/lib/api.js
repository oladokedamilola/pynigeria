import axios from "axios";

const backend_host = "http://localhost:8000/api/v1"
const pro_backend_host = "https://pynigeria-backend.onrender.com/api/v1"
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || pro_backend_host ;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true, // sends cookies (needed for CSRF + session auth)
});

// ── Intercept every request to attach JWT token + CSRF ──────────────────────
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
  }
  return config;
});

// ── Intercept responses — auto logout on 401 ────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/account/signin";
    }
    return Promise.reject(error);
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/** Fetch CSRF token from Django before mutating requests */
export const getCsrfToken = async () => {
  const res  = await api.get("/authentication/csrfToken/");
  return res.data.csrfToken;
};

/** Attach CSRF header to a config object */
const withCsrf = async (config = {}) => {
  const csrfToken = await getCsrfToken();
  return {
    ...config,
    headers: { ...config.headers, "X-CSRFToken": csrfToken },
  };
};


// ─────────────────────────────────────────────────────────────────────────────
// AUTH  (/auth/*)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Register a new user
 * POST /auth/register/
 * Body: { email, password, first_name, last_name, username }
 */
export const register = async (data) => {
  const config   = await withCsrf();
  const response = await api.post("/authentication/register/", data, config);
  return response.data;
};

/**
 * Log in with email + password
 * POST /auth/login/
 * Body: { email, password }
 */
export const login = async (data) => {
  const config   = await withCsrf();
  const response = await api.post("/authentication/login/", data, config);
  return response.data;
};

/**
 * Log in with JWT (SimpleJWT token pair)
 * POST /auth/login/ or /jobs/login/
 * Returns: { access, refresh }
 */
export const loginJWT = async (data) => {
  const config   = await withCsrf();
  const response = await api.post("/jobs/login/", data, config);
  return response.data;
};

/**
 * Begin email verification (resend)
 * POST /auth/verify-email/begin/
 * Body: { email }
 */
export const verifyEmailBegin = async (data) => {
  const config   = await withCsrf();
  const response = await api.post("/authentication/verify-email/begin/", data, config);
  return response.data;
};

/**
 * Complete email verification via token
 * POST /auth/verify-email/complete/:token/
 */
export const verifyEmailComplete = async (token) => {
  const config   = await withCsrf();
  const response = await api.post(`/authentication/verify-email/complete/${token}/`, {}, config);
  return response.data;
};

/**
 * Create a TOTP (2FA) device
 * POST /auth/totp-device/create/
 * Body: { email } or user identifier
 */
export const createTOTPDevice = async (data) => {
  const config   = await withCsrf();
  const response = await api.post("/authentication/totp-device/create/", data, config);
  return response.data;
};

/**
 * Get QR code PNG for 2FA setup
 * POST /auth/totp-device/qrcode/
 * Returns: image/png binary
 */
export const getTOTPQRCode = async (data) => {
  const config   = await withCsrf();
  const response = await api.post("/authentication/totp-device/qrcode/", data, {
    ...config,
    responseType: "blob",
  });
  return response.data; // Blob — use URL.createObjectURL()
};

/**
 * Verify a TOTP code
 * POST /auth/totp-device/verify/
 * Body: { token, code }
 */
export const verifyTOTPDevice = async (data) => {
  const config   = await withCsrf();
  const response = await api.post("/authentication/totp-device/verify/", data, config);
  return response.data;
};

/**
 * Begin social OAuth (Google, GitHub etc.)
 * GET /auth/social/begin/:provider/
 * Redirect — call window.location.href directly
 */
export const getSocialAuthUrl = (provider) =>
  `${API_BASE_URL}/authentication/social/begin/${provider}/`;

/**
 * Change password
 * POST /auth/password/change/
 * Body: { old_password, new_password }
 */
export const changePassword = async (data) => {
  const config   = await withCsrf();
  const response = await api.post("/authentication/password/change/", data, config);
  return response.data;
};


// ─────────────────────────────────────────────────────────────────────────────
// JOBS  (/jobs/*)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * List jobs (paginated, filterable)
 * GET /jobs/job/job-list/
 * Params: { search, employment_type, ordering, page }
 */
export const getJobs = async (params = {}) => {
  const response = await api.get("/jobs/job/job-list/", { params });
  return response.data;
};

/**
 * Get single job by slug
 * GET /jobs/job/:slug/
 */
export const getJob = async (slug) => {
  const response = await api.get(`/jobs/job/${slug}/`);
  return response.data;
};

/**
 * Post a new job
 * POST /jobs/job/
 * Body: { job_title, employment_type, description, tags, job_skills, ... }
 */
export const createJob = async (data) => {
  const config   = await withCsrf();
  const response = await api.post("/jobs/job/", data, config);
  return response.data;
};

/**
 * Update a job (full)
 * PUT /jobs/job/:slug/
 */
export const updateJob = async (slug, data) => {
  const config   = await withCsrf();
  const response = await api.put(`/jobs/job/${slug}/`, data, config);
  return response.data;
};

/**
 * Partially update a job
 * PATCH /jobs/job/:slug/
 */
export const patchJob = async (slug, data) => {
  const config   = await withCsrf();
  const response = await api.patch(`/jobs/job/${slug}/`, data, config);
  return response.data;
};

/**
 * Delete a job
 * DELETE /jobs/job/:slug/
 */
export const deleteJob = async (slug) => {
  const config   = await withCsrf();
  const response = await api.delete(`/jobs/job/${slug}/`, config);
  return response.data;
};

/**
 * Approve or reject a job (admin only)
 * POST /jobs/job/approve/:slug/
 * Body: { is_approved, message? }
 */
export const approveJob = async (slug, data) => {
  const config   = await withCsrf();
  const response = await api.post(`/jobs/job/approve/${slug}/`, data, config);
  return response.data;
};


// ─────────────────────────────────────────────────────────────────────────────
// BOOKMARKS  (/jobs/bookmark/*)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get all bookmarks for the logged-in user
 * GET /jobs/bookmark/
 */
export const getBookmarks = async () => {
  const response = await api.get("/jobs/bookmark/");
  return response.data;
};

/**
 * Create a bookmark
 * POST /jobs/bookmark/
 * Body: { job, folder? }
 */
export const createBookmark = async (data) => {
  const config   = await withCsrf();
  const response = await api.post("/jobs/bookmark/", data, config);
  return response.data;
};

/**
 * Delete a bookmark
 * DELETE /jobs/bookmark/:id/
 */
export const deleteBookmark = async (id) => {
  const config   = await withCsrf();
  const response = await api.delete(`/jobs/bookmark/${id}/`, config);
  return response.data;
};

/**
 * Get all bookmark folders
 * GET /jobs/bookmark-folders/
 */
export const getBookmarkFolders = async () => {
  const response = await api.get("/jobs/bookmark-folders/");
  return response.data;
};

/**
 * Create a bookmark folder
 * POST /jobs/bookmark-folders/
 * Body: { name }
 */
export const createBookmarkFolder = async (data) => {
  const config   = await withCsrf();
  const response = await api.post("/jobs/bookmark-folders/", data, config);
  return response.data;
};

/**
 * Update a bookmark folder
 * PATCH /jobs/bookmark-folders/:id/
 */
export const updateBookmarkFolder = async (id, data) => {
  const config   = await withCsrf();
  const response = await api.patch(`/jobs/bookmark-folders/${id}/`, data, config);
  return response.data;
};

/**
 * Delete a bookmark folder
 * DELETE /jobs/bookmark-folders/:id/
 */
export const deleteBookmarkFolder = async (id) => {
  const config   = await withCsrf();
  const response = await api.delete(`/jobs/bookmark-folders/${id}/`, config);
  return response.data;
};


// ─────────────────────────────────────────────────────────────────────────────
// PROFILE  (/profile/*)   — wire up when you build the profile API
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get a public profile by username
 * GET /profile/:username/
 */
export const getProfile = async (username) => {
  const response = await api.get(`/profile/${username}/`);
  return response.data;
};

/**
 * Update own profile
 * PATCH /profile/update/
 * Body: { first_name, last_name, bio, location, github, twitter, linkedin, website, skills }
 */
export const updateProfile = async (data) => {
  const config   = await withCsrf();
  const response = await api.patch("/profile/update/", data, config);
  return response.data;
};

/**
 * Upload a profile avatar
 * PATCH /profile/update/  with multipart/form-data
 */
export const uploadAvatar = async (file) => {
  const csrfToken = await getCsrfToken();
  const formData  = new FormData();
  formData.append("avatar", file);
  const response = await api.patch("/profile/update/", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      "X-CSRFToken":  csrfToken,
    },
  });
  return response.data;
};


// ─────────────────────────────────────────────────────────────────────────────
// RESOURCES  (/resources/*)   — wire up when backend is ready
// ─────────────────────────────────────────────────────────────────────────────

/**
 * List all resources (with optional category / search filter)
 * GET /resources/?category=&search=
 */
export const getResources = async (params = {}) => {
  const response = await api.get("/resources/", { params });
  return response.data;
};

/**
 * Submit a community resource
 * POST /resources/
 * Body: { title, description, category, file_url, tags }
 */
export const submitResource = async (data) => {
  const config   = await withCsrf();
  const response = await api.post("/resources/", data, config);
  return response.data;
};

/**
 * Increment download count for a resource
 * POST /resources/:id/download/
 */
export const trackDownload = async (id) => {
  const config   = await withCsrf();
  const response = await api.post(`/resources/${id}/download/`, {}, config);
  return response.data;
};


// ─────────────────────────────────────────────────────────────────────────────
// WEEKLY CHALLENGES  (/challenges/*)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * List all challenges
 * GET /challenges/
 */
export const getChallenges = async () => {
  const response = await api.get("/challenges/");
  return response.data;
};

/**
 * Get a single challenge
 * GET /challenges/:id/
 */
export const getChallenge = async (id) => {
  const response = await api.get(`/challenges/${id}/`);
  return response.data;
};

/**
 * Submit a challenge solution
 * POST /challenges/:id/submit/
 * Body: { github_url, notes? }
 */
export const submitChallenge = async (id, data) => {
  const config   = await withCsrf();
  const response = await api.post(`/challenges/${id}/submit/`, data, config);
  return response.data;
};

/**
 * Suggest a new challenge idea
 * POST /challenges/suggest/
 * Body: { title, description, difficulty }
 */
export const suggestChallenge = async (data) => {
  const config   = await withCsrf();
  const response = await api.post("/challenges/suggest/", data, config);
  return response.data;
};


// ─────────────────────────────────────────────────────────────────────────────
// TECH NEWS  (/news/*)   — wire up when backend is ready
// ─────────────────────────────────────────────────────────────────────────────

/**
 * List news articles (paginated)
 * GET /news/?page=&category=
 */
export const getNews = async (params = {}) => {
  const response = await api.get("/news/", { params });
  return response.data;
};

/**
 * Get a single news article
 * GET /news/:slug/
 */
export const getNewsArticle = async (slug) => {
  const response = await api.get(`/news/${slug}/`);
  return response.data;
};


// ─────────────────────────────────────────────────────────────────────────────
export default api;
