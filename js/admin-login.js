// admin-login.js 


(function checkExistingAdminSession() {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    if (token && role === 'admin') {
        window.location.replace('./admin.html');
    }
})();

// handleAdminLogin 
async function handleAdminLogin(event) {
    event.preventDefault(); // Stop standard form submission

    const email = document.getElementById('admin-email').value.trim();
    const password = document.getElementById('admin-password').value;

    // Easy Validation: Reject empty attempts
    if (!email || !password) {
        alert(' Please enter both your admin email and password.');
        return;
    }

    //  Check for valid email format
    if (!email.includes('@') || !email.includes('.')) {
        alert(' Please enter a valid admin email address!');
        return;
    }

    try {
        const response = await apiRequest("/auth/login", "POST", { email, password }, false);

        if (response && response.ok) {
            const data = await response.json();

            // Explicitly deny entry if the user exists but lacks the Admin role
            if (data.role !== 'admin') {
                alert('Access Denied: This portal is reserved for registered administrators.');
                return;
            }

            // Persist the admin session locally
            localStorage.setItem('token', data.access_token);
            localStorage.setItem('role', data.role);

            alert(' Admin Login Successful!');
            window.location.replace('./admin.html'); // Immediate redirect to control center

        } else {
            const error = response ? await response.json() : { detail: "Login failed" };
            alert(' Login Failed: ' + (error.detail || 'Wrong email or password'));
        }
    } catch (err) {
        alert(' Connection Error: Is the backend server running?');
    }
}


function togglePassword() {
    const input = document.getElementById('admin-password');
    const icon = document.getElementById('pw-eye-icon');
    if (!input || !icon) return;

    if (input.type === 'password') {
        input.type = 'text';
        icon.className = 'fas fa-eye-slash';
    } else {
        input.type = 'password';
        icon.className = 'fas fa-eye';
    }
}
