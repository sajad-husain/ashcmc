/* ============================================
   ASH CORPORATE - Main JavaScript
   1. Mobile Menu (Hamburger)
   2. Contact Form Handler
   3. Tax Calculators (FBR rules, Tax Year 2025-2026)
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
   3. TAX CALCULATORS - FBR rules, Tax Year 2025-2026
   Five tabbed calculators: Salary | Pension | Business |
   Rental | Property. Formulas per FBR First Schedule
   (Finance Act 2025) and Income Tax Ordinance 2001
   (ss. 12(2)(f), 15, 155, 236C, 236K). Amounts in PKR.
   Guidance only - not professional tax advice.
------------------------------------------------ */

/* - Slab data (Tax Year 2025-2026) ----------------
   Each slab: { min, max, rate, fixed }
   - `min`: lower bound of the slab (previous slab's top + 1)
   - `max`: upper bound (null = open-ended)
   - `rate`: marginal rate applied to income above (min - 1)
   - `fixed`: total tax accumulated on all income below `min`
------------------------------------------------ */
const SALARY_SLABS = [
    { min: 0,       max: 600000,    rate: 0.00,  fixed: 0 },
    { min: 600001,  max: 1200000,   rate: 0.025, fixed: 0 },
    { min: 1200001, max: 2200000,   rate: 0.11,  fixed: 15000 },
    { min: 2200001, max: 3200000,   rate: 0.23,  fixed: 125000 },
    { min: 3200001, max: 4100000,   rate: 0.30,  fixed: 355000 },
    { min: 4100001, max: null,      rate: 0.35,  fixed: 625000 }
];

const BUSINESS_SLABS = [
    { min: 0,       max: 600000,    rate: 0.00,  fixed: 0 },
    { min: 600001,  max: 1200000,   rate: 0.15,  fixed: 0 },
    { min: 1200001, max: 1600000,   rate: 0.20,  fixed: 90000 },
    { min: 1600001, max: 3200000,   rate: 0.30,  fixed: 170000 },
    { min: 3200001, max: 5600000,   rate: 0.40,  fixed: 650000 },
    { min: 5600001, max: null,      rate: 0.45,  fixed: 1610000 }
];

// Applied to net rent (after the automatic 20% repair deduction)
const RENTAL_SLABS = [
    { min: 0,       max: 300000,    rate: 0.00,  fixed: 0 },
    { min: 300001,  max: 600000,    rate: 0.05,  fixed: 0 },
    { min: 600001,  max: 2000000,   rate: 0.10,  fixed: 15000 },
    { min: 2000001, max: null,      rate: 0.25,  fixed: 155000 }
];

// Section 236C - advance tax on sale/disposal of immovable property
const PROPERTY_SALE_RATES = {
    filer: 0.0275,       // 2.75%
    'non-filer': 0.115   // 11.5%
};

// Section 236K - advance tax on purchase
const PROPERTY_PURCHASE_FILER_RATE = 0.0125; // 1.25%
const PROPERTY_PURCHASE_NONFILER_BANDS = [
    { max: 50000000,  rate: 0.105 }, // 10.5% - value up to Rs. 5 crore
    { max: 100000000, rate: 0.145 }, // 14.5% - value up to Rs. 10 crore
    { max: null,      rate: 0.185 }  // 18.5% - value above Rs. 10 crore
];

/* - Helpers -------------------------------------- */

function formatPKR(amount) {
    return 'PKR ' + Math.round(amount).toLocaleString('en-PK');
}

/**
 * Compute slab tax for a fixed annual amount.
 * @param {number} income - annual taxable amount in PKR
 * @param {Array} slabs - slab table ({ min, max, rate, fixed })
 * @returns {number} annual tax in PKR
 */
function slabTax(income, slabs) {
    if (income <= 0) return 0;
    for (const slab of slabs) {
        const upper = slab.max === null ? Infinity : slab.max;
        if (income <= upper) {
            const excess = Math.max(income - (slab.min - 1), 0);
            return slab.fixed + excess * slab.rate;
        }
    }
    return 0;
}

function fieldVal(id) {
    const el = document.getElementById(id);
    return el ? el.value.trim() : '';
}

