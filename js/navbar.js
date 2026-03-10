/**
 * EcoClean – navbar.js
 * Handles navigation logic, role-based links, and session management.
 */

document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    const navMenu = document.getElementById("nav-menu");

    if (!navMenu) return;

    if (token) {
        // Decide profile path based on role and current page location
        const isInsidePages = window.location.pathname.includes("/pages/");
        let profilePath = role === "admin" ? "admin.html" : "profile.html";
        
        if (!isInsidePages) {
            profilePath = "pages/" + profilePath;
        }

        // Update Login/Signup links to Dashboard/Profile
        const navLinks = navMenu.querySelectorAll("a");
        navLinks.forEach(link => {
            const text = link.textContent.toLowerCase();
            if (text.includes("login") || text.includes("sign up") || text.includes("become a volunteer")) {
                link.textContent = role === "admin" ? "Dashboard" : "Profile";
                link.href = profilePath;
                
                // Add icon if it was missing
                if (!link.querySelector("i")) {
                    const icon = document.createElement("i");
                    icon.className = role === "admin" ? "fas fa-user-shield" : "fas fa-user-circle";
                    link.prepend(icon);
                    link.style.gap = "8px";
                }
            }
        });

        // Hide auth sections if they exist
        const authSection = document.getElementById("auth-section");
        if (authSection) authSection.style.display = "none";
        
        const heroAuthBtn = document.querySelector(".hero-content .btn");
        if (heroAuthBtn && heroAuthBtn.textContent.toLowerCase().includes("volunteer")) {
            heroAuthBtn.textContent = role === "admin" ? "Go to Dashboard" : "View My Profile";
            heroAuthBtn.href = profilePath;
        }
    }
});

/**
 * logout: Clears session and redirects to home.
 */
function logout(event) {
    if (event) event.preventDefault();

    if (confirm("Are you sure you want to log out?")) {
        localStorage.clear();
        alert("Logged out successfully");

        const isInsidePages = window.location.pathname.includes("/pages/");
        window.location.href = isInsidePages ? "../index.html" : "index.html";
    }
}

// Expose globally
window.logout = logout;
