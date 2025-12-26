const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function question(query) {
    return new Promise(resolve => rl.question(query, resolve));
}

async function setup() {
    console.log('='.repeat(50));
    console.log('  Сеплица CMS - Настройка');
    console.log('='.repeat(50));
    console.log('');
    
    // Проверяем, существует ли уже database.json
    const dbPath = path.join(__dirname, 'database.json');
    if (fs.existsSync(dbPath)) {
        const overwrite = await question('База данных уже существует. Перезаписать? (yes/no): ');
        if (overwrite.toLowerCase() !== 'yes') {
            console.log('Настройка отменена.');
            rl.close();
            return;
        }
    }
    
    // Создаем пользователя
    const username = await question('Введите username администратора (по умолчанию: admin): ') || 'admin';
    const password = await question('Введите пароль администратора: ');
    
    if (!password || password.length < 6) {
        console.error('Ошибка: Пароль должен быть минимум 6 символов');
        rl.close();
        return;
    }
    
    console.log('Создаю базу данных...');
    
    // Хэшируем пароль
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Создаем структуру базы данных
    const database = {
        users: [
            {
                id: 1,
                username: username,
                password: hashedPassword,
                createdAt: new Date().toISOString()
            }
        ],
        content: {
            hero: {
                title: "Омоложение на клеточном уровне",
                subtitle: "Система Сеплица - научный подход к долголетию",
                image: "/assets/hero.jpg",
                cta: "Начать трансформацию"
            },
            about: {
                title: "4 ключевых направления системы Сеплица",
                steps: [
                    {
                        number: "01",
                        title: "Уход за телом",
                        description: "Комплексная программа внешнего омоложения"
                    },
                    {
                        number: "02",
                        title: "Работа с лицом и шеей",
                        description: "Специальные техники для молодости кожи"
                    },
                    {
                        number: "03",
                        title: "Клеточное здоровье",
                        description: "Научный подход к регенерации клеток"
                    },
                    {
                        number: "04",
                        title: "Микробиом",
                        description: "Баланс и здоровье изнутри"
                    }
                ]
            },
            expert: {
                name: "Алексей Пинаев",
                role: "Создатель системы Сеплица",
                image: "/assets/expert.jpg",
                quote: "Омоложение - это не мечта, а научно обоснованный процесс",
                bio: "Более 15 лет исследований в области клеточного омоложения и долголетия"
            },
            settings: {
                phone: "+7 (XXX) XXX-XX-XX",
                email: "info@seplitza.ru",
                workingHours: "Пн-Пт: 9:00-18:00",
                address: "Россия"
            }
        },
        reviews: [
            {
                id: 1,
                name: "Елена",
                age: 52,
                text: "Система Сеплица изменила мою жизнь. Чувствую себя на 10 лет моложе!",
                image: null,
                rating: 5,
                status: "published",
                createdAt: new Date().toISOString()
            }
        ],
        forms: [],
        stats: {
            totalForms: 0,
            newForms: 0,
            totalReviews: 1,
            lastUpdated: new Date().toISOString()
        }
    };
    
    // Создаем директории для загрузок
    const uploadsDir = path.join(__dirname, 'uploads');
    const dirs = ['uploads', 'uploads/hero', 'uploads/expert', 'uploads/reviews'];
    
    dirs.forEach(dir => {
        const dirPath = path.join(__dirname, dir);
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
            console.log(`Создана директория: ${dir}`);
        }
    });
    
    // Сохраняем базу данных
    fs.writeFileSync(dbPath, JSON.stringify(database, null, 2));
    
    console.log('');
    console.log('✅ Настройка завершена успешно!');
    console.log('');
    console.log('Данные для входа:');
    console.log(`  Username: ${username}`);
    console.log(`  Password: ${password}`);
    console.log('');
    console.log('Запустите сервер:');
    console.log('  npm start      - Продакшн');
    console.log('  npm run dev    - Разработка');
    console.log('');
    console.log('Админ-панель будет доступна на:');
    console.log('  http://localhost:3000/admin/');
    console.log('');
    
    rl.close();
}

setup().catch(error => {
    console.error('Ошибка при настройке:', error);
    rl.close();
    process.exit(1);
});
