// 로컬 스토리지 기반 목업 API v2.0
console.log('API 파일 로드됨 - 목업 버전 2.0');
const API = {
  // 목업 데이터 초기화
  _initMockData() {
    console.log('목업 데이터 초기화 시작...');
    
    // 강제로 초기화 (개발용)
    if (!localStorage.getItem('mockCategories') || localStorage.getItem('mockCategories') === '[]') {
      console.log('카테고리 데이터 생성 중...');
      const categories = [
        { id: 1, name: '맛집/음식', description: '맛있는 음식을 제공하는 업체', icon: 'fas fa-utensils', order: 1 },
        { id: 2, name: '미용/뷰티', description: '미용과 뷰티 관련 서비스', icon: 'fas fa-cut', order: 2 },
        { id: 3, name: '헬스/건강', description: '건강과 운동 관련 서비스', icon: 'fas fa-heartbeat', order: 3 },
        { id: 4, name: '교육/학습', description: '교육 관련 서비스', icon: 'fas fa-graduation-cap', order: 4 },
        { id: 5, name: '생활서비스', description: '다양한 생활 서비스', icon: 'fas fa-concierge-bell', order: 5 }
      ];
      localStorage.setItem('mockCategories', JSON.stringify(categories));
    }

    if (!localStorage.getItem('mockPosts') || localStorage.getItem('mockPosts') === '[]') {
      console.log('게시글 데이터 생성 중...');
      const posts = [
        {
          id: 1,
          category_id: 1,
          business_name: '맛있는 김치찌개',
          owner_name: '김사장',
          contact: '010-1234-5678',
          address: '힐스테이트 마크로엔 상가 101호',
          business_hours: '평일 11:00-21:00, 주말 12:00-20:00',
          description: '정성스럽게 끓인 김치찌개와 각종 한식 메뉴를 제공합니다. 신선한 재료로 만든 집밥 같은 맛을 느껴보세요.',
          images: ['https://page.gensparksite.com/v1/base64_upload/97b5aa096ddabde83acc918c6947cf82'],
          location_url: 'https://map.naver.com/v5/search/힐스테이트마크로엔',
          views: 45,
          display_order: 1,
          created_at: Date.now() - 86400000,
          updated_at: Date.now() - 86400000
        },
        {
          id: 2,
          category_id: 2,
          business_name: '아름다운 네일샵',
          owner_name: '이미용',
          contact: '010-2345-6789',
          address: '힐스테이트 마크로엔 상가 102호',
          business_hours: '평일 10:00-19:00, 토요일 10:00-18:00',
          description: '전문 네일아티스트가 운영하는 프리미엄 네일샵입니다. 젤네일, 아트네일 등 다양한 서비스를 제공합니다.',
          images: ['https://page.gensparksite.com/v1/base64_upload/97b5aa096ddabde83acc918c6947cf82'],
          location_url: '',
          views: 32,
          display_order: 2,
          created_at: Date.now() - 172800000,
          updated_at: Date.now() - 172800000
        },
        {
          id: 3,
          category_id: 3,
          business_name: '건강나라 헬스장',
          owner_name: '박트레이너',
          contact: '010-3456-7890',
          address: '힐스테이트 마크로엔 지하 1층',
          business_hours: '평일 06:00-23:00, 주말 08:00-21:00',
          description: '최신 운동기구와 전문 트레이너가 함께하는 프리미엄 헬스장입니다. 개인 PT와 그룹 수업도 진행합니다.',
          images: ['https://page.gensparksite.com/v1/base64_upload/97b5aa096ddabde83acc918c6947cf82'],
          location_url: '',
          views: 28,
          display_order: 3,
          created_at: Date.now() - 259200000,
          updated_at: Date.now() - 259200000
        },
        {
          id: 4,
          category_id: 4,
          business_name: '수학의 정석 학원',
          owner_name: '최선생',
          contact: '010-4567-8901',
          address: '힐스테이트 마크로엔 상가 201호',
          business_hours: '평일 15:00-22:00, 토요일 09:00-18:00',
          description: '중고등학교 수학 전문 학원입니다. 소수정예 수업으로 개별 맞춤 지도를 제공합니다.',
          images: ['https://page.gensparksite.com/v1/base64_upload/97b5aa096ddabde83acc918c6947cf82'],
          location_url: '',
          views: 19,
          display_order: 4,
          created_at: Date.now() - 345600000,
          updated_at: Date.now() - 345600000
        },
        {
          id: 5,
          category_id: 5,
          business_name: '24시간 세탁마트',
          owner_name: '정사장',
          contact: '010-5678-9012',
          address: '힐스테이트 마크로엔 상가 103호',
          business_hours: '24시간 운영',
          description: '24시간 언제든지 이용 가능한 무인 세탁소입니다. 고품질 세탁 서비스를 합리적인 가격에 제공합니다.',
          images: ['https://page.gensparksite.com/v1/base64_upload/97b5aa096ddabde83acc918c6947cf82'],
          location_url: '',
          views: 15,
          display_order: 5,
          created_at: Date.now() - 432000000,
          updated_at: Date.now() - 432000000
        }
      ];
      localStorage.setItem('mockPosts', JSON.stringify(posts));
    }
  },

  async list(table, params = {}) {
    this._initMockData();
    await new Promise(resolve => setTimeout(resolve, 100)); // 네트워크 지연 시뮬레이션
    
    if (table === 'categories') {
      const data = JSON.parse(localStorage.getItem('mockCategories') || '[]');
      return { data };
    } else if (table === 'posts') {
      const data = JSON.parse(localStorage.getItem('mockPosts') || '[]');
      return { data };
    }
    return { data: [] };
  },

  async get(table, id) {
    this._initMockData();
    await new Promise(resolve => setTimeout(resolve, 50));
    
    if (table === 'categories') {
      const data = JSON.parse(localStorage.getItem('mockCategories') || '[]');
      return data.find(item => item.id === parseInt(id));
    } else if (table === 'posts') {
      const data = JSON.parse(localStorage.getItem('mockPosts') || '[]');
      return data.find(item => item.id === parseInt(id));
    }
    throw new Error('Not found');
  },

  async create(table, data) {
    this._initMockData();
    await new Promise(resolve => setTimeout(resolve, 100));
    
    if (table === 'categories') {
      const categories = JSON.parse(localStorage.getItem('mockCategories') || '[]');
      const newId = Math.max(...categories.map(c => c.id), 0) + 1;
      const newItem = { ...data, id: newId };
      categories.push(newItem);
      localStorage.setItem('mockCategories', JSON.stringify(categories));
      return newItem;
    } else if (table === 'posts') {
      const posts = JSON.parse(localStorage.getItem('mockPosts') || '[]');
      const newId = Math.max(...posts.map(p => p.id), 0) + 1;
      const newItem = { 
        ...data, 
        id: newId, 
        views: 0,
        created_at: Date.now(),
        updated_at: Date.now()
      };
      posts.push(newItem);
      localStorage.setItem('mockPosts', JSON.stringify(posts));
      return newItem;
    }
    return data;
  },

  async patch(table, id, data) {
    this._initMockData();
    await new Promise(resolve => setTimeout(resolve, 100));
    
    if (table === 'categories') {
      const categories = JSON.parse(localStorage.getItem('mockCategories') || '[]');
      const index = categories.findIndex(item => item.id === parseInt(id));
      if (index !== -1) {
        categories[index] = { ...categories[index], ...data, updated_at: Date.now() };
        localStorage.setItem('mockCategories', JSON.stringify(categories));
        return categories[index];
      }
    } else if (table === 'posts') {
      const posts = JSON.parse(localStorage.getItem('mockPosts') || '[]');
      const index = posts.findIndex(item => item.id === parseInt(id));
      if (index !== -1) {
        posts[index] = { ...posts[index], ...data, updated_at: Date.now() };
        localStorage.setItem('mockPosts', JSON.stringify(posts));
        return posts[index];
      }
    }
    throw new Error('Not found');
  },

  async del(table, id) {
    this._initMockData();
    await new Promise(resolve => setTimeout(resolve, 100));
    
    if (table === 'categories') {
      const categories = JSON.parse(localStorage.getItem('mockCategories') || '[]');
      const filtered = categories.filter(item => item.id !== parseInt(id));
      localStorage.setItem('mockCategories', JSON.stringify(filtered));
    } else if (table === 'posts') {
      const posts = JSON.parse(localStorage.getItem('mockPosts') || '[]');
      const filtered = posts.filter(item => item.id !== parseInt(id));
      localStorage.setItem('mockPosts', JSON.stringify(filtered));
    }
    return true;
  }
};

window.API = API;