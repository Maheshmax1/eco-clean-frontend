/**
 * EcoClean – events_manage.js
 * Redundant/Legacy event management logic for tracking registrations.
 * NOTE: Most of these features are now integrated directly into admin.js.
 */

async function fetchEventRegistrations() {
  const container = document.querySelector('.registrations-container');
  if (!container) return;

  try {
    const response = await apiRequest("/admin/event-registrations");

    if (response && response.ok) {
      const events = await response.json();
      container.innerHTML = '';

      if (events.length === 0) {
        container.innerHTML = '<p style="padding: 20px; text-align: center;">No events recorded in system.</p>';
        return;
      }

      events.forEach(event => {
        const eventCard = document.createElement('div');
        eventCard.className = 'registration-event-card';

        let volunteersTable = '';
        if (event.registrations && event.registrations.length > 0) {
          volunteersTable = `
                        <div class="registration-volunteers-table">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Phone</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${event.registrations.map(reg => `
                                        <tr>
                                            <td>${reg.user.full_name}</td>
                                            <td>${reg.user.email}</td>
                                            <td>${reg.user.phone || 'N/A'}</td>
                                            <td><span class="status-badge">✅ Joined</span></td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    `;
        } else {
          volunteersTable = `<p style="padding: 15px; color: #666;">No registrations recorded for this event.</p>`;
        }

        eventCard.innerHTML = `
                    <div class="registration-event-header" style="background: #f8f9fa; padding: 15px; border-bottom: 2px solid #eee;">
                        <h3>${event.title}</h3>
                        <p style="margin: 5px 0; color: #555;">📍 ${event.location} | 📅 ${event.event_date}</p>
                        <p><strong>Total Registrations: ${event.registrations.length}</strong></p>
                    </div>
                    ${volunteersTable}
                `;
        container.appendChild(eventCard);
      });
    }
  } catch (error) {
    console.error('Error in fetchEventRegistrations:', error);
    container.innerHTML = '<p style="color: red; padding: 20px;">Connection Error: Could not load data.</p>';
  }
}

// Auto-run if we have a token and are on the right page
if (getToken()) {
  fetchEventRegistrations();
} else if (window.location.pathname.includes('events_manage.html')) {
  window.location.href = '../index.html';
}
