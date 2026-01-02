/**
 * Get CSRF token from cookie (Laravel sets XSRF-TOKEN cookie)
 */
function getCsrfTokenFromCookie(): string | null {
    const name = 'XSRF-TOKEN=';
    const decodedCookie = decodeURIComponent(document.cookie);
    const ca = decodedCookie.split(';');
    
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) === 0) {
            return decodeURIComponent(c.substring(name.length, c.length));
        }
    }
    return null;
}

/**
 * Refresh CSRF token from server
 * This ensures we always have a fresh, valid CSRF token before making requests
 */
export async function refreshCsrfToken(): Promise<void> {
    try {
        await fetch('/sanctum/csrf-cookie', {
            method: 'GET',
            credentials: 'same-origin',
        });
        
        // Wait for cookie to be set
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // Update meta tag with fresh token from cookie
        const freshToken = getCsrfTokenFromCookie();
        if (freshToken) {
            const metaTag = document.querySelector('meta[name="csrf-token"]');
            if (metaTag) {
                metaTag.setAttribute('content', freshToken);
                console.log('✅ CSRF meta tag updated with fresh token');
            }
        }
    } catch (error) {
        console.error('Failed to refresh CSRF token:', error);
    }
}

/**
 * Get CSRF token from meta tag
 */
export function getCsrfToken(): string | null {
    // Try meta tag first
    const metaToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
    if (metaToken) {
        return metaToken;
    }
    
    // Fallback to cookie
    return getCsrfTokenFromCookie();
}

/**
 * Get fresh CSRF token - refreshes from server first, then returns the token
 */
export async function getFreshCsrfToken(): Promise<string> {
    await refreshCsrfToken();
    
    // After refresh, meta tag should be updated, so get from there first
    let token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
    
    // If meta tag not updated yet, try cookie as fallback
    if (!token) {
        token = getCsrfTokenFromCookie();
    }
    
    if (!token) {
        throw new Error('CSRF token not found after refresh. Please reload the page.');
    }
    
    console.log('🔑 Using fresh CSRF token:', token.substring(0, 10) + '...');
    return token;
}

/**
 * Initialize global CSRF token refresh
 * Call this once when app loads to ensure fresh token
 */
export async function initializeCsrfToken(): Promise<void> {
    await refreshCsrfToken();
    console.log('✅ CSRF token initialized');
}

/**
 * Wrapper for fetch that automatically includes fresh CSRF token
 * With auto-retry on 419 error
 */
export async function fetchWithCsrf(url: string, options: RequestInit = {}, retryCount = 0): Promise<Response> {
    // Get fresh token
    const token = await getFreshCsrfToken();
    
    // Merge headers
    const headers = {
        'X-CSRF-TOKEN': token,
        'X-Requested-With': 'XMLHttpRequest',
        'Accept': 'application/json',
        ...options.headers,
    };
    
    // Make request with fresh token
    const response = await fetch(url, {
        ...options,
        headers,
        credentials: 'same-origin',
    });
    
    // If 419 and haven't retried yet, refresh token and retry once
    if (response.status === 419 && retryCount === 0) {
        console.log('🔄 Got 419, refreshing token and retrying...');
        await new Promise(resolve => setTimeout(resolve, 300)); // Wait a bit
        return fetchWithCsrf(url, options, retryCount + 1);
    }
    
    return response;
}
