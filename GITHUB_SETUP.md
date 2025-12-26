# Настройка GitHub для загрузки кода

## Способ 1: Использование SSH ключа (Рекомендуется)

### Шаг 1: Проверка существующего SSH ключа
```bash
ls -la ~/.ssh
```

Если вы видите файлы `id_rsa` и `id_rsa.pub` (или `id_ed25519` и `id_ed25519.pub`), у вас уже есть SSH ключ.

### Шаг 2: Создание нового SSH ключа (если нужно)
```bash
ssh-keygen -t ed25519 -C "your_email@example.com"
```

Нажмите Enter для использования расположения по умолчанию и установите пароль (или оставьте пустым).

### Шаг 3: Добавление SSH ключа в ssh-agent
```bash
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519
```

### Шаг 4: Копирование публичного ключа
```bash
cat ~/.ssh/id_ed25519.pub
```

Скопируйте весь вывод.

### Шаг 5: Добавление ключа в GitHub
1. Перейдите на GitHub.com
2. Нажмите на ваш аватар → Settings
3. В боковом меню выберите "SSH and GPG keys"
4. Нажмите "New SSH key"
5. Вставьте скопированный ключ и нажмите "Add SSH key"

### Шаг 6: Настройка репозитория для использования SSH
```bash
git remote set-url origin git@github.com:seplitza/longevity-landing.git
```

### Шаг 7: Загрузка кода
```bash
git add .
git commit -m "Add longevity landing page code"
git push origin main
```

## Способ 2: Использование Personal Access Token (PAT)

### Шаг 1: Создание Personal Access Token
1. Перейдите на GitHub.com
2. Нажмите на ваш аватар → Settings
3. В боковом меню внизу выберите "Developer settings"
4. Выберите "Personal access tokens" → "Tokens (classic)"
5. Нажмите "Generate new token" → "Generate new token (classic)"
6. Установите:
   - Note: "Longevity Landing Upload"
   - Expiration: выберите период действия
   - Scopes: отметьте `repo` (полный доступ к приватным репозиториям)
7. Нажмите "Generate token"
8. **ВАЖНО**: Скопируйте токен сразу! Вы не сможете увидеть его снова.

### Шаг 2: Использование токена
При первом push Git запросит имя пользователя и пароль:
- Username: ваше имя пользователя GitHub
- Password: вставьте Personal Access Token (НЕ ваш пароль GitHub)

### Шаг 3: Сохранение учетных данных (опционально)
```bash
git config --global credential.helper store
```

Это сохранит ваш токен после первого использования.

### Шаг 4: Загрузка кода
```bash
git add .
git commit -m "Add longevity landing page code"
git push origin main
```

## Базовые команды Git для загрузки кода из VSCode

```bash
# 1. Перейти в папку с вашим проектом
cd /path/to/your/project

# 2. Инициализировать Git (если еще не сделано)
git init

# 3. Добавить удаленный репозиторий
git remote add origin git@github.com:seplitza/longevity-landing.git
# или с HTTPS:
# git remote add origin https://github.com/seplitza/longevity-landing.git

# 4. Добавить все файлы
git add .

# 5. Создать коммит
git commit -m "Initial commit: Add longevity landing page"

# 6. Отправить на GitHub
git push -u origin main
```

## Использование GitHub из VSCode

VSCode имеет встроенную поддержку Git:

1. Откройте папку с вашим проектом в VSCode
2. Откройте Source Control (Ctrl+Shift+G)
3. Нажмите "Initialize Repository" (если не инициализирован)
4. Добавьте удаленный репозиторий через терминал VSCode
5. Используйте GUI VSCode для коммитов и push

## Проверка конфигурации

```bash
# Проверить имя пользователя и email
git config user.name
git config user.email

# Установить, если не настроено
git config --global user.name "Your Name"
git config --global user.email "your_email@example.com"

# Проверить удаленный репозиторий
git remote -v
```

## Решение распространенных проблем

### Permission denied (publickey)
- Убедитесь, что SSH ключ добавлен в GitHub
- Проверьте, что ssh-agent запущен: `eval "$(ssh-agent -s)"`
- Добавьте ключ: `ssh-add ~/.ssh/id_ed25519`

### Authentication failed
- При использовании HTTPS убедитесь, что используете Personal Access Token, а не пароль
- Проверьте, что токен имеет правильные разрешения (scope: repo)

### fatal: 'origin' does not appear to be a git repository
- Добавьте удаленный репозиторий: `git remote add origin <url>`
