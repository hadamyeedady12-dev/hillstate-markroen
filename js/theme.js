// 테마 초기화/토글 및 UX 보조
const Theme = {
  init() {
    const saved = localStorage.getItem('theme');
    const icon = document.getElementById('themeIcon');
    const mobileIcon = document.getElementById('mobileThemeIcon');
    if (saved === 'dark') {
      document.body.classList.add('dark-mode');
      if (icon) icon.className = 'fas fa-sun';
      if (mobileIcon) mobileIcon.className = 'fas fa-sun';
    } else {
      if (icon) icon.className = 'fas fa-moon';
      if (mobileIcon) mobileIcon.className = 'fas fa-moon';
    }
    setTimeout(Theme.suggestByTime, 4000);
  },
  toggle() {
    const body = document.body;
    body.classList.toggle('dark-mode');
    const icon = document.getElementById('themeIcon');
    const mobileIcon = document.getElementById('mobileThemeIcon');
    if (body.classList.contains('dark-mode')) {
      localStorage.setItem('theme','dark');
      if (icon) icon.className = 'fas fa-sun';
      if (mobileIcon) mobileIcon.className = 'fas fa-sun';
    } else {
      localStorage.setItem('theme','light');
      if (icon) icon.className = 'fas fa-moon';
      if (mobileIcon) mobileIcon.className = 'fas fa-moon';
    }
  },
  suggestByTime() {
    const hour = new Date().getHours();
    const isDark = document.body.classList.contains('dark-mode');
    const today = new Date().toDateString();
    const last = localStorage.getItem('auto-theme-suggested-date');
    if (last === today) return;
    if ((hour >= 18 || hour <= 6) && !isDark) {
      setTimeout(()=>{ if (confirm('🌙 저녁 시간이네요! 눈에 편한 다크모드로 전환하시겠습니까?')) Theme.toggle(); localStorage.setItem('auto-theme-suggested-date', today); }, 3000);
    } else if (hour >= 7 && hour <= 17 && isDark) {
      setTimeout(()=>{ if (confirm('☀️ 밝은 낮 시간이네요! 깔끔한 라이트모드로 전환하시겠습니까?')) Theme.toggle(); localStorage.setItem('auto-theme-suggested-date', today); }, 3000);
    }
  }
};

window.Theme = Theme;