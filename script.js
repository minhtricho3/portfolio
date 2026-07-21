// Render các nút liên hệ từ contact.js
const container = document.getElementById('contactLinks');

Object.values(contact).forEach(item => {
  const a = document.createElement('a');
  a.href = item.url;
  a.className = 'contact-btn';
  a.target = '_blank';
  a.rel = 'noopener noreferrer';
  a.innerHTML = `
    <i class="${item.icon}"></i>
    <span>${item.label}</span>
    <i class="fas fa-arrow-right arrow"></i>
  `;
  container.appendChild(a);
});
