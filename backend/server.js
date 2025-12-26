const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Статические файлы с отключенными Range requests
app.use('/uploads', express.static('uploads', {
    acceptRanges: false,
    etag: false,
    lastModified: false,
    maxAge: 0
}));

// Отдаём статические файлы (CSS, JS, изображения) НО не HTML
app.use(express.static(path.join(__dirname, '../'), {
    acceptRanges: false,
    etag: false,
    lastModified: false,
    maxAge: 0,
    index: false,  // Отключаем автоматический index.html
    setHeaders: (res, path) => {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
    }
}));

// Статика для админ-панели
app.use('/admin', express.static(path.join(__dirname, '../admin'), {
    acceptRanges: false,
    etag: false,
    lastModified: false,
    maxAge: 0
}));

// Создаем директории если их нет
const initDirectories = async () => {
    const dirs = ['./uploads', './uploads/hero', './uploads/expert', './uploads/reviews'];
    for (const dir of dirs) {
        try {
            await fs.mkdir(dir, { recursive: true });
        } catch (err) {
            console.error(`Error creating directory ${dir}:`, err);
        }
    }
};

// Настройка multer для загрузки файлов
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Получаем тип из query параметров или body
        const type = req.query.type || req.body.type || 'general';
        const dir = `uploads/${type}/`;
        
        // Создаем директорию если не существует
        const fs = require('fs');
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        
        cb(null, dir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb('Error: Images only!');
        }
    }
});

// База данных (в реальном проекте используйте MongoDB, PostgreSQL и т.д.)
let database = {
    users: [
        {
            id: 1,
            username: 'admin',
            password: '$2a$10$YourHashedPasswordHere', // Измените на хэш реального пароля
            role: 'admin'
        }
    ],
    content: {
        hero: {
            label: 'Система естественного омоложения',
            title: 'Долголетие —',
            titleAccent: 'Это Профилактика Старения',
            subtitle: 'Я Алексей Пинаев, создатель системы Сеплица. Наша цель — жить больше 100 лет, используя исключительно естественные методы омоложения. Без операций, инъекций и агрессивных процедур.',
            image: '/uploads/hero/default.jpg',
            features: [
                'Только естественные методы',
                'Доказанная эффективность',
                '20-40 минут в день'
            ],
            badge: {
                label: '10,000+',
                text: 'последователей системы'
            }
        },
        about: {
            title: 'Что Такое Система Сеплица?',
            subtitle: '4 ступени погружения для достижения естественного омоложения',
            cards: [
                {
                    icon: '🏃',
                    title: 'Забота о теле',
                    description: 'Зарядка долголетия за 25 минут и тренировки для увеличения потенциала жизни. Разглаживаем «миофасциальный костюмчик»'
                },
                {
                    icon: '💆',
                    title: 'Забота о лице и шее',
                    description: 'Практики самомассажа, работа с осанкой и лимфодренажные упражнения. Эстетическое омоложение без инъекций'
                },
                {
                    icon: '🧬',
                    title: 'Клеточное здоровье',
                    description: 'Биохакинг: помощь клеткам в жизнедеятельности, укрепление защитных свойств, восполнение критически важных запасов'
                },
                {
                    icon: '🦠',
                    title: 'Забота о микробиоме',
                    description: 'Работа с микрофлорой: разнообразное питание, пребиотики и ферментированные продукты для здоровья организма'
                }
            ]
        },
        expert: {
            image: '/uploads/expert/default.jpg',
            quote: 'Долголетие — это не привилегия стареньких людей со сморщенными лицами. Мы продлеваем здоровую фазу жизни',
            name: 'Алексей Пинаев',
            title: 'О Создателе Системы',
            bio: [
                'Меня зовут Алексей Пинаев, и я создал систему Сеплица (Natural Facelift System) — комплексный подход к естественному омоложению без инвазивных методов.',
                'На собственном примере и примере наших последователей мы доказываем, что красивое подтянутое лицо и здоровое тело — задача, выполнимая в любом возрасте и не требующая больших финансовых затрат.'
            ],
            credentials: [
                {
                    icon: '📱',
                    title: 'Мобильное приложение',
                    text: 'Natural Rejuvenation в App Store и RuStore\nБесплатные курсы для всех пользователей'
                },
                {
                    icon: '👥',
                    title: 'Сообщество',
                    text: '10,000+ последователей\nЕжедневная зарядка в прямом эфире в 7:00 МСК'
                },
                {
                    icon: '🎯',
                    title: 'Философия',
                    text: 'Против инъекций, операций и агрессивных процедур\nТолько естественные методы омоложения'
                }
            ]
        },
        reviews: []
    },
    settings: {
        siteName: 'СЕПЛИЦА',
        phone: '+7 (999) 123-45-67',
        email: 'info@seplitza.ru',
        workTime: 'Ежедневно с 9:00 до 21:00'
    },
    forms: []
};

// Загрузка данных из файла
const loadDatabase = async () => {
    try {
        const data = await fs.readFile('./database.json', 'utf8');
        database = JSON.parse(data);
    } catch (err) {
        console.log('Database file not found, using default data');
        await saveDatabase();
    }
};

// Сохранение данных в файл
const saveDatabase = async () => {
    try {
        await fs.writeFile('./database.json', JSON.stringify(database, null, 2));
    } catch (err) {
        console.error('Error saving database:', err);
    }
};

// Middleware для проверки JWT токена
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// ============ AUTH ROUTES ============

