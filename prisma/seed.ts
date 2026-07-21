import {
  PrismaClient,
  Rol,
  EstadoUsuario,
  EstadoSuscripcion,
  PrioridadTarea,
  EstadoTarea,
  EstadoProyecto,
  EstadoIntegrante,
  TipoPlan,
  TipoEvento,
  TipoRecordatorio,
  EstadoRecordatorio,
  EstadoConsulta,
  EstadoPago,
  type Usuario,
  type Plan,
  type Suscripcion,
  type Curso,
  type Proyecto,
  type TareaProyecto,
  Prisma,
} from "@prisma/client";

import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
const PASSWORD = "Password123!";
const now = startOfDay(new Date());

// -------- Tipos del seed --------

type PlanesSeed = {
  planGratuito: Plan;
  planPremium: Plan;
};

type MapaUsuarios = Record<string, Usuario>;
type MapaCursos = Map<string, Curso>;

type EstudianteSeed = {
  key: string;
  nombres: string;
  apellidos: string;
  correo: string;
  universidad: string;
  carrera: string;
  ciclo: string;
  codigo: string;
  estado: EstadoUsuario;
  tipoPlan: TipoPlan;
  estadoSuscripcion: EstadoSuscripcion;
};

type TareaAcademicaSeed = readonly [
  cursoKey: string,
  titulo: string,
  descripcion: string,
  diasLimite: number,
  prioridad: PrioridadTarea,
  estado: EstadoTarea,
  avance: number,
];

type EventoSeed = readonly [
  usuarioKey: string,
  titulo: string,
  tipo: TipoEvento,
  dias: number,
  ubicacion: string | null,
  horaInicio: number,
  duracionMinutos: number,
];

type IntegranteProyectoSeed = {
  usuarioKey: string;
  rol: string;
  responsabilidad: string;
  estado: EstadoIntegrante;
};

type TareaProyectoSeed = {
  usuarioKey: string | null;
  titulo: string;
  descripcion: string;
  estado: EstadoTarea;
  prioridad: PrioridadTarea;
  diasLimite: number;
  avance: number;
};

type ProyectoSeed = {
  creadorKey: string;
  cursoKey?: string;
  nombre: string;
  descripcion: string;
  diasEntrega: number;
  estado: EstadoProyecto;
  integrantes: readonly IntegranteProyectoSeed[];
  tareas: readonly TareaProyectoSeed[];
};

// -------- Funciones auxiliares --------

function startOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

function withTime(date: Date, hours: number, minutes = 0): Date {
  const result = new Date(date);
  result.setHours(hours, minutes, 0, 0);
  return result;
}

function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60_000);
}

function calculateProgress(
  tasks: ReadonlyArray<{ avance_porcentual: number }>
): number {
  if (tasks.length === 0) {
    return 0;
  }
  const total = tasks.reduce((sum, task) => sum + task.avance_porcentual, 0);
  return Math.round(total / tasks.length);
}

function requireUser(userMap: MapaUsuarios, key: string): Usuario {
  const user = userMap[key];
  if (!user) {
    throw new Error(`Usuario no encontrado en el seed: ${key}`);
  }
  return user;
}

function requireCourse(courseMap: MapaCursos, key: string): Curso {
  const course = courseMap.get(key);
  if (!course) {
    throw new Error(`Curso no encontrado en el seed: ${key}`);
  }
  return course;
}

function validateProgress(value: number, context: string): void {
  if (!Number.isInteger(value) || value < 0 || value > 100) {
    throw new Error(
      `Avance inválido en ${context}: ${value}. Debe estar entre 0 y 100.`
    );
  }
}

async function cleanDatabase(): Promise<void> {
  console.log("🧹 Limpiando datos de demostración...");

  await prisma.$transaction([
    prisma.recordatorio.deleteMany(),
    prisma.tareaProyecto.deleteMany(),
    prisma.integranteProyecto.deleteMany(),
    prisma.proyecto.deleteMany(),
    prisma.eventoCalendario.deleteMany(),
    prisma.tarea.deleteMany(),
    prisma.curso.deleteMany(),
    prisma.reporteProductividad.deleteMany(),
    prisma.consultaSoporte.deleteMany(),
    prisma.pago.deleteMany(),
    prisma.suscripcion.deleteMany(),
    prisma.perfilEstudiante.deleteMany(),
    prisma.usuario.deleteMany(),
    prisma.plan.deleteMany(),
  ]);

  console.log("✅ Base de datos limpiada");
}

async function seedPlans(): Promise<PlanesSeed> {
  console.log("🌱 Creando planes...");

  const [planGratuito, planPremium] = await prisma.$transaction([
    prisma.plan.create({
      data: {
        nombre_plan: "Plan Gratuito",
        descripcion:
          "Gestión de tareas y cursos, recordatorios básicos, " +
          "proyectos limitados y reportes básicos.",
        precio_mensual: new Prisma.Decimal(0),
        tipo_plan: TipoPlan.gratuito,
        estado: "activo",
      },
    }),
    prisma.plan.create({
      data: {
        nombre_plan: "Plan Premium",
        descripcion:
          "Tareas ilimitadas, recordatorios inteligentes simulados, " +
          "analítica avanzada, tableros Kanban y mayor almacenamiento.",
        precio_mensual: new Prisma.Decimal("19.90"),
        tipo_plan: TipoPlan.premium,
        estado: "activo",
      },
    }),
  ]);

  console.log("✅ Planes creados");

  return { planGratuito, planPremium };
}

const estudiantesBase: readonly EstudianteSeed[] = [
  {
    key: "manuel",
    nombres: "Manuel",
    apellidos: "Torres Vega",
    correo: "manuel.torres@unt.edu.pe",
    universidad: "Universidad Nacional de Trujillo",
    carrera: "Ingeniería de Sistemas",
    ciclo: "8vo ciclo",
    codigo: "UNT2021045",
    estado: EstadoUsuario.activo,
    tipoPlan: TipoPlan.premium,
    estadoSuscripcion: EstadoSuscripcion.activa,
  },
  {
    key: "ana",
    nombres: "Ana",
    apellidos: "Quiroz Delgado",
    correo: "ana.quiroz@unt.edu.pe",
    universidad: "Universidad Nacional de Trujillo",
    carrera: "Ingeniería de Sistemas",
    ciclo: "8vo ciclo",
    codigo: "UNT2021102",
    estado: EstadoUsuario.activo,
    tipoPlan: TipoPlan.gratuito,
    estadoSuscripcion: EstadoSuscripcion.activa,
  },
  {
    key: "jorge",
    nombres: "Jorge",
    apellidos: "Paredes León",
    correo: "jorge.paredes@unt.edu.pe",
    universidad: "Universidad Nacional de Trujillo",
    carrera: "Ingeniería Civil",
    ciclo: "6to ciclo",
    codigo: "UNT2022078",
    estado: EstadoUsuario.activo,
    tipoPlan: TipoPlan.premium,
    estadoSuscripcion: EstadoSuscripcion.activa,
  },
  {
    key: "sofia",
    nombres: "Sofía",
    apellidos: "Rojas Paredes",
    correo: "sofia.rojas@upao.edu.pe",
    universidad: "Universidad Privada Antenor Orrego",
    carrera: "Administración",
    ciclo: "5to ciclo",
    codigo: "UPAO2023051",
    estado: EstadoUsuario.activo,
    tipoPlan: TipoPlan.premium,
    estadoSuscripcion: EstadoSuscripcion.activa,
  },
  {
    key: "kevin",
    nombres: "Kevin",
    apellidos: "Salazar Inga",
    correo: "kevin.salazar@unt.edu.pe",
    universidad: "Universidad Nacional de Trujillo",
    carrera: "Física",
    ciclo: "4to ciclo",
    codigo: "UNT2023120",
    estado: EstadoUsuario.inactivo,
    tipoPlan: TipoPlan.gratuito,
    estadoSuscripcion: EstadoSuscripcion.vencida,
  },
  {
    key: "valeria",
    nombres: "Valeria",
    apellidos: "Cárdenas Muñoz",
    correo: "valeria.cardenas@ucv.edu.pe",
    universidad: "Universidad César Vallejo",
    carrera: "Administración y Negocios Internacionales",
    ciclo: "7mo ciclo",
    codigo: "UCV2022154",
    estado: EstadoUsuario.activo,
    tipoPlan: TipoPlan.premium,
    estadoSuscripcion: EstadoSuscripcion.activa,
  },
  {
    key: "diego",
    nombres: "Diego",
    apellidos: "Herrera Soto",
    correo: "diego.herrera@upao.edu.pe",
    universidad: "Universidad Privada Antenor Orrego",
    carrera: "Ingeniería Industrial",
    ciclo: "9no ciclo",
    codigo: "UPAO2021088",
    estado: EstadoUsuario.activo,
    tipoPlan: TipoPlan.premium,
    estadoSuscripcion: EstadoSuscripcion.activa,
  },
  {
    key: "mariana",
    nombres: "Mariana",
    apellidos: "Flores Castillo",
    correo: "mariana.flores@unt.edu.pe",
    universidad: "Universidad Nacional de Trujillo",
    carrera: "Ingeniería Industrial",
    ciclo: "6to ciclo",
    codigo: "UNT2023220",
    estado: EstadoUsuario.activo,
    tipoPlan: TipoPlan.gratuito,
    estadoSuscripcion: EstadoSuscripcion.activa,
  },
  {
    key: "rosa",
    nombres: "Rosa",
    apellidos: "Ruiz Luján",
    correo: "rosa.ruiz@upn.edu.pe",
    universidad: "Universidad Privada del Norte",
    carrera: "Marketing y Gestión Comercial",
    ciclo: "3er ciclo",
    codigo: "UPN2024011",
    estado: EstadoUsuario.activo,
    tipoPlan: TipoPlan.premium,
    estadoSuscripcion: EstadoSuscripcion.activa,
  },
  {
    key: "pedro",
    nombres: "Pedro",
    apellidos: "Abarca Jiménez",
    correo: "pedro.abarca@upao.edu.pe",
    universidad: "Universidad Privada Antenor Orrego",
    carrera: "Ingeniería de Sistemas",
    ciclo: "4to ciclo",
    codigo: "UPAO2024032",
    estado: EstadoUsuario.activo,
    tipoPlan: TipoPlan.premium,
    estadoSuscripcion: EstadoSuscripcion.cancelada,
  },
  {
    key: "laura",
    nombres: "Laura",
    apellidos: "Torres Medina",
    correo: "laura.torres@unt.edu.pe",
    universidad: "Universidad Nacional de Trujillo",
    carrera: "Administración",
    ciclo: "2do ciclo",
    codigo: "UNT2024025",
    estado: EstadoUsuario.activo,
    tipoPlan: TipoPlan.premium,
    estadoSuscripcion: EstadoSuscripcion.activa,
  },
  {
    key: "carlos",
    nombres: "Carlos",
    apellidos: "Mendoza Ríos",
    correo: "carlos.mendoza@ucv.edu.pe",
    universidad: "Universidad César Vallejo",
    carrera: "Derecho",
    ciclo: "5to ciclo",
    codigo: "UCV2022018",
    estado: EstadoUsuario.activo,
    tipoPlan: TipoPlan.gratuito,
    estadoSuscripcion: EstadoSuscripcion.activa,
  },
  {
    key: "gabriela",
    nombres: "Gabriela",
    apellidos: "Sánchez Luna",
    correo: "gabriela.sanchez@upn.edu.pe",
    universidad: "Universidad Privada del Norte",
    carrera: "Psicología",
    ciclo: "7mo ciclo",
    codigo: "UPN2021095",
    estado: EstadoUsuario.activo,
    tipoPlan: TipoPlan.premium,
    estadoSuscripcion: EstadoSuscripcion.activa,
  },
  {
    key: "fernando",
    nombres: "Fernando",
    apellidos: "López Chávez",
    correo: "fernando.lopez@unt.edu.pe",
    universidad: "Universidad Nacional de Trujillo",
    carrera: "Medicina",
    ciclo: "3er ciclo",
    codigo: "UNT2024088",
    estado: EstadoUsuario.activo,
    tipoPlan: TipoPlan.premium,
    estadoSuscripcion: EstadoSuscripcion.activa,
  },
  {
    key: "patricia",
    nombres: "Patricia",
    apellidos: "Morales Flores",
    correo: "patricia.morales@upao.edu.pe",
    universidad: "Universidad Privada Antenor Orrego",
    carrera: "Arquitectura",
    ciclo: "6to ciclo",
    codigo: "UPAO2022076",
    estado: EstadoUsuario.activo,
    tipoPlan: TipoPlan.gratuito,
    estadoSuscripcion: EstadoSuscripcion.vencida,
  },
] as const;

async function seedUsers(): Promise<{
  administradores: Usuario[];
  estudiantes: Usuario[];
  usuariosPorKey: MapaUsuarios;
}> {
  console.log("🌱 Creando usuarios...");

  const passwordHash = await bcrypt.hash(PASSWORD, 10);

  const administradores = await prisma.$transaction([
    prisma.usuario.create({
      data: {
        nombres: "Administrador",
        apellidos: "TaskUni",
        correo: "admin@taskuni.edu.pe",
        correo_norm: "admin@taskuni.edu.pe",
        contrasena_hash: passwordHash,
        rol: Rol.administrador,
        estado: EstadoUsuario.activo,
        fecha_registro: addDays(now, -180),
        ultimo_acceso: addDays(now, -1),
      },
    }),
    prisma.usuario.create({
      data: {
        nombres: "Coordinador",
        apellidos: "TaskUni",
        correo: "coordinador@taskuni.edu.pe",
        correo_norm: "coordinador@taskuni.edu.pe",
        contrasena_hash: passwordHash,
        rol: Rol.administrador,
        estado: EstadoUsuario.activo,
        fecha_registro: addDays(now, -150),
        ultimo_acceso: addDays(now, -2),
      },
    }),
  ]);

  const estudiantes: Usuario[] = [];

  for (const [index, estudiante] of estudiantesBase.entries()) {
    const correoNormalizado = estudiante.correo.trim().toLowerCase();

    const usuario = await prisma.usuario.create({
      data: {
        nombres: estudiante.nombres,
        apellidos: estudiante.apellidos,
        correo: estudiante.correo,
        correo_norm: correoNormalizado,
        contrasena_hash: passwordHash,
        rol: Rol.estudiante,
        estado: estudiante.estado,
        fecha_registro: addDays(now, -(180 - index * 8)),
        ultimo_acceso:
          estudiante.estado === EstadoUsuario.activo
            ? addDays(now, -(index % 7))
            : addDays(now, -45),
        perfil_estudiante: {
          create: {
            universidad: estudiante.universidad,
            carrera: estudiante.carrera,
            ciclo_academico: estudiante.ciclo,
            codigo_estudiante: estudiante.codigo,
          },
        },
      },
    });

    estudiantes.push(usuario);
  }

  const usuariosPorKey: MapaUsuarios = Object.fromEntries(
    estudiantesBase.map((estudiante, index) => [
      estudiante.key,
      estudiantes[index],
    ])
  );

  console.log("✅ Usuarios y perfiles creados");

  return { administradores, estudiantes, usuariosPorKey };
}

