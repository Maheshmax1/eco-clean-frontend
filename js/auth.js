
/**
 * EcoClean – auth.js
 * Handles User Signup and Login.
 */

/**
 * handleSignup: Creates a new user account.
 */
async function handleSignup(event) {
    event.preventDefault();

    const form = event.target;
    const fullname = form.fullname.value.trim();
    const email = form.email.value.trim();
    const phone = form.phone.value.trim();
    const password = form.password.value;

    // Simple Validations
    if (!fullname || !email || !phone || !password) {
        alert('⚠️ Please fill in all fields.');
        return;
    }

    if (password.length < 6) {
        alert('⚠️ Password must be at least 6 characters.');
        return;
    }

    const userData = {
        full_name: fullname,
        email: email,
        phone: phone,
        password: password
    };

    try {
        const response = await apiRequest("/auth/signup", "POST", userData, false);

        if (response && response.ok) {
            alert("✅ Account created successfully! Please login now.");
            location.reload();
        } else {
            const data = response ? await response.json() : { detail: "Signup failed" };
            alert("❌ Signup failed: " + (data.detail || "User might already exist."));
        }
    } catch (err) {
        console.error("Signup Error:", err);
        alert("🌐 Connection Error: Could not reach the server.");
    }
}

/**
 * handleLogin: Authenticates user and saves token.
 */
async function handleLogin(event) {
    event.preventDefault();

    const form = event.target;
    const email = form.email.value.trim();
    const password = form.password.value;

    if (!email || !password) {
        alert('⚠️ Please enter both email and password.');
        return;
    }

    const credentials = { email, password };

    try {
        const response = await apiRequest("/auth/login", "POST", credentials, false);

        if (response && response.ok) {
            const data = await response.json();

            // Store Token and Role for session management
            localStorage.setItem('token', data.access_token);
            localStorage.setItem('role', data.role);

            alert("✅ Login successful!");

            // Redirect based on role
            const insidePages = window.location.pathname.includes("/pages/");
            if (data.role === "admin") {
                window.location.href = insidePages ? 'admin.html' : 'pages/admin.html';
            } else {
                window.location.href = insidePages ? 'profile.html' : 'pages/profile.html';
            }
        } else {
            const data = response ? await response.json() : { detail: "Login failed" };
            alert("❌ Login failed: " + (data.detail || "Invalid email or password."));
        }
    } catch (err) {
        console.error("Login Error:", err);
        alert("🌐 Connection Error: Is the backend server running?");
    }
}

// Attach to window so HTML forms can find them
window.handleSignup = handleSignup;
window.handleLogin = handleLogin;
