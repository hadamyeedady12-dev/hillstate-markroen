// 드래그 앤 드롭 순서 변경
const Reorder = {
  toggle() {
    State.isReorderMode = !State.isReorderMode;
    const mode = document.getElementById('reorderMode');
    const btn = document.getElementById('reorderBtn');
    const grid = document.getElementById('postsGrid');
    if (!mode || !btn || !grid) return;

    if (State.isReorderMode) {
      mode.classList.add('active');
      btn.classList.add('active');
      btn.innerHTML = '<i class="fas fa-times"></i> 순서 변경 취소';
      Reorder.bindDrag(grid);
    } else {
      Reorder.cancel();
    }
  },
  bindDrag(grid) {
    grid.querySelectorAll('.post-card').forEach(card => {
      card.draggable = true;
      card.addEventListener('dragstart', Reorder.onDragStart);
      card.addEventListener('dragover', Reorder.onDragOver);
      card.addEventListener('drop', Reorder.onDrop);
      card.addEventListener('dragend', Reorder.onDragEnd);
      card.addEventListener('dragenter', Reorder.onDragEnter);
      card.addEventListener('dragleave', Reorder.onDragLeave);
    });
  },
  onDragStart(e) { State.draggedElement = this; this.classList.add('dragging'); e.dataTransfer.effectAllowed='move'; },
  onDragOver(e) { e.preventDefault(); e.dataTransfer.dropEffect='move'; },
  onDragEnter(e) { if (this !== State.draggedElement) this.classList.add('drag-over'); },
  onDragLeave(e) { this.classList.remove('drag-over'); },
  onDrop(e) {
    e.stopPropagation();
    if (State.draggedElement !== this) {
      const grid = document.getElementById('postsGrid');
      const cards = Array.from(grid.querySelectorAll('.post-card'));
      const draggedIndex = cards.indexOf(State.draggedElement);
      const targetIndex = cards.indexOf(this);
      if (draggedIndex < targetIndex) this.parentNode.insertBefore(State.draggedElement, this.nextSibling);
      else this.parentNode.insertBefore(State.draggedElement, this);
    }
    return false;
  },
  onDragEnd() { document.querySelectorAll('.post-card').forEach(c=>c.classList.remove('dragging','drag-over')); },
  async save() {
    if (!State.isAdmin) { alert('관리자만 순서를 변경할 수 있습니다.'); return; }
    const grid = document.getElementById('postsGrid');
    const cards = grid.querySelectorAll('.post-card');
    try {
      for (let i=0;i<cards.length;i++) {
        const id = cards[i].dataset.postId;
        if (id) await API.patch('posts', id, { display_order: i+1 });
      }
      alert('순서가 저장되었습니다.');
      Reorder.cancel();
      await Actions.loadPosts(State.currentCategory);
      UI.renderPosts();
    } catch (e) {
      console.error(e); alert('순서 저장에 실패했습니다.');
    }
  },
  cancel() {
    State.isReorderMode = false;
    const mode = document.getElementById('reorderMode');
    const btn = document.getElementById('reorderBtn');
    const grid = document.getElementById('postsGrid');
    if (!mode || !btn || !grid) return;

    mode.classList.remove('active');
    btn.classList.remove('active');
    btn.innerHTML = '<i class="fas fa-sort"></i> 순서 변경';

    grid.querySelectorAll('.post-card').forEach(card => {
      card.draggable = false;
      card.removeEventListener('dragstart', Reorder.onDragStart);
      card.removeEventListener('dragover', Reorder.onDragOver);
      card.removeEventListener('drop', Reorder.onDrop);
      card.removeEventListener('dragend', Reorder.onDragEnd);
      card.removeEventListener('dragenter', Reorder.onDragEnter);
      card.removeEventListener('dragleave', Reorder.onDragLeave);
    });

    UI.renderPosts();
  }
};

window.Reorder = Reorder;