async function seedSubscriptions(
  usuariosPorKey: MapaUsuarios,
  planes: PlanesSeed
): Promise<Record<string, Suscripcion>> {
  console.log("🌱 Creando suscripciones...");

  const suscripcionesPorKey: Record<string, Suscripcion> = {};

  for (const [index, estudiante] of estudiantesBase.entries()) {
    const usuario = requireUser(usuariosPorKey, estudiante.key);

    const plan =
      estudiante.tipoPlan === TipoPlan.premium
        ? planes.planPremium
        : planes.planGratuito;

    const fechaInicio = addDays(now, -(120 - index * 5));

    let fechaFin: Date | null;

    switch (estudiante.estadoSuscripcion) {
      case EstadoSuscripcion.vencida:
        fechaFin = addDays(now, -15);
        break;
      case EstadoSuscripcion.cancelada:
        fechaFin = addDays(now, -30);
        break;
      case EstadoSuscripcion.activa:
        fechaFin =
          estudiante.tipoPlan === TipoPlan.premium
            ? addDays(now, 30 + index * 3)
            : null;
        break;
      default:
        fechaFin = null;
    }

    const suscripcion = await prisma.suscripcion.create({
      data: {
        id_usuario: usuario.id_usuario,
        id_plan: plan.id_plan,
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin,
        estado_suscripcion: estudiante.estadoSuscripcion,
      },
    });

    suscripcionesPorKey[estudiante.key] = suscripcion;
  }

  console.log("✅ Suscripciones creadas");

  return suscripcionesPorKey;
}

type PagoSeed = {
  key: string;
  monto: string;
  metodo: "Tarjeta" | "Yape" | "Plin" | "Transferencia";
  estado: EstadoPago;
  dias: number;
};

async function seedPayments(
  usuariosPorKey: MapaUsuarios,
  suscripcionesPorKey: Record<string, Suscripcion>
): Promise<void> {
  console.log("🌱 Creando pagos...");

  const pagosData: readonly PagoSeed[] = [
    { key: "manuel", monto: "19.90", metodo: "Tarjeta", estado: EstadoPago.aprobado, dias: -2 },
    { key: "manuel", monto: "19.90", metodo: "Tarjeta", estado: EstadoPago.aprobado, dias: -32 },
    { key: "manuel", monto: "19.90", metodo: "Tarjeta", estado: EstadoPago.pendiente, dias: -1 },
    { key: "jorge", monto: "19.90", metodo: "Yape", estado: EstadoPago.aprobado, dias: -8 },
    { key: "jorge", monto: "19.90", metodo: "Yape", estado: EstadoPago.aprobado, dias: -38 },
    { key: "sofia", monto: "19.90", metodo: "Plin", estado: EstadoPago.aprobado, dias: -14 },
    { key: "valeria", monto: "19.90", metodo: "Transferencia", estado: EstadoPago.aprobado, dias: -21 },
    { key: "diego", monto: "19.90", metodo: "Tarjeta", estado: EstadoPago.rechazado, dias: -10 },
    { key: "laura", monto: "19.90", metodo: "Yape", estado: EstadoPago.pendiente, dias: -4 },
    { key: "rosa", monto: "19.90", metodo: "Plin", estado: EstadoPago.aprobado, dias: -12 },
    { key: "gabriela", monto: "19.90", metodo: "Transferencia", estado: EstadoPago.aprobado, dias: -20 },
    { key: "fernando", monto: "19.90", metodo: "Tarjeta", estado: EstadoPago.aprobado, dias: -25 },
    { key: "pedro", monto: "19.90", metodo: "Yape", estado: EstadoPago.aprobado, dias: -60 },
    { key: "pedro", monto: "19.90", metodo: "Yape", estado: EstadoPago.rechazado, dias: -30 },
  ];

  const operaciones = pagosData.map((pago) => {
    const usuario = requireUser(usuariosPorKey, pago.key);
    const suscripcion = suscripcionesPorKey[pago.key];

    if (!suscripcion) {
      throw new Error(
        `No existe suscripción para el usuario ${pago.key}`
      );
    }

    const estudiante = estudiantesBase.find(
      (item) => item.key === pago.key
    );

    if (!estudiante || estudiante.tipoPlan !== TipoPlan.premium) {
      throw new Error(
        `Se intentó crear un pago para un plan no Premium: ${pago.key}`
      );
    }

    return prisma.pago.create({
      data: {
        id_usuario: usuario.id_usuario,
        id_suscripcion: suscripcion.id_suscripcion,
        monto: new Prisma.Decimal(pago.monto),
        metodo_pago: pago.metodo,
        estado_pago: pago.estado,
        fecha_pago: addDays(now, pago.dias),
      },
    });
  });

  await prisma.$transaction(operaciones);

  console.log("✅ Pagos creados");
}

type CursoSeed = {
  key: string;
  usuarioKey: string;
  nombre: string;
  docente: string;
  ciclo: string;
};

async function seedCourses(usuariosPorKey: MapaUsuarios): Promise<MapaCursos> {
  console.log("🌱 Creando cursos...");

  const cursosData: readonly CursoSeed[] = [
    { key: "manuel-negocios-electronicos",   usuarioKey: "manuel",  nombre: "Negocios Electrónicos",          docente: "Dr. Huamán",     ciclo: "2026-I" },
    { key: "manuel-ingenieria-de-software",   usuarioKey: "manuel",  nombre: "Ingeniería de Software",         docente: "Ing. Vidal",     ciclo: "2026-I" },
    { key: "manuel-base-de-datos",           usuarioKey: "manuel",  nombre: "Base de Datos",                  docente: "Mg. Paredes",    ciclo: "2026-I" },
    { key: "manuel-inteligencia-artificial",  usuarioKey: "manuel",  nombre: "Inteligencia Artificial",        docente: "Dr. Rojas",      ciclo: "2026-I" },
    { key: "manuel-redes-y-comunicaciones",   usuarioKey: "manuel",  nombre: "Redes y Comunicaciones",         docente: "Ing. Castro",    ciclo: "2026-I" },
    { key: "ana-redes-y-telecomunicaciones",  usuarioKey: "ana",     nombre: "Redes y Telecomunicaciones",     docente: "Ing. Castro",    ciclo: "2026-I" },
    { key: "ana-gestion-de-proyectos",        usuarioKey: "ana",     nombre: "Gestión de Proyectos",           docente: "MSc. Valdez",    ciclo: "2026-I" },
    { key: "ana-estadistica-aplicada",        usuarioKey: "ana",     nombre: "Estadística Aplicada",           docente: "Dra. Gómez",     ciclo: "2026-I" },
    { key: "ana-programacion-web",            usuarioKey: "ana",     nombre: "Programación Web",               docente: "Ing. León",      ciclo: "2026-I" },
    { key: "jorge-e-business",               usuarioKey: "jorge",   nombre: "E-Business",                     docente: "Dr. Rojas",      ciclo: "2026-I" },
    { key: "jorge-arquitectura-de-software",  usuarioKey: "jorge",   nombre: "Arquitectura de Software",       docente: "Ing. Vidal",     ciclo: "2026-I" },
    { key: "jorge-seguridad-informatica",     usuarioKey: "jorge",   nombre: "Seguridad Informática",          docente: "Ing. Torres",    ciclo: "2026-I" },
    { key: "jorge-investigacion-de-operaciones", usuarioKey: "jorge", nombre: "Investigación de Operaciones",   docente: "Dr. Salinas",    ciclo: "2026-I" },
    { key: "sofia-desarrollo-de-aplicaciones", usuarioKey: "sofia",  nombre: "Desarrollo de Aplicaciones",     docente: "Ing. Vargas",    ciclo: "2026-I" },
    { key: "sofia-sistemas-distribuidos",     usuarioKey: "sofia",   nombre: "Sistemas Distribuidos",          docente: "Dr. Mendoza",    ciclo: "2026-I" },
    { key: "sofia-metodologia-de-la-investigacion", usuarioKey: "sofia", nombre: "Metodología de la Investigación", docente: "Dra. Salazar", ciclo: "2026-I" },
    { key: "diego-sistemas-operativos",       usuarioKey: "diego",   nombre: "Sistemas Operativos",            docente: "Ing. Torres",    ciclo: "2026-I" },
    { key: "diego-estructura-de-datos",      usuarioKey: "diego",   nombre: "Estructura de Datos",            docente: "Ing. León",      ciclo: "2026-I" },
    { key: "diego-compiladores",              usuarioKey: "diego",   nombre: "Compiladores",                   docente: "Dr. Castro",     ciclo: "2026-I" },
    { key: "mariana-investigacion-de-operaciones", usuarioKey: "mariana", nombre: "Investigación de Operaciones", docente: "Dr. Salinas", ciclo: "2026-I" },
    { key: "mariana-gestion-de-la-produccion", usuarioKey: "mariana", nombre: "Gestión de la Producción",      docente: "Mg. Flores",     ciclo: "2026-I" },
    { key: "mariana-logistica",               usuarioKey: "mariana", nombre: "Logística",                      docente: "Lic. Cueva",     ciclo: "2026-I" },
    { key: "rosa-marketing-digital",          usuarioKey: "rosa",    nombre: "Marketing Digital",              docente: "Lic. Cueva",     ciclo: "2026-I" },
    { key: "rosa-comportamiento-del-consumidor", usuarioKey: "rosa", nombre: "Comportamiento del Consumidor",   docente: "Dra. Gómez",     ciclo: "2026-I" },
    { key: "rosa-estrategia-comercial",       usuarioKey: "rosa",    nombre: "Estrategia Comercial",           docente: "Mg. Valdez",     ciclo: "2026-I" },
    { key: "pedro-desarrollo-de-software",    usuarioKey: "pedro",   nombre: "Desarrollo de Software",         docente: "Ing. Vargas",    ciclo: "2026-I" },
    { key: "pedro-testing-de-software",       usuarioKey: "pedro",   nombre: "Testing de Software",            docente: "Ing. Paredes",   ciclo: "2026-I" },
    { key: "pedro-devops",                    usuarioKey: "pedro",   nombre: "DevOps",                         docente: "Ing. Castro",    ciclo: "2026-I" },
    { key: "laura-administracion-de-negocios", usuarioKey: "laura",  nombre: "Administración de Negocios",     docente: "Mg. Flores",     ciclo: "2026-I" },
    { key: "laura-contabilidad-general",      usuarioKey: "laura",   nombre: "Contabilidad General",           docente: "Lic. Ruiz",      ciclo: "2026-I" },
    { key: "laura-finanzas-corporativas",     usuarioKey: "laura",   nombre: "Finanzas Corporativas",          docente: "Dr. Mendoza",    ciclo: "2026-I" },
    { key: "carlos-derecho-civil",            usuarioKey: "carlos",  nombre: "Derecho Civil",                  docente: "Dr. León",       ciclo: "2026-I" },
    { key: "carlos-derecho-penal",            usuarioKey: "carlos",  nombre: "Derecho Penal",                  docente: "Dr. Torres",     ciclo: "2026-I" },
    { key: "carlos-derecho-constitucional",   usuarioKey: "carlos",  nombre: "Derecho Constitucional",         docente: "Mg. Rojas",      ciclo: "2026-I" },
    { key: "gabriela-psicologia-social",      usuarioKey: "gabriela",nombre: "Psicología Social",              docente: "Dra. Salazar",   ciclo: "2026-I" },
    { key: "gabriela-psicologia-clinica",     usuarioKey: "gabriela",nombre: "Psicología Clínica",             docente: "Dr. Huamán",     ciclo: "2026-I" },
    { key: "gabriela-psicometria",            usuarioKey: "gabriela",nombre: "Psicometría",                    docente: "Mg. Paredes",    ciclo: "2026-I" },
    { key: "fernando-anatomia-humana",       usuarioKey: "fernando", nombre: "Anatomía Humana",                docente: "Dr. Herrera",    ciclo: "2026-I" },
    { key: "fernando-fisiologia",             usuarioKey: "fernando", nombre: "Fisiología",                     docente: "Dra. Flores",    ciclo: "2026-I" },
    { key: "fernando-bioquimica",             usuarioKey: "fernando", nombre: "Bioquímica",                     docente: "Dr. Salinas",    ciclo: "2026-I" },
    { key: "patricia-diseno-arquitectonico",  usuarioKey: "patricia",nombre: "Diseño Arquitectónico",          docente: "Ing. Mendoza",   ciclo: "2026-I" },
    { key: "patricia-historia-de-la-arquitectura", usuarioKey: "patricia", nombre: "Historia de la Arquitectura", docente: "Mg. Rojas",  ciclo: "2026-I" },
    { key: "patricia-urbanismo",              usuarioKey: "patricia",nombre: "Urbanismo",                      docente: "Lic. Cueva",     ciclo: "2026-I" },
  ];

  const mapaCursos: MapaCursos = new Map();

  for (const cursoData of cursosData) {
    const usuario = requireUser(usuariosPorKey, cursoData.usuarioKey);

    const curso = await prisma.curso.create({
      data: {
        id_usuario: usuario.id_usuario,
        nombre_curso: cursoData.nombre,
        docente: cursoData.docente,
        ciclo: cursoData.ciclo,
        estado: "activo",
      },
    });

    mapaCursos.set(cursoData.key, curso);
  }

  console.log("✅ Cursos creados");

  return mapaCursos;
}

