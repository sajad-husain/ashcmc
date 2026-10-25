/* ============================================
   ASH CORPORATE - Main JavaScript
   1. Mobile Menu (Hamburger)
   2. Contact Form Handler
   ============================================ */

/* ------------------------------------------------
   1. MOBILE MENU - toggle hamburger open/close
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
   2. CONTACT FORM - basic validation + status note
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

/* ------------------------------------------------
   3. TAX CALCULATOR ΓÇö 5 tabbed calculators
   Tab switching works now; Calculate shows a
   placeholder alert until slab logic is wired up.
------------------------------------------------ */
const taxTabs = document.querySelectorAll('.tax-tab');

if (taxTabs.length) {
    const taxPanels = document.querySelectorAll('.tax-panel');

    taxTabs.forEach(function (tab) {
        tab.addEventListener('click', function () {
            taxTabs.forEach(function (t) {
                t.classList.remove('active');
                t.setAttribute('aria-selected', 'false');
            });
            tab.classList.add('active');
            tab.setAttribute('aria-selected', 'true');

            // Show the matching panel, hide the rest
            taxPanels.forEach(function (panel) {
                const isTarget = panel.id === tab.dataset.panel;
                panel.classList.toggle('hidden', !isTarget);
                panel.setAttribute('aria-hidden', String(!isTarget));
            });
        });
    });
}

// Placeholder handler for all five calculator forms
const calcForms = document.querySelectorAll('.tax-calc-form');

if (calcForms.length) {
    calcForms.forEach(function (form) {
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            alert('Calculation logic will be added soon!');
        });
    });
}
