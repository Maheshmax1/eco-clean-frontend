
/**
 * EcoClean – profile.js
 * Handles user profile display and registered events list.
 */

/**
 * fetchProfile: Loads user data and then triggers event fetch.
 */
async function fetchProfile() {
    if (!getToken()) {
        console.warn("No authentication found! Redirecting to login...");
        handleAuthError();
        return;
    }

    try {
        console.log("Fetching user profile...");
        const response = await apiRequest("/users/me");

        if (!response) return; // Handled by apiRequest (redirects on 401)

        if (response.ok) {
            const user = await response.json();
            console.log('Profile data received:', user);

            // Populate UI Elements
            const welcomeText = document.querySelector('.profile-text h1');
            if (welcomeText) welcomeText.textContent = `Welcome, ${user.full_name}!`;

            const volId = document.getElementById('vol-id');
            if (volId) volId.textContent = `ECO-VOL-${user.id}`;

            const volEmail = document.getElementById('vol-email');
            if (volEmail) volEmail.textContent = user.email;

            // Load registered events list
            fetchMyEvents();
        } else {
            console.error('Failed to load profile. Status:', response.status);
        }
    } catch (err) {
        console.error("Connectivity error during profile fetch:", err);
        const list = document.getElementById('registered-events-list');
        if (list) list.innerHTML = `<p style="color:red; text-align:center; padding:20px;">🌐 Connection Error: Backend server unreachable.</p>`;
    }
}

/**
 * fetchMyEvents: Loads the list of events the user has joined.
 */
async function fetchMyEvents() {
    const list = document.getElementById('registered-events-list');
    if (!list) return;

    try {
        console.log("Fetching registered events...");
        const response = await apiRequest("/users/me/events");

        if (!response || !response.ok) {
            list.innerHTML = `<p style="text-align: center; padding: 20px;">Could not load your events.</p>`;
            return;
        }

        const registrations = await response.json();
        list.innerHTML = ""; // Clear loading placeholder

        if (registrations.length === 0) {
            list.innerHTML = `
                <p style="text-align: center; width: 100%; padding: 20px;">
                    You haven't joined any events yet. 
                    <a href="events.html" style="color: #2e7d32; font-weight: bold;">Browse events!</a>
                </p>`;
            return;
        }

        registrations.forEach(reg => {
            const event = reg.event;
            if (!event) return;

            const card = document.createElement('a');
            card.href = `about-event.html?id=${event.id}`;
            card.className = "event-card";
            card.style.textDecoration = "none";

            card.innerHTML = `
                <div class="card-image-wrapper">
                    <img src="${event.image_url}" 
                         alt="${event.title}" 
                         class="card-image" 
                         onerror="this.src='https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=400&q=80'">
                    <span class="status-badge upcoming">Registered</span>
                </div>
                <div class="card-content">
                    <h3>${event.title}</h3>
                    <p class="location">📍 ${event.location}</p>
                    <p class="date">📅 ${event.event_date}</p>
                </div>
            `;
            list.appendChild(card);
        });

    } catch (err) {
        console.error('Failed to load registered events:', err);
        list.innerHTML = `<p style="text-align: center; color: red; padding: 20px;">⚠️ Connection Error: Failed to fetch events.</p>`;
    }
}

// Only run initialization if we are actually on the profile page
if (window.location.pathname.includes('profile.html')) {
    fetchProfile();
}
