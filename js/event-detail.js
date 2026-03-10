
/**
 * EcoClean – event-detail.js
 * Logic for viewing single event details and joining/leaving events.
 */

const eventId = new URLSearchParams(window.location.search).get("id");

/**
 * fetchEventDetails: Gets event data and shows it on the page.
 */
async function fetchEventDetails() {
  if (!eventId) {
    alert("⚠️ No event selected.");
    window.location.href = "events.html";
    return;
  }

  try {
    // We set requireAuth=false because anyone can VIEW event details
    const res = await apiRequest(`/events/${eventId}`, "GET", null, false);

    if (!res || !res.ok) {
      alert("❌ Event not found.");
      return;
    }

    const event = await res.json();

    // 1. Fill Page Text
    document.title = event.title + " - EcoClean";
    const titleEle = document.getElementById("event-title");
    const dateEle = document.getElementById("event-date");
    const timeEle = document.getElementById("event-time");
    const locEle = document.getElementById("event-location");
    const descEle = document.getElementById("event-description");

    if (titleEle) titleEle.textContent = event.title;
    if (dateEle) dateEle.textContent = "📅 Date: " + event.event_date;
    if (timeEle) timeEle.textContent = "⏰ Time: " + event.start_time + " - " + event.end_time;
    if (locEle) locEle.textContent = "📍 Location: " + event.location;
    if (descEle) descEle.textContent = event.description;

    // 2. Event Image with Fallback
    const img = document.getElementById("event-image");
    if (img) {
      img.src = event.image_url;
      img.onerror = () => {
        img.src = "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1200&q=80";
      };
    }

    // 3. Render Volunteer List
    const section = document.getElementById("registered-volunteers-section");
    const list = document.getElementById("volunteers-list");

    if (event.registrations && event.registrations.length > 0) {
      if (section) section.style.display = "block";
      if (list) {
        list.innerHTML = "";
        event.registrations.forEach(reg => {
          const li = document.createElement("li");
          li.style = 'background: #e8f5e9; color: #2e7d32; padding: 5px 12px; border-radius: 15px; font-size: 0.9rem; font-weight: 600; border: 1px solid #c8e6c9; list-style:none;';
          li.textContent = reg.user.full_name;
          list.appendChild(li);
        });
      }
    } else {
      if (section) section.style.display = "none";
    }

    // 4. Join / Leave Button Logic
    const btn = document.querySelector(".btn");
    if (btn) {
      if (event.is_registered) {
        // User is already in. Show status and Leave button.
        btn.textContent = "✓ Already Registered";
        btn.style.backgroundColor = "#2e8b57";
        btn.style.cursor = "default";
        btn.onclick = (e) => e.preventDefault();

        // Add a "Leave" button if it doesn't exist
        if (!document.getElementById("leave-btn")) {
          const leaveBtn = document.createElement("button");
          leaveBtn.id = "leave-btn";
          leaveBtn.className = "btn-secondary";
          leaveBtn.textContent = "Leave Event";
          leaveBtn.style = "margin-top:10px; background:white; color:#ff4d4d; border:1px solid #ff4d4d; padding:10px 20px; border-radius:25px; cursor:pointer;";
          leaveBtn.onclick = () => leaveEvent(event.id);
          btn.parentNode.appendChild(leaveBtn);
        }
      } else {
        btn.onclick = (e) => {
          e.preventDefault();
          joinEvent(event.id);
        };
      }
    }

  } catch (err) {
    console.error("Fetch Details Error:", err);
  }
}

/**
 * joinEvent: Registers the user for the event.
 */
async function joinEvent(id) {
  if (!getToken()) {
    alert("⚠️ Please login first to join events!");
    window.location.href = "../index.html#auth-section";
    return;
  }

  try {
    const res = await apiRequest(`/events/${id}/join`, "POST");
    if (res && res.ok) {
      alert("🎉 Successfully joined the event! See you there.");
      location.reload();
    } else {
      const data = await res.json();
      alert("❌ Error: " + (data.detail || "Could not join event"));
    }
  } catch (err) {
    console.error("Join Error:", err);
    alert("🌐 Connection error while joining.");
  }
}

/**
 * leaveEvent: Unregisters the user.
 */
async function leaveEvent(id) {
  if (!confirm("Are you sure you want to leave this event?")) return;

  try {
    const res = await apiRequest(`/events/${id}/leave`, "POST");
    if (res && res.ok) {
      alert("✅ You have left the event.");
      location.reload();
    } else {
      const data = await res.json();
      alert("❌ Error: " + (data.detail || "Could not leave event"));
    }
  } catch (err) {
    console.error("Leave Error:", err);
    alert("🌐 Connection error while leaving.");
  }
}

// AUTO LOAD
if (window.location.pathname.includes("about-event.html")) {
  fetchEventDetails();
}

// Global exposure
window.joinEvent = joinEvent;
window.leaveEvent = leaveEvent;