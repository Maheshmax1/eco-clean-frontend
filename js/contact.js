
/**
 * EcoClean – contact.js
 * Handles the "Contact Us" form submission.
 */

const contactForm = document.querySelector('.support-form');

if (contactForm) {
    /**
     * Listener for the support form submission.
     */
    contactForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const category = document.getElementById('category').value;
        const subject = document.getElementById('subject').value.trim();
        const message = document.getElementById('message').value.trim();
        const priority = document.getElementById('priority').value;

        //  Simple Validation
        if (!name || !email || !phone || !category || !subject || !message || !priority) {
            alert('⚠️ Please fill out all parts of the form!');
            return;
        }

        if (!email.includes('@') || !email.includes('.')) {
            alert('⚠️ Please enter a valid email address!');
            return;
        }

        const messageData = {
            name,
            email,
            phone,
            category,
            subject,
            message,
            priority
        };

        try {
            // No auth required for public contact form
            const response = await apiRequest("/contact/", "POST", messageData, false);

            if (response && response.ok) {
                alert('✅ Success! Your message has been received.');
                contactForm.reset();
            } else {
                const data = response ? await response.json() : { detail: "Unknown error" };
                alert('❌ Transmission Error: ' + (data.detail || 'Service unavailable.'));
            }
        } catch (err) {
            console.error("Contact Error:", err);
            alert('🌐 Network Error: Connectivity lost. Is the backend running?');
        }
    });
}