/** Parse a positive amount; returns null when invalid. */
function parseAmount(str) {
    const n = parseFloat(str);
    return isNaN(n) || n <= 0 ? null : n;
}

/**
 * Render a result card. `rows` = [label, value, optional extra class].
 */
function renderResult(key, rows, note) {
    const box = document.getElementById('tax-result-' + key);
    if (!box) return;

    box.textContent = '';
    rows.forEach(function (row) {
        const line = document.createElement('div');
        line.className = 'tax-result-row' + (row[2] ? ' ' + row[2] : '');
        const label = document.createElement('span');
        label.textContent = row[0];
        const value = document.createElement('strong');
        value.textContent = row[1];
        line.append(label, value);
        box.appendChild(line);
    });

    if (note) {
        const noteEl = document.createElement('p');
        noteEl.className = 'tax-result-note';
        noteEl.textContent = note;
        box.appendChild(noteEl);
    }

    box.hidden = false;
}

/** Show a validation error inside the result card. */
function renderError(key, message) {
    renderResult(key, [[message, ' ', 'total']], null);
}

/* - Tab switching -------------------------------- */

const taxTabs = document.querySelectorAll('.tax-tab');
const taxPanels = document.querySelectorAll('.tax-panel');

if (taxTabs.length) {
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
                if (!isTarget) {
                    const box = panel.querySelector('.tax-result');
                    if (box) box.hidden = true;
                }
            });
        });
    });
}

/* - 3a. SALARY -------------------------------------
   Salaried slabs (First Schedule, Finance Act 2025).
   - Monthly inputs are x12 for annual tax, then the monthly
     deduction is annual tax / 12
   - 9% surcharge on tax when annual salary exceeds Rs. 10,000,000
--------------------------------------------------- */
function calcSalary() {
    const amount = parseAmount(fieldVal('salary-amount'));
    if (amount === null) { renderError('salary', 'Please enter a valid salary amount.'); return; }

    const type = fieldVal('salary-type');           // "monthly" | "annual"
    const annual = type === 'monthly' ? amount * 12 : amount;
    const base = slabTax(annual, SALARY_SLABS);
    const surcharge = annual > 10000000 ? base * 0.09 : 0;
    const total = base + surcharge;

    const rows = [
        ['Annual Taxable Salary', formatPKR(annual)],
        ['Slab Tax (FY 2025-26)', formatPKR(base)]
    ];
    if (surcharge > 0) rows.push(['Surcharge (9% above Rs. 1 crore)', formatPKR(surcharge)]);
    rows.push(['Total Annual Tax', formatPKR(total), 'total']);
    rows.push(['Monthly Tax Deduction', formatPKR(total / 12)]);
    rows.push(['Approx. Net Monthly Take-Home', formatPKR((annual - total) / 12)]);

    renderResult('salary', rows,
        'Based on FBR salaried slabs for Tax Year 2025-2026 (Finance Act 2025). Salaried status applies when salary is 75% or more of your taxable income. Monthly figures are derived from the annual liability.');
}

/* - 3b. PENSION ------------------------------------
   Section 12(2)(f) & Second Schedule (FY 2025-26):
   - Government pension: fully exempt
   - Private pension, age 70+: fully exempt
   - Private pension, under 70: exempt up to Rs. 10,000,000;
     5% final tax on the excess
   - Re-employed by same employer/associate: normal salary slabs
--------------------------------------------------- */
function calcPension() {
    const amount = parseAmount(fieldVal('pension-amount'));
    if (amount === null) { renderError('pension', 'Please enter a valid pension amount.'); return; }

    const source = fieldVal('pension-source');       // "government" | "private"
    const age = fieldVal('pension-age');             // "below-70" | "above-70"
    const reemployed = fieldVal('pension-reemployed'); // "no" | "yes"
    const annual = amount;                           // annual pension figure

    let tax, note;
    if (reemployed === 'yes') {
        tax = slabTax(annual, SALARY_SLABS);
        note = 'Re-employed by the same employer or associate: the pension is taxed under the normal salary slabs for Tax Year 2025-2026, not the pension exemption rules.';
    } else if (source === 'government') {
        tax = 0;
        note = 'Government pension is fully exempt from tax under Section 12(2)(f) and the Second Schedule.';
    } else if (age === 'above-70') {
        tax = 0;
        note = 'Private pension received at age 70 or above is fully exempt from tax.';
    } else {
        const excess = Math.max(annual - 10000000, 0);
        tax = excess * 0.05;
        note = 'Private pension (under 70): exempt up to Rs. 10,000,000; 5% final tax on the excess (Section 12(2)(f)).';
    }

    renderResult('pension', [
        ['Annual Pension', formatPKR(annual)],
        ['Annual Tax', formatPKR(tax), 'total'],
        ['Monthly Tax Deduction', formatPKR(tax / 12)],
        ['Net Monthly Pension', formatPKR((annual - tax) / 12)]
    ], note);
}

