const API_URL = 'http://37.252.20.170:3000/api';
let token = localStorage.getItem('token');

// ============ PASSWORD TOGGLE ============

document.addEventListener('DOMContentLoaded', () => {
    const togglePassword = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');
    
    if (togglePassword && passwordInput) {
        togglePassword.addEventListener('click', () => {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            togglePassword.textContent = type === 'password' ? '👁️' : '🔒';
        });
    }
});

// ============ AUTH ============

document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            token = data.token;
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(data.user));
            showDashboard();
        } else {
            document.getElementById('loginError').textContent = data.error || 'Ошибка входа';
        }
    } catch (error) {
        document.getElementById('loginError').textContent = 'Ошибка подключения к серверу';
    }
});

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    token = null;
    document.getElementById('loginScreen').style.display = 'flex';
    document.getElementById('dashboard').style.display = 'none';
}

function showDashboard() {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('dashboard').style.display = 'block';
    loadStats();
    loadContent();
}

// ============ NAVIGATION ============

function showSection(section) {
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(s => s.style.display = 'none');
    
    // Remove active class from all nav items
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    
    // Show selected section
    const sectionElement = document.getElementById(section + 'Section');
    if (sectionElement) {
        sectionElement.style.display = 'block';
    }
    
    // Add active class to clicked nav item
    event.target.classList.add('active');
    
    // Load section data
    switch(section) {
        case 'stats':
            loadStats();
            break;
        case 'reviews':
            loadReviews();
            break;
        case 'forms':
            loadForms();
            break;
    }
}

// ============ STATS ============

async function loadStats() {
    try {
        const response = await fetch(`${API_URL}/stats`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const stats = await response.json();
        
        document.getElementById('totalForms').textContent = stats.totalForms;
        document.getElementById('newForms').textContent = stats.newForms;
        document.getElementById('totalReviews').textContent = stats.totalReviews;
        document.getElementById('publishedReviews').textContent = stats.publishedReviews;
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

// ============ CONTENT ============

async function loadContent() {
    try {
        const response = await fetch(`${API_URL}/content`);
        const content = await response.json();
        
        // Load Hero
        if (content.hero) {
            document.getElementById('heroLabel').value = content.hero.label || '';
            document.getElementById('heroTitle').value = content.hero.title || '';
            document.getElementById('heroTitleAccent').value = content.hero.titleAccent || '';
            document.getElementById('heroSubtitle').value = content.hero.subtitle || '';
            
            if (content.hero.image) {
                const heroImageUrl = document.getElementById('heroImageUrl');
                const heroImagePreview = document.getElementById('heroImagePreview');
                
                if (heroImageUrl) heroImageUrl.value = content.hero.image;
                if (heroImagePreview) {
                    heroImagePreview.src = 'http://37.252.20.170:3000' + content.hero.image;
                    heroImagePreview.style.display = 'block';
                }
            }
        }
        
        // Load About
        if (content.about) {
            document.getElementById('aboutTitle').value = content.about.title || '';
            document.getElementById('aboutSubtitle').value = content.about.subtitle || '';
        }
        
        // Load Expert
        if (content.expert) {
            document.getElementById('expertQuote').value = content.expert.quote || '';
            document.getElementById('expertName').value = content.expert.name || '';
            document.getElementById('expertRole').value = content.expert.role || '';
            document.getElementById('expertBio').value = content.expert.bio || '';
            
            if (content.expert.image) {
                const expertImageUrl = document.getElementById('expertImageUrl');
                const expertImagePreview = document.getElementById('expertImagePreview');
                
                if (expertImageUrl) expertImageUrl.value = content.expert.image;
                if (expertImagePreview) {
                    expertImagePreview.src = 'http://37.252.20.170:3000' + content.expert.image;
                    expertImagePreview.style.display = 'block';
                }
            }
        }
        
        // Load Settings
        const settingsResponse = await fetch(`${API_URL}/settings`);
        const settings = await settingsResponse.json();
        
        document.getElementById('siteName').value = settings.siteName || '';
        document.getElementById('phone').value = settings.phone || '';
        document.getElementById('email').value = settings.email || '';
        document.getElementById('workTime').value = settings.workTime || '';
        
    } catch (error) {
        console.error('Error loading content:', error);
    }
}

// ============ IMAGE UPLOAD ============

async function uploadImage(input, type) {
    if (!input.files || !input.files[0]) return;
    
    console.log('=== Upload Image Debug ===');
    console.log('Type:', type);
    console.log('File:', input.files[0]);
    
    const formData = new FormData();
    formData.append('image', input.files[0]);
    
    try {
        const url = `${API_URL}/upload?type=${type}`;
        console.log('Upload URL:', url);
        console.log('Token:', token ? 'Present' : 'Missing');
        
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData
        });
        
        console.log('Response status:', response.status);
        const data = await response.json();
        console.log('Response data:', data);
        
        if (response.ok) {
            // Show preview with full URL
            const preview = document.getElementById(type + 'ImagePreview');
            const urlInput = document.getElementById(type + 'ImageUrl');
            const fullUrl = 'http://37.252.20.170:3000' + data.url;
            
            console.log('Preview element:', preview);
            console.log('URL input element:', urlInput);
            console.log('Full URL:', fullUrl);
            
            if (preview) {
                preview.src = fullUrl;
                preview.style.display = 'block';
                console.log('Preview updated');
            }
            
            if (urlInput) {
                urlInput.value = data.url;
                console.log('URL input updated:', data.url);
            }
            
            alert('✅ Изображение загружено!\nНе забудьте нажать "Сохранить"');
            return data.url;
        } else {
            console.error('Upload failed:', data);
            alert('Ошибка загрузки: ' + (data.error || 'Unknown error'));
        }
    } catch (error) {
        console.error('Upload error:', error);
        alert('Ошибка загрузки изображения: ' + error.message);
    }
}

// ============ SAVE FORMS ============

document.getElementById('heroForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const data = {
        label: document.getElementById('heroLabel').value,
        title: document.getElementById('heroTitle').value,
        titleAccent: document.getElementById('heroTitleAccent').value,
        subtitle: document.getElementById('heroSubtitle').value,
        image: document.getElementById('heroImageUrl').value || '/uploads/hero/default.jpg'
    };
    
    try {
        const response = await fetch(`${API_URL}/content/hero`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });
        
        if (response.ok) {
            alert('Сохранено!');
        }
    } catch (error) {
        alert('Ошибка сохранения');
    }
});

