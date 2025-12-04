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

    // Visitor Counter (Real & Working)
    const visitorBtn = document.getElementById('visitorBtn');
    const visitorsDisplay = document.getElementById('visitors');
    fetch('https://api.countapi.xyz/hit/bugsfree-portfolio/visits')
      .then(r => r.json())
      .then(data => {
        const count = data.value;
        visitorsDisplay.textContent = count.toLocaleString();
        visitorBtn.setAttribute('data-tooltip', `Total Visitors: ${count.toLocaleString()}`);
      })
      .catch(() => {
        visitorsDisplay.textContent = '—';
        visitorBtn.setAttribute('data-tooltip', 'Visitor count unavailable');
      });

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
    const reposPerPage = 15, blogPerPage = 6;
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
        document.getElementById('totalRepos').textContent = allRepos.length;
        document.getElementById('totalStars').textContent = allRepos.reduce((a,r) => a + r.stargazers_count, 0).toLocaleString();
        document.getElementById('totalForks').textContent = allRepos.reduce((a,r) => a + r.forks_count, 0).toLocaleString();
        renderPage(1); renderPagination(); renderActivity(events); loadBlogFeed();
      } catch (e) { console.error('Error loading data:', e); }
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
        card.className = 'repo';
        card.innerHTML = `
          <button class="copy-btn" onclick="copyRepoUrl('${repo.html_url}')" title="Copy URL"><i data-feather="copy"></i></button>
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
        const original = btn.innerHTML;
        btn.innerHTML = '<i data-feather="check"></i>';
        feather.replace();
        setTimeout(() => { btn.innerHTML = original; feather.replace(); }, 2000);
      });
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
        <div class="activity-item">
          <strong>${e.type.replace('Event', '')}</strong>
          <div style="font-size:0.85rem; color:var(--text-light); margin-top:0.25rem;">
            ${new Date(e.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </div>
          <div style="margin-top:0.5rem; font-size:0.9rem;">${e.repo.name}</div>
        </div>
      `).join('');
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
        blogContainer.innerHTML = `<div class="blog-item"><p>Unable to load blog posts.</p><a href="https://bugsfreeweb.blogspot.com" target="_blank" rel="noopener" style="color:var(--primary);">Visit the blog directly</a></div>`;
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
        const pubDate = new Date(post.pubDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
        let imageUrl = post.thumbnail || (post.content && post.content.match(/<img[^>]+src=["']([^"']+)["']/i)?.[1]) || '';
        const fallbackImage = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%236366f1'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-size='80' fill='white'%3E%3C/text%3E%3C/svg%3E`;
        return `
          <div class="blog-item">
            <img src="${imageUrl || fallbackImage}" alt="${post.title}" class="blog-image" onerror="this.src='${fallbackImage}'">
            <div class="blog-content">
              <div class="blog-text">
                <h3><a href="${post.link}" target="_blank" rel="noopener">${post.title}</a></h3>
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
      pag.innerHTML = totalPages <= 1 ? '' : '';
      if (totalPages <= 1) return;
      for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement('button');
        btn.className = 'page-btn' + (i === currentBlogPage ? ' active' : '');
        btn.textContent = i;
        btn.onclick = () => { renderBlogPage(i); document.querySelector('#blog').scrollIntoView({ behavior: 'smooth', block: 'start' }); };
        pag.appendChild(btn);
      }
    }

    document.getElementById('searchInput').addEventListener('input', (e) => {
      const term = e.target.value.toLowerCase();
      filteredRepos = allRepos.filter(r =>
        r.name.toLowerCase().includes(term) ||
        (r.description && r.description.toLowerCase().includes(term)) ||
        (r.language && r.language.toLowerCase().includes(term))
      );
      renderPage(1); renderPagination();
    });


    loadData();



