FROM node:18 AS builder

# Встановлюємо робочу директорію у контейнері
WORKDIR /usr/src/app

# Копіюємо package.json та package-lock.json у робочу директорію
COPY package*.json ./

# Встановлюємо залежності
RUN npm install --legacy-peer-deps

# Копіюємо всі файли з поточної директорії у контейнер
COPY . .

CMD ["node", "dist/apps/users/main"]

# Виставляємо порт, який буде використовуватися додатком

# RUN yarn build

# FROM node:18

# COPY --from=builder /app/node_modules ./node_modules
# COPY --from=builder /app/package*.json ./
# COPY --from=builder /app/dist ./dist

# EXPOSE 9002

# CMD [ "yarn", "start" ]