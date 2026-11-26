# Hotel Marista Gestión (HMG)

Sistema web responsivo para la gestión de reservaciones, disponibilidad de habitaciones, registro de huéspedes y operación diaria (check-in, check-out, consumos y estado de habitaciones) de un hotel.

## Requisitos previos

- **Node.js** 22.13 o superior (usa el módulo integrado `node:sqlite`)
- **npm** 10.x o superior

## Instalación

```bash
npm install
```

## Comandos disponibles

- `npm run dev`: inicia el servidor de desarrollo en `http://localhost:5173`.
- `npm run build`: compila la aplicación para producción en la carpeta `build/`.
- `npm start`: ejecuta el servidor de producción compilado (`node build`).
- `npm test`: ejecuta la suite de pruebas automatizadas con Vitest.

> **Base de datos:** En el primer arranque del servidor (`npm run dev` o `npm start`), el sistema crea automáticamente `data/hmg.sqlite`, aplica el esquema relacional e inserta los datos iniciales (seed). Se puede definir `DATABASE_PATH` para elegir otra ruta del archivo.

> **Despliegue en Vercel:** la demo usa `/tmp/hmg.sqlite`, así que los datos se reinician en cada arranque del servidor. Para datos persistentes usa un host con disco (Railway, Render, Fly) o cambia de base de datos.

## Credenciales de demostración

- **Recepcionista / Administrador:**
  - Correo: `laura.recepcion@hotelmarista.mx`
  - Contraseña: `Recepcion2026!`
- **Huésped:**
  - Correo: `ana.perez@correo.com`
  - Contraseña: `Huesped2026!`

> Son credenciales de demostración. La contraseña de recepción se puede cambiar con la variable de entorno `SEED_RECEPCION_PASSWORD` antes del primer arranque.

## Estructura del proyecto

```text
├── docs/
│   └── INVENTARIO_WIREFRAMES.md
├── src/
│   ├── app.css
│   ├── app.d.ts
│   ├── app.html
│   ├── hooks.server.ts
│   ├── lib/
│   │   ├── components/         # Componentes UI accesibles (Boton, Campo, Tarjeta, Modal, etc.)
│   │   ├── server/
│   │   │   ├── db/             # Conexión SQLite, esquema, migración y seed
│   │   │   ├── services/       # Lógica de negocio (auth, habitaciones, reservas)
│   │   │   └── validators/     # Validaciones estrictas en servidor
│   │   └── utils/              # Formateo de fechas y moneda MXN
│   └── routes/
│       ├── +layout.server.ts
│       ├── +layout.svelte
│       ├── +page.server.ts
│       ├── login/              # Pantalla 1: Inicio de sesión y registro de huésped
│       ├── logout/
│       ├── huesped/
│       │   ├── +layout.svelte
│       │   ├── buscar/         # Pantalla 2: Búsqueda y reserva de habitaciones
│       │   └── reservas/       # Pantalla 3: Mis reservas (próximas y anteriores)
│       └── recepcion/
│           ├── +layout.svelte
│           ├── +page.svelte    # Pantalla 4: Panel del día, reservas y check-in/out
│           └── habitaciones/   # Pantalla 5: Listado y estado de habitaciones
└── package.json
```

## Supuestos y decisiones de diseño

1. **Códigos de reserva:** Se utiliza el formato `HMG-AAAA-XXXXXX` definido en la especificación de datos (con respaldo de búsqueda tanto con `#` como sin `#`).
2. **Autorregistro exclusivo para huéspedes:** El enlace *"¿No tienes cuenta? Regístrate"* permite crear cuentas con rol `huesped`. Las cuentas de `recepcion` se crean únicamente en el seed inicial.
3. **Vistas secundarias de recepción:** Los enlaces *Reservas* y *Huéspedes* de la barra lateral de recepción alternan vistas dentro de `/recepcion` para respetar la navegación del wireframe sin romper la estructura de 5 pantallas.
4. **Adiciones mínimas de operación:** Se incorporaron modales accesibles para confirmar reservas, verificar identificación y reasignar habitación en check-in, registrar consumos en check-out, crear reservas presenciales y crear/editar habitaciones.
5. **Tarifa congelada:** cada reserva guarda la tarifa por noche del momento en que se creó. Cambiar la tarifa de la habitación después, o reasignar habitación en el check-in, no modifica el precio acordado.
6. **Reservas presenciales:** si el correo del huésped ya tiene cuenta, la reserva se liga a ella y aparece en "Mis reservas".
7. **Zona horaria:** "hoy" se calcula con la hora de Mérida (`America/Merida`), sin importar la zona del servidor.