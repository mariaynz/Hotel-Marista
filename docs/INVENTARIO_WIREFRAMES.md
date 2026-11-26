# Inventario de Wireframes — Hotel Marista Gestión (HMG)

Análisis detallado pantalla por pantalla elaborado antes de la implementación, respetando estructura, orden, jerarquía y textos de los wireframes adjuntos.

---

## Pantalla 1: Inicio de sesión (y registro de huéspedes)
- **Ruta:** `/login`
- **Rol:** Público (usuarios no autenticados).
- **Zonas:**
  1. Fondo general en tono arena (`secondary`).
  2. Tarjeta central blanca con bordes redondeados y sombra suave.
- **Componentes y textos exactos:**
  - Título principal (`Playfair Display Bold`, 28px, `primary`): `Hotel Marista`
  - Subtítulo (`Inter`, `ink-soft`): `Inicia sesión para reservar o administrar el hotel`
  - Campo de texto: etiqueta `Correo electrónico`, placeholder `nombre@correo.com`
  - Campo de contraseña: etiqueta `Contraseña`
  - Botón primario ancho completo (`primary`): `Iniciar sesión`
  - Enlace inferior centrado: `¿No tienes cuenta? Regístrate`
- **Acciones:**
  - Enviar formulario valida credenciales, crea sesión en SQLite con cookie `httpOnly` y redirige a `/huesped/buscar` (si es `huesped`) o `/recepcion` (si es `recepcion`).
  - Clic en `¿No tienes cuenta? Regístrate` despliega en la misma tarjeta el formulario de registro de huésped (`Nombre completo`, `Correo electrónico`, `Teléfono`, `Contraseña`, botón `Crear cuenta` y enlace `¿Ya tienes cuenta? Inicia sesión`).
- **Estados visibles:** Error de validación junto a cada campo, error general de credenciales inválidas con `aria-live="polite"`, estado de carga en botón al enviar.

---

## Pantalla 2: Búsqueda de habitaciones
- **Ruta:** `/huesped/buscar`
- **Rol:** `huesped`
- **Zonas:**
  1. Barra superior blanca de navegación (`header`).
  2. Encabezado de sección y barra horizontal de filtros de búsqueda.
  3. Rejilla de 3 columnas (escritorio) con tarjetas de habitaciones disponibles.
  4. Modal de confirmación de reserva (adición mínima de flujo).
- **Componentes y textos exactos:**
  - Barra superior:
    - Marca a la izquierda: `Hotel Marista`
    - Enlaces a la derecha: `Habitaciones` (activo), `Mis reservas`, indicador de usuario (`Ana Pérez · Huésped`) y botón discreto `Salir`.
  - Encabezado: `Encuentra tu habitación`
  - Barra de búsqueda:
    - Campo fecha: `Llegada` (`dd/mm/aaaa` / selector fecha ISO)
    - Campo fecha: `Salida` (`dd/mm/aaaa` / selector fecha ISO)
    - Selector/campo: `Huéspedes` (ej. `2 personas`)
    - Botón primario: `Buscar`
  - Tarjetas de habitación:
    - Bloque visual superior (ilustración/marcador de habitación con número y piso)
    - Título de categoría (`Habitación Sencilla`, `Habitación Doble`, `Suite Junior`, etc.)
    - Subtítulo descriptivo (`1 cama · Vista al jardín · 2 personas`, etc.)
    - Etiqueta de disponibilidad (`Disponible` o `Pocas disponibles`)
    - Tarifa destacada (`$1,200/noche`, `$1,800/noche`, `$2,900/noche`)
    - Botón primario ancho completo: `Reservar`
- **Acciones:**
  - `Buscar` consulta en servidor las habitaciones disponibles para el rango de fechas y capacidad.
  - `Reservar` abre modal con resumen de fechas, noches y total en MXN; al confirmar ejecuta transacción atómica en SQLite. Si la habitación deja de estar disponible, cierra el modal, conserva las fechas y muestra alerta con instrucción de `cambiar fechas`.
- **Estados visibles:** Estado vacío cuando no hay habitaciones para el filtro, alerta de empalme (`cambiar fechas`), errores de rango de fechas, éxito al redirigir a `/huesped/reservas`.

---

## Pantalla 3: Mis reservas
- **Ruta:** `/huesped/reservas`
- **Rol:** `huesped`
- **Zonas:**
  1. Barra superior blanca de navegación (idéntica a Pantalla 2, con `Mis reservas` activo).
  2. Encabezado principal `Mis reservas`.
  3. Sección `Próximas` (lista vertical de tarjetas horizontales).
  4. Sección `Anteriores` (lista vertical de tarjetas horizontales).
