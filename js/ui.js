// UI 렌더링과 공용 DOM 유틸
const UI = {
  qs(sel, root = document) { return root.querySelector(sel); },
  qsa(sel, root = document) { return Array.from(root.querySelectorAll(sel)); },
  show(id) { const el = this.qs(`#${id}`); if (el) el.style.display = ''; },
  hide(id) { const el = this.qs(`#${id}`); if (el) el.style.display = 'none'; },
  setHTML(id, html) { const el = this.qs(`#${id}`); if (el) el.innerHTML = html; },

  renderCategories() {
    const tabs = this.qs('#categoryTabs');
    const select = this.qs('#categorySelect');
    if (!tabs) return;
    tabs.innerHTML = '';

    // 전체 탭
    tabs.appendChild(this.createTab('all', '<i class="fas fa-layer-group"></i> 전체', State.currentCategory === 'all'));

    // 카테고리 탭
    State.categories.sort((a, b) => (a.order ?? 0) - (b.order ?? 0)).forEach(cat => {
      tabs.appendChild(this.createTab(cat.id, `<i class="${cat.icon || 'fas fa-tag'}"></i> ${cat.name}`, State.currentCategory === cat.id));
    });

    tabs.className = 'tabs';
    setTimeout(UI.updateScrollHint, 100);
    tabs.addEventListener('scroll', UI.updateScrollHint);
    window.addEventListener('resize', UI.updateScrollHint);

    if (select) {
      select.innerHTML = '';
      State.categories.forEach(cat => {
        const opt = document.createElement('option');
        opt.value = cat.id; opt.textContent = cat.name; select.appendChild(opt);
      });
    }
  },

  createTab(id, html, active) {
    const btn = document.createElement('button');
    btn.className = `tab ${active ? 'active' : ''}`;
    btn.dataset.category = id;
    btn.innerHTML = html;
    btn.addEventListener('click', () => Actions.switchCategory(id, btn));
    return btn;
  },

  updateScrollHint() {
    const tabs = UI.qs('#categoryTabs');
    if (!tabs) return;
    const isScrollable = tabs.scrollWidth > tabs.clientWidth;
    const end = tabs.scrollLeft + tabs.clientWidth >= tabs.scrollWidth - 1;
    tabs.classList.toggle('scrollable', isScrollable && !end);
  },

  renderPosts() {
    const grid = this.qs('#postsGrid');
    if (!grid) return;
    grid.innerHTML = '';
    const posts = State.posts;

    if (!posts || posts.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: #6a6a6a;">
          <i class="fas fa-inbox" style="font-size: 3rem; margin-bottom: 1rem; color: #ffd700;"></i>
          <h3 style="margin-bottom: 0.5rem;">등록된 흥보글이 없습니다</h3>
          <p>첫 번째 흥보글을 등록해보세요!</p>
        </div>`;
      return;
    }

    posts.forEach(p => {
      const cat = State.categories.find(c => c.id === p.category_id) || { name: '미지정', icon: 'fas fa-tag' };
      const card = document.createElement('div');
      card.className = 'post-card';
      card.dataset.postId = p.id;
      card.addEventListener('click', () => Actions.openPostDetail(p.id));

      const imageUrl = p.images && p.images.length ? p.images[0] : 'https://page.gensparksite.com/v1/base64_upload/97b5aa096ddabde83acc918c6947cf82';
      const desc = (p.description || '').substring(0, 100) + ((p.description || '').length > 100 ? '...' : '');

      card.innerHTML = `
        <img src="${imageUrl}" alt="${p.business_name}" class="post-image" loading="lazy" decoding="async">
        <div class="post-content">
          <h3 class="post-title">${p.business_name}</h3>
          <div class="post-meta">
            <span class="post-category"><i class="${cat.icon}"></i> ${cat.name}</span>
            <span class="post-views"><i class="fas fa-eye"></i> ${p.views || 0}</span>
          </div>
          <p class="post-description">${desc}</p>
          <div class="post-footer">
            <span class="post-owner">대표: ${p.owner_name}</span>
            <span class="post-contact">${p.contact}</span>
          </div>
        </div>`;

      grid.appendChild(card);
    });
  },

  renderPostDetail(post) {
    const category = State.categories.find(c => c.id === post.category_id) || { name: '미지정', icon: 'fas fa-tag' };
    const imagesHtml = post.images && post.images.length ? `<div class="post-images">${post.images.map((img, idx) => `<img src="${img}" alt="${post.business_name} 이미지 ${idx+1}" loading="lazy" decoding="async">`).join('')}</div>` : '';
    const html = `
      <h2>${post.business_name}</h2>
      <div class="post-detail">
        ${imagesHtml}
        <div class="post-detail-section"><h3>카테고리</h3><p><span class="post-category"><i class="${category.icon}"></i> ${category.name}</span></p></div>
        <div class="post-detail-section"><h3>대표자 정보</h3><p>대표자명: ${post.owner_name}</p></div>
        <div class="post-detail-section"><h3>연락처</h3><p>${post.contact}</p></div>
        <div class="post-detail-section"><h3>주소</h3><p>${post.address}</p></div>
        <div class="post-detail-section"><h3>영업시간</h3><p>${post.business_hours}</p></div>
        <div class="post-detail-section"><h3>업체 소개</h3><p>${(post.description||'').replace(/\n/g,'<br>')}</p></div>
        ${post.location_url ? `<div class="post-detail-section"><h3>위치 보기</h3><a href="${post.location_url}" target="_blank" class="btn-primary">지도에서 보기</a></div>` : ''}
      </div>`;
    UI.setHTML('postDetail', html);
    UI.qs('#postModal').style.display = 'block';
  },

  updateAdminUI() {
    const floatingBtn = UI.qs('#adminFloatingBtn');
    const logoutBtn = UI.qs('#adminLogoutBtn');
    const addBtn = UI.qs('#addPostBtn');
    const reorderControls = UI.qs('#reorderControls');
    if (State.isAdmin) {
      if (floatingBtn) floatingBtn.style.display = 'none';
      if (logoutBtn) logoutBtn.style.display = 'inline-flex';
      if (addBtn) addBtn.style.display = 'inline-flex';
      if (reorderControls) reorderControls.style.display = 'block';
    } else {
      if (floatingBtn) floatingBtn.style.display = 'flex';
      if (logoutBtn) logoutBtn.style.display = 'none';
      if (addBtn) addBtn.style.display = 'none';
      if (reorderControls) reorderControls.style.display = 'none';
    }
  },
};

window.UI = UI;