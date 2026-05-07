# backend/Dockerfile
FROM node:22-alpine

# Usuario no-root
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# Copiar dependencias
COPY package*.json ./

# ✅ --ignore-scripts evita que postinstall corra prisma generate antes de tiempo
RUN npm ci --omit=dev --ignore-scripts

# ✅ Copiar prisma ANTES de generar el cliente
COPY prisma ./prisma/

# ✅ Ahora sí generamos el cliente con el schema disponible
RUN npx prisma generate

# Copiar el resto del código
COPY src ./src/

# Cambiar al usuario no-root
USER appuser

EXPOSE 5003

CMD ["node", "./src/index.js"]