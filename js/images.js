// 이미지 업로드/미리보기 로직
const Images = {
  isSupported(url) {
    const clean = (url || '').split('?')[0].toLowerCase();
    return ['.jpg','.jpeg','.png','.webp','.gif','.svg','.bmp','.avif'].some(ext => clean.endsWith(ext));
  },
  handleFileSelect(e) {
    const files = Array.from(e.target.files || []);
    const valid = files.filter(f => f.type.startsWith('image/'));
    if (valid.length !== files.length) alert('이미지 파일만 업로드 가능합니다.');

    const count = document.getElementById('fileCount');
    if (count) count.textContent = valid.length ? `${valid.length}개 파일 선택됨` : '';

    valid.forEach(file => {
      const reader = new FileReader();
      reader.onload = ev => { State.uploadedImages.push(ev.target.result); Images.updatePreview(); };
      reader.readAsDataURL(file);
    });
  },
  updatePreview() {
    const wrap = document.getElementById('imagePreview');
    if (!wrap) return;
    wrap.innerHTML = '';
    State.uploadedImages.forEach((url, idx) => {
      const div = document.createElement('div');
      div.className = 'image-preview-item';
      div.innerHTML = `<img src="${url}" alt="Preview ${idx+1}"><button type="button" class="remove-btn" data-index="${idx}"><i class="fas fa-times"></i></button>`;
      wrap.appendChild(div);
    });
  },
  remove(index) {
    State.uploadedImages.splice(index,1);
    Images.updatePreview();
    const count = document.getElementById('fileCount');
    if (count) count.textContent = State.uploadedImages.length ? `${State.uploadedImages.length}개 파일 선택됨` : '';
  }
};

window.Images = Images;