document.getElementById('expertForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const data = {
        role: document.getElementById('expertRole').value,
        bio: document.getElementById('expertBio').value,
        quote: document.getElementById('expertQuote').value,
        name: document.getElementById('expertName').value,
        image: document.getElementById('expertImageUrl').value || '/uploads/expert/default.jpg'
    };
    
    try {
        const response = await fetch(`${API_URL}/content/expert`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });
        
        if (response.ok) {
            alert('Сохранено!');
        }
    } catch (error) {
        alert('Ошибка сохранения');
    }
});

document.getElementById('settingsForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const data = {
        siteName: document.getElementById('siteName').value,
        phone: document.getElementById('phone').value,
        email: document.getElementById('email').value,
        workTime: document.getElementById('workTime').value
    };
    
    try {
        const response = await fetch(`${API_URL}/settings`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });
        
        if (response.ok) {
            alert('Настройки сохранены!');
        }
    } catch (error) {
        alert('Ошибка сохранения');
    }
});

// ============ REVIEWS ============

async function loadReviews() {
    try {
        const response = await fetch(`${API_URL}/reviews`);
        const reviews = await response.json();
        
        const reviewsList = document.getElementById('reviewsList');
        reviewsList.innerHTML = reviews.map(review => `
            <div class="review-item">
                <div class="review-header">
                    <h3>${review.authorName}</h3>
                    <div class="review-actions">
                        <button onclick="editReview(${review.id})" class="btn-edit">Редактировать</button>
                        <button onclick="deleteReview(${review.id})" class="btn-delete">Удалить</button>
                    </div>
                </div>
                <p class="review-text-preview">${review.text}</p>
                <div class="review-meta">
                    <span>${review.authorAge || ''}</span>
                    <span>${'⭐'.repeat(review.rating || 5)}</span>
                    <span class="status ${review.published ? 'published' : 'draft'}">
                        ${review.published ? 'Опубликован' : 'Черновик'}
                    </span>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading reviews:', error);
    }
}

function showAddReviewModal() {
    document.getElementById('reviewModalTitle').textContent = 'Добавить отзыв';
    document.getElementById('reviewForm').reset();
    document.getElementById('reviewId').value = '';
    document.getElementById('reviewModal').style.display = 'block';
}

function closeReviewModal() {
    document.getElementById('reviewModal').style.display = 'none';
}

async function editReview(id) {
    const response = await fetch(`${API_URL}/reviews`);
    const reviews = await response.json();
    const review = reviews.find(r => r.id === id);
    
    if (review) {
        document.getElementById('reviewModalTitle').textContent = 'Редактировать отзыв';
        document.getElementById('reviewId').value = review.id;
        document.getElementById('reviewText').value = review.text;
        document.getElementById('reviewAuthor').value = review.authorName;
        document.getElementById('reviewAge').value = review.authorAge || '';
        document.getElementById('reviewRating').value = review.rating || 5;
        document.getElementById('reviewPublished').checked = review.published || false;
        document.getElementById('reviewModal').style.display = 'block';
    }
}

document.getElementById('reviewForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const id = document.getElementById('reviewId').value;
    const data = {
        text: document.getElementById('reviewText').value,
        authorName: document.getElementById('reviewAuthor').value,
        authorAge: document.getElementById('reviewAge').value,
        rating: parseInt(document.getElementById('reviewRating').value),
        published: document.getElementById('reviewPublished').checked
    };
    
    try {
        const url = id ? `${API_URL}/reviews/${id}` : `${API_URL}/reviews`;
        const method = id ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });
        
        if (response.ok) {
            closeReviewModal();
            loadReviews();
            loadStats();
            alert('Отзыв сохранен!');
        }
    } catch (error) {
        alert('Ошибка сохранения отзыва');
    }
});

async function deleteReview(id) {
    if (!confirm('Удалить этот отзыв?')) return;
    
    try {
        const response = await fetch(`${API_URL}/reviews/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
            loadReviews();
            loadStats();
        }
    } catch (error) {
        alert('Ошибка удаления');
    }
}

