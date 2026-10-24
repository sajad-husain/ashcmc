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
   3. TAX CALCULATOR — Pakistan Income Tax
   Approximate salaried slabs (Tax Year 2024-25).
   For guidance only — consult our team for filing.
------------------------------------------------ */
const taxForm = document.getElementById('taxForm');

/**
 * Annual tax for salaried individuals (Tax Year 2024-25 slabs)
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

if (taxForm) {
    taxForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const type = document.getElementById('salary-type').value;   // "monthly" | "annual"
        const amountEl = document.getElementById('salary-amount');
        const resultBox = document.getElementById('tax-result');
        const lines = {
            taxable: document.getElementById('r-taxable'),
            taxAnnual: document.getElementById('r-tax-annual'),
            taxMonthly: document.getElementById('r-tax-monthly'),
            netMonthly: document.getElementById('r-net-monthly'),
            takeHome: document.getElementById('r-take-home')
        };

        const amount = parseFloat(amountEl.value);

        if (isNaN(amount) || amount <= 0) {
            alert('Please enter a valid salary amount.');
            amountEl.focus();
            return;
        }

        // Convert the entered amount into an annual figure
        const annualIncome = type === 'monthly' ? amount * 12 : amount;

        const annualTax = calculateAnnualTax(annualIncome);
        const monthlyTax = annualTax / 12;
        const netMonthly = (annualIncome - annualTax) / 12;

        lines.taxable.textContent = formatPKR(annualIncome);
        lines.taxAnnual.textContent = formatPKR(annualTax);
        lines.taxMonthly.textContent = formatPKR(monthlyTax);
        lines.netMonthly.textContent = formatPKR(netMonthly);
        lines.takeHome.textContent = formatPKR(annualIncome - annualTax);

        resultBox.classList.add('show');

        // Log for verification / debugging
        console.log('ASH Tax Calculator —', {
            input: amount + ' (' + type + ')',
            annualTaxable: annualIncome,
            annualTax: annualTax
        });
    });
}
