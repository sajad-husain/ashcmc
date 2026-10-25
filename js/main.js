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

/* ------------------------------------------------
   3. TAX CALCULATOR — tabbed redesign
   Tab switching is active now; the calculation runs
   in console.log only until slab logic is wired up.
------------------------------------------------ */
const taxTabs = document.querySelectorAll('.tax-tab');

if (taxTabs.length) {
    const taxPanels = document.querySelectorAll('.tax-panel');

    taxTabs.forEach(function (tab) {
        tab.addEventListener('click', function () {
            taxTabs.forEach(function (t) { t.classList.remove('active'); });
            tab.classList.add('active');

            // Show the matching panel, hide the rest
            taxPanels.forEach(function (panel) {
                panel.classList.toggle('hidden', panel.id !== tab.dataset.panel);
            });
        });
    });
}

/**
 * Annual tax for salaried individuals (kept ready for upcoming logic)
 * @param {number} taxable - annual taxable income in PKR
 * @returns {number} annual tax in PKR
 */
function calculateAnnualTax(taxable) {
    if (taxable <= 600000) return 0;                                  // 0%
    if (taxable <= 1200000) return (taxable - 600000) * 0.15;         // 15%
    if (taxable <= 2200000) return 90000 + (taxable - 1200000) * 0.20; // 20%
    if (taxable <= 3200000) return 290000 + (taxable - 2200000) * 0.30; // 30%
    if (taxable <= 4100000) return 590000 + (taxable - 3200000) * 0.35; // 35%
    return 905000 + (taxable - 4100000) * 0.40;                       // 40%
}

function formatPKR(amount) {
    return 'PKR ' + Math.round(amount).toLocaleString('en-PK');
}

const taxForm = document.getElementById('taxForm');

if (taxForm) {
    taxForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const type = document.getElementById('salary-type').value;   // "annual" | "monthly"
        const amount = document.getElementById('salary-amount').value;

        console.log('Tax Calculator input:', {
            salaryType: type,
            salaryAmount: amount
        });
        // Real slab calculation and on-page results will be added here later.
    });
}
