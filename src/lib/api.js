import { API_BASE_URL } from "@/constants";

// ─────────────────────────────────────────────────────────────────────────────
// CORE FETCH WRAPPER
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Build request headers.
 * Mirrors the old Axios request interceptor:
 *   - Always sets Content-Type: application/json (unless overridden)
 *   - Attaches Bearer token from localStorage if present
 */
function buildHeaders(extra = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...extra,
  };
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

/**
 * Handle 401 globally — mirrors the old Axios response interceptor.
 * Clears localStorage and redirects to /login.
 */
function handle401() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  }
}

/**
 * Core request function — replaces `axios.create()` + interceptors.
 *
 * @param {string} path       - API path e.g. "/authentication/login/"
 * @param {object} options    - fetch options (method, headers, body, etc.)
 * @param {"json"|"blob"|"text"} responseType - how to parse the response body
 * @returns {Promise<{ data: any, status: number, headers: Headers }>}
 */
async function request(path, options = {}, responseType = "json") {
  const url = `${API_BASE_URL}${path}`;

  const res = await fetch(url, {
    credentials: "include", // replaces withCredentials: true (sends cookies for CSRF + session)
    ...options,
    headers: buildHeaders(options.headers),
  });

  // ── 401 auto-logout ──────────────────────────────────────────────────────
  if (res.status === 401) {
    handle401();
    // Still throw so callers can catch if needed
    const err = new Error("Unauthorized");
    err.response = { status: 401, data: null };
    throw err;
  }

  // ── Parse body ───────────────────────────────────────────────────────────
  let data;
  if (responseType === "blob") {
    data = await res.blob();
  } else if (responseType === "text") {
    data = await res.text();
  } else {
    // JSON — guard against empty bodies (e.g. 204 No Content)
    const text = await res.text();
    data = text ? JSON.parse(text) : null;
  }

  // ── Non-2xx → throw in the same shape the old Axios errors had ───────────
  if (!res.ok) {
    const err = new Error(`HTTP ${res.status}`);
    err.response = { status: res.status, data };
    throw err;
  }

  return { data, status: res.status, headers: res.headers };
}

// Convenience method shortcuts (mirrors axios instance methods used in this file)
const api = {
  get:    (path, options = {})        => request(path, { method: "GET",    ...options }),
  post:   (path, body, options = {})  => request(path, { method: "POST",   body: JSON.stringify(body), ...options }),
  put:    (path, body, options = {})  => request(path, { method: "PUT",    body: JSON.stringify(body), ...options }),
  patch:  (path, body, options = {})  => request(path, { method: "PATCH",  body: JSON.stringify(body), ...options }),
  delete: (path, options = {})        => request(path, { method: "DELETE", ...options }),
};


// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/** Fetch CSRF token from Django before mutating requests */
export const getCsrfToken = async () => {
  const res = await api.get("/authentication/csrfToken/");
  return res.data.csrfToken;
};

/** Returns a headers object with the CSRF token injected */
const withCsrf = async (extraHeaders = {}) => {
  const csrfToken = await getCsrfToken();
  return { headers: { "X-CSRFToken": csrfToken, ...extraHeaders } };
};


// ─────────────────────────────────────────────────────────────────────────────
// AUTH  (/authentication/*)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Register a new user
 * POST /authentication/register/
 * Body: { email, password, first_name, last_name, username }
 */
export const register = async (data) => {
  const config   = await withCsrf();
  const res      = await api.post("/authentication/register/", data, config);
  return res.data;
};

/**
 * Log in with email + password
 * POST /authentication/login/
 * Body: { email, password }
 */
export const loginAPI = async (data) => {
  const config = await withCsrf();
  const res    = await api.post("/authentication/login/", data, config);
  return res.data;
};

/**
 * Log in with JWT (SimpleJWT token pair)
 * POST /jobs/login/
 * Returns: { access, refresh }
 */
export const loginJWT = async (data) => {
  const config = await withCsrf();
  const res    = await api.post("/jobs/login/", data, config);
  return res.data;
};

/**
 * Log in with TOTP (email and OTP token)
 * POST /authentication/totp-login/
 * Returns: { access, refresh }
 */
export const loginTOTP = async (data) => {
  console.log(data)
  const config = await withCsrf();
  const res    = await api.post("/authentication/verify-email/complete/", data, config);
  return res.data;
};

