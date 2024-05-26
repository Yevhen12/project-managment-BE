FROM node:18 AS builder

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm cache clean --force
RUN npm install --legacy-peer-deps

COPY . .

CMD ["node", "dist/apps/auth/main"]

# RUN yarn build

# FROM node:18

# COPY --from=builder /app/node_modules ./node_modules
# COPY --from=builder /app/package*.json ./
# COPY --from=builder /app/dist ./dist

# EXPOSE 9002

# CMD [ "yarn", "start" ]