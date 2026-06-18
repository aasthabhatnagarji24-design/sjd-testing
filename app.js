/* 
   Shri Jal Dhara - SPA Logic Engine
   Purity, Reliability, and Transparent Tracking
*/

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Database
    initDatabase();

    // Populate public Cost Calculator rates dropdown dynamically
    populateCalculatorRates();

    // Initialize Header scroll state
    window.addEventListener('scroll', () => {
        const header = document.querySelector('header');
        if (window.scrollY > 20) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // Initialize Mobile menu navigation
    const mobileToggle = document.getElementById('mobileToggle');
    const navMenu = document.getElementById('navMenu');

    mobileToggle.addEventListener('click', () => {
        mobileToggle.classList.toggle('open');
        navMenu.classList.toggle('open');
    });

    // Close mobile nav when clicking any link
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            mobileToggle.classList.remove('open');
            navMenu.classList.remove('open');
        });
    });

    // Run initial cost calculation
    runCostCalculator();

    // Trigger simulator initial step
    activateStep(1);
});

/**
 * Tab routing logic to switch views instantly
 * @param {string} pageId - Target page identifier (e.g. 'home', 'services', 'contact', etc.)
 * @param {string} tabSubState - Optional parameter to scroll or trigger nested form tabs
 */
function navigateTo(pageId, tabSubState = '') {
    // 1. Hide all page views
    const views = document.querySelectorAll('.page-view');
    views.forEach(view => {
        view.classList.remove('active');
    });

    // 2. Remove active state from all header links
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.classList.remove('active');
    });

    // 3. Show target page view
    const targetView = document.getElementById(`${pageId}-view`);
    if (targetView) {
        targetView.classList.add('active');
    }

    // 4. Highlight matching navigation link
    navItems.forEach(item => {
        // Match standard link text
        const text = item.textContent.trim().toLowerCase();
        if (pageId === 'home' && text === 'home') item.classList.add('active');
        else if (pageId === 'services' && text === 'services') item.classList.add('active');
        else if (pageId === 'schedules' && text === 'daily delivery schedules') item.classList.add('active');
        else if (pageId === 'about' && text === 'about us') item.classList.add('active');
        else if (pageId === 'careers' && text === 'careers') item.classList.add('active');
        else if (pageId === 'contact' && text === 'contact') item.classList.add('active');
        else if (pageId === 'admin' && text === 'admin portal') item.classList.add('active');
    });

    // Scroll smoothly to top
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Handle nested sub-actions (e.g. contact sub-tabs, scrolling)
    if (pageId === 'contact') {
        if (tabSubState === 'booking-tab') {
            switchContactForm('booking');
        } else if (tabSubState === 'support-tab') {
            switchContactForm('support');
        }
    } else if (pageId === 'services') {
        if (tabSubState === 'simulator') {
            setTimeout(() => {
                const simEl = document.getElementById('simulator');
                if (simEl) {
                    simEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }, 300);
        }
    } else if (pageId === 'admin') {
        checkAdminAccess();
    }
}

/**
 * Switch contact forms (Booking vs Complaint Support)
 * @param {string} formType - 'booking' or 'support'
 */
function switchContactForm(formType) {
    const needDropdown = document.getElementById('cNeed');
    if (needDropdown) {
        if (formType === 'booking') {
            needDropdown.value = 'Home';
        } else {
            needDropdown.value = 'Support';
        }
        // Trigger select change event for custom styling if any
        needDropdown.dispatchEvent(new Event('change'));
    }
}

/**
 * Handle simulator steps click interactions on services page
 * @param {number} stepNum - Purification step clicked (1 to 4)
 */
function activateStep(stepNum) {
    // Remove active class from all steps
    const steps = document.querySelectorAll('.simulator-step');
    steps.forEach(step => step.classList.remove('active'));

    // Highlight current clicked step
    const activeStep = document.getElementById(`step${stepNum}`);
    if (activeStep) activeStep.classList.add('active');

    // Details elements
    const stepName = document.getElementById('simulatorStepName');
    const stepText = document.getElementById('simulatorStepText');
    const waterLevel = document.getElementById('waterLevel');

    // Descriptions and heights matching step
    switch (stepNum) {
        case 1:
            stepName.textContent = "Step 1: Reverse Osmosis (RO) Treatment";
            stepText.textContent = "Our high-pressure RO membrane forces water through tiny pores. This step filters out micro-particles, heavy salts, and dust. It reduces excess dissolved solids (TDS), leaving behind light, refreshing water.";
            waterLevel.style.height = "40%";
            break;
        case 2:
            stepName.textContent = "Step 2: Ultra Violet (UV) Treatment";
            stepText.textContent = "Next, the filtered water passes through an intense UV chamber. This UV light instantly destroys all hidden bacteria, viruses, and microbial elements. Your drinking water becomes completely sterile and safe.";
            waterLevel.style.height = "65%";
            break;
        case 3:
            stepName.textContent = "Step 3: TDS Controller Adjustment";
            stepText.textContent = "Pure RO water can sometimes lose beneficial minerals. We pass our water through a premium mineral TDS controller. This restores perfect levels of calcium and magnesium, ensuring an energetic taste and healthy digestion.";
            waterLevel.style.height = "85%";
            break;
        case 4:
            stepName.textContent = "Step 4: pH Balancing & Alkalinity";
            stepText.textContent = "Finally, we monitor the water's pH balance, maintaining a healthy range of 7.2 to 7.8. This neutral-to-alkaline water supports body balance, neutralizes acids, and provides a crisp, smooth throat-feel.";
            waterLevel.style.height = "100%";
            break;
    }
}

/**
 * Refill & Cost Estimator logic on contact page
 */