async function seedTasks(cursoMap: MapaCursos): Promise<void> {
  console.log("🌱 Creando tareas académicas...");

  const tareasData: readonly TareaAcademicaSeed[] = [
    ["manuel-negocios-electronicos", "Elaborar matriz DAFO", "Analizar fortalezas, debilidades, oportunidades y amenazas.", 3, PrioridadTarea.alta, EstadoTarea.en_progreso, 60],
    ["manuel-negocios-electronicos", "Presentar avance del proyecto", "Exponer progreso actual y próximos hitos.", 5, PrioridadTarea.media, EstadoTarea.pendiente, 0],
    ["manuel-ingenieria-de-software", "Diseñar modelo de base de datos", "Definir entidades, relaciones y normalización.", 7, PrioridadTarea.alta, EstadoTarea.pendiente, 25],
    ["manuel-ingenieria-de-software", "Implementar autenticación", "Desarrollar sistema de login y registro.", 8, PrioridadTarea.alta, EstadoTarea.en_progreso, 40],
    ["manuel-base-de-datos", "Optimizar consultas SQL", "Mejorar rendimiento con índices.", -2, PrioridadTarea.baja, EstadoTarea.vencida, 40],
    ["manuel-base-de-datos", "Backup y restauración", "Implementar estrategia de respaldo.", -4, PrioridadTarea.alta, EstadoTarea.completada, 100],
    ["manuel-inteligencia-artificial", "Entrenar modelo de ML", "Implementar algoritmo de clasificación.", 10, PrioridadTarea.alta, EstadoTarea.pendiente, 15],
    ["ana-redes-y-telecomunicaciones", "Configurar router Cisco", "Práctica de enrutamiento estático.", 4, PrioridadTarea.alta, EstadoTarea.pendiente, 15],
    ["ana-redes-y-telecomunicaciones", "Subnetting avanzado", "Resolver ejercicios de VLSM.", 2, PrioridadTarea.media, EstadoTarea.en_progreso, 55],
    ["ana-redes-y-telecomunicaciones", "Cableado estructurado", "Diseñar topología de red.", -1, PrioridadTarea.baja, EstadoTarea.vencida, 45],
    ["ana-gestion-de-proyectos", "Diagrama de Gantt", "Crear cronograma del proyecto.", -5, PrioridadTarea.alta, EstadoTarea.completada, 100],
    ["ana-estadistica-aplicada", "Análisis de regresión", "Aplicar regresión lineal múltiple.", 6, PrioridadTarea.media, EstadoTarea.pendiente, 20],
    ["ana-programacion-web", "Desarrollar API REST", "Implementar endpoints con Node.js.", 1, PrioridadTarea.media, EstadoTarea.en_progreso, 70],
    ["jorge-e-business", "Canvas de negocio", "Definir propuesta de valor.", 5, PrioridadTarea.media, EstadoTarea.pendiente, 20],
    ["jorge-e-business", "Análisis de competencia", "Estudiar competidores del mercado.", 1, PrioridadTarea.media, EstadoTarea.en_progreso, 70],
    ["jorge-arquitectura-de-software", "Patrones de diseño", "Implementar Singleton y Factory.", -3, PrioridadTarea.alta, EstadoTarea.completada, 100],
    ["jorge-seguridad-informatica", "Auditoría de seguridad", "Revisar vulnerabilidades del sistema.", 8, PrioridadTarea.alta, EstadoTarea.pendiente, 10],
    ["jorge-investigacion-de-operaciones", "Modelo de transporte", "Resolver problema de optimización.", 12, PrioridadTarea.media, EstadoTarea.pendiente, 0],
    ["sofia-desarrollo-de-aplicaciones", "Desarrollar app móvil", "Implementar interfaz con React Native.", 6, PrioridadTarea.alta, EstadoTarea.en_progreso, 65],
    ["sofia-sistemas-distribuidos", "Microservicios", "Arquitectura con Docker y Kubernetes.", 8, PrioridadTarea.media, EstadoTarea.pendiente, 10],
    ["sofia-metodologia-de-la-investigacion", "Estado del arte", "Documentar fuentes y citas.", -1, PrioridadTarea.baja, EstadoTarea.vencida, 50],
    ["diego-sistemas-operativos", "Gestión de memoria", "Implementar paginación.", 3, PrioridadTarea.alta, EstadoTarea.pendiente, 0],
    ["diego-sistemas-operativos", "Planificación de procesos", "Algoritmos de scheduling.", -4, PrioridadTarea.alta, EstadoTarea.completada, 100],
    ["diego-estructura-de-datos", "Árboles y grafos", "Implementar estructuras de datos.", 2, PrioridadTarea.alta, EstadoTarea.en_progreso, 55],
    ["diego-compiladores", "Analizador léxico", "Desarrollar tokenizer.", -2, PrioridadTarea.alta, EstadoTarea.vencida, 40],
    ["mariana-investigacion-de-operaciones", "Programación lineal", "Resolver problema de maximización.", 7, PrioridadTarea.media, EstadoTarea.pendiente, 15],
    ["mariana-gestion-de-la-produccion", "Diagrama de flujo", "Mapear proceso de producción.", -3, PrioridadTarea.media, EstadoTarea.completada, 100],
    ["mariana-logistica", "Gestión de inventarios", "Modelo EOQ.", 9, PrioridadTarea.baja, EstadoTarea.pendiente, 5],
    ["rosa-marketing-digital", "Campaña en Instagram", "Diseñar anuncios para redes sociales.", 5, PrioridadTarea.alta, EstadoTarea.en_progreso, 58],
    ["rosa-comportamiento-del-consumidor", "Segmentación de mercado", "Identificar público objetivo.", 1, PrioridadTarea.media, EstadoTarea.pendiente, 25],
    ["rosa-estrategia-comercial", "Estrategia de precios", "Definir política de precios.", 11, PrioridadTarea.media, EstadoTarea.pendiente, 0],
    ["pedro-desarrollo-de-software", "API de tareas", "Implementar endpoints REST.", 4, PrioridadTarea.alta, EstadoTarea.en_progreso, 72],
    ["pedro-testing-de-software", "Pruebas unitarias", "Implementar Jest.", -1, PrioridadTarea.baja, EstadoTarea.vencida, 35],
    ["pedro-devops", "Pipeline CI/CD", "Configurar GitHub Actions.", 7, PrioridadTarea.alta, EstadoTarea.pendiente, 20],
    ["laura-administracion-de-negocios", "Presupuesto del proyecto", "Calcular costos y recursos.", 6, PrioridadTarea.media, EstadoTarea.pendiente, 20],
    ["laura-administracion-de-negocios", "Reporte de rentabilidad", "Analizar ingresos y costos.", -4, PrioridadTarea.alta, EstadoTarea.completada, 100],
    ["laura-contabilidad-general", "Balance general", "Elaborar estado financiero.", 8, PrioridadTarea.media, EstadoTarea.pendiente, 15],
    ["carlos-derecho-civil", "Caso práctico civil", "Analizar jurisprudencia.", 5, PrioridadTarea.alta, EstadoTarea.en_progreso, 45],
    ["carlos-derecho-penal", "Delitos informáticos", "Estudiar ciberdelitos.", 9, PrioridadTarea.baja, EstadoTarea.pendiente, 5],
    ["carlos-derecho-constitucional", "Habeas data", "Investigar protección de datos.", -2, PrioridadTarea.media, EstadoTarea.vencida, 30],
    ["gabriela-psicologia-social", "Investigación social", "Diseñar encuesta.", 4, PrioridadTarea.alta, EstadoTarea.pendiente, 0],
    ["gabriela-psicologia-clinica", "Evaluación psicológica", "Aplicar test de personalidad.", -5, PrioridadTarea.alta, EstadoTarea.completada, 100],
    ["gabriela-psicometria", "Análisis estadístico", "Procesar datos con SPSS.", 6, PrioridadTarea.media, EstadoTarea.en_progreso, 55],
    ["fernando-anatomia-humana", "Disección anatómica", "Práctica de laboratorio.", 3, PrioridadTarea.alta, EstadoTarea.pendiente, 0],
    ["fernando-fisiologia", "Sistema nervioso", "Estudiar neuroanatomía.", -4, PrioridadTarea.alta, EstadoTarea.completada, 100],
    ["fernando-bioquimica", "Metabolismo celular", "Investigar rutas metabólicas.", 7, PrioridadTarea.media, EstadoTarea.pendiente, 20],
    ["patricia-diseno-arquitectonico", "Proyecto residencial", "Diseñar casa unifamiliar.", 8, PrioridadTarea.alta, EstadoTarea.en_progreso, 65],
    ["patricia-historia-de-la-arquitectura", "Restauración arquitectónica", "Estudiar técnicas de conservación.", -1, PrioridadTarea.baja, EstadoTarea.vencida, 50],
    ["patricia-urbanismo", "Plan urbano", "Diseñar zonificación.", 10, PrioridadTarea.media, EstadoTarea.pendiente, 10],
    ["manuel-negocios-electronicos", "Preparar exposición del capítulo 4", "Organizar diapositivas y material.", 2, PrioridadTarea.alta, EstadoTarea.en_progreso, 80],
    ["ana-gestion-de-proyectos", "Gestión de riesgos", "Identificar riesgos del proyecto.", 10, PrioridadTarea.media, EstadoTarea.pendiente, 0],
    ["jorge-e-business", "Refactorización de código", "Mejorar calidad del código.", -1, PrioridadTarea.baja, EstadoTarea.completada, 100],
    ["sofia-desarrollo-de-aplicaciones", "Documentación técnica", "Actualizar README.", 7, PrioridadTarea.media, EstadoTarea.pendiente, 12],
    ["diego-estructura-de-datos", "Algoritmos de ordenamiento", "Implementar QuickSort y MergeSort.", 5, PrioridadTarea.alta, EstadoTarea.en_progreso, 50],
    ["mariana-investigacion-de-operaciones", "Teoría de colas", "Modelar sistema de espera.", 11, PrioridadTarea.media, EstadoTarea.pendiente, 0],
    ["rosa-marketing-digital", "Análisis de métricas", "Medir ROI de campañas.", 3, PrioridadTarea.alta, EstadoTarea.en_progreso, 70],
    ["pedro-desarrollo-de-software", "Integración con frontend", "Conectar API con React.", 6, PrioridadTarea.alta, EstadoTarea.pendiente, 25],
    ["laura-contabilidad-general", "Flujo de caja", "Proyectar movimientos de efectivo.", 9, PrioridadTarea.media, EstadoTarea.pendiente, 15],
    ["carlos-derecho-civil", "Contrato de arrendamiento", "Redactar contrato legal.", 4, PrioridadTarea.alta, EstadoTarea.en_progreso, 60],
    ["gabriela-psicologia-social", "Entrevista clínica", "Practicar técnicas de entrevista.", 8, PrioridadTarea.alta, EstadoTarea.pendiente, 30],
    ["fernando-anatomia-humana", "Farmacología", "Estudiar mecanismos de acción.", 12, PrioridadTarea.media, EstadoTarea.pendiente, 0],
    ["patricia-diseno-arquitectonico", "Render 3D", "Crear visualizaciones.", 5, PrioridadTarea.alta, EstadoTarea.en_progreso, 75],
    ["manuel-ingenieria-de-software", "Revisar bibliografía de investigación", "Actualizar referencias.", -3, PrioridadTarea.baja, EstadoTarea.vencida, 40],
    ["ana-estadistica-aplicada", "Práctica de correlación", "Resolver ejercicios.", -2, PrioridadTarea.media, EstadoTarea.vencida, 35],
    ["jorge-arquitectura-de-software", "Penetration testing", "Realizar pruebas de intrusión.", 14, PrioridadTarea.alta, EstadoTarea.pendiente, 0],
    ["sofia-sistemas-distribuidos", "Message queues", "Implementar RabbitMQ.", 9, PrioridadTarea.media, EstadoTarea.pendiente, 20],
    ["diego-sistemas-operativos", "Sistema de archivos", "Implementar ext4.", 6, PrioridadTarea.alta, EstadoTarea.en_progreso, 45],
    ["mariana-gestion-de-la-produccion", "Lean manufacturing", "Aplicar principios Just-in-Time.", 8, PrioridadTarea.media, EstadoTarea.pendiente, 30],
    ["rosa-comportamiento-del-consumidor", "Customer journey", "Mapear experiencia del cliente.", 4, PrioridadTarea.alta, EstadoTarea.en_progreso, 55],
    ["pedro-testing-de-software", "End-to-end testing", "Implementar Cypress.", 8, PrioridadTarea.media, EstadoTarea.pendiente, 15],
    ["laura-administracion-de-negocios", "Análisis de ratios", "Calcular indicadores financieros.", 7, PrioridadTarea.alta, EstadoTarea.en_progreso, 65],
    ["carlos-derecho-constitucional", "Derechos humanos", "Investigar tratados internacionales.", 6, PrioridadTarea.media, EstadoTarea.pendiente, 25],
    ["gabriela-psicologia-clinica", "Terapia cognitiva", "Estudiar modelo de Beck.", 10, PrioridadTarea.alta, EstadoTarea.pendiente, 0],
    ["fernando-fisiologia", "Sistema cardiovascular", "Estudiar anatomía del corazón.", 5, PrioridadTarea.alta, EstadoTarea.en_progreso, 50],
    ["patricia-urbanismo", "Sostenibilidad", "Diseñar edificio ecoeficiente.", 12, PrioridadTarea.media, EstadoTarea.pendiente, 10],
  ];

  const operaciones = tareasData.map(
    ([cursoKey, titulo, descripcion, diasLimite, prioridad, estado, avance]) => {
      const curso = requireCourse(cursoMap, cursoKey);

      validateProgress(avance, `tarea "${titulo}"`);

      if (estado === EstadoTarea.completada && avance !== 100) {
        throw new Error(
          `La tarea completada "${titulo}" debe tener avance 100`
        );
      }

      const fechaLimite = addDays(now, diasLimite);
      const completedAt = estado === EstadoTarea.completada
        ? (diasLimite < 0 ? addDays(fechaLimite, 1) : fechaLimite)
        : undefined;

      return prisma.tarea.create({
        data: {
          id_usuario: curso.id_usuario,
          id_curso: curso.id_curso,
          titulo,
          descripcion,
          fecha_limite: fechaLimite,
          prioridad,
          estado_tarea: estado,
          avance_porcentual: avance,
          completedAt,
        },
      });
    }
  );

  await prisma.$transaction(operaciones);

  console.log("✅ Tareas académicas creadas");
}

