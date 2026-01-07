// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Mobile menu toggle
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-menu a').forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    });
});

// Portfolio filtering
const filterButtons = document.querySelectorAll('.filter-btn');
const portfolioItems = document.querySelectorAll('.portfolio-item');

filterButtons.forEach(button => {
    button.addEventListener('click', () => {
        // Remove active class from all buttons
        filterButtons.forEach(btn => btn.classList.remove('active'));
        // Add active class to clicked button
        button.classList.add('active');

        const filterValue = button.getAttribute('data-filter');

        portfolioItems.forEach(item => {
            if (filterValue === 'all' || item.getAttribute('data-category') === filterValue) {
                item.style.display = 'block';
                setTimeout(() => {
                    item.style.opacity = '1';
                    item.style.transform = 'scale(1)';
                }, 100);
            } else {
                item.style.opacity = '0';
                item.style.transform = 'scale(0.8)';
                setTimeout(() => {
                    item.style.display = 'none';
                }, 300);
            }
        });
    });
});

// Initialize portfolio items with animation
portfolioItems.forEach(item => {
    item.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
});

// Navbar scroll effect
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        navbar.style.backdropFilter = 'blur(10px)';
    } else {
        navbar.style.background = 'white';
        navbar.style.backdropFilter = 'none';
    }
});

// Active navigation link on scroll
const sections = document.querySelectorAll('section');
const navLinks = document.querySelectorAll('.nav-menu a');

window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (pageYOffset >= sectionTop - sectionHeight / 3) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href').slice(1) === current) {
            link.classList.add('active');
        }
    });
});

// Contact form handling
const contactForm = document.getElementById('contactForm');
const WA_NUMBER = '6287884240870'; // WhatsApp number (international format without +)
const waLink = document.getElementById('wa-link');

// Configurable texts and durations
const TOAST_OPEN_TEXT = 'Membuka WhatsApp — pesan Anda telah disiapkan.';
const TOAST_RESET_TEXT = 'Form telah dikosongkan. Terima kasih!';
const TOAST_DURATION = 3800; // ms
const PENDING_FALLBACK = 120000; // 2 minutes fallback to reset if user doesn't return

function buildWhatsAppMessage() {
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const subject = document.getElementById('subject').value.trim();
    const messageText = document.getElementById('message').value.trim();
    const parts = [];
    if (name) parts.push(`Nama: ${name}`);
    if (email) parts.push(`Email: ${email}`);
    if (subject) parts.push(`Subjek: ${subject}`);
    if (messageText) parts.push(`Pesan: ${messageText}`);
    return parts.join('\n');
}

function showToast(message, duration = TOAST_DURATION) {
    const toast = document.createElement('div');
    toast.className = 'copilot-toast';
    toast.textContent = message;
    document.body.appendChild(toast);

    // trigger animation via class
    requestAnimationFrame(() => toast.classList.add('show'));

    setTimeout(() => {
        toast.classList.remove('show');
        toast.addEventListener('transitionend', () => toast.remove(), { once: true });
    }, duration);
}

function showConfirmationModal(message) {
    return new Promise(resolve => {
        const modal = document.getElementById('confirmModal');
        const msg = document.getElementById('confirmModalMessage');
        const ok = document.getElementById('confirmOk');
        const cancel = document.getElementById('confirmCancel');
        msg.textContent = message;
        modal.setAttribute('aria-hidden', 'false');

        function cleanup() {
            modal.setAttribute('aria-hidden', 'true');
            ok.removeEventListener('click', onOk);
            cancel.removeEventListener('click', onCancel);
            document.removeEventListener('keydown', onKey);
        }

        function onOk() { cleanup(); resolve(true); }
        function onCancel() { cleanup(); resolve(false); }
        function onKey(e) { if (e.key === 'Escape') { cleanup(); resolve(false); } }

        ok.addEventListener('click', onOk);
        cancel.addEventListener('click', onCancel);
        document.addEventListener('keydown', onKey);
        ok.focus();
    });
}

let pendingReset = false;
let pendingSince = 0;
let pendingTimer = null;

function startPendingReset() {
    pendingReset = true;
    pendingSince = Date.now();
    if (pendingTimer) clearTimeout(pendingTimer);
    pendingTimer = setTimeout(() => {
        if (pendingReset) {
            resetFormAfterReturn();
        }
    }, PENDING_FALLBACK);
}