/**
 * Begin email verification (resend)
 * POST /authentication/verify-email/begin/
 * Body: { email }
 */
export const verifyEmailBegin = async (data) => {
  const config = await withCsrf();
  const res    = await api.post("/authentication/verify-email/begin/", data, config);
  return res.data;
};

/**
 * Complete email verification via token
 * POST /authentication/verify-email/complete/:token/
 */
export const verifyEmailComplete = async (token) => {
  const config = await withCsrf();
  const res    = await api.post(`/authentication/verify-email/complete/?token=${encodeURIComponent(token)}`,{}, config);
  return res.data;
};

/**
 * Create a TOTP (2FA) device
 * POST /authentication/totp-device/create/
 */
export const createTOTPDevice = async (data) => {
  const config = await withCsrf();
  const res    = await api.post("/authentication/totp-device/create/", data, config);
  return res.data;
};

/**
 * Get QR code PNG for 2FA setup
 * POST /authentication/totp-device/qrcode/
 * Returns: Blob — use URL.createObjectURL()
 */
export const getTOTPQRCode = async (data) => {
  const csrfToken = await getCsrfToken();
  const url       = `${API_BASE_URL}/authentication/totp-device/qrcode/`;

  const res = await fetch(url, {
    method:      "POST",
    credentials: "include",
    headers:     buildHeaders({ "X-CSRFToken": csrfToken }),
    body:        JSON.stringify(data),
  });

  if (!res.ok) {
    const err = new Error(`HTTP ${res.status}`);
    err.response = { status: res.status, data: null };
    throw err;
  }

  return res.blob(); // caller: URL.createObjectURL(blob)
};

/**
 * Verify a TOTP code
 * POST /authentication/totp-device/verify/
 * Body: { token, code }
 */
export const verifyTOTPDevice = async (data) => {
  const config = await withCsrf();
  const res    = await api.post("/authentication/totp-device/verify/", data, config);
  return res.data;
};

/**
 * Begin social OAuth (Google, GitHub etc.)
 * Redirect — call window.location.href directly
 */
export const getSocialAuthUrl = (provider) =>
  `${API_BASE_URL}/authentication/social/begin/${provider}/`;

/**
 * Change password
 * POST /authentication/password/change/
 * Body: { old_password, new_password }
 */
export const changePassword = async (data) => {
  const config = await withCsrf();
  const res    = await api.post("/authentication/password/change/", data, config);
  return res.data;
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
  const query = new URLSearchParams(params).toString();
  const res   = await api.get(`/jobs/job/job-list/${query ? `?${query}` : ""}`);
  return res.data;
};

/**
 * Get single job by slug
 * GET /jobs/job/:slug/
 */
export const getJob = async (slug) => {
  const res = await api.get(`/jobs/job/${slug}/`);
  return res.data;
};

/**
 * Post a new job
 * POST /jobs/job/
 */
export const createJob = async (data) => {
  const config = await withCsrf();
  const res    = await api.post("/jobs/job/", data, config);
  return res.data;
};

/**
 * Update a job (full)
 * PUT /jobs/job/:slug/
 */
export const updateJob = async (slug, data) => {
  const config = await withCsrf();
  const res    = await api.put(`/jobs/job/${slug}/`, data, config);
  return res.data;
};

/**
 * Partially update a job
 * PATCH /jobs/job/:slug/
 */
export const patchJob = async (slug, data) => {
  const config = await withCsrf();
  const res    = await api.patch(`/jobs/job/${slug}/`, data, config);
  return res.data;
};

/**
 * Delete a job
 * DELETE /jobs/job/:slug/
 */
export const deleteJob = async (slug) => {
  const config = await withCsrf();
  const res    = await api.delete(`/jobs/job/${slug}/`, config);
  return res.data;
};

/**
 * Approve or reject a job (admin only)
 * POST /jobs/job/approve/:slug/
 * Body: { is_approved, message? }
 */
export const approveJob = async (slug, data) => {
  const config = await withCsrf();
  const res    = await api.post(`/jobs/job/approve/${slug}/`, data, config);
  return res.data;
};


// ─────────────────────────────────────────────────────────────────────────────
// BOOKMARKS  (/jobs/bookmark/*)
// ─────────────────────────────────────────────────────────────────────────────

