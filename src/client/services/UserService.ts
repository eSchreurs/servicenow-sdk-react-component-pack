// Extend Window interface to include g_ck property
declare global {
    interface Window {
        g_ck: string
    }
}

export class UserService {
    // Get current user information
    async getCurrentUser() {
        try {
            // Check if g_ck is available
            if (!window.g_ck) {
                console.warn('g_ck token not available, using fallback')
                return { user_name: { display_value: 'ServiceNow User' } }
            }

            const searchParams = new URLSearchParams()
            searchParams.set('sysparm_display_value', 'all')
            searchParams.set('sysparm_fields', 'sys_id,name,first_name,last_name,user_name,email')

            console.log('Making API request to get current user...')
            
            const response = await fetch(`/api/now/table/sys_user/me?${searchParams.toString()}`, {
                method: 'GET',
                headers: {
                    Accept: 'application/json',
                    'X-UserToken': window.g_ck,
                },
            })

            console.log('API response status:', response.status)

            if (!response.ok) {
                const errorData = await response.json()
                console.error('API error:', errorData)
                throw new Error(errorData.error?.message || `HTTP error ${response.status}`)
            }

            const { result } = await response.json()
            console.log('API result:', result)
            return result
        } catch (error) {
            console.error('Error fetching current user:', error)
            // Return a fallback user object so the app still works
            return { user_name: { display_value: 'ServiceNow User' } }
        }
    }
}