function runCostCalculator() {
    const calcJars = document.getElementById('calcJars');
    const calcFrequency = document.getElementById('calcFrequency');
    const calcRate = document.getElementById('calcRate');
    const calcReturned = document.getElementById('calcReturned');

    const calcTotalJarsEl = document.getElementById('calcTotalJars');
    const calcMissingTallyEl = document.getElementById('calcMissingTally');
    const calcTotalCostEl = document.getElementById('calcTotalCost');

    if (!calcJars || !calcFrequency || !calcRate || !calcReturned) return;

    // Values extraction
    const jarsQty = Math.max(1, parseInt(calcJars.value) || 1);
    const frequencyVal = calcFrequency.value;
    const rateId = calcRate.value;
    const returnedQty = Math.max(0, parseInt(calcReturned.value) || 0);

    const rates = JSON.parse(localStorage.getItem('sjd_rates') || '[]');
    const rateItem = rates.find(r => r.id === rateId) || { rate: 30, unit: 'Jars' };
    const rateVal = parseFloat(rateItem.rate) || 30;

    // 1. Calculate Supplied Jars per Month
    let deliveriesPerMonth = 30; // default daily
    if (frequencyVal === 'alternate') deliveriesPerMonth = 15;
    else if (frequencyVal === 'weekly') deliveriesPerMonth = 8;

    const totalSuppliedJars = jarsQty * deliveriesPerMonth;
    const unitSuffix = rateItem.unit || 'Jars';
    calcTotalJarsEl.textContent = `${totalSuppliedJars} ${unitSuffix}`;

    // 2. Jar Inventory Tracker (supplied vs returned empty container discrepancy)
    const missingJars = Math.max(0, totalSuppliedJars - returnedQty);
    if (missingJars === 0) {
        calcMissingTallyEl.textContent = `0 ${unitSuffix} (Clean Account)`;
        calcMissingTallyEl.style.color = "var(--accent)";
    } else {
        calcMissingTallyEl.textContent = `${missingJars} Missing ${unitSuffix} (Please Return)`;
        calcMissingTallyEl.style.color = "#dc2626"; // warning red
    }

    // 3. Compute cost
    const totalCost = totalSuppliedJars * rateVal;
    calcTotalCostEl.textContent = `₹${totalCost.toLocaleString('en-IN')}.00`;
}

/**
 * Live Route Finder searching filter (Internal or reference if used)
 */
function filterRoutes() {
    const searchInput = document.getElementById('routeSearch');
    if (!searchInput) return;
    const filterText = searchInput.value.toLowerCase().trim();
    const tableRows = document.querySelectorAll('#routesTable tbody tr');

    tableRows.forEach(row => {
        const cells = row.getElementsByTagName('td');
        if (cells.length >= 2) {
            const region = cells[0].textContent.toLowerCase();
            const neighborhoods = cells[1].textContent.toLowerCase();

            if (region.includes(filterText) || neighborhoods.includes(filterText)) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        }
    });
}

/**
 * Handle Unified Contact form submission
 */
function handleContactSubmit(event) {
    event.preventDefault();

    const name = document.getElementById('cName').value;
    const phone = document.getElementById('cPhone').value;
    const email = document.getElementById('cEmail') ? document.getElementById('cEmail').value : '';
    const address = document.getElementById('cAddress').value;
    const need = document.getElementById('cNeed').value;
    const details = document.getElementById('cDetails').value;

    // Save submission to local database (localStorage)
    const enquiries = JSON.parse(localStorage.getItem('sjd_enquiries') || '[]');
    const caseIdNum = Math.floor(1000 + Math.random() * 9000);
    const caseId = `SJD-${caseIdNum}`;

    const newEnquiry = {
        id: caseId,
        name: name,
        phone: phone,
        email: email,
        need: need,
        address: address,
        details: details,
        status: 'New',
        date: new Date().toISOString(),
        notes: ''
    };

    enquiries.push(newEnquiry);
    localStorage.setItem('sjd_enquiries', JSON.stringify(enquiries));

    const contactForm = document.getElementById('contactForm');
    const contactSuccess = document.getElementById('contactSuccess');
    const successTitle = document.getElementById('contactSuccessTitle');
    const successText = document.getElementById('contactSuccessText');

    contactForm.style.display = 'none';
    contactSuccess.classList.add('active');

    // Dynamically adjust success messages based on type of need selection
    if (need === 'Support' || need === 'Feedback') {
        successTitle.textContent = "Support Case Logged!";
        successText.innerHTML = `Hello <strong>${name}</strong>, your support request for <em>${need === 'Support' ? 'billing/jar discrepancies' : 'general feedback'}</em> has been logged. Case ID: <strong>#SJD-${caseIdNum}</strong>. Our central Raisen helpline coordinator will contact you at <strong>${phone}</strong> within 30 minutes.`;
    } else {
        successTitle.textContent = "Delivery Booking Received!";
        successText.innerHTML = `Thank you <strong>${name}</strong>! We registered your request for a <strong>${need}</strong> setup to address: <em>${address}</em>. Our Salamatpur manager, Satish Yadav, will call you at <strong>${phone}</strong> within 1 hour to start your refills!`;
    }
}

/**
 * Reset unified contact form
 */
function resetContactForm() {
    const contactSuccess = document.getElementById('contactSuccess');
    const contactForm = document.getElementById('contactForm');

    contactForm.reset();
    contactForm.style.display = 'flex';
    contactSuccess.classList.remove('active');
}

/**
 * Handle Careers CV bio-data drag and drop or selection
 */
function handleFileSelected() {
    const fileInput = document.getElementById('carFile');
    const filenameDisplay = document.getElementById('carFilenameDisplay');

    if (fileInput && fileInput.files.length > 0) {
        const file = fileInput.files[0];
        filenameDisplay.textContent = `Attached: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`;
        filenameDisplay.style.display = 'block';
    }
}

/**
 * Scroll and pre-select role in Careers form
 */
