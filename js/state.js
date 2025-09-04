// 전역 상태와 상수 정의
const API_BASE = '';

const State = {
  categories: [],
  posts: [],
  currentCategory: 'all',
  isAdmin: false,
  uploadedImages: [],
  isReorderMode: false,
  draggedElement: null,
};

// 초기 상태 복원
(function restoreState() {
  try {
    State.isAdmin = localStorage.getItem('isAdmin') === 'true';
  } catch (_) {}
})();

window.State = State;