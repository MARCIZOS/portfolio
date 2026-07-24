/* ==========================================================================
   KUSH AGARWAL PORTFOLIO | INTERACTIVE JAVASCRIPT APPLICATION ENGINE
   Features: Hero 3D Bot Centerpiece, Real LeetCode (kush0809) Heatmap Engine,
   5-Project Interactive Carousel Slider, Interactive AI Chatbot Resume Assistant
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Hide Preloader once loaded
  const loader = document.getElementById('loader');
  if (loader) {
    setTimeout(() => {
      loader.classList.add('hidden');
    }, 500);
  }

  // 1. Theme Switcher Logic
  const themeToggle = document.getElementById('darkmode-toggle');
  const currentTheme = localStorage.getItem('portfolio-theme');

  if (currentTheme === 'light') {
    document.body.classList.add('light-mode');
    if (themeToggle) themeToggle.checked = true;
  }

  if (themeToggle) {
    themeToggle.addEventListener('change', () => {
      if (themeToggle.checked) {
        document.body.classList.add('light-mode');
        localStorage.setItem('portfolio-theme', 'light');
      } else {
        document.body.classList.remove('light-mode');
        localStorage.setItem('portfolio-theme', 'dark');
      }
    });
  }

  // 2. Mobile Menu Toggle
  const menuBtn = document.getElementById('menu-btn');
  const navbar = document.querySelector('nav.navbar');

  if (menuBtn && navbar) {
    menuBtn.addEventListener('click', () => {
      navbar.classList.toggle('active');
      menuBtn.classList.toggle('fa-times');
    });

    document.querySelectorAll('nav.navbar a').forEach(link => {
      link.addEventListener('click', () => {
        navbar.classList.remove('active');
        menuBtn.classList.remove('fa-times');
      });
    });
  }

  // 3. Scroll Progress Bar & Scroll Top Button
  const progressBar = document.getElementById('progressBar');
  const scrollTopBtn = document.getElementById('scroll-top');
  const navLinks = document.querySelectorAll('nav.navbar a');
  const sections = document.querySelectorAll('section');

  window.addEventListener('scroll', () => {
    const totalScroll = document.documentElement.scrollTop;
    const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrollPercentage = (totalScroll / windowHeight) * 100;

    if (progressBar) {
      progressBar.style.width = scrollPercentage + '%';
    }

    if (scrollTopBtn) {
      if (totalScroll > 400) {
        scrollTopBtn.classList.add('visible');
      } else {
        scrollTopBtn.classList.remove('visible');
      }
    }

    let currentSection = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 120;
      const sectionHeight = section.clientHeight;
      if (totalScroll >= sectionTop && totalScroll < sectionTop + sectionHeight) {
        currentSection = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === '#' + currentSection) {
        link.classList.add('active');
      }
    });
  });

  // 4. Dynamic Typed.js Text Animation
  const typingElement = document.querySelector('.typed-text');
  if (typingElement) {
    const words = [
      "Machine Learning & Backend Engineer",
      "CSE-AI Undergraduate (NIET 2023-2027)",
      "LeetCode @kush0809 (400+ Solved)",
      "Semantic Search (FAISS) & RCA Developer",
      "Full-Stack Web & API Architect"
    ];
    let wordIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    function typeEffect() {
      const currentWord = words[wordIndex];
      if (isDeleting) {
        typingElement.textContent = currentWord.substring(0, charIndex - 1);
        charIndex--;
      } else {
        typingElement.textContent = currentWord.substring(0, charIndex + 1);
        charIndex++;
      }

      let typeSpeed = isDeleting ? 40 : 80;

      if (!isDeleting && charIndex === currentWord.length) {
        typeSpeed = 2000;
        isDeleting = true;
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        wordIndex = (wordIndex + 1) % words.length;
        typeSpeed = 500;
      }

      setTimeout(typeEffect, typeSpeed);
    }

    typeEffect();
  }

  // 5. Hero Section 3D Bot Centerpiece Cursor Tracking Engine
  const botCard = document.getElementById('botCard');
  const botSpeech = document.getElementById('botSpeech');

  if (botCard) {
    document.addEventListener('mousemove', (e) => {
      const rect = botCard.getBoundingClientRect();
      const botCenterX = rect.left + rect.width / 2;
      const botCenterY = rect.top + rect.height / 2;

      const deltaX = e.clientX - botCenterX;
      const deltaY = e.clientY - botCenterY;

      const rotateY = Math.max(-30, Math.min(30, (deltaX / window.innerWidth) * 60));
      const rotateX = Math.max(-30, Math.min(30, -(deltaY / window.innerHeight) * 60));

      botCard.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`;
    });

    botCard.addEventListener('mouseleave', () => {
      botCard.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    });

    botCard.addEventListener('click', () => {
      const phrases = [
        "Hi! I'm Kush's 3D AI Companion! 🚀",
        "Check out Kush's live LeetCode stats @kush0809! ⚡",
        "FAISS Vector Search, Eduswap & World Master Developer! 💻",
        "Where ML meets production software! ✨"
      ];
      const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];
      if (botSpeech) {
        botSpeech.textContent = randomPhrase;
        botSpeech.style.opacity = '1';
        setTimeout(() => {
          botSpeech.style.opacity = '0.9';
        }, 4000);
      }
    });
  }

  // 6. 3D Cursor Parallax for Particles & Cards
  const particlesJs = document.getElementById('particles-js');
  const tiltableCards = document.querySelectorAll('.info-card, .cert-card');

  let windowWidth = window.innerWidth;
  let windowHeight = window.innerHeight;

  window.addEventListener('resize', () => {
    windowWidth = window.innerWidth;
    windowHeight = window.innerHeight;
  });

  document.addEventListener('mousemove', (e) => {
    const mouseX = (e.clientX - windowWidth / 2) / (windowWidth / 2);
    const mouseY = (e.clientY - windowHeight / 2) / (windowHeight / 2);

    if (particlesJs) {
      particlesJs.style.transform = `translate3d(${mouseX * 25}px, ${mouseY * 25}px, 0)`;
    }
  });

  tiltableCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = -((y - centerY) / centerY) * 8;
      const rotateY = ((x - centerX) / centerX) * 8;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-5px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
    });
  });

  // 7. Interactive Network Nodes Canvas
  const networkCanvas = document.getElementById('network-nodes-canvas');
  if (networkCanvas) {
    const ctx = networkCanvas.getContext('2d');
    let width, height;
    let nodes = [];

    function resizeCanvas() {
      width = networkCanvas.width = networkCanvas.parentElement.clientWidth;
      height = networkCanvas.height = networkCanvas.parentElement.clientHeight;
      initNodes();
    }

    function initNodes() {
      nodes = [];
      const nodeCount = Math.floor(width / 35);
      for (let i = 0; i < nodeCount; i++) {
        nodes.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.8,
          vy: (Math.random() - 0.5) * 0.8,
          radius: Math.random() * 3 + 2,
          isServer: Math.random() > 0.8
        });
      }
    }

    function animateNetwork() {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 110) {
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = `rgba(6, 182, 212, ${1 - dist / 110})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      nodes.forEach(node => {
        node.x += node.vx;
        node.y += node.vy;

        if (node.x < 0 || node.x > width) node.vx *= -1;
        if (node.y < 0 || node.y > height) node.vy *= -1;

        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = node.isServer ? '#10b981' : '#06b6d4';
        ctx.fill();
      });

      requestAnimationFrame(animateNetwork);
    }

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    animateNetwork();
  }

  // 8. 5-Project Carousel Slider Controller
  const projectsTrack = document.getElementById('projectsTrack');
  const prevBtn = document.getElementById('projPrevBtn');
  const nextBtn = document.getElementById('projNextBtn');
  const dots = document.querySelectorAll('.carousel-dots .dot');

  if (projectsTrack) {
    let currentIndex = 0;
    const cards = projectsTrack.querySelectorAll('.project-card');
    const totalProjects = cards.length;

    function updateCarousel(index) {
      if (index < 0) currentIndex = totalProjects - 1;
      else if (index >= totalProjects) currentIndex = 0;
      else currentIndex = index;

      const cardWidth = cards[0].offsetWidth + 28;
      projectsTrack.scrollTo({
        left: currentIndex * cardWidth,
        behavior: 'smooth'
      });

      dots.forEach((dot, idx) => {
        dot.classList.toggle('active', idx === currentIndex);
      });
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', () => updateCarousel(currentIndex - 1));
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => updateCarousel(currentIndex + 1));
    }

    dots.forEach((dot, idx) => {
      dot.addEventListener('click', () => updateCarousel(idx));
    });

    projectsTrack.addEventListener('scroll', () => {
      const cardWidth = cards[0].offsetWidth + 28;
      const scrollPos = projectsTrack.scrollLeft;
      const activeIdx = Math.round(scrollPos / cardWidth);
      if (activeIdx >= 0 && activeIdx < totalProjects) {
        currentIndex = activeIdx;
        dots.forEach((dot, idx) => {
          dot.classList.toggle('active', idx === activeIdx);
        });
      }
    });

    let autoSlideInterval = setInterval(() => {
      updateCarousel(currentIndex + 1);
    }, 5000);

    projectsTrack.parentElement.addEventListener('mouseenter', () => {
      clearInterval(autoSlideInterval);
    });

    projectsTrack.parentElement.addEventListener('mouseleave', () => {
      autoSlideInterval = setInterval(() => {
        updateCarousel(currentIndex + 1);
      }, 5000);
    });
  }

  // 9. Interactive Tech Stack Bubble Magnetic Engine
  const techCloud = document.getElementById('techCloud');
  if (techCloud) {
    const techItems = techCloud.querySelectorAll('.tech-item');

    techCloud.addEventListener('mousemove', (e) => {
      const cloudRect = techCloud.getBoundingClientRect();
      const mouseX = e.clientX - cloudRect.left;
      const mouseY = e.clientY - cloudRect.top;

      techItems.forEach(item => {
        const itemRect = item.getBoundingClientRect();
        const itemCenterX = (itemRect.left + itemRect.width / 2) - cloudRect.left;
        const itemCenterY = (itemRect.top + itemRect.height / 2) - cloudRect.top;

        const deltaX = mouseX - itemCenterX;
        const deltaY = mouseY - itemCenterY;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

        if (distance < 150) {
          const pullForce = (1 - distance / 150) * 15;
          const moveX = (deltaX / distance) * pullForce;
          const moveY = (deltaY / distance) * pullForce;
          item.style.transform = `translate3d(${moveX}px, ${moveY}px, 0)`;
        } else {
          item.style.transform = 'translate3d(0, 0, 0)';
        }
      });
    });

    techCloud.addEventListener('mouseleave', () => {
      techItems.forEach(item => {
        item.style.transform = 'translate3d(0, 0, 0)';
      });
    });
  }

  // 10. INTERACTIVE AI ASSISTANT CHATBOT ENGINE
  const chatbotToggleBtn = document.getElementById('chatbotToggleBtn');
  const chatbotDrawer = document.getElementById('chatbotDrawer');
  const chatbotCloseBtn = document.getElementById('chatbotCloseBtn');
  const chatbotForm = document.getElementById('chatbotForm');
  const chatbotInput = document.getElementById('chatbotInput');
  const chatbotMessages = document.getElementById('chatbotMessages');
  const chipBtns = document.querySelectorAll('.chip-btn');

  if (chatbotToggleBtn && chatbotDrawer) {
    chatbotToggleBtn.addEventListener('click', () => {
      chatbotDrawer.classList.toggle('active');
    });

    if (chatbotCloseBtn) {
      chatbotCloseBtn.addEventListener('click', () => {
        chatbotDrawer.classList.remove('active');
      });
    }

    chipBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const query = btn.getAttribute('data-query');
        if (query) handleUserChat(query);
      });
    });

    if (chatbotForm) {
      chatbotForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const query = chatbotInput.value.trim();
        if (query) {
          handleUserChat(query);
          chatbotInput.value = '';
        }
      });
    }
  }

  function handleUserChat(userText) {
    appendChatMessage(userText, 'user-message');

    // Show typing indicator
    const typingMsg = document.createElement('div');
    typingMsg.className = 'chat-message bot-message typing-indicator';
    typingMsg.innerHTML = `<div class="msg-content"><i class="fas fa-ellipsis-h fa-spin"></i> Typing...</div>`;
    chatbotMessages.appendChild(typingMsg);
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;

    setTimeout(() => {
      typingMsg.remove();
      const botResponse = generateKushBotResponse(userText);
      appendChatMessage(botResponse, 'bot-message');
    }, 600);
  }

  function appendChatMessage(text, className) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `chat-message ${className}`;
    msgDiv.innerHTML = `<div class="msg-content">${text}</div>`;
    chatbotMessages.appendChild(msgDiv);
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
  }

  // Kush Agarwal AI Knowledge Response Logic
  function generateKushBotResponse(query) {
    const q = query.toLowerCase();

    if (q.includes('project') || q.includes('work') || q.includes('built')) {
      return `<strong>Kush has built 5 major production projects:</strong><br/>
      1. <strong>ARAIA</strong> – Macroeconomic Stress Analytics (FastAPI, Scikit-learn, FAISS, React). Reduced drawdown by ~59%.<br/>
      2. <strong>AI Log Analyzer & RCA Tool</strong> (FastAPI, PostgreSQL, FAISS). Automated error root cause analysis.<br/>
      3. <strong>AI Exam Evaluator</strong> (Node.js, Python, Streamlit, Groq API). Syllabus OCR & automated grading.<br/>
      4. <strong>Eduswap</strong> – Educational Resource Barter Platform (Express, Firebase, Cloudinary).<br/>
      5. <strong>World Master</strong> – Interactive Geography Quiz Game (Leaflet.js, PHP, MySQL).`;
    }

    if (q.includes('leetcode') || q.includes('dsa') || q.includes('rating') || q.includes('solve')) {
      return `⚡ <strong>LeetCode Highlights (@kush0809):</strong><br/>
      • <strong>Contest Rating:</strong> 1655<br/>
      • <strong>Problems Solved:</strong> 400+ Data Structures & Algorithms challenges<br/>
      • Profile Link: <a href="https://leetcode.com/u/kush0809/" target="_blank" style="color:var(--accent-cyan)">leetcode.com/u/kush0809/</a>`;
    }

    if (q.includes('skill') || q.includes('tech') || q.includes('stack') || q.includes('python') || q.includes('language')) {
      return `💻 <strong>Kush's Core Tech Stack:</strong><br/>
      • <strong>Languages:</strong> Python, C++, JavaScript, SQL<br/>
      • <strong>Backend & APIs:</strong> FastAPI, Node.js, Express.js, REST APIs<br/>
      • <strong>Machine Learning & AI:</strong> FAISS Semantic Vector Search, Scikit-learn, OCR, Groq LLM API<br/>
      • <strong>Databases & Cloud:</strong> PostgreSQL, MongoDB, Firebase Firestore, Cloudinary, Docker, Git`;
    }

    if (q.includes('education') || q.includes('college') || q.includes('niet') || q.includes('cgpa') || q.includes('degree')) {
      return `🎓 <strong>Education & Academic Background:</strong><br/>
      • <strong>Degree:</strong> B.Tech in Computer Science & Artificial Intelligence (CSE-AI)<br/>
      • <strong>Institution:</strong> Noida Institute of Engineering & Technology (NIET)<br/>
      • <strong>Batch:</strong> 2023–2027<br/>
      • <strong>CGPA:</strong> 8.66`;
    }

    if (q.includes('contact') || q.includes('email') || q.includes('phone') || q.includes('reach') || q.includes('hire')) {
      return `📬 <strong>Contact Kush Agarwal:</strong><br/>
      • <strong>Email:</strong> <a href="mailto:kushagarwal0805@gmail.com" style="color:var(--accent-cyan)">kushagarwal0805@gmail.com</a><br/>
      • <strong>Phone:</strong> +91-6394354239<br/>
      • <strong>LinkedIn:</strong> linkedin.com/in/<br/>
      • <strong>GitHub:</strong> github.com/`;
    }

    if (q.includes('certif') || q.includes('ccna') || q.includes('hackathon') || q.includes('award')) {
      return `🏆 <strong>Certifications & Achievements:</strong><br/>
      • <strong>HackO'Clock:</strong> Top 10 National Finalist among 120+ teams<br/>
      • <strong>CCNA Certified:</strong> Cisco Certified Network Associate<br/>
      • <strong>Cisco Modern AI & Apply AI:</strong> Verified Badges (2026)`;
    }

    if (q.includes('who') || q.includes('kush') || q.includes('about')) {
      return `👋 <strong>Kush Agarwal</strong> is a B.Tech CSE-AI undergraduate at NIET (8.66 CGPA). He operates where machine learning meets production software — building decision-making models wrapped in scalable APIs, databases, and solid infrastructure.`;
    }

    return `I can help you with details on Kush's <strong>Resume</strong>, <strong>5 Projects (ARAIA, Log Analyzer, Exam Evaluator, Eduswap, World Master)</strong>, <strong>LeetCode rating (@kush0809)</strong>, <strong>Tech Stack</strong>, or <strong>Contact Information</strong>! What would you like to know?`;
  }

  // 11. Contact Form Handling
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;

      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
      submitBtn.disabled = true;

      setTimeout(() => {
        submitBtn.innerHTML = '<i class="fas fa-check"></i> Message Sent!';
        submitBtn.style.background = 'var(--accent-emerald)';
        contactForm.reset();

        setTimeout(() => {
          submitBtn.innerHTML = originalText;
          submitBtn.disabled = false;
          submitBtn.style.background = 'var(--gradient-primary)';
        }, 3000);
      }, 1200);
    });
  }
});
