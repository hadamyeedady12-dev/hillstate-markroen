// 초기화와 사용자 액션 집합
const Actions = {
  async init() {
    try {
      console.log('앱 초기화 시작...');
      UI.updateAdminUI();
      Theme.init();
      await Actions.initializeData();
      await Actions.loadCategories();
      await Actions.loadPosts();
      UI.renderCategories();
      UI.renderPosts();
      Actions.bindUI();
      Actions.enhanceUX();
      console.log('앱 초기화 완료');
    } catch (e) {
      console.error('앱 초기화 실패:', e);
      const loading = document.getElementById('loading'); if (loading) loading.style.display = 'none';
      const grid = document.getElementById('postsGrid');
      if (grid) grid.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: #dc2626;"><i class="fas fa-exclamation-triangle" style="font-size: 3rem; margin-bottom: 1rem;"></i><h3>앱 초기화에 실패했습니다</h3><p>페이지를 새로고침해주세요.</p><button onclick="location.reload()" style="margin-top: 1rem; padding: 0.75rem 1.5rem; background: #ffd700; border: none; border-radius: 12px; cursor: pointer; font-weight: 600;">새로고침</button></div>`;
    }
  },

  async loadCategories() {
    try {
      const res = await API.list('categories');
      State.categories = (res.data || []).sort((a,b)=> (a.order ?? 0) - (b.order ?? 0));
    } catch (e) { console.error('카테고리 로드 실패:', e); State.categories = []; }
  },

  page: 1,
  limit: 12,
  total: 0,

  async loadPosts(categoryId = State.currentCategory) {
    try {
      const loading = document.getElementById('loading'); if (loading) loading.style.display = 'block';
      const res = await API.list('posts');
      let all = res.data || [];
      // 클라이언트 검색
      const q = (UI.qs('#searchInput')?.value || '').trim().toLowerCase();
      if (q) {
        all = all.filter(p => [p.business_name, p.description, p.address, p.owner_name].filter(Boolean).some(v => String(v).toLowerCase().includes(q)));
      }
      // 카테고리 필터
      if (categoryId && categoryId !== 'all') all = all.filter(p => p.category_id === categoryId);
      // 정렬
      const sort = UI.qs('#sortSelect')?.value || 'recent';
      if (sort === 'views') all.sort((a,b)=> (b.views||0) - (a.views||0));
      else if (sort === 'name') all.sort((a,b)=> String(a.business_name||'').localeCompare(String(b.business_name||''), 'ko'));
      else all.sort((a,b)=> (a.display_order && b.display_order) ? a.display_order - b.display_order : (b.created_at||0) - (a.created_at||0));

      // 페이지네이션
      Actions.total = all.length;
      const start = (Actions.page - 1) * Actions.limit;
      const chunk = all.slice(start, start + Actions.limit);
      if (Actions.page === 1) State.posts = chunk; else State.posts = [...State.posts, ...chunk];

      // 더 보기 표시
      const hasMore = start + Actions.limit < all.length;
      const pc = document.getElementById('paginationControls');
      if (pc) pc.style.display = hasMore ? 'flex' : 'none';

      if (loading) loading.style.display = 'none';
    } catch (e) {
      console.error('게시글 로드 실패:', e);
      State.posts = [];
      const loading = document.getElementById('loading'); if (loading) loading.style.display = 'none';
      const grid = document.getElementById('postsGrid');
      if (grid) grid.innerHTML = `<div style="text-align: center; padding: 3rem; color: #6a6a6a; grid-column: 1 / -1;"><i class=\"fas fa-exclamation-triangle\" style=\"font-size: 2rem; margin-bottom: 1rem; color: #ffd700;\"></i><h3>데이터를 불러올 수 없습니다</h3><p>잠시 후 다시 시도해주세요.</p><button onclick=\"location.reload()\" style=\"margin-top: 1rem; padding: 0.5rem 1rem; background: #ffd700; border: none; border-radius: 8px; cursor: pointer;\">새로고침</button></div>`;
    }
  },

  async switchCategory(categoryId, tabEl) {
    State.currentCategory = categoryId;
    // 탭 active
    UI.qsa('.tab').forEach(t => t.classList.toggle('active', t.dataset.category === categoryId));
    // 탭 스크롤 내비게이션
    if (tabEl) Actions.scrollToActiveTab(tabEl);
    // 헤더 텍스트 업데이트
    const title = document.getElementById('categoryTitle');
    const desc = document.getElementById('categoryDescription');
    if (categoryId === 'all') { if (title) title.innerHTML = '<i class="fas fa-layer-group"></i> 전체 흥보글'; if (desc) desc.style.display = 'none'; }
    else {
      const cat = State.categories.find(c=>c.id===categoryId);
      if (cat) { if (title) title.innerHTML = `<i class="${cat.icon || 'fas fa-tag'}"></i> ${cat.name}`; if (desc) desc.style.display = 'none'; }
    }
    Actions.page = 1; // 필터 변경 시 페이지 초기화
    await Actions.loadPosts(categoryId);
    UI.renderPosts();
  },

  scrollToActiveTab(activeTab) {
    const tabs = activeTab.parentElement; if (!tabs || tabs.scrollWidth <= tabs.clientWidth) return;
    const cr = tabs.getBoundingClientRect(); const tr = activeTab.getBoundingClientRect();
    const left = tr.left - cr.left; const right = tr.right - cr.left; const w = cr.width; let sl = tabs.scrollLeft;
    if (left < 0) sl += left - 20; else if (right > w) sl += (right - w) + 20;
    tabs.scrollTo({ left: sl, behavior: 'smooth' }); setTimeout(UI.updateScrollHint, 300);
  },

  async openPostDetail(id) {
    try {
      const post = await API.get('posts', id);
      await API.patch('posts', id, { views: (post.views || 0) + 1 });
      UI.renderPostDetail(post);
    } catch (e) { console.error('게시글 로드 실패:', e); alert('게시글을 불러올 수 없습니다.'); }
  },

  bindUI() {
    // 버튼 및 폼
    UI.qs('#requestPostBtn')?.addEventListener('click', Actions.openKakaoChat);
    UI.qs('#adminFloatingBtn')?.addEventListener('click', Admin.openLogin);
    UI.qs('#adminLogoutBtn')?.addEventListener('click', Admin.logout);
    UI.qs('#addPostBtn')?.addEventListener('click', Admin.openAddPostModal);

    UI.qs('#reorderBtn')?.addEventListener('click', Reorder.toggle);
    UI.qs('#loadMoreBtn')?.addEventListener('click', async ()=>{ Actions.page += 1; await Actions.loadPosts(State.currentCategory); UI.renderPosts(); });
    UI.qs('#searchInput')?.addEventListener('input', Actions.onFilterChanged);
    UI.qs('#sortSelect')?.addEventListener('change', Actions.onFilterChanged);
    UI.qs('#saveOrderBtn')?.addEventListener('click', Reorder.save);
    UI.qs('#cancelOrderBtn')?.addEventListener('click', Reorder.cancel);

    UI.qs('#adminLoginForm')?.addEventListener('submit', Admin.handleLoginSubmit);
    UI.qs('#addPostForm')?.addEventListener('submit', Admin.submitPost);

    // 모달 닫기 버튼 + 취소 버튼
    UI.qsa('.modal-close').forEach(btn => btn.addEventListener('click', ()=>{ const id = btn.dataset.target; const el = document.getElementById(id); if (el) el.style.display = 'none'; }));
    UI.qs('#adminCancelBtn')?.addEventListener('click', ()=>{ const el = document.getElementById('adminLoginModal'); if (el) el.style.display = 'none'; });
    UI.qs('#addPostCancelBtn')?.addEventListener('click', ()=>{ const el = document.getElementById('addPostModal'); if (el) el.style.display = 'none'; });

    // 모달 외부 클릭 닫기
    window.addEventListener('click', (e) => { if (e.target.classList?.contains('modal')) e.target.style.display = 'none'; });

    // ESC 닫기
    document.addEventListener('keydown', (e)=>{ if (e.key === 'Escape') UI.qsa('.modal').forEach(m => m.style.display='none'); });

    // 테마
    UI.qs('#themeToggleBtn')?.addEventListener('click', Theme.toggle);
    UI.qs('#mobileThemeToggle')?.addEventListener('click', Theme.toggle);
    document.addEventListener('keydown', (e) => { if (e.ctrlKey && e.shiftKey && e.key === 'T') { e.preventDefault(); Theme.toggle(); }});
    document.addEventListener('dblclick', (e) => { if (e.target.closest('.header')) Theme.toggle(); });

    // 이미지 업로드
    UI.qs('#imageFileInput')?.addEventListener('change', Images.handleFileSelect);
    UI.qs('#imageFileSelectBtn')?.addEventListener('click', ()=> document.getElementById('imageFileInput').click());
    UI.qs('#imagePreview')?.addEventListener('click', (e)=>{ const btn = e.target.closest('.remove-btn'); if (btn) Images.remove(parseInt(btn.dataset.index,10)); });
  },

  onFilterChanged() { Actions.page = 1; Actions.loadPosts(State.currentCategory).then(() => UI.renderPosts()); },

  enhanceUX() {
    // 플로팅 버튼 호버 효과
    UI.qsa('.floating-btn').forEach(btn => {
      btn.addEventListener('mouseenter', ()=> btn.style.transform = 'translateY(-3px) scale(1.15)');
      btn.addEventListener('mouseleave', ()=> btn.style.transform = '');
    });

    setTimeout(() => {
      const themeBtn = document.getElementById('themeToggleBtn');
      if (themeBtn && !localStorage.getItem('theme-intro-shown')) {
        themeBtn.style.animation = 'theme-pulse 2s infinite';
        setTimeout(()=>{ themeBtn.style.animation=''; localStorage.setItem('theme-intro-shown','true'); }, 6000);
      }

      const requestBtn = document.getElementById('requestPostBtn');
      if (requestBtn) {
        requestBtn.addEventListener('click', function(){
          this.style.transform = 'translateY(-3px) scale(1.1)';
          this.style.boxShadow = '0 15px 40px rgba(254, 229, 0, 0.9), 0 0 0 15px rgba(254, 229, 0, 0.3)';
          this.style.background = 'linear-gradient(135deg, #ffed4e 0%, #fee500 50%, #f9cc33 100%)';
          setTimeout(()=>{ this.style.transform=''; this.style.boxShadow=''; this.style.background=''; }, 300);
          localStorage.setItem('request-button-used', 'true');
        });
        if (!localStorage.getItem('request-button-introduced')) {
          setTimeout(()=>{
            requestBtn.style.animation = 'request-pulse 3s infinite';
            requestBtn.style.transform = 'scale(1.05)';
            setTimeout(()=>{ requestBtn.style.animation=''; requestBtn.style.transform=''; localStorage.setItem('request-button-introduced','true'); }, 9000);
          }, 10000);
        }
      }
    }, 2000);
  },

  async initializeData() {
    try {
      console.log('초기 데이터 생성 시작...');
      
      // 강제로 localStorage 초기화 (개발용)
      console.log('localStorage 강제 초기화...');
      localStorage.removeItem('mockCategories');
      localStorage.removeItem('mockPosts');
      
      // API 직접 초기화 호출
      if (window.API && typeof window.API._initMockData === 'function') {
        console.log('API 목업 데이터 강제 생성...');
        window.API._initMockData();
      }
      
      const cats = await API.list('categories');
      console.log('카테고리 로드됨:', cats.data?.length || 0, cats.data);
      
      const posts = await API.list('posts');
      console.log('게시글 로드됨:', posts.data?.length || 0, posts.data);
      
    } catch (e) { 
      console.error('초기 데이터 생성 실패:', e); 
    }
  },

  openKakaoChat() {
    localStorage.setItem('request-button-used','true');
    const msg = `🎆 힐스테이트 마크로엔 흥보장터\n프리미엄 홍보 서비스\n\n🌟 무료로 제공하는 전문 서비스:\n✨ 전문가가 작성하는 매력적인 홍보글\n📸 고품질 이미지 편집 & 최적화\n📍 카테고리별 체계적 분류\n🏠 우리 단지 입주민들에게 직접 노출\n\n📞 지금 바로 카카오톡으로 문의하시겠습니까?`;
    if (confirm(msg)) {
      // 실제 오픈카톡 URL로 변경하세요
      const kakaoUrl = 'https://open.kakao.com/o/skvQONuh';
      
      // 실제 URL이 설정되어 있는지 확인
      if (kakaoUrl.includes('YOUR_OPENCHAT_LINK')) {
        alert('🚀 서비스 준비 완료!\n\n실제 서비스에서는 카카오톡 오픈채팅방으로 \n즉시 연결되어 전문가와 상담할 수 있습니다!\n\n관리자에게 오픈채팅 URL 설정을 요청해주세요.');
      } else {
        window.open(kakaoUrl, '_blank');
      }
    }
  },
};

window.Actions = Actions;

document.addEventListener('DOMContentLoaded', Actions.init);
