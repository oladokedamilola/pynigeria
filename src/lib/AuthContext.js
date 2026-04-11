"use client"
import { createContext, useContext, useEffect, useState } from "react"
import { getAccessToken, getRefreshToken, getUser, isTokenValid, clearSession } from "@/lib/auth"
import { refreshAccessToken } from "@/lib/api"

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkAuth() {
      const storedUser = getUser()
      const accessToken = getAccessToken()
      const refreshToken = getRefreshToken()

      if (storedUser && accessToken && isTokenValid(accessToken)) {
        // Access token still valid — just restore user
        setUser(storedUser)
      } else if (refreshToken) {
        // Access token expired but refresh token exists — silently get a new one
        try {
          const res = await refreshAccessToken({ refresh: refreshToken })
          const data = res?.data || res
          if (data?.access) {
            localStorage.setItem("access", data.access)
            if (data.refresh) localStorage.setItem("refresh", data.refresh)
            setUser(storedUser) // restore user from localStorage
          } else {
            clearSession()
          }
        } catch {
          // Refresh token also expired — full logout
          clearSession()
        }
      } else {
        clearSession()
      }
      setLoading(false)
    }
    checkAuth()
  }, [])

  const setSession = (data) => {
    if (!data) return
    if (data.access)  localStorage.setItem("access",  data.access)
    if (data.refresh) localStorage.setItem("refresh", data.refresh)
    // Strip tokens before storing user object
    const { access, refresh, requires_2fa, message, ...userFields } = data
    if (Object.keys(userFields).length) {
      localStorage.setItem("user", JSON.stringify(userFields))
      setUser(userFields)
    }
  }

  const login = (data) => {
    if (!data) return
    if (data.access)  localStorage.setItem("access",  data.access)
    if (data.refresh) localStorage.setItem("refresh", data.refresh)
    // Handle nested user object: { access, refresh, user: { email, ... } }
    // OR flat shape:             { access, refresh, email, username, ... }
    const userData = data.user || (() => {
      const { access, refresh, message, requires_2fa, ...rest } = data
      return rest
    })()
    if (userData && Object.keys(userData).length) {
      localStorage.setItem("user", JSON.stringify(userData))
      setUser(userData)
    }
  }

  const logout = () => {
    clearSession()
    setUser(null)
    window.location.href = "/login"
  }

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      isAuthenticated: !!user,  // ← renamed from isLoggedIn for consistency with your pages
      isLoading: loading,        // ← alias so pages can use isLoading too
      setSession,
      login,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}