/* - 3c. BUSINESS -----------------------------------
   Business/other income slabs (First Schedule, Part I, Division I).
   - 10% surcharge on tax when taxable income exceeds Rs. 10,000,000
   - Top rate capped at 40% for AOPs legally barred from
     incorporating (e.g. CAs, law firms)
--------------------------------------------------- */
function calcBusiness() {
    const amount = parseAmount(fieldVal('business-income'));
    if (amount === null) { renderError('business', 'Please enter a valid business income.'); return; }

    const type = fieldVal('business-type');          // "monthly" | "annual"
    const annual = type === 'monthly' ? amount * 12 : amount;
    const base = slabTax(annual, BUSINESS_SLABS);
    const surcharge = annual > 10000000 ? base * 0.10 : 0;
    const total = base + surcharge;

    const rows = [
        ['Annual Taxable Business Income', formatPKR(annual)],
        ['Slab Tax (FY 2025-26)', formatPKR(base)]
    ];
    if (surcharge > 0) rows.push(['Surcharge (10% above Rs. 1 crore)', formatPKR(surcharge)]);
    rows.push(['Total Annual Tax', formatPKR(total), 'total']);
    rows.push(['Net Income After Tax', formatPKR(annual - total)]);

    renderResult('business', rows,
        'Based on FBR business income slabs for Tax Year 2025-2026 (First Schedule, Part I). A 10% surcharge applies on tax where taxable income exceeds Rs. 10,000,000. AOPs legally barred from incorporating (CAs, law firms, etc.) have their top rate capped at 40%.');
}

/* - 3d. RENTAL -------------------------------------
   Section 15 & Section 155 (FY 2025-26):
   - Individuals: automatic 20% repair deduction, then slabs
     (Net Rent = Gross Rent x 0.80)
   - Companies: flat 15% (filer) / 30% (non-filer) withholding
     on gross rent - no 20% deduction
   - Tax is adjustable against the final return
--------------------------------------------------- */
function calcRental() {
    const amount = parseAmount(fieldVal('rental-income'));
    if (amount === null) { renderError('rental', 'Please enter a valid rent amount.'); return; }

    const type = fieldVal('rental-type');            // "monthly" | "annual"
    const landlord = fieldVal('rental-landlord');    // "individual" | "company"
    const filer = fieldVal('rental-filer');          // "filer" | "non-filer"
    const annual = type === 'monthly' ? amount * 12 : amount;

    if (landlord === 'company') {
        const rate = filer === 'filer' ? 0.15 : 0.30;
        const tax = annual * rate;
        renderResult('rental', [
            ['Gross Annual Rent', formatPKR(annual)],
            ['Withholding Rate (Section 155)', (rate * 100).toFixed(1) + '%'],
            ['Annual Withholding Tax', formatPKR(tax), 'total'],
            ['Monthly Tax Deduction', formatPKR(tax / 12)],
            ['Net Monthly Rent', formatPKR((annual - tax) / 12)]
        ], 'Company landlord: flat 15% (filer) / 30% (non-filer) withholding on gross rent - the 20% repair deduction does not apply. This withholding is adjustable against the final return.');
    } else {
        const netRent = annual * 0.80;               // automatic 20% repair deduction
        const tax = slabTax(netRent, RENTAL_SLABS);
        renderResult('rental', [
            ['Gross Annual Rent', formatPKR(annual)],
            ['Repair Deduction (20%)', '- ' + formatPKR(annual - netRent)],
            ['Net Taxable Rent', formatPKR(netRent)],
            ['Annual Tax (FY 2025-26 slabs)', formatPKR(tax), 'total'],
            ['Monthly Tax Deduction', formatPKR(tax / 12)],
            ['Net Monthly Rent', formatPKR((netRent - tax) / 12)]
        ], 'Individual landlord: a 20% repair allowance is applied automatically, then the FY 2025-26 rental income slabs (Section 15). The withheld tax is adjustable against the final return.');
    }
}

