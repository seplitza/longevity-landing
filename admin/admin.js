// Settings form submission
const settingsForm = document.querySelector('.settings-form');
if (settingsForm) {
    settingsForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(this);
        const siteName = formData.get('siteName');
        const email = formData.get('notificationEmail');
        const maintenanceMode = formData.get('maintenanceMode') !== null;
        
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