// ============ FORMS ============

async function loadForms() {
    try {
        const response = await fetch(`${API_URL}/forms`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const forms = await response.json();
        
        const formsList = document.getElementById('formsList');
        formsList.innerHTML = forms.map(form => `
            <div class="form-item ${form.status}">
                <div class="form-header">
                    <h3>${form.name}</h3>
                    <span class="form-date">${new Date(form.createdAt).toLocaleString('ru-RU')}</span>
                </div>
                <div class="form-details">
                    <p><strong>Телефон:</strong> ${form.phone}</p>
                    ${form.email ? `<p><strong>Email:</strong> ${form.email}</p>` : ''}
                    ${form.age ? `<p><strong>Возраст:</strong> ${form.age}</p>` : ''}
                    ${form.comment ? `<p><strong>Комментарий:</strong> ${form.comment}</p>` : ''}
                </div>
                <div class="form-actions">
                    <select onchange="updateFormStatus(${form.id}, this.value)">
                        <option value="new" ${form.status === 'new' ? 'selected' : ''}>Новая</option>
                        <option value="processing" ${form.status === 'processing' ? 'selected' : ''}>В обработке</option>
                        <option value="completed" ${form.status === 'completed' ? 'selected' : ''}>Завершена</option>
                    </select>
                    <button onclick="deleteForm(${form.id})" class="btn-delete">Удалить</button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading forms:', error);
    }
}

async function updateFormStatus(id, status) {
    try {
        await fetch(`${API_URL}/forms/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ status })
        });
        loadStats();
    } catch (error) {
        alert('Ошибка обновления статуса');
    }
}

async function deleteForm(id) {
    if (!confirm('Удалить эту заявку?')) return;
    
    try {
        const response = await fetch(`${API_URL}/forms/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
            loadForms();
            loadStats();
        }
    } catch (error) {
        alert('Ошибка удаления');
    }
}

// ============ INIT ============

// Check if user is already logged in
if (token) {
    showDashboard();
}
