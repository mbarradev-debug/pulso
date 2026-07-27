# Autenticación, Autorización y Seguridad

Este documento describe el modelo de seguridad, gestión de credenciales y protección de entornos aplicado en **Pulso**.

---

## 🔐 Modelo de Usuario y Acceso Público

**Pulso** es una aplicación pública de libre acceso que no requiere registro de usuarios, inicio de sesión (Login/Logout), Json Web Tokens (JWT), ni manejo de cookies de sesión o autenticación en el cliente.

- **Frontend**: Acceso 100% anónimo para cualquier cliente.
- **Preferencias**: Las listas de favoritos se persisten localmente en la máquina del usuario (`localStorage`) sin enviar identificadores a ningún servidor.

---

## 🔑 Credenciales de Integración Backend

Aunque la aplicación es pública para el usuario final, la comunicación entre el servidor de Next.js y el servicio **SI3 del Banco Central de Chile** requiere autenticación mediante credenciales asignadas:

```typescript
const user = process.env.BCENTRAL_USER;
const pass = process.env.BCENTRAL_PASS;
```

### Reglas de Seguridad de Credenciales:

1. **Aislamiento en Servidor**: Las variables `BCENTRAL_USER` y `BCENTRAL_PASS` se consumen **únicamente** en `lib/bcentral-client.ts` dentro del entorno Node.js del servidor.
2. **Sin Prefijo `NEXT_PUBLIC_`**: Al no usar el prefijo `NEXT_PUBLIC_`, el compilador de Next.js excluye tajantemente estas variables del bundle JavaScript enviado al cliente/navegador, evitando cualquier fuga o exposición de credenciales secretas.

---

## 🛡️ Protección de Rutas de Desarrollo (Dev Proxy)

El proyecto incluye una herramienta de desarrollo visual en la ruta `/dev/ui`. Para prevenir que usuarios externos o motores de búsqueda accedan a esta interfaz en producciones desplegadas:

### 1. Capa de Middleware Proxy (`proxy.ts`):

```typescript
export function proxy() {
  if (process.env.NODE_ENV === 'production') {
    return new NextResponse(null, { status: 404 });
  }
  return NextResponse.next();
}

export const config = {
  matcher: '/dev/ui',
};
```

### 2. Capa de Servidor (`app/dev/ui/page.tsx`):

```typescript
if (process.env.NODE_ENV === 'production') {
  notFound();
}
```

Esta estrategia de **defensa en profundidad** asegura que en producción la ruta devuelva un código HTTP `404 Not Found`, ocultando su existencia por completo.