function resetFormAfterReturn() {
    contactForm.reset();
    pendingReset = false;
    if (pendingTimer) { clearTimeout(pendingTimer); pendingTimer = null; }
    showToast(TOAST_RESET_TEXT, 2600);
}

window.addEventListener('focus', () => {
    if (pendingReset && (Date.now() - pendingSince) > 500) {
        resetFormAfterReturn();
    }
});

contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Basic client-side validation
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const subject = document.getElementById('subject').value.trim();
    const messageText = document.getElementById('message').value.trim();

    if (!name || !email || !subject || !messageText) {
        alert('Please fill in all fields.');
        return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert('Please enter a valid email address.');
        return;
    }

    const confirmed = await showConfirmationModal('Pesan akan dibuka di WhatsApp. Lanjutkan?');
    if (!confirmed) return;

    // Build WhatsApp URL and open
    const text = buildWhatsAppMessage();
    const url = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');

    // Show confirmation toast and delay reset until user returns
    showToast(TOAST_OPEN_TEXT);
    startPendingReset();
});

// When clicking the WhatsApp link in contact info, include current form values if present
if (waLink) {
    waLink.addEventListener('click', async (e) => {
        e.preventDefault();
        const confirmed = await showConfirmationModal('Pesan akan dibuka di WhatsApp. Lanjutkan?');
        if (!confirmed) return;
        const base = waLink.getAttribute('href') || `https://wa.me/${WA_NUMBER}`;
        const text = buildWhatsAppMessage();
        const url = text ? `${base}?text=${encodeURIComponent(text)}` : base;
        window.open(url, '_blank');
        showToast(TOAST_OPEN_TEXT);
        startPendingReset();
    });
}

// Scroll animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in-up');
        }
    });
}, observerOptions);

// Observe all sections for scroll animations
document.querySelectorAll('section').forEach(section => {
    observer.observe(section);
});

// Typing effect for hero title (optional enhancement)
class TypeWriter {
    constructor(element, text, speed = 100) {
        this.element = element;
        this.text = text;
        this.speed = speed;
        this.index = 0;
        this.type();
    }

    type() {
        if (this.index < this.text.length) {
            this.element.innerHTML += this.text.charAt(this.index);
            this.index++;
            setTimeout(() => this.type(), this.speed);
        }
    }
}

// Initialize typing effect on page load
document.addEventListener('DOMContentLoaded', () => {
    // Add fade-in animation to sections
    document.querySelectorAll('section').forEach((section, index) => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(30px)';
        section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        section.style.transitionDelay = `${index * 0.1}s`;
    });

    // Trigger animations after a short delay
    setTimeout(() => {
        document.querySelectorAll('section').forEach(section => {
            section.style.opacity = '1';
            section.style.transform = 'translateY(0)';
        });
    }, 100);

    // Optional: Add typing effect to hero title
    // const heroTitle = document.querySelector('.hero-title');
    // const originalText = heroTitle.textContent;
    // heroTitle.textContent = '';
    // new TypeWriter(heroTitle, originalText, 50);
});

// Preloader (optional)
window.addEventListener('load', () => {
    // Hide preloader if you add one
    const preloader = document.querySelector('.preloader');
    if (preloader) {
        preloader.style.display = 'none';
    }
});

// Back to top button (optional enhancement)
const backToTopButton = document.createElement('button');
backToTopButton.innerHTML = '<i class="fas fa-arrow-up"></i>';
backToTopButton.className = 'back-to-top';
backToTopButton.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 50px;
    height: 50px;
    background: var(--primary-color);
    color: white;
    border: none;
    border-radius: 50%;
    cursor: pointer;
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s ease;
    z-index: 1000;
    box-shadow: var(--shadow);
`;

document.body.appendChild(backToTopButton);

backToTopButton.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

window.addEventListener('scroll', () => {
    if (window.pageYOffset > 300) {
        backToTopButton.style.opacity = '1';
        backToTopButton.style.visibility = 'visible';
    } else {
        backToTopButton.style.opacity = '0';
        backToTopButton.style.visibility = 'hidden';
    }
});

// Add hover effect for back to top button
backToTopButton.addEventListener('mouseenter', () => {
    backToTopButton.style.transform = 'scale(1.1)';
});

backToTopButton.addEventListener('mouseleave', () => {
    backToTopButton.style.transform = 'scale(1)';
});
