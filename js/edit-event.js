
/**
 * EcoClean – edit-event.js
 * Handles editing existing events. Uses the backend proxy for image uploads.
 */

// STATE
const eventId = new URLSearchParams(window.location.search).get("id");
let selectedFile = null;
let currentImageUrl = "";

/**
 * fetchEventDetails: Loads the event data into the form.
 */
async function fetchEventDetails() {
  if (!eventId) {
    alert("⚠️ No event ID found in URL.");
    window.location.href = "admin.html";
    return;
  }

  try {
    // Show loading skeleton if you have one
    const skeleton = document.getElementById('form-skeleton');
    const content = document.getElementById('form-content');
    if (skeleton) skeleton.style.display = 'block';
    if (content) content.style.display = 'none';

    const res = await apiRequest(`/events/${eventId}`, "GET", null, false);
    if (!res) return;

    if (res.ok) {
      const event = await res.json();

      // Fill Form Fields
      document.getElementById('title').value = event.title;
      document.getElementById('description').value = event.description;
      document.getElementById('location').value = event.location;
      document.getElementById('event_date').value = event.event_date;
      document.getElementById('start_time').value = event.start_time;
      document.getElementById('end_time').value = event.end_time;

      currentImageUrl = event.image_url;

      // Show Image Preview
      if (currentImageUrl) {
        const preview = document.getElementById('image-preview');
        const placeholder = document.getElementById('upload-placeholder');
        const actions = document.getElementById('image-actions');

        if (preview) {
          preview.src = currentImageUrl;
          preview.style.display = 'block';
        }
        if (placeholder) placeholder.style.display = 'none';
        if (actions) actions.style.display = 'block';
      }

      // If event is finished, show the banner
      if (event.status === 'completed') {
        const banner = document.getElementById('completed-banner');
        if (banner) banner.style.display = 'flex';
        const submitBtn = document.getElementById('submit-btn');
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.style.opacity = '0.5';
        }
      }

      if (skeleton) skeleton.style.display = 'none';
      if (content) content.style.display = 'block';
    } else {
      alert("❌ Could not find the requested event.");
      window.location.href = "admin.html";
    }
  } catch (err) {
    console.error("Load Error:", err);
    alert("🌐 Server error while loading event data.");
  }
}

/**
 * handleImageUpload: Validates and previews a newly picked image.
 */
function handleImageUpload(input) {
  if (input.files && input.files[0]) {
    const file = input.files[0];

    // Validation: 5MB limit
    if (file.size > 5 * 1024 * 1024) {
      alert("⚠️ File too large! Max 5MB allowed.");
      input.value = "";
      return;
    }

    selectedFile = file;
    const reader = new FileReader();
    reader.onload = function (e) {
      const preview = document.getElementById('image-preview');
      const placeholder = document.getElementById('upload-placeholder');
      const actions = document.getElementById('image-actions');

      if (preview) {
        preview.src = e.target.result;
        preview.style.display = 'block';
      }
      if (placeholder) placeholder.style.display = 'none';
      if (actions) actions.style.display = 'block';
    };
    reader.readAsDataURL(file);
  }
}

/**
 * removeImage: Clears the image selection.
 */
function removeImage() {
  selectedFile = null;
  currentImageUrl = "";
  const input = document.getElementById('image_file');
  const preview = document.getElementById('image-preview');
  const placeholder = document.getElementById('upload-placeholder');
  const actions = document.getElementById('image-actions');

  if (input) input.value = '';
  if (preview) {
    preview.src = '';
    preview.style.display = 'none';
  }
  if (placeholder) placeholder.style.display = 'flex';
  if (actions) actions.style.display = 'none';
}

/**
 * handleEditEvent: Uploads image (if changed) then updates the database.
 */
async function handleEditEvent(event) {
  event.preventDefault();

  const title = document.getElementById('title').value.trim();
  const description = document.getElementById('description').value.trim();
  const location = document.getElementById('location').value.trim();
  const event_date = document.getElementById('event_date').value;
  const start_time = document.getElementById('start_time').value;
  const end_time = document.getElementById('end_time').value;

  const submitBtn = document.getElementById('submit-btn');
  const btnText = submitBtn ? submitBtn.querySelector('.btn-text') : null;
  const btnLoading = submitBtn ? submitBtn.querySelector('.btn-loading') : null;

  if (!title || !description || !location || !event_date || !start_time || !end_time) {
    alert('⚠️ Please fill in all fields.');
    return;
  }

  try {
    if (btnText) btnText.style.display = 'none';
    if (btnLoading) btnLoading.style.display = 'inline-block';
    if (submitBtn) submitBtn.disabled = true;

    let finalImageUrl = currentImageUrl;

    // 1. Upload new image if one was picked
    if (selectedFile) {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const uploadRes = await apiRequest("/events/upload", "POST", formData);
      if (uploadRes && uploadRes.ok) {
        const uploadData = await uploadRes.json();
        finalImageUrl = uploadData.url;
      } else {
        alert("❌ Image upload failed. Changes not saved.");
        return;
      }
    }

    // 2. Put the update to the server
    const eventData = {
      title,
      description,
      location,
      event_date,
      start_time,
      end_time,
      image_url: finalImageUrl,
      status: "upcoming"
    };

    const response = await apiRequest(`/events/${eventId}`, "PUT", eventData);

    if (response && response.ok) {
      alert('✅ Event updated successfully!');
      window.location.href = 'admin.html';
    } else {
      const error = response ? await response.json() : { detail: "Update failed" };
      alert('❌ Failed to update: ' + (error.detail || 'check your inputs'));
    }
  } catch (err) {
    console.error("Update Error:", err);
    alert("🌐 Connection error. Is the server running?");
  } finally {
    if (btnText) btnText.style.display = 'inline-block';
    if (btnLoading) btnLoading.style.display = 'none';
    if (submitBtn) submitBtn.disabled = false;
  }
}

// INITIALIZE
if (eventId) {
  fetchEventDetails();
}

// Global exposure
window.handleEditEvent = handleEditEvent;
window.handleImageUpload = handleImageUpload;
window.removeImage = removeImage;