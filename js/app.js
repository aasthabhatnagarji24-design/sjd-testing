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

    // Render public reviews grid
    renderReviews();

    // Check user portal session
    checkCustomerAccess();

    // Initialize chatbot UI widgets
    initChatbotUI();
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
        else if (pageId === 'chatbot' && text === 'ai assistant') item.classList.add('active');
        else if (pageId === 'account' && text === 'my account') item.classList.add('active');
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
    } else if (pageId === 'account') {
        checkCustomerAccess();
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

    // 6. Customers Database
    if (!localStorage.getItem('sjd_customers')) {
        const defaultCustomers = [
            {
                id: 'CUST-101',
                name: 'Rahul Verma',
                username: 'rahul',
                phone: '9876543222',
                email: 'rahul.verma@gmail.com',
                password: 'password123',
                address: 'Plot 42, Ward 3, Sanchi Stupa Road, Sanchi',
                ratePlan: 'standard',
                jarsDelivered: 12,
                jarsReturned: 10,
                status: 'Active',
                schedule: 'Daily'
            },
            {
                id: 'CUST-102',
                name: 'Priyanka Patel',
                username: 'priyanka',
                phone: '9425022334',
                email: 'priyanka.p@yahoo.com',
                password: 'password123',
                address: 'Shree heights, Block B, Salamatpur',
                ratePlan: 'camper',
                jarsDelivered: 8,
                jarsReturned: 8,
                status: 'Active',
                schedule: 'Alternate'
            }
        ];
        localStorage.setItem('sjd_customers', JSON.stringify(defaultCustomers));
    }

    // 7. Customer Reviews
    if (!localStorage.getItem('sjd_reviews')) {
        const defaultReviews = [
            {
                id: 'REV-101',
                name: 'Sanjay Pathak',
                location: 'Sanchi Bypass',
                rating: 5,
                comment: 'Shri Jal Dhara water quality is top-notch. The RO+UV treatment is visible in the clear, sweet taste. Their jar delivery is highly reliable and counts are logged transparently!',
                date: new Date(Date.now() - 3600000 * 24 * 5).toISOString(),
                status: 'Approved'
            },
            {
                id: 'REV-102',
                name: 'Neelam Shakya',
                location: 'Salamatpur Main',
                rating: 5,
                comment: 'Excellent camper supply for our housing colony event. The insulated campers kept the water cool and refreshing throughout the summer heat. Strongly recommend their services!',
                date: new Date(Date.now() - 3600000 * 24 * 12).toISOString(),
                status: 'Approved'
            },
            {
                id: 'REV-103',
                name: 'Anil Yadav',
                location: 'Sanchi Town',
                rating: 4,
                comment: 'Punctual daily water jar delivery in the morning. Their online tracker makes counting simple. Customer support is polite and resolves discrepancies fast.',
                date: new Date(Date.now() - 3600000 * 24 * 20).toISOString(),
                status: 'Approved'
            }
        ];
        localStorage.setItem('sjd_reviews', JSON.stringify(defaultReviews));
    }

    // 8. Newsletter Subscribers
    if (!localStorage.getItem('sjd_subscribers')) {
        const defaultSubscribers = [
            { email: 'amit.sharma@example.com', date: new Date(Date.now() - 3600000 * 24 * 2).toISOString() },
            { email: 'rverma@gmail.com', date: new Date(Date.now() - 3600000 * 24 * 1).toISOString() }
        ];
        localStorage.setItem('sjd_subscribers', JSON.stringify(defaultSubscribers));
    }

    // 9. Chatbot Knowledge Base
    if (!localStorage.getItem('sjd_chatbot_qa')) {
        const defaultQA = [
            { id: 'QA-1', trigger: 'hi|hello|hey|greetings', reply: 'Hello! I am Jal Sanghi, your Shri Jal Dhara water assistant. 💧 How can I help you today? You can check prices, delivery routes, or request a booking!' },
            { id: 'QA-2', trigger: 'price|rate|cost|how much', reply: 'Our standard purified water rates are:\n• 20L Standard Bubble Jar: ₹30/jar\n• 20L Insulated Camper: ₹40/camper\n• Bulk/Society Special Rate: ₹25/jar\n(Note: A security deposit of ₹150 applies for the physical jar on first delivery)' },
            { id: 'QA-3', trigger: 'route|location|delivery area|sanchi|salamatpur', reply: 'We deliver daily across:\n• Sanchi Town (Stupa Road, Station Road, Hedgewar Colony) - Morning route (7:30 AM - 10:30 AM)\n• Salamatpur (Market area, Bus Stand, Station Road) - Afternoon route (1:00 PM - 4:00 PM)\n• Bypass Suburbs - Alternate days morning route' },
            { id: 'QA-4', trigger: 'purity|pure|ro|uv|tds|filtration', reply: 'Shri Jal Dhara water is treated using our high-tech 2000 LPH filtration plant. Our 4-step process includes: Reverse Osmosis (RO) to clear dissolved salts, UV Treatment to destroy microbes, TDS adjustments to restore healthy minerals, and pH balancing (7.2 - 7.8) for a smooth throat-feel!' },
            { id: 'QA-5', trigger: 'contact|phone|helpline|support|number|call', reply: 'You can call our central support helpline at +91 91833 55900 (Open 8 AM - 8 PM daily), email us at admin.shrijaldhara@gmail.com, or directly click the "Chat on WhatsApp" button in the Contact page!' }
        ];
        localStorage.setItem('sjd_chatbot_qa', JSON.stringify(defaultQA));
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
        case 'customers':
            renderCustomersTab(container);
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
        case 'reviews':
            renderReviewsTab(container);
            break;
        case 'subscribers':
            renderSubscribersTab(container);
            break;
        case 'chatbot':
            renderChatbotTab(container);
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
                    <div><strong>Active Delivery Routes:</strong> ${routes.length} zones configured internally</div>
                    <div><strong>Calculator Products:</strong> 3 rates managed dynamically</div>
                    <div><strong>Session Access:</strong> Expires immediately upon tab/window closure.</div>
                    
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
                                            <p>${c.fileName ? `<strong>${c.fileName}</strong> (Click to view)` : 'No file upload (Written experience details below)'}</p>
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
                
                <button class="btn-primary" onclick="exportDatabase()" style="width: 100%; justify-content: center; padding: 10px;">Backup Database (Export JSON)</button>

                <div style="border-top: 1px dashed rgba(0,0,0,0.08); padding-top: 16px; margin-top: 10px; display: flex; flex-direction: column; gap: 10px;">
                    <p style="font-size: 0.85rem; color: #dc2626; font-weight: 600; margin: 0;">Danger Zone: Restore Demo Records</p>
                    <p style="font-size: 0.8rem; color: var(--text-muted); margin: 0;">This will wipe out all submitted bookings, complaints, and job applications on this browser and reload SJD default mock records.</p>
                    <button class="logout-btn" onclick="resetDatabaseToDemo()" style="margin: 0; width: 100%; padding: 10px; justify-content: center;">Wipe & Load Demo Records</button>
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

/* ==========================================================
   Google Authentication & 2-Step Verification for Admin
   ========================================================== */
let admin2faCode = null;

function startAdminGoogleAuth() {
    const errorEl = document.getElementById('adminLoginError');
    if (errorEl) errorEl.style.display = 'none';

    // Simulated Google Login input popup
    const email = prompt("Sign in with Google\nEnter your registered SJD Google account:", "admin@shrijaldhara.com");
    if (!email) return;

    if (email.trim().toLowerCase() === "admin@shrijaldhara.com") {
        triggerAdmin2Step();
    } else {
        alert("Access Denied: This Google account is not authorized for SJD Admin Portal.");
    }
}

function triggerAdmin2Step() {
    // Generate a random 6-digit code
    admin2faCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Display standard notification alert simulating 2FA delivery
    alert(`[Google Security 2FA] Your 6-digit verification code is: ${admin2faCode}`);

    // Toggle subviews
    document.getElementById('admin-login-subview').style.display = 'none';
    document.getElementById('admin-2fa-subview').style.display = 'block';

    document.getElementById('admin2faCode').value = '';
    document.getElementById('admin2faError').style.display = 'none';
}

function handleAdmin2faVerify(event) {
    event.preventDefault();
    const entered = document.getElementById('admin2faCode').value.trim();
    const errorEl = document.getElementById('admin2faError');

    if (entered === admin2faCode) {
        sessionStorage.setItem('sjd_admin_logged_in', 'true');
        document.getElementById('admin-2fa-subview').style.display = 'none';
        checkAdminAccess();
        alert("Google 2-Step Verification successful. Admin credentials confirmed.");
    } else {
        errorEl.textContent = "Incorrect verification pin. Please try again.";
        errorEl.style.display = 'block';
    }
}

function cancelAdmin2fa() {
    admin2faCode = null;
    document.getElementById('admin-2fa-subview').style.display = 'none';
    document.getElementById('admin-login-subview').style.display = 'block';
}

/* ==========================================================
   User Portal ("My Account") - Access, Registrations, Profile & 2FA
   ========================================================== */
let pendingCredUpdate = null;
let user2faCode = null;
let tempLoginUsername = null;
let userLogin2faCode = null;

function checkCustomerAccess() {
    const loggedUsername = sessionStorage.getItem('sjd_customer_username');
    const loggedOutEl = document.getElementById('user-logged-out-state');
    const loggedInEl = document.getElementById('user-logged-in-state');

    if (!loggedOutEl || !loggedInEl) return;

    if (loggedUsername) {
        const customers = JSON.parse(localStorage.getItem('sjd_customers') || '[]');
        const customer = customers.find(c => c.username === loggedUsername);

        if (customer) {
            loggedOutEl.style.display = 'none';
            loggedInEl.style.display = 'flex';

            // Populate dashboard
            document.getElementById('dashCustomerName').textContent = customer.name;
            document.getElementById('dashCustomerId').textContent = customer.id;
            
            const statusEl = document.getElementById('dashCustomerStatus');
            statusEl.textContent = customer.status;
            statusEl.className = 'status-tag ' + (customer.status === 'Active' ? 'status-tag-active' : 'status-tag-inactive');
            statusEl.style.background = customer.status === 'Active' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)';
            statusEl.style.color = customer.status === 'Active' ? '#10b981' : '#ef4444';

            document.getElementById('dashJarsDelivered').textContent = customer.jarsDelivered;
            document.getElementById('dashJarsReturned').textContent = customer.jarsReturned;
            
            const outstanding = customer.jarsDelivered - customer.jarsReturned;
            document.getElementById('dashJarsOutstanding').textContent = outstanding;

            document.getElementById('dashCustomerAddress').textContent = customer.address;
            
            let rateText = "Standard Jar (₹30/jar)";
            if (customer.ratePlan === 'camper') rateText = "Insulated Camper (₹40/camper)";
            else if (customer.ratePlan === 'bulk') rateText = "Bulk / Special Rate (₹25/jar)";
            document.getElementById('dashCustomerRatePlan').textContent = rateText;
            return;
        }
    }

    loggedOutEl.style.display = 'grid';
    loggedInEl.style.display = 'none';
}

function handleCustomerRegister(event) {
    event.preventDefault();
    const nameVal = document.getElementById('regName').value.trim();
    const usernameVal = document.getElementById('regUser').value.trim().toLowerCase();
    const phoneVal = document.getElementById('regPhone').value.trim();
    const emailVal = document.getElementById('regEmail').value.trim();
    const passVal = document.getElementById('regPass').value.trim();
    const addressVal = document.getElementById('regAddress').value.trim();
    const errorEl = document.getElementById('userRegisterError');

    const customers = JSON.parse(localStorage.getItem('sjd_customers') || '[]');

    if (!/^[a-zA-Z]+$/.test(usernameVal)) {
        errorEl.textContent = "Username must contain letters only.";
        errorEl.style.display = 'block';
        return;
    }

    if (customers.some(c => c.username === usernameVal)) {
        errorEl.textContent = "Username is already taken by another account.";
        errorEl.style.display = 'block';
        return;
    }

    if (customers.some(c => c.phone === phoneVal)) {
        errorEl.textContent = "Mobile number is already registered for another account.";
        errorEl.style.display = 'block';
        return;
    }

    const newCustomer = {
        id: `CUST-${Math.floor(100 + Math.random() * 900)}`,
        name: nameVal,
        username: usernameVal,
        phone: phoneVal,
        email: emailVal,
        password: passVal,
        address: addressVal,
        ratePlan: 'standard',
        jarsDelivered: 0,
        jarsReturned: 0,
        status: 'Active',
        schedule: 'Daily'
    };

    customers.push(newCustomer);
    localStorage.setItem('sjd_customers', JSON.stringify(customers));

    errorEl.style.display = 'none';
    document.getElementById('userRegisterForm').reset();
    
    // Auto-trigger 2FA verification code on register
    tempLoginUsername = usernameVal;
    userLogin2faCode = Math.floor(100000 + Math.random() * 900000).toString();
    alert(`[User Portal 2-Step Verification] Registration successful! Your 6-digit verification code is: ${userLogin2faCode}`);
    
    document.getElementById('user-logged-out-state').style.display = 'none';
    document.getElementById('user-login-2fa-subview').style.display = 'block';
    document.getElementById('userLogin2faCode').value = '';
    document.getElementById('userLogin2faError').style.display = 'none';
}

function handleCustomerLogin(event) {
    event.preventDefault();
    const userVal = document.getElementById('loginUser').value.trim().toLowerCase();
    const passVal = document.getElementById('loginPass').value.trim();
    const errorEl = document.getElementById('userLoginError');

    const customers = JSON.parse(localStorage.getItem('sjd_customers') || '[]');
    const customer = customers.find(c => c.username === userVal && c.password === passVal);

    if (customer) {
        if (customer.status !== 'Active') {
            errorEl.textContent = "Your account status is currently set as Inactive. Please contact support.";
            errorEl.style.display = 'block';
            return;
        }
        
        errorEl.style.display = 'none';
        tempLoginUsername = userVal;
        
        // Generate 6-digit verification code
        userLogin2faCode = Math.floor(100000 + Math.random() * 900000).toString();
        alert(`[User Portal 2-Step Verification] Verification code: ${userLogin2faCode}`);

        document.getElementById('user-logged-out-state').style.display = 'none';
        document.getElementById('user-login-2fa-subview').style.display = 'block';
        document.getElementById('userLogin2faCode').value = '';
        document.getElementById('userLogin2faError').style.display = 'none';
        
        document.getElementById('userLoginForm').reset();
    } else {
        errorEl.textContent = "Incorrect username or password.";
        errorEl.style.display = 'block';
    }
}

function handleCustomer2faVerify(event) {
    event.preventDefault();
    const entered = document.getElementById('userLogin2faCode').value.trim();
    const errorEl = document.getElementById('userLogin2faError');

    if (entered === userLogin2faCode) {
        sessionStorage.setItem('sjd_customer_username', tempLoginUsername);
        document.getElementById('user-login-2fa-subview').style.display = 'none';
        checkCustomerAccess();
        alert("2-Step Verification successful. Welcome to your portal!");
    } else {
        errorEl.textContent = "Incorrect verification pin. Please try again.";
        errorEl.style.display = 'block';
    }
}

function cancelCustomerLogin2fa() {
    tempLoginUsername = null;
    userLogin2faCode = null;
    document.getElementById('user-login-2fa-subview').style.display = 'none';
    document.getElementById('user-logged-out-state').style.display = 'grid';
}

function handleCustomerLogout() {
    sessionStorage.removeItem('sjd_customer_username');
    checkCustomerAccess();
}

/* User Profile Update Actions */
function openEditProfileModal() {
    const username = sessionStorage.getItem('sjd_customer_username');
    const customers = JSON.parse(localStorage.getItem('sjd_customers') || '[]');
    const customer = customers.find(c => c.username === username);
    if (!customer) return;

    document.getElementById('editProfileName').value = customer.name;
    document.getElementById('editProfileEmail').value = customer.email || '';
    document.getElementById('editProfileAddress').value = customer.address;
    document.getElementById('editProfileModal').style.display = 'block';
}

function closeEditProfileModal() {
    document.getElementById('editProfileModal').style.display = 'none';
}

function handleProfileUpdateSubmit(event) {
    event.preventDefault();
    const nameVal = document.getElementById('editProfileName').value.trim();
    const emailVal = document.getElementById('editProfileEmail').value.trim();
    const addressVal = document.getElementById('editProfileAddress').value.trim();

    const username = sessionStorage.getItem('sjd_customer_username');
    const customers = JSON.parse(localStorage.getItem('sjd_customers') || '[]');
    const index = customers.findIndex(c => c.username === username);

    if (index !== -1) {
        customers[index].name = nameVal;
        customers[index].email = emailVal;
        customers[index].address = addressVal;
        localStorage.setItem('sjd_customers', JSON.stringify(customers));
        
        closeEditProfileModal();
        checkCustomerAccess();
        alert("Profile details updated successfully!");
    }
}

function requestCustomerRefill() {
    const username = sessionStorage.getItem('sjd_customer_username');
    const customers = JSON.parse(localStorage.getItem('sjd_customers') || '[]');
    const customer = customers.find(c => c.username === username);
    if (!customer) return;

    const enquiries = JSON.parse(localStorage.getItem('sjd_enquiries') || '[]');
    const caseId = `SJD-${Math.floor(1000 + Math.random() * 9000)}`;

    const newRequest = {
        id: caseId,
        name: customer.name,
        phone: customer.phone,
        email: customer.email || '',
        need: 'Home',
        address: customer.address,
        details: `Refill Request logged directly from User Dashboard. Outstanding jar balance: ${customer.jarsDelivered - customer.jarsReturned} jars.`,
        status: 'New',
        date: new Date().toISOString(),
        notes: ''
    };

    enquiries.push(newRequest);
    localStorage.setItem('sjd_enquiries', JSON.stringify(enquiries));
    alert(`Refill request received! Your request case ID is #${caseId}. Our driver will deliver within 2 hours.`);
}

/* User Account Settings Update with Double Verification */
function initiateChangeCredentials(event) {
    event.preventDefault();
    const curPassVal = document.getElementById('changeCurrentPass').value.trim();
    const newUserVal = document.getElementById('changeNewUser').value.trim().toLowerCase();
    const newPassVal = document.getElementById('changeNewPass').value.trim();
    const confirmPassVal = document.getElementById('changeConfirmPass').value.trim();
    const errorEl = document.getElementById('credentialChangeError');

    const username = sessionStorage.getItem('sjd_customer_username');
    const customers = JSON.parse(localStorage.getItem('sjd_customers') || '[]');
    const customer = customers.find(c => c.username === username);

    if (!customer) return;

    if (curPassVal !== customer.password) {
        errorEl.textContent = "Verification failed: Current password is incorrect.";
        errorEl.style.display = 'block';
        return;
    }

    if (newPassVal !== confirmPassVal) {
        errorEl.textContent = "New passwords do not match.";
        errorEl.style.display = 'block';
        return;
    }

    if (!/^[a-zA-Z]+$/.test(newUserVal)) {
        errorEl.textContent = "New username must contain letters only.";
        errorEl.style.display = 'block';
        return;
    }

    if (newUserVal !== username && customers.some(c => c.username === newUserVal)) {
        errorEl.textContent = "The new username is already taken.";
        errorEl.style.display = 'block';
        return;
    }

    errorEl.style.display = 'none';

    pendingCredUpdate = {
        newUsername: newUserVal,
        newPass: newPassVal
    };

    // Generate random 6-digit pin
    user2faCode = Math.floor(100000 + Math.random() * 900000).toString();
    alert(`[Security Check 2FA] Your credential change authorization code is: ${user2faCode}`);

    document.getElementById('user2faInput').value = '';
    document.getElementById('user2faError').style.display = 'none';
    document.getElementById('user2faModal').style.display = 'block';
}

function closeUser2faModal() {
    document.getElementById('user2faModal').style.display = 'none';
    pendingCredUpdate = null;
    user2faCode = null;
}

function verifyUser2faCode() {
    const entered = document.getElementById('user2faInput').value.trim();
    const errorEl = document.getElementById('user2faError');

    if (entered === user2faCode) {
        const username = sessionStorage.getItem('sjd_customer_username');
        const customers = JSON.parse(localStorage.getItem('sjd_customers') || '[]');
        const index = customers.findIndex(c => c.username === username);

        if (index !== -1 && pendingCredUpdate) {
            customers[index].username = pendingCredUpdate.newUsername;
            customers[index].password = pendingCredUpdate.newPass;
            localStorage.setItem('sjd_customers', JSON.stringify(customers));

            closeUser2faModal();
            document.getElementById('changeCredentialsForm').reset();
            sessionStorage.removeItem('sjd_customer_username');
            checkCustomerAccess();

            alert("Username and password updated successfully! Please log in using your new details.");
        }
    } else {
        errorEl.textContent = "Incorrect verification pin. Please try again.";
        errorEl.style.display = 'block';
    }
}

/* ==========================================================
   Live Review System - Rendering & Homepage Actions
   ========================================================== */
function toggleReviewForm() {
    const form = document.getElementById('publicReviewForm');
    const btn = document.getElementById('reviewFormToggleBtn');
    if (!form || !btn) return;

    if (form.style.display === 'none') {
        form.style.display = 'flex';
        btn.textContent = '- Collapse Form';
    } else {
        form.style.display = 'none';
        btn.textContent = '+ Expand Form';
    }
}

function renderReviews() {
    const grid = document.getElementById('public-reviews-grid');
    if (!grid) return;

    const reviews = JSON.parse(localStorage.getItem('sjd_reviews') || '[]');
    const approvedReviews = reviews.filter(r => r.status === 'Approved');

    grid.innerHTML = '';

    if (approvedReviews.length === 0) {
        grid.innerHTML = '<div style="grid-column: span 3; text-align: center; color: var(--text-muted); padding: 24px;">No customer reviews to show yet. Be the first to share your experience!</div>';
        return;
    }

    approvedReviews.forEach(r => {
        const card = document.createElement('div');
        card.className = 'card glass-panel review-card';
        const starsStr = '⭐'.repeat(r.rating);

        card.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <h4 style="margin: 0; color: var(--primary-dark);">${r.name}</h4>
                <span class="rating-stars">${starsStr}</span>
            </div>
            <span style="font-size: 0.85rem; color: var(--accent); font-weight: 500;">📍 ${r.location}</span>
            <p style="font-size: 0.9rem; line-height: 1.5; color: var(--text-muted); font-style: italic; margin: 4px 0 0 0;">"${r.comment}"</p>
            <span style="font-size: 0.75rem; color: #94a3b8; align-self: flex-end; margin-top: auto;">Date: ${new Date(r.date).toLocaleDateString()}</span>
        `;
        grid.appendChild(card);
    });
}

function handleReviewSubmit(event) {
    event.preventDefault();
    const nameVal = document.getElementById('revName').value.trim();
    const locVal = document.getElementById('revLocation').value;
    const rateVal = parseInt(document.getElementById('revRating').value);
    const commentVal = document.getElementById('revComment').value.trim();

    const reviews = JSON.parse(localStorage.getItem('sjd_reviews') || '[]');
    const newRev = {
        id: `REV-${Math.floor(100 + Math.random() * 900)}`,
        name: nameVal,
        location: locVal,
        rating: rateVal,
        comment: commentVal,
        date: new Date().toISOString(),
        status: 'Approved' // auto-approve for live review demo experience
    };

    reviews.unshift(newRev);
    localStorage.setItem('sjd_reviews', JSON.stringify(reviews));

    document.getElementById('publicReviewForm').reset();
    toggleReviewForm();
    renderReviews();
    alert("Thank you! Your customer review was posted successfully on the home page.");
}

/* ==========================================================
   Newsletter Subscription logic
   ========================================================== */
function handleNewsletterSubmit(event) {
    event.preventDefault();
    const emailVal = document.getElementById('nlEmail').value.trim();
    const successEl = document.getElementById('newsletterSuccess');

    if (!successEl) return;

    const subscribers = JSON.parse(localStorage.getItem('sjd_subscribers') || '[]');

    if (subscribers.some(s => s.email.toLowerCase() === emailVal.toLowerCase())) {
        successEl.textContent = "You are already subscribed to our newsletter list!";
        successEl.style.color = '#e11d48';
        successEl.style.display = 'block';
        return;
    }

    subscribers.push({
        email: emailVal,
        date: new Date().toISOString()
    });

    localStorage.setItem('sjd_subscribers', JSON.stringify(subscribers));

    document.getElementById('newsletterForm').reset();
    successEl.textContent = "Thank you! You have successfully subscribed to our newsletter list.";
    successEl.style.color = 'var(--accent)';
    successEl.style.display = 'block';

    setTimeout(() => {
        successEl.style.display = 'none';
    }, 5000);
}

/* ==========================================================
   AI Chatbot Engine - Local intents processor & guided flows
   ========================================================== */
let chatSessionHistory = [
    { sender: 'bot', text: 'Hello! I am Jal Sanghi, your Shri Jal Dhara water assistant. 💧 How can I help you today?', date: new Date().toISOString() }
];

let chatbotBookingState = {
    step: 0, // 1: awaiting name, 2: phone, 3: address, 4: qty
    name: '',
    phone: '',
    address: '',
    qty: ''
};

function initChatbotUI() {
    renderChatHistory();
    renderChatChips();
}

function toggleChatbotWidget() {
    const drawer = document.getElementById('chatbot-drawer');
    const badge = document.getElementById('chatbot-fab-badge');
    if (!drawer) return;

    if (drawer.style.display === 'none') {
        drawer.style.display = 'flex';
        if (badge) badge.style.display = 'none';
        renderChatHistory();
        renderChatChips();
    } else {
        drawer.style.display = 'none';
    }
}

function minimizeChatbotWidget() {
    const drawer = document.getElementById('chatbot-drawer');
    if (drawer) drawer.style.display = 'none';
}

function renderChatHistory() {
    const drawerFeed = document.getElementById('drawer-chat-messages');
    const pageFeed = document.getElementById('page-chat-messages');

    const generateHTML = () => {
        return chatSessionHistory.map(m => {
            if (m.sender === 'user') {
                return `
                    <div class="chat-msg chat-msg-user">
                        <div class="msg-avatar">👤</div>
                        <div class="msg-bubble">${m.text.replace(/\n/g, '<br>')}</div>
                    </div>
                `;
            } else {
                return `
                    <div class="chat-msg chat-msg-bot">
                        <div class="msg-avatar">💧</div>
                        <div class="msg-bubble">${m.text.replace(/\n/g, '<br>')}</div>
                    </div>
                `;
            }
        }).join('');
    };

    const htmlContent = generateHTML();
    if (drawerFeed) {
        drawerFeed.innerHTML = htmlContent;
        drawerFeed.scrollTop = drawerFeed.scrollHeight;
    }
    if (pageFeed) {
        pageFeed.innerHTML = htmlContent;
        pageFeed.scrollTop = pageFeed.scrollHeight;
    }
}

function renderChatChips() {
    const drawerChips = document.getElementById('drawer-chat-chips');
    const pageChips = document.getElementById('page-chat-chips');

    const chipsHTML = `
        <button class="chip-btn" onclick="handleChipClick('Check Delivery Rates')">Check Delivery Rates</button>
        <button class="chip-btn" onclick="handleChipClick('Water Purity')">Water Purity</button>
        <button class="chip-btn" onclick="handleChipClick('Book a Water Jar')">Book a Water Jar</button>
        <button class="chip-btn" onclick="handleChipClick('Delivery Areas')">Delivery Areas</button>
        <button class="chip-btn" onclick="handleChipClick('Chat on WhatsApp')">Chat on WhatsApp</button>
    `;

    if (drawerChips) drawerChips.innerHTML = chipsHTML;
    if (pageChips) pageChips.innerHTML = chipsHTML;
}

function handleChipClick(chipText) {
    if (chipText === 'Chat on WhatsApp') {
        window.open("https://wa.me/919183355900?text=Hi%20Shri%20Jal%20Dhara,%20I%20would%20like%20to%20enquire%20about%20water%20jar%20refills.", "_blank");
        return;
    }
    processUserMessage(chipText);
}

function handleDrawerChatSubmit(event) {
    event.preventDefault();
    const input = document.getElementById('drawerChatInput');
    if (!input) return;
    const text = input.value.trim();
    if (!text) return;
    input.value = '';
    processUserMessage(text);
}

function handlePageChatSubmit(event) {
    event.preventDefault();
    const input = document.getElementById('pageChatInput');
    if (!input) return;
    const text = input.value.trim();
    if (!text) return;
    input.value = '';
    processUserMessage(text);
}

function processUserMessage(text) {
    chatSessionHistory.push({ sender: 'user', text: text, date: new Date().toISOString() });
    renderChatHistory();

    showBotTyping(true);

    setTimeout(() => {
        showBotTyping(false);
        const reply = generateBotReply(text);
        chatSessionHistory.push({ sender: 'bot', text: reply, date: new Date().toISOString() });
        renderChatHistory();
    }, 800);
}

function showBotTyping(show) {
    const drawerFeed = document.getElementById('drawer-chat-messages');
    const pageFeed = document.getElementById('page-chat-messages');

    const typingHTML = `
        <div class="chat-msg chat-msg-bot" id="chat-typing-indicator">
            <div class="msg-avatar">💧</div>
            <div class="msg-bubble" style="padding: 4px;">
                <div class="typing-dots">
                    <span></span><span></span><span></span>
                </div>
            </div>
        </div>
    `;

    if (show) {
        if (drawerFeed) {
            drawerFeed.insertAdjacentHTML('beforeend', typingHTML);
            drawerFeed.scrollTop = drawerFeed.scrollHeight;
        }
        if (pageFeed) {
            pageFeed.insertAdjacentHTML('beforeend', typingHTML);
            pageFeed.scrollTop = pageFeed.scrollHeight;
        }
    } else {
        const ind = document.querySelectorAll('#chat-typing-indicator');
        ind.forEach(el => el.remove());
    }
}

function generateBotReply(userText) {
    const textClean = userText.toLowerCase().trim();

    if (chatbotBookingState.step > 0) {
        return processBookingStep(textClean, userText);
    }

    if (textClean.includes('book') || textClean.includes('order') || textClean.includes('buy') || textClean.includes('start delivery') || textClean.includes('refill')) {
        chatbotBookingState.step = 1;
        return "I can help you book a water jar delivery route setup! Let's start.\n\nPlease enter your Full Name:";
    }

    // Custom Q&As from Database
    const customQAs = JSON.parse(localStorage.getItem('sjd_chatbot_qa') || '[]');
    for (let qa of customQAs) {
        const triggers = qa.trigger.split('|');
        if (triggers.some(t => textClean.includes(t.trim().toLowerCase()))) {
            return qa.reply;
        }
    }

    return "I am still learning, but I would love to help you! Please check our rates, delivery zones, or type 'Book a Water Jar'. Or call our team at +91 91833 55900.";
}

function processBookingStep(textClean, originalText) {
    switch (chatbotBookingState.step) {
        case 1:
            chatbotBookingState.name = originalText;
            chatbotBookingState.step = 2;
            return `Noted, ${originalText}. What is your 10-digit mobile number?`;
        case 2:
            chatbotBookingState.phone = originalText;
            chatbotBookingState.step = 3;
            return "Please enter your full delivery address in Sanchi or Salamatpur:";
        case 3:
            chatbotBookingState.address = originalText;
            chatbotBookingState.step = 4;
            return "How many 20L jars do you need daily or per delivery? (e.g. 1, 2, 5...)";
        case 4:
            chatbotBookingState.qty = originalText;
            chatbotBookingState.step = 0; // reset

            const enquiries = JSON.parse(localStorage.getItem('sjd_enquiries') || '[]');
            const caseId = `SJD-${Math.floor(1000 + Math.random() * 9000)}`;

            const newEnq = {
                id: caseId,
                name: chatbotBookingState.name,
                phone: chatbotBookingState.phone,
                email: '',
                need: 'Home',
                address: chatbotBookingState.address,
                details: `AI Chatbot guided order setup. Qty per delivery: ${chatbotBookingState.qty} Jars.`,
                status: 'New',
                date: new Date().toISOString(),
                notes: ''
            };
            enquiries.push(newEnq);
            localStorage.setItem('sjd_enquiries', JSON.stringify(enquiries));

            return `Excellent! I have successfully registered your delivery booking.\n\n• Case ID: #${caseId}\n• Name: ${chatbotBookingState.name}\n• Mobile: ${chatbotBookingState.phone}\n• Address: ${chatbotBookingState.address}\n• Qty: ${chatbotBookingState.qty} Jars\n\nOur route manager will contact you at ${chatbotBookingState.phone} within 1 hour to start your refills!`;
        default:
            chatbotBookingState.step = 0;
            return "Oops, something went wrong with the booking flow. Let us know if you need rates or routes details.";
    }
}

/* ==========================================================
   Admin Portal Extensible Panels & Full CRUD Modules
   ========================================================== */

/* 1. Customers Registry CRUD */
function renderCustomersTab(container) {
    const customers = JSON.parse(localStorage.getItem('sjd_customers') || '[]');
    
    container.innerHTML = `
        <div class="admin-tab-header">
            <h2>Customers Registry</h2>
            <span style="font-size: 0.95rem; color: var(--text-muted);">${customers.length} registered clients</span>
        </div>

        <div class="routes-layout" style="margin-bottom: 24px;">
            <!-- Add Customer Card -->
            <div class="card glass-panel" style="padding: 24px;">
                <h4 style="margin: 0 0 16px 0; color: var(--primary-dark); font-size: 1.2rem;">Add New Customer</h4>
                <form id="adminAddCustomerForm" onsubmit="addCustomerAdmin(event)" style="display: flex; flex-direction: column; gap: 14px;">
                    <div class="form-group">
                        <label for="acName">Customer Full Name:</label>
                        <input type="text" id="acName" required placeholder="Enter full name">
                    </div>
                    <div class="form-group">
                        <label for="acUser">Login Username (Alphabetic):</label>
                        <input type="text" id="acUser" required placeholder="Letters only (e.g. rahul)" pattern="[a-zA-Z]+" title="Letters only">
                    </div>
                    <div class="form-group">
                        <label for="acPhone">Mobile Number:</label>
                        <input type="tel" id="acPhone" required placeholder="10-digit mobile number">
                    </div>
                    <div class="form-group">
                        <label for="acEmail">Email Address:</label>
                        <input type="email" id="acEmail" placeholder="Enter email">
                    </div>
                    <div class="form-group">
                        <label for="acPass">Account Password:</label>
                        <input type="password" id="acPass" required placeholder="Set password" value="password123">
                    </div>
                    <div class="form-group">
                        <label for="acAddress">Delivery Address:</label>
                        <textarea id="acAddress" rows="2" required placeholder="Colony and sector details"></textarea>
                    </div>
                    <div class="form-group">
                        <label for="acRate">Rate Category Plan:</label>
                        <select id="acRate">
                            <option value="standard">Standard Bubble Jar (₹30)</option>
                            <option value="camper">Insulated Camper (₹40)</option>
                            <option value="bulk">Bulk / Society Special (₹25)</option>
                        </select>
                    </div>
                    <button type="submit" class="btn-primary" style="width: 100%; justify-content: center; padding: 10px;">Register Customer</button>
                </form>
            </div>

            <!-- Customer Edit Overlay Dialog (Initially Hidden) -->
            <div id="adminEditCustomerWrapper" class="card glass-panel" style="padding: 24px; display: none;">
                <h4 style="margin: 0 0 16px 0; color: var(--primary-dark); font-size: 1.2rem;">Edit Customer & Ledgers</h4>
                <form id="adminEditCustomerForm" onsubmit="saveCustomerAdmin(event)" style="display: flex; flex-direction: column; gap: 14px;">
                    <input type="hidden" id="ecId">
                    <div class="form-group">
                        <label for="ecName">Full Name:</label>
                        <input type="text" id="ecName" required>
                    </div>
                    <div class="form-group">
                        <label for="ecUser">Login Username (Alphabetic):</label>
                        <input type="text" id="ecUser" required pattern="[a-zA-Z]+" title="Letters only">
                    </div>
                    <div class="form-group">
                        <label for="ecPhone">Mobile Number:</label>
                        <input type="tel" id="ecPhone" required>
                    </div>
                    <div class="form-group">
                        <label for="ecEmail">Email Address:</label>
                        <input type="email" id="ecEmail">
                    </div>
                    <div class="form-group">
                        <label for="ecAddress">Delivery Address:</label>
                        <textarea id="ecAddress" rows="2" required></textarea>
                    </div>
                    <div class="form-group">
                        <label for="ecRate">Rate Plan Category:</label>
                        <select id="ecRate">
                            <option value="standard">Standard Bubble Jar (₹30)</option>
                            <option value="camper">Insulated Camper (₹40)</option>
                            <option value="bulk">Bulk / Society Special (₹25)</option>
                        </select>
                    </div>
                    <div class="calc-grid" style="gap: 12px;">
                        <div class="form-group">
                            <label for="ecDelivered">Jars Delivered:</label>
                            <input type="number" id="ecDelivered" min="0" required>
                        </div>
                        <div class="form-group">
                            <label for="ecReturned">Empty Returned:</label>
                            <input type="number" id="ecReturned" min="0" required>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="ecStatus">Portal Access Status:</label>
                        <select id="ecStatus">
                            <option value="Active">Active / Approved</option>
                            <option value="Inactive">Inactive / Suspended</option>
                        </select>
                    </div>
                    <div style="display: flex; gap: 10px;">
                        <button type="submit" class="btn-primary" style="flex-grow: 1; justify-content: center; padding: 10px;">Save Changes</button>
                        <button type="button" onclick="cancelEditCustomerAdmin()" class="btn-secondary" style="flex-grow: 1; justify-content: center; padding: 10px;">Cancel</button>
                    </div>
                </form>
            </div>
        </div>

        <div class="table-responsive">
            <table class="admin-table">
                <thead>
                    <tr>
                        <th>Client ID</th>
                        <th>Name & Contacts</th>
                        <th>Address</th>
                        <th>Rate Tier</th>
                        <th>Jars Delivered</th>
                        <th>Empty Returned</th>
                        <th>Outstanding Balance</th>
                        <th>Status</th>
                        <th style="text-align: right;">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${customers.length === 0 ? '<tr><td colspan="9" style="text-align: center; color: var(--text-muted);">No registered customer records found.</td></tr>' : ''}
                    ${customers.map(c => `
                        <tr>
                            <td><strong>${c.id}</strong></td>
                            <td>
                                <div><strong>${c.name}</strong></div>
                                <div style="font-size: 0.8rem; color: var(--accent); font-weight: 600;">@${c.username}</div>
                                <div style="font-size: 0.8rem; color: var(--text-muted);">${c.phone}</div>
                                <div style="font-size: 0.8rem; color: var(--text-muted);">${c.email || 'N/A'}</div>
                            </td>
                            <td style="font-size: 0.85rem; max-width: 180px;">${c.address}</td>
                            <td><span style="font-size: 0.85rem; text-transform: uppercase; font-weight: bold; color: var(--primary);">${c.ratePlan}</span></td>
                            <td style="text-align: center;">${c.jarsDelivered}</td>
                            <td style="text-align: center;">${c.jarsReturned}</td>
                            <td style="text-align: center; font-weight: bold; color: ${c.jarsDelivered - c.jarsReturned > 0 ? '#f97316' : 'inherit'};">${c.jarsDelivered - c.jarsReturned}</td>
                            <td><span class="status-tag" style="background: ${c.status === 'Active' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)'}; color: ${c.status === 'Active' ? '#10b981' : '#ef4444'}; font-weight: 600;">${c.status}</span></td>
                            <td style="text-align: right;">
                                <div style="display: flex; gap: 6px; justify-content: flex-end;">
                                    <button class="action-btn" onclick="startEditCustomerAdmin('${c.id}')" style="font-size: 0.8rem; padding: 4px 10px;">Edit</button>
                                    <button class="action-btn action-btn-delete" onclick="deleteCustomerAdmin('${c.id}')" style="font-size: 0.8rem; padding: 4px 10px;">Delete</button>
                                </div>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

function addCustomerAdmin(event) {
    event.preventDefault();
    const nameVal = document.getElementById('acName').value.trim();
    const userVal = document.getElementById('acUser').value.trim().toLowerCase();
    const phoneVal = document.getElementById('acPhone').value.trim();
    const emailVal = document.getElementById('acEmail').value.trim();
    const passVal = document.getElementById('acPass').value.trim();
    const addressVal = document.getElementById('acAddress').value.trim();
    const rateVal = document.getElementById('acRate').value;

    const customers = JSON.parse(localStorage.getItem('sjd_customers') || '[]');

    if (!/^[a-zA-Z]+$/.test(userVal)) {
        alert("Username must contain letters only.");
        return;
    }

    if (customers.some(c => c.username === userVal)) {
        alert("Username is already taken!");
        return;
    }

    if (customers.some(c => c.phone === phoneVal)) {
        alert("Mobile number is already registered!");
        return;
    }

    const newCust = {
        id: `CUST-${Math.floor(100 + Math.random() * 900)}`,
        name: nameVal,
        username: userVal,
        phone: phoneVal,
        email: emailVal,
        password: passVal,
        address: addressVal,
        ratePlan: rateVal,
        jarsDelivered: 0,
        jarsReturned: 0,
        status: 'Active',
        schedule: 'Daily'
    };

    customers.push(newCust);
    localStorage.setItem('sjd_customers', JSON.stringify(customers));
    
    document.getElementById('adminAddCustomerForm').reset();
    alert("New customer account registered successfully.");
    renderCustomersTab(document.getElementById('admin-tab-content'));
}

function startEditCustomerAdmin(id) {
    const customers = JSON.parse(localStorage.getItem('sjd_customers') || '[]');
    const customer = customers.find(c => c.id === id);
    if (!customer) return;

    // Show Edit panel
    const editWrapper = document.getElementById('adminEditCustomerWrapper');
    editWrapper.style.display = 'block';

    document.getElementById('ecId').value = customer.id;
    document.getElementById('ecName').value = customer.name;
    document.getElementById('ecUser').value = customer.username || '';
    document.getElementById('ecPhone').value = customer.phone;
    document.getElementById('ecEmail').value = customer.email || '';
    document.getElementById('ecAddress').value = customer.address;
    document.getElementById('ecRate').value = customer.ratePlan;
    document.getElementById('ecDelivered').value = customer.jarsDelivered;
    document.getElementById('ecReturned').value = customer.jarsReturned;
    document.getElementById('ecStatus').value = customer.status;

    // Scroll to form
    editWrapper.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function cancelEditCustomerAdmin() {
    document.getElementById('adminEditCustomerWrapper').style.display = 'none';
}

function saveCustomerAdmin(event) {
    event.preventDefault();
    const idVal = document.getElementById('ecId').value;
    const nameVal = document.getElementById('ecName').value.trim();
    const userVal = document.getElementById('ecUser').value.trim().toLowerCase();
    const phoneVal = document.getElementById('ecPhone').value.trim();
    const emailVal = document.getElementById('ecEmail').value.trim();
    const addressVal = document.getElementById('ecAddress').value.trim();
    const rateVal = document.getElementById('ecRate').value;
    const deliveredVal = parseInt(document.getElementById('ecDelivered').value) || 0;
    const returnedVal = parseInt(document.getElementById('ecReturned').value) || 0;
    const statusVal = document.getElementById('ecStatus').value;

    const customers = JSON.parse(localStorage.getItem('sjd_customers') || '[]');
    const index = customers.findIndex(c => c.id === idVal);

    if (index !== -1) {
        if (!/^[a-zA-Z]+$/.test(userVal)) {
            alert("Username must contain letters only.");
            return;
        }

        if (userVal !== customers[index].username && customers.some(c => c.username === userVal)) {
            alert("Username is already taken!");
            return;
        }

        customers[index].name = nameVal;
        customers[index].username = userVal;
        customers[index].phone = phoneVal;
        customers[index].email = emailVal;
        customers[index].address = addressVal;
        customers[index].ratePlan = rateVal;
        customers[index].jarsDelivered = deliveredVal;
        customers[index].jarsReturned = returnedVal;
        customers[index].status = statusVal;

        localStorage.setItem('sjd_customers', JSON.stringify(customers));
        alert(`Customer account #${idVal} details updated successfully.`);
        cancelEditCustomerAdmin();
        renderCustomersTab(document.getElementById('admin-tab-content'));
    }
}

function deleteCustomerAdmin(id) {
    if (confirm(`Are you sure you want to permanently delete customer account #${id}?`)) {
        const customers = JSON.parse(localStorage.getItem('sjd_customers') || '[]');
        const updated = customers.filter(c => c.id !== id);
        localStorage.setItem('sjd_customers', JSON.stringify(updated));
        
        alert("Customer account deleted successfully.");
        cancelEditCustomerAdmin();
        renderCustomersTab(document.getElementById('admin-tab-content'));
    }
}

/* 2. Customer Reviews Management Tab */
function renderReviewsTab(container) {
    const reviews = JSON.parse(localStorage.getItem('sjd_reviews') || '[]');

    container.innerHTML = `
        <div class="admin-tab-header">
            <h2>Customer Reviews Registry</h2>
            <span style="font-size: 0.95rem; color: var(--text-muted);">${reviews.length} total reviews logged</span>
        </div>

        <p style="font-size: 0.95rem; color: var(--text-muted); margin-bottom: 24px;">Manage dynamic reviews displayed on the public home page. Toggle visibility status to hide reviews instantly.</p>

        <div class="table-responsive">
            <table class="admin-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Reviewer Name</th>
                        <th>Location</th>
                        <th>Rating</th>
                        <th>Review Comments</th>
                        <th>Post Date</th>
                        <th>Visibility Status</th>
                        <th style="text-align: right;">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${reviews.length === 0 ? '<tr><td colspan="8" style="text-align: center; color: var(--text-muted);">No reviews written yet.</td></tr>' : ''}
                    ${reviews.map(r => `
                        <tr>
                            <td><strong>${r.id}</strong></td>
                            <td><strong>${r.name}</strong></td>
                            <td>${r.location}</td>
                            <td><span style="color: #f59e0b; font-weight: bold;">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</span></td>
                            <td style="font-size: 0.85rem; max-width: 250px; font-style: italic;">"${r.comment}"</td>
                            <td style="font-size: 0.8rem;">${new Date(r.date).toLocaleDateString()}</td>
                            <td>
                                <span class="status-tag" style="background: ${r.status === 'Approved' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(100, 116, 139, 0.1)'}; color: ${r.status === 'Approved' ? '#10b981' : '#64748b'}; font-weight: bold;">
                                    ${r.status === 'Approved' ? 'Approved (Visible)' : 'Hidden'}
                                </span>
                            </td>
                            <td style="text-align: right;">
                                <div style="display: flex; gap: 6px; justify-content: flex-end;">
                                    <button class="action-btn" onclick="toggleReviewVisibility('${r.id}')" style="font-size: 0.8rem; padding: 4px 10px;">Toggle</button>
                                    <button class="action-btn action-btn-delete" onclick="deleteReviewAdmin('${r.id}')" style="font-size: 0.8rem; padding: 4px 10px;">Delete</button>
                                </div>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

function toggleReviewVisibility(id) {
    const reviews = JSON.parse(localStorage.getItem('sjd_reviews') || '[]');
    const index = reviews.findIndex(r => r.id === id);

    if (index !== -1) {
        reviews[index].status = reviews[index].status === 'Approved' ? 'Hidden' : 'Approved';
        localStorage.setItem('sjd_reviews', JSON.stringify(reviews));
        renderReviews(); // sync homepage
        renderReviewsTab(document.getElementById('admin-tab-content'));
    }
}

function deleteReviewAdmin(id) {
    if (confirm(`Are you sure you want to delete review #${id}?`)) {
        const reviews = JSON.parse(localStorage.getItem('sjd_reviews') || '[]');
        const updated = reviews.filter(r => r.id !== id);
        localStorage.setItem('sjd_reviews', JSON.stringify(updated));
        renderReviews(); // sync homepage
        renderReviewsTab(document.getElementById('admin-tab-content'));
    }
}

/* 3. Newsletter Subscribers Tab */
function renderSubscribersTab(container) {
    const subs = JSON.parse(localStorage.getItem('sjd_subscribers') || '[]');

    container.innerHTML = `
        <div class="admin-tab-header">
            <h2>Newsletter Subscribers</h2>
            <span style="font-size: 0.95rem; color: var(--text-muted);">${subs.length} emails registered</span>
        </div>

        <p style="font-size: 0.95rem; color: var(--text-muted); margin-bottom: 24px;">View list of community emails that subscribed to Shri Jal Dhara updates from the homepage.</p>

        <div class="table-responsive">
            <table class="admin-table" style="max-width: 700px;">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Email Address</th>
                        <th>Subscription Date</th>
                        <th style="text-align: right;">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${subs.length === 0 ? '<tr><td colspan="4" style="text-align: center; color: var(--text-muted);">No subscriber records found.</td></tr>' : ''}
                    ${subs.map((s, idx) => `
                        <tr>
                            <td>${idx + 1}</td>
                            <td><strong>${s.email}</strong></td>
                            <td style="font-size: 0.85rem;">${new Date(s.date).toLocaleString()}</td>
                            <td style="text-align: right;">
                                <button class="action-btn action-btn-delete" onclick="deleteSubscriberAdmin('${s.email}')" style="font-size: 0.8rem; padding: 4px 10px;">Unsubscribe</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

function deleteSubscriberAdmin(email) {
    if (confirm(`Are you sure you want to unsubscribe and remove email "${email}"?`)) {
        const subs = JSON.parse(localStorage.getItem('sjd_subscribers') || '[]');
        const updated = subs.filter(s => s.email.toLowerCase() !== email.toLowerCase());
        localStorage.setItem('sjd_subscribers', JSON.stringify(updated));
        renderSubscribersTab(document.getElementById('admin-tab-content'));
    }
}

/* 4. Chatbot Q&A Knowledge Base Tab */
function renderChatbotTab(container) {
    const qas = JSON.parse(localStorage.getItem('sjd_chatbot_qa') || '[]');

    container.innerHTML = `
        <div class="admin-tab-header">
            <h2>Chatbot Q&A Knowledge Base Settings</h2>
            <span style="font-size: 0.95rem; color: var(--text-muted);">${qas.length} answers configured</span>
        </div>

        <div class="routes-layout" style="margin-bottom: 24px;">
            <!-- Add Intent -->
            <div class="card glass-panel" style="padding: 24px;">
                <h4 style="margin: 0 0 16px 0; color: var(--primary-dark); font-size: 1.2rem;">Add Q&A Intent Trigger</h4>
                <form id="adminAddQaForm" onsubmit="addQaTrigger(event)" style="display: flex; flex-direction: column; gap: 14px;">
                    <div class="form-group">
                        <label for="qaTrigger">Keyword Triggers (pipe separated '|'):</label>
                        <input type="text" id="qaTrigger" required placeholder="e.g. warranty|guarantee|leak">
                    </div>
                    <div class="form-group">
                        <label for="qaReply">Bot Reply Answer:</label>
                        <textarea id="qaReply" rows="3" required placeholder="Write what the chatbot should say..."></textarea>
                    </div>
                    <button type="submit" class="btn-primary" style="width: 100%; justify-content: center; padding: 10px;">Create Intent Trigger</button>
                </form>
            </div>

            <!-- Edit Intent Wrapper -->
            <div id="adminEditQaWrapper" class="card glass-panel" style="padding: 24px; display: none;">
                <h4 style="margin: 0 0 16px 0; color: var(--primary-dark); font-size: 1.2rem;">Edit Q&A Intent</h4>
                <form id="adminEditQaForm" onsubmit="saveQaTrigger(event)" style="display: flex; flex-direction: column; gap: 14px;">
                    <input type="hidden" id="eqId">
                    <div class="form-group">
                        <label for="eqTrigger">Keyword Triggers (pipe separated '|'):</label>
                        <input type="text" id="eqTrigger" required>
                    </div>
                    <div class="form-group">
                        <label for="eqReply">Bot Reply Answer:</label>
                        <textarea id="eqReply" rows="4" required></textarea>
                    </div>
                    <div style="display: flex; gap: 10px;">
                        <button type="submit" class="btn-primary" style="flex-grow: 1; justify-content: center; padding: 10px;">Save Changes</button>
                        <button type="button" onclick="cancelEditQa()" class="btn-secondary" style="flex-grow: 1; justify-content: center; padding: 10px;">Cancel</button>
                    </div>
                </form>
            </div>
        </div>

        <div class="table-responsive">
            <table class="admin-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Keyword Match Triggers</th>
                        <th>Bot Conversational Reply</th>
                        <th style="text-align: right;">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${qas.length === 0 ? '<tr><td colspan="4" style="text-align: center; color: var(--text-muted);">No intents configured. Chatbot will use fallback queries.</td></tr>' : ''}
                    ${qas.map(qa => `
                        <tr>
                            <td><strong>${qa.id}</strong></td>
                            <td style="font-family: monospace; font-size: 0.85rem; color: var(--accent); font-weight: bold; max-width: 150px;">${qa.trigger}</td>
                            <td style="font-size: 0.85rem; max-width: 300px; white-space: pre-wrap;">${qa.reply}</td>
                            <td style="text-align: right;">
                                <div style="display: flex; gap: 6px; justify-content: flex-end;">
                                    <button class="action-btn" onclick="startEditQa('${qa.id}')" style="font-size: 0.8rem; padding: 4px 10px;">Edit</button>
                                    <button class="action-btn action-btn-delete" onclick="deleteQaAdmin('${qa.id}')" style="font-size: 0.8rem; padding: 4px 10px;">Delete</button>
                                </div>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

function addQaTrigger(event) {
    event.preventDefault();
    const triggerVal = document.getElementById('qaTrigger').value.trim();
    const replyVal = document.getElementById('qaReply').value.trim();

    const qas = JSON.parse(localStorage.getItem('sjd_chatbot_qa') || '[]');
    const newQa = {
        id: `QA-${Math.floor(10 + Math.random() * 90)}`,
        trigger: triggerVal,
        reply: replyVal
    };

    qas.push(newQa);
    localStorage.setItem('sjd_chatbot_qa', JSON.stringify(qas));

    document.getElementById('adminAddQaForm').reset();
    alert("New chatbot intent trigger added successfully!");
    renderChatbotTab(document.getElementById('admin-tab-content'));
}

function startEditQa(id) {
    const qas = JSON.parse(localStorage.getItem('sjd_chatbot_qa') || '[]');
    const qa = qas.find(x => x.id === id);
    if (!qa) return;

    const wrapper = document.getElementById('adminEditQaWrapper');
    wrapper.style.display = 'block';

    document.getElementById('eqId').value = qa.id;
    document.getElementById('eqTrigger').value = qa.trigger;
    document.getElementById('eqReply').value = qa.reply;

    wrapper.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function cancelEditQa() {
    document.getElementById('adminEditQaWrapper').style.display = 'none';
}

function saveQaTrigger(event) {
    event.preventDefault();
    const idVal = document.getElementById('eqId').value;
    const triggerVal = document.getElementById('eqTrigger').value.trim();
    const replyVal = document.getElementById('eqReply').value.trim();

    const qas = JSON.parse(localStorage.getItem('sjd_chatbot_qa') || '[]');
    const index = qas.findIndex(x => x.id === idVal);

    if (index !== -1) {
        qas[index].trigger = triggerVal;
        qas[index].reply = replyVal;
        localStorage.setItem('sjd_chatbot_qa', JSON.stringify(qas));
        alert("Chatbot Q&A intent triggers updated successfully.");
        cancelEditQa();
        renderChatbotTab(document.getElementById('admin-tab-content'));
    }
}

function deleteQaAdmin(id) {
    if (confirm(`Are you sure you want to delete chatbot trigger #${id}?`)) {
        const qas = JSON.parse(localStorage.getItem('sjd_chatbot_qa') || '[]');
        const updated = qas.filter(x => x.id !== id);
        localStorage.setItem('sjd_chatbot_qa', JSON.stringify(updated));
        alert("Intent trigger deleted successfully.");
        cancelEditQa();
        renderChatbotTab(document.getElementById('admin-tab-content'));
    }
}

/* ==========================================================
   Portal Hub Navigation Dropdown Controllers
   ========================================================== */
function togglePortalDropdown(event) {
    event.stopPropagation();
    const dropdown = document.getElementById('portalDropdownMenu');
    const btn = document.getElementById('portalDropdownBtn');
    if (!dropdown || !btn) return;

    dropdown.classList.toggle('show');
    btn.classList.toggle('active');
}

function closePortalDropdown() {
    const dropdown = document.getElementById('portalDropdownMenu');
    const btn = document.getElementById('portalDropdownBtn');
    if (dropdown) dropdown.classList.remove('show');
    if (btn) btn.classList.remove('active');
}

// Global click handler to dismiss dropdown when clicking outside
window.addEventListener('click', (e) => {
    const dropdown = document.getElementById('portalDropdownMenu');
    const btn = document.getElementById('portalDropdownBtn');
    if (dropdown && dropdown.classList.contains('show')) {
        if (!dropdown.contains(e.target) && !btn.contains(e.target)) {
            closePortalDropdown();
        }
    }
});

