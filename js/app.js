//Bugsfree github
// Typewriter effect for hero title - Continuous/Loop
    const heroText = "Bugsfree Open Source Projects";
    const heroTitle = document.getElementById('heroTitle');
    let charIndex = 0;
    let isDeleting = false;

    function typeWriter() {
      const currentText = heroText.substring(0, charIndex);
      heroTitle.textContent = currentText;

      if (!isDeleting && charIndex < heroText.length) {
        // Typing forward
        charIndex++;
        setTimeout(typeWriter, 100);
      } else if (!isDeleting && charIndex === heroText.length) {
        // Pause at end before deleting
        isDeleting = true;
        setTimeout(typeWriter, 2000);
      } else if (isDeleting && charIndex > 0) {
        // Deleting backward
        charIndex--;
        setTimeout(typeWriter, 50);
      } else if (isDeleting && charIndex === 0) {
        // Pause at start before typing again
        isDeleting = false;
        setTimeout(typeWriter, 500);
      }
    }

    // Start typewriter and gradient animation
    setTimeout(() => {
      heroTitle.classList.add('typing');
      typeWriter();
    }, 300);

    // Theme
    const themeToggle = document.getElementById('themeToggle');
    const isDark = localStorage.getItem('theme') === 'dark' || (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (isDark) { document.body.classList.add('dark'); themeToggle.classList.add('active'); }
    themeToggle.addEventListener('click', () => {
      document.body.classList.toggle('dark');
      themeToggle.classList.toggle('active');
      localStorage.setItem('theme', document.body.classList.contains('dark') ? 'dark' : 'light');
    });

    // Icons
    feather.replace();
    document.getElementById('year').textContent = new Date().getFullYear();

    // Visitor Counter
    fetch('https://api.countapi.xyz/hit/bugsfree-portfolio/visits')
      .then(r => r.json())
      .then(d => document.getElementById('visitors').textContent = d.value.toLocaleString())
      .catch(() => document.getElementById('visitors').textContent = '—');

    // Contact Modal
    document.getElementById('contactBtn').onclick = () => document.getElementById('contactModal').classList.add('active');
    document.getElementById('closeModal').onclick = () => document.getElementById('contactModal').classList.remove('active');
    document.getElementById('contactModal').onclick = (e) => {
      if (e.target.id === 'contactModal') document.getElementById('contactModal').classList.remove('active');
    };

    document.getElementById('contactForm').onsubmit = (e) => {
      e.preventDefault();
      alert('Message sent! (This is a demo - integrate with your email service)');
      document.getElementById('contactModal').classList.remove('active');
    };

    // Resume Download
    document.getElementById('resumeBtn').onclick = () => {
      const link = document.createElement('a');
      link.href = 'https://bugsfreeweb.blogspot.com/resume.pdf';
      link.download = 'Bugsfree_Resume.pdf';
      link.click();
    };

    // GitHub Data
    let allRepos = [];
    let filteredRepos = [];
    let allBlogPosts = [];
    let filteredBlogPosts = [];
    const reposPerPage = 15;
    const blogPerPage = 6;
    let currentPage = 1;
    let currentBlogPage = 1;

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

        document.getElementById('totalRepos').textContent = allRepos.length;
        document.getElementById('totalStars').textContent = allRepos.reduce((a,r) => a + r.stargazers_count, 0).toLocaleString();
        document.getElementById('totalForks').textContent = allRepos.reduce((a,r) => a + r.forks_count, 0).toLocaleString();

        renderPage(1);
        renderPagination();
        renderActivity(events);
        loadBlogFeed();
      } catch (e) {
        console.error('Error loading data:', e);
      }
    }

    function renderPage(page) {
      currentPage = page;
      const start = (page - 1) * reposPerPage;
      const end = start + reposPerPage;
      const pageRepos = filteredRepos.slice(start, end);

      const container = document.getElementById('repos');
      container.innerHTML = '';
      
      if (pageRepos.length === 0) {
        container.innerHTML = '<div class="loading">No repositories found</div>';
        return;
      }

      pageRepos.forEach(repo => {
        const card = document.createElement('div');
        card.className = 'repo';
        card.innerHTML = `
          <button class="copy-btn" onclick="copyRepoUrl('${repo.html_url}')" title="Copy URL">
            <i data-feather="copy"></i>
          </button>
          <h3><a href="${repo.html_url}" target="_blank" rel="noopener"><i data-feather="github"></i> ${repo.name}</a></h3>
          <p>${repo.description || 'No description available'}</p>
          <div class="repo-meta">
            <span><i data-feather="code"></i> ${repo.language || 'N/A'}</span>
            <span><i data-feather="star"></i> ${repo.stargazers_count}</span>
            <span><i data-feather="git-branch"></i> ${repo.forks_count}</span>
          </div>
        `;
        container.appendChild(card);
      });
      feather.replace();
    }

    function copyRepoUrl(url) {
      navigator.clipboard.writeText(url).then(() => {
        const btn = event.target.closest('.copy-btn');
        const originalHTML = btn.innerHTML;
        btn.innerHTML = '<i data-feather="check"></i>';
        feather.replace();
        setTimeout(() => {
          btn.innerHTML = originalHTML;
          feather.replace();
        }, 2000);
      });
    }

    function renderPagination() {
      const totalPages = Math.ceil(filteredRepos.length / reposPerPage);
      const pag = document.getElementById('pagination');
      pag.innerHTML = '';
      
      if (totalPages <= 1) return;

      for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement('button');
        btn.className = 'page-btn';
        btn.textContent = i;
        if (i === currentPage) btn.classList.add('active');
        btn.onclick = () => {
          renderPage(i);
          renderPagination();
          window.scrollTo({ top: 300, behavior: 'smooth' });
        };
        pag.appendChild(btn);
      }
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
        const description = post.description.replace(/<[^>]*>/g, '').substring(0, 120);
        const pubDate = new Date(post.pubDate).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric' 
        });
        
        // Extract image from multiple sources
        let imageUrl = '';
        
        // Try thumbnail first
        if (post.thumbnail) {
          imageUrl = post.thumbnail;
        }
        // Try enclosure (podcast/media)
        else if (post.enclosure && post.enclosure.link) {
          imageUrl = post.enclosure.link;
        }
        // Try to extract from content
        else if (post.content) {
          const imgMatch = post.content.match(/<img[^>]+src=["']([^"']+)["']/i);
          if (imgMatch && imgMatch[1]) {
            imageUrl = imgMatch[1];
          }
        }
        // Try to extract from description as last resort
        else if (post.description) {
          const imgMatch = post.description.match(/<img[^>]+src=["']([^"']+)["']/i);
          if (imgMatch && imgMatch[1]) {
            imageUrl = imgMatch[1];
          }
        }
        
        // Fallback gradient SVG
        const fallbackImage = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'%3E%3Cdefs%3E%3ClinearGradient id='grad${page}${pagePosts.indexOf(post)}' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%236366f1;stop-opacity:1' /%3E%3Cstop offset='100%25' style='stop-color:%2310b981;stop-opacity:1' /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='400' height='300' fill='url(%23grad${page}${pagePosts.indexOf(post)})'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-size='80'%3E📝%3C/text%3E%3C/svg%3E`;
        
        return `
          <div class="blog-item">
            <img src="${imageUrl || fallbackImage}" alt="${post.title}" class="blog-image" onerror="this.src='${fallbackImage}'">
            <div class="blog-content">
              <div class="blog-text">
                <h3><a href="${post.link}" target="_blank" rel="noopener" style="color: inherit; text-decoration: none;">${post.title}</a></h3>
                <p>${description}...</p>
              </div>
              <div class="meta">
                <span><i data-feather="calendar"></i> ${pubDate}</span>
                <span><i data-feather="user"></i> ${post.author || 'Bugsfree'}</span>
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

      for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement('button');
        btn.className = 'page-btn';
        btn.textContent = i;
        if (i === currentBlogPage) btn.classList.add('active');
        btn.onclick = () => {
          renderBlogPage(i);
          document.querySelector('#blog').scrollIntoView({ behavior: 'smooth', block: 'start' });
        };
        pag.appendChild(btn);
      }
    }

    function renderActivity(events) {
      const feed = document.getElementById('activity');
      const activityHTML = events.slice(0, 6).map(e => `
        <div class="activity-item">
          <strong>${e.type.replace('Event', '')}</strong>
          <div style="font-size:0.85rem; color:var(--text-light); margin-top:0.25rem;">
            ${new Date(e.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </div>
          <div style="margin-top:0.5rem; font-size:0.9rem;">${e.repo.name}</div>
        </div>
      `).join('');
      feed.innerHTML = activityHTML;
    }

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
        blogContainer.innerHTML = `
          <div class="blog-item">
            <p>Unable to load blog posts at the moment.</p>
            <a href="https://bugsfreeweb.blogspot.com" target="_blank" rel="noopener" style="color:var(--primary); text-decoration:none;">
              Visit the blog directly →
            </a>
          </div>
        `;
      }
    }

    // Search
    document.getElementById('searchInput').addEventListener('input', (e) => {
      const term = e.target.value.toLowerCase();
      filteredRepos = allRepos.filter(r => 
        r.name.toLowerCase().includes(term) || 
        (r.description && r.description.toLowerCase().includes(term)) ||
        (r.language && r.language.toLowerCase().includes(term))
      );
      renderPage(1);
      renderPagination();
    });

    // Load everything
    loadData();