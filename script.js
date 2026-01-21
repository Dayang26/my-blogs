/**
 * Blog JavaScript - Interactive Features
 */

// DOM Elements
const navbar = document.getElementById('navbar');
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');
const backToTop = document.getElementById('backToTop');

// ===================================
// Navigation
// ===================================

// Toggle mobile menu
navToggle?.addEventListener('click', () => {
  navLinks.classList.toggle('active');
  navToggle.classList.toggle('active');
});

// Close mobile menu when clicking a link
navLinks?.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('active');
    navToggle.classList.remove('active');
  });
});

// Navbar scroll effect
let lastScrollY = window.scrollY;

window.addEventListener('scroll', () => {
  const currentScrollY = window.scrollY;
  
  // Add scrolled class for styling
  if (currentScrollY > 50) {
    navbar?.classList.add('scrolled');
  } else {
    navbar?.classList.remove('scrolled');
  }
  
  // Show/hide back to top button
  if (currentScrollY > 500) {
    backToTop?.classList.add('visible');
  } else {
    backToTop?.classList.remove('visible');
  }
  
  lastScrollY = currentScrollY;
});

// ===================================
// Back to Top
// ===================================

backToTop?.addEventListener('click', () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
});

// ===================================
// Smooth Scroll for Anchor Links
// ===================================

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const targetId = this.getAttribute('href');
    if (targetId === '#') return;
    
    const targetElement = document.querySelector(targetId);
    if (targetElement) {
      e.preventDefault();
      const navHeight = navbar?.offsetHeight || 0;
      const targetPosition = targetElement.getBoundingClientRect().top + window.scrollY - navHeight;
      
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    }
  });
});

// ===================================
// Intersection Observer for Animations
// ===================================

const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('animate-in');
      observer.unobserve(entry.target);
    }
  });
}, observerOptions);

// Observe elements for animation
document.querySelectorAll('.post-card, .section-header').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(20px)';
  el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
  observer.observe(el);
});

// Add animate-in styles
const style = document.createElement('style');
style.textContent = `
  .animate-in {
    opacity: 1 !important;
    transform: translateY(0) !important;
  }
`;
document.head.appendChild(style);

// ===================================
// Copy Code Blocks (for article pages)
// ===================================

document.querySelectorAll('pre code').forEach(codeBlock => {
  const pre = codeBlock.parentElement;
  const button = document.createElement('button');
  button.className = 'copy-button';
  button.textContent = '复制';
  button.style.cssText = `
    position: absolute;
    top: 8px;
    right: 8px;
    padding: 4px 12px;
    font-size: 12px;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 4px;
    color: #a0a0b0;
    cursor: pointer;
    transition: all 0.2s ease;
  `;
  
  button.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(codeBlock.textContent);
      button.textContent = '已复制！';
      button.style.color = '#22c55e';
      setTimeout(() => {
        button.textContent = '复制';
        button.style.color = '#a0a0b0';
      }, 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  });
  
  pre.style.position = 'relative';
  pre.appendChild(button);
});

// ===================================
// Reading Progress (for article pages)
// ===================================

const articleContent = document.querySelector('.article-content');
if (articleContent) {
  const progressBar = document.createElement('div');
  progressBar.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 0%;
    height: 3px;
    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%);
    z-index: 1001;
    transition: width 0.1s ease;
  `;
  document.body.appendChild(progressBar);
  
  window.addEventListener('scroll', () => {
    const articleTop = articleContent.offsetTop;
    const articleHeight = articleContent.offsetHeight;
    const windowHeight = window.innerHeight;
    const scrollY = window.scrollY;
    
    const progress = Math.min(
      Math.max((scrollY - articleTop + windowHeight * 0.5) / articleHeight, 0),
      1
    );
    
    progressBar.style.width = `${progress * 100}%`;
  });
}

console.log('🚀 Blog loaded successfully!');
