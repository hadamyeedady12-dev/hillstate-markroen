// 관리자 기능: 로그인/로그아웃/등록 모달/폼 제출
const Admin = {
  PASSCODE: 'admin1234',
  openLogin() { document.getElementById('adminLoginModal').style.display = 'block'; },
  logout() { State.isAdmin = false; localStorage.removeItem('isAdmin'); UI.updateAdminUI(); alert('로그아웃되었습니다.'); },
  handleLoginSubmit(e) {
    e.preventDefault();
    const input = document.getElementById('adminPasscode').value.trim();
    if (input === Admin.PASSCODE) {
      State.isAdmin = true; localStorage.setItem('isAdmin','true');
      document.getElementById('adminLoginModal').style.display = 'none';
      UI.updateAdminUI();
      alert('관리자 모드로 전환되었습니다.');
    } else {
      alert('암호가 올바르지 않습니다.');
    }
  },
  openAddPostModal() {
    if (!State.isAdmin) { alert('관리자만 흥보글을 등록할 수 있습니다.'); return; }
    State.uploadedImages = [];
    Images.updatePreview();
    document.getElementById('addPostModal').style.display = 'block';
  },
  async submitPost(e) {
    e.preventDefault();
    if (!State.isAdmin) { alert('관리자만 흥보글을 등록할 수 있습니다.'); return; }

    const urlText = document.getElementById('imageUrls').value;
    const urlImages = urlText.split(/[\n,]/).map(s=>s.trim()).filter(Boolean).filter(Images.isSupported);
    const images = [...State.uploadedImages, ...urlImages];

    const data = {
      category_id: document.getElementById('categorySelect').value,
      business_name: document.getElementById('businessName').value,
      owner_name: document.getElementById('ownerName').value,
      contact: document.getElementById('contact').value,
      address: document.getElementById('address').value,
      business_hours: document.getElementById('businessHours').value,
      description: document.getElementById('description').value,
      images,
      location_url: document.getElementById('locationUrl').value || null,
      views: 0,
      display_order: State.posts.length + 1,
      created_at: Date.now(),
      updated_at: Date.now(),
    };

    try {
      await API.create('posts', data);
      alert('흥보글이 등록되었습니다!');
      document.getElementById('addPostModal').style.display = 'none';
      document.getElementById('addPostForm').reset();
      await Actions.loadPosts(State.currentCategory);
      UI.renderPosts();
    } catch (e) {
      console.error(e); alert('등록에 실패했습니다. 다시 시도해주세요.');
    }
  },
};

window.Admin = Admin;