- **Componentes y textos exactos:**
  - Encabezado: `Mis reservas`
  - Subtítulo sección 1: `Próximas`
    - Tarjeta horizontal: miniatura visual a la izquierda, título `#HMG-2026-XXXXXX · Habitación Doble`, detalle `12-14 de diciembre · 2 huéspedes`, etiqueta de estado `Confirmada` (o `En curso`), botón secundario con borde `Cancelar reserva` (solo visible si está `Confirmada` y no ha iniciado).
  - Subtítulo sección 2: `Anteriores`
    - Tarjeta horizontal: miniatura visual a la izquierda, título `#HMG-2026-XXXXXX · Habitación Sencilla`, detalle `10-11 de octubre · 1 huésped`, etiqueta de estado `Completada` (o `Cancelada`).
- **Acciones:**
  - `Cancelar reserva` solicita confirmación y actualiza el estado de la reserva a `cancelada`, liberando inmediatamente las fechas para futuras búsquedas.
- **Estados visibles:** Banner de confirmación tras crear o cancelar reserva, estado vacío si el huésped no tiene reservas próximas o anteriores.

---

## Pantalla 4: Panel de recepción (Reservas y ocupación del día)
- **Ruta:** `/recepcion`
- **Rol:** `recepcion`
- **Zonas:**
  1. Barra lateral izquierda fija en color `primary` (`#0F5C6E`).
  2. Encabezado principal con acción operativa.
  3. Fila de 4 tarjetas métricas (KPIs) del día.
  4. Barra de búsqueda de reservas.
  5. Tabla de reservas del día (responsiva a tarjetas en móvil).
  6. Modales operativos: Check-in, Check-out y Nueva reserva presencial.
- **Componentes y textos exactos:**
  - Barra lateral:
    - Marca: `Hotel Marista` / subtítulo `Recepción`
    - Menú: `Panel del día` (activo), `Reservas`, `Habitaciones`, `Huéspedes`
    - Pie lateral: `Laura · Recepcionista` + acción `Salir`
  - Encabezado: `Panel del día` + botón primario `+ Nueva reserva`
  - Tarjetas KPI (4 columnas):
    - `Llegadas hoy` (conteo numérico)
    - `Salidas hoy` (conteo numérico)
    - `Ocupación` (porcentaje `%`)
    - `Disponibles` (conteo numérico)
  - Buscador: campo con placeholder `Buscar reserva por código o nombre`
  - Tabla de movimientos del día:
    - Columnas: `Código`, `Huésped`, `Habitación`, `Tipo`, `Movimiento` (`Llegada` / `Salida`), `Acción`
    - Botones de acción por fila: `Hacer check-in` y `Hacer check-out`.
- **Acciones:**
  - Búsqueda en tiempo real por código (`HMG-...`) o nombre del huésped.
  - `Hacer check-in`: abre modal que exige marcar `Identificación verificada`, permite asignar otra habitación libre si la actual no está `disponible`, cambia la reserva a `en_curso` y la habitación a `ocupada`.
  - `Hacer check-out`: abre modal con desglose de noches, lista de consumos, formulario para añadir consumo (`Concepto`, `Monto MXN`) y botón para finalizar check-out (cambia reserva a `completada` y habitación a `limpieza`).
  - `+ Nueva reserva`: abre modal para registrar reserva presencial con datos del huésped y habitación libre.
- **Estados visibles:** Lista vacía cuando no hay llegadas/salidas coincidentes, alertas de confirmación o error en modales.

---

## Pantalla 5: Habitaciones (Recepción)
- **Ruta:** `/recepcion/habitaciones`
- **Rol:** `recepcion`
- **Zonas:**
  1. Barra lateral izquierda idéntica a Pantalla 4, con `Habitaciones` activo.
  2. Encabezado principal y botón de alta de habitación.
  3. Barra de filtros por estado (botones píldora).
  4. Rejilla de 4 columnas (escritorio) con tarjetas por habitación.
  5. Modales: Cambiar estado / Editar habitación y Nueva habitación.
- **Componentes y textos exactos:**
  - Encabezado: `Habitaciones` + botón primario `+ Nueva habitación`
  - Filtros de estado: `Todas`, `Disponible`, `Ocupada`, `Limpieza`, `Mantenimiento`
  - Tarjetas de habitación (`101`, `102`, `103`, `104`, `201`, etc.):
    - Número de habitación destacado (`101`)
    - Tipo de habitación (`Sencilla`, `Doble`, `Suite`) y tarifa por noche
    - Badge de estado con color + icono + texto (`Disponible`, `Ocupada`, `Limpieza`, `Mantenimiento`)
    - Botón secundario ancho completo: `Cambiar estado`
- **Acciones:**
  - Los filtros muestran todas las habitaciones o filtran por el estado seleccionado.
  - `Cambiar estado` abre modal para cambiar el estado operativo (`Disponible`, `Ocupada`, `Limpieza`, `Mantenimiento`) o editar los datos de la habitación (tipo, piso, capacidad, tarifa, descripción).
  - `+ Nueva habitación` abre modal para dar de alta una nueva habitación en el inventario del hotel.
- **Estados visibles:** Estado vacío si ninguna habitación coincide con el filtro, confirmación tras actualizar estado o crear habitación.