async function createProject(
  data: ProyectoSeed,
  usuariosPorKey: MapaUsuarios,
  cursoMap: MapaCursos
): Promise<Proyecto & { integrantes: unknown[]; tareas: TareaProyecto[] }> {
  const creador = requireUser(usuariosPorKey, data.creadorKey);

  const memberKeys = new Set(
    data.integrantes.map((integrante) => integrante.usuarioKey)
  );

  if (!memberKeys.has(data.creadorKey)) {
    throw new Error(
      `El creador ${data.creadorKey} no está incluido en el proyecto ${data.nombre}`
    );
  }

  for (const task of data.tareas) {
    validateProgress(task.avance, `tarea de proyecto "${task.titulo}"`);

    if (task.usuarioKey !== null && !memberKeys.has(task.usuarioKey)) {
      throw new Error(
        `El usuario ${task.usuarioKey} tiene una tarea en ` +
        `"${data.nombre}", pero no pertenece al proyecto`
      );
    }

    if (task.estado === EstadoTarea.completada && task.avance !== 100) {
      throw new Error(
        `La tarea completada "${task.titulo}" debe tener avance 100`
      );
    }
  }

  const progreso = calculateProgress(
    data.tareas.map((task) => ({ avance_porcentual: task.avance }))
  );

  const curso = data.cursoKey
    ? requireCourse(cursoMap, data.cursoKey)
    : null;

  return prisma.proyecto.create({
    data: {
      id_usuario_creador: creador.id_usuario,
      id_curso: curso?.id_curso,
      nombre_proyecto: data.nombre,
      descripcion: data.descripcion,
      fecha_entrega: addDays(now, data.diasEntrega),
      estado_proyecto: data.estado,
      avance_general: progreso,
      integrantes: {
        create: data.integrantes.map((integrante) => ({
          id_usuario: requireUser(usuariosPorKey, integrante.usuarioKey).id_usuario,
          rol_en_proyecto: integrante.rol,
          responsabilidad: integrante.responsabilidad,
          estado: integrante.estado,
        })),
      },
      tareas: {
        create: data.tareas.map((task) => ({
          id_usuario_asignado:
            task.usuarioKey === null
              ? null
              : requireUser(usuariosPorKey, task.usuarioKey).id_usuario,
          titulo: task.titulo,
          descripcion: task.descripcion,
          estado: task.estado,
          prioridad: task.prioridad,
          fecha_limite: addDays(now, task.diasLimite),
          avance_porcentual: task.avance,
        })),
      },
    },
    include: {
      integrantes: true,
      tareas: true,
    },
  });
}

async function seedProjects(
  usuariosPorKey: MapaUsuarios,
  cursoMap: MapaCursos
): Promise<Proyecto[]> {
  console.log("🌱 Creando proyectos...");

  const proyectosData: readonly ProyectoSeed[] = [
    {
      creadorKey: "manuel",
      cursoKey: "manuel-ingenieria-de-software",
      nombre: "TaskUni",
      descripcion:
        "Plataforma SaaS educativa para gestión académica y colaborativa.",
      diasEntrega: 28,
      estado: EstadoProyecto.en_progreso,
      integrantes: [
        { usuarioKey: "manuel", rol: "Coordinador general", responsabilidad: "Arquitectura y autenticación", estado: EstadoIntegrante.activo },
        { usuarioKey: "ana", rol: "Responsable de base de datos", responsabilidad: "Persistencia y reportes", estado: EstadoIntegrante.activo },
        { usuarioKey: "sofia", rol: "Diseñadora UI/UX", responsabilidad: "Interfaz y experiencia responsive", estado: EstadoIntegrante.activo },
        { usuarioKey: "jorge", rol: "Analista funcional", responsabilidad: "Requerimientos y pruebas", estado: EstadoIntegrante.activo },
      ],
      tareas: [
        { usuarioKey: "manuel", titulo: "Diseñar esquema Prisma", descripcion: "Definir entidades y relaciones.", estado: EstadoTarea.completada, prioridad: PrioridadTarea.alta, diasLimite: -10, avance: 100 },
        { usuarioKey: "sofia", titulo: "Implementar formulario de registro", descripcion: "Crear interfaz y validaciones.", estado: EstadoTarea.en_progreso, prioridad: PrioridadTarea.alta, diasLimite: 4, avance: 70 },
        { usuarioKey: "manuel", titulo: "Crear dashboard administrativo", descripcion: "Implementar métricas administrativas.", estado: EstadoTarea.en_progreso, prioridad: PrioridadTarea.media, diasLimite: 6, avance: 55 },
        { usuarioKey: "ana", titulo: "Ejecutar pruebas funcionales", descripcion: "Validar integración de módulos.", estado: EstadoTarea.pendiente, prioridad: PrioridadTarea.media, diasLimite: 8, avance: 0 },
      ],
    },
    {
      creadorKey: "jorge",
      cursoKey: "jorge-arquitectura-de-software",
      nombre: "Sistema de Gestión de Horarios",
      descripcion: "Sistema centralizado de horarios, aulas y avisos.",
      diasEntrega: 35,
      estado: EstadoProyecto.planificacion,
      integrantes: [
        { usuarioKey: "jorge", rol: "Coordinador general", responsabilidad: "Análisis de procesos", estado: EstadoIntegrante.activo },
        { usuarioKey: "diego", rol: "Líder de desarrollo", responsabilidad: "Backend y API", estado: EstadoIntegrante.activo },
        { usuarioKey: "mariana", rol: "Responsable de investigación", responsabilidad: "Estudio de campo", estado: EstadoIntegrante.invitado },
      ],
      tareas: [
        { usuarioKey: "jorge", titulo: "Levantamiento de requerimientos", descripcion: "Entrevistar usuarios.", estado: EstadoTarea.en_progreso, prioridad: PrioridadTarea.alta, diasLimite: 5, avance: 50 },
        { usuarioKey: "diego", titulo: "Arquitectura del sistema", descripcion: "Diseñar componentes.", estado: EstadoTarea.pendiente, prioridad: PrioridadTarea.alta, diasLimite: 9, avance: 20 },
        { usuarioKey: "mariana", titulo: "Validación de usuarios", descripcion: "Pruebas de usabilidad.", estado: EstadoTarea.pendiente, prioridad: PrioridadTarea.media, diasLimite: 11, avance: 10 },
        { usuarioKey: "jorge", titulo: "Prototipo de dashboard", descripcion: "Mockup inicial.", estado: EstadoTarea.completada, prioridad: PrioridadTarea.baja, diasLimite: -1, avance: 100 },
      ],
    },
    {
      creadorKey: "rosa",
      cursoKey: "manuel-inteligencia-artificial",
      nombre: "VineGuard AI",
      descripcion: "Sistema de IA para monitoreo y predicción de enfermedades en viñedos.",
      diasEntrega: 20,
      estado: EstadoProyecto.en_progreso,
      integrantes: [
        { usuarioKey: "rosa", rol: "Coordinador general", responsabilidad: "Estrategia digital", estado: EstadoIntegrante.activo },
        { usuarioKey: "valeria", rol: "Responsable de documentación", responsabilidad: "Documentación técnica", estado: EstadoIntegrante.invitado },
        { usuarioKey: "pedro", rol: "Líder de desarrollo", responsabilidad: "API y datos", estado: EstadoIntegrante.activo },
      ],
      tareas: [
        { usuarioKey: "rosa", titulo: "Mapa de información", descripcion: "Organizar datos.", estado: EstadoTarea.en_progreso, prioridad: PrioridadTarea.media, diasLimite: 3, avance: 60 },
        { usuarioKey: "valeria", titulo: "Diseño de prototipo", descripcion: "UI inicial.", estado: EstadoTarea.pendiente, prioridad: PrioridadTarea.media, diasLimite: 7, avance: 25 },
        { usuarioKey: "pedro", titulo: "Base de datos de sensores", descripcion: "Modelar datos IoT.", estado: EstadoTarea.pendiente, prioridad: PrioridadTarea.alta, diasLimite: 10, avance: 10 },
        { usuarioKey: "rosa", titulo: "Presentación ejecutiva", descripcion: "Pitch a inversores.", estado: EstadoTarea.completada, prioridad: PrioridadTarea.baja, diasLimite: -1, avance: 100 },
      ],
    },
    {
      creadorKey: "sofia",
      cursoKey: "sofia-desarrollo-de-aplicaciones",
      nombre: "Sistema de Gestión de Voluntarios",
      descripcion: "Plataforma para coordinar voluntarios en ONGs y proyectos sociales.",
      diasEntrega: 24,
      estado: EstadoProyecto.en_progreso,
      integrantes: [
        { usuarioKey: "sofia", rol: "Coordinador general", responsabilidad: "Diseño de producto", estado: EstadoIntegrante.activo },
        { usuarioKey: "laura", rol: "Responsable de investigación", responsabilidad: "Análisis financiero", estado: EstadoIntegrante.activo },
        { usuarioKey: "manuel", rol: "Líder de desarrollo", responsabilidad: "Implementación técnica", estado: EstadoIntegrante.activo },
      ],
      tareas: [
        { usuarioKey: "sofia", titulo: "Definir propuesta de valor", descripcion: "Value proposition.", estado: EstadoTarea.completada, prioridad: PrioridadTarea.alta, diasLimite: -2, avance: 100 },
        { usuarioKey: "laura", titulo: "Costos y rentabilidad", descripcion: "Análisis financiero.", estado: EstadoTarea.en_progreso, prioridad: PrioridadTarea.alta, diasLimite: 5, avance: 65 },
        { usuarioKey: "manuel", titulo: "Demo funcional", descripcion: "MVP funcional.", estado: EstadoTarea.pendiente, prioridad: PrioridadTarea.media, diasLimite: 9, avance: 20 },
        { usuarioKey: "sofia", titulo: "Pitch comercial", descripcion: "Presentación de ventas.", estado: EstadoTarea.pendiente, prioridad: PrioridadTarea.media, diasLimite: 11, avance: 0 },
      ],
    },
    {
      creadorKey: "diego",
      cursoKey: "diego-estructura-de-datos",
      nombre: "Plan Estratégico de Tecnologías de Información",
      descripcion: "Planificación estratégica de TI para una empresa mediana.",
      diasEntrega: 40,
      estado: EstadoProyecto.en_progreso,
      integrantes: [
        { usuarioKey: "diego", rol: "Coordinador general", responsabilidad: "Arquitectura backend", estado: EstadoIntegrante.activo },
        { usuarioKey: "mariana", rol: "Responsable de investigación", responsabilidad: "Procesos y métricas", estado: EstadoIntegrante.activo },
        { usuarioKey: "kevin", rol: "Responsable de pruebas", responsabilidad: "Soporte técnico", estado: EstadoIntegrante.invitado },
      ],
      tareas: [
        { usuarioKey: "diego", titulo: "Modelo de procesos", descripcion: "Mapear procesos.", estado: EstadoTarea.en_progreso, prioridad: PrioridadTarea.alta, diasLimite: 4, avance: 55 },
        { usuarioKey: "mariana", titulo: "Catálogo documental", descripcion: "Organizar docs.", estado: EstadoTarea.pendiente, prioridad: PrioridadTarea.media, diasLimite: 8, avance: 15 },
        { usuarioKey: "kevin", titulo: "Módulo de incidencias", descripcion: "Ticket system.", estado: EstadoTarea.pendiente, prioridad: PrioridadTarea.media, diasLimite: 12, avance: 5 },
        { usuarioKey: "diego", titulo: "Validación de KPIs", descripcion: "Definir métricas.", estado: EstadoTarea.completada, prioridad: PrioridadTarea.baja, diasLimite: -3, avance: 100 },
      ],
    },
    {
      creadorKey: "manuel",
      cursoKey: "manuel-ingenieria-de-software",
      nombre: "Chat TCP/IP",
      descripcion: "Aplicación de chat utilizando protocolos TCP/IP con sockets.",
      diasEntrega: 15,
      estado: EstadoProyecto.en_progreso,
      integrantes: [
        { usuarioKey: "manuel", rol: "Coordinador general", responsabilidad: "Full stack", estado: EstadoIntegrante.activo },
        { usuarioKey: "ana", rol: "Responsable de base de datos", responsabilidad: "Modelado de datos", estado: EstadoIntegrante.activo },
        { usuarioKey: "rosa", rol: "Diseñador UI/UX", responsabilidad: "UI de métricas", estado: EstadoIntegrante.activo },
      ],
      tareas: [
        { usuarioKey: "ana", titulo: "KPI de cumplimiento", descripcion: "Métricas de chat.", estado: EstadoTarea.completada, prioridad: PrioridadTarea.media, diasLimite: -1, avance: 100 },
        { usuarioKey: "manuel", titulo: "Gráfico de tendencia", descripcion: "Visualización de datos.", estado: EstadoTarea.en_progreso, prioridad: PrioridadTarea.alta, diasLimite: 3, avance: 75 },
        { usuarioKey: "rosa", titulo: "Layout de tarjetas", descripcion: "UI de mensajes.", estado: EstadoTarea.pendiente, prioridad: PrioridadTarea.baja, diasLimite: 6, avance: 30 },
        { usuarioKey: "manuel", titulo: "Pruebas de usuario", descripcion: "Testing UX.", estado: EstadoTarea.pendiente, prioridad: PrioridadTarea.media, diasLimite: 9, avance: 10 },
      ],
    },
    {
      creadorKey: "valeria",
      nombre: "Observatorio de Servicios TIC",
      descripcion: "Plataforma de monitoreo de servicios de tecnologías de información.",
      diasEntrega: 30,
      estado: EstadoProyecto.planificacion,
      integrantes: [
        { usuarioKey: "valeria", rol: "Coordinadora general", responsabilidad: "Gestión del proyecto", estado: EstadoIntegrante.activo },
        { usuarioKey: "laura", rol: "Analista", responsabilidad: "Indicadores y costos", estado: EstadoIntegrante.activo },
        { usuarioKey: "pedro", rol: "Líder de desarrollo", responsabilidad: "Arquitectura y backend", estado: EstadoIntegrante.activo },
      ],
      tareas: [
        { usuarioKey: "valeria", titulo: "Investigación de requerimientos", descripcion: "Analizar necesidades de monitoreo.", estado: EstadoTarea.en_progreso, prioridad: PrioridadTarea.alta, diasLimite: 6, avance: 45 },
        { usuarioKey: "pedro", titulo: "Diseño de arquitectura", descripcion: "Diseñar componentes del observatorio.", estado: EstadoTarea.pendiente, prioridad: PrioridadTarea.alta, diasLimite: 10, avance: 15 },
        { usuarioKey: "laura", titulo: "Definir indicadores", descripcion: "Definir disponibilidad, incidentes y recuperación.", estado: EstadoTarea.pendiente, prioridad: PrioridadTarea.media, diasLimite: 14, avance: 5 },
      ],
    },
    {
      creadorKey: "rosa",
      cursoKey: "pedro-desarrollo-de-software",
      nombre: "Sistema de Reserva de Laboratorios",
      descripcion: "Sistema para reservar laboratorios universitarios.",
      diasEntrega: 25,
      estado: EstadoProyecto.en_progreso,
      integrantes: [
        { usuarioKey: "rosa", rol: "Coordinador general", responsabilidad: "Gestión", estado: EstadoIntegrante.activo },
        { usuarioKey: "gabriela", rol: "Responsable de investigación", responsabilidad: "Investigación de usuarios", estado: EstadoIntegrante.activo },
        { usuarioKey: "pedro", rol: "Líder de desarrollo", responsabilidad: "Desarrollo", estado: EstadoIntegrante.activo },
      ],
      tareas: [
        { usuarioKey: "gabriela", titulo: "Encuesta a estudiantes", descripcion: "Recopilar requerimientos.", estado: EstadoTarea.completada, prioridad: PrioridadTarea.alta, diasLimite: -4, avance: 100 },
        { usuarioKey: "pedro", titulo: "Desarrollar calendario", descripcion: "Componente de reservas.", estado: EstadoTarea.en_progreso, prioridad: PrioridadTarea.alta, diasLimite: 5, avance: 70 },
        { usuarioKey: "rosa", titulo: "Integrar con campus", descripcion: "API de integración.", estado: EstadoTarea.pendiente, prioridad: PrioridadTarea.media, diasLimite: 9, avance: 20 },
      ],
    },
    {
      creadorKey: "laura",
      cursoKey: "laura-administracion-de-negocios",
      nombre: "Plataforma de Tutorías Universitarias",
      descripcion: "Sistema para conectar estudiantes con tutores.",
      diasEntrega: 45,
      estado: EstadoProyecto.planificacion,
      integrantes: [
        { usuarioKey: "laura", rol: "Coordinador general", responsabilidad: "Gestión del proyecto", estado: EstadoIntegrante.activo },
        { usuarioKey: "carlos", rol: "Responsable de investigación", responsabilidad: "Marco legal", estado: EstadoIntegrante.invitado },
        { usuarioKey: "gabriela", rol: "Responsable de investigación", responsabilidad: "Psicología educativa", estado: EstadoIntegrante.activo },
      ],
      tareas: [
        { usuarioKey: "carlos", titulo: "Marco legal", descripcion: "Investigar normativas.", estado: EstadoTarea.en_progreso, prioridad: PrioridadTarea.alta, diasLimite: 8, avance: 30 },
        { usuarioKey: "gabriela", titulo: "Perfil de tutores", descripcion: "Definir competencias.", estado: EstadoTarea.pendiente, prioridad: PrioridadTarea.alta, diasLimite: 12, avance: 10 },
        { usuarioKey: "laura", titulo: "Sistema de matching", descripcion: "Algoritmo de asignación.", estado: EstadoTarea.pendiente, prioridad: PrioridadTarea.media, diasLimite: 16, avance: 0 },
      ],
    },
    {
      creadorKey: "fernando",
      nombre: "Aplicación de Seguimiento Académico",
      descripcion: "App móvil para seguimiento de rendimiento académico.",
      diasEntrega: 22,
      estado: EstadoProyecto.en_progreso,
      integrantes: [
        { usuarioKey: "fernando", rol: "Coordinador general", responsabilidad: "Product owner", estado: EstadoIntegrante.activo },
        { usuarioKey: "pedro", rol: "Líder de desarrollo", responsabilidad: "Desarrollo móvil", estado: EstadoIntegrante.activo },
        { usuarioKey: "patricia", rol: "Diseñador UI/UX", responsabilidad: "Diseño de interfaz", estado: EstadoIntegrante.activo },
      ],
      tareas: [
        { usuarioKey: "patricia", titulo: "Diseñar wireframes", descripcion: "Mockups de pantallas.", estado: EstadoTarea.completada, prioridad: PrioridadTarea.alta, diasLimite: -3, avance: 100 },
        { usuarioKey: "pedro", titulo: "Desarrollar login", descripcion: "Autenticación móvil.", estado: EstadoTarea.en_progreso, prioridad: PrioridadTarea.alta, diasLimite: 4, avance: 80 },
        { usuarioKey: "fernando", titulo: "Dashboard de notas", descripcion: "Visualización de rendimiento.", estado: EstadoTarea.pendiente, prioridad: PrioridadTarea.media, diasLimite: 7, avance: 25 },
        { usuarioKey: "pedro", titulo: "Notificaciones push", descripcion: "Alertas de tareas.", estado: EstadoTarea.pendiente, prioridad: PrioridadTarea.baja, diasLimite: 10, avance: 0 },
      ],
    },
    {
      creadorKey: "jorge",
      cursoKey: "jorge-investigacion-de-operaciones",
      nombre: "Sistema de Optimización de Rutas",
      descripcion: "Algoritmos de optimización para logística urbana.",
      diasEntrega: 38,
      estado: EstadoProyecto.en_progreso,
      integrantes: [
        { usuarioKey: "jorge", rol: "Coordinador general", responsabilidad: "Investigación operativa", estado: EstadoIntegrante.activo },
        { usuarioKey: "diego", rol: "Líder de desarrollo", responsabilidad: "Implementación de algoritmos", estado: EstadoIntegrante.activo },
        { usuarioKey: "mariana", rol: "Responsable de investigación", responsabilidad: "Análisis de datos", estado: EstadoIntegrante.activo },
      ],
      tareas: [
        { usuarioKey: "jorge", titulo: "Investigar algoritmos VRP", descripcion: "Vehicle Routing Problem.", estado: EstadoTarea.completada, prioridad: PrioridadTarea.alta, diasLimite: -5, avance: 100 },
        { usuarioKey: "diego", titulo: "Implementar heurística", descripcion: "Algoritmo greedy.", estado: EstadoTarea.en_progreso, prioridad: PrioridadTarea.alta, diasLimite: 6, avance: 60 },
        { usuarioKey: "mariana", titulo: "Validar con datos reales", descripcion: "Testing con dataset.", estado: EstadoTarea.pendiente, prioridad: PrioridadTarea.media, diasLimite: 10, avance: 15 },
      ],
    },
    {
      creadorKey: "carlos",
      cursoKey: "carlos-derecho-civil",
      nombre: "Sistema de Gestión Legal",
      descripcion: "Software para gestión de casos legales.",
      diasEntrega: 32,
      estado: EstadoProyecto.planificacion,
      integrantes: [
        { usuarioKey: "carlos", rol: "Coordinador general", responsabilidad: "Análisis legal", estado: EstadoIntegrante.activo },
        { usuarioKey: "laura", rol: "Responsable de investigación", responsabilidad: "Requisitos financieros", estado: EstadoIntegrante.invitado },
        { usuarioKey: "pedro", rol: "Líder de desarrollo", responsabilidad: "Desarrollo", estado: EstadoIntegrante.activo },
      ],
      tareas: [
        { usuarioKey: "carlos", titulo: "Analizar flujo de trabajo", descripcion: "Procesos legales.", estado: EstadoTarea.en_progreso, prioridad: PrioridadTarea.alta, diasLimite: 7, avance: 40 },
        { usuarioKey: "pedro", titulo: "Diseñar base de datos", descripcion: "Modelo de casos.", estado: EstadoTarea.pendiente, prioridad: PrioridadTarea.alta, diasLimite: 11, avance: 10 },
        { usuarioKey: "laura", titulo: "Definir métricas", descripcion: "KPIs legales.", estado: EstadoTarea.pendiente, prioridad: PrioridadTarea.media, diasLimite: 15, avance: 0 },
      ],
    },
  ];

  const proyectos: Proyecto[] = [];

  for (const projectData of proyectosData) {
    const proyecto = await createProject(projectData, usuariosPorKey, cursoMap);
    proyectos.push(proyecto);
  }

  console.log("✅ Proyectos creados");

  return proyectos;
}