function scrollToCareerForm(positionName) {
    navigateTo('careers');
    
    // Select position in dropdown
    const dropdown = document.getElementById('carJob');
    if (dropdown) {
        dropdown.value = positionName;
    }

    // Scroll to form panel
    setTimeout(() => {
        const formPanel = document.getElementById('careerFormPanel');
        if (formPanel) {
            formPanel.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, 300);
}

/**
 * Handle career application submission
 */
function handleCareerSubmit(event) {
    event.preventDefault();

    const name = document.getElementById('carName').value;
    const phone = document.getElementById('carPhone').value;
    const job = document.getElementById('carJob').value;
    const location = document.getElementById('carLocation').value;
    const experience = document.getElementById('carExperience').value;
    const fileInput = document.getElementById('carFile');
    const fileName = fileInput && fileInput.files.length > 0 ? fileInput.files[0].name : '';

    // Save to local database (localStorage)
    const careers = JSON.parse(localStorage.getItem('sjd_careers') || '[]');
    const jobId = `JOB-${Math.floor(2000 + Math.random() * 8000)}`;

    const newCareer = {
        id: jobId,
        name: name,
        phone: phone,
        job: job,
        location: location,
        experience: experience,
        fileName: fileName,
        status: 'Applied',
        date: new Date().toISOString(),
        notes: ''
    };

    careers.push(newCareer);
    localStorage.setItem('sjd_careers', JSON.stringify(careers));

    const careerForm = document.getElementById('careerForm');
    const careerSuccess = document.getElementById('careerSuccess');

    careerForm.style.display = 'none';
    careerSuccess.classList.add('active');
}

/**
 * Reset career form display
 */
function resetCareerForm() {
    const careerForm = document.getElementById('careerForm');
    const careerSuccess = document.getElementById('careerSuccess');
    const filenameDisplay = document.getElementById('carFilenameDisplay');

    careerForm.reset();
    if (filenameDisplay) {
        filenameDisplay.style.display = 'none';
        filenameDisplay.textContent = '';
    }

    careerForm.style.display = 'flex';
    careerSuccess.classList.remove('active');
}


/* ==========================================================
   Admin Portal Logic Engine (Databases, Auth & CRUD)
   ========================================================== */

/**
 * Populate standard rate dropdowns dynamically from database
 */
function populateCalculatorRates() {
    const calcRate = document.getElementById('calcRate');
    if (!calcRate) return;

    const rates = JSON.parse(localStorage.getItem('sjd_rates') || '[]');
    const currentValue = calcRate.value;

    calcRate.innerHTML = '';
    rates.forEach(item => {
        const option = document.createElement('option');
        option.value = item.id;
        option.textContent = `${item.name} (₹${item.rate} per ${item.unit.toLowerCase().replace(/s$/, '')})`;
        calcRate.appendChild(option);
    });

    if (currentValue && Array.from(calcRate.options).some(opt => opt.value === currentValue)) {
        calcRate.value = currentValue;
    } else {
        const standardOpt = Array.from(calcRate.options).find(opt => opt.value === 'standard');
        if (standardOpt) {
            calcRate.value = standardOpt.value;
        } else if (calcRate.options.length > 0) {
            calcRate.value = calcRate.options[0].value;
        }
    }
}

/**
 * Initialize mock database tables inside local storage
 */
function initDatabase() {
    // 1. Rates Configuration table
    if (!localStorage.getItem('sjd_rates') || localStorage.getItem('sjd_rates').includes('capsule')) {
        const defaultRates = [
            { id: 'camper', name: '20L Insulated Camper', rate: 40, unit: 'Campers' },
            { id: 'standard', name: '20L Standard Bubble Jar', rate: 30, unit: 'Jars' },
            { id: 'bulk', name: 'Bulk / Society Special', rate: 25, unit: 'Jars' }
        ];
        localStorage.setItem('sjd_rates', JSON.stringify(defaultRates));
    }

    // 2. Enquiries table
    if (!localStorage.getItem('sjd_enquiries')) {
        const defaultEnquiries = [
            {
                id: 'SJD-1024',
                name: 'Amit Sharma',
                phone: '9876543210',
                email: 'amit.sharma@example.com',
                need: 'Home',
                address: 'B-12, Near Sanchi Stupa Road, Sanchi',
                details: 'Need 2 jars delivered every alternate day starting this week.',
                status: 'New',
                date: new Date(Date.now() - 3600000 * 24).toISOString(),
                notes: 'Spoke to customer. Prefers morning delivery slot.'
            },
            {
                id: 'SJD-1025',
                name: 'Rajesh Verma',
                phone: '9425011223',
                email: 'rverma@gmail.com',
                need: 'Support',
                address: '74, Dr Hedgewar Colony, Sanchi',
                details: 'Last month bill shows 15 jars, but we only received 12. Please cross-check empty jar return records.',
                status: 'Contacted',
                date: new Date(Date.now() - 3600000 * 12).toISOString(),
                notes: 'Checking delivery logs for May. Driver claims 3 jars were left at lobby security.'
            },
            {
                id: 'SJD-1026',
                name: 'Vikas Patel',
                phone: '9893045455',
                email: '',
                need: 'Society',
                address: 'Shree Heights Apartments, Block A, Salamatpur',
                details: 'Need bulk daily delivery of 10 jars for society residents. Want special corporate pricing of ₹25.',
                status: 'Resolved',
                date: new Date(Date.now() - 3600000 * 48).toISOString(),
                notes: 'Approved at ₹25/jar. Scheduled daily morning 7 AM route delivery.'
            }
        ];
        localStorage.setItem('sjd_enquiries', JSON.stringify(defaultEnquiries));
    }

    // 3. Careers table
    if (!localStorage.getItem('sjd_careers')) {
        const defaultCareers = [
            {
                id: 'JOB-2045',
                name: 'Sunil Yadav',
                phone: '9425501234',
                job: 'Delivery Team',
                location: 'Salamatpur',
                experience: 'Drove commercial loader vehicles for 2 years in Raisen district. Very familiar with local routes.',
                fileName: 'sunil_bio_data.pdf',
                status: 'Applied',
                date: new Date(Date.now() - 3600000 * 18).toISOString(),
                notes: 'Good candidate. Valid commercial driving license.'
            },
            {
                id: 'JOB-2046',
                name: 'Ramesh Sen',
                phone: '9179001122',
                job: 'Plant Operations',
                location: 'Sanchi',
                experience: 'Worked at a local soda plant helping with water purification machine filters maintenance.',
                fileName: '',
                status: 'Interview Scheduled',
                date: new Date(Date.now() - 3600000 * 36).toISOString(),
                notes: 'Called for interview at plant on Friday 10 AM.'
            }
        ];
        localStorage.setItem('sjd_careers', JSON.stringify(defaultCareers));
    }

    // 4. Routes table
    if (!localStorage.getItem('sjd_routes')) {
        const defaultRoutes = [
            { id: 'RTE-101', region: 'Sanchi Town', neighborhoods: 'Stupa Road, Station Road, Headgewar Colony', timing: 'Morning (7:30 AM - 10:30 AM)', days: 'Daily' },
            { id: 'RTE-102', region: 'Salamatpur Main', neighborhoods: 'Market Area, Bus Stand, Old Town', timing: 'Afternoon (1:00 PM - 4:00 PM)', days: 'Mon, Wed, Fri' },
            { id: 'RTE-103', region: 'Bypass & Suburbs', neighborhoods: 'Highway enclave, Industrial estate, Bypass housing', timing: 'Morning (9:00 AM - 11:30 AM)', days: 'Tue, Thu, Sat' }
        ];
        localStorage.setItem('sjd_routes', JSON.stringify(defaultRoutes));
    }

    // 5. Credentials
    if (!localStorage.getItem('sjd_admin_username')) {
        localStorage.setItem('sjd_admin_username', 'admin');
    }
    if (!localStorage.getItem('sjd_admin_password')) {
        localStorage.setItem('sjd_admin_password', 'jaldhara2026');
    }
}

/**
 * Check admin authorization session tokens (sessionStorage-based)
 */
function checkAdminAccess() {
    const isLoggedIn = sessionStorage.getItem('sjd_admin_logged_in') === 'true';
    const loginView = document.getElementById('admin-login-subview');
    const panelView = document.getElementById('admin-panel-subview');

    if (!loginView || !panelView) return;

    if (isLoggedIn) {
        loginView.style.display = 'none';
        panelView.style.display = 'flex';
        renderAdminTab();
    } else {
        loginView.style.display = 'block';
        panelView.style.display = 'none';
        
        // Reset inputs & error message
        const errorEl = document.getElementById('adminLoginError');
        if (errorEl) errorEl.style.display = 'none';
        document.getElementById('adminUser').value = '';
        document.getElementById('adminPass').value = '';
    }
}

/**
 * Handle Admin Portal Login sequence
 */
function handleAdminLogin(event) {
    event.preventDefault();
    const userVal = document.getElementById('adminUser').value.trim();
    const passVal = document.getElementById('adminPass').value.trim();

    const correctUser = localStorage.getItem('sjd_admin_username') || 'admin';
    const correctPass = localStorage.getItem('sjd_admin_password') || 'jaldhara2026';

    const errorEl = document.getElementById('adminLoginError');

    if (userVal === correctUser && passVal === correctPass) {
        sessionStorage.setItem('sjd_admin_logged_in', 'true');
        if (errorEl) errorEl.style.display = 'none';
        document.getElementById('adminUser').value = '';
        document.getElementById('adminPass').value = '';
        checkAdminAccess();
    } else {
        if (errorEl) {
            errorEl.textContent = 'Invalid credentials. Please try again.';
            errorEl.style.display = 'block';
        }
    }
}

/**
 * Log out admin and return to home page
 */
function handleAdminLogout() {
    sessionStorage.removeItem('sjd_admin_logged_in');
    checkAdminAccess();
    navigateTo('home');
}


/* Tab switcher logic inside admin panel */
let currentAdminTab = 'dashboard';
let enquiriesSearchQuery = '';
let enquiriesFilterType = 'All';
let careersSearchQuery = '';
let careersFilterJob = 'All';

function switchAdminTab(tabName) {
    currentAdminTab = tabName;

    // Highlight tab buttons
    const tabBtns = document.querySelectorAll('.sidebar-tab-btn');
    tabBtns.forEach(btn => {
        btn.classList.remove('active');
    });

    const activeBtn = document.getElementById(`btn-tab-${tabName}`);
    if (activeBtn) activeBtn.classList.add('active');

    renderAdminTab();
}

function renderAdminTab() {
    const container = document.getElementById('admin-tab-content');
    if (!container) return;

    container.innerHTML = ''; // reset view

    switch (currentAdminTab) {
        case 'dashboard':
            renderDashboardTab(container);
            break;
        case 'enquiries':
            renderEnquiriesTab(container);
            break;
        case 'careers':
            renderCareersTab(container);
            break;
        case 'rates':
            renderRatesTab(container);
            break;
        case 'routes':
            renderRoutesTab(container);
            break;
        case 'settings':
            renderSettingsTab(container);
            break;
    }
}

/* Tab 1: Dashboard */
function renderDashboardTab(container) {
    const enquiries = JSON.parse(localStorage.getItem('sjd_enquiries') || '[]');
    const careers = JSON.parse(localStorage.getItem('sjd_careers') || '[]');
    const routes = JSON.parse(localStorage.getItem('sjd_routes') || '[]');

    const totalBookings = enquiries.filter(e => e.need !== 'Support' && e.need !== 'Feedback').length;
    const pendingEnqs = enquiries.filter(e => e.status === 'New').length;
    const activeRefills = enquiries.filter(e => e.status === 'Refill Active').length;
    const jobApps = careers.length;

    container.innerHTML = `
        <div class="admin-tab-header">
            <h2>Dashboard Overview</h2>
            <span style="font-size: 0.95rem; color: var(--text-muted);">Operation analytics and parameters</span>
        </div>

        <div class="admin-stats-grid">
            <div class="card glass-panel admin-stat-card">
                <h5>Total Bookings</h5>
                <span class="stat-val">${totalBookings}</span>
                <span class="stat-desc">Water supply clients</span>
            </div>
            <div class="card glass-panel admin-stat-card" style="border-top-color: #f97316;">
                <h5>New / Pending</h5>
                <span class="stat-val" style="color: #f97316;">${pendingEnqs}</span>
                <span class="stat-desc">Awaiting coordinator call</span>
            </div>
            <div class="card glass-panel admin-stat-card" style="border-top-color: #10b981;">
                <h5>Active Refills</h5>
                <span class="stat-val" style="color: #10b981;">${activeRefills}</span>
                <span class="stat-desc">Ongoing water deliveries</span>
            </div>
            <div class="card glass-panel admin-stat-card" style="border-top-color: var(--accent);">
                <h5>Job Applications</h5>
                <span class="stat-val" style="color: var(--accent);">${jobApps}</span>
                <span class="stat-desc">Hiring candidates</span>
            </div>
        </div>

        <div class="grid-2" style="margin-bottom: 20px; gap: 24px;">
            <div class="card glass-panel recent-activity-box">
                <h4>System Logs & Info</h4>
                <div style="font-size: 0.95rem; line-height: 1.6; color: var(--text-main); display: flex; flex-direction: column; gap: 10px;">
                    <div>📍 <strong>Active Delivery Routes:</strong> ${routes.length} zones configured internally</div>
                    <div>💰 <strong>Calculator Products:</strong> 3 rates managed dynamically</div>
                    <div>🔐 <strong>Session Access:</strong> Expires immediately upon tab/window closure.</div>
                    
                    <div style="margin-top: 12px; border-top: 1px dashed rgba(0,0,0,0.08); padding-top: 12px; display: flex; gap: 10px;">
                        <button class="btn-primary" onclick="switchAdminTab('enquiries')" style="font-size: 0.85rem; padding: 8px 14px;">Manage Enquiries &rarr;</button>
                        <button class="btn-secondary" onclick="switchAdminTab('rates')" style="font-size: 0.85rem; padding: 8px 14px;">Edit Calculator &rarr;</button>
                    </div>
                </div>
            </div>

            <div class="card glass-panel recent-activity-box">
                <h4>Recent public messages</h4>
                <div class="activity-list">
                    ${enquiries.slice(-3).reverse().map(e => `
                        <div class="activity-item">
                            <span class="activity-text">
                                <strong>${e.name}</strong> submitted a <em>${e.need}</em> request
                            </span>
                            <span class="activity-time">${new Date(e.date).toLocaleDateString()}</span>
                        </div>
                    `).join('') || '<div class="activity-text" style="color: var(--text-muted);">No entries yet.</div>'}
                </div>
            </div>
        </div>
    `;
}

/* Tab 2: Enquiries & Bookings Database */
function renderEnquiriesTab(container) {
    const enquiries = JSON.parse(localStorage.getItem('sjd_enquiries') || '[]');

    const filtered = enquiries.filter(e => {
        const matchesSearch = e.name.toLowerCase().includes(enquiriesSearchQuery.toLowerCase()) ||
                              e.phone.includes(enquiriesSearchQuery) ||
                              e.id.toLowerCase().includes(enquiriesSearchQuery.toLowerCase()) ||
                              (e.address && e.address.toLowerCase().includes(enquiriesSearchQuery.toLowerCase()));
        const matchesType = enquiriesFilterType === 'All' || e.need === enquiriesFilterType;
        return matchesSearch && matchesType;
    });

    container.innerHTML = `
        <div class="admin-tab-header">
            <h2>Enquiries & Bookings</h2>
            <span style="font-size: 0.95rem; color: var(--text-muted);">${filtered.length} entries matching</span>
        </div>

        <div class="admin-filters-bar">
            <div class="filter-group">
                <label for="enqSearch">Search Query (Name, Phone, ID, Address):</label>
                <input type="text" id="enqSearch" placeholder="Filter rows..." value="${enquiriesSearchQuery}" oninput="handleEnquirySearch(this.value)">
            </div>
            <div class="filter-group" style="max-width: 220px;">
                <label for="enqFilter">Need Type:</label>
                <select id="enqFilter" onchange="handleEnquiryFilter(this.value)">
                    <option value="All" ${enquiriesFilterType === 'All' ? 'selected' : ''}>All Categories</option>
                    <option value="Home" ${enquiriesFilterType === 'Home' ? 'selected' : ''}>Home Delivery</option>
                    <option value="Society" ${enquiriesFilterType === 'Society' ? 'selected' : ''}>Housing Society</option>
                    <option value="Office" ${enquiriesFilterType === 'Office' ? 'selected' : ''}>Office / Shop</option>
                    <option value="Event" ${enquiriesFilterType === 'Event' ? 'selected' : ''}>Event Supply</option>
                    <option value="Support" ${enquiriesFilterType === 'Support' ? 'selected' : ''}>Support Cases</option>
                    <option value="Feedback" ${enquiriesFilterType === 'Feedback' ? 'selected' : ''}>Feedback / Complaints</option>
                    <option value="Other" ${enquiriesFilterType === 'Other' ? 'selected' : ''}>Other Queries</option>
                </select>
            </div>
        </div>

        <div class="table-responsive">
            <table class="admin-table">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Case ID</th>
                        <th>Name</th>
                        <th>Phone</th>
                        <th>Need Type</th>
                        <th>Status</th>
                        <th style="text-align: right;">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${filtered.length === 0 ? '<tr><td colspan="7" style="text-align: center; color: var(--text-muted);">No enquiries in database.</td></tr>' : ''}
                    ${filtered.map(e => `
                        <tr>
                            <td>${new Date(e.date).toLocaleDateString()}</td>
                            <td><strong>#${e.id}</strong></td>
                            <td>${e.name}</td>
                            <td>${e.phone}</td>
                            <td><span class="status-tag" style="background: rgba(2, 132, 199, 0.05); color: var(--primary); font-weight: 500; font-size: 0.85rem;">${e.need}</span></td>
                            <td>
                                <span class="admin-badge admin-badge-${getBadgeClass(e.status)}">${e.status}</span>
                            </td>
                            <td style="text-align: right; white-space: nowrap;">
                                <button class="action-btn action-btn-view" onclick="toggleDetailsRow('${e.id}')">Details</button>
                                <button class="action-btn action-btn-delete" onclick="deleteItem('${e.id}', 'sjd_enquiries')">Delete</button>
                            </td>
                        </tr>
                        <tr id="details-row-${e.id}" class="admin-detail-row" style="display: none;">
                            <td colspan="7">
                                <div class="admin-detail-card">
                                    <div class="detail-grid">
                                        <div class="detail-block">
                                            <h5>Full Delivery Address</h5>
                                            <p>${e.address || 'Not specified'}</p>
                                        </div>
                                        <div class="detail-block">
                                            <h5>Email Address</h5>
                                            <p>${e.email ? `<a href="mailto:${e.email}" style="color: var(--primary); text-decoration: underline;">${e.email}</a>` : 'Not specified'}</p>
                                        </div>
                                    </div>
                                    <div class="detail-block" style="margin-top: 12px;">
                                        <h5>Details / Customer Message</h5>
                                        <p style="white-space: pre-wrap; background: rgba(0,0,0,0.02); padding: 12px; border-radius: 8px; border: 1px solid rgba(0,0,0,0.04); font-size: 0.95rem;">${e.details}</p>
                                    </div>
                                    
                                    <div class="admin-notes-section" style="display: flex; gap: 20px; align-items: flex-end; margin-top: 16px;">
                                        <div style="flex-grow: 1;">
                                            <label for="status-select-${e.id}">Change Case Status:</label>
                                            <select id="status-select-${e.id}" onchange="changeItemStatus('${e.id}', this.value, 'sjd_enquiries')" style="padding: 8px 12px; border-radius: 6px; border: 1px solid var(--surface-border); outline: none; background: white; font-size: 0.9rem; width: 220px;">
                                                <option value="New" ${e.status === 'New' ? 'selected' : ''}>New</option>
                                                <option value="Contacted" ${e.status === 'Contacted' ? 'selected' : ''}>Contacted / Scheduled</option>
                                                <option value="Refill Active" ${e.status === 'Refill Active' ? 'selected' : ''}>Refill Active (Daily Delivery)</option>
                                                <option value="Resolved" ${e.status === 'Resolved' ? 'selected' : ''}>Resolved Case</option>
                                                <option value="Archived" ${e.status === 'Archived' ? 'selected' : ''}>Archived / Closed</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div class="admin-notes-section" style="margin-top: 16px;">
                                        <label for="notes-${e.id}">Coordinator Internal Notes:</label>
                                        <textarea id="notes-${e.id}" rows="3" placeholder="Enter notes from call follow-ups, coordinator coordination, jar count tally adjustments...">${e.notes || ''}</textarea>
                                        <button class="btn-primary" onclick="saveAdminNotes('${e.id}', 'sjd_enquiries')" style="font-size: 0.85rem; padding: 6px 14px;">Save Notes</button>
                                    </div>
                                </div>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

function handleEnquirySearch(val) {
    enquiriesSearchQuery = val;
    renderEnquiriesTab(document.getElementById('admin-tab-content'));
}

function handleEnquiryFilter(val) {
    enquiriesFilterType = val;
    renderEnquiriesTab(document.getElementById('admin-tab-content'));
}

function getBadgeClass(status) {
    switch (status) {
        case 'New': return 'new';
        case 'Contacted': return 'contacted';
        case 'Refill Active':
        case 'Hired':
            return 'active';
        case 'Resolved': return 'resolved';
        case 'Archived': return 'archived';
        case 'Interview Scheduled': return 'interview';
        case 'Rejected': return 'rejected';
        default: return 'archived';
    }
}

function toggleDetailsRow(id) {
    const row = document.getElementById(`details-row-${id}`);
    if (row) {
        row.style.display = row.style.display === 'none' ? 'table-row' : 'none';
    }
}

/* Tab 3: Careers & Applications */
function renderCareersTab(container) {
    const careers = JSON.parse(localStorage.getItem('sjd_careers') || '[]');

    const filtered = careers.filter(c => {
        const matchesSearch = c.name.toLowerCase().includes(careersSearchQuery.toLowerCase()) ||
                              c.phone.includes(careersSearchQuery) ||
                              c.id.toLowerCase().includes(careersSearchQuery.toLowerCase()) ||
                              c.location.toLowerCase().includes(careersSearchQuery.toLowerCase());
        const matchesJob = careersFilterJob === 'All' || c.job === careersFilterJob;
        return matchesSearch && matchesJob;
    });

    container.innerHTML = `
        <div class="admin-tab-header">
            <h2>Job Applications</h2>
            <span style="font-size: 0.95rem; color: var(--text-muted);">${filtered.length} candidates applied</span>
        </div>

        <div class="admin-filters-bar">
            <div class="filter-group">
                <label for="carSearch">Search Candidate File (Name, Phone, ID, City):</label>
                <input type="text" id="carSearch" placeholder="Filter rows..." value="${careersSearchQuery}" oninput="handleCareerSearch(this.value)">
            </div>
            <div class="filter-group" style="max-width: 220px;">
                <label for="carFilter">Role Applied For:</label>
                <select id="carFilter" onchange="handleCareerFilter(this.value)">
                    <option value="All" ${careersFilterJob === 'All' ? 'selected' : ''}>All Positions</option>
                    <option value="Delivery Team" ${careersFilterJob === 'Delivery Team' ? 'selected' : ''}>Delivery Team</option>
                    <option value="Plant Operations" ${careersFilterJob === 'Plant Operations' ? 'selected' : ''}>Plant Operations</option>
                    <option value="Support & Office Team" ${careersFilterJob === 'Support & Office Team' ? 'selected' : ''}>Support & Office</option>
                    <option value="Other" ${careersFilterJob === 'Other' ? 'selected' : ''}>Other / General</option>
                </select>
            </div>
        </div>

        <div class="table-responsive">
            <table class="admin-table">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Job ID</th>
                        <th>Name</th>
                        <th>Phone</th>
                        <th>Location</th>
                        <th>Position</th>
                        <th>Status</th>
                        <th style="text-align: right;">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${filtered.length === 0 ? '<tr><td colspan="8" style="text-align: center; color: var(--text-muted);">No candidate files in database.</td></tr>' : ''}
                    ${filtered.map(c => `
                        <tr>
                            <td>${new Date(c.date).toLocaleDateString()}</td>
                            <td><strong>#${c.id}</strong></td>
                            <td>${c.name}</td>
                            <td>${c.phone}</td>
                            <td>${c.location}</td>
                            <td><span class="status-tag" style="background: rgba(13, 148, 136, 0.05); color: var(--accent); font-weight: 500; font-size: 0.85rem;">${c.job}</span></td>
                            <td>
                                <span class="admin-badge admin-badge-${getBadgeClass(c.status)}">${c.status}</span>
                            </td>
                            <td style="text-align: right; white-space: nowrap;">
                                <button class="action-btn action-btn-view" onclick="toggleDetailsRow('${c.id}')">View CV</button>
                                <button class="action-btn action-btn-delete" onclick="deleteItem('${c.id}', 'sjd_careers')">Delete</button>
                            </td>
                        </tr>
                        <tr id="details-row-${c.id}" class="admin-detail-row" style="display: none;">
                            <td colspan="8">
                                <div class="admin-detail-card">
                                    <div class="detail-grid">
                                        <div class="detail-block">
                                            <h5>Location (Current Residence)</h5>
                                            <p>${c.location}</p>
                                        </div>
                                        <div class="detail-block">
                                            <h5>Attached Bio-Data File</h5>
                                            <p>${c.fileName ? `📄 <strong>${c.fileName}</strong> (Click to view)` : 'No file upload (Written experience details below)'}</p>
                                        </div>
                                    </div>
                                    <div class="detail-block" style="margin-top: 12px;">
                                        <h5>Work Experience or Background details</h5>
                                        <p style="white-space: pre-wrap; background: rgba(0,0,0,0.02); padding: 12px; border-radius: 8px; border: 1px solid rgba(0,0,0,0.04); font-size: 0.95rem;">${c.experience || 'No description provided.'}</p>
                                    </div>
                                    
                                    <div class="admin-notes-section" style="display: flex; gap: 20px; align-items: flex-end; margin-top: 16px;">
                                        <div style="flex-grow: 1;">
                                            <label for="status-select-${c.id}">Recruitment Status:</label>
                                            <select id="status-select-${c.id}" onchange="changeItemStatus('${c.id}', this.value, 'sjd_careers')" style="padding: 8px 12px; border-radius: 6px; border: 1px solid var(--surface-border); outline: none; background: white; font-size: 0.9rem; width: 220px;">
                                                <option value="Applied" ${c.status === 'Applied' ? 'selected' : ''}>Applied / New</option>
                                                <option value="Reviewed" ${c.status === 'Reviewed' ? 'selected' : ''}>Reviewed File</option>
                                                <option value="Interview Scheduled" ${c.status === 'Interview Scheduled' ? 'selected' : ''}>Interview Scheduled</option>
                                                <option value="Hired" ${c.status === 'Hired' ? 'selected' : ''}>Hired Team Member</option>
                                                <option value="Rejected" ${c.status === 'Rejected' ? 'selected' : ''}>Rejected / Closed</option>
                                                <option value="Archived" ${c.status === 'Archived' ? 'selected' : ''}>Archived Application</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div class="admin-notes-section" style="margin-top: 16px;">
                                        <label for="notes-${c.id}">Administrative Recruitment Notes:</label>
                                        <textarea id="notes-${c.id}" rows="3" placeholder="Enter notes from interviews, past employment calls, credential verifications...">${c.notes || ''}</textarea>
                                        <button class="btn-primary" onclick="saveAdminNotes('${c.id}', 'sjd_careers')" style="font-size: 0.85rem; padding: 6px 14px;">Save Notes</button>
                                    </div>
                                </div>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

function handleCareerSearch(val) {
    careersSearchQuery = val;
    renderCareersTab(document.getElementById('admin-tab-content'));
}

function handleCareerFilter(val) {
    careersFilterJob = val;
    renderCareersTab(document.getElementById('admin-tab-content'));
}

/* Tab 4: Product Rates Config */
function renderRatesTab(container) {
    const rates = JSON.parse(localStorage.getItem('sjd_rates') || '[]');

    container.innerHTML = `
        <div class="admin-tab-header">
            <h2>Product Rates Sheet</h2>
            <span style="font-size: 0.95rem; color: var(--text-muted);">Manage Cost Calculator rate constants</span>
        </div>

        <p style="margin-bottom: 24px; font-size: 0.95rem; color: var(--text-muted);">Modifying these items will instantly update display labels and billing calculations on the public contact form estimator widget.</p>

        <div class="admin-rates-grid">
            ${rates.map(r => `
                <div class="card glass-panel rate-edit-card">
                    <h4 style="margin: 0; color: var(--primary-dark); font-size: 1.15rem; border-bottom: 1px dashed rgba(0,0,0,0.06); padding-bottom: 8px;">Product ID: ${r.id}</h4>
                    <div class="form-group" style="margin-top: 8px;">
                        <label for="rate-name-${r.id}" style="font-size: 0.85rem; font-weight: 600; color: var(--text-muted);">Label Name:</label>
                        <input type="text" id="rate-name-${r.id}" value="${r.name}" style="padding: 8px; border-radius: 6px; border: 1px solid var(--surface-border); width: 100%;">
                    </div>
                    <div class="form-group">
                        <label for="rate-val-${r.id}" style="font-size: 0.85rem; font-weight: 600; color: var(--text-muted);">Rate per unit (₹):</label>
                        <input type="number" id="rate-val-${r.id}" value="${r.rate}" min="0" style="padding: 8px; border-radius: 6px; border: 1px solid var(--surface-border); width: 100%;">
                    </div>
                    <div class="form-group">
                        <label for="rate-unit-${r.id}" style="font-size: 0.85rem; font-weight: 600; color: var(--text-muted);">Container Unit (plural):</label>
                        <input type="text" id="rate-unit-${r.id}" value="${r.unit}" style="padding: 8px; border-radius: 6px; border: 1px solid var(--surface-border); width: 100%;">
                    </div>
                    <button class="btn-primary" onclick="saveRateItem('${r.id}')" style="font-size: 0.85rem; padding: 8px; justify-content: center; width: 100%; margin-top: 10px;">Save Changes</button>
                </div>
            `).join('')}
        </div>
    `;
}

function saveRateItem(id) {
    const nameVal = document.getElementById(`rate-name-${id}`).value.trim();
    const rateVal = parseFloat(document.getElementById(`rate-val-${id}`).value) || 0;
    const unitVal = document.getElementById(`rate-unit-${id}`).value.trim();

    const rates = JSON.parse(localStorage.getItem('sjd_rates') || '[]');
    const item = rates.find(r => r.id === id);

    if (item) {
        item.name = nameVal;
        item.rate = rateVal;
        item.unit = unitVal;
        localStorage.setItem('sjd_rates', JSON.stringify(rates));

        // Sync and re-evaluate calculator rates
        populateCalculatorRates();
        runCostCalculator();

        alert(`Rate item "${nameVal}" updated to ₹${rateVal} per ${unitVal.toLowerCase().replace(/s$/, '')}!`);
        renderRatesTab(document.getElementById('admin-tab-content'));
    }
}

/* Tab 5: Delivery Route logistics */
function renderRoutesTab(container) {
    const routes = JSON.parse(localStorage.getItem('sjd_routes') || '[]');

    container.innerHTML = `
        <div class="admin-tab-header">
            <h2>Delivery Routes Manager</h2>
            <span style="font-size: 0.95rem; color: var(--text-muted);">${routes.length} configured routes</span>
        </div>

        <div class="routes-layout">
            <!-- Add Form -->
            <div class="card glass-panel" style="padding: 24px;">
                <h4 style="margin: 0 0 16px 0; color: var(--primary-dark); font-size: 1.2rem;">Add Route Schedule</h4>
                <form id="addRouteForm" onsubmit="addRouteItem(event)" style="display: flex; flex-direction: column; gap: 14px;">
                    <div class="form-group">
                        <label for="routeRegion">Region / Sector:</label>
                        <input type="text" id="routeRegion" required placeholder="e.g. Sanchi Bypass, Salamatpur East">
                    </div>
                    <div class="form-group">
                        <label for="routeNeighborhoods">Colonies / Landmarks:</label>
                        <textarea id="routeNeighborhoods" rows="3" required placeholder="e.g. Stupa Colony, Salamatpur Station Road, Old Market"></textarea>
                    </div>
                    <div class="form-group">
                        <label for="routeTiming">Standard Timing Window:</label>
                        <input type="text" id="routeTiming" required placeholder="e.g. Morning (7:30 AM - 10:30 AM)">
                    </div>
                    <div class="form-group">
                        <label for="routeDays">Days of Delivery:</label>
                        <input type="text" id="routeDays" required placeholder="e.g. Daily or Mon, Wed, Fri">
                    </div>
                    <button type="submit" class="btn-primary" style="width: 100%; justify-content: center; padding: 10px;">Create Route</button>
                </form>
            </div>

            <!-- Route Table -->
            <div class="table-responsive">
                <table class="admin-table">
                    <thead>
                        <tr>
                            <th>Region</th>
                            <th>Neighborhoods / Landmarks</th>
                            <th>Days</th>
                            <th>Time Slot</th>
                            <th style="text-align: right;">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${routes.length === 0 ? '<tr><td colspan="5" style="text-align: center; color: var(--text-muted);">No routes configured yet.</td></tr>' : ''}
                        ${routes.map(r => `
                            <tr>
                                <td><strong>${r.region}</strong></td>
                                <td style="font-size: 0.85rem; max-width: 200px;">${r.neighborhoods}</td>
                                <td><span class="status-tag" style="background: rgba(13, 148, 136, 0.08); color: var(--accent); font-weight: 500; font-size: 0.85rem;">${r.days}</span></td>
                                <td style="font-size: 0.85rem; font-style: italic;">${r.timing}</td>
                                <td style="text-align: right;">
                                    <button class="action-btn action-btn-delete" onclick="deleteItem('${r.id}', 'sjd_routes')">Delete</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

function addRouteItem(event) {
    event.preventDefault();
    const regionVal = document.getElementById('routeRegion').value.trim();
    const neighVal = document.getElementById('routeNeighborhoods').value.trim();
    const timingVal = document.getElementById('routeTiming').value.trim();
    const daysVal = document.getElementById('routeDays').value.trim();

    const routes = JSON.parse(localStorage.getItem('sjd_routes') || '[]');
    const routeId = `RTE-${Math.floor(100 + Math.random() * 900)}`;

    const newRoute = {
        id: routeId,
        region: regionVal,
        neighborhoods: neighVal,
        timing: timingVal,
        days: daysVal
    };

    routes.push(newRoute);
    localStorage.setItem('sjd_routes', JSON.stringify(routes));

    document.getElementById('addRouteForm').reset();
    alert(`New delivery route "${regionVal}" added successfully!`);
    renderRoutesTab(document.getElementById('admin-tab-content'));
}

/* Tab 6: Settings, Security & Exports */
function renderSettingsTab(container) {
    const user = localStorage.getItem('sjd_admin_username') || 'admin';

    container.innerHTML = `
        <div class="admin-tab-header">
            <h2>Portal Settings & Database Recovery</h2>
            <span style="font-size: 0.95rem; color: var(--text-muted);">Manage security controls and file backups</span>
        </div>

        <div class="grid-2" style="gap: 24px; align-items: start; margin-bottom: 20px;">
            <!-- Password Form -->
            <div class="card glass-panel" style="padding: 24px;">
                <h4 style="margin: 0 0 16px 0; color: var(--primary-dark); font-size: 1.2rem;">Change Admin Credentials</h4>
                <form id="changePasswordForm" onsubmit="changeAdminPassword(event)" style="display: flex; flex-direction: column; gap: 14px;">
                    <div class="form-group">
                        <label for="newAdminUser">Admin Username:</label>
                        <input type="text" id="newAdminUser" value="${user}" required style="padding: 8px; border-radius: 6px; border: 1px solid var(--surface-border);">
                    </div>
                    <div class="form-group">
                        <label for="newAdminPass">New Secure Password:</label>
                        <input type="password" id="newAdminPass" required placeholder="Enter new password" style="padding: 8px; border-radius: 6px; border: 1px solid var(--surface-border);">
                    </div>
                    <button type="submit" class="btn-primary" style="width: 100%; justify-content: center; padding: 10px;">Update Authorized Login</button>
                </form>
            </div>

            <!-- Backup operations -->
            <div class="card glass-panel" style="padding: 24px; display: flex; flex-direction: column; gap: 16px;">
                <h4 style="margin: 0; color: var(--primary-dark); font-size: 1.2rem;">Local Database Utility</h4>
                <p style="font-size: 0.9rem; color: var(--text-muted); margin: 0; line-height: 1.5;">Since this is a client-side SPA, all data resides locally on your browser. You can export this database to a JSON file to save backups or migrate records.</p>
                
                <button class="btn-primary" onclick="exportDatabase()" style="width: 100%; justify-content: center; padding: 10px;">💾 Backup Database (Export JSON)</button>

                <div style="border-top: 1px dashed rgba(0,0,0,0.08); padding-top: 16px; margin-top: 10px; display: flex; flex-direction: column; gap: 10px;">
                    <p style="font-size: 0.85rem; color: #dc2626; font-weight: 600; margin: 0;">⚠️ Danger Zone: Restore Demo Records</p>
                    <p style="font-size: 0.8rem; color: var(--text-muted); margin: 0;">This will wipe out all submitted bookings, complaints, and job applications on this browser and reload SJD default mock records.</p>
                    <button class="logout-btn" onclick="resetDatabaseToDemo()" style="margin: 0; width: 100%; padding: 10px; justify-content: center;">🔄 Wipe & Load Demo Records</button>
                </div>
            </div>
        </div>
    `;
}

function changeAdminPassword(event) {
    event.preventDefault();
    const user = document.getElementById('newAdminUser').value.trim();
    const pass = document.getElementById('newAdminPass').value.trim();

    localStorage.setItem('sjd_admin_username', user);
    localStorage.setItem('sjd_admin_password', pass);

    alert('Administrative credentials updated successfully!');
    renderSettingsTab(document.getElementById('admin-tab-content'));
}

function exportDatabase() {
    const data = {
        sjd_enquiries: JSON.parse(localStorage.getItem('sjd_enquiries') || '[]'),
        sjd_careers: JSON.parse(localStorage.getItem('sjd_careers') || '[]'),
        sjd_rates: JSON.parse(localStorage.getItem('sjd_rates') || '[]'),
        sjd_routes: JSON.parse(localStorage.getItem('sjd_routes') || '[]')
    };

    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `sjd_database_export_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function resetDatabaseToDemo() {
    if (confirm('WARNING: Wiping databases will delete all customer booking logs, support logs, and job applications permanently. Proceed?')) {
        localStorage.removeItem('sjd_enquiries');
        localStorage.removeItem('sjd_careers');
        localStorage.removeItem('sjd_rates');
        localStorage.removeItem('sjd_routes');

        initDatabase();
        populateCalculatorRates();
        runCostCalculator();

        alert('Databases wiped and default mock data loaded successfully!');
        renderAdminTab();
    }
}

/* CRUD Action Event Handlers */
function saveAdminNotes(id, collectionName) {
    const noteVal = document.getElementById(`notes-${id}`).value.trim();
    const collection = JSON.parse(localStorage.getItem(collectionName) || '[]');
    const item = collection.find(x => x.id === id);

    if (item) {
        item.notes = noteVal;
        localStorage.setItem(collectionName, JSON.stringify(collection));
        alert('Coordinator internal notes saved successfully!');
        renderAdminTab();
    }
}

function changeItemStatus(id, newStatus, collectionName) {
    const collection = JSON.parse(localStorage.getItem(collectionName) || '[]');
    const item = collection.find(x => x.id === id);

    if (item) {
        item.status = newStatus;
        localStorage.setItem(collectionName, JSON.stringify(collection));
        renderAdminTab();
    }
}

function deleteItem(id, collectionName) {
    if (confirm(`Are you sure you want to permanently delete record #${id}?`)) {
        const collection = JSON.parse(localStorage.getItem(collectionName) || '[]');
        const updated = collection.filter(x => x.id !== id);
        localStorage.setItem(collectionName, JSON.stringify(updated));

        alert(`Record #${id} successfully deleted from the local database.`);
        renderAdminTab();
    }
}
