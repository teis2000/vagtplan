FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["sh", "-c", "node_modules/.bin/next start -p ${PORT:-3000} -H 0.0.0.0"]
