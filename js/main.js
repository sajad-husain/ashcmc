/* ============================================
   ASH CORPORATE — Main JavaScript
   1. Mobile Menu (Hamburger)
   2. Contact Form Handler
   3. Tax Calculator Logic
   ============================================ */

/* ------------------------------------------------
   2. CONTACT FORM — basic validation + status note
   (Front-end placeholder; connect a backend or a
   form service like FormSubmit for real sending.)
------------------------------------------------ */
const contactForm = document.getElementById('contactForm');

if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const name = document.getElementById('cf-name').value.trim();
        const email = document.getElementById('cf-email').value.trim();
        const phone = document.getElementById('cf-phone').value.trim();
        const message = document.getElementById('cf-message').value.trim();
        const status = document.getElementById('form-status');

        if (!name || !email || !message) {
            status.textContent = 'Please fill in your name, email, and message.';
            status.className = 'form-status success';
            return;
        }

        status.textContent =
            'Thank you, ' + name + '! Your message has been received. We will get back to you shortly.';
        status.className = 'form-status success';
        contactForm.reset();
    });
}

