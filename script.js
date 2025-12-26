// Плавная прокрутка к форме
function scrollToForm() {
    const contactSection = document.getElementById('contact');
    if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        // Фокус на первом поле формы
        setTimeout(() => {
            const nameInput = document.getElementById('name');
            if (nameInput) nameInput.focus();
        }, 800);
    }
}

// Мобильное меню
function toggleMobileMenu() {
    const navMenu = document.querySelector('.nav-menu');
    const toggle = document.querySelector('.mobile-menu-toggle');
    
    if (navMenu && toggle) {
        navMenu.classList.toggle('mobile-active');
        toggle.classList.toggle('active');
        
        // Анимация иконки бургера
        const spans = toggle.querySelectorAll('span');
        if (toggle.classList.contains('active')) {
            spans[0].style.transform = 'rotate(45deg) translateY(10px)';
            spans[1].style.opacity = '0';
            spans[2].style.transform = 'rotate(-45deg) translateY(-10px)';
        } else {
            spans[0].style.transform = 'none';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'none';
        }
    }
}

// Обработка отправки формы
function handleSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    
    // Валидация формы
    const inputs = form.querySelectorAll('input[required]');
    let isValid = true;
    
    inputs.forEach(input => {
        if (!validateField(input)) {
            isValid = false;
        }
    });
    
    if (!isValid) {
        return false;
    }
    
    // Сохраняем форму для последующей отправки
    window.pendingForm = form;
    
    // Показываем модальное окно согласия на обработку данных
    showPrivacyModal();
    
    // В реальном проекте здесь будет AJAX запрос:
    /*
    fetch('YOUR_API_ENDPOINT', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
        showSuccessMessage();
        form.reset();
    })
    .catch(error => {
        console.error('Error:', error);
        showErrorMessage();
    });
    */
}

