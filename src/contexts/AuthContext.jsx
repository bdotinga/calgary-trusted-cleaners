import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext({})

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [role, setRole]       = useState(null) // 'admin' | 'viewer'
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      resolveRole(session?.user ?? null)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      resolveRole(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  function resolveRole(u) {
    if (!u) { setRole(null); setLoading(false); return }
    // Role stored in user metadata set during creation
    const r = u.user_metadata?.role || 'viewer'
    setRole(r)
    setLoading(false)
  }

  const isAdmin  = role === 'admin'
  const isViewer = role === 'viewer'

  async function signIn(email, password) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error }
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ user, role, isAdmin, isViewer, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