/* - 3e. PROPERTY TRANSACTION -----------------------
   Sections 236C & 236K, Part IV (FY 2025-26):
   - Sale (236C): 2.75% filer / 11.5% non-filer of the value
   - Purchase (236K): 1.25% filer; non-filers pay 10.5%-18.5%
     in bands by property value
   - Basis: higher of gross consideration or FBR/DC fair
     market value
--------------------------------------------------- */
function calcProperty() {
    const value = parseAmount(fieldVal('property-amount'));
    if (value === null) { renderError('property', 'Please enter a valid property value.'); return; }

    const type = fieldVal('property-transaction');   // "sale" | "purchase"
    const filer = fieldVal('property-filer');        // "filer" | "non-filer"

    if (type === 'sale') {
        const rate = filer === 'filer' ? PROPERTY_SALE_RATES.filer : PROPERTY_SALE_RATES['non-filer'];
        renderResult('property', [
            ['Property Value', formatPKR(value)],
            ['Rate (Section 236C)', (rate * 100).toFixed(2) + '%'],
            ['Advance Tax on Sale', formatPKR(value * rate), 'total']
        ], 'Withheld by the buyer/payer at the time of sale or transfer (Section 236C). Value basis: higher of gross consideration or FBR/DC fair market value. The tax is adjustable.');
    } else if (filer === 'filer') {
        const rate = PROPERTY_PURCHASE_FILER_RATE;
        renderResult('property', [
            ['Property Value', formatPKR(value)],
            ['Rate (Section 236K - Filer)', (rate * 100).toFixed(2) + '%'],
            ['Advance Tax on Purchase', formatPKR(value * rate), 'total']
        ], 'Withheld at the time of registration/transfer (Section 236K). Value basis: higher of gross consideration or FBR/DC fair market value. Filer rate: 1.25%.');
    } else {
        let band = PROPERTY_PURCHASE_NONFILER_BANDS[PROPERTY_PURCHASE_NONFILER_BANDS.length - 1];
        for (const b of PROPERTY_PURCHASE_NONFILER_BANDS) {
            if (b.max !== null && value <= b.max) { band = b; break; }
        }
        const bandLabel =
            value <= 50000000 ? '10.5% (value up to Rs. 5 crore)' :
            value <= 100000000 ? '14.5% (value up to Rs. 10 crore)' :
            '18.5% (value above Rs. 10 crore)';
        renderResult('property', [
            ['Property Value', formatPKR(value)],
            ['Rate (Section 236K - Non-Filer)', bandLabel],
            ['Advance Tax on Purchase', formatPKR(value * band.rate), 'total']
        ], 'Withheld at the time of registration/transfer (Section 236K). Value basis: higher of gross consideration or FBR/DC fair market value. Non-filer rates rise in bands by property value; filing a return lowers these rates.');
    }
}

/* - Wire-up: one handler per panel form ------------ */
const TAX_CALCULATORS = {
    salary: calcSalary,
    pension: calcPension,
    business: calcBusiness,
    rental: calcRental,
    property: calcProperty
};

const calcForms = document.querySelectorAll('.tax-panel form');

calcForms.forEach(function (form) {
    form.addEventListener('submit', function (e) {
        e.preventDefault();
        const panel = form.closest('.tax-panel');
        if (!panel) return;
        const skip = 'panel-'.length;
        const key = panel.id.slice(skip);
        if (TAX_CALCULATORS[key]) TAX_CALCULATORS[key]();
    });
});
