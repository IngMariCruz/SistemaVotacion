# 🗳️ Sistema de Votación para Seminario

Sistema web de votación en tiempo real con WebSockets, diseñado para seminarios con hasta 30 participantes.

## 📋 Características

- **Panel de Administrador**: Crear temas, controlar votación, ver resultados en tiempo real
- **Interfaz de Participante**: Votación simple con acceso via QR
- **Resultados en Tiempo Real**: Gráficos dinámicos actualizados automáticamente
- **Restricciones**: Máximo 30 participantes, 1 voto por persona
- **Diseño Responsive**: Optimizado para dispositivos móviles


## 🚀 Instalación y Despliegue

### Opción 1: Usando Docker Compose (Recomendado)

1. Asegúrate de tener [Docker](https://www.docker.com/products/docker-desktop/) instalado y en ejecución.
2. En la raíz del proyecto, ejecuta:
   ```bash
   docker compose up -d
   ```
3. Accede a la aplicación en tu navegador en: `http://localhost:5002`

---

### Opción 2: Instalación Manual

#### Requisitos Previos
- Node.js (versión 14 o superior)
- npm (viene con Node.js)

#### Pasos de Instalación

1. **Instalar dependencias**:
   ```bash
   npm install
   ```
2. **Iniciar el servidor**:
   ```bash
   npm start
   ```
3. **Acceder a la aplicación**:
   - Abrir navegador en: `http://localhost:3000`

## 📱 Uso de la Aplicación

### Para el Administrador (Expositor)

1. Acceder a: `http://localhost:3000/admin.html`
2. **Crear Temas**:
   - Escribir el nombre del tema
   - Clic en "Agregar Tema"
   - Repetir para todos los temas
3. **Abrir Votación**:
   - Clic en "Abrir Votación"
   - Se generará un código QR automáticamente
4. **Compartir acceso**:
   - Los participantes escanean el QR con su celular
   - O comparten el enlace manualmente
5. **Monitorear**:
   - Ver estadísticas en tiempo real
   - Ver resultados actualizados automáticamente
6. **Cerrar Votación**:
   - Clic en "Cerrar Votación" cuando termine el tiempo
7. **Ver Resultados Finales**:
   - Clic en "Ver Resultados" o acceder a `/results.html`

### Para Participantes

1. **Escanear QR** o acceder a: `http://localhost:3000/participant.html`
2. **Registrarse**:
   - Ingresar nombre
   - Clic en "Ingresar"
3. **Esperar** que el administrador abra la votación
4. **Votar**:
   - Seleccionar un tema
   - Clic en "Votar"
   - Ver confirmación
5. **Ver Resultados** (opcional)

### Pantalla de Resultados (Para Proyectar)

- Acceder a: `http://localhost:3000/results.html`
- Se actualiza automáticamente cada 3 segundos
- Muestra gráfico de barras y