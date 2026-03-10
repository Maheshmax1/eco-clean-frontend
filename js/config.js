
// --- EcoClean CONFIGURATION ---

const API_URL = 'https://eco-clean-final-project-1arl.vercel.app'; // Production URL
// Cloudinary Settings (Keep these matching your .env)
const CLOUDINARY_CLOUD_NAME = "def2x8hlo";
const CLOUDINARY_UPLOAD_PRESET = "eco_clean";

// --- GLOBAL HELPERS (Used in all .js files) ---

function getToken() {
    return localStorage.getItem("token");
}

function getRole() {
    return localStorage.getItem("role");
}

function handleAuthError() {
    console.warn("Session expired or unauthorized. Redirecting...");
    localStorage.removeItem("token");
    localStorage.removeItem("role");

    // Determine redirect path based on where the user is
    const insidePages = window.location.pathname.includes("/pages/");
    window.location.href = insidePages ? "../index.html" : "index.html";
}

/**
 * apiRequest: A simple helper for all database calls.
 * It automatically adds the 'Bearer' token for you.
 */
async function apiRequest(endpoint, method = "GET", body = null, requireAuth = true) {
    const token = getToken();
    const headers = { "Accept": "application/json" };

    // Set Content-Type to JSON unless we are sending a file (FormData)
    if (body && !(body instanceof FormData)) {
        headers["Content-Type"] = "application/json";
    }

    // Add authorization if we have a token
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    try {
        const response = await fetch(`${API_URL}${endpoint}`, {
            method,
            headers,
            body: body instanceof FormData ? body : (body ? JSON.stringify(body) : null)
        });

        // Redirect to login if token is old/invalid
        if (response.status === 401 && requireAuth) {
            handleAuthError();
            return null;
        }

        return response;
    } catch (error) {
        console.error("API Request Error:", error);
        throw error;
    }
}

// Expose these globally for other files
window.apiRequest = apiRequest;
window.getToken = getToken;
window.getRole = getRole;
window.API_URL = API_URL;
