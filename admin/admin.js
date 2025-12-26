// Settings form submission
const settingsForm = document.querySelector('.settings-form');
if (settingsForm) {
    settingsForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form data
        const siteName = this.querySelector('input[type="text"]').value;
        const email = this.querySelector('input[type="email"]').value;
        const maintenanceMode = this.querySelector('input[type="checkbox"]').checked;
        
        // Here you would typically send the data to a server
        console.log('Settings updated:', { siteName, email, maintenanceMode });
        
        // Show success message
        alert('Настройки успешно сохранены!');
    });
}

// Content management buttons
document.querySelectorAll('.content-management button').forEach(button => {
    button.addEventListener('click', function() {
        alert('Функция "' + this.textContent + '" в разработке');
    });
});

// Table action buttons
document.querySelectorAll('.admin-table .btn-small').forEach(button => {
    button.addEventListener('click', function() {
        alert('Редактирование пользователя');
    });
});
