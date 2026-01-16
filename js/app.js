// Global settings object
let appSettings = {
  siteTitle: 'Bugsfree Portfolio',
  heroText: 'Bugsfree Open Source Projects',
  bio: 'Passionate developer creating open source solutions',
  githubUsername: 'bugsfreeweb',
  theme: 'system',
  enableAnimations: true,
  projectsPerPage: 12,
  postsPerPage: 6,
  metaTitle: '',
  metaDescription: '',
  ogImage: '',
  
  // Display settings - Homepage sections
  showHero: true,
  showRepos: true,
  showActivity: true,
  showBlog: true,
  showAdminProjects: true,
  showTimeline: true,
  
  // Display settings - GitHub cards
  showRepoImages: true,
  showSourceDetails: true
};

// Typewriter Effect - now settings-aware
let charIndex = 0;
let isDeleting = false;
let typeWriterTimeout;

function typeWriter() {
  const heroTitle = document.getElementById('heroTitle');
  if (!heroTitle) return;
  
  const text = appSettings.heroText || 'Bugsfree Open Source Projects';
  heroTitle.textContent = text.substring(0, charIndex);
  
  if (!isDeleting && charIndex < text.length) {
    charIndex++;
    typeWriterTimeout = setTimeout(typeWriter, appSettings.enableAnimations ? 100 : 0);
  } else if (!isDeleting && charIndex === text.length) {
    isDeleting = true;
    typeWriterTimeout = setTimeout(typeWriter, appSettings.enableAnimations ? 2000 : 100);
  } else if (isDeleting && charIndex > 0) {
    charIndex--;
    typeWriterTimeout = setTimeout(typeWriter, appSettings.enableAnimations ? 50 : 0);
  } else if (isDeleting && charIndex === 0) {
    isDeleting = false;
    typeWriterTimeout = setTimeout(typeWriter, appSettings.enableAnimations ? 500 : 100);
  }
}

function startTypeWriter() {
  // Stop any existing typewriter
  if (typeWriterTimeout) clearTimeout(typeWriterTimeout);
  charIndex = 0;
  isDeleting = false;
  setTimeout(typeWriter, appSettings.enableAnimations ? 300 : 0);
}

// Theme Toggle - now settings-aware
function applyTheme() {
  const themeToggle = document.getElementById('themeToggle');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  let isDark;
  if (appSettings.theme === 'system') {
    isDark = prefersDark;
  } else {
    isDark = appSettings.theme === 'dark';
  }
  
  if (isDark) {
    document.body.classList.add('dark');
    if (themeToggle) themeToggle.classList.add('active');
  } else {
    document.body.classList.remove('dark');
    if (themeToggle) themeToggle.classList.remove('active');
  }
  
  // Save to localStorage
  localStorage.setItem('theme', appSettings.theme);
}

function initThemeToggle() {
  const themeToggle = document.getElementById('themeToggle');
  if (!themeToggle) return;
  
  // Apply saved theme on load
  applyTheme();
  
  themeToggle.addEventListener('click', () => {
    // Toggle between dark and light (not system for user toggle)
    const currentIsDark = document.body.classList.contains('dark');
    if (currentIsDark) {
      appSettings.theme = 'light';
    } else {
      appSettings.theme = 'dark';
    }
    applyTheme();
  });
}

