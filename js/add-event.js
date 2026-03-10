// add-event.js 

// Selected image file is stored here before upload
let selectedFile = null;

// handleImageUpload: 

function handleImageUpload(input) {
    if (input.files && input.files[0]) {
        const file = input.files[0];

        // VALIDATION
        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
            alert(" File is too large! Please pick an image smaller than 5MB.");
            input.value = "";
            return;
        }

        if (!file.type.startsWith("image/")) {
            alert(" Invalid file type! Please pick an image (JPG, PNG, WEBP).");
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
        }

        reader.readAsDataURL(selectedFile);
    }
}

// remove Image
function removeImage() {
    selectedFile = null;
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

// handle event 
async function handleAddEvent(event) {
    event.preventDefault();

    const title = document.getElementById('title').value.trim();
    const description = document.getElementById('description').value.trim();
    const location = document.getElementById('location').value.trim();
    const event_date = document.getElementById('event_date').value;
    const start_time = document.getElementById('start_time').value;
    const end_time = document.getElementById('end_time').value;

    const submitBtn = document.getElementById('submit-btn');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoading = submitBtn.querySelector('.btn-loading');

    // --- Validations ---
    if (!title || !description || !location || !event_date || !start_time || !end_time) {
        alert(' Please fill in all required fields.');
        return;
    }

    if (title.length < 5) {
        alert(' Title is too short. Please use at least 5 characters.');
        return;
    }

    const todayStr = new Date().toISOString().split('T')[0];
    if (event_date < todayStr) {
        alert(' You cannot host an event in the past!');
        return;
    }

    if (end_time <= start_time) {
        alert(' End Time must be later than Start Time.');
        return;
    }

    try {
        // Show loading state
        if (btnText) btnText.style.display = 'none';
        if (btnLoading) btnLoading.style.display = 'inline-block';
        submitBtn.disabled = true;

        let image_url = "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09"; // Default image

        // 1. Upload image to Cloudinary via YOUR backend
        if (selectedFile) {
            const formData = new FormData();
            formData.append('file', selectedFile);

            try {
                const uploadRes = await apiRequest("/events/upload", "POST", formData);
                if (uploadRes && uploadRes.ok) {
                    const uploadData = await uploadRes.json();
                    image_url = uploadData.url;
                } else {
                    const error = uploadRes ? await uploadRes.json() : { detail: 'Unknown error' };
                    alert(' Cloudinary Upload Failed: ' + (error.detail || 'check your credentials'));
                    return; // Stop if upload fails
                }
            } catch (err) {
                console.error("Upload Error:", err);
                alert("🌐 Connection Error: Could not reach the server for image upload.");
                return;
            }
        }

        // 2. Create the final event in the database
        const eventData = {
            title,
            description,
            location,
            event_date,
            start_time,
            end_time,
            image_url,
            status: 'upcoming'
        };

        const response = await apiRequest("/events/", "POST", eventData);

        if (response && response.ok) {
            alert(' Success! Your new event has been created.');
            window.location.href = 'admin.html';
        } else {
            const error = response ? await response.json() : { detail: 'Unknown error' };
            alert(' Failed to create event: ' + (error.detail || 'check your inputs'));
        }

    } catch (err) {
        console.error(err);
        alert(" An unexpected error occurred. Is the backend running?");
    } finally {
        // Reset button state
        if (btnText) btnText.style.display = 'inline-block';
        if (btnLoading) btnLoading.style.display = 'none';
        submitBtn.disabled = false;
    }
}

// Global exposure
window.handleAddEvent = handleAddEvent;
window.handleImageUpload = handleImageUpload;
window.removeImage = removeImage;