// Показать модальное окно согласия
function showPrivacyModal() {
    const modal = document.getElementById('privacyModal');
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

// Закрыть модальное окно согласия
function closePrivacyModal() {
    const modal = document.getElementById('privacyModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        window.pendingForm = null;
    }
}

// Принять согласие и отправить форму
async function acceptPrivacyAndSubmit() {
    const form = window.pendingForm;
    
    if (!form) {
        closePrivacyModal();
        return;
    }
    
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    
    // Добавляем отметку о согласии
    data.privacyConsent = true;
    data.consentDate = new Date().toISOString();
    
    try {
        // Отправка данных на сервер
        const response = await fetch('http://localhost:3000/api/forms', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            throw new Error('Ошибка отправки формы');
        }
        
        const result = await response.json();
        console.log('Форма успешно отправлена:', result);
        
        // Закрываем модальное окно
        closePrivacyModal();
        
        // Показываем сообщение об успехе
        showSuccessMessage();
        
        // Очищаем форму
        form.reset();
        
    } catch (error) {
        console.error('Ошибка при отправке формы:', error);
        closePrivacyModal();
        showErrorMessage();
    }
}

// Показать сообщение об успешной отправке
function showSuccessMessage() {
    const message = document.createElement('div');
    message.className = 'success-message';
    message.innerHTML = `
        <div class="success-content">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            <h3>Заявка успешно отправлена!</h3>
            <p>Мы свяжемся с вами в течение 15 минут</p>
        </div>
    `;
    
    document.body.appendChild(message);
    
    // Добавляем стили для сообщения
    if (!document.getElementById('success-message-styles')) {
        const style = document.createElement('style');
        style.id = 'success-message-styles';
        style.textContent = `
            .success-message {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.8);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
                animation: fadeIn 0.3s ease;
            }
            
            .success-content {
                background: white;
                padding: 3rem;
                border-radius: 20px;
                text-align: center;
                max-width: 400px;
                animation: slideUp 0.3s ease;
            }
            
            .success-content svg {
                stroke: #2d5a3d;
                margin-bottom: 1rem;
            }
            
            .success-content h3 {
                color: #2d5a3d;
                margin-bottom: 0.5rem;
                font-size: 1.5rem;
            }
            
            .success-content p {
                color: #4a4a4a;
            }
            
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            
            @keyframes slideUp {
                from { transform: translateY(30px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Удаляем сообщение через 3 секунды
    setTimeout(() => {
        message.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => message.remove(), 300);
    }, 3000);
}

// Показать сообщение об ошибке
function showErrorMessage() {
    alert('Произошла ошибка при отправке формы. Пожалуйста, попробуйте позвонить нам напрямую.');
}

// Форматирование телефона
function formatPhone(input) {
    let value = input.value.replace(/\D/g, '');
    
    if (value.length > 0) {
        if (value[0] === '7' || value[0] === '8') {
            value = '7' + value.substring(1);
        }
        
        let formatted = '+7';
        if (value.length > 1) {
            formatted += ' (' + value.substring(1, 4);
        }
        if (value.length >= 4) {
            formatted += ') ' + value.substring(4, 7);
        }
        if (value.length >= 7) {
            formatted += '-' + value.substring(7, 9);
        }
        if (value.length >= 9) {
            formatted += '-' + value.substring(9, 11);
        }
        
        input.value = formatted;
    }
}

// Анимация при прокрутке
function animateOnScroll() {
    const elements = document.querySelectorAll('.about-card, .benefit-item, .problem-card, .result-card, .review-card');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '0';
                entry.target.style.transform = 'translateY(30px)';
                
                setTimeout(() => {
                    entry.target.style.transition = 'all 0.6s ease';
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }, 100);
                
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    elements.forEach(el => observer.observe(el));
}

// Липкий хедер
function handleStickyHeader() {
    const header = document.querySelector('.header');
    let lastScroll = 0;
    
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        
        lastScroll = currentScroll;
    });
}

// Отслеживание кликов по ссылкам меню
function trackMenuClicks() {
    const menuLinks = document.querySelectorAll('.nav-menu a');
    
    menuLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            // Закрываем мобильное меню при клике
            const navMenu = document.querySelector('.nav-menu');
            const toggle = document.querySelector('.mobile-menu-toggle');
            
            if (navMenu && navMenu.classList.contains('mobile-active')) {
                toggleMobileMenu();
            }
            
            // Здесь можно добавить аналитику
            console.log('Menu click:', link.getAttribute('href'));
        });
    });
}

// Отслеживание кликов по кнопкам CTA
function trackCTAClicks() {
    const ctaButtons = document.querySelectorAll('.cta-button');
    
    ctaButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Здесь можно добавить аналитику
            console.log('CTA click:', button.textContent.trim());
        });
    });
}

// Добавление маски для телефона
function initPhoneMask() {
    const phoneInput = document.getElementById('phone');
    
    if (phoneInput) {
        phoneInput.addEventListener('input', function() {
            formatPhone(this);
        });
        
        phoneInput.addEventListener('focus', function() {
            if (this.value === '') {
                this.value = '+7 ';
            }
        });
        
        phoneInput.addEventListener('keydown', function(e) {
            // Запрещаем удаление +7
            if (e.key === 'Backspace' && this.value === '+7 ') {
                e.preventDefault();
            }
        });
    }
}

// Валидация формы
function initFormValidation() {
    const form = document.getElementById('contactForm');
    const inputs = form.querySelectorAll('input[required], textarea[required]');
    
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            validateField(this);
        });
        
        input.addEventListener('input', function() {
            // Убираем ошибку при вводе
            this.classList.remove('error');
            const errorMsg = this.parentElement.querySelector('.error-message');
            if (errorMsg) errorMsg.remove();
        });
    });
}

function validateField(field) {
    const value = field.value.trim();
    let isValid = true;
    let errorMessage = '';
    
    if (field.hasAttribute('required') && !value) {
        isValid = false;
        errorMessage = 'Это поле обязательно для заполнения';
    } else if (field.type === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            isValid = false;
            errorMessage = 'Введите корректный email';
        }
    } else if (field.type === 'tel' && value) {
        const phoneRegex = /\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}/;
        if (!phoneRegex.test(value)) {
            isValid = false;
            errorMessage = 'Введите корректный номер телефона';
        }
    }
    
    if (!isValid) {
        field.classList.add('error');
        
        // Добавляем сообщение об ошибке
        const existingError = field.parentElement.querySelector('.error-message');
        if (!existingError) {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            errorDiv.textContent = errorMessage;
            field.parentElement.appendChild(errorDiv);
        }
    }
    
    return isValid;
}

// Закрытие модального окна при клике вне его
window.onclick = function(event) {
    const modal = document.getElementById('privacyModal');
    if (event.target === modal) {
        closePrivacyModal();
    }
}

// Загрузка контента из API
async function loadContentFromAPI() {
    try {
        const response = await fetch('http://37.252.20.170:3000/api/content');
        if (!response.ok) return;
        
        const content = await response.json();
        console.log('Loaded content:', content);
        
        // Обновляем hero изображение
        if (content.hero && content.hero.image) {
            const heroSection = document.querySelector('.hero');
            if (heroSection && content.hero.image.startsWith('/uploads/')) {
                const fullUrl = 'http://37.252.20.170:3000' + content.hero.image;
                heroSection.style.backgroundImage = `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('${fullUrl}')`;
                heroSection.style.backgroundSize = 'cover';
                heroSection.style.backgroundPosition = 'center';
                console.log('Hero image updated:', fullUrl);
            }
            
            // Обновляем тексты hero
            const heroLabel = document.querySelector('.hero-label');
            const heroTitle = document.querySelector('.hero-title');
            const heroSubtitle = document.querySelector('.hero-subtitle');
            
            if (heroLabel && content.hero.label) {
                heroLabel.textContent = content.hero.label;
            }
            if (heroTitle && content.hero.title) {
                heroTitle.innerHTML = content.hero.title + '<br><span class="gradient-text">' + (content.hero.titleAccent || 'Это Профилактика Старения') + '</span>';
            }
            if (heroSubtitle && content.hero.subtitle) {
                heroSubtitle.textContent = content.hero.subtitle;
            }
        }
        
        // Обновляем фото эксперта
        if (content.expert && content.expert.image) {
            const expertImg = document.querySelector('.expert-img');
            if (expertImg && content.expert.image.startsWith('/uploads/')) {
                const fullUrl = 'http://37.252.20.170:3000' + content.expert.image;
                expertImg.src = fullUrl;
                console.log('Expert image updated:', fullUrl);
            }
            
            // Обновляем тексты эксперта
            if (content.expert.quote) {
                const quoteElements = document.querySelectorAll('.quote-text, .expert-quote');
                quoteElements.forEach(el => el.textContent = content.expert.quote);
            }
            if (content.expert.name) {
                const nameElements = document.querySelectorAll('.expert-name, .quote-author');
                nameElements.forEach(el => el.textContent = content.expert.name);
            }
        }
        
    } catch (error) {
        console.error('Error loading content:', error);
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    // Загружаем контент из API
    loadContentFromAPI();
    
    // Анимации
    animateOnScroll();
    
    // Хедер
    handleStickyHeader();
    
    // Меню
    trackMenuClicks();
    
    // CTA кнопки
    trackCTAClicks();
    
    // Телефонная маска
    initPhoneMask();
    
    // Валидация формы
    initFormValidation();
    
    // Плавное появление элементов
    setTimeout(() => {
        document.body.classList.add('loaded');
    }, 100);
});

// Обработка изменения размера окна
let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        // Можно добавить логику для адаптивности
        console.log('Window resized');
    }, 250);
});