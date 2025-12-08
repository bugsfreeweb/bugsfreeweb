// Typewriter Effect
    const heroText = "Bugsfree Open Source Projects";
    const heroTitle = document.getElementById('heroTitle');
    let charIndex = 0;
    let isDeleting = false;
    function typeWriter() {
      heroTitle.textContent = heroText.substring(0, charIndex);
      if (!isDeleting && charIndex < heroText.length) {
        charIndex++;
        setTimeout(typeWriter, 100);
      } else if (!isDeleting && charIndex === heroText.length) {
        isDeleting = true;
        setTimeout(typeWriter, 2000);
      } else if (isDeleting && charIndex > 0) {
        charIndex--;
        setTimeout(typeWriter, 50);
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        setTimeout(typeWriter, 500);
      }
    }
    setTimeout(typeWriter, 300);

    // Theme Toggle
    const themeToggle = document.getElementById('themeToggle');
    const isDark = localStorage.getItem('theme') === 'dark' || (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (isDark) { document.body.classList.add('dark'); themeToggle.classList.add('active'); }
    themeToggle.addEventListener('click', () => {
      document.body.classList.toggle('dark');
      themeToggle.classList.toggle('active');
      localStorage.setItem('theme', document.body.classList.contains('dark') ? 'dark' : 'light');
    });

    // Icons & Year
    feather.replace();
    document.getElementById('year').textContent = new Date().getFullYear();

    // FIXED Visitor Counter (No API Key Required)
    const visitorBtn = document.getElementById('visitorBtn');
    const visitorsDisplay = document.getElementById('visitors');
    
    // Use localStorage for visitor count (works offline)
    function updateVisitorCount() {
      const today = new Date().toDateString();
      const storedDate = localStorage.getItem('visitorDate');
      let count = parseInt(localStorage.getItem('visitorCount') || '0');
      
      // Reset count for new day
      if (storedDate !== today) {
        count = 0;
        localStorage.setItem('visitorDate', today);
      }
      
      // Increment count
      count++;
      localStorage.setItem('visitorCount', count.toString());
      
      // Display count with animation
      animateCounter(visitorsDisplay, count);
      visitorBtn.setAttribute('data-tooltip', `Total Visitors: ${count.toLocaleString()}`);
    }
    
    // Animated counter function
    function animateCounter(element, target) {
      let current = parseInt(element.textContent) || 0;
      const increment = Math.ceil((target - current) / 20);
      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          current = target;
          clearInterval(timer);
        }
        element.textContent = current.toLocaleString();
      }, 50);
    }
    
    // Initialize visitor counter
    updateVisitorCount();
    
    // Welcome notification
    setTimeout(() => {
      showNotification('🎉 Enhanced portfolio loaded!', 'success');
    }, 3000);

    // Contact Modal
    const contactModal = document.getElementById('contactModal');
    document.getElementById('contactBtn').onclick = () => contactModal.classList.add('active');
    document.getElementById('closeModal').onclick = () => contactModal.classList.remove('active');
    contactModal.onclick = (e) => { if (e.target === contactModal) contactModal.classList.remove('active'); };

    // Real Email Form (Formspree) - Success Feedback
    document.getElementById('contactForm').onsubmit = function(e) {
      const submitBtn = this.querySelector('button[type="submit"]');
      submitBtn.textContent = 'Sending...';
      submitBtn.disabled = true;
      // Formspree handles the submission automatically
    };

    // Resume Download
    document.getElementById('resumeBtn').onclick = () => {
      const link = document.createElement('a');
      link.href = 'https://bugsfreeweb.blogspot.com/resume.pdf';
      link.download = 'Bugsfree_Resume.pdf';
      link.click();
    };

    // GitHub Data
    let allRepos = [], filteredRepos = [], allBlogPosts = [], filteredBlogPosts = [];
    const reposPerPage = 15, blogPerPage = 6; // Show 6 posts on main page
    let currentPage = 1, currentBlogPage = 1;

    async function loadData() {
      try {
        const [reposRes, eventsRes] = await Promise.all([
          fetch('https://api.github.com/users/bugsfreeweb/repos?per_page=100'),
          fetch('https://api.github.com/users/bugsfreeweb/events/public')
        ]);
        const repos = await reposRes.json();
        const events = await eventsRes.json();
        allRepos = repos.filter(r => !r.fork && !r.private).sort((a,b) => new Date(b.updated_at) - new Date(a.updated_at));
        filteredRepos = allRepos;
        
        // Animate stats on load
        animateCounter(document.getElementById('totalRepos'), allRepos.length);
        animateCounter(document.getElementById('totalStars'), allRepos.reduce((a,r) => a + r.stargazers_count, 0));
        animateCounter(document.getElementById('totalForks'), allRepos.reduce((a,r) => a + r.forks_count, 0));
        
        renderPage(1); renderPagination(); renderActivity(events); loadBlogFeed();
        
        // Animate new sections
        setTimeout(() => {
          animateAchievements();
          animateSkills();
          animateTimeline();
        }, 2000);
      } catch (e) { 
        console.error('Error loading data:', e); 
        document.getElementById('repos').innerHTML = '<div class="loading">Error loading repositories. Please try again later.</div>';
      }
    }

    function renderPage(page) {
      currentPage = page;
      const start = (page - 1) * reposPerPage;
      const end = start + reposPerPage;
      const pageRepos = filteredRepos.slice(start, end);
      const container = document.getElementById('repos');
      container.innerHTML = pageRepos.length === 0 ? '<div class="loading">No repositories found</div>' : '';
      pageRepos.forEach(repo => {
        const card = document.createElement('div');
        card.className = 'repo feature-highlight';
        const languageColor = getLanguageColor(repo.language);
        card.innerHTML = `
          <button class="copy-btn" onclick="copyRepoUrl('${repo.html_url}')" title="Copy URL"><i data-feather="copy"></i></button>
          ${repo.language ? `<div class="repo-language" style="background: ${languageColor}">${repo.language}</div>` : ''}
          <h3><a href="${repo.html_url}" target="_blank" rel="noopener"><i data-feather="github"></i> ${repo.name}</a></h3>
          <p>${repo.description || 'No description available'}</p>
          <div class="repo-stats">
            <div class="repo-stat">
              <i data-feather="star"></i>
              <span>${repo.stargazers_count}</span>
            </div>
            <div class="repo-stat">
              <i data-feather="git-branch"></i>
              <span>${repo.forks_count}</span>
            </div>
            <div class="repo-stat">
              <i data-feather="eye"></i>
              <span>${repo.watchers_count || 0}</span>
            </div>
          </div>
        `;
        container.appendChild(card);
      });
      feather.replace();
    }

    function copyRepoUrl(url) {
      navigator.clipboard.writeText(url).then(() => {
        const btn = event.target.closest('.copy-btn');
        const original = btn.innerHTML;
        btn.innerHTML = '<i data-feather="check"></i>';
        feather.replace();
        showNotification('Repository URL copied to clipboard!', 'success');
        setTimeout(() => { btn.innerHTML = original; feather.replace(); }, 2000);
      });
    }

    // Language color mapping
    function getLanguageColor(language) {
      const colors = {
        'JavaScript': '#f7df1e',
        'TypeScript': '#3178c6',
        'Python': '#3776ab',
        'Java': '#f89820',
        'C++': '#00599c',
        'C#': '#239120',
        'PHP': '#777bb4',
        'Ruby': '#701516',
        'Go': '#00add8',
        'Rust': '#dea584',
        'Swift': '#fa7343',
        'Kotlin': '#7f52ff',
        'HTML': '#e34f26',
        'CSS': '#1572b6',
        'Vue': '#4fc08d',
        'React': '#61dafb',
        'Angular': '#dd0031',
        'Node.js': '#68a063'
      };
      return colors[language] || '#6366f1';
    }

    // Notification system
    function showNotification(message, type = 'success') {
      const notification = document.createElement('div');
      notification.className = `notification ${type}`;
      notification.textContent = message;
      document.body.appendChild(notification);
      
      setTimeout(() => notification.classList.add('show'), 100);
      setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
      }, 3000);
    }

    function renderPagination() {
      const totalPages = Math.ceil(filteredRepos.length / reposPerPage);
      const pag = document.getElementById('pagination');
      pag.innerHTML = totalPages <= 1 ? '' : '';
      if (totalPages <= 1) return;
      for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement('button');
        btn.className = 'page-btn' + (i === currentPage ? ' active' : '');
        btn.textContent = i;
        btn.onclick = () => { renderPage(i); renderPagination(); window.scrollTo({ top: 300, behavior: 'smooth' }); };
        pag.appendChild(btn);
      }
    }

    function renderActivity(events) {
      const feed = document.getElementById('activity');
      feed.innerHTML = events.slice(0, 6).map(e => `
        <div class="activity-item feature-highlight">
          <strong>${e.type.replace('Event', '')}</strong>
          <div style="font-size:0.85rem; color:var(--text-light); margin-top:0.25rem;">
            ${new Date(e.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </div>
          <div style="margin-top:0.5rem; font-size:0.9rem;">${e.repo.name}</div>
        </div>
      `).join('');
    }

    // ENHANCED Blog Feed with Better Thumbnail and Meta Support
    async function loadBlogFeed() {
      const blogContainer = document.getElementById('blog');
      blogContainer.innerHTML = '<div class="loading">Loading blog posts</div>';
      try {
        const response = await fetch('https://api.rss2json.com/v1/api.json?rss_url=https://bugsfreeweb.blogspot.com/feeds/posts/default?alt=rss');
        const data = await response.json();
        if (data.status === 'ok' && data.items && data.items.length > 0) {
          allBlogPosts = data.items;
          filteredBlogPosts = allBlogPosts;
          renderBlogPage(1);
        } else {
          blogContainer.innerHTML = '<div class="blog-item"><p>No blog posts found. Check back soon!</p></div>';
        }
      } catch (error) {
        console.error('Error loading blog feed:', error);
        blogContainer.innerHTML = `<div class="blog-item"><p>Unable to load blog posts.</p><a href="https://bugsfreeweb.blogspot.com" target="_blank" rel="noopener" style="color:var(--primary);">Visit the blog directly</a></div>`;
      }
    }

    // Calculate accurate reading time from blog post content
    function calculateReadingTime(post) {
      // Use the full content for accurate word count
      let content = '';
      
      // Prioritize full content, fall back to description, then title
      if (post.content) {
        // Strip HTML tags from content
        content = post.content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
      } else if (post.description) {
        // Strip HTML tags from description
        content = post.description.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
      } else {
        // Fallback to title if no content available
        content = post.title || '';
      }
      
      // Count words (split by whitespace)
      const wordCount = content.split(/\s+/).filter(word => word.length > 0).length;
      
      // Average reading speed: 200 words per minute
      const readingSpeed = 200;
      const minutes = Math.ceil(wordCount / readingSpeed);
      
      // Ensure minimum 1 minute for very short posts
      return Math.max(1, minutes);
    }

    function renderBlogPage(page) {
      currentBlogPage = page;
      const start = (page - 1) * blogPerPage;
      const end = start + blogPerPage;
      const pagePosts = filteredBlogPosts.slice(start, end);
      const blogContainer = document.getElementById('blog');
      if (pagePosts.length === 0) {
        blogContainer.innerHTML = '<div class="loading">No blog posts found</div>';
        return;
      }
      
      const blogHTML = pagePosts.map(post => {
        // Enhanced description extraction
        const description = post.description 
          ? post.description.replace(/<[^>]*>/g, '').substring(0, 150)
          : 'No description available';
        const pubDate = new Date(post.pubDate).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric' 
        });
        
        // Enhanced thumbnail extraction with multiple fallbacks
        let imageUrl = '';
        const extractImageFromContent = (content) => {
          if (!content) return null;
          
          // Try multiple image extraction patterns
          const patterns = [
            /<img[^>]+src=["']([^"']+)["'][^>]*>/i,
            /<img[^>]+src=([^>\s]+)[^>]*>/i,
            /background-image:\s*url\(["']?([^"']+)["']?\)/i
          ];
          
          for (const pattern of patterns) {
            const match = content.match(pattern);
            if (match && match[1]) {
              return match[1].replace(/["']/g, '');
            }
          }
          return null;
        };
        
        imageUrl = post.thumbnail || 
                  extractImageFromContent(post.content) || 
                  extractImageFromContent(post.description) ||
                  `https://source.unsplash.com/400x300/?technology,code,programming&sig=${Math.random()}`;
        
        // Enhanced author extraction with better fallback
        let author = post.author && post.author.trim();
        
        // Handle noreply@blogger.com case - extract from content or use default
        if (!author || author.includes('noreply@blogger.com') || author === 'Unknown') {
          // Try to extract author from content or use post-specific logic
          author = post.title && post.title.includes('Bugsfree') ? 'Bugsfree' : 'Bugsfree';
        }
        
        // Clean up author name (remove email parts, extra spaces)
        if (author && author.includes('@')) {
          author = author.split('@')[0];
        }
        author = author || 'Bugsfree';
        
        // Create fallback image with gradient
        const fallbackImage = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'%3E%3Cdefs%3E%3ClinearGradient id='grad' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%236366f1;stop-opacity:1' /%3E%3Cstop offset='100%25' style='stop-color:%2310b981;stop-opacity:1' /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='400' height='300' fill='url(%23grad)'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-size='24' fill='white' font-family='Arial'%3EBlog%20Post%3C/text%3E%3C/svg%3E`;
        
        return `
          <div class="blog-item feature-highlight">
            <img src="${imageUrl}" alt="${post.title}" class="blog-image" 
                 onerror="this.src='${fallbackImage}'"
                 loading="lazy">
            <div class="blog-content">
              <div class="blog-text">
                <h3><a href="${post.link}" target="_blank" rel="noopener">${post.title}</a></h3>
                <p>${description}...</p>
              </div>
              <div class="blog-meta">
                <div class="blog-meta-item">
                  <i data-feather="calendar"></i>
                  <span>${pubDate}</span>
                </div>
                <div class="blog-meta-item author">
                  <i data-feather="user"></i>
                  <span>${author.trim() || 'Bugsfree'}</span>
                </div>
                <div class="blog-meta-item">
                  <i data-feather="clock"></i>
                  <span>${calculateReadingTime(post)} min read</span>
                </div>
              </div>
            </div>
          </div>
        `;
      }).join('');
      
      blogContainer.innerHTML = blogHTML;
      feather.replace();
      renderBlogPagination();
    }

    function renderBlogPagination() {
      const totalPages = Math.ceil(filteredBlogPosts.length / blogPerPage);
      const pag = document.getElementById('blogPagination');
      pag.innerHTML = totalPages <= 1 ? '' : '';
      if (totalPages <= 1) return;
      
      // Enhanced pagination with better UX
      const maxVisiblePages = 7;
      let startPage = Math.max(1, currentBlogPage - Math.floor(maxVisiblePages / 2));
      let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
      
      if (endPage - startPage < maxVisiblePages - 1) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
      }
      
      // Previous button
      if (currentBlogPage > 1) {
        const prevBtn = document.createElement('button');
        prevBtn.className = 'page-btn';
        prevBtn.innerHTML = '<i data-feather="chevron-left"></i>';
        prevBtn.onclick = () => { renderBlogPage(currentBlogPage - 1); document.querySelector('#blog').scrollIntoView({ behavior: 'smooth', block: 'start' }); };
        pag.appendChild(prevBtn);
      }
      
      for (let i = startPage; i <= endPage; i++) {
        const btn = document.createElement('button');
        btn.className = 'page-btn' + (i === currentBlogPage ? ' active' : '');
        btn.textContent = i;
        btn.onclick = () => { renderBlogPage(i); document.querySelector('#blog').scrollIntoView({ behavior: 'smooth', block: 'start' }); };
        pag.appendChild(btn);
      }
      
      // Next button
      if (currentBlogPage < totalPages) {
        const nextBtn = document.createElement('button');
        nextBtn.className = 'page-btn';
        nextBtn.innerHTML = '<i data-feather="chevron-right"></i>';
        nextBtn.onclick = () => { renderBlogPage(currentBlogPage + 1); document.querySelector('#blog').scrollIntoView({ behavior: 'smooth', block: 'start' }); };
        pag.appendChild(nextBtn);
      }
      
      feather.replace();
    }

    // Enhanced Search with Debouncing and Filters
    let searchTimeout;
    document.getElementById('searchInput').addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      const term = e.target.value.toLowerCase();
      
      searchTimeout = setTimeout(() => {
        applyFilters(term);
      }, 300);
    });

    // Add search filter buttons
    const searchFilters = ['All', 'JavaScript', 'Python', 'TypeScript', 'HTML', 'CSS', 'React'];
    const filterContainer = document.querySelector('.search-box');
    const filterDiv = document.createElement('div');
    filterDiv.className = 'search-filters';
    searchFilters.forEach(filter => {
      const btn = document.createElement('button');
      btn.className = 'filter-btn' + (filter === 'All' ? ' active' : '');
      btn.textContent = filter;
      btn.onclick = () => filterByLanguage(filter);
      filterDiv.appendChild(btn);
    });
    filterContainer.parentNode.insertBefore(filterDiv, filterContainer.nextSibling);

    function filterByLanguage(language) {
      document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
      event.target.classList.add('active');
      
      const searchTerm = document.getElementById('searchInput').value.toLowerCase();
      let filtered = allRepos.filter(r => {
        const matchesSearch = !searchTerm || 
          r.name.toLowerCase().includes(searchTerm) ||
          (r.description && r.description.toLowerCase().includes(searchTerm)) ||
          (r.language && r.language.toLowerCase().includes(searchTerm)) ||
          (r.topics && r.topics.some(topic => topic.toLowerCase().includes(searchTerm)));
        
        const matchesLanguage = language === 'All' || r.language === language;
        
        return matchesSearch && matchesLanguage;
      });
      
      filteredRepos = filtered;
      renderPage(1);
      renderPagination();
    }

    function applyFilters(searchTerm = '') {
      filteredRepos = allRepos.filter(r =>
        r.name.toLowerCase().includes(searchTerm) ||
        (r.description && r.description.toLowerCase().includes(searchTerm)) ||
        (r.language && r.language.toLowerCase().includes(searchTerm)) ||
        (r.topics && r.topics.some(topic => topic.toLowerCase().includes(searchTerm)))
      );
      renderPage(1);
      renderPagination();
    }

    // Blog Categories
    let currentBlogCategory = 'all';
    document.getElementById('blogFilters').addEventListener('click', (e) => {
      if (e.target.classList.contains('category-btn')) {
        document.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');
        currentBlogCategory = e.target.dataset.category;
        filterBlogPosts();
      }
    });

    function filterBlogPosts() {
      if (currentBlogCategory === 'all') {
        filteredBlogPosts = allBlogPosts;
      } else {
        filteredBlogPosts = allBlogPosts.filter(post => {
          const title = post.title.toLowerCase();
          const description = (post.description || '').toLowerCase();
          const content = (post.content || '').toLowerCase();
          const combinedText = `${title} ${description} ${content}`;
          
          switch(currentBlogCategory) {
            case 'development':
              return combinedText.includes('development') || combinedText.includes('coding') || 
                     combinedText.includes('programming') || combinedText.includes('code');
            case 'tutorial':
              return title.includes('tutorial') || title.includes('guide') || title.includes('how to') ||
                     combinedText.includes('step by step') || combinedText.includes('learn');
            case 'javascript':
              return combinedText.includes('javascript') || combinedText.includes('js') ||
                     combinedText.includes('node') || combinedText.includes('react');
            case 'web':
              return combinedText.includes('web') || combinedText.includes('html') ||
                     combinedText.includes('css') || combinedText.includes('frontend');
            case 'open-source':
              return combinedText.includes('open source') || combinedText.includes('github') ||
                     combinedText.includes('contribution') || combinedText.includes('opensource');
            case 'tips':
              return title.includes('tip') || title.includes('trick') || combinedText.includes('pro tip') ||
                     combinedText.includes('best practice') || combinedText.includes('shortcut');
            default:
              return true;
          }
        });
      }
      renderBlogPage(1);
    }

    // AI Chat Integration
    function toggleChat() {
      const chatWindow = document.getElementById('chatWindow');
      chatWindow.classList.toggle('active');
    }

    function handleChatInput(event) {
      if (event.key === 'Enter') {
        sendMessage();
      }
    }

    function sendMessage() {
      const input = document.getElementById('chatInput');
      const message = input.value.trim();
      if (!message) return;

      // Add user message
      addChatMessage(message, 'user');
      input.value = '';

      // Simulate AI response
      setTimeout(() => {
        const response = getAIResponse(message);
        addChatMessage(response, 'bot');
      }, 1000);
    }

    function addChatMessage(message, sender) {
      const messagesContainer = document.getElementById('chatMessages');
      const messageDiv = document.createElement('div');
      messageDiv.className = `chat-message ${sender}`;
      messageDiv.textContent = message;
      messagesContainer.appendChild(messageDiv);
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    function getAIResponse(message) {
      const lowerMessage = message.toLowerCase();
      
      if (lowerMessage.includes('project') || lowerMessage.includes('repo')) {
        return `I have ${allRepos.length} open source projects on GitHub! You can explore them in the projects section above. My most popular projects include repositories with ${allRepos.reduce((a,r) => a + r.stargazers_count, 0)} total stars.`;
      }
      if (lowerMessage.includes('skill') || lowerMessage.includes('experience')) {
        return `I'm skilled in JavaScript, React, Python, TypeScript, Node.js, and many other technologies. You can see my detailed skills section above with proficiency levels for each technology.`;
      }
      if (lowerMessage.includes('blog') || lowerMessage.includes('post')) {
        return `I've written ${allBlogPosts.length} blog posts covering various tech topics, tutorials, and insights. You can read them in the blog section or visit my blog directly at bugsfreeweb.blogspot.com.`;
      }
      if (lowerMessage.includes('contact') || lowerMessage.includes('hire')) {
        return `I'd love to connect! You can contact me using the contact button in the header, or check out my resume. I'm always open to interesting projects and collaborations.`;
      }
      if (lowerMessage.includes('experience') || lowerMessage.includes('background')) {
        return `I'm passionate about open source development and creating innovative solutions. You can check out my project timeline above to see my journey and milestones.`;
      }
      
      return `Thanks for your question! Feel free to ask me about my projects, skills, experience, or blog posts. I'm here to help you learn more about my work!`;
    }

    // Achievement Badges Animation
    function animateAchievements() {
      const totalStars = allRepos.reduce((a,r) => a + r.stargazers_count, 0);
      const totalForks = allRepos.reduce((a,r) => a + r.forks_count, 0);
      
      animateCounter(document.getElementById('starCount'), totalStars);
      animateCounter(document.getElementById('forkCount'), totalForks);
      animateCounter(document.getElementById('blogCount'), allBlogPosts.length);
      animateCounter(document.getElementById('projectCount'), allRepos.length);
    }

    // Skills Progress Animation
    function animateSkills() {
      const skillBars = document.querySelectorAll('.skill-progress');
      skillBars.forEach((bar, index) => {
        setTimeout(() => {
          bar.style.width = bar.style.width;
        }, index * 200);
      });
    }

    // Timeline Animation
    function animateTimeline() {
      const timelineItems = document.querySelectorAll('.timeline-item');
      timelineItems.forEach((item, index) => {
        setTimeout(() => {
          item.style.opacity = '0';
          item.style.transform = 'translateX(-50px)';
          setTimeout(() => {
            item.style.transition = 'all 0.6s ease';
            item.style.opacity = '1';
            item.style.transform = 'translateX(0)';
          }, 100);
        }, index * 300);
      });
    }

    // Initialize data loading

    loadData();
