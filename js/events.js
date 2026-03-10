
/**
 * EcoClean – events.js
 * Logic for the public events gallery.
 */

/**
 * fetchPublicEvents: Displays "Upcoming" and "Completed" events.
 */
async function fetchPublicEvents() {
  try {
    console.log("Fetching events gallery...");
    // We try with token if available (to show 'Registered' badge), but don't force login
    const response = await apiRequest("/events/", "GET", null, false);

    if (!response || !response.ok) {
      showError("Could not load events. Server error.");
      return;
    }

    const events = await response.json();
    renderEvents(events);
  } catch (err) {
    console.error("Gallery Fetch Error:", err);
    showError("Is the backend server running? Could not connect.");
  }
}

/**
 * renderEvents: Distributes events into UI sections.
 */
function renderEvents(events) {
  const upcomingList = document.getElementById("upcoming-events-list");
  const completedList = document.getElementById("completed-events-list");

  if (upcomingList) upcomingList.innerHTML = "";
  if (completedList) completedList.innerHTML = "";

  const upcoming = events.filter(e => e.status === "upcoming");
  const completed = events.filter(e => e.status === "completed");

  // 1. Render Upcoming
  if (upcoming.length === 0) {
    if (upcomingList) upcomingList.innerHTML = "<p style='text-align:center;width:100%;padding:40px;'>No upcoming cleanup events. Stay tuned!</p>";
  } else if (upcomingList) {
    upcoming.forEach(e => upcomingList.appendChild(createEventCard(e, true)));
  }

  // 2. Render Completed
  if (completed.length === 0) {
    if (completedList) completedList.innerHTML = "<p style='text-align:center;width:100%;padding:40px;'>No past events in our archive yet.</p>";
  } else if (completedList) {
    completed.forEach(e => completedList.appendChild(createEventCard(e, false)));
  }
}

/**
 * createEventCard: Generates HTML for an event card.
 */
function createEventCard(event, isUpcoming) {
  const div = document.createElement("div");
  div.className = "event-card";

  let statusText = isUpcoming ? "Know More" : "✓ Completed";
  let statusClass = isUpcoming ? "status-upcoming" : "status-completed";

  // Personalization for logged-in users
  if (isUpcoming && event.is_registered) {
    div.classList.add("registered");
    statusText = "✓ Registered";
    statusClass = "status-registered";
  }

  const link = isUpcoming ? `./about-event.html?id=${event.id}` : "#";

  div.innerHTML = `
        <div class="event-image-container">
            <img src="${event.image_url}" 
                 alt="${event.title}" 
                 onerror="this.src='https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80'">
        </div>
        <div class="event-content">
            <span class="event-id">ECO-EVENT-${event.id}</span>
            <h3>${event.title}</h3>
            <p>${event.description}</p>
            <div class="event-details">
                <div>📅 ${event.event_date}</div>
                <div>⏰ ${event.start_time} - ${event.end_time}</div>
            </div>
            ${isUpcoming
      ? `<a href="${link}"><span class="event-status ${statusClass}">${statusText}</span></a>`
      : `<span class="event-status ${statusClass}">${statusText}</span>`
    }
        </div>
        ${isUpcoming && event.is_registered ? `
            <div class="registration-overlay">
                <div class="registered-badge">✓ REGISTERED</div>
                <a href="${link}" class="view-details-link">View Details</a>
            </div>
        ` : ''}
    `;

  return div;
}

/**
 * showError: Simple error display.
 */
function showError(msg) {
  const container = document.getElementById("upcoming-events-list");
  if (container) {
    container.innerHTML = `<p style="color:red; text-align:center; width:100%; padding:40px;">⚠️ ${msg}</p>`;
  }
}

// Auto Load
if (window.location.pathname.includes("events.html")) {
  fetchPublicEvents();
}
