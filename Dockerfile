# Stage 1: Build the Next.js frontend application
FROM node:18 AS build

# Nastavte pracovní adresář pro frontend
WORKDIR /usr/src/app

# Kopírujte package.json a package-lock.json pro frontend
COPY fantasy-table/package*.json ./
RUN npm install

# Kopírujte frontend kód
COPY fantasy-table ./

# Vytvořte build Next.js aplikace
RUN npm run build

# Stage 2: Build the Node.js backend application
FROM node:18 AS backend

# Nastavte pracovní adresář pro backend
WORKDIR /usr/src/app

# Kopírujte package.json a package-lock.json pro backend
COPY proxy-server/package*.json ./
RUN npm install

# Kopírujte backend kód
COPY proxy-server ./

# Otevřete port, na kterém backend server naslouchá
EXPOSE 5000

# Stage 3: Final stage
FROM node:18

# Nastavte pracovní adresář pro finální image
WORKDIR /usr/src/app

# Kopírujte build frontend aplikace
COPY --from=build /usr/src/app/.next /usr/src/app/.next
COPY --from=build /usr/src/app/public /usr/src/app/public
COPY --from=build /usr/src/app/package*.json /usr/src/app/

# Nainstalujte produkční závislosti
RUN npm install --production

# Kopírujte backend kód
COPY --from=backend /usr/src/app /usr/src/app

# Otevřete porty pro frontend a backend
EXPOSE 5000
EXPOSE 3000

# Spusťte backend server a Next.js server
CMD ["sh", "-c", "node /usr/src/app/server.js & npm start"]
