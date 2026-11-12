const menuToggle = document.getElementById('menuToggle');
const navLinks = document.getElementById('navLinks');

if (menuToggle && navLinks) {
  menuToggle.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');

    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.textContent = open ? '×' : '☰';
  });

  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      menuToggle.setAttribute('aria-expanded', 'false');
      menuToggle.textContent = '☰';
    });
  });
}

const revealItems = document.querySelectorAll('.reveal');

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  revealItems.forEach(item => observer.observe(item));
} else {
  revealItems.forEach(item => item.classList.add('visible'));
}

const fileInput = document.getElementById('references');
const fileList = document.getElementById('fileList');

if (fileInput && fileList) {
  fileInput.addEventListener('change', () => {
    const files = [...fileInput.files];

    fileList.innerHTML = '';

    if (files.length > 4) {
      fileInput.value = '';
      fileList.textContent = 'Please choose no more than 4 images.';
      return;
    }

    const invalid = files.find(file =>
      !['image/png', 'image/jpeg', 'image/webp'].includes(file.type) ||
      file.size > 5 * 1024 * 1024
    );

    if (invalid) {
      fileInput.value = '';
      fileList.textContent = 'Images must be PNG, JPG or WEBP and no larger than 5 MB each.';
      return;
    }

    files.forEach(file => {
      const pill = document.createElement('span');
      pill.className = 'file-pill';
      pill.textContent = file.name;
      fileList.appendChild(pill);
    });
  });
}

const projectForm = document.getElementById('projectForm');

if (projectForm) {
  projectForm.addEventListener('submit', event => {
    event.preventDefault();

    const message = document.getElementById('formMessage');

    message.className = 'form-message error';
    message.textContent = 'The form is designed and validated, but it is not connected to your Supabase database yet. Connect the backend before accepting live customer requests.';
  });
}