async function seedCalendarEvents(
  usuariosPorKey: MapaUsuarios
): Promise<void> {
  console.log("🌱 Creando eventos de calendario...");

  const eventosBase: readonly EventoSeed[] = [
    ["manuel", "Examen parcial de Negocios Electrónicos", TipoEvento.examen, 8, "Aula 302 - FIIS", 8, 120],
    ["manuel", "Reunión de coordinación TaskUni", TipoEvento.reunion, 2, "Google Meet", 10, 60],
    ["manuel", "Entrega de avance del proyecto", TipoEvento.entrega, 7, null, 23, 30],
    ["manuel", "Sprint review", TipoEvento.reunion, -2, "Oficina virtual", 16, 45],
    ["ana", "Examen de Redes y Telecomunicaciones", TipoEvento.examen, 5, "Laboratorio de Cómputo", 8, 120],
    ["ana", "Reunión con grupo de proyecto", TipoEvento.reunion, 3, "Sala virtual", 11, 60],
    ["ana", "Examen de índices SQL", TipoEvento.examen, -1, "Laboratorio", 14, 90],
    ["jorge", "Entrega de informe E-Business", TipoEvento.entrega, 4, null, 23, 59],
    ["jorge", "Entrega final del modelo SaaS", TipoEvento.entrega, -3, null, 23, 59],
    ["jorge", "Presentación de optimización", TipoEvento.reunion, 12, "Aula 205", 9, 60],
    ["sofia", "Demo de Landing TaskUni", TipoEvento.entrega, 6, null, 23, 59],
    ["sofia", "Reunión UX/UI", TipoEvento.reunion, 1, "Figma", 15, 45],
    ["sofia", "Revisión responsive", TipoEvento.otro, -4, "Figma", 10, 60],
    ["diego", "Examen parcial Sistemas Operativos", TipoEvento.examen, 9, "Bloque B", 8, 120],
    ["diego", "Actualización de backlog", TipoEvento.otro, 0, "Trello", 9, 30],
    ["diego", "Defensa de anteproyecto", TipoEvento.examen, 14, "Auditorio", 11, 60],
    ["mariana", "Entrega de Estadística", TipoEvento.entrega, 4, null, 23, 59],
    ["mariana", "Presentación de KPI", TipoEvento.reunion, 10, "Meet", 10, 60],
    ["mariana", "Examen de Investigación de Operaciones", TipoEvento.examen, 13, "Aula 104", 14, 120],
    ["rosa", "Campaña en Instagram", TipoEvento.otro, 2, "Zoom", 9, 60],
    ["rosa", "Reunión con cliente", TipoEvento.reunion, 5, "Oficina", 15, 60],
    ["rosa", "Presentación de marketing", TipoEvento.reunion, 8, "Sala J", 11, 45],
    ["pedro", "Demo API de tareas", TipoEvento.reunion, 3, null, 14, 30],
    ["pedro", "Code review", TipoEvento.reunion, 7, "GitHub", 10, 60],
    ["pedro", "Sprint planning", TipoEvento.reunion, 11, "Meet", 9, 60],
    ["laura", "Revisión financiera", TipoEvento.otro, 5, "Meet", 10, 60],
    ["laura", "Presentación de presupuesto", TipoEvento.reunion, 9, "Sala B", 15, 45],
    ["laura", "Entrega de contabilidad", TipoEvento.entrega, 13, null, 23, 59],
    ["carlos", "Audiencia simulada", TipoEvento.examen, 6, "Sala de audiencias", 9, 120],
    ["carlos", "Reunión con cliente legal", TipoEvento.reunion, 10, "Despacho", 11, 60],
    ["carlos", "Entrega de caso práctico", TipoEvento.entrega, 14, null, 23, 59],
    ["gabriela", "Entrevista clínica", TipoEvento.examen, 4, "Consultorio", 8, 60],
    ["gabriela", "Supervisión de casos", TipoEvento.reunion, 8, "Meet", 15, 60],
    ["gabriela", "Presentación de investigación", TipoEvento.reunion, 12, "Aula 302", 10, 45],
    ["fernando", "Práctica de anatomía", TipoEvento.examen, 3, "Laboratorio", 8, 120],
    ["fernando", "Examen de fisiología", TipoEvento.examen, 7, "Aula 105", 14, 90],
    ["fernando", "Presentación de farmacología", TipoEvento.reunion, 11, "Auditorio", 11, 60],
    ["patricia", "Crítica de proyecto", TipoEvento.reunion, 5, "Sala de taller", 9, 60],
    ["patricia", "Visita de campo", TipoEvento.otro, 9, "Centro histórico", 8, 180],
    ["patricia", "Entrega de plan urbano", TipoEvento.entrega, 13, null, 23, 59],
    ["valeria", "Reunión de equipo", TipoEvento.reunion, 4, "Meet", 10, 60],
    ["valeria", "Presentación de observatorio", TipoEvento.reunion, 8, "Sala A", 15, 45],
    ["valeria", "Entrega de informe", TipoEvento.entrega, 12, null, 23, 59],
    ["manuel", "Reunión con stakeholders", TipoEvento.reunion, 15, "Oficina central", 10, 60],
    ["ana", "Mentoría de redes", TipoEvento.reunion, 6, "Laboratorio", 11, 60],
    ["jorge", "Workshop de optimización", TipoEvento.otro, 16, "Aula 301", 9, 180],
    ["sofia", "Design sprint", TipoEvento.reunion, 9, "Sala creativa", 9, 120],
    ["diego", "Hackathon interno", TipoEvento.otro, 18, "Laboratorio", 8, 240],
    ["mariana", "Visita industrial", TipoEvento.otro, 14, "Planta", 8, 180],
    ["rosa", "Fotografía de producto", TipoEvento.otro, 11, "Estudio", 10, 120],
    ["pedro", "Tech talk", TipoEvento.reunion, 13, "Auditorio", 16, 60],
    ["laura", "Board meeting", TipoEvento.reunion, 16, "Sala ejecutiva", 10, 60],
    ["carlos", "Moot court", TipoEvento.examen, 17, "Sala de juicios", 9, 60],
    ["gabriela", "Grupo de terapia", TipoEvento.reunion, 15, "Consultorio", 15, 60],
    ["fernando", "Ronda clínica", TipoEvento.reunion, 14, "Hospital", 8, 120],
    ["patricia", "Exposición de proyecto", TipoEvento.reunion, 17, "Galería", 11, 45],
  ] as const;

  const operaciones = eventosBase.map(
    ([usuarioKey, titulo, tipo, dias, ubicacion, horaInicio, duracionMinutos]) => {
      const usuario = requireUser(usuariosPorKey, usuarioKey);
      const fechaBase = addDays(now, dias);
      const fechaInicio = withTime(fechaBase, horaInicio);

      return prisma.eventoCalendario.create({
        data: {
          id_usuario: usuario.id_usuario,
          titulo,
          tipo_evento: tipo,
          fecha_inicio: fechaInicio,
          fecha_fin: addMinutes(fechaInicio, duracionMinutos),
          ubicacion,
          estado: dias < 0 ? "finalizado" : dias === 0 ? "en_curso" : "programado",
        },
      });
    }
  );

  await prisma.$transaction(operaciones);

  console.log("✅ Eventos de calendario creados");
}

