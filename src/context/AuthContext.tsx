'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export interface User {
  id: string
  email: string
  name: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  error: string | null
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = () => {
      try {
        const storedUser = localStorage.getItem('auth_user')
        if (storedUser) {
          setUser(JSON.parse(storedUser))
        }
      } catch (err) {
        console.error('Error checking session:', err)
      } finally {
        setLoading(false)
      }
    }

    checkSession()
  }, [])

  const signIn = async (email: string, password: string) => {
    setLoading(true)
    setError(null)

    try {
      // TODO: Replace with AWS Cognito authentication
      // Example AWS Cognito implementation:
      // import { Amplify, Auth } from 'aws-amplify'
      //
      // Amplify.configure({
      //   Auth: {
      //     region: process.env.NEXT_PUBLIC_COGNITO_REGION,
      //     userPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID,
      //     userPoolWebClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID,
      //   },
      // })
      //
      // const result = await Auth.signIn(email, password)
      // const userData: User = {
      //   id: result.username,
      //   email: result.attributes.email,
      //   name: result.attributes.name || email.split('@')[0],
      // }

      // Mock authentication for development
      if (!email || !password) {
        throw new Error('Email and password are required')
      }

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Mock user creation
      const mockUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        email,
        name: email.split('@')[0],
      }

      // Store in localStorage
      localStorage.setItem('auth_user', JSON.stringify(mockUser))
      setUser(mockUser)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Sign in failed'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    setLoading(true)
    setError(null)

    try {
      // TODO: Replace with AWS Cognito sign out
      // Example:
      // await Auth.signOut()

      // Clear local storage
      localStorage.removeItem('auth_user')
      setUser(null)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Sign out failed'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, error, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
