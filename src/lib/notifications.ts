export type NotificationItem = {
  id: string;
  titulo: string;
  descripcion: string;
  fechaLabel: string;
  href: string;
  tipo: string;
  estado: "pendiente" | "alerta" | "info" | "exito";
};