async function seedReminders(usuariosPorKey: MapaUsuarios) {
  console.log("🌱 Creando recordatorios...");

  const recordatoriosBase = [
    ["manuel", "Revisar entrega de subnetting", "Entrega cercana de redes", TipoRecordatorio.inteligente, EstadoRecordatorio.pendiente, 2],
    ["manuel", "Preparar reunión de sprint", "Recordatorio de coordinación", TipoRecordatorio.basico, EstadoRecordatorio.enviado, 2],
    ["manuel", "Racha de productividad", "No romper racha de 5 días", TipoRecordatorio.inteligente, EstadoRecordatorio.pendiente, 1],
    ["ana", "Revisar consultas SQL", "Repasar JOIN y agregaciones", TipoRecordatorio.inteligente, EstadoRecordatorio.pendiente, 3],
    ["ana", "Backup de avance", "Guardar versión del laboratorio", TipoRecordatorio.basico, EstadoRecordatorio.descartado, -1],
    ["ana", "Notificación premium", "Ver beneficios de Premium", TipoRecordatorio.basico, EstadoRecordatorio.enviado, 10],
    ["jorge", "Entrega E-Business", "Subir el informe final", TipoRecordatorio.inteligente, EstadoRecordatorio.pendiente, 4],
    ["jorge", "Revisión de marketing", "Ajustar canales digitales", TipoRecordatorio.inteligente, EstadoRecordatorio.pendiente, 6],
    ["sofia", "Validar responsive", "Probar mobile y tablet", TipoRecordatorio.basico, EstadoRecordatorio.enviado, 1],
    ["sofia", "Responder soporte", "Cerrar consulta abierta", TipoRecordatorio.basico, EstadoRecordatorio.descartado, 3],
    ["diego", "Examen SO", "Estudiar paginación", TipoRecordatorio.inteligente, EstadoRecordatorio.pendiente, 5],
    ["diego", "Revisión final", "Chequeo de entrega final", TipoRecordatorio.inteligente, EstadoRecordatorio.pendiente, 9],
    ["mariana", "Revisar gráficos", "Actualizar dashboard", TipoRecordatorio.basico, EstadoRecordatorio.descartado, 6],
    ["mariana", "Entregar informe", "Subir PDF final", TipoRecordatorio.basico, EstadoRecordatorio.enviado, 4],
    ["rosa", "Publicar campaña", "Lanzar anuncios", TipoRecordatorio.inteligente, EstadoRecordatorio.pendiente, 2],
    ["rosa", "Agenda de reunión", "Coordinar con el equipo", TipoRecordatorio.inteligente, EstadoRecordatorio.pendiente, 5],
    ["pedro", "Entregar API", "Cerrar issues pendientes", TipoRecordatorio.basico, EstadoRecordatorio.enviado, 3],
    ["pedro", "Code review pendiente", "Revisar PR #45", TipoRecordatorio.inteligente, EstadoRecordatorio.pendiente, 7],
    ["laura", "Cerrar presupuesto", "Revisar costos del proyecto", TipoRecordatorio.inteligente, EstadoRecordatorio.pendiente, 7],
    ["laura", "Cerrar acta", "Firmar aprobación final", TipoRecordatorio.basico, EstadoRecordatorio.enviado, 8],
    ["carlos", "Preparar audiencia", "Revisar caso legal", TipoRecordatorio.inteligente, EstadoRecordatorio.pendiente, 5],
    ["carlos", "Plazo de entrega", "Enviar memorial", TipoRecordatorio.basico, EstadoRecordatorio.pendiente, 9],
    ["gabriela", "Seguimiento de paciente", "Actualizar expediente", TipoRecordatorio.inteligente, EstadoRecordatorio.pendiente, 3],
    ["gabriela", "Supervisión pendiente", "Preparar caso", TipoRecordatorio.basico, EstadoRecordatorio.enviado, 6],
    ["fernando", "Estudiar anatomía", "Repasar sistema nervioso", TipoRecordatorio.inteligente, EstadoRecordatorio.pendiente, 2],
    ["fernando", "Práctica de laboratorio", "Preparar disección", TipoRecordatorio.basico, EstadoRecordatorio.pendiente, 5],
    ["patricia", "Entregar renders", "Finalizar visualizaciones", TipoRecordatorio.inteligente, EstadoRecordatorio.pendiente, 4],
    ["patricia", "Visita de campo", "Preparar material", TipoRecordatorio.basico, EstadoRecordatorio.enviado, 8],
    ["valeria", "Reunión de seguimiento", "Avanzar observatorio", TipoRecordatorio.inteligente, EstadoRecordatorio.pendiente, 3],
    ["valeria", "Enviar reporte", "Actualizar stakeholders", TipoRecordatorio.basico, EstadoRecordatorio.pendiente, 7],
    ["manuel", "Actualizar documentación", "Revisar README", TipoRecordatorio.basico, EstadoRecordatorio.enviado, 5],
    ["ana", "Preparar exposición", "Practicar presentación", TipoRecordatorio.inteligente, EstadoRecordatorio.pendiente, 6],
    ["jorge", "Revisar algoritmos", "Optimizar código", TipoRecordatorio.inteligente, EstadoRecordatorio.pendiente, 8],
    ["sofia", "Test de usabilidad", "Validar prototipo", TipoRecordatorio.basico, EstadoRecordatorio.pendiente, 4],
    ["diego", "Backup del sistema", "Realizar respaldo", TipoRecordatorio.basico, EstadoRecordatorio.enviado, 10],
    ["mariana", "Análisis de datos", "Procesar encuestas", TipoRecordatorio.inteligente, EstadoRecordatorio.pendiente, 7],
    ["rosa", "Revisar métricas", "Analizar ROI", TipoRecordatorio.inteligente, EstadoRecordatorio.pendiente, 6],
    ["pedro", "Deploy a producción", "Desplegar nueva versión", TipoRecordatorio.inteligente, EstadoRecordatorio.pendiente, 9],
    ["laura", "Revisar flujo de caja", "Actualizar proyecciones", TipoRecordatorio.basico, EstadoRecordatorio.pendiente, 11],
    ["carlos", "Investigar jurisprudencia", "Buscar precedentes", TipoRecordatorio.inteligente, EstadoRecordatorio.pendiente, 8],
    ["gabriela", "Preparar sesión", "Planear terapia", TipoRecordatorio.basico, EstadoRecordatorio.pendiente, 5],
    ["fernando", "Revisar farmacología", "Estudiar medicamentos", TipoRecordatorio.inteligente, EstadoRecordatorio.pendiente, 6],
    ["patricia", "Finalizar planos", "Completar dibujos", TipoRecordatorio.basico, EstadoRecordatorio.pendiente, 10],
    ["kevin", "Estudiar circuito", "Resolver guía de electrónica", TipoRecordatorio.basico, EstadoRecordatorio.descartado, 1],
  ] as const;

  await prisma.$transaction([
    prisma.recordatorio.createMany({
      data: recordatoriosBase.map(([usuarioKey, titulo, descripcion, tipo, estado, offset]) => ({
        id_usuario: usuariosPorKey[usuarioKey].id_usuario,
        titulo,
        descripcion,
        tipo_recordatorio: tipo,
        estado,
        fecha_recordatorio: addDays(now, offset),
      })),
    }),
  ]);

  console.log("✅ Recordatorios creados");
}

async function seedProductivityReports(
  usuariosPorKey: MapaUsuarios
): Promise<void> {
  console.log("🌱 Creando reportes de productividad...");

  const reportesBase = [
    { usuarioKey: "manuel", total: 12, completadas: 9, vencidas: 1, racha: 6 },
    { usuarioKey: "ana", total: 10, completadas: 7, vencidas: 1, racha: 4 },
    { usuarioKey: "jorge", total: 9, completadas: 6, vencidas: 1, racha: 3 },
    { usuarioKey: "sofia", total: 11, completadas: 8, vencidas: 1, racha: 5 },
    { usuarioKey: "diego", total: 8, completadas: 5, vencidas: 1, racha: 4 },
    { usuarioKey: "mariana", total: 10, completadas: 8, vencidas: 1, racha: 7 },
    { usuarioKey: "rosa", total: 9, completadas: 6, vencidas: 1, racha: 4 },
    { usuarioKey: "pedro", total: 8, completadas: 6, vencidas: 1, racha: 5 },
    { usuarioKey: "laura", total: 7, completadas: 5, vencidas: 1, racha: 3 },
    { usuarioKey: "carlos", total: 6, completadas: 4, vencidas: 1, racha: 3 },
    { usuarioKey: "gabriela", total: 7, completadas: 5, vencidas: 1, racha: 4 },
    { usuarioKey: "fernando", total: 8, completadas: 6, vencidas: 1, racha: 5 },
    { usuarioKey: "patricia", total: 6, completadas: 4, vencidas: 1, racha: 3 },
    { usuarioKey: "valeria", total: 5, completadas: 2, vencidas: 1, racha: 1 },
    { usuarioKey: "kevin", total: 4, completadas: 2, vencidas: 1, racha: 2 },
  ] as const;

  const reportes: Prisma.ReporteProductividadCreateManyInput[] = [];

  for (const item of reportesBase) {
    const usuario = requireUser(usuariosPorKey, item.usuarioKey);

    for (let index = 0; index < 6; index++) {
      const variacion = (index % 3) - 1;
      const total = Math.max(1, item.total + variacion);
      const completadas = Math.min(total, Math.max(0, item.completadas + (index % 2)));
      const vencidas = Math.min(total - completadas, Math.max(0, item.vencidas + ((index + 1) % 2)));
      const pendientes = total - completadas - vencidas;
      const porcentaje = Math.round((completadas / total) * 100);
      const fecha = addMonths(now, -(5 - index));

      reportes.push({
        id_usuario: usuario.id_usuario,
        periodo: `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, "0")}`,
        total_tareas: total,
        tareas_completadas: completadas,
        tareas_pendientes: pendientes,
        tareas_vencidas: vencidas,
        porcentaje_cumplimiento: porcentaje,
        racha_productividad: Math.max(0, item.racha + index),
        fecha_generacion: fecha,
      });
    }
  }

  await prisma.reporteProductividad.createMany({ data: reportes });

  console.log("✅ Reportes de productividad creados");
}