// Apply meta tags dynamically
function applyMetaTags() {
  // Update document title
  if (appSettings.metaTitle) {
    document.title = appSettings.metaTitle;
  } else if (appSettings.siteTitle) {
    document.title = appSettings.siteTitle;
  }
  
  // Update meta description
  let metaDesc = document.querySelector('meta[name="description"]');
  if (!metaDesc) {
    metaDesc = document.createElement('meta');
    metaDesc.name = 'description';
    document.head.appendChild(metaDesc);
  }
  if (appSettings.metaDescription) {
    metaDesc.content = appSettings.metaDescription;
  }
  
  // Update OG image
  let ogImage = document.querySelector('meta[property="og:image"]');
  if (!ogImage) {
    ogImage = document.createElement('meta');
    ogImage.property = 'og:image';
    document.head.appendChild(ogImage);
  }
  if (appSettings.ogImage) {
    ogImage.content = appSettings.ogImage;
  }
}
    
    // =====================================================
    // User Profile Dropdown
    // =====================================================
    const userProfileDropdown = document.getElementById('userProfileDropdown');
    const userAvatarBtn = document.getElementById('userAvatarBtn');
    const userDropdownMenu = document.getElementById('userDropdownMenu');
    
    function updateUserUI(user) {
      if (user && user.photoURL) {
        // Show user profile dropdown
        userProfileDropdown.style.display = 'block';
        
        // Update avatar in header
        const headerAvatar = document.getElementById('userAvatarImg');
        if (headerAvatar) {
          headerAvatar.src = user.photoURL;
        }
        
        // Update avatar in dropdown
        const dropdownAvatar = document.getElementById('dropdownUserAvatar');
        if (dropdownAvatar) {
          dropdownAvatar.src = user.photoURL;
        }
        
        // Update name in dropdown
        const dropdownName = document.getElementById('dropdownUserName');
        if (dropdownName) {
          dropdownName.textContent = user.displayName || 'User';
        }
      } else {
        // Hide user profile dropdown
        userProfileDropdown.style.display = 'none';
      }
    }
    
    // Toggle dropdown menu
    if (userAvatarBtn && userDropdownMenu) {
      userAvatarBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        userDropdownMenu.classList.toggle('active');
      });
    }
    
    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
      if (userDropdownMenu && userDropdownMenu.classList.contains('active')) {
        if (!userDropdownMenu.contains(e.target) && !userAvatarBtn.contains(e.target)) {
          userDropdownMenu.classList.remove('active');
        }
      }
    });
    
    // Sign out function
    window.signOutFromSite = async function() {
      try {
        if (window.firebaseServices && window.firebaseServices.signOutUser) {
          await window.firebaseServices.signOutUser();
        } else if (window.firebaseServices && window.firebaseServices.auth) {
          await window.firebaseServices.auth.signOut();
        } else if (typeof firebase !== 'undefined' && firebase.auth) {
          await firebase.auth().signOut();
        }
        
        // Hide dropdown
        if (userDropdownMenu) {
          userDropdownMenu.classList.remove('active');
        }
        
        // Hide user profile
        userProfileDropdown.style.display = 'none';
        
        showNotification('Successfully signed out', 'success');
        
        // Reload page to update all UI states
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } catch (error) {
        console.error('Sign out error:', error);
        showNotification('Failed to sign out', 'error');
      }
    };
    
    // Listen for auth state changes to update user UI
    function initUserAuthListener() {
      if (window.firebaseServices && window.firebaseServices.auth) {
        window.firebaseServices.auth.onAuthStateChanged((user) => {
          updateUserUI(user);
        });
      } else if (typeof firebase !== 'undefined' && firebase.auth) {
        firebase.auth().onAuthStateChanged((user) => {
          updateUserUI(user);
        });
      }
    }
    
    // Initialize user auth listener
    initUserAuthListener();
    
    // Check current user on load
    if (window.firebaseServices && window.firebaseServices.auth) {
      updateUserUI(window.firebaseServices.auth.currentUser);
    } else if (typeof firebase !== 'undefined' && firebase.auth) {
      updateUserUI(firebase.auth().currentUser);
    }
    
    // Icons & Year
    feather.replace();
    document.getElementById('year').textContent = new Date().getFullYear();
    // Animated counter function (for stats)
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
    // Welcome notification - only show on first load of session
    if (!sessionStorage.getItem('portfolioLoaded')) {
      sessionStorage.setItem('portfolioLoaded', 'true');
      setTimeout(() => {
        showNotification('🎉 Enhanced portfolio loaded!', 'success');
      }, 3000);
    }
    // Contact Modal
    const contactModal = document.getElementById('contactModal');
    document.getElementById('contactBtn').onclick = () => contactModal.classList.add('active');
    document.getElementById('closeModal').onclick = () => contactModal.classList.remove('active');
    contactModal.onclick = (e) => { if (e.target === contactModal) contactModal.classList.remove('active'); };
    
    // Blog Post Modal - Close when clicking outside
    const blogPostModal = document.getElementById('blogPostModal');
    if (blogPostModal) {
      blogPostModal.onclick = (e) => { if (e.target === blogPostModal) closePostModal(); };
    }
    
    // Conversation Modal - Close when clicking outside
    const conversationModal = document.getElementById('conversationModal');
    if (conversationModal) {
      conversationModal.onclick = (e) => { if (e.target === conversationModal) closeConversationModal(); };
    }
    
    // Keyboard support - ESC to close modals
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const blogPostModal = document.getElementById('blogPostModal');
        const projectDetailModal = document.getElementById('projectDetailModal');
        if (blogPostModal && blogPostModal.classList.contains('active')) {
          closePostModal();
        }
        if (projectDetailModal && projectDetailModal.classList.contains('active')) {
          closeProjectModal();
        }
      }
    });
    
    // Real Email Form (Formspree) - Success Feedback
    document.getElementById('contactForm').onsubmit = function(e) {
      const submitBtn = this.querySelector('button[type="submit"]');
      submitBtn.textContent = 'Sending...';
      submitBtn.disabled = true;
      // Formspree handles the submission automatically
    };
    
    // GitHub Data
    let allRepos = [], filteredRepos = [];
    let reposPerPage = appSettings.projectsPerPage || 12;
    let currentPage = 1;
    
    // GitHub API helper - try direct API, fallback to demo data on CORS errors
    async function fetchGitHubData(url) {
      try {
        const response = await fetch(url, {
          headers: { 'Accept': 'application/vnd.github.v3+json' }
        });
        if (response.ok) {
          return await response.json();
        }
      } catch (e) {
        console.log('GitHub API fetch failed, using demo data:', e.message);
      }
      return null;
    }
    
    async function loadData() {
      try {
        const [reposRes, eventsRes] = await Promise.all([
          fetchGitHubData('https://api.github.com/users/bugsfreeweb/repos?per_page=100'),
          fetchGitHubData('https://api.github.com/users/bugsfreeweb/events/public')
        ]);
        
        // Use demo data if API fails (common on localhost due to CORS)
        const repos = (reposRes && Array.isArray(reposRes)) ? reposRes : getDemoRepos();
        const events = (eventsRes && Array.isArray(eventsRes)) ? eventsRes : getDemoEvents();
        
        allRepos = repos.filter(r => !r.fork && !r.private).sort((a,b) => new Date(b.updated_at) - new Date(a.updated_at));
        filteredRepos = allRepos;
       
        // Animate stats on load
        animateCounter(document.getElementById('totalRepos'), allRepos.length);
        animateCounter(document.getElementById('totalStars'), allRepos.reduce((a,r) => a + r.stargazers_count, 0));
        animateCounter(document.getElementById('totalForks'), allRepos.reduce((a,r) => a + r.forks_count, 0));
       
        renderPage(1); renderPagination(); renderActivity(events);
       
        // Animate new sections
        setTimeout(() => {
          animateAchievements();
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
          <div class="repo-header">
            <img src="https://picsum.photos/seed/${repo.name}/400/200" alt="${repo.name}" onerror="this.style.display='none'">
            <div class="repo-header-overlay">
              <h3><a href="${repo.html_url}" target="_blank" rel="noopener"><i data-feather="github"></i> ${repo.name}</a></h3>
            </div>
            <button class="copy-btn" onclick="copyRepoUrl(event, '${repo.html_url}')" title="Copy URL"><i data-feather="copy"></i></button>
          </div>
          <div class="repo-body">
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
              ${repo.language ? `<div class="repo-language" style="background: ${languageColor}">${repo.language}</div>` : ''}
            </div>
          </div>
        `;
        container.appendChild(card);
      });
      feather.replace();
    }
    function copyRepoUrl(event, url) {
      event.stopPropagation();
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
    
    // Demo data for localhost development when GitHub API is blocked by CORS
    function getDemoRepos() {
      return [
        { name: 'bugsfreeweb', description: 'Main website and admin dashboard', html_url: 'https://github.com/bugsfreeweb/bugsfreeweb', language: 'JavaScript', stargazers_count: 0, forks_count: 0, watchers_count: 0, fork: false, private: false, updated_at: new Date().toISOString() },
        { name: 'portfolio', description: 'Personal portfolio website', html_url: 'https://github.com/bugsfreeweb/portfolio', language: 'HTML', stargazers_count: 0, forks_count: 0, watchers_count: 0, fork: false, private: false, updated_at: new Date().toISOString() },
        { name: 'demo-project', description: 'A demonstration project', html_url: 'https://github.com/bugsfreeweb/demo-project', language: 'Python', stargazers_count: 0, forks_count: 0, watchers_count: 0, fork: false, private: false, updated_at: new Date().toISOString() }
      ];
    }
    
    function getDemoEvents() {
      return [
        { type: 'PushEvent', repo: { name: 'bugsfreeweb/bugsfreeweb' }, created_at: new Date().toISOString() },
        { type: 'CreateEvent', repo: { name: 'bugsfreeweb/portfolio' }, created_at: new Date(Date.now() - 86400000).toISOString() },
        { type: 'PullRequestEvent', repo: { name: 'bugsfreeweb/demo-project' }, created_at: new Date(Date.now() - 172800000).toISOString() }
      ];
    }
    
    // ENHANCED Blog Feed with Better Thumbnail and Meta Support
    async function loadBlogFeed() {
      const blogContainer = document.getElementById('blog');
      blogContainer.innerHTML = '<div class="loading">Loading blog posts with authors and categories...</div>';
      try {
        // Load all blog posts with pagination
        let startIndex = 1;
        const maxResults = 50;
        allBlogPosts = [];
        while (true) {
          const rssUrl = `https://api.rss2json.com/v1/api.json?rss_url=https%3A%2F%2Fbugsfreeweb.blogspot.com%2Ffeeds%2Fposts%2Fdefault%3Falt%3Drss%26max-results%3D${maxResults}%26start-index%3D${startIndex}`;
          const response = await fetch(rssUrl);
          const data = await response.json();
          if (data.status !== 'ok' || !data.items || data.items.length === 0) break;
          allBlogPosts = allBlogPosts.concat(data.items);
          startIndex += data.items.length;
          if (data.items.length < maxResults) break;
        }

        allBlogPosts.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

        if (allBlogPosts.length > 0) {
          // Extract real categories and authors from blog posts
          const allCategories = new Set();
          allBlogPosts.forEach((item) => {
            const categories = getRealCategories(item);
            categories.forEach(cat => allCategories.add(cat));
            const authorName = cleanAuthorName(item.author);
          });

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
    // Enhanced author name cleaning and standardization
    function cleanAuthorName(author) {
      if (!author) return 'Bugsfree';
     
      // Remove quotes and extra spaces
      let clean = author.replace(/["']/g, '').trim();
     
      // Handle "Unknown" or noreply@blogger.com cases
      if (clean.toLowerCase().includes('unknown') || clean.includes('noreply@blogger.com')) {
        return 'Bugsfree';
      }
     
      // If it's an email, extract the username part
      if (clean.includes('@') && !clean.includes('noreply')) {
        const username = clean.split('@')[0];
        // Capitalize first letter
        clean = username.charAt(0).toUpperCase() + username.slice(1);
      }
     
      // Handle common author name patterns
      const commonNames = {
        'bugsfree': 'Bugsfree',
        'admin': 'Administrator',
        'owner': 'Owner',
        'author': 'Author'
      };
     
      const lowerClean = clean.toLowerCase();
      if (commonNames[lowerClean]) {
        clean = commonNames[lowerClean];
      }
     
      return clean || 'Bugsfree';
    }
    // Get real categories from blog post (first 2 categories only)
    function getRealCategories(post) {
      if (post.categories && Array.isArray(post.categories) && post.categories.length > 0) {
        // Return only the first 2 categories as requested
        return post.categories.slice(0, 2);
      }
      // Fallback to generic categories if none available
      return ['Technology', 'General'];
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
       
        // Get real categories from blog post (first 2 only)
        const categories = getRealCategories(post);
        const categoryDisplay = categories.join(', ');
       
        // Get and clean author name
        const authorName = cleanAuthorName(post.author);
       
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
                <div class="blog-meta-item">
                  <i data-feather="user"></i>
                  <span>${authorName}</span>
                </div>
                <div class="blog-meta-item category">
                  <i data-feather="tag"></i>
                  <span>${categoryDisplay || 'Technology, General'}</span>
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
      pag.innerHTML = '';
     
      if (totalPages <= 1) return;
     
      // Create pagination container with proper styling
      const paginationContainer = document.createElement('div');
      paginationContainer.className = 'pagination-container';
     
      // Previous button (arrow)
      if (currentBlogPage > 1) {
        const prevBtn = document.createElement('button');
        prevBtn.className = 'page-btn nav-btn';
        prevBtn.innerHTML = '<i data-feather="chevron-left"></i>';
        prevBtn.title = 'Previous page';
        prevBtn.onclick = () => { renderBlogPage(currentBlogPage - 1); document.querySelector('#blog').scrollIntoView({ behavior: 'smooth', block: 'start' }); };
        paginationContainer.appendChild(prevBtn);
      }
     
      // Calculate page range (limit to 10 pages max)
      const maxPages = Math.min(10, totalPages);
      let startPage = 1;
      let endPage = maxPages;
     
      // Center current page if we're not at the beginning
      if (currentBlogPage > 5 && totalPages > 10) {
        startPage = Math.max(1, currentBlogPage - 4);
        endPage = Math.min(totalPages, startPage + 9);
       
        // Adjust start if we're near the end
        if (endPage - startPage < 9) {
          startPage = Math.max(1, endPage - 9);
        }
      }
     
      // Add first page and ellipsis if needed
      if (startPage > 1) {
        const firstBtn = document.createElement('button');
        firstBtn.className = 'page-btn';
        firstBtn.textContent = '1';
        firstBtn.onclick = () => { renderBlogPage(1); document.querySelector('#blog').scrollIntoView({ behavior: 'smooth', block: 'start' }); };
        paginationContainer.appendChild(firstBtn);
       
        if (startPage > 2) {
          const ellipsis = document.createElement('span');
          ellipsis.className = 'ellipsis';
          ellipsis.textContent = '...';
          paginationContainer.appendChild(ellipsis);
        }
      }
     
      // Add numbered pages
      for (let i = startPage; i <= endPage; i++) {
        const btn = document.createElement('button');
        btn.className = 'page-btn' + (i === currentBlogPage ? ' active' : '');
        btn.textContent = i;
        btn.onclick = () => { renderBlogPage(i); document.querySelector('#blog').scrollIntoView({ behavior: 'smooth', block: 'start' }); };
        paginationContainer.appendChild(btn);
      }
     
      // Add ellipsis and last page if needed
      if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
          const ellipsis = document.createElement('span');
          ellipsis.className = 'ellipsis';
          ellipsis.textContent = '...';
          paginationContainer.appendChild(ellipsis);
        }
       
        const lastBtn = document.createElement('button');
        lastBtn.className = 'page-btn';
        lastBtn.textContent = totalPages;
        lastBtn.onclick = () => { renderBlogPage(totalPages); document.querySelector('#blog').scrollIntoView({ behavior: 'smooth', block: 'start' }); };
        paginationContainer.appendChild(lastBtn);
      }
     
      // Next button (arrow)
      if (currentBlogPage < totalPages) {
        const nextBtn = document.createElement('button');
        nextBtn.className = 'page-btn nav-btn';
        nextBtn.innerHTML = '<i data-feather="chevron-right"></i>';
        nextBtn.title = 'Next page';
        nextBtn.onclick = () => { renderBlogPage(currentBlogPage + 1); document.querySelector('#blog').scrollIntoView({ behavior: 'smooth', block: 'start' }); };
        paginationContainer.appendChild(nextBtn);
      }
     
      pag.appendChild(paginationContainer);
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
    // Support Widget for Visitors
    let supportWidgetOpen = false;
    let currentConversationId = null;
    let currentVisitorInfo = null;
    let isAdminOnline = false;
    let supportMessagesUnsubscribe = null;
    
    // Initialize support widget
    document.addEventListener('DOMContentLoaded', () => {
      initializeSupportWidget();
    });
    
    function initializeSupportWidget() {
      const toggleBtn = document.getElementById('supportToggle');
      const closeBtn = document.getElementById('closeSupport');
      const sendBtn = document.getElementById('supportSendBtn');
      const input = document.getElementById('supportInput');
      
      if (toggleBtn) {
        toggleBtn.addEventListener('click', toggleSupportWidget);
      }
      
      if (closeBtn) {
        closeBtn.addEventListener('click', toggleSupportWidget);
      }
      
      if (sendBtn) {
        sendBtn.addEventListener('click', sendSupportMessage);
      }
      
      if (input) {
        input.addEventListener('keypress', (e) => {
          if (e.key === 'Enter') {
            sendSupportMessage();
          }
        });
      }
      
      // Check admin status
      checkAdminStatus();
    }
    
    function toggleSupportWidget() {
      const windowEl = document.getElementById('supportWindow');
      const toggleBtn = document.getElementById('supportToggle');
      
      if (!windowEl || !toggleBtn) return;
      
      supportWidgetOpen = !supportWidgetOpen;
      
      if (supportWidgetOpen) {
        windowEl.classList.add('active');
        toggleBtn.classList.add('active');
        
        // Focus on input
        setTimeout(() => {
          const input = document.getElementById('supportInput');
          if (input) input.focus();
        }, 300);
        
        // Load existing conversation or check for new one
        initializeChat();
      } else {
        windowEl.classList.remove('active');
        toggleBtn.classList.remove('active');
        
        // Unsubscribe from messages
        if (supportMessagesUnsubscribe) {
          supportMessagesUnsubscribe();
          supportMessagesUnsubscribe = null;
        }
      }
    }
    
    async function checkAdminStatus() {
      if (typeof db === 'undefined') return;
      
      try {
        const statusRef = db.collection('system').doc('adminStatus');
        
        statusRef.onSnapshot(doc => {
          if (doc.exists) {
            const data = doc.data();
            isAdminOnline = data.online === true;
            
            const statusDot = document.getElementById('statusDot');
            const statusText = document.getElementById('statusText');
            
            if (statusDot) {
              statusDot.classList.toggle('offline', !isAdminOnline);
            }
            
            if (statusText) {
              statusText.textContent = isAdminOnline ? 'Online' : 'Offline';
            }
          }
        });
      } catch (error) {
        console.log('Admin status check skipped:', error.message);
      }
    }
    
    async function initializeChat() {
      // Check for existing conversation in session
      const storedConversationId = sessionStorage.getItem('supportConversationId');
      const storedVisitorInfo = sessionStorage.getItem('supportVisitorInfo');
      
      if (storedConversationId && storedVisitorInfo) {
        currentConversationId = storedConversationId;
        currentVisitorInfo = JSON.parse(storedVisitorInfo);
        
        // Show welcome back message
        const messagesContainer = document.getElementById('supportMessages');
        if (messagesContainer) {
          // Keep welcome message for first interaction
        }
        
        // Subscribe to messages
        subscribeToMessages();
      } else {
        // Show welcome message only
        showWelcomeMessage();
      }
    }
    
    function showWelcomeMessage() {
      const messagesContainer = document.getElementById('supportMessages');
      if (!messagesContainer) return;
      
      // Clear existing messages except welcome
      const existingWelcome = messagesContainer.querySelector('.welcome-message');
      const existingQuickReplies = messagesContainer.querySelector('.quick-replies');
      
      if (!existingWelcome) {
        messagesContainer.innerHTML = `
          <div class="welcome-message">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
            <h4>Welcome to Support!</h4>
            <p>How can we help you today? Send us a message and we'll respond as soon as possible.</p>
          </div>
          <div class="quick-replies">
            <span class="quick-reply-chip" onclick="quickReply('I have a question about a project')">I have a question</span>
            <span class="quick-reply-chip" onclick="quickReply('I need help with a bug')">Report a bug</span>
            <span class="quick-reply-chip" onclick="quickReply('I want to collaborate')">Collaboration</span>
          </div>
        `;
      }
    }
    
    function quickReply(message) {
      const input = document.getElementById('supportInput');
      if (input) {
        input.value = message;
        input.focus();
      }
    }
    
    async function sendSupportMessage() {
      const input = document.getElementById('supportInput');
      const message = input?.value.trim();
      
      if (!message) return;
      
      if (typeof db === 'undefined') {
        showNotification('Unable to send message. Please try again later.', 'error');
        return;
      }
      
      try {
        // If no conversation exists, create one
        if (!currentConversationId) {
          // Show input fields for visitor info
          await showVisitorInfoForm(message);
          return;
        }
        
        // Send message to existing conversation
        await db.collection('conversations').doc(currentConversationId).collection('messages').add({
          sender: 'visitor',
          message: message,
          timestamp: new Date(),
          visitorName: currentVisitorInfo.name,
          visitorEmail: currentVisitorInfo.email
        });
        
        // Update conversation
        await db.collection('conversations').doc(currentConversationId).update({
          lastMessage: message,
          updatedAt: new Date(),
          status: isAdminOnline ? 'active' : 'pending'
        });
        
        // Clear input
        input.value = '';
        
        // Show success feedback based on admin status
        if (isAdminOnline) {
          // Admin is online - message will be responded to immediately
          showNotification('Message sent!', 'success');
        } else {
          // Admin is offline - set to pending and notify visitor
          showNotification('Message sent! We will respond soon.', 'success');
        }
        
      } catch (error) {
        // Handle permission errors gracefully
        if (error.code === 'permission-denied') {
          console.log('Message queued (pending admin response)');
          showNotification('Message sent! We will respond soon.', 'success');
          input.value = '';
        } else {
          console.error('Error sending message:', error);
          showNotification('Failed to send message. Please try again.', 'error');
        }
      }
    }
    
    async function showVisitorInfoForm(initialMessage = '') {
      const messagesContainer = document.getElementById('supportMessages');
      if (!messagesContainer) return;
      
      // Hide welcome message and show form
      messagesContainer.innerHTML = `
        <div class="visitor-info-form" style="padding: 20px;">
          <h4 style="margin-bottom: 16px; color: var(--text); font-size: 16px; font-weight: 600;">Please provide your information</h4>
          <div style="display: flex; flex-direction: column; gap: 12px;">
            <input type="text" id="visitorName" placeholder="Your Name" style="width: 100%; padding: 12px 16px; border: 2px solid var(--border); border-radius: 12px; background: var(--bg); color: var(--text); font-size: 14px;" required>
            <input type="email" id="visitorEmail" placeholder="Your Email" style="width: 100%; padding: 12px 16px; border: 2px solid var(--border); border-radius: 12px; background: var(--bg); color: var(--text); font-size: 14px;" required>
            <button onclick="submitVisitorInfo('${escapeHtml(initialMessage)}')" style="padding: 14px; background: linear-gradient(135deg, #667eea, #764ba2); border: none; border-radius: 12px; color: white; font-size: 14px; font-weight: 600; cursor: pointer; margin-top: 8px;">Continue</button>
          </div>
        </div>
      `;
    }
    
    async function submitVisitorInfo(initialMessage = '') {
      const name = document.getElementById('visitorName')?.value.trim();
      const email = document.getElementById('visitorEmail')?.value.trim();
      
      if (!name || !email) {
        showNotification('Please fill in all fields', 'error');
        return;
      }
      
      if (!email.includes('@')) {
        showNotification('Please enter a valid email address', 'error');
        return;
      }
      
      try {
        currentVisitorInfo = { name, email };
        
        // Create new conversation
        const conversationId = 'conv_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        currentConversationId = conversationId;
        
        // Save conversation to Firestore
        await db.collection('conversations').doc(conversationId).set({
          visitorName: name,
          visitorEmail: email,
          category: 'support',
          status: 'pending',
          lastMessage: initialMessage,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        
        // Save first message
        await db.collection('conversations').doc(conversationId).collection('messages').add({
          sender: 'visitor',
          message: initialMessage,
          timestamp: new Date(),
          visitorName: name,
          visitorEmail: email
        });
        
        // Store in session
        sessionStorage.setItem('supportConversationId', conversationId);
        sessionStorage.setItem('supportVisitorInfo', JSON.stringify({ name, email }));
        
        showNotification('Message sent successfully! We will respond soon.', 'success');
        
        // Initialize chat UI
        initializeChatUI();
        subscribeToMessages();
        
      } catch (error) {
        console.error('Error creating conversation:', error);
        showNotification('Failed to start conversation. Please try again.', 'error');
      }
    }
    
    function initializeChatUI() {
      const messagesContainer = document.getElementById('supportMessages');
      if (!messagesContainer) return;
      
      messagesContainer.innerHTML = `
        <div class="welcome-message" style="margin-bottom: 16px;">
          <h4>Start a Conversation</h4>
          <p>Your conversation has been started. We'll get back to you as soon as possible.</p>
        </div>
      `;
    }
    
    async function subscribeToMessages() {
      if (!currentConversationId || typeof db === 'undefined') return;
      
      const messagesContainer = document.getElementById('supportMessages');
      if (!messagesContainer) return;
      
      // Load existing messages first
      try {
        const messagesRef = db.collection('conversations').doc(currentConversationId).collection('messages');
        const snapshot = await messagesRef.orderBy('timestamp', 'asc').get();
        
        // Clear and rebuild messages
        messagesContainer.innerHTML = '';
        
        if (snapshot.empty) {
          // No messages yet, show welcome
          messagesContainer.innerHTML = `
            <div class="welcome-message">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
              <h4>Start a Conversation</h4>
              <p>Your conversation has been started. We'll get back to you as soon as possible.</p>
            </div>
          `;
        } else {
          // Display all existing messages
          snapshot.forEach(doc => {
            const msgData = doc.data();
            addMessageToUI(msgData);
          });
        }
        
        // Scroll to bottom
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        feather.replace();
        
      } catch (error) {
        console.error('Error loading messages:', error);
        // Show welcome message on error
        messagesContainer.innerHTML = `
          <div class="welcome-message">
            <h4>Start a Conversation</h4>
            <p>Your conversation has been started. We'll get back to you as soon as possible.</p>
          </div>
        `;
      }
      
      // Set up real-time listener for new messages
      const messagesRef = db.collection('conversations').doc(currentConversationId).collection('messages');
      
      supportMessagesUnsubscribe = messagesRef.orderBy('timestamp', 'asc').onSnapshot(
        snapshot => {
          // Check if we need to rebuild the UI
          const currentMessages = messagesContainer.querySelectorAll('.support-message');
          const existingCount = currentMessages.length;
          
          snapshot.docChanges().forEach(change => {
            if (change.type === 'added') {
              const msgData = change.doc.data();
              addMessageToUI(msgData);
              
              // Scroll to show new message
              messagesContainer.scrollTop = messagesContainer.scrollHeight;
            }
          });
          
          // Update badge if widget is closed
          if (snapshot.size > existingCount && !supportWidgetOpen) {
            updateUnreadBadge();
          }
        },
        error => {
          // Suppress permission denied errors - should not happen with updated rules
          if (error.code !== 'permission-denied') {
            console.log('Messages subscription error:', error.message);
          }
        }
      );
    }
    
    function addMessageToUI(msgData) {
      const messagesContainer = document.getElementById('supportMessages');
      if (!messagesContainer) return;
      
      const msgDiv = document.createElement('div');
      msgDiv.className = `support-message ${msgData.sender === 'visitor' ? 'visitor' : 'admin'}`;
      
      // Handle both Firestore Timestamp and Date object
      let timeStr = '';
      if (msgData.timestamp) {
        if (typeof msgData.timestamp.toDate === 'function') {
          // Firestore Timestamp
          timeStr = msgData.timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else if (msgData.timestamp instanceof Date) {
          // Regular Date object
          timeStr = msgData.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else if (msgData.timestamp.seconds) {
          // Firestore Timestamp object
          timeStr = new Date(msgData.timestamp.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
      }
      
      msgDiv.innerHTML = `
        ${escapeHtml(msgData.message)}
        ${timeStr ? `<span class="message-time">${timeStr}</span>` : ''}
      `;
      
      messagesContainer.appendChild(msgDiv);
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
    
    function updateUnreadBadge() {
      const badge = document.getElementById('supportBadge');
      if (!badge) return;
      
      const currentCount = parseInt(badge.textContent) || 0;
      badge.textContent = currentCount + 1;
      badge.style.display = 'flex';
      badge.classList.add('pulse');
    }
    
    // Contact Widget for Visitors (Legacy form-based widget)
    function toggleContactWidget() {
      const widget = document.getElementById('contactWidgetWindow');
      if (widget) {
        widget.classList.toggle('active');
      }
    }
    
    // Handle visitor contact form submission (Legacy)
    document.getElementById('visitorContactForm')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const name = document.getElementById('contactName')?.value.trim();
      const email = document.getElementById('contactEmail')?.value.trim();
      const category = document.getElementById('contactCategory')?.value;
      const message = document.getElementById('contactMessage')?.value.trim();
      
      if (!name || !email || !message) {
        showNotification('Please fill in all fields', 'error');
        return;
      }
      
      try {
        if (typeof db !== 'undefined') {
          const conversationId = 'conv_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
          
          // Save conversation
          await db.collection('conversations').doc(conversationId).set({
            visitorName: name,
            visitorEmail: email,
            category: category || 'support',
            status: 'pending',
            createdAt: new Date(),
            updatedAt: new Date()
          });
          
          // Save first message
          await db.collection('conversations').doc(conversationId).collection('messages').add({
            sender: 'visitor',
            message: message,
            timestamp: new Date()
          });
          
          showNotification('Message sent successfully! We will respond soon.', 'success');
          e.target.reset();
          toggleContactWidget();
        } else {
          showNotification('Unable to send message. Please try again later.', 'error');
        }
      } catch (error) {
        console.error('Error sending message:', error);
        showNotification('Failed to send message. Please try again.', 'error');
      }
    });
    
    // Achievement Badges Animation
    function animateAchievements() {
      const totalStars = allRepos.reduce((a,r) => a + r.stargazers_count, 0);
      const totalForks = allRepos.reduce((a,r) => a + r.forks_count, 0);
      const blogPostsCount = (window.adminBlogPosts && Array.isArray(window.adminBlogPosts)) 
        ? window.adminBlogPosts.filter(p => p.status === 'published').length 
        : 0;
     
      animateCounter(document.getElementById('starCount'), totalStars);
      animateCounter(document.getElementById('forkCount'), totalForks);
      animateCounter(document.getElementById('blogCount'), blogPostsCount);
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
    
    // Initialize theme toggle
    initThemeToggle();
    
    // Load GitHub data (now works on localhost with CORS proxy)
    loadData();
    
    // Load admin content from Firestore
    loadAdminContent();
    
    // ==================== Firestore Admin Content ====================
    async function loadAdminContent() {
      // Check if Firebase is available
      if (typeof db === 'undefined') {
        console.log('Firebase not available, skipping admin content');
        return;
      }
      
      try {
        // Load settings first
        await loadSettings();
        
        // Load admin projects
        await loadAdminProjects();
        
        // Load admin blog posts
        await loadAdminBlogPosts();
        
        // Load support conversations
        await loadConversations();
        
      } catch (error) {
        console.error('Error loading admin content:', error);
      }
    }
    
    // Load support conversations from Firestore
    async function loadConversations() {
      if (typeof db === 'undefined') return;
      
      try {
        const conversationsRef = db.collection('conversations');
        const snapshot = await conversationsRef.orderBy('updatedAt', 'desc').get();
        
        const conversations = [];
        snapshot.forEach(doc => {
          conversations.push({ id: doc.id, ...doc.data() });
        });
        
        // Store conversations globally for use in the support widget
        window.supportConversations = conversations;
        
        // Update unread count badge (if it exists in the DOM)
        const unreadBadge = document.getElementById('unreadMessagesCount');
        if (unreadBadge) {
          const unreadCount = conversations.filter(c => c.status === 'pending').length;
          unreadBadge.textContent = unreadCount;
          unreadBadge.style.display = unreadCount > 0 ? 'inline-flex' : 'none';
        }
        
        console.log('Loaded ' + conversations.length + ' support conversations');
        
      } catch (error) {
        // Silently handle errors - conversations are optional
        // Only log non-permission-denied errors
        if (error.code !== 'permission-denied') {
          console.log('Could not load conversations:', error.message);
        }
        // Don't log anything for permission denied - this is expected for public site
      }
    }
    
    // Load settings from Firestore and apply all settings
    async function loadSettings() {
      try {
        const settingsDoc = await db.collection('settings').doc('config').get();
        if (settingsDoc.exists) {
          const settings = settingsDoc.data();
          
          // Update global settings object
          appSettings = { ...appSettings, ...settings };
          
          // Apply site title
          if (appSettings.siteTitle) {
            document.title = appSettings.metaTitle || appSettings.siteTitle;
          }
          
          // Apply hero title
          const heroTitleEl = document.getElementById('heroTitle');
          if (heroTitleEl && appSettings.heroText) {
            heroTitleEl.textContent = appSettings.heroText;
          }
          
          // Apply subtitle/bio
          const subtitleEl = document.querySelector('.subtitle');
          if (subtitleEl && appSettings.bio) {
            subtitleEl.textContent = appSettings.bio;
          }
          
          // Apply theme
          applyTheme();
          
          // Apply animations setting
          if (!appSettings.enableAnimations) {
            document.body.classList.add('no-animations');
          } else {
            document.body.classList.remove('no-animations');
          }
          
          // Apply meta tags
          applyMetaTags();
          
          // Apply display settings - Homepage sections
          applyDisplaySettings();
          
          // Restart typewriter with new settings
          startTypeWriter();
          
          // Update GitHub username for API calls
          if (appSettings.githubUsername && typeof updateGitHubUsername === 'function') {
            updateGitHubUsername(appSettings.githubUsername);
          }
          
          console.log('Settings loaded from Firestore:', appSettings);
        }
      } catch (error) {
        console.log('Settings not found or error loading:', error.message);
      }
    }
    
    // Apply display settings to show/hide sections
    function applyDisplaySettings() {
      // Hero section
      const heroSection = document.querySelector('.hero');
      if (heroSection) {
        heroSection.style.display = appSettings.showHero !== false ? '' : 'none';
      }
      
      // Repositories section
      const reposSection = document.getElementById('reposSection') || document.querySelector('.repos-section');
      if (reposSection) {
        reposSection.style.display = appSettings.showRepos !== false ? '' : 'none';
      }
      
      // Activity section
      const activitySection = document.getElementById('activitySection') || document.querySelector('.activity-section');
      if (activitySection) {
        activitySection.style.display = appSettings.showActivity !== false ? '' : 'none';
      }
      
      // Blog section
      const blogSection = document.getElementById('blogSection') || document.querySelector('.blog-section');
      if (blogSection) {
        blogSection.style.display = appSettings.showBlog !== false ? '' : 'none';
      }
      
      // Admin projects section
      const adminProjectsSection = document.getElementById('adminProjectsSection') || document.querySelector('.admin-projects-section');
      if (adminProjectsSection) {
        adminProjectsSection.style.display = appSettings.showAdminProjects !== false ? '' : 'none';
      }
      
      // Timeline section
      const timelineSection = document.querySelector('.timeline-section');
      if (timelineSection) {
        timelineSection.style.display = appSettings.showTimeline !== false ? '' : 'none';
      }
      
      // GitHub repo card images
      const repoImages = document.querySelectorAll('.repo-header img');
      repoImages.forEach(img => {
        img.style.display = appSettings.showRepoImages !== false ? '' : 'none';
      });
      
      // GitHub source details
      const sourceDetails = document.querySelectorAll('.repo-source-details');
      sourceDetails.forEach(el => {
        el.style.display = appSettings.showSourceDetails !== false ? '' : 'none';
      });
    }
    
    // Load admin projects from Firestore
    async function loadAdminProjects() {
      try {
        const projectsSnapshot = await db.collection('projects').get();
        const adminProjects = [];
        
        projectsSnapshot.forEach(doc => {
          adminProjects.push({ id: doc.id, ...doc.data() });
        });
        
        // Sort by creation date (newest first)
        adminProjects.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
          const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
          return dateB - dateA;
        });
        
        // Fetch view and like counts from subcollections in parallel
        const countsPromises = adminProjects.map(async (project) => {
          try {
            // Get view count from subcollection
            const viewsSnapshot = await db.collection('projects').doc(project.id).collection('views').get();
            project.viewCount = viewsSnapshot.size;
            
            // Get like count from subcollection
            const likesSnapshot = await db.collection('projects').doc(project.id).collection('likes').get();
            project.likeCount = likesSnapshot.size;
          } catch (e) {
            // If subcollections don't exist yet, use 0
            project.viewCount = project.viewCount || 0;
            project.likeCount = project.likeCount || 0;
          }
        });

        await Promise.all(countsPromises);
        
        // Update admin projects count
        animateCounter(document.getElementById('totalAdminProjects'), adminProjects.length);
        
        // Render admin projects if any exist
        if (adminProjects.length > 0) {
          const adminSection = document.getElementById('adminProjectsSection');
          const adminContainer = document.getElementById('adminProjects');
          const adminPagination = document.getElementById('adminProjectsPagination');
          
          if (adminSection && adminContainer) {
            adminSection.style.display = 'block';
            
            // Pagination settings - 6 projects per page
            const projectsPerPage = 6;
            let currentAdminProjectPage = 1;
            
            // Store projects globally for pagination
            window.adminProjects = adminProjects;
            
            function renderAdminProjectPage(page) {
              const start = (page - 1) * projectsPerPage;
              const end = start + projectsPerPage;
              const pageProjects = adminProjects.slice(start, end);
              
              adminContainer.innerHTML = pageProjects.map(project => {
                const languageColor = getLanguageColor(project.language);
                const viewCount = project.viewCount || 0;
                const likeCount = project.likeCount || 0;
                const isPremium = project.projectType === 'premium';
                
                // Strip HTML tags from description for card display
                let descriptionText = 'No description available';
                if (project.description) {
                  const temp = document.createElement('div');
                  temp.innerHTML = project.description;
                  descriptionText = temp.textContent || temp.innerText || '';
                  descriptionText = descriptionText.replace(/\s+/g, ' ').trim().substring(0, 120);
                }
                
                const fallbackImage = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'%3E%3Cdefs%3E%3ClinearGradient id='grad' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%236366f1;stop-opacity:1' /%3E%3Cstop offset='100%25' style='stop-color:%2310b981;stop-opacity:1' /%3E%3C/defs%3E%3Crect width='400' height='300' fill='url(%23grad)'/%3E%3C/svg%3E`;
                
                return `
                  <div class="repo feature-highlight" onclick="viewProjectDetails('${project.id}')" style="cursor: pointer;">
                    <div class="repo-header">
                      ${project.image 
                        ? `<img src="${project.image}" alt="${escapeHtml(project.name)}" onerror="this.style.display='none'">`
                        : `<div class="repo-header-placeholder">
                            <i data-feather="folder"></i>
                            <h3><a href="${project.url || '#'}" target="_blank" rel="noopener"><i data-feather="github"></i> ${escapeHtml(project.name)}</a></h3>
                          </div>`
                      }
                      <div class="repo-header-overlay">
                        <h3><a href="${project.url || '#'}" target="_blank" rel="noopener"><i data-feather="github"></i> ${escapeHtml(project.name)}</a></h3>
                      </div>
                      <!-- Premium badge at top-left -->
                      ${isPremium ? '<div class="repo-premium-badge" style="position: absolute; top: 10px; left: 10px; z-index: 5; background: linear-gradient(135deg, #f59e0b, #d97706); color: white; padding: 6px 12px; border-radius: 20px; font-size: 0.75em; font-weight: 600; display: flex; align-items: center; gap: 4px;"><i data-feather="star" style="width: 12px; height: 12px;"></i> Premium</div>' : '<div class="repo-free-badge" style="position: absolute; top: 10px; left: 10px; z-index: 5; background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 6px 12px; border-radius: 20px; font-size: 0.75em; font-weight: 600; display: flex; align-items: center; gap: 4px;"><i data-feather="github" style="width: 12px; height: 12px;"></i> Free</div>'}
                      <!-- Language badge at top-right -->
                      ${project.language ? `<div class="repo-language-badge" style="position: absolute; top: 10px; right: 10px; left: auto; z-index: 5;"><span style="background: ${languageColor}; color: white; padding: 3px 10px; border-radius: 12px; font-size: 0.75em; font-weight: 500;">${escapeHtml(project.language)}</span></div>` : ''}
                      ${!isPremium && project.url ? `<button class="copy-btn" onclick="event.stopPropagation(); copyRepoUrl(event, '${project.url}')" title="Copy URL"><i data-feather="copy"></i></button>` : ''}
                    </div>
                    <div class="repo-body">
                      <p>${escapeHtml(descriptionText)}</p>
                      <div class="repo-stats">
                        ${isPremium && project.price ? `
                        <div class="repo-stat featured" style="background: #f59e0b; color: white;">
                          <i data-feather="tag"></i>
                          <span>$${project.price}</span>
                        </div>
                        ` : `
                        <div class="repo-stat featured">
                          <i data-feather="star"></i>
                          <span>Featured</span>
                        </div>
                        `}
                        <div class="repo-stat">
                          <i data-feather="git-branch"></i>
                          <span>${escapeHtml(project.status || 'Active')}</span>
                        </div>
                        ${project.language ? `<div class="repo-language" style="background: ${languageColor}">${project.language}</div>` : ''}
                      </div>
                      <div class="interaction-section">
                        <div class="comment-count-badge" id="projectCommentsCount_${project.id}" style="display: none;" title="Comments">
                          <i data-feather="message-circle"></i>
                          <span class="count">0</span>
                        </div>
                        <button class="interaction-btn magical" data-project-id="${project.id}" onclick="event.stopPropagation(); likeProject('${project.id}')" title="Like this project">
                          <i data-feather="heart"></i>
                          <span class="interaction-count like-counter" id="projectLikeCount_${project.id}">${likeCount}</span>
                        </button>
                        <div class="interaction-divider"></div>
                        <div class="repo-stat">
                          <i data-feather="eye"></i>
                          <span class="view-counter" id="projectViewCount_${project.id}">${formatNumber(viewCount)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                `;
              }).join('');
              
              // Render pagination
              if (adminPagination) {
                const totalPages = Math.ceil(adminProjects.length / projectsPerPage);
                if (totalPages > 1) {
                  adminPagination.innerHTML = '';
                  
                  // Previous button
                  if (currentAdminProjectPage > 1) {
                    const prevBtn = document.createElement('button');
                    prevBtn.className = 'page-btn nav-btn';
                    prevBtn.innerHTML = '<i data-feather="chevron-left"></i>';
                    prevBtn.onclick = () => {
                      currentAdminProjectPage--;
                      renderAdminProjectPage(currentAdminProjectPage);
                      renderAdminProjectPagination(currentAdminProjectPage);
                      window.scrollTo({ top: adminSection.offsetTop - 100, behavior: 'smooth' });
                    };
                    adminPagination.appendChild(prevBtn);
                  }
                  
                  for (let i = 1; i <= totalPages; i++) {
                    const btn = document.createElement('button');
                    btn.className = 'page-btn' + (i === currentAdminProjectPage ? ' active' : '');
                    btn.textContent = i;
                    btn.onclick = () => {
                      currentAdminProjectPage = i;
                      renderAdminProjectPage(i);
                      renderAdminProjectPagination(i);
                      window.scrollTo({ top: adminSection.offsetTop - 100, behavior: 'smooth' });
                    };
                    adminPagination.appendChild(btn);
                  }
                  
                  // Next button
                  if (currentAdminProjectPage < totalPages) {
                    const nextBtn = document.createElement('button');
                    nextBtn.className = 'page-btn nav-btn';
                    nextBtn.innerHTML = '<i data-feather="chevron-right"></i>';
                    nextBtn.onclick = () => {
                      currentAdminProjectPage++;
                      renderAdminProjectPage(currentAdminProjectPage);
                      renderAdminProjectPagination(currentAdminProjectPage);
                      window.scrollTo({ top: adminSection.offsetTop - 100, behavior: 'smooth' });
                    };
                    adminPagination.appendChild(nextBtn);
                  }
                } else {
                  adminPagination.innerHTML = '';
                }
              }

              feather.replace();

              // Setup real-time listeners for projects on current page
              pageProjects.forEach(project => {
                setupProjectLikeListener(project.id, `projectLikeCount_${project.id}`);
                setupProjectViewListener(project.id, `projectViewCount_${project.id}`);
                setupProjectCommentListener(project.id, `projectCommentsCount_${project.id}`);
              });
            }
            
            function renderAdminProjectPagination(activePage) {
              const projectsPerPage = 6;
              const totalPages = Math.ceil(adminProjects.length / projectsPerPage);
              const adminPagination = document.getElementById('adminProjectsPagination');
              if (!adminPagination || totalPages <= 1) return;
              
              adminPagination.innerHTML = '';
              
              // Previous button
              if (activePage > 1) {
                const prevBtn = document.createElement('button');
                prevBtn.className = 'page-btn nav-btn';
                prevBtn.innerHTML = '<i data-feather="chevron-left"></i>';
                prevBtn.onclick = () => {
                  renderAdminProjectPage(activePage - 1);
                  renderAdminProjectPagination(activePage - 1);
                  window.scrollTo({ top: adminSection.offsetTop - 100, behavior: 'smooth' });
                };
                adminPagination.appendChild(prevBtn);
              }
              
              for (let i = 1; i <= totalPages; i++) {
                const btn = document.createElement('button');
                btn.className = 'page-btn' + (i === activePage ? ' active' : '');
                btn.textContent = i;
                btn.onclick = () => {
                  renderAdminProjectPage(i);
                  renderAdminProjectPagination(i);
                  window.scrollTo({ top: adminSection.offsetTop - 100, behavior: 'smooth' });
                };
                adminPagination.appendChild(btn);
              }
              
              // Next button
              if (activePage < totalPages) {
                const nextBtn = document.createElement('button');
                nextBtn.className = 'page-btn nav-btn';
                nextBtn.innerHTML = '<i data-feather="chevron-right"></i>';
                nextBtn.onclick = () => {
                  renderAdminProjectPage(activePage + 1);
                  renderAdminProjectPagination(activePage + 1);
                  window.scrollTo({ top: adminSection.offsetTop - 100, behavior: 'smooth' });
                };
                adminPagination.appendChild(nextBtn);
              }
              
              feather.replace();
            }
            
            // Initial render
            renderAdminProjectPage(1);
            console.log(`Loaded ${adminProjects.length} admin projects`);
          }
        }
      } catch (error) {
        console.log('Projects not found or error loading:', error.message);
      }
    }
    
    // Load admin blog posts from Firestore
    async function loadAdminBlogPosts() {
      try {
        // First get all posts, then filter and sort in memory (avoids composite index requirement)
        const postsSnapshot = await db.collection('posts').get();

        const adminPosts = [];

        postsSnapshot.forEach(doc => {
          const data = doc.data();
          // Only include published posts
          if (data.status === 'published') {
            adminPosts.push({ id: doc.id, ...data });
          }
        });

        // Sort by creation date (newest first) in memory
        adminPosts.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
          const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
          return dateB - dateA;
        });

        // Fetch view and like counts from subcollections in parallel
        const countsPromises = adminPosts.map(async (post) => {
          try {
            // Get view count from subcollection
            const viewsSnapshot = await db.collection('posts').doc(post.id).collection('views').get();
            post.viewCount = viewsSnapshot.size;
            
            // Get like count from subcollection
            const likesSnapshot = await db.collection('posts').doc(post.id).collection('likes').get();
            post.likeCount = likesSnapshot.size;
          } catch (e) {
            // If subcollections don't exist yet, use 0
            post.viewCount = post.viewCount || 0;
            post.likeCount = post.likeCount || 0;
          }
        });

        await Promise.all(countsPromises);

        // Render admin blog posts if any exist
        if (adminPosts.length > 0) {
          const adminBlogSection = document.getElementById('adminBlogSection');
          const adminBlogContainer = document.getElementById('adminBlogPosts');
          const adminBlogPagination = document.getElementById('adminBlogPagination');

          if (adminBlogSection && adminBlogContainer) {
            adminBlogSection.style.display = 'block';

            // Pagination settings
            const postsPerPage = 6;
            let currentAdminBlogPage = 1;

            // Store posts globally for pagination
            window.adminBlogPosts = adminPosts;

            function renderAdminBlogPage(page) {
              const start = (page - 1) * postsPerPage;
              const end = start + postsPerPage;
              const pagePosts = adminPosts.slice(start, end);

              // Handle date parsing for both ISO strings and Firestore Timestamps
              const parseDate = (dateValue) => {
                if (!dateValue) return null;
                if (typeof dateValue === 'string') {
                  return new Date(dateValue);
                }
                if (dateValue.seconds) {
                  return new Date(dateValue.seconds * 1000);
                }
                return null;
              };

              adminBlogContainer.innerHTML = pagePosts.map(post => {
                const dateObj = parseDate(post.createdAt);
                const pubDate = dateObj 
                  ? dateObj.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
                  : 'Date not available';
                const pubTime = dateObj
                  ? dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
                  : '';
                
                // Get primary category
                const primaryCategory = post.tags && Array.isArray(post.tags) && post.tags.length > 0 
                  ? post.tags[0]
                  : 'General';

                // Get categories/tags
                const tags = post.tags && Array.isArray(post.tags) && post.tags.length > 0 
                  ? post.tags.slice(0, 2).map(tag => `<span class="post-category">${tag}</span>`).join('')
                  : '<span class="post-category">General</span>';

                // Get view count and like count
                const viewCount = post.viewCount || 0;
                const likeCount = post.likeCount || 0;
                
                const fallbackImage = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'%3E%3Cdefs%3E%3ClinearGradient id='grad' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%236366f1;stop-opacity:1' /%3E%3Cstop offset='100%25' style='stop-color:%2310b981;stop-opacity:1' /%3E%3C/defs%3E%3Crect width='400' height='300' fill='url(%23grad)'/%3E%3C/svg%3E`;

                // Clean content for excerpt
                let excerpt = post.excerpt || '';
                if (!excerpt && post.content) {
                  excerpt = post.content.replace(/<[^>]*>/g, '').substring(0, 180);
                }
                if (!excerpt) excerpt = 'No description available';

                return `
                  <div class="blog-item feature-highlight" onclick="viewPostDetails('${post.id}')" style="cursor: pointer;">
                    <div class="blog-item-image-wrapper">
                      <img src="${post.image || fallbackImage}" alt="${escapeHtml(post.title)}" class="blog-image"
                           onerror="this.src='${fallbackImage}'"
                           loading="lazy">
                      <span class="blog-item-badge">${escapeHtml(primaryCategory)}</span>
                    </div>
                    <div class="blog-content">
                      <div class="blog-meta-top">
                        <div class="blog-date-time">
                          <i data-feather="calendar"></i>
                          <span>${pubDate}</span>
                          ${pubTime ? `<span class="time-separator">•</span><span>${pubTime}</span>` : ''}
                        </div>
                        <div class="blog-categories">
                          ${tags}
                        </div>
                      </div>
                      <div class="blog-text">
                        <h3>${escapeHtml(post.title || 'Untitled')}</h3>
                        <p>${escapeHtml(excerpt)}...</p>
                      </div>
                      <div class="blog-meta">
                        <div class="interaction-section">
                          <div class="comment-count-badge" id="blogCommentsCount_${post.id}" style="display: none;" title="Comments">
                            <i data-feather="message-circle"></i>
                            <span class="count">0</span>
                          </div>
                          <button class="interaction-btn magical" data-post-id="${post.id}" onclick="event.stopPropagation(); likePost('${post.id}')" title="Like this post">
                            <i data-feather="heart"></i>
                            <span class="interaction-count like-counter" id="postLikeCount_${post.id}">${likeCount}</span>
                          </button>
                          <div class="interaction-divider"></div>
                          <div class="blog-meta-item">
                            <i data-feather="eye"></i>
                            <span class="view-counter" id="postViewCount_${post.id}">${formatNumber(viewCount)}</span>
                          </div>
                          <div class="interaction-divider"></div>
                          <div class="blog-meta-item author">
                            <i data-feather="user"></i>
                            <span>Admin</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                `;
              }).join('');

              // Render pagination
              if (adminBlogPagination) {
                const totalPages = Math.ceil(adminPosts.length / postsPerPage);
                if (totalPages > 1) {
                  adminBlogPagination.innerHTML = '';
                  
                  // Previous button
                  if (currentAdminBlogPage > 1) {
                    const prevBtn = document.createElement('button');
                    prevBtn.className = 'page-btn nav-btn';
                    prevBtn.innerHTML = '<i data-feather="chevron-left"></i>';
                    prevBtn.onclick = () => {
                      currentAdminBlogPage--;
                      renderAdminBlogPage(currentAdminBlogPage);
                      renderAdminBlogPagination(currentAdminBlogPage);
                      window.scrollTo({ top: adminBlogSection.offsetTop - 100, behavior: 'smooth' });
                    };
                    adminBlogPagination.appendChild(prevBtn);
                  }
                  
                  for (let i = 1; i <= totalPages; i++) {
                    const btn = document.createElement('button');
                    btn.className = 'page-btn' + (i === page ? ' active' : '');
                    btn.textContent = i;
                    btn.onclick = () => {
                      currentAdminBlogPage = i;
                      renderAdminBlogPage(i);
                      renderAdminBlogPagination(i);
                      window.scrollTo({ top: adminBlogSection.offsetTop - 100, behavior: 'smooth' });
                    };
                    adminBlogPagination.appendChild(btn);
                  }
                  
                  // Next button
                  if (currentAdminBlogPage < totalPages) {
                    const nextBtn = document.createElement('button');
                    nextBtn.className = 'page-btn nav-btn';
                    nextBtn.innerHTML = '<i data-feather="chevron-right"></i>';
                    nextBtn.onclick = () => {
                      currentAdminBlogPage++;
                      renderAdminBlogPage(currentAdminBlogPage);
                      renderAdminBlogPagination(currentAdminBlogPage);
                      window.scrollTo({ top: adminBlogSection.offsetTop - 100, behavior: 'smooth' });
                    };
                    adminBlogPagination.appendChild(nextBtn);
                  }
                } else {
                  adminBlogPagination.innerHTML = '';
                }
              }

              feather.replace();

              // Setup real-time listeners for posts on current page
              pagePosts.forEach(post => {
                setupPostLikeListener(post.id, `postLikeCount_${post.id}`);
                setupPostViewListener(post.id, `postViewCount_${post.id}`);
                setupPostCommentListener(post.id, `blogCommentsCount_${post.id}`);
              });

              // Update achievements with blog posts count
              const publishedPosts = adminPosts.filter(p => p.status === 'published').length;
              animateCounter(document.getElementById('blogCount'), publishedPosts);
            }

            function renderAdminBlogPagination(activePage) {
              const postsPerPage = 6;
              const totalPages = Math.ceil(adminPosts.length / postsPerPage);
              const adminBlogPagination = document.getElementById('adminBlogPagination');
              if (!adminBlogPagination || totalPages <= 1) return;

              adminBlogPagination.innerHTML = '';
              
              // Previous button
              if (activePage > 1) {
                const prevBtn = document.createElement('button');
                prevBtn.className = 'page-btn nav-btn';
                prevBtn.innerHTML = '<i data-feather="chevron-left"></i>';
                prevBtn.onclick = () => {
                  renderAdminBlogPage(activePage - 1);
                  renderAdminBlogPagination(activePage - 1);
                  window.scrollTo({ top: adminBlogSection.offsetTop - 100, behavior: 'smooth' });
                };
                adminBlogPagination.appendChild(prevBtn);
              }
              
              for (let i = 1; i <= totalPages; i++) {
                const btn = document.createElement('button');
                btn.className = 'page-btn' + (i === activePage ? ' active' : '');
                btn.textContent = i;
                btn.onclick = () => {
                  renderAdminBlogPage(i);
                  renderAdminBlogPagination(i);
                  window.scrollTo({ top: adminBlogSection.offsetTop - 100, behavior: 'smooth' });
                };
                adminBlogPagination.appendChild(btn);
              }
              
              // Next button
              if (activePage < totalPages) {
                const nextBtn = document.createElement('button');
                nextBtn.className = 'page-btn nav-btn';
                nextBtn.innerHTML = '<i data-feather="chevron-right"></i>';
                nextBtn.onclick = () => {
                  renderAdminBlogPage(activePage + 1);
                  renderAdminBlogPagination(activePage + 1);
                  window.scrollTo({ top: adminBlogSection.offsetTop - 100, behavior: 'smooth' });
                };
                adminBlogPagination.appendChild(nextBtn);
              }
              
              feather.replace();
            }

            // Initial render
            renderAdminBlogPage(1);
            console.log(`Loaded ${adminPosts.length} admin blog posts`);
          }
        }
      } catch (error) {
        console.error('Error loading admin posts:', error);
      }
    }
    
    // View blog post details in modal
    function viewPostDetails(postId) {
      // Find the post in the global array
      const post = window.adminBlogPosts.find(p => p.id === postId);
      
      if (!post) {
        console.error('Post not found:', postId);
        return;
      }
      
      // Parse date
      const parseDate = (dateValue) => {
        if (!dateValue) return null;
        if (typeof dateValue === 'string') {
          return new Date(dateValue);
        }
        if (dateValue.seconds) {
          return new Date(dateValue.seconds * 1000);
        }
        return null;
      };
      
      const dateObj = parseDate(post.createdAt);
      const pubDate = dateObj 
        ? dateObj.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
        : 'Date not available';
      const pubTime = dateObj
        ? dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
        : '';
      
      // Get categories/tags
      const tags = post.tags && Array.isArray(post.tags) && post.tags.length > 0 
        ? post.tags.map(tag => `<span class="post-category">${tag}</span>`).join('')
        : '<span class="post-category">General</span>';
      
      // Get content - prefer full content, fallback to excerpt
      let content = post.content || '';
      if (!content && post.excerpt) {
        content = `<p>${post.excerpt}</p>`;
      }
      if (!content) {
        content = '<p>No content available for this post.</p>';
      }
      
      // Fallback image
      const fallbackImage = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 400'%3E%3Cdefs%3E%3ClinearGradient id='grad' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%236366f1;stop-opacity:1' /%3E%3Cstop offset='100%25' style='stop-color:%2310b981;stop-opacity:1' /%3E%3C/defs%3E%3Crect width='800' height='400' fill='url(%23grad)'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-size='48' fill='white' font-family='Arial'%3E${escapeHtml(post.title || 'Blog Post')}%3C/text%3E%3C/svg%3E`;
      
      const imageUrl = post.image || fallbackImage;
      
      // Build modal content
      const modalContent = `
        <div class="blog-post-header">
          <img src="${imageUrl}" alt="${escapeHtml(post.title || 'Blog Post')}" class="blog-post-image"
               onerror="this.src='${fallbackImage}'">
          <div class="blog-post-header-overlay">
            <h1 class="blog-post-title">${escapeHtml(post.title || 'Untitled')}</h1>
          </div>
        </div>
        <div class="blog-post-body">
          <div class="blog-post-meta">
            <div class="blog-post-meta-item">
              <i data-feather="calendar"></i>
              <span>${pubDate}</span>
            </div>
            ${pubTime ? `
            <div class="blog-post-meta-item">
              <i data-feather="clock"></i>
              <span>${pubTime}</span>
            </div>
            ` : ''}
            <div class="blog-post-categories">
              ${tags}
            </div>
          </div>
          <div class="interaction-section">
            <button class="interaction-btn magical" data-post-id="${post.id}" onclick="likePost('${post.id}')" title="Like this post">
              <i data-feather="heart"></i>
              <span class="interaction-count like-counter" id="postLikeCount">${post.likeCount || 0}</span>
            </button>
            <div class="interaction-divider"></div>
            <div class="blog-post-meta-item">
              <i data-feather="eye"></i>
              <span class="view-counter" id="postViewCount">${post.viewCount || 0} views</span>
            </div>
          </div>
          <div class="blog-post-text">
            ${content}
          </div>
        </div>
      `;
      
      // Track view
      trackPostView(postId);
      
      // Setup real-time listeners for this post
      setupPostLikeListener(postId, 'postLikeCount');
      setupPostViewListener(postId, 'postViewCount');
      
      // Insert content and show modal
      document.getElementById('blogPostContent').innerHTML = modalContent;
      document.getElementById('blogPostModal').classList.add('active');
      
      // Initialize comments for this blog post
      const commentsSection = document.getElementById('blogCommentsSection');
      if (commentsSection && window.commentsSystem) {
        commentsSection.style.display = 'block';
        window.commentsSystem.initialize(postId, 'blog');
      }
      
      feather.replace();
    }
    
    // Close blog post modal
    function closePostModal() {
      document.getElementById('blogPostModal').classList.remove('active');
    }
    
    // View project details in modal
    function viewProjectDetails(projectId) {
      // Find the project in the global array
      const project = window.adminProjects.find(p => p.id === projectId);
      
      if (!project) {
        console.error('Project not found:', projectId);
        return;
      }
      
      const languageColor = getLanguageColor(project.language);
      const viewCount = project.viewCount || 0;
      const likeCount = project.likeCount || 0;
      
      // Fallback image
      const fallbackImage = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 400'%3E%3Cdefs%3E%3ClinearGradient id='grad' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%236366f1;stop-opacity:1' /%3E%3Cstop offset='100%25' style='stop-color:%2310b981;stop-opacity:1' /%3E%3C/defs%3E%3Crect width='800' height='400' fill='url(%23grad)'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-size='48' fill='white' font-family='Arial'%3E${escapeHtml(project.name || 'Project')}%3C/text%3E%3C/svg%3E`;
      
      const imageUrl = project.image || fallbackImage;
      
      // Check if project is premium
      const isPremium = project.projectType === 'premium';
      
      // Build premium info section
      const premiumInfoHtml = isPremium ? `
        <div class="blog-post-meta premium-meta" style="background: linear-gradient(135deg, #fef3c7, #fde68a); padding: 15px; border-radius: 8px; margin-bottom: 20px;">
          <div style="display: flex; align-items: center; gap: 15px; flex-wrap: wrap;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <i data-feather="tag" style="color: #f59e0b;"></i>
              <span style="font-size: 1.5em; font-weight: bold; color: #f59e0b;">$${project.price || '0'}</span>
              ${project.discountPrice ? `<span style="text-decoration: line-through; color: #999; font-size: 1em;">$${project.discountPrice}</span>` : ''}
            </div>
            ${project.currency ? `<span style="color: #666;">${project.currency}</span>` : ''}
          </div>
          ${project.paymentMethods && project.paymentMethods.length > 0 ? `
          <div style="margin-top: 10px; display: flex; gap: 10px; flex-wrap: wrap; align-items: center;">
            <span style="font-size: 0.9em; color: #666;">Payment:</span>
            ${project.paymentMethods.map(method => {
              const methodLabels = { mobile: 'Mobile', paypal: 'PayPal', wise: 'Wise', crypto: 'Crypto', others: 'Others' };
              return `<span class="repo-language-badge" style="background: #fff; color: #374151; font-size: 0.8em;">${methodLabels[method] || method}</span>`;
            }).join('')}
          </div>
          ` : ''}
          ${project.paymentInfo ? `
          <div style="margin-top: 8px; font-size: 0.9em; color: #666;">
            <span>Payment Info: </span>
            <code style="background: #fff; padding: 2px 6px; border-radius: 4px; font-size: 0.85em;">${escapeHtml(project.paymentInfo)}</code>
          </div>
          ` : ''}
          ${project.cryptoAddress ? `
          <div style="margin-top: 8px; font-size: 0.9em; color: #666;">
            <span>Crypto: </span>
            <code style="background: #fff; padding: 2px 6px; border-radius: 4px; font-size: 0.85em; word-break: break-all;">${escapeHtml(project.cryptoAddress)}</code>
          </div>
          ` : ''}
        </div>
      ` : '';
      
      // Build purchase button for premium
      const purchaseButtonHtml = isPremium && project.purchaseUrl ? `
        <a href="${project.purchaseUrl}" target="_blank" rel="noopener" class="interaction-btn magical" style="background: linear-gradient(135deg, #f59e0b, #d97706); color: white; text-decoration: none; display: inline-flex; align-items: center; gap: 8px; padding: 12px 24px; border-radius: 8px; font-weight: 600; margin-bottom: 20px;">
          <i data-feather="shopping-cart"></i>
          <span>Buy Now</span>
        </a>
      ` : '';
      
      // Build modal content
      const modalContent = `
        <div class="blog-post-header">
          <img src="${imageUrl}" alt="${escapeHtml(project.name)}" class="blog-post-image"
               onerror="this.src='${fallbackImage}'">
          ${isPremium ? `
          <div class="premium-badge" style="position: absolute; top: 15px; left: 15px; z-index: 10; background: linear-gradient(135deg, #f59e0b, #d97706); color: white; padding: 6px 14px; border-radius: 20px; font-size: 0.85em; font-weight: 600; display: flex; align-items: center; gap: 6px;">
            <i data-feather="star" style="width: 14px; height: 14px;"></i>
            <span>Premium</span>
          </div>
          ` : `
          <div class="free-badge" style="position: absolute; top: 15px; left: 15px; z-index: 10; background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 6px 14px; border-radius: 20px; font-size: 0.85em; font-weight: 600; display: flex; align-items: center; gap: 6px;">
            <i data-feather="github" style="width: 14px; height: 14px;"></i>
            <span>Free / Open Source</span>
          </div>
          `}
          ${project.language ? `
          <div class="language-badge" style="position: absolute; top: 15px; right: 15px; z-index: 10; background: ${languageColor}; color: white; padding: 6px 14px; border-radius: 20px; font-size: 0.85em; font-weight: 500;">
            <span>${escapeHtml(project.language)}</span>
          </div>
          ` : ''}
          <div class="blog-post-header-overlay">
            <h1 class="blog-post-title">${escapeHtml(project.name || 'Untitled Project')}</h1>
          </div>
        </div>
        <div class="blog-post-body">
          <div class="blog-post-meta">
            <div class="blog-post-meta-item">
              <i data-feather="git-branch"></i>
              <span>${escapeHtml(project.status || 'Active')}</span>
            </div>
            <div class="blog-post-meta-item">
              <i data-feather="eye"></i>
              <span>${formatNumber(viewCount)} views</span>
            </div>
          </div>
          <div class="interaction-section">
            <button class="interaction-btn magical" data-project-id="${project.id}" onclick="likeProject('${project.id}')" title="Like this project">
              <i data-feather="heart"></i>
              <span class="interaction-count like-counter" id="projectLikeCountModal_${project.id}">${likeCount}</span>
            </button>
            <div class="interaction-divider"></div>
            ${isPremium ? `
            ${project.purchaseUrl ? `
            <a href="${project.purchaseUrl}" target="_blank" rel="noopener" class="interaction-btn magical" style="background: linear-gradient(135deg, #f59e0b, #d97706); color: white; text-decoration: none; display: inline-flex; align-items: center; gap: 8px; padding: 10px 20px; border-radius: 8px; font-weight: 600;" title="Purchase Now">
              <i data-feather="shopping-cart"></i>
              <span>Buy Now</span>
            </a>
            ` : ''}
            ${project.docsUrl ? `
            <a href="${project.docsUrl}" target="_blank" rel="noopener" class="interaction-btn magical" title="View Documentation">
              <i data-feather="book-open"></i>
            </a>
            ` : ''}
            ${project.demoUrl ? `
            <a href="${project.demoUrl}" target="_blank" rel="noopener" class="interaction-btn magical" title="View Live Demo">
              <i data-feather="external-link"></i>
            </a>
            ` : ''}
            ` : `
            ${project.url || project.html_url ? `
            <a href="${project.url || project.html_url}" target="_blank" rel="noopener" class="interaction-btn magical" title="View Source Code">
              <i data-feather="github"></i>
            </a>
            ` : ''}
            ${project.demoUrl ? `
            <a href="${project.demoUrl}" target="_blank" rel="noopener" class="interaction-btn magical" title="View Live Demo">
              <i data-feather="external-link"></i>
            </a>
            ` : ''}
            `}
          </div>
          
          ${premiumInfoHtml}
          
          <div class="blog-post-text">
            ${project.description || 'No description available.'}
            ${project.features ? `
            <h3>Key Features</h3>
            <ul>
              ${project.features.map(f => `<li>${escapeHtml(f)}</li>`).join('')}
            </ul>
            ` : ''}
          </div>
          
          ${isPremium ? `
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid var(--bg-border);">
            <h3><i data-feather="help-circle"></i> Support & Documentation</h3>
            ${project.supportEmail ? `
            <p><strong>Support Email:</strong> <a href="mailto:${escapeHtml(project.supportEmail)}">${escapeHtml(project.supportEmail)}</a></p>
            ` : ''}
            ${project.supportUrl ? `
            <p><strong>Support URL:</strong> <a href="${project.supportUrl}" target="_blank">${escapeHtml(project.supportUrl)}</a></p>
            ` : ''}
            ${project.docsUrl ? `
            <p><strong>Documentation:</strong> <a href="${project.docsUrl}" target="_blank">${escapeHtml(project.docsUrl)}</a></p>
            ` : ''}
            ${project.version ? `
            <p><strong>Version:</strong> ${escapeHtml(project.version)}</p>
            ` : ''}
            ${project.releaseDate ? `
            <p><strong>Release Date:</strong> ${new Date(project.releaseDate).toLocaleDateString()}</p>
            ` : ''}
          </div>
          ` : ''}
        </div>
      `;

      document.getElementById('projectDetailContent').innerHTML = modalContent;
      document.getElementById('projectDetailModal').classList.add('active');
      feather.replace();

      // Initialize comments for this project
      const projectCommentsSection = document.getElementById('projectCommentsSection');
      if (projectCommentsSection && window.commentsSystem) {
        projectCommentsSection.style.display = 'block';
        window.commentsSystem.initialize(projectId, 'project');
      }
    }
    
    // Close project modal
    function closeProjectModal() {
      document.getElementById('projectDetailModal').classList.remove('active');
    }
    
    // Escape HTML to prevent XSS
    function escapeHtml(text) {
      if (!text) return '';
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }
    
    // Format numbers (e.g., 1000 -> 1K)
    function formatNumber(num) {
      if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
      }
      if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
      }
      return num.toString();
    }
    
    // Track post view using subcollection (public access)
    async function trackPostView(postId) {
      if (typeof db === 'undefined') return;
      
      // Check if already viewed in this session
      const viewedPosts = JSON.parse(sessionStorage.getItem('viewedPosts') || '[]');
      if (viewedPosts.includes(postId)) return; // Skip duplicate views
      
      try {
        // Add a view document to the public subcollection
        const viewsRef = db.collection('posts').doc(postId).collection('views');
        await viewsRef.add({
          timestamp: Date.now(),
          userAgent: navigator.userAgent,
          visitorId: getVisitorId()
        });
        
        // Mark as viewed in session storage
        viewedPosts.push(postId);
        sessionStorage.setItem('viewedPosts', JSON.stringify(viewedPosts));
        
        // Update local view count
        if (window.adminBlogPosts) {
          const post = window.adminBlogPosts.find(p => p.id === postId);
          if (post) {
            post.viewCount = (post.viewCount || 0) + 1;
            // Trigger view counter animation
            animateCounterUpdate('postViewCount', post.viewCount);
          }
        }
      } catch (error) {
        // Silently handle errors - view counting is non-critical
        console.log('View tracking skipped');
      }
    }
    
    // Get or generate unique visitor ID
    function getVisitorId() {
      let visitorId = localStorage.getItem('visitorId');
      if (!visitorId) {
        visitorId = 'v_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('visitorId', visitorId);
      }
      return visitorId;
    }
    
    // Create magical particle effect
    function createMagicalParticles(button, count = 12) {
      const rect = button.getBoundingClientRect();
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const colors = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];
      const particles = [];
      
      for (let i = 0; i < count; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        const angle = (i / count) * 360;
        const distance = 50 + Math.random() * 50;
        const tx = Math.cos(angle * Math.PI / 180) * distance;
        const ty = Math.sin(angle * Math.PI / 180) * distance;
        
        particle.style.cssText = `
          position: absolute;
          left: ${centerX}px;
          top: ${centerY}px;
          width: ${6 + Math.random() * 6}px;
          height: ${6 + Math.random() * 6}px;
          background: ${colors[Math.floor(Math.random() * colors.length)]};
          border-radius: 50%;
          --tx: ${tx}px;
          --ty: ${ty}px;
          animation: particleBurst 0.8s ease-out forwards;
        `;
        
        button.appendChild(particle);
        particles.push(particle);
      }
      
      // Create floating hearts
      for (let i = 0; i < 5; i++) {
        const heart = document.createElement('div');
        heart.className = 'particle particle-heart';
        heart.innerHTML = ['❤️', '💖', '✨', '⭐', '💫'][i];
        heart.style.cssText = `
          position: absolute;
          left: ${centerX + (Math.random() - 0.5) * 40}px;
          top: ${centerY + (Math.random() - 0.5) * 40}px;
          font-size: ${16 + Math.random() * 12}px;
          animation: floatHeart ${1 + Math.random()}s ease-out forwards;
          animation-delay: ${i * 0.1}s;
        `;
        
        button.appendChild(heart);
        particles.push(heart);
      }
      
      // Create magical burst effect
      const burst = document.createElement('div');
      burst.className = 'magical-burst';
      button.appendChild(burst);
      particles.push(burst);
      
      // Remove particles after animation
      setTimeout(() => {
        particles.forEach(p => p.remove());
      }, 1500);
    }
    
    // Animate counter update with pop effect
    function animateCounterUpdate(elementId, newValue) {
      const element = document.getElementById(elementId);
      if (!element) return;
      
      element.textContent = newValue.toLocaleString();
      element.classList.add('updating');
      
      setTimeout(() => {
        element.classList.remove('updating');
      }, 300);
    }
    
    // Setup real-time listener for post likes
    function setupPostLikeListener(postId, elementId) {
      if (typeof db === 'undefined') return;
      
      const likesRef = db.collection('posts').doc(postId).collection('likes');
      
      // Listen for real-time updates
      likesRef.onSnapshot(snapshot => {
        const count = snapshot.size;
        const element = document.getElementById(elementId);
        if (element) {
          const currentCount = parseInt(element.textContent.replace(/,/g, '')) || 0;
          if (currentCount !== count) {
            animateCounterUpdate(elementId, count);
          }
        }
      }, error => {
        console.log('Real-time like listener error:', error);
      });
    }
    
    // Setup real-time listener for post views
    function setupPostViewListener(postId, elementId) {
      if (typeof db === 'undefined') return;
      
      const viewsRef = db.collection('posts').doc(postId).collection('views');
      
      viewsRef.onSnapshot(snapshot => {
        const count = snapshot.size;
        const element = document.getElementById(elementId);
        if (element) {
          const currentCount = parseInt(element.textContent.replace(/,/g, '')) || 0;
          if (currentCount !== count) {
            animateCounterUpdate(elementId, count);
          }
        }
      }, error => {
        console.log('Real-time view listener error:', error);
      });
    }

    // Setup real-time listener for post comments
    function setupPostCommentListener(postId, badgeId) {
      if (typeof db === 'undefined') return;

      const commentsRef = db.collection('comments')
        .where('targetId', '==', postId)
        .where('targetType', '==', 'blog')
        .where('isVisible', '==', true);

      commentsRef.onSnapshot(snapshot => {
        // Count both parent comments and replies
        let count = 0;
        snapshot.forEach(doc => {
          const data = doc.data();
          count++; // Count the parent comment
          // Note: We can't easily count replies here without additional queries
          // For simplicity, we'll just count visible comments
        });

        // Also need to count replies separately
        const parentIds = [];
        snapshot.forEach(doc => {
          if (!doc.data().parentId) {
            parentIds.push(doc.id);
          }
        });

        const badge = document.getElementById(badgeId);
        if (badge) {
          const countSpan = badge.querySelector('.count');
          if (countSpan) {
            const totalCount = snapshot.size;
            countSpan.textContent = totalCount;
            badge.style.display = totalCount > 0 ? 'inline-flex' : 'none';
          }
        }
      }, error => {
        console.log('Real-time comment listener error:', error);
      });
    }

    // Setup real-time listener for project comments
    function setupProjectCommentListener(projectId, badgeId) {
      if (typeof db === 'undefined') return;

      const commentsRef = db.collection('comments')
        .where('targetId', '==', projectId)
        .where('targetType', '==', 'project')
        .where('isVisible', '==', true);

      commentsRef.onSnapshot(snapshot => {
        const totalCount = snapshot.size;
        const badge = document.getElementById(badgeId);
        if (badge) {
          const countSpan = badge.querySelector('.count');
          if (countSpan) {
            countSpan.textContent = totalCount;
            badge.style.display = totalCount > 0 ? 'inline-flex' : 'none';
          }
        }
      }, error => {
        console.log('Real-time project comment listener error:', error);
      });
    }

    // Like a post using subcollection (public access)
    async function likePost(postId) {
      if (typeof db === 'undefined') {
        showNotification('Unable to like post. Please try again.', 'error');
        return;
      }
      
      try {
        // Check if already liked in this session
        const likedPosts = JSON.parse(localStorage.getItem('likedPosts') || '[]');
        if (likedPosts.includes(postId)) {
          showNotification('You have already liked this post!', 'error');
          return;
        }
        
        // Add a like document to the public subcollection
        const likesRef = db.collection('posts').doc(postId).collection('likes');
        await likesRef.add({
          timestamp: Date.now(),
          userId: 'anonymous',
          visitorId: getVisitorId()
        });
        
        // Mark as liked in local storage
        likedPosts.push(postId);
        localStorage.setItem('likedPosts', JSON.stringify(likedPosts));
        
        // Trigger magical particle effect
        const likeBtn = document.querySelector('.interaction-btn[data-post-id="' + postId + '"]');
        if (likeBtn) {
          createMagicalParticles(likeBtn);
          likeBtn.classList.add('liked');
        }
        
        // Update local like count
        if (window.adminBlogPosts) {
          const post = window.adminBlogPosts.find(p => p.id === postId);
          if (post) {
            post.likeCount = (post.likeCount || 0) + 1;
          }
        }
        
        // Update UI with animation
        const likeCountEl = document.getElementById('postLikeCount');
        if (likeCountEl) {
          const currentCount = parseInt(likeCountEl.textContent) || 0;
          animateCounterUpdate('postLikeCount', currentCount + 1);
        }
        
        showNotification('Post liked successfully! ✨', 'success');
        feather.replace();
      } catch (error) {
        console.error('Error liking post:', error);
        showNotification('点赞失败，请重试', 'error');
      }
    }
    
    // Track project view using subcollection (public access)
    async function trackProjectView(projectId) {
      if (typeof db === 'undefined') return;
      
      // Check if already viewed in this session
      const viewedProjects = JSON.parse(sessionStorage.getItem('viewedProjects') || '[]');
      if (viewedProjects.includes(projectId)) return; // Skip duplicate views
      
      try {
        // Add a view document to the public subcollection
        const viewsRef = db.collection('projects').doc(projectId).collection('views');
        await viewsRef.add({
          timestamp: Date.now(),
          userAgent: navigator.userAgent,
          visitorId: getVisitorId()
        });
        
        // Mark as viewed in session storage
        viewedProjects.push(projectId);
        sessionStorage.setItem('viewedProjects', JSON.stringify(viewedProjects));
        
        // Update local view count
        if (window.adminProjects) {
          const project = window.adminProjects.find(p => p.id === projectId);
          if (project) {
            project.viewCount = (project.viewCount || 0) + 1;
            // Trigger view counter animation
            animateCounterUpdate('projectViewCount', project.viewCount);
          }
        }
      } catch (error) {
        // Silently handle errors - view counting is non-critical
        console.log('View tracking skipped');
      }
    }
    
    // Setup real-time listener for project likes
    function setupProjectLikeListener(projectId, elementId) {
      if (typeof db === 'undefined') return;
      
      const likesRef = db.collection('projects').doc(projectId).collection('likes');
      
      likesRef.onSnapshot(snapshot => {
        const count = snapshot.size;
        const element = document.getElementById(elementId);
        if (element) {
          const currentCount = parseInt(element.textContent.replace(/,/g, '')) || 0;
          if (currentCount !== count) {
            animateCounterUpdate(elementId, count);
          }
        }
      }, error => {
        console.log('Real-time project like listener error:', error);
      });
    }
    
    // Setup real-time listener for project views
    function setupProjectViewListener(projectId, elementId) {
      if (typeof db === 'undefined') return;
      
      const viewsRef = db.collection('projects').doc(projectId).collection('views');
      
      viewsRef.onSnapshot(snapshot => {
        const count = snapshot.size;
        const element = document.getElementById(elementId);
        if (element) {
          const currentCount = parseInt(element.textContent.replace(/,/g, '')) || 0;
          if (currentCount !== count) {
            animateCounterUpdate(elementId, count);
          }
        }
      }, error => {
        console.log('Real-time project view listener error:', error);
      });
    }
    
    // Like a project using subcollection (public access)
    async function likeProject(projectId) {
      if (typeof db === 'undefined') {
        showNotification('Unable to like project. Please try again.', 'error');
        return;
      }
      
      try {
        // Check if already liked in this session
        const likedProjects = JSON.parse(localStorage.getItem('likedProjects') || '[]');
        if (likedProjects.includes(projectId)) {
          showNotification('You have already liked this project!', 'error');
          return;
        }
        
        // Add a like document to the public subcollection
        const likesRef = db.collection('projects').doc(projectId).collection('likes');
        await likesRef.add({
          timestamp: Date.now(),
          userId: 'anonymous',
          visitorId: getVisitorId()
        });
        
        // Mark as liked in local storage
        likedProjects.push(projectId);
        localStorage.setItem('likedProjects', JSON.stringify(likedProjects));
        
        // Trigger magical particle effect
        const likeBtn = document.querySelector('.interaction-btn[data-project-id="' + projectId + '"]');
        if (likeBtn) {
          createMagicalParticles(likeBtn);
          likeBtn.classList.add('liked');
        }
        
        // Update local like count
        if (window.adminProjects) {
          const project = window.adminProjects.find(p => p.id === projectId);
          if (project) {
            project.likeCount = (project.likeCount || 0) + 1;
          }
        }
        
        // Update UI with animation
        const likeCountEl = document.getElementById('projectLikeCount');
        if (likeCountEl) {
          const currentCount = parseInt(likeCountEl.textContent) || 0;
          animateCounterUpdate('projectLikeCount', currentCount + 1);
        }
        
        showNotification('Post liked successfully! ✨', 'success');
        feather.replace();
      } catch (error) {
        console.error('Error liking project:', error);
        showNotification('点赞失败，请重试', 'error');
      }
    }


    
    // Export support functions to window for global access
    if (typeof window.loadConversations === 'undefined') window.loadConversations = loadConversations;
  