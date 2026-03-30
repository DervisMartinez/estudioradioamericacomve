# ---- Etapa 1: Construcción (Build) ----
# Usamos una imagen oficial de Node.js como base para construir el proyecto.
FROM node:20-alpine AS build

# Establecemos el directorio de trabajo dentro del contenedor.
WORKDIR /app

# Copiamos los archivos de dependencias y las instalamos.
COPY package*.json ./
RUN npm install

# Copiamos el resto del código fuente de la aplicación.
COPY . .

# Ejecutamos el script de build de Vite para generar los archivos estáticos.
RUN npm run build

# ---- Etapa 2: Producción (Serve) ----
# Usamos una imagen ligera de Nginx para servir los archivos.
FROM nginx:stable-alpine

# Copiamos los archivos estáticos construidos en la etapa anterior al directorio de Nginx.
COPY --from=build /app/dist /usr/share/nginx/html

# Copiamos la configuración personalizada de Nginx para que funcione React Router.
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exponemos el puerto 80 para que se pueda acceder a la aplicación.
EXPOSE 80

# El comando por defecto de Nginx ya es iniciar el servidor, así que no es necesario un CMD.