async function seedSupportRequests(usuariosPorKey: MapaUsuarios) {
  console.log("🌱 Creando consultas de soporte...");

  const consultasBase = [
    ["ana", "Problema de login", "No puedo ingresar con mi correo institucional.", EstadoConsulta.pendiente],
    ["manuel", "Duda sobre plan Premium", "Quiero saber qué incluye Premium.", EstadoConsulta.respondida],
    ["jorge", "No aparece proyecto grupal", "No veo mi proyecto en el tablero.", EstadoConsulta.cerrada],
    ["sofia", "Error al crear tarea", "El formulario marca error al guardar.", EstadoConsulta.pendiente],
    ["diego", "Problema con recordatorios", "No me llegan las alertas.", EstadoConsulta.respondida],
    ["mariana", "Consulta sobre pago", "El pago figura pendiente aunque se aprobó.", EstadoConsulta.cerrada],
    ["rosa", "Solicitud de recuperación de cuenta", "Olvidé la contraseña y no llegó el correo.", EstadoConsulta.pendiente],
    ["pedro", "Sugerencia de mejora", "Agregar filtro por curso en tareas.", EstadoConsulta.respondida],
    ["laura", "Consulta de plan institucional", "¿Habrá plan para universidades?", EstadoConsulta.pendiente],
    ["carlos", "Error en calendario", "No se muestran eventos pasados.", EstadoConsulta.cerrada],
    ["gabriela", "Problema con tablero Kanban", "No puedo mover tarjetas.", EstadoConsulta.respondida],
    ["fernando", "No encuentro mis reportes", "Necesito ver mi racha académica.", EstadoConsulta.pendiente],
    ["patricia", "Error al exportar datos", "El PDF no se genera correctamente.", EstadoConsulta.pendiente],
    ["valeria", "Duda sobre suscripción", "¿Puedo cambiar de plan?", EstadoConsulta.respondida],
    ["manuel", "Problema con notificaciones", "No recibo alertas push.", EstadoConsulta.respondida],
    ["ana", "Solicitud de eliminación", "Quiero eliminar mi cuenta.", EstadoConsulta.pendiente],
    ["jorge", "Error en dashboard", "Los gráficos no cargan correctamente.", EstadoConsulta.cerrada],
    ["sofia", "Consulta sobre API", "¿Tienen API pública?", EstadoConsulta.respondida],
    ["diego", "Problema con integración", "No sincroniza con Google Calendar.", EstadoConsulta.pendiente],
    ["mariana", "Sugerencia de funcionalidad", "Agregar modo oscuro.", EstadoConsulta.respondida],
    ["rosa", "Error al subir archivo", "El adjunto no se carga.", EstadoConsulta.pendiente],
    ["pedro", "Duda sobre límites", "¿Cuál es el límite de tareas?", EstadoConsulta.cerrada],
    ["laura", "Problema con pagos", "El pago falló pero me cobraron.", EstadoConsulta.pendiente],
    ["carlos", "Consulta sobre seguridad", "¿Cómo protegen mis datos?", EstadoConsulta.respondida],
    ["gabriela", "Error en perfil", "No puedo actualizar mi foto.", EstadoConsulta.pendiente],
  ] as const;

  await prisma.$transaction([
    prisma.consultaSoporte.createMany({
      data: consultasBase.map(([usuarioKey, asunto, mensaje, estado], index) => ({
        id_usuario: usuariosPorKey[usuarioKey].id_usuario,
        asunto,
        mensaje,
        estado_consulta: estado,
        fecha_envio: addDays(now, -(index + 1)),
        fecha_respuesta: estado === EstadoConsulta.pendiente ? null : addDays(now, -(index + 1) + 2),
        respuesta:
          estado === EstadoConsulta.respondida || estado === EstadoConsulta.cerrada
            ? "Consulta atendida por el equipo de soporte TaskUni. Gracias por contactarnos."
            : null,
      })),
    }),
  ]);

  console.log("✅ Consultas de soporte creadas");
}

async function seedDemoProductividad(
  usuariosPorKey: MapaUsuarios,
  cursoMap: MapaCursos
): Promise<void> {
  const DEMO_PREFIX = "[DEMO-PRODUCTIVIDAD]";
  const usuario = requireUser(usuariosPorKey, "manuel");

  console.log("🌱 Creando datos demo de productividad para Manuel...");

  type TareaDemo = {
    cursoKey: string;
    titulo: string;
    descripcion: string;
    creadaDias: number;
    limiteDias: number;
    prioridad: PrioridadTarea;
    estado: EstadoTarea;
    avance: number;
    completadoDias?: number;
  };

  // 35 tasks: 22 completadas (17 on time, 5 late), 5 en_progreso, 5 pendientes, 3 vencidas
  const tareasDemo: TareaDemo[] = [
    // ===== Ingeniería de Software (7) =====
    { cursoKey: "manuel-ingenieria-de-software", titulo: "Implementar módulo de autenticación JWT", descripcion: "Middleware de autenticación con JWT.", creadaDias: 25, limiteDias: -23, prioridad: PrioridadTarea.alta, estado: EstadoTarea.completada, avance: 100, completadoDias: 24 },
    { cursoKey: "manuel-ingenieria-de-software", titulo: "Diseñar diagrama de clases UML", descripcion: "Diagrama completo del sistema.", creadaDias: 20, limiteDias: -18, prioridad: PrioridadTarea.media, estado: EstadoTarea.completada, avance: 100, completadoDias: 19 },
    { cursoKey: "manuel-ingenieria-de-software", titulo: "Escribir pruebas unitarias del backend", descripcion: "Cobertura mínima del 80%.", creadaDias: 18, limiteDias: -15, prioridad: PrioridadTarea.alta, estado: EstadoTarea.completada, avance: 100, completadoDias: 13 },
    { cursoKey: "manuel-ingenieria-de-software", titulo: "Optimizar consultas del dashboard", descripcion: "Mejorar tiempos de respuesta.", creadaDias: 16, limiteDias: -12, prioridad: PrioridadTarea.media, estado: EstadoTarea.completada, avance: 100, completadoDias: 13 },
    { cursoKey: "manuel-ingenieria-de-software", titulo: "Configurar integración continua", descripcion: "Pipeline CI/CD con GitHub Actions.", creadaDias: 10, limiteDias: -7, prioridad: PrioridadTarea.alta, estado: EstadoTarea.completada, avance: 100, completadoDias: 8 },
    { cursoKey: "manuel-ingenieria-de-software", titulo: "Refactorizar controladores REST", descripcion: "Aplicar principios SOLID.", creadaDias: 12, limiteDias: 4, prioridad: PrioridadTarea.media, estado: EstadoTarea.en_progreso, avance: 65 },
    { cursoKey: "manuel-ingenieria-de-software", titulo: "Desplegar entorno de staging", descripcion: "Configurar servidor de pruebas.", creadaDias: 5, limiteDias: 8, prioridad: PrioridadTarea.baja, estado: EstadoTarea.pendiente, avance: 0 },

    // ===== Base de Datos (7) =====
    { cursoKey: "manuel-base-de-datos", titulo: "Normalizar esquema de base de datos", descripcion: "Aplicar 3FN.", creadaDias: 28, limiteDias: -25, prioridad: PrioridadTarea.alta, estado: EstadoTarea.completada, avance: 100, completadoDias: 26 },
    { cursoKey: "manuel-base-de-datos", titulo: "Crear índices para búsqueda", descripcion: "Optimizar consultas frecuentes.", creadaDias: 22, limiteDias: -20, prioridad: PrioridadTarea.media, estado: EstadoTarea.completada, avance: 100, completadoDias: 21 },
    { cursoKey: "manuel-base-de-datos", titulo: "Implementar procedimientos almacenados", descripcion: "SP para reportes críticos.", creadaDias: 22, limiteDias: -17, prioridad: PrioridadTarea.alta, estado: EstadoTarea.completada, avance: 100, completadoDias: 15 },
    { cursoKey: "manuel-base-de-datos", titulo: "Migrar datos del sistema legacy", descripcion: "ETL desde sistema anterior.", creadaDias: 14, limiteDias: -10, prioridad: PrioridadTarea.alta, estado: EstadoTarea.completada, avance: 100, completadoDias: 11 },
    { cursoKey: "manuel-base-de-datos", titulo: "Configurar réplica en caliente", descripcion: "Alta disponibilidad.", creadaDias: 8, limiteDias: -5, prioridad: PrioridadTarea.media, estado: EstadoTarea.completada, avance: 100, completadoDias: 6 },
    { cursoKey: "manuel-base-de-datos", titulo: "Configurar replicación multiregión", descripcion: "Sincronización entre regiones.", creadaDias: -2, limiteDias: 6, prioridad: PrioridadTarea.media, estado: EstadoTarea.en_progreso, avance: 40 },
    { cursoKey: "manuel-base-de-datos", titulo: "Diseñar modelo de datos para auditoría", descripcion: "Tablas de logging y auditoría.", creadaDias: 3, limiteDias: 10, prioridad: PrioridadTarea.baja, estado: EstadoTarea.pendiente, avance: 0 },

    // ===== Inteligencia Artificial (7) =====
    { cursoKey: "manuel-inteligencia-artificial", titulo: "Preprocesar dataset de entrenamiento", descripcion: "Limpieza y normalización.", creadaDias: 26, limiteDias: -24, prioridad: PrioridadTarea.alta, estado: EstadoTarea.completada, avance: 100, completadoDias: 25 },
    { cursoKey: "manuel-inteligencia-artificial", titulo: "Entrenar modelo de clasificación", descripcion: "Random Forest con sklearn.", creadaDias: 21, limiteDias: -18, prioridad: PrioridadTarea.alta, estado: EstadoTarea.completada, avance: 100, completadoDias: 19 },
    { cursoKey: "manuel-inteligencia-artificial", titulo: "Evaluar métricas del modelo", descripcion: "Precisión, recall y F1.", creadaDias: 19, limiteDias: -14, prioridad: PrioridadTarea.media, estado: EstadoTarea.completada, avance: 100, completadoDias: 12 },
    { cursoKey: "manuel-inteligencia-artificial", titulo: "Implementar pipeline de inferencia", descripcion: "API de predicción en tiempo real.", creadaDias: 13, limiteDias: -9, prioridad: PrioridadTarea.alta, estado: EstadoTarea.completada, avance: 100, completadoDias: 10 },
    { cursoKey: "manuel-inteligencia-artificial", titulo: "Ajustar hiperparámetros", descripcion: "Grid search con validación cruzada.", creadaDias: 7, limiteDias: 5, prioridad: PrioridadTarea.media, estado: EstadoTarea.en_progreso, avance: 55 },
    { cursoKey: "manuel-inteligencia-artificial", titulo: "Visualizar resultados con gráficos", descripcion: "Matplotlib y Seaborn.", creadaDias: 18, limiteDias: -6, prioridad: PrioridadTarea.baja, estado: EstadoTarea.vencida, avance: 60 },
    { cursoKey: "manuel-inteligencia-artificial", titulo: "Redactar informe del modelo", descripcion: "Documentación técnica.", creadaDias: 1, limiteDias: 14, prioridad: PrioridadTarea.media, estado: EstadoTarea.pendiente, avance: 0 },

    // ===== Negocios Electrónicos (7) =====
    { cursoKey: "manuel-negocios-electronicos", titulo: "Analizar competidores del sector", descripcion: "Benchmark de mercado.", creadaDias: 27, limiteDias: -25, prioridad: PrioridadTarea.alta, estado: EstadoTarea.completada, avance: 100, completadoDias: 26 },
    { cursoKey: "manuel-negocios-electronicos", titulo: "Definir propuesta de valor", descripcion: "Value proposition canvas.", creadaDias: 23, limiteDias: -20, prioridad: PrioridadTarea.alta, estado: EstadoTarea.completada, avance: 100, completadoDias: 22 },
    { cursoKey: "manuel-negocios-electronicos", titulo: "Diseñar modelo de negocio canvas", descripcion: "Business Model Canvas.", creadaDias: 20, limiteDias: -16, prioridad: PrioridadTarea.media, estado: EstadoTarea.completada, avance: 100, completadoDias: 14 },
    { cursoKey: "manuel-negocios-electronicos", titulo: "Realizar estudio de mercado", descripcion: "Encuesta y análisis de datos.", creadaDias: 15, limiteDias: -11, prioridad: PrioridadTarea.alta, estado: EstadoTarea.completada, avance: 100, completadoDias: 12 },
    { cursoKey: "manuel-negocios-electronicos", titulo: "Elaborar plan de marketing digital", descripcion: "Estrategia multicanal.", creadaDias: 9, limiteDias: 3, prioridad: PrioridadTarea.media, estado: EstadoTarea.en_progreso, avance: 70 },
    { cursoKey: "manuel-negocios-electronicos", titulo: "Calcular proyecciones financieras", descripcion: "Flujo de caja proyectado.", creadaDias: 4, limiteDias: 9, prioridad: PrioridadTarea.media, estado: EstadoTarea.pendiente, avance: 0 },
    { cursoKey: "manuel-negocios-electronicos", titulo: "Preparar pitch de inversión", descripcion: "Presentación ejecutiva.", creadaDias: 17, limiteDias: -5, prioridad: PrioridadTarea.alta, estado: EstadoTarea.vencida, avance: 45 },

    // ===== Redes y Comunicaciones (7) =====
    { cursoKey: "manuel-redes-y-comunicaciones", titulo: "Diseñar topología de red", descripcion: "Topología jerárquica.", creadaDias: 29, limiteDias: -26, prioridad: PrioridadTarea.alta, estado: EstadoTarea.completada, avance: 100, completadoDias: 27 },
    { cursoKey: "manuel-redes-y-comunicaciones", titulo: "Configurar VLANs en switches", descripcion: "Segmentación de red.", creadaDias: 24, limiteDias: -21, prioridad: PrioridadTarea.alta, estado: EstadoTarea.completada, avance: 100, completadoDias: 22 },
    { cursoKey: "manuel-redes-y-comunicaciones", titulo: "Implementar protocolo OSPF", descripcion: "Enrutamiento dinámico.", creadaDias: 21, limiteDias: -16, prioridad: PrioridadTarea.media, estado: EstadoTarea.completada, avance: 100, completadoDias: 14 },
    { cursoKey: "manuel-redes-y-comunicaciones", titulo: "Realizar auditoría de seguridad", descripcion: "Escaneo de vulnerabilidades.", creadaDias: 12, limiteDias: -8, prioridad: PrioridadTarea.alta, estado: EstadoTarea.completada, avance: 100, completadoDias: 9 },
    { cursoKey: "manuel-redes-y-comunicaciones", titulo: "Configurar firewall corporativo", descripcion: "Reglas de seguridad perimetral.", creadaDias: 6, limiteDias: 2, prioridad: PrioridadTarea.alta, estado: EstadoTarea.en_progreso, avance: 50 },
    { cursoKey: "manuel-redes-y-comunicaciones", titulo: "Documentar infraestructura de red", descripcion: "Diagramas y manuales.", creadaDias: 3, limiteDias: 7, prioridad: PrioridadTarea.baja, estado: EstadoTarea.pendiente, avance: 0 },
    { cursoKey: "manuel-redes-y-comunicaciones", titulo: "Monitorear tráfico de red", descripcion: "Análisis con Wireshark.", creadaDias: 14, limiteDias: -3, prioridad: PrioridadTarea.media, estado: EstadoTarea.vencida, avance: 35 },
  ];

  for (const t of tareasDemo) {
    const curso = requireCourse(cursoMap, t.cursoKey);
    const fechaCreacion = addDays(now, -t.creadaDias);
    const fechaLimite = addDays(now, t.limiteDias);
    const completado = t.completadoDias !== undefined ? addDays(now, -t.completadoDias) : undefined;

    await prisma.tarea.create({
      data: {
        id_usuario: usuario.id_usuario,
        id_curso: curso.id_curso,
        titulo: `${DEMO_PREFIX} ${t.titulo}`,
        descripcion: t.descripcion,
        fecha_creacion: fechaCreacion,
        fecha_limite: fechaLimite,
        prioridad: t.prioridad,
        estado_tarea: t.estado,
        avance_porcentual: t.avance,
        completedAt: completado,
      },
    });
  }

  // Eventos próximos (8 para Manuel en los próximos 20 días)
  const eventosDemo: Array<[string, string, TipoEvento, number, string | null, number, number]> = [
    ["manuel", "Sprint Review TaskUni", TipoEvento.reunion, 1, "Google Meet", 10, 60],
    ["manuel", "Entrega de avance de Negocios Electrónicos", TipoEvento.entrega, 3, null, 23, 30],
    ["manuel", "Examen parcial de Inteligencia Artificial", TipoEvento.examen, 5, "Aula 301 - FIIS", 8, 120],
    ["manuel", "Reunión de coordinación de proyecto", TipoEvento.reunion, 7, "Sala de reuniones", 15, 60],
    ["manuel", "Entrega de informe BD", TipoEvento.entrega, 10, null, 23, 59],
    ["manuel", "Defensa de proyecto de Redes", TipoEvento.examen, 12, "Laboratorio de Redes", 9, 120],
    ["manuel", "Workshop de IA - Redes Neuronales", TipoEvento.otro, 15, "Aula Magna", 14, 180],
    ["manuel", "Cierre de notas - Ingeniería de Software", TipoEvento.examen, 18, null, 23, 59],
  ];

  for (const [usuarioKey, titulo, tipo, dias, ubicacion, horaInicio, duracionMinutos] of eventosDemo) {
    const u = requireUser(usuariosPorKey, usuarioKey);
    const fechaBase = addDays(now, dias);
    const fechaInicio = withTime(fechaBase, horaInicio);
    await prisma.eventoCalendario.create({
      data: {
        id_usuario: u.id_usuario,
        titulo: `${DEMO_PREFIX} ${titulo}`,
        tipo_evento: tipo,
        fecha_inicio: fechaInicio,
        fecha_fin: addMinutes(fechaInicio, duracionMinutos),
        ubicacion,
        estado: "programado",
      },
    });
  }

  // Recordatorios relacionados (6 para Manuel)
  const recordatoriosDemo: Array<[string, string, string, TipoRecordatorio, EstadoRecordatorio, number]> = [
    ["manuel", "Revisar preparación de sprint review", "Tienes un sprint review mañana", TipoRecordatorio.inteligente, EstadoRecordatorio.pendiente, 0],
    ["manuel", "Entregar avance de Negocios Electrónicos", "Entrega en 3 días", TipoRecordatorio.inteligente, EstadoRecordatorio.pendiente, 3],
    ["manuel", "Estudiar para examen de IA", "Examen parcial en 5 días", TipoRecordatorio.inteligente, EstadoRecordatorio.pendiente, 2],
    ["manuel", "Revisión de proyecto final", "Coordinación con el equipo", TipoRecordatorio.basico, EstadoRecordatorio.pendiente, 5],
    ["manuel", "No romper racha de productividad", "Llevas varios días consecutivos", TipoRecordatorio.inteligente, EstadoRecordatorio.pendiente, 1],
    ["manuel", "Preparar informe de Base de Datos", "Entrega en 10 días", TipoRecordatorio.basico, EstadoRecordatorio.pendiente, 7],
  ];

  await prisma.recordatorio.createMany({
    data: recordatoriosDemo.map(([usuarioKey, titulo, descripcion, tipo, estado, offset]) => ({
      id_usuario: usuariosPorKey[usuarioKey].id_usuario,
      titulo: `${DEMO_PREFIX} ${titulo}`,
      descripcion,
      tipo_recordatorio: tipo,
      estado,
      fecha_recordatorio: addDays(now, offset),
    })),
  });

  // Reportes de productividad semanales para los últimos 4 periodos
  // Semanas: día -28 a -21 (57%), -21 a -14 (75%), -14 a -7 (78%), -7 a 0 (63%)
  const reportesDemo = [
    { periodo: "Semana 1", desde: -28, total: 7, completadas: 4, vencidas: 1, porcentaje: 57, racha: 3 },
    { periodo: "Semana 2", desde: -21, total: 8, completadas: 6, vencidas: 1, porcentaje: 75, racha: 5 },
    { periodo: "Semana 3", desde: -14, total: 9, completadas: 7, vencidas: 1, porcentaje: 78, racha: 8 },
    { periodo: "Semana 4", desde: -7, total: 8, completadas: 5, vencidas: 1, porcentaje: 63, racha: 11 },
  ];

  for (const r of reportesDemo) {
    const fecha = addDays(now, r.desde);
    await prisma.reporteProductividad.create({
      data: {
        id_usuario: usuario.id_usuario,
        periodo: `${fecha.getFullYear()}-W${Math.ceil((fecha.getDate() + 1) / 7)}`,
        total_tareas: r.total,
        tareas_completadas: r.completadas,
        tareas_pendientes: r.total - r.completadas - r.vencidas,
        tareas_vencidas: r.vencidas,
        porcentaje_cumplimiento: r.porcentaje,
        racha_productividad: r.racha,
        fecha_generacion: fecha,
      },
    });
  }

  console.log("✅ Datos demo de productividad creados");
}

async function validateSeed(): Promise<void> {
  console.log("🔎 Validando consistencia del seed...");

  const [
    estudiantesSinPerfil,
    administradoresConPerfil,
    estudiantesSinSuscripcion,
    proyectosSinIntegrantes,
    proyectosSinCreadorIntegrante,
    tareasSinCurso,
    pagos,
    proyectos,
    tareas,
    tareasProyecto,
    reportes,
  ] = await Promise.all([
    prisma.usuario.count({
      where: { rol: Rol.estudiante, perfil_estudiante: null },
    }),
    prisma.usuario.count({
      where: { rol: Rol.administrador, perfil_estudiante: { isNot: null } },
    }),
    prisma.usuario.count({
      where: { rol: Rol.estudiante, suscripciones: { none: {} } },
    }),
    prisma.proyecto.count({
      where: { integrantes: { none: {} } },
    }),
    prisma.proyecto.findMany({
      select: {
        id_proyecto: true,
        id_usuario_creador: true,
        integrantes: { select: { id_usuario: true } },
      },
    }),
    prisma.tarea.count({
      where: { id_curso: null },
    }),
    prisma.pago.findMany({
      include: { suscripcion: { include: { plan: true } } },
    }),
    prisma.proyecto.findMany(),
    prisma.tarea.findMany({
      select: { id_tarea: true, titulo: true, estado_tarea: true, avance_porcentual: true },
    }),
    prisma.tareaProyecto.findMany({
      include: { proyecto: { include: { integrantes: true } } },
    }),
    prisma.reporteProductividad.findMany(),
  ]);

  if (estudiantesSinPerfil > 0) {
    throw new Error(`${estudiantesSinPerfil} estudiantes no tienen perfil`);
  }

  if (administradoresConPerfil > 0) {
    throw new Error(`${administradoresConPerfil} administradores tienen perfil estudiantil`);
  }

  if (estudiantesSinSuscripcion > 0) {
    throw new Error(`${estudiantesSinSuscripcion} estudiantes no tienen suscripción`);
  }

  if (proyectosSinIntegrantes > 0) {
    throw new Error(`${proyectosSinIntegrantes} proyectos no tienen integrantes`);
  }

  for (const proyecto of proyectosSinCreadorIntegrante) {
    const creatorIsMember = proyecto.integrantes.some(
      (member) => member.id_usuario === proyecto.id_usuario_creador
    );
    if (!creatorIsMember) {
      throw new Error(`El creador no es integrante del proyecto ${proyecto.id_proyecto}`);
    }
  }

  if (tareasSinCurso > 0) {
    throw new Error(`${tareasSinCurso} tareas académicas no tienen curso`);
  }

  for (const pago of pagos) {
    if (pago.monto.lessThanOrEqualTo(0)) {
      throw new Error(`El pago ${pago.id_pago} tiene monto inválido`);
    }
    if (pago.suscripcion.plan.tipo_plan !== TipoPlan.premium) {
      throw new Error(`El pago ${pago.id_pago} pertenece a un plan no Premium`);
    }
    if (pago.id_usuario !== pago.suscripcion.id_usuario) {
      throw new Error(`El pago ${pago.id_pago} no corresponde al dueño de la suscripción`);
    }
  }

  for (const proyecto of proyectos) {
    validateProgress(proyecto.avance_general, `proyecto ${proyecto.nombre_proyecto}`);
  }

  for (const tarea of tareas) {
    validateProgress(tarea.avance_porcentual, `tarea ${tarea.titulo}`);
    if (tarea.estado_tarea === EstadoTarea.completada && tarea.avance_porcentual !== 100) {
      throw new Error(`La tarea completada "${tarea.titulo}" no tiene avance 100`);
    }
  }

  for (const tarea of tareasProyecto) {
    validateProgress(tarea.avance_porcentual, `tarea de proyecto ${tarea.titulo}`);

    if (tarea.id_usuario_asignado) {
      const isMember = tarea.proyecto.integrantes.some(
        (member) => member.id_usuario === tarea.id_usuario_asignado
      );
      if (!isMember) {
        throw new Error(`El responsable de "${tarea.titulo}" no pertenece al proyecto`);
      }
    }
  }

  for (const reporte of reportes) {
    const suma = reporte.tareas_completadas + reporte.tareas_pendientes + reporte.tareas_vencidas;
    if (suma !== reporte.total_tareas) {
      throw new Error(`Reporte inconsistente: ${reporte.id_reporte}`);
    }
    const porcentajeEsperado =
      reporte.total_tareas === 0
        ? 0
        : Math.round((reporte.tareas_completadas / reporte.total_tareas) * 100);
    if (reporte.porcentaje_cumplimiento !== porcentajeEsperado) {
      throw new Error(`Porcentaje incorrecto en reporte ${reporte.id_reporte}`);
    }
  }

  console.log("✅ Validación del seed completada");
}

async function printSummary() {
  console.log("\n==================================================");
  console.log(" RESUMEN DE POBLACIÓN DE TASKUNI");
  console.log("==================================================");

  const [
    usuarios,
    perfiles,
    planes,
    suscripciones,
    pagos,
    cursos,
    tareas,
    proyectos,
    integrantes,
    tareasProyecto,
    eventos,
    recordatorios,
    reportes,
    consultas,
  ] = await Promise.all([
    prisma.usuario.count(),
    prisma.perfilEstudiante.count(),
    prisma.plan.count(),
    prisma.suscripcion.count(),
    prisma.pago.count(),
    prisma.curso.count(),
    prisma.tarea.count(),
    prisma.proyecto.count(),
    prisma.integranteProyecto.count(),
    prisma.tareaProyecto.count(),
    prisma.eventoCalendario.count(),
    prisma.recordatorio.count(),
    prisma.reporteProductividad.count(),
    prisma.consultaSoporte.count(),
  ]);

  console.log(` Usuarios:                  ${usuarios.toString().padEnd(10)}`);
  console.log(` Perfiles de estudiante:    ${perfiles.toString().padEnd(10)}`);
  console.log(` Planes:                     ${planes.toString().padEnd(10)}`);
  console.log(` Suscripciones:             ${suscripciones.toString().padEnd(10)}`);
  console.log(` Pagos:                     ${pagos.toString().padEnd(10)}`);
  console.log(` Cursos:                    ${cursos.toString().padEnd(10)}`);
  console.log(` Tareas:                    ${tareas.toString().padEnd(10)}`);
  console.log(` Proyectos:                 ${proyectos.toString().padEnd(10)}`);
  console.log(` Integrantes de proyecto:   ${integrantes.toString().padEnd(10)}`);
  console.log(` Tareas de proyecto:        ${tareasProyecto.toString().padEnd(10)}`);
  console.log(` Eventos de calendario:     ${eventos.toString().padEnd(10)}`);
  console.log(` Recordatorios:             ${recordatorios.toString().padEnd(10)}`);
  console.log(` Reportes de productividad: ${reportes.toString().padEnd(10)}`);
  console.log(` Consultas de soporte:      ${consultas.toString().padEnd(10)}`);
  console.log("==================================================");
  console.log("✅ Base de datos poblada exitosamente");
  console.log("==================================================");
}

async function main(): Promise<void> {
  console.log("==============================================");
  console.log("🌱 INICIANDO POBLACIÓN DE TASKUNI");
  console.log("==============================================");

  await cleanDatabase();

  const planes = await seedPlans();
  const { usuariosPorKey } = await seedUsers();
  const suscripcionesPorKey = await seedSubscriptions(usuariosPorKey, planes);
  await seedPayments(usuariosPorKey, suscripcionesPorKey);
  const cursoMap = await seedCourses(usuariosPorKey);
  await seedTasks(cursoMap);
  await seedProjects(usuariosPorKey, cursoMap);
  await seedCalendarEvents(usuariosPorKey);
  await seedReminders(usuariosPorKey);
  await seedProductivityReports(usuariosPorKey);
  await seedSupportRequests(usuariosPorKey);
  await seedDemoProductividad(usuariosPorKey, cursoMap);

  await validateSeed();
  await printSummary();

  console.log("\n📋 Credenciales de prueba");
  console.log("  Administrador: admin@taskuni.edu.pe");
  console.log("  Coordinador: coordinador@taskuni.edu.pe");
  console.log("  Estudiante: manuel.torres@unt.edu.pe");
  console.log(`  Contraseña: ${PASSWORD}`);
}

main()
  .catch((error: unknown) => {
    console.error("❌ Error al poblar la base de datos:");

    if (error instanceof Error) {
      console.error(error.message);
      console.error(error.stack);
    } else {
      console.error(error);
    }

    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });