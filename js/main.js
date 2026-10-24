/* ============================================
   ASH CORPORATE — Main JavaScript
   1. Mobile Menu (Hamburger)
   2. Contact Form Handler
   3. Tax Calculator Logic
   ============================================ */

/* ------------------------------------------------
   1. MOBILE MENU — toggle hamburger open/close
------------------------------------------------ */
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');

if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', function () {
        const isOpen = navLinks.classList.toggle('open');

        // Swap the icon between bars and X
        const icon = menuToggle.querySelector('i');
        if (isOpen) {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-xmark');
        } else {
            icon.classList.remove('fa-xmark');
            icon.classList.add('fa-bars');
        }
    });
}

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