// Логин
app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;
    
    const user = database.users.find(u => u.username === username);
    if (!user) {
        return res.status(400).json({ error: 'User not found' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
        return res.status(400).json({ error: 'Invalid password' });
    }

    const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        JWT_SECRET,
        { expiresIn: '24h' }
    );

    res.json({ 
        token,
        user: { id: user.id, username: user.username, role: user.role }
    });
});

// Создание первого admin пользователя
app.post('/api/auth/setup', async (req, res) => {
    const { username, password } = req.body;
    
    if (database.users.length > 0) {
        return res.status(400).json({ error: 'Users already exist' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
        id: 1,
        username,
        password: hashedPassword,
        role: 'admin'
    };

    database.users.push(newUser);
    await saveDatabase();

    res.json({ message: 'Admin user created successfully' });
});

// ============ CONTENT ROUTES ============

// Получить весь контент
app.get('/api/content', (req, res) => {
    res.json(database.content);
});

// Получить настройки
app.get('/api/settings', (req, res) => {
    res.json(database.settings);
});

// Обновить Hero секцию
app.put('/api/content/hero', authenticateToken, async (req, res) => {
    database.content.hero = { ...database.content.hero, ...req.body };
    await saveDatabase();
    res.json(database.content.hero);
});

// Обновить About секцию
app.put('/api/content/about', authenticateToken, async (req, res) => {
    database.content.about = { ...database.content.about, ...req.body };
    await saveDatabase();
    res.json(database.content.about);
});

// Обновить Expert секцию
app.put('/api/content/expert', authenticateToken, async (req, res) => {
    database.content.expert = { ...database.content.expert, ...req.body };
    await saveDatabase();
    res.json(database.content.expert);
});

// Обновить настройки
app.put('/api/settings', authenticateToken, async (req, res) => {
    database.settings = { ...database.settings, ...req.body };
    await saveDatabase();
    res.json(database.settings);
});

// ============ REVIEWS ROUTES ============

// Получить все отзывы
app.get('/api/reviews', (req, res) => {
    res.json(database.content.reviews || []);
});

// Добавить отзыв
app.post('/api/reviews', authenticateToken, async (req, res) => {
    const newReview = {
        id: Date.now(),
        ...req.body,
        createdAt: new Date().toISOString()
    };
    
    if (!database.content.reviews) {
        database.content.reviews = [];
    }
    
    database.content.reviews.push(newReview);
    await saveDatabase();
    res.json(newReview);
});

// Обновить отзыв
app.put('/api/reviews/:id', authenticateToken, async (req, res) => {
    const id = parseInt(req.params.id);
    const index = database.content.reviews.findIndex(r => r.id === id);
    
    if (index === -1) {
        return res.status(404).json({ error: 'Review not found' });
    }
    
    database.content.reviews[index] = { ...database.content.reviews[index], ...req.body };
    await saveDatabase();
    res.json(database.content.reviews[index]);
});

// Удалить отзыв
app.delete('/api/reviews/:id', authenticateToken, async (req, res) => {
    const id = parseInt(req.params.id);
    database.content.reviews = database.content.reviews.filter(r => r.id !== id);
    await saveDatabase();
    res.json({ message: 'Review deleted' });
});

// ============ IMAGE UPLOAD ============

// Загрузка изображения
app.post('/api/upload', authenticateToken, upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const type = req.query.type || req.body.type || 'general';
    const imageUrl = `/uploads/${type}/${req.file.filename}`;
    res.json({ url: imageUrl, filename: req.file.filename, type: type });
});

// ============ FORMS ROUTES ============

// Получить все заявки
app.get('/api/forms', authenticateToken, (req, res) => {
    res.json(database.forms);
});

// Создать заявку (публичный endpoint)
app.post('/api/forms', async (req, res) => {
    const newForm = {
        id: Date.now(),
        ...req.body,
        createdAt: new Date().toISOString(),
        status: 'new'
    };
    
    database.forms.push(newForm);
    await saveDatabase();
    
    // Здесь можно добавить отправку email уведомления
    
    res.json({ message: 'Form submitted successfully', id: newForm.id });
});

// Обновить статус заявки
app.put('/api/forms/:id', authenticateToken, async (req, res) => {
    const id = parseInt(req.params.id);
    const index = database.forms.findIndex(f => f.id === id);
    
    if (index === -1) {
        return res.status(404).json({ error: 'Form not found' });
    }
    
    database.forms[index] = { ...database.forms[index], ...req.body };
    await saveDatabase();
    res.json(database.forms[index]);
});

// Удалить заявку
app.delete('/api/forms/:id', authenticateToken, async (req, res) => {
    const id = parseInt(req.params.id);
    database.forms = database.forms.filter(f => f.id !== id);
    await saveDatabase();
    res.json({ message: 'Form deleted' });
});

// ============ STATS ============

// Получить статистику
app.get('/api/stats', authenticateToken, (req, res) => {
    const stats = {
        totalForms: database.forms.length,
        newForms: database.forms.filter(f => f.status === 'new').length,
        totalReviews: database.content.reviews?.length || 0,
        publishedReviews: database.content.reviews?.filter(r => r.published)?.length || 0
    };
    res.json(stats);
});

// Главная страница - явная отправка файла
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../index.html'), {
        headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
        }
    });
});

// Админ-панель
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, '../admin/index.html'), {
        headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
        }
    });
});

// Запуск сервера
const startServer = async () => {
    await initDirectories();
    await loadDatabase();
    
    app.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
        console.log(`📊 Admin panel: http://localhost:${PORT}/admin`);
    });
};

startServer();
