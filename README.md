# Fútbol Stats & Probabilidades

Una aplicación web full-stack de estadísticas de fútbol inspirada en SofaScore y Flashscore, con un motor estadístico interno propio para el cálculo de probabilidades mediante la **Distribución de Poisson** (sin depender de cuotas de casas de apuestas externas).

La plataforma cubre las **Top 5 ligas europeas** (LaLiga, Premier League, Serie A, Bundesliga, Ligue 1) y está totalmente lista para ser empaquetada y desplegada utilizando **Docker Compose** en servidores propios (ej. LXC de Proxmox) o cualquier nube compatible.

---

## 🛠️ Arquitectura Técnica

El proyecto está diseñado de forma modular utilizando TypeScript de extremo a extremo:

1. **Frontend**: SPA moderna construida con **React 19**, **Vite** y estilizada mediante **Tailwind CSS**. Implementa un panel responsivo con micro-animaciones fluidas (`motion/react`).
2. **Backend**: Servidor API REST con **Express** que gestiona la persistencia de datos local/PostgreSQL, calcula en tiempo real las estadísticas agregadas de los equipos y las matrices de probabilidad para partidos.
3. **Ingest-Worker**: Un servicio de fondo (worker) que se ejecuta periódicamente para consultar nuevos resultados de `football-data.org` respetando las cuotas de peticiones gratuitas. Cuenta con un sistema inteligente de actualización y simulación offline en caso de no disponer de claves de API.
4. **Base de Datos**: Soporte para archivos locales JSON de alto rendimiento en entornos de desarrollo/pruebas (AI Studio Sandbox) y **PostgreSQL** para despliegues de producción persistentes en contenedores.

---

## 📊 Módulo Estadístico Interno: Distribución de Poisson

Para calcular el porcentaje de probabilidad del resultado del partido, evitamos las cuotas de casas de apuestas y aplicamos un modelo matemático determinista basado en el histórico de goles.

### 🧮 Fórmulas y Supuestos

Para un partido entre el **Equipo Local (H)** y el **Equipo Visitante (A)**:

1. **Fuerza de Ataque y Defensa**:
   - $FuerzaAtaqueLocal = \frac{\text{Media Goles Marcados Local en Casa}}{\text{Media Goles Marcados por todos los Locales en Liga}}$
   - $FuerzaDefensaLocal = \frac{\text{Media Goles Recibidos Local en Casa}}{\text{Media Goles Recibidos por todos los Locales en Liga}}$
   - $FuerzaAtaqueVisitante = \frac{\text{Media Goles Marcados Visitante Fuera}}{\text{Media Goles Marcados por todos los Visitantes en Liga}}$
   - $FuerzaDefensaVisitante = \frac{\text{Media Goles Recibidos Visitante Fuera}}{\text{Media Goles Recibidos por todos los Visitantes en Liga}}$

2. **Goles Esperados (xG o $\lambda$)**:
   - $\lambda_{\text{Local}} = FuerzaAtaqueLocal \times FuerzaDefensaVisitante \times \text{Media Goles Local de la Liga}$
   - $\lambda_{\text{Visitante}} = FuerzaAtaqueVisitante \times FuerzaDefensaLocal \times \text{Media Goles Visitante de la Liga}$

3. **Distribución de Poisson**:
   La probabilidad de marcar exactamente $k$ goles se calcula como:
   $$P(X = k) = \frac{\lambda^k e^{-\lambda}}{k!}$$

4. **Matriz de Probabilidad (6x6)**:
   Se construye una matriz conjunta de $0$ a $5$ goles para ambos equipos:
   $$P(\text{Local}=x, \text{Visitante}=y) = P(\text{Local}=x) \times P(\text{Visitante}=y)$$
   - **Victoria Local (1)**: Suma de la matriz donde $x > y$
   - **Empate (X)**: Suma de la matriz donde $x = y$
   - **Victoria Visitante (2)**: Suma de la matriz donde $x < y$
   - **Ambos Marcan (BTTS)**: Suma de la matriz donde $x \ge 1$ e $y \ge 1$
   - **Over 2.5 Goles**: Suma de la matriz donde $x + y > 2.5$

*Los vectores de probabilidad son normalizados al 100% para corregir la truncación física de marcadores superiores a 5 goles, garantizando una sumatoria exacta de resultados.*

---

## 🚀 Despliegue con Docker Compose (Servidor Propio / LXC de Proxmox)

Para desplegar la aplicación en tu propio servidor o LXC en Proxmox, sigue estos sencillos pasos:

### 1. Requisitos Previos
- Tener instalado **Docker** y **Docker Compose** en el servidor.
- Obtener un token gratuito en [football-data.org](https://www.football-data.org/) (opcional, si deseas sincronizar datos reales en producción).

### 2. Configurar el archivo `.env`
Crea un archivo `.env` en el directorio raíz de la aplicación a partir de la plantilla:
```bash
cp .env.example .env
```
Edita las variables en `.env`:
- `FOOTBALL_DATA_API_KEY`: Ingresa tu clave para sincronizar con datos reales en vivo. Si se deja en blanco, la app funcionará automáticamente en **modo simulación interactivo offline**, actualizando partidos con puntajes virtuales realistas.

### 3. Levantar la Aplicación
Ejecuta el siguiente comando para compilar e iniciar todo el stack:
```bash
docker compose up -d --build
```
Esto creará y ejecutará los siguientes contenedores:
1. `football-db`: Base de datos relacional PostgreSQL 15 con almacenamiento persistente.
2. `football-backend`: API REST en Express ejecutando consultas sobre estadísticas e históricos de equipos en el puerto `3000`.
3. `football-frontend`: Servidor web Nginx de alto rendimiento que expone la interfaz de usuario en el puerto `80`.
4. `football-worker`: Un cron-job continuo en segundo plano que realiza peticiones de sincronización seguras de forma periódica.

Accede a la app en tu navegador escribiendo la IP de tu servidor: `http://<IP-DE-TU-SERVIDOR>`.

---

## 🔄 Flujo de Actualización en Caliente (`git pull`)

Cuando hagas cambios en el código o descargues una nueva actualización desde GitHub, puedes reconstruir los servicios sin perder datos gracias a los volúmenes persistentes de Docker:

```bash
# 1. Obtener última versión del código
git pull origin main

# 2. Compilar de nuevo los contenedores y reiniciar servicios en segundo plano
docker compose up -d --build
```

---

## 🛡️ Descargo de Responsabilidad Obligatorio
*Las probabilidades mostradas en esta aplicación se calculan de forma algorítmica e interna utilizando promedios estadísticos históricos. No constituyen cuotas oficiales de casas de apuestas, consejos financieros de inversión ni garantías de resultados reales. Juegue con responsabilidad.*
