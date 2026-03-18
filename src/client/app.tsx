import React, { useState, useEffect, useMemo } from 'react'
import { UserService } from './services/UserService'
import './app.css'

interface User {
    name?: { display_value?: string; value?: string }
    first_name?: { display_value?: string; value?: string }
    last_name?: { display_value?: string; value?: string }
    user_name?: { display_value?: string; value?: string }
    email?: { display_value?: string; value?: string }
}

export default function App() {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const userService = useMemo(() => new UserService(), [])

    console.log('App component rendered')

    useEffect(() => {
        console.log('useEffect triggered')
        const fetchUser = async () => {
            try {
                setLoading(true)
                setError(null)
                console.log('Fetching user data...')
                const userData = await userService.getCurrentUser()
                console.log('User data received:', userData)
                setUser(userData)
            } catch (err: any) {
                console.error('Error fetching user:', err)
                setError('Failed to load user information: ' + (err.message || 'Unknown error'))
            } finally {
                setLoading(false)
            }
        }

        void fetchUser()
    }, [userService])

    const getUserDisplayName = () => {
        if (!user) return 'User'
        
        // Try to get a meaningful display name
        if (user.name?.display_value) return user.name.display_value
        if (user.name?.value) return user.name.value
        if (user.first_name?.display_value && user.last_name?.display_value) {
            return `${user.first_name.display_value} ${user.last_name.display_value}`
        }
        if (user.user_name?.display_value) return user.user_name.display_value
        if (user.user_name?.value) return user.user_name.value
        
        return 'User'
    }

    console.log('Current state:', { loading, error, user })

    if (loading) {
        return (
            <div className="app">
                <div className="loading">Loading user information...</div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="app">
                <div className="error-message">
                    <p>{error}</p>
                    <button onClick={() => window.location.reload()}>Retry</button>
                </div>
            </div>
        )
    }

    return (
        <div className="app">
            <div className="welcome-container">
                <h1>Hello, {getUserDisplayName()}!</h1>
                <p>Welcome to the ServiceNow SDK Component Pack</p>
                {process.env.NODE_ENV === 'development' && (
                    <details style={{ marginTop: '20px', textAlign: 'left' }}>
                        <summary>Debug Info</summary>
                        <pre>{JSON.stringify(user, null, 2)}</pre>
                    </details>
                )}
            </div>
        </div>
    )
}