# TaskUni

TaskUni es una plataforma e-Business educativa para la gestión académica de estudiantes universitarios. Centraliza tareas, proyectos, calendario, recordatorios, productividad, planes y administración del negocio digital en una sola experiencia web construida con Next.js, React, TypeScript, PostgreSQL, Prisma y Tailwind CSS.

## Objetivo del proyecto

El objetivo de TaskUni es dejar de ser un prototipo aislado y convertirse en una base SaaS educativa realista para organizar la vida universitaria, administrar usuarios y visualizar métricas académicas y comerciales desde un mismo sistema.

## Características principales

### Características del estudiante

- Registro e inicio de sesión.
- Dashboard académico.
- Gestión de tareas.
- Gestión de cursos.
- Proyectos grupales.
- Calendario.
- Recordatorios.
- Productividad.
- Plan actual.
- Soporte.

### Características del administrador

- Dashboard administrativo.
- Gestión de usuarios.
- Gestión de estudiantes.
- Planes y suscripciones.
- Pagos.
- Tareas registradas.
- Proyectos registrados.
- Soporte.
- Reportes.
- Marketing.
- Finanzas.
- Recursos humanos.
- Logística digital.
- Configuración.

## Stack tecnológico

- Next.js 14.
- React 18.
- TypeScript.
- Tailwind CSS.
- PostgreSQL.
- Prisma ORM.
- bcryptjs.
- NextAuth/Auth.js.
- Vercel, Neon, Supabase o Railway para despliegue.

## Arquitectura del proyecto

```text
taskuni/
├── src/
│   ├── app/
│   ├── components/
│   ├── lib/
│   ├── middleware.ts
│   └── types/
├── prisma/
├── public/
├── styles/
└── services/
```

## Base de datos

TaskUni usa PostgreSQL con Prisma y mantiene un esquema normalizado con nombres en español. Los modelos principales son:

- Usuario
- PerfilEstudiante
- Plan
- Suscripcion
- Curso
- Tarea
- Proyecto
- IntegranteProyecto
- TareaProyecto
- Recordatorio
- EventoCalendario
- ConsultaSoporte
- ReporteProductividad
- Pago

La base está diseñada cercanamente a 3FN, separando usuario, perfil, suscripción, contenido académico, soporte y pagos para evitar redundancia innecesaria.

## Requisitos previos

- Node.js.
- npm o pnpm.
- PostgreSQL.
- Git.
- Visual Studio Code.

## Instalación

```bash
git clone <url-del-repositorio>
cd taskuni
npm install
```

Luego configura el archivo `.env`, genera Prisma y aplica la migración inicial:

```bash
npx prisma generate
npx prisma migrate dev
npx prisma db seed
npm run dev
```

## Variables de entorno

Ejemplo sugerido:

```env
DATABASE_URL="postgresql://usuario:password@localhost:5432/taskuni"
NEXTAUTH_SECRET="tu_secreto_largo_y_aleatorio"
NEXTAUTH_URL="http://localhost:3000"
```

## Ejecución del seed

El seed crea datos de prueba realistas para estudiantes, administrador, planes, pagos, soporte, tareas, proyectos, cursos, eventos y reportes de productividad.

Usuarios de prueba:

- admin@taskuni.edu.pe
- manuel.torres@unt.edu.pe
- ana.quiroz@unt.edu.pe
- jorge.paredes@unt.edu.pe

Contraseña:

- Password123!

## Scripts disponibles

- `npm run dev`
- `npm run build`
- `npm run start`
- `npm run lint`
- `npx prisma studio`
- `npx prisma migrate dev`
- `npx prisma db seed`

## Roles del sistema

- Estudiante.
- Administrador.

## Rutas principales

### Rutas públicas

- `/`
- `/login`
- `/registro`
- `/planes`
- `/contacto`

### Rutas estudiante

- `/dashboard`
- `/tareas`
- `/cursos`
- `/proyectos`
- `/calendario`
- `/recordatorios`
- `/productividad`
- `/plan`
- `/soporte`
- `/configuracion`

### Rutas administrador

- `/admin/dashboard`
- `/admin/usuarios`
- `/admin/estudiantes`
- `/admin/planes`
- `/admin/pagos`
- `/admin/tareas`
- `/admin/proyectos`
- `/admin/soporte`
- `/admin/reportes`
- `/admin/marketing`
- `/admin/finanzas`
- `/admin/recursos-humanos`
- `/admin/logistica-digital`
- `/admin/configuracion`

## Modo claro y oscuro

TaskUni soporta light/dark mode con Tailwind CSS en modo `class`. La preferencia del usuario se guarda en `localStorage` y se puede alternar con el botón de tema visible en los headers y en las pantallas de configuración.

## Reportes administrativos

El módulo administrativo incluye reportes de usuarios, suscripciones y pagos, uso académico, soporte y un resumen ejecutivo. La vista permite generar, previsualizar, exportar CSV e imprimir o exportar a PDF mediante el navegador.

## Notificaciones

La campanita de notificaciones se genera dinámicamente desde la base de datos. Para estudiantes muestra tareas próximas, tareas vencidas, recordatorios, eventos e interacciones de proyectos. Para administradores muestra registros nuevos, soporte pendiente, pagos y actividad comercial.

## Seguridad

- Contraseñas hasheadas.
- Rutas protegidas.
- Control por roles.
- Variables de entorno.
- Validación de formularios.
- No exponer credenciales.

## Normalización de la base de datos

- Separación de usuario y perfil_estudiante.
- Separación de plan y suscripcion.
- Separación de curso, tarea y proyecto.
- Separación de pagos y soporte.
- Diseño cercano a 3FN.

## Capturas o evidencias

### Landing page

### Login

### Dashboard estudiante

### Dashboard administrador

### Reportes

### Modo oscuro

## Integrantes del equipo

| Integrante | Responsabilidad |
|---|---|
| David | Coordinación general, base de datos y dashboard |
| Jorge | Módulo estudiante y tareas |
| Roberto | Proyectos, calendario y productividad |
| Takeshy | Admin, planes, finanzas y reportes |
| Celeste | UI, soporte, marketing y documentación |

## Estado del proyecto

Prototipo académico funcional, actualmente en desarrollo y preparado para mejoras futuras.

## Mejoras futuras

- Integración con pasarela de pagos real.
- App móvil.
- Notificaciones push.
- IA para recordatorios inteligentes.
- Integración con Google Calendar.
- Integración con universidades.
- Reportes PDF avanzados.
- Panel institucional.

## Licencia

Proyecto académico. Uso educativo.
