FROM node

# Встановлюємо робочу директорію у контейнері
WORKDIR /usr/src/app

# Копіюємо package.json та package-lock.json у робочу директорію
COPY ../../package.json ./

# Встановлюємо залежності
RUN npm install --legacy-peer-deps

# Копіюємо всі файли з поточної директорії у контейнер
COPY . .

CMD ["node", "dist/apps/managmenr-api/main"]

# Виставляємо порт, який буде використовуватися додатком