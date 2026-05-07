FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
COPY turbo.json ./
COPY apps/web/package*.json ./apps/web/
COPY packages ./packages
COPY apps/web ./apps/web
RUN npm ci
RUN npm run build --workspace @fet/web || npm run build
ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000
CMD ["npm", "run", "start", "--workspace", "@fet/web"]
