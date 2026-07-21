const container = document.getElementById('contactLinks');

Object.values(contact).forEach(item => {
  const el = document.createElement(item.type === 'link' ? 'a' : 'button');
  el.className = 'contact-btn';

  if (item.type === 'link') {
    el.href = item.value;
    el.target = '_blank';
    el.rel = 'noopener noreferrer';
  }

  el.innerHTML = `
    <i class="${item.icon}"></i>
    <span class="btn-label">${item.label}</span>
    <span class="btn-value">${item.type === 'copy' ? item.value : ''}</span>
    <i class="${item.type === 'copy' ? 'fas fa-copy' : 'fas fa-arrow-right'} action-icon"></i>
  `;

  if (item.type === 'copy') {
    el.addEventListener('click', () => {
      navigator.clipboard.writeText(item.value).then(() => {
        const icon = el.querySelector('.action-icon');
        const label = el.querySelector('.btn-label');

        icon.className = 'fas fa-check action-icon';
        label.textContent = 'Đã copy!';
        el.classList.add('copied');

        setTimeout(() => {
          icon.className = 'fas fa-copy action-icon';
          label.textContent = item.label;
          el.classList.remove('copied');
        }, 2000);
      });
    });
  }

  container.appendChild(el);
});
