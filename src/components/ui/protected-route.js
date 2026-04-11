"use client"
import { useAuth } from "@/lib/AuthContext"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()  // ← fix here
  const router = useRouter()

  useEffect(() => {
    if (!loading && !isAuthenticated) {  // ← and here
      router.push("/login")
    }
  }, [isAuthenticated, loading, router])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin" />
    </div>
  )

  if (!isAuthenticated) return null  // ← and here

  return children
}