"use client"
import { createContext, useContext, useEffect, useState } from "react"
import { getAccessToken, getRefreshToken, getUser, isTokenValid, clearSession } from "@/lib/auth"
import { refreshAccessToken } from "@/lib/api"

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  // ... existing checkAuth useEffect stays the same ...

  // Called right after a successful login API response
  // Persists tokens + user to localStorage AND updates React state immediately
  const setSession = (data) => {
    if (!data) return
    if (data.access)  localStorage.setItem("access",  data.access)
    if (data.refresh) localStorage.setItem("refresh", data.refresh)

    // Strip tokens from the user object before storing
    const { access, refresh, requires_2fa, ...userFields } = data
    if (Object.keys(userFields).length) {
      localStorage.setItem("user", JSON.stringify(userFields))
      setUser(userFields)   // ← this is the key line — updates global auth state instantly
    }
  }

  const login = ()=>{
    setSession(data)
    setUser(data.user)
  }

  const logout = () => {
    clearSession()
    setUser(null)
    window.location.href = "/login"
  }

  return (
    <AuthContext.Provider value={{ user, loading, isLoggedIn: !!user, setSession, logout , login }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}