import React, { useState, useEffect, useMemo } from 'react'
import { UserService } from './services/UserService'
import './app.css'

interface User {
    user_name?: string
    user_display_name?: string
    user_initials?: string
    user_avatar?: string
    user_sys_id?: string
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
        
        // Use the correct field names from the API response
        if (user.user_display_name) return user.user_display_name
        if (user.user_name) return user.user_name
        
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
            </div>
        </div>
    )
}