export const getBookmarks = async () => {
  const res = await api.get("/jobs/bookmark/");
  return res.data;
};

export const createBookmark = async (data) => {
  const config = await withCsrf();
  const res    = await api.post("/jobs/bookmark/", data, config);
  return res.data;
};

export const deleteBookmark = async (id) => {
  const config = await withCsrf();
  const res    = await api.delete(`/jobs/bookmark/${id}/`, config);
  return res.data;
};

export const getBookmarkFolders = async () => {
  const res = await api.get("/jobs/bookmark-folders/");
  return res.data;
};

export const createBookmarkFolder = async (data) => {
  const config = await withCsrf();
  const res    = await api.post("/jobs/bookmark-folders/", data, config);
  return res.data;
};

export const updateBookmarkFolder = async (id, data) => {
  const config = await withCsrf();
  const res    = await api.patch(`/jobs/bookmark-folders/${id}/`, data, config);
  return res.data;
};

export const deleteBookmarkFolder = async (id) => {
  const config = await withCsrf();
  const res    = await api.delete(`/jobs/bookmark-folders/${id}/`, config);
  return res.data;
};


// ─────────────────────────────────────────────────────────────────────────────
// PROFILE  (/profile/*)
// ─────────────────────────────────────────────────────────────────────────────

export const getProfile = async (username) => {
  const res = await api.get(`/profile/${username}/`);
  return res.data;
};

export const updateProfile = async (data) => {
  const config = await withCsrf();
  const res    = await api.patch("/profile/update/", data, config);
  return res.data;
};

/**
 * Upload a profile avatar
 * PATCH /profile/update/ with multipart/form-data
 * Note: Content-Type must NOT be set manually — fetch sets it with the boundary automatically
 */
export const uploadAvatar = async (file) => {
  const csrfToken = await getCsrfToken();
  const formData  = new FormData();
  formData.append("avatar", file);

  // Build headers manually — omit Content-Type so fetch can set multipart boundary
  const headers = {};
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }
  headers["X-CSRFToken"] = csrfToken;

  const res = await fetch(`${API_BASE_URL}/profile/update/`, {
    method:      "PATCH",
    credentials: "include",
    headers,
    body:        formData, // fetch handles multipart boundary automatically
  });

  if (res.status === 401) { handle401(); return; }
  if (!res.ok) {
    const err = new Error(`HTTP ${res.status}`);
    err.response = { status: res.status, data: await res.json().catch(() => null) };
    throw err;
  }
  return res.json();
};


// ─────────────────────────────────────────────────────────────────────────────
// RESOURCES  (/resources/*)
// ─────────────────────────────────────────────────────────────────────────────

export const getResources = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const res   = await api.get(`/resources/${query ? `?${query}` : ""}`);
  return res.data;
};

export const submitResource = async (data) => {
  const config = await withCsrf();
  const res    = await api.post("/resources/", data, config);
  return res.data;
};

export const trackDownload = async (id) => {
  const config = await withCsrf();
  const res    = await api.post(`/resources/${id}/download/`, {}, config);
  return res.data;
};


// ─────────────────────────────────────────────────────────────────────────────
// WEEKLY CHALLENGES  (/challenges/*)
// ─────────────────────────────────────────────────────────────────────────────

export const getChallenges = async () => {
  const res = await api.get("/challenges/");
  return res.data;
};

export const getChallenge = async (id) => {
  const res = await api.get(`/challenges/${id}/`);
  return res.data;
};

export const submitChallenge = async (id, data) => {
  const config = await withCsrf();
  const res    = await api.post(`/challenges/${id}/submit/`, data, config);
  return res.data;
};

export const suggestChallenge = async (data) => {
  const config = await withCsrf();
  const res    = await api.post("/challenges/suggest/", data, config);
  return res.data;
};


// ─────────────────────────────────────────────────────────────────────────────
// TECH NEWS  (/news/*)
// ─────────────────────────────────────────────────────────────────────────────

export const getNews = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const res   = await api.get(`/news/${query ? `?${query}` : ""}`);
  return res.data;
};

export const getNewsArticle = async (slug) => {
  const res = await api.get(`/news/${slug}/`);
  return res.data;
};


// ─────────────────────────────────────────────────────────────────────────────
export default api;