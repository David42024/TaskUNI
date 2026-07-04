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
} from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
const PASSWORD = "Password123!";

const now = new Date();
const enDias = (dias: number) => new Date(now.getTime() + dias * 24 * 60 * 60 * 1000);
const enMeses = (meses: number) => {
  const fecha = new Date(now);
  fecha.setMonth(fecha.getMonth() + meses);
  return fecha;
};

async function main() {
  console.log("Limpiando datos existentes...");
  await prisma.pago.deleteMany();
  await prisma.reporteProductividad.deleteMany();
  await prisma.consultaSoporte.deleteMany();
  await prisma.eventoCalendario.deleteMany();
  await prisma.recordatorio.deleteMany();
  await prisma.tareaProyecto.deleteMany();
  await prisma.integranteProyecto.deleteMany();
  await prisma.proyecto.deleteMany();
  await prisma.tarea.deleteMany();
  await prisma.curso.deleteMany();
  await prisma.suscripcion.deleteMany();
  await prisma.perfilEstudiante.deleteMany();
  await prisma.plan.deleteMany();
  await prisma.usuario.deleteMany();

  console.log("Creando planes...");
  const [planGratuito, planPremium] = await Promise.all([
    prisma.plan.create({
      data: {
        nombre_plan: "Plan Gratuito",
        descripcion: "Funciones esenciales para organizar la vida universitaria.",
        precio_mensual: 0,
        tipo_plan: TipoPlan.gratuito,
      },
    }),
    prisma.plan.create({
      data: {
        nombre_plan: "Plan Premium",
        descripcion: "Tareas ilimitadas, recordatorios inteligentes, analítica y tableros avanzados.",
        precio_mensual: 19.9,
        tipo_plan: TipoPlan.premium,
      },
    }),
  ]);

  console.log("Creando usuarios...");
  const passwordHash = await bcrypt.hash(PASSWORD, 10);

  const administradores = await Promise.all([
    prisma.usuario.create({
      data: {
        nombres: "Lucía",
        apellidos: "Ramírez Soto",
        correo: "admin@taskuni.edu.pe",
        correo_norm: "admin@taskuni.edu.pe",
        contrasena_hash: passwordHash,
        rol: Rol.administrador,
        estado: EstadoUsuario.activo,
      },
    }),
    prisma.usuario.create({
      data: {
        nombres: "Carlos",
        apellidos: "Vega Paredes",
        correo: "carlos.vega@taskuni.edu.pe",
        correo_norm: "carlos.vega@taskuni.edu.pe",
        contrasena_hash: passwordHash,
        rol: Rol.administrador,
        estado: EstadoUsuario.activo,
      },
    }),
  ]);

  const estudiantesBase = [
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
      plan: planPremium.id_plan,
      suscripcion: EstadoSuscripcion.activa,
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
      plan: planGratuito.id_plan,
      suscripcion: EstadoSuscripcion.activa,
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
      plan: planGratuito.id_plan,
      suscripcion: EstadoSuscripcion.activa,
    },
    {
      key: "sofia",
      nombres: "Sofía",
      apellidos: "Rojas Paredes",
      correo: "sofia.rojas@utp.edu.pe",
      universidad: "Universidad Tecnológica del Perú",
      carrera: "Diseño y Gestión de Producto Digital",
      ciclo: "5to ciclo",
      codigo: "UTP2023051",
      estado: EstadoUsuario.activo,
      plan: planPremium.id_plan,
      suscripcion: EstadoSuscripcion.activa,
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
      plan: planGratuito.id_plan,
      suscripcion: EstadoSuscripcion.vencida,
    },
    {
      key: "valeria",
      nombres: "Valeria",
      apellidos: "Cárdenas Muñoz",
      correo: "valeria.cardenas@uni.edu.pe",
      universidad: "Universidad de Lima",
      carrera: "Administración y Negocios Internacionales",
      ciclo: "7mo ciclo",
      codigo: "UDL2022154",
      estado: EstadoUsuario.suspendido,
      plan: planGratuito.id_plan,
      suscripcion: EstadoSuscripcion.cancelada,
    },
    {
      key: "diego",
      nombres: "Diego",
      apellidos: "Herrera Soto",
      correo: "diego.herrera@cayetano.edu.pe",
      universidad: "Universidad Peruana Cayetano Heredia",
      carrera: "Ingeniería Biomédica",
      ciclo: "9no ciclo",
      codigo: "UPCH2021088",
      estado: EstadoUsuario.activo,
      plan: planPremium.id_plan,
      suscripcion: EstadoSuscripcion.activa,
    },
    {
      key: "mariana",
      nombres: "Mariana",
      apellidos: "Flores Castillo",
      correo: "mariana.flores@uni.edu.pe",
      universidad: "Universidad Nacional de Ingeniería",
      carrera: "Ingeniería Industrial",
      ciclo: "6to ciclo",
      codigo: "UNI2023220",
      estado: EstadoUsuario.activo,
      plan: planGratuito.id_plan,
      suscripcion: EstadoSuscripcion.activa,
    },
    {
      key: "rosa",
      nombres: "Rosa",
      apellidos: "Ruiz Luján",
      correo: "rosa.ruiz@upc.edu.pe",
      universidad: "UPC",
      carrera: "Marketing y Gestión Comercial",
      ciclo: "3er ciclo",
      codigo: "UPC2024011",
      estado: EstadoUsuario.activo,
      plan: planPremium.id_plan,
      suscripcion: EstadoSuscripcion.activa,
    },
    {
      key: "pedro",
      nombres: "Pedro",
      apellidos: "Abarca Jiménez",
      correo: "pedro.abarca@utp.edu.pe",
      universidad: "Universidad Tecnológica del Perú",
      carrera: "Ingeniería de Software",
      ciclo: "4to ciclo",
      codigo: "UTP2024032",
      estado: EstadoUsuario.activo,
      plan: planGratuito.id_plan,
      suscripcion: EstadoSuscripcion.vencida,
    },
    {
      key: "laura",
      nombres: "Laura",
      apellidos: "Torres Medina",
      correo: "laura.torres@unsm.edu.pe",
      universidad: "Universidad Nacional de San Martín",
      carrera: "Administración",
      ciclo: "2do ciclo",
      codigo: "UNSM2024025",
      estado: EstadoUsuario.activo,
      plan: planPremium.id_plan,
      suscripcion: EstadoSuscripcion.activa,
    },
  ] as const;

  const estudiantes = await Promise.all(
    estudiantesBase.map((estudiante, index) =>
      prisma.usuario.create({
        data: {
          nombres: estudiante.nombres,
          apellidos: estudiante.apellidos,
          correo: estudiante.correo,
          correo_norm: estudiante.correo.toLowerCase(),
          contrasena_hash: passwordHash,
          rol: Rol.estudiante,
          estado: estudiante.estado,
          fecha_registro: enDias(-(18 - index)),
          perfil_estudiante: {
            create: {
              universidad: estudiante.universidad,
              carrera: estudiante.carrera,
              ciclo_academico: estudiante.ciclo,
              codigo_estudiante: estudiante.codigo,
            },
          },
        },
      })
    )
  );

  const usuariosPorKey = Object.fromEntries(
    [
      { key: "admin1", user: administradores[0] },
      { key: "admin2", user: administradores[1] },
      ...estudiantesBase.map((estudiante, index) => ({ key: estudiante.key, user: estudiantes[index] })),
    ].map(({ key, user }) => [key, user])
  ) as Record<string, Awaited<ReturnType<typeof prisma.usuario.create>>>;

  console.log("Creando suscripciones...");
  const suscripciones = await Promise.all(
    estudiantesBase.map((estudiante, index) =>
      prisma.suscripcion.create({
        data: {
          id_usuario: estudiantes[index].id_usuario,
          id_plan: estudiante.plan,
          estado_suscripcion: estudiante.suscripcion,
          fecha_inicio: enDias(-(25 - index)),
          fecha_fin:
            estudiante.suscripcion === EstadoSuscripcion.vencida
              ? enDias(-10)
              : estudiante.suscripcion === EstadoSuscripcion.cancelada
              ? enDias(-30)
              : enDias(30 + index),
        },
      })
    )
  );

  console.log("Creando pagos...");
  const planesPorUsuario = Object.fromEntries(
    suscripciones.map((suscripcion, index) => [estudiantesBase[index].key, suscripcion])
  ) as Record<string, Awaited<ReturnType<typeof prisma.suscripcion.create>>>;

  const pagosBase = [
    { key: "manuel", monto: 19.9, metodo: "Tarjeta", estado: EstadoPago.aprobado, dias: -2 },
    { key: "sofia", monto: 19.9, metodo: "Yape", estado: EstadoPago.aprobado, dias: -8 },
    { key: "diego", monto: 19.9, metodo: "Plin", estado: EstadoPago.aprobado, dias: -14 },
    { key: "rosa", monto: 19.9, metodo: "Transferencia", estado: EstadoPago.aprobado, dias: -21 },
    { key: "laura", monto: 19.9, metodo: "Tarjeta", estado: EstadoPago.aprobado, dias: -29 },
    { key: "manuel", monto: 19.9, metodo: "Tarjeta", estado: EstadoPago.pendiente, dias: 3 },
    { key: "sofia", monto: 19.9, metodo: "Yape", estado: EstadoPago.pendiente, dias: 6 },
    { key: "rosa", monto: 19.9, metodo: "Transferencia", estado: EstadoPago.rechazado, dias: -5 },
    { key: "pedro", monto: 19.9, metodo: "Tarjeta", estado: EstadoPago.aprobado, dias: -11 },
    { key: "ana", monto: 0, metodo: "-", estado: EstadoPago.aprobado, dias: -15 },
  ] as const;

  await Promise.all(
    pagosBase.map((pago) =>
      prisma.pago.create({
        data: {
          id_usuario: usuariosPorKey[pago.key].id_usuario,
          id_suscripcion: planesPorUsuario[pago.key].id_suscripcion,
          monto: pago.monto,
          metodo_pago: pago.metodo,
          estado_pago: pago.estado,
          fecha_pago: enDias(pago.dias),
        },
      })
    )
  );

  console.log("Creando cursos...");
  const cursos = await Promise.all([
    prisma.curso.create({ data: { id_usuario: usuariosPorKey.manuel.id_usuario, nombre_curso: "Redes y Comunicaciones I", docente: "Ing. Castro", ciclo: "2026-I" } }),
    prisma.curso.create({ data: { id_usuario: usuariosPorKey.manuel.id_usuario, nombre_curso: "Ingeniería de Software", docente: "Ing. Vidal", ciclo: "2026-I" } }),
    prisma.curso.create({ data: { id_usuario: usuariosPorKey.ana.id_usuario, nombre_curso: "Base de Datos", docente: "Mg. Paredes", ciclo: "2026-I" } }),
    prisma.curso.create({ data: { id_usuario: usuariosPorKey.jorge.id_usuario, nombre_curso: "E-Business", docente: "Dr. Rojas", ciclo: "2026-I" } }),
    prisma.curso.create({ data: { id_usuario: usuariosPorKey.sofia.id_usuario, nombre_curso: "Programación Web", docente: "Ing. León", ciclo: "2026-I" } }),
    prisma.curso.create({ data: { id_usuario: usuariosPorKey.kevin.id_usuario, nombre_curso: "Física Electrónica", docente: "Dr. Salinas", ciclo: "2026-I" } }),
    prisma.curso.create({ data: { id_usuario: usuariosPorKey.valeria.id_usuario, nombre_curso: "Gestión de Proyectos", docente: "MSc. Valdez", ciclo: "2026-I" } }),
    prisma.curso.create({ data: { id_usuario: usuariosPorKey.diego.id_usuario, nombre_curso: "Sistemas Operativos", docente: "Ing. Torres", ciclo: "2026-I" } }),
    prisma.curso.create({ data: { id_usuario: usuariosPorKey.mariana.id_usuario, nombre_curso: "Estadística Aplicada", docente: "Dra. Gómez", ciclo: "2026-I" } }),
    prisma.curso.create({ data: { id_usuario: usuariosPorKey.rosa.id_usuario, nombre_curso: "Marketing Digital", docente: "Lic. Cueva", ciclo: "2026-I" } }),
    prisma.curso.create({ data: { id_usuario: usuariosPorKey.pedro.id_usuario, nombre_curso: "Desarrollo de Software", docente: "Ing. Vargas", ciclo: "2026-I" } }),
    prisma.curso.create({ data: { id_usuario: usuariosPorKey.laura.id_usuario, nombre_curso: "Administración de Negocios", docente: "Mg. Flores", ciclo: "2026-I" } }),
    prisma.curso.create({ data: { id_usuario: usuariosPorKey.sofia.id_usuario, nombre_curso: "Metodología de la Investigación", docente: "Dra. Salazar", ciclo: "2026-I" } }),
    prisma.curso.create({ data: { id_usuario: usuariosPorKey.manuel.id_usuario, nombre_curso: "Tecnologías para E-Business", docente: "Dr. Huamán", ciclo: "2026-I" } }),
  ]);

  const cursosMap = Object.fromEntries(
    [
      "redes",
      "software",
      "bd",
      "ebusiness",
      "web",
      "fisica",
      "proyectos",
      "so",
      "estadistica",
      "marketing",
      "desarrollo",
      "administracion",
      "metodologia",
      "ebusiness2",
    ].map((key, index) => [key, cursos[index]])
  ) as Record<string, Awaited<ReturnType<typeof prisma.curso.create>>>;

  console.log("Creando tareas académicas...");
  const tareasData = [
    ["manuel", "redes", "Práctica calificada: Subnetting y VLSM", "Resolver 5 ejercicios de direccionamiento IPv4 con VLSM.", 3, PrioridadTarea.alta, EstadoTarea.en_progreso, 60],
    ["manuel", "software", "Documentar módulo de autenticación", "Actualizar la documentación técnica del login.", 5, PrioridadTarea.media, EstadoTarea.pendiente, 0],
    ["manuel", "ebusiness2", "Mapa de procesos TaskUni", "Definir procesos de compra, soporte y onboarding.", 7, PrioridadTarea.alta, EstadoTarea.pendiente, 25],
    ["manuel", "metodologia", "Avance del marco teórico", "Redactar antecedentes y metodología.", 8, PrioridadTarea.alta, EstadoTarea.en_progreso, 40],
    ["manuel", "redes", "Lectura de capa de enlace", "Revisar el capítulo 5 de Tanenbaum.", -2, PrioridadTarea.baja, EstadoTarea.vencida, 40],
    ["manuel", "software", "Entrega de anteproyecto", "Consolidar el anteproyecto de investigación.", -4, PrioridadTarea.alta, EstadoTarea.completada, 100],
    ["ana", "bd", "Modelo relacional normalizado", "Diseñar el diagrama entidad-relación.", 4, PrioridadTarea.alta, EstadoTarea.pendiente, 15],
    ["ana", "bd", "Consultas JOIN avanzadas", "Practicar consultas con múltiples joins.", 2, PrioridadTarea.media, EstadoTarea.en_progreso, 55],
    ["ana", "bd", "Backup y restauración", "Explicar estrategias de respaldo.", -1, PrioridadTarea.baja, EstadoTarea.vencida, 45],
    ["ana", "bd", "Entrega final de laboratorio", "Subir el laboratorio final.", -5, PrioridadTarea.alta, EstadoTarea.completada, 100],
    ["jorge", "ebusiness", "Análisis del modelo SaaS", "Definir propuesta de valor y segmento.", 5, PrioridadTarea.media, EstadoTarea.pendiente, 20],
    ["jorge", "ebusiness", "Matriz de canales digitales", "Identificar canales de adquisición.", 1, PrioridadTarea.media, EstadoTarea.en_progreso, 70],
    ["jorge", "ebusiness", "Conclusiones del caso", "Redactar conclusiones del informe.", -3, PrioridadTarea.alta, EstadoTarea.completada, 100],
    ["sofia", "web", "Landing de TaskUni", "Implementar hero y tarjetas de precios.", 6, PrioridadTarea.alta, EstadoTarea.en_progreso, 65],
    ["sofia", "metodologia", "Estado del arte", "Documentar fuentes y citas.", 8, PrioridadTarea.media, EstadoTarea.pendiente, 10],
    ["sofia", "web", "Pruebas responsive", "Validar mobile y tablet.", -1, PrioridadTarea.baja, EstadoTarea.vencida, 50],
    ["kevin", "fisica", "Problemas de circuitos", "Resolver ejercicios de electrónica.", 3, PrioridadTarea.alta, EstadoTarea.pendiente, 0],
    ["kevin", "fisica", "Informe de laboratorio", "Entregar el informe de laboratorio.", -4, PrioridadTarea.alta, EstadoTarea.completada, 100],
    ["valeria", "proyectos", "Cronograma de proyecto", "Definir hitos y entregables.", 4, PrioridadTarea.media, EstadoTarea.en_progreso, 45],
    ["valeria", "proyectos", "Riesgos y mitigaciones", "Documentar riesgos del proyecto.", 9, PrioridadTarea.baja, EstadoTarea.pendiente, 5],
    ["diego", "so", "Procesos y memoria", "Estudiar planificación y paginación.", 2, PrioridadTarea.alta, EstadoTarea.en_progreso, 55],
    ["diego", "so", "Examen parcial SO", "Preparar preguntas de examen.", -2, PrioridadTarea.alta, EstadoTarea.vencida, 40],
    ["mariana", "estadistica", "Análisis descriptivo", "Construir tablas y gráficos.", 7, PrioridadTarea.media, EstadoTarea.pendiente, 15],
    ["mariana", "estadistica", "Práctica de regresión", "Resolver ejercicios de correlación.", -3, PrioridadTarea.media, EstadoTarea.completada, 100],
    ["rosa", "marketing", "Campaña de captación", "Diseñar anuncios para Instagram y TikTok.", 5, PrioridadTarea.alta, EstadoTarea.en_progreso, 58],
    ["rosa", "marketing", "Segmentación de mercado", "Identificar público objetivo.", 1, PrioridadTarea.media, EstadoTarea.pendiente, 25],
    ["pedro", "desarrollo", "API de tareas", "Implementar endpoints REST.", 4, PrioridadTarea.alta, EstadoTarea.en_progreso, 72],
    ["pedro", "desarrollo", "Documentación técnica", "Actualizar README técnico.", -1, PrioridadTarea.baja, EstadoTarea.vencida, 35],
    ["laura", "administracion", "Presupuesto del proyecto", "Calcular costos y recursos.", 6, PrioridadTarea.media, EstadoTarea.pendiente, 20],
    ["laura", "administracion", "Reporte de rentabilidad", "Analizar ingresos y costos.", -4, PrioridadTarea.alta, EstadoTarea.completada, 100],
    ["manuel", "ebusiness2", "Presentación comercial", "Preparar demo y pitch de TaskUni.", 2, PrioridadTarea.alta, EstadoTarea.en_progreso, 80],
    ["ana", "bd", "Índices y optimización", "Proponer índices para consultas frecuentes.", 10, PrioridadTarea.media, EstadoTarea.pendiente, 0],
    ["jorge", "ebusiness", "Canvas de negocio", "Completar propuesta de valor.", -1, PrioridadTarea.baja, EstadoTarea.completada, 100],
    ["sofia", "web", "Módulo de soporte", "Construir página de tickets.", 7, PrioridadTarea.media, EstadoTarea.pendiente, 12],
  ] as const;

  await prisma.tarea.createMany({
    data: tareasData.map(([usuarioKey, cursoKey, titulo, descripcion, offset, prioridad, estado, avance]) => ({
      id_usuario: usuariosPorKey[usuarioKey].id_usuario,
      id_curso: cursosMap[cursoKey].id_curso,
      titulo,
      descripcion,
      fecha_limite: enDias(offset),
      prioridad,
      estado_tarea: estado,
      avance_porcentual: avance,
    })),
  });

  console.log("Creando proyectos grupales...");
  const proyectos = await Promise.all([
    prisma.proyecto.create({
      data: {
        id_usuario_creador: usuariosPorKey.manuel.id_usuario,
        id_curso: cursosMap.software.id_curso,
        nombre_proyecto: "TaskUni - Plataforma de gestión académica",
        descripcion: "Plataforma SaaS educativa para tareas, proyectos, calendario y productividad.",
        fecha_entrega: enDias(28),
        estado_proyecto: EstadoProyecto.en_progreso,
        avance_general: 62,
        integrantes: {
          create: [
            { id_usuario: usuariosPorKey.manuel.id_usuario, rol_en_proyecto: "líder", responsabilidad: "Arquitectura y autenticación", estado: EstadoIntegrante.activo },
            { id_usuario: usuariosPorKey.ana.id_usuario, rol_en_proyecto: "colaborador", responsabilidad: "Base de datos y reportes", estado: EstadoIntegrante.activo },
            { id_usuario: usuariosPorKey.sofia.id_usuario, rol_en_proyecto: "diseñador", responsabilidad: "UI y experiencia responsive", estado: EstadoIntegrante.activo },
          ],
        },
        tareas: {
          create: [
            { titulo: "Diseñar layout principal", descripcion: "Estructurar dashboard y navegación.", estado: EstadoTarea.en_progreso, prioridad: PrioridadTarea.alta, fecha_limite: enDias(4), avance_porcentual: 70, id_usuario_asignado: usuariosPorKey.manuel.id_usuario },
            { titulo: "Modelar reportes de productividad", descripcion: "Definir indicadores y cálculos.", estado: EstadoTarea.pendiente, prioridad: PrioridadTarea.media, fecha_limite: enDias(6), avance_porcentual: 15, id_usuario_asignado: usuariosPorKey.ana.id_usuario },
            { titulo: "Sistema de navegación móvil", descripcion: "Drawer y acciones rápidas.", estado: EstadoTarea.pendiente, prioridad: PrioridadTarea.media, fecha_limite: enDias(8), avance_porcentual: 0, id_usuario_asignado: usuariosPorKey.sofia.id_usuario },
            { titulo: "Pruebas de integración", descripcion: "Validar endpoints y UX.", estado: EstadoTarea.completada, prioridad: PrioridadTarea.baja, fecha_limite: enDias(-2), avance_porcentual: 100, id_usuario_asignado: usuariosPorKey.manuel.id_usuario },
          ],
        },
      },
      include: { integrantes: true, tareas: true },
    }),
    prisma.proyecto.create({
      data: {
        id_usuario_creador: usuariosPorKey.jorge.id_usuario,
        id_curso: cursosMap.ebusiness.id_curso,
        nombre_proyecto: "Sistema IoT para comedor universitario",
        descripcion: "Monitoreo de aforo, tiempos y gestión digital para el comedor universitario.",
        fecha_entrega: enDias(35),
        estado_proyecto: EstadoProyecto.planificacion,
        avance_general: 35,
        integrantes: {
          create: [
            { id_usuario: usuariosPorKey.jorge.id_usuario, rol_en_proyecto: "líder", responsabilidad: "Análisis de procesos", estado: EstadoIntegrante.activo },
            { id_usuario: usuariosPorKey.diego.id_usuario, rol_en_proyecto: "desarrollador", responsabilidad: "Sensores y backend", estado: EstadoIntegrante.activo },
            { id_usuario: usuariosPorKey.mariana.id_usuario, rol_en_proyecto: "investigador", responsabilidad: "Estudio de campo", estado: EstadoIntegrante.invitado },
          ],
        },
        tareas: {
          create: [
            { titulo: "Levantamiento de requerimientos", estado: EstadoTarea.en_progreso, prioridad: PrioridadTarea.alta, fecha_limite: enDias(5), avance_porcentual: 50, id_usuario_asignado: usuariosPorKey.jorge.id_usuario },
            { titulo: "Arquitectura IoT", estado: EstadoTarea.pendiente, prioridad: PrioridadTarea.alta, fecha_limite: enDias(9), avance_porcentual: 20, id_usuario_asignado: usuariosPorKey.diego.id_usuario },
            { titulo: "Validación de usuarios", estado: EstadoTarea.pendiente, prioridad: PrioridadTarea.media, fecha_limite: enDias(11), avance_porcentual: 10, id_usuario_asignado: usuariosPorKey.mariana.id_usuario },
            { titulo: "Prototipo de dashboard", estado: EstadoTarea.completada, prioridad: PrioridadTarea.baja, fecha_limite: enDias(-1), avance_porcentual: 100, id_usuario_asignado: usuariosPorKey.jorge.id_usuario },
          ],
        },
      },
      include: { integrantes: true, tareas: true },
    }),
    prisma.proyecto.create({
      data: {
        id_usuario_creador: usuariosPorKey.rosa.id_usuario,
        id_curso: cursosMap.marketing.id_curso,
        nombre_proyecto: "Portal de horarios UNT",
        descripcion: "Sistema centralizado de horarios, aulas y avisos para estudiantes.",
        fecha_entrega: enDias(20),
        estado_proyecto: EstadoProyecto.en_progreso,
        avance_general: 48,
        integrantes: {
          create: [
            { id_usuario: usuariosPorKey.rosa.id_usuario, rol_en_proyecto: "líder", responsabilidad: "Estrategia digital", estado: EstadoIntegrante.activo },
            { id_usuario: usuariosPorKey.valeria.id_usuario, rol_en_proyecto: "colaborador", responsabilidad: "Flujo de procesos", estado: EstadoIntegrante.invitado },
            { id_usuario: usuariosPorKey.pedro.id_usuario, rol_en_proyecto: "desarrollador", responsabilidad: "API y datos", estado: EstadoIntegrante.activo },
          ],
        },
        tareas: {
          create: [
            { titulo: "Mapa de información", estado: EstadoTarea.en_progreso, prioridad: PrioridadTarea.media, fecha_limite: enDias(3), avance_porcentual: 60, id_usuario_asignado: usuariosPorKey.rosa.id_usuario },
            { titulo: "Diseño de prototipo", estado: EstadoTarea.pendiente, prioridad: PrioridadTarea.media, fecha_limite: enDias(7), avance_porcentual: 25, id_usuario_asignado: usuariosPorKey.valeria.id_usuario },
            { titulo: "Base de datos de horarios", estado: EstadoTarea.pendiente, prioridad: PrioridadTarea.alta, fecha_limite: enDias(10), avance_porcentual: 10, id_usuario_asignado: usuariosPorKey.pedro.id_usuario },
            { titulo: "Presentación ejecutiva", estado: EstadoTarea.completada, prioridad: PrioridadTarea.baja, fecha_limite: enDias(-1), avance_porcentual: 100, id_usuario_asignado: usuariosPorKey.rosa.id_usuario },
          ],
        },
      },
      include: { integrantes: true, tareas: true },
    }),
    prisma.proyecto.create({
      data: {
        id_usuario_creador: usuariosPorKey.sofia.id_usuario,
        id_curso: cursosMap.web.id_curso,
        nombre_proyecto: "E-Business Plan TaskUni",
        descripcion: "Modelo de negocio, pricing y captación para TaskUni.",
        fecha_entrega: enDias(24),
        estado_proyecto: EstadoProyecto.en_progreso,
        avance_general: 55,
        integrantes: {
          create: [
            { id_usuario: usuariosPorKey.sofia.id_usuario, rol_en_proyecto: "líder", responsabilidad: "Diseño de producto", estado: EstadoIntegrante.activo },
            { id_usuario: usuariosPorKey.laura.id_usuario, rol_en_proyecto: "investigador", responsabilidad: "Análisis financiero", estado: EstadoIntegrante.activo },
            { id_usuario: usuariosPorKey.manuel.id_usuario, rol_en_proyecto: "desarrollador", responsabilidad: "Implementación técnica", estado: EstadoIntegrante.activo },
          ],
        },
        tareas: {
          create: [
            { titulo: "Definir propuesta de valor", estado: EstadoTarea.completada, prioridad: PrioridadTarea.alta, fecha_limite: enDias(-2), avance_porcentual: 100, id_usuario_asignado: usuariosPorKey.sofia.id_usuario },
            { titulo: "Costos y rentabilidad", estado: EstadoTarea.en_progreso, prioridad: PrioridadTarea.alta, fecha_limite: enDias(5), avance_porcentual: 65, id_usuario_asignado: usuariosPorKey.laura.id_usuario },
            { titulo: "Demo funcional", estado: EstadoTarea.pendiente, prioridad: PrioridadTarea.media, fecha_limite: enDias(9), avance_porcentual: 20, id_usuario_asignado: usuariosPorKey.manuel.id_usuario },
            { titulo: "Pitch comercial", estado: EstadoTarea.pendiente, prioridad: PrioridadTarea.media, fecha_limite: enDias(11), avance_porcentual: 0, id_usuario_asignado: usuariosPorKey.sofia.id_usuario },
          ],
        },
      },
      include: { integrantes: true, tareas: true },
    }),
    prisma.proyecto.create({
      data: {
        id_usuario_creador: usuariosPorKey.diego.id_usuario,
        id_curso: cursosMap.so.id_curso,
        nombre_proyecto: "Sistema de gestión de calidad UNT",
        descripcion: "Control de procesos, documentos y reportes de calidad institucional.",
        fecha_entrega: enDias(40),
        estado_proyecto: EstadoProyecto.en_progreso,
        avance_general: 41,
        integrantes: {
          create: [
            { id_usuario: usuariosPorKey.diego.id_usuario, rol_en_proyecto: "líder", responsabilidad: "Arquitectura backend", estado: EstadoIntegrante.activo },
            { id_usuario: usuariosPorKey.mariana.id_usuario, rol_en_proyecto: "investigador", responsabilidad: "Procesos y métricas", estado: EstadoIntegrante.activo },
            { id_usuario: usuariosPorKey.kevin.id_usuario, rol_en_proyecto: "desarrollador", responsabilidad: "Soporte técnico", estado: EstadoIntegrante.invitado },
          ],
        },
        tareas: {
          create: [
            { titulo: "Modelo de procesos", estado: EstadoTarea.en_progreso, prioridad: PrioridadTarea.alta, fecha_limite: enDias(4), avance_porcentual: 55, id_usuario_asignado: usuariosPorKey.diego.id_usuario },
            { titulo: "Catálogo documental", estado: EstadoTarea.pendiente, prioridad: PrioridadTarea.media, fecha_limite: enDias(8), avance_porcentual: 15, id_usuario_asignado: usuariosPorKey.mariana.id_usuario },
            { titulo: "Módulo de incidencias", estado: EstadoTarea.pendiente, prioridad: PrioridadTarea.media, fecha_limite: enDias(12), avance_porcentual: 5, id_usuario_asignado: usuariosPorKey.kevin.id_usuario },
            { titulo: "Validación de KPIs", estado: EstadoTarea.completada, prioridad: PrioridadTarea.baja, fecha_limite: enDias(-3), avance_porcentual: 100, id_usuario_asignado: usuariosPorKey.diego.id_usuario },
          ],
        },
      },
      include: { integrantes: true, tareas: true },
    }),
    prisma.proyecto.create({
      data: {
        id_usuario_creador: usuariosPorKey.manuel.id_usuario,
        id_curso: cursosMap.ebusiness2.id_curso,
        nombre_proyecto: "Dashboard de productividad estudiantil",
        descripcion: "Visualización de métricas, rachas y cumplimiento por periodo.",
        fecha_entrega: enDias(15),
        estado_proyecto: EstadoProyecto.en_progreso,
        avance_general: 72,
        integrantes: {
          create: [
            { id_usuario: usuariosPorKey.manuel.id_usuario, rol_en_proyecto: "líder", responsabilidad: "Full stack", estado: EstadoIntegrante.activo },
            { id_usuario: usuariosPorKey.ana.id_usuario, rol_en_proyecto: "analista", responsabilidad: "Modelado de datos", estado: EstadoIntegrante.activo },
            { id_usuario: usuariosPorKey.rosa.id_usuario, rol_en_proyecto: "diseñador", responsabilidad: "UI de métricas", estado: EstadoIntegrante.activo },
          ],
        },
        tareas: {
          create: [
            { titulo: "KPI de cumplimiento", estado: EstadoTarea.completada, prioridad: PrioridadTarea.media, fecha_limite: enDias(-1), avance_porcentual: 100, id_usuario_asignado: usuariosPorKey.ana.id_usuario },
            { titulo: "Gráfico de tendencia", estado: EstadoTarea.en_progreso, prioridad: PrioridadTarea.alta, fecha_limite: enDias(3), avance_porcentual: 75, id_usuario_asignado: usuariosPorKey.manuel.id_usuario },
            { titulo: "Layout de tarjetas", estado: EstadoTarea.pendiente, prioridad: PrioridadTarea.baja, fecha_limite: enDias(6), avance_porcentual: 30, id_usuario_asignado: usuariosPorKey.rosa.id_usuario },
            { titulo: "Pruebas de usuario", estado: EstadoTarea.pendiente, prioridad: PrioridadTarea.media, fecha_limite: enDias(9), avance_porcentual: 10, id_usuario_asignado: usuariosPorKey.manuel.id_usuario },
          ],
        },
      },
      include: { integrantes: true, tareas: true },
    }),
  ]);

  console.log("Creando eventos de calendario...");
  const eventosBase = [
    ["manuel", "Examen parcial - Redes y Comunicaciones I", TipoEvento.examen, 8, "Aula 302 - FIIS"],
    ["manuel", "Reunión de coordinación SGC-UNT", TipoEvento.reunion, 2, "Google Meet"],
    ["manuel", "Entrega Marco Teórico - Metodología", TipoEvento.entrega, 7, null],
    ["ana", "Examen - Base de Datos", TipoEvento.examen, 5, "Laboratorio de Cómputo"],
    ["ana", "Reunión con grupo de proyecto", TipoEvento.reunion, 3, "Sala virtual"],
    ["jorge", "Entrega de informe E-Business", TipoEvento.entrega, 4, null],
    ["sofia", "Demo de Landing TaskUni", TipoEvento.entrega, 6, null],
    ["sofia", "Reunión UX/UI", TipoEvento.reunion, 1, "Figma"],
    ["diego", "Examen parcial SO", TipoEvento.examen, 9, "Bloque B"],
    ["diego", "Actualización de backlog", TipoEvento.otro, 0, "Trello"],
    ["mariana", "Entrega de Estadística", TipoEvento.entrega, 4, null],
    ["rosa", "Campaña en Instagram", TipoEvento.otro, 2, "Zoom"],
    ["pedro", "Demo API de tareas", TipoEvento.reunion, 3, null],
    ["laura", "Revisión financiera", TipoEvento.otro, 5, "Meet"],
    ["manuel", "Sprint review", TipoEvento.reunion, -2, "Oficina virtual"],
    ["ana", "Examen de indices SQL", TipoEvento.examen, -1, "Laboratorio"],
    ["jorge", "Entrega final del modelo SaaS", TipoEvento.entrega, -3, null],
    ["sofia", "Revisión responsive", TipoEvento.otro, -4, "Figma"],
    ["kevin", "Práctica de electrónica", TipoEvento.otro, 1, "Aula 104"],
    ["mariana", "Presentación de KPI", TipoEvento.reunion, 10, "Meet"],
  ] as const;

  await prisma.eventoCalendario.createMany({
    data: eventosBase.map(([usuarioKey, titulo, tipo, offset, ubicacion]) => ({
      id_usuario: usuariosPorKey[usuarioKey].id_usuario,
      titulo,
      tipo_evento: tipo,
      fecha_inicio: enDias(offset),
      ubicacion,
    })),
  });

  console.log("Creando recordatorios...");
  const recordatoriosBase = [
    ["manuel", "Revisar entrega de subnetting", "Entrega cercana de redes", TipoRecordatorio.inteligente, EstadoRecordatorio.pendiente, 2, "tarea"],
    ["manuel", "Preparar reunión de sprint", "Recordatorio de coordinación", TipoRecordatorio.basico, EstadoRecordatorio.enviado, 2, "proyecto"],
    ["ana", "Revisar consultas SQL", "Repasar JOIN y agregaciones", TipoRecordatorio.inteligente, EstadoRecordatorio.pendiente, 3, "tarea"],
    ["ana", "Backup de avance", "Guardar versión del laboratorio", TipoRecordatorio.basico, EstadoRecordatorio.descartado, -1, "tarea"],
    ["jorge", "Entrega E-Business", "Subir el informe final", TipoRecordatorio.inteligente, EstadoRecordatorio.pendiente, 4, "proyecto"],
    ["sofia", "Validar responsive", "Probar mobile y tablet", TipoRecordatorio.basico, EstadoRecordatorio.enviado, 1, "tarea"],
    ["diego", "Examen SO", "Estudiar paginación", TipoRecordatorio.inteligente, EstadoRecordatorio.pendiente, 5, "tarea"],
    ["mariana", "Revisar gráficos", "Actualizar dashboard", TipoRecordatorio.basico, EstadoRecordatorio.descartado, 6, "proyecto"],
    ["rosa", "Publicar campaña", "Lanzar anuncios", TipoRecordatorio.inteligente, EstadoRecordatorio.pendiente, 2, "tarea"],
    ["pedro", "Entregar API", "Cerrar issues pendientes", TipoRecordatorio.basico, EstadoRecordatorio.enviado, 3, "proyecto"],
    ["laura", "Cerrar presupuesto", "Revisar costos del proyecto", TipoRecordatorio.inteligente, EstadoRecordatorio.pendiente, 7, "proyecto"],
    ["kevin", "Estudiar circuito", "Resolver guía de electrónica", TipoRecordatorio.basico, EstadoRecordatorio.descartado, 1, "tarea"],
    ["manuel", "Racha de productividad", "No romper racha de 5 días", TipoRecordatorio.inteligente, EstadoRecordatorio.pendiente, 1, "tarea"],
    ["ana", "Notificación premium", "Ver beneficios de Premium", TipoRecordatorio.basico, EstadoRecordatorio.enviado, 10, "tarea"],
    ["jorge", "Revisión de marketing", "Ajustar canales digitales", TipoRecordatorio.inteligente, EstadoRecordatorio.pendiente, 6, "proyecto"],
    ["sofia", "Responder soporte", "Cerrar consulta abierta", TipoRecordatorio.basico, EstadoRecordatorio.descartado, 3, "tarea"],
    ["diego", "Revisión final", "Chequeo de entrega final", TipoRecordatorio.inteligente, EstadoRecordatorio.pendiente, 9, "proyecto"],
    ["mariana", "Entregar informe", "Subir PDF final", TipoRecordatorio.basico, EstadoRecordatorio.enviado, 4, "tarea"],
    ["rosa", "Agenda de reunión", "Coordinar con el equipo", TipoRecordatorio.inteligente, EstadoRecordatorio.pendiente, 5, "proyecto"],
    ["laura", "Cerrar acta", "Firmar aprobación final", TipoRecordatorio.basico, EstadoRecordatorio.enviado, 8, "proyecto"],
  ] as const;

  const recordatorios = await prisma.recordatorio.createMany({
    data: recordatoriosBase.map(([usuarioKey, titulo, descripcion, tipo, estado, offset]) => ({
      id_usuario: usuariosPorKey[usuarioKey].id_usuario,
      titulo,
      descripcion,
      tipo_recordatorio: tipo,
      estado,
      fecha_recordatorio: enDias(offset),
    })),
  });

  void recordatorios;

  console.log("Creando consultas de soporte...");
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
    ["kevin", "Error en calendario", "No se muestran eventos pasados.", EstadoConsulta.cerrada],
    ["manuel", "Problema con tablero Kanban", "No puedo mover tarjetas.", EstadoConsulta.respondida],
    ["ana", "No encuentro mis reportes", "Necesito ver mi racha académica.", EstadoConsulta.pendiente],
  ] as const;

  await prisma.consultaSoporte.createMany({
    data: consultasBase.map(([usuarioKey, asunto, mensaje, estado], index) => ({
      id_usuario: usuariosPorKey[usuarioKey].id_usuario,
      asunto,
      mensaje,
      estado_consulta: estado,
      fecha_envio: enDias(-(index + 1)),
      fecha_respuesta: estado === EstadoConsulta.pendiente ? null : enDias(-(index + 1) + 1),
      respuesta:
        estado === EstadoConsulta.respondida || estado === EstadoConsulta.cerrada
          ? "Consulta atendida por el equipo de soporte TaskUni."
          : null,
    })),
  });

  console.log("Creando reportes de productividad...");
  const periodos = ["2026-04", "2026-05", "2026-06", "2026-07"];
  const reportesData = [
    ["manuel", [12, 9, 2, 1, 75, 6]],
    ["ana", [10, 7, 2, 1, 70, 4]],
    ["jorge", [9, 6, 2, 1, 66, 3]],
    ["sofia", [11, 8, 2, 1, 73, 5]],
    ["diego", [8, 5, 2, 1, 62, 4]],
    ["mariana", [10, 8, 1, 1, 80, 7]],
    ["rosa", [9, 6, 2, 1, 67, 4]],
    ["pedro", [8, 6, 1, 1, 75, 5]],
    ["laura", [7, 5, 1, 1, 72, 3]],
    ["kevin", [6, 3, 2, 1, 50, 2]],
    ["valeria", [5, 2, 2, 1, 40, 1]],
  ] as const;

  await Promise.all(
    reportesData.flatMap(([usuarioKey, valores]) =>
      periodos.map((periodo, index) =>
        prisma.reporteProductividad.create({
          data: {
            id_usuario: usuariosPorKey[usuarioKey].id_usuario,
            periodo,
            total_tareas: valores[0] + index,
            tareas_completadas: valores[1] + index,
            tareas_pendientes: valores[2],
            tareas_vencidas: valores[3],
            porcentaje_cumplimiento: valores[4] - index,
            racha_productividad: valores[5] + index,
            fecha_generacion: enMeses(-(3 - index)),
          },
        })
      )
    )
  );

  console.log("Seed completado con éxito.");
  console.log("---------------------------------------------");
  console.log("Credenciales de prueba");
  console.log("Administrador principal: admin@taskuni.edu.pe");
  console.log("Administrador secundario: carlos.vega@taskuni.edu.pe");
  console.log("Estudiantes principales: manuel.torres@unt.edu.pe, ana.quiroz@unt.edu.pe, jorge.paredes@unt.edu.pe");
  console.log("Contraseña general: Password123!");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
