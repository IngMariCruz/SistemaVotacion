# 🗳️ Sistema de Votación para Seminario

Sistema web de votación en tiempo real con WebSockets, diseñado para seminarios con hasta 30 participantes.

## 📋 Características

- **Panel de Administrador**: Crear temas, controlar votación, ver resultados en tiempo real
- **Interfaz de Participante**: Votación simple con acceso via QR
- **Resultados en Tiempo Real**: Gráficos dinámicos actualizados automáticamente
- **Restricciones**: Máximo 30 participantes, 1 voto por persona
- **Diseño Responsive**: Optimizado para dispositivos móviles

## 🚀 Instalación

### Requisitos Previos
- Node.js (versión 14 o superior)
- npm (viene con Node.js)

### Pasos de Instalación

1. **Crear estructura de carpetas**:
```bash
mkdir voting-app
cd voting-app
mkdir public
cd public
mkdir css js
cd ..
```

2. **Copiar archivos**:
   - `server.js` → raíz del proyecto
   - `db.js` → raíz del proyecto
   - `package.json` → raíz del proyecto
   - `index.html`, `admin.html`, `participant.html`, `results.html` → carpeta `public/`
   - `styles.css` → carpeta `public/css/`
   - `admin.js`, `participant.js`, `results.js` → carpeta `public/js/`

3. **Instalar dependencias**:
```bash
npm install
```

4. **Iniciar el servidor**:
```bash
npm start
```

5. **Acceder a la aplicación**:
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