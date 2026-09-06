export interface NavigationItem {
  label: string;
  href?: string;
  children?: NavigationItem[];
}

export const navigation: NavigationItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
  },
  {
    label: "Operaciones",
    children: [
      {
        label: "Guías / Houses",
        href: "/operaciones/guias",
      },
      {
        label: "Bultos",
        href: "/operaciones/bultos",
      },
      {
        label: "Manifiestos",
        href: "/operaciones/manifiestos",
      },
      {
        label: "Importar Manifiesto",
        href: "/operaciones/manifiestos/importar",
      },
      {
        label: "Master AWB",
        href: "/operaciones/master-awb",
      },
      {
        label: "Personas",
        href: "/operaciones/personas",
      },
    ],
  },
  {
    label: "Logística",
    children: [
      {
        label: "Recepción",
        href: "/logistica/recepcion",
      },
      {
        label: "Almacén",
        href: "/logistica/almacen",
      },
      {
        label: "Ubicaciones",
        href: "/logistica/ubicaciones",
      },
      {
        label: "Viajes",
        href: "/logistica/viajes",
      },
      {
        label: "Rutas",
        href: "/logistica/rutas",
      },
      {
        label: "Entregas",
        href: "/logistica/entregas",
      },
    ],
  },
  {
    label: "Control",
    children: [
      {
        label: "Incidencias",
        href: "/control/incidencias",
      },
      {
        label: "Excepciones",
        href: "/control/excepciones",
      },
      {
        label: "Inspecciones",
        href: "/control/inspecciones",
      },
      {
        label: "Auditoría",
        href: "/control/auditoria",
      },
    ],
  },
  {
    label: "Reportes",
    children: [
      {
        label: "Operativos",
        href: "/reportes/operativos",
      },
      {
        label: "Manifiestos",
        href: "/reportes/manifiestos",
      },
      {
        label: "Guías",
        href: "/reportes/guias",
      },
      {
        label: "Bultos",
        href: "/reportes/bultos",
      },
      {
        label: "Estadísticas",
        href: "/reportes/estadisticas",
      },
    ],
  },
  {
    label: "Administración",
    children: [
      {
        label: "Usuarios",
        href: "/administracion/usuarios",
      },
      {
        label: "Roles y permisos",
        href: "/administracion/roles",
      },
      {
        label: "Configuración",
        href: "/administracion/configuracion",
      },
      {
        label: "Catálogos",
        href: "/administracion/catalogos",
      },
    ],
  },
];
