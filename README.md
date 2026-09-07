# HaxNew Mobile (Android)

App Android que carga HaxBall en un WebView e inyecta tus extensiones propias
(field skin, ball skin, avatar, roomlist), con login de Discord nativo simple.

## Que trae y que NO trae (a proposito)

Se mantuvo: field-skin (+ panel + galeria), ball-skin (+ galeria), avatar-image,
avatar-ball-panel, roomlist, y toda la infraestructura base (core, security,
settings, styles, themes, render-keepalive, position-drag).

Se saco (para aligerar CPU/memoria en celular): cosmeticos, accesorios,
battlepass, missions, friends-panel, spotify, camisetas, y todos los "skins"
de HUD (scoreboard, keystroke, fps, ping, clock, room-info), sonidos, y los
efectos visuales "liquid glass" (excepto el de roomlist).

El login de Discord de escritorio (discord-login.js) dependia de un servidor
local (127.0.0.1:5484) que no existe en mobile. Se reemplazo por un login
simple y nativo (mobile-login.js + MainActivity.kt): trae usuario y avatar de
Discord, sin las funciones extra (foto de perfil personalizada, sesion con
"misiones", etc).

## ANTES DE COMPILAR: poné tu Discord Client Secret

Abri `app/src/main/java/com/haxnew/mobile/MainActivity.kt` y reemplaza:

```kotlin
const val DISCORD_CLIENT_SECRET = "PONE_ACA_TU_CLIENT_SECRET"
```

Sacalo del mismo Discord Developer Portal donde configuraste el Client ID
`1539452814324006954` que ya usa la app de escritorio.

**Aviso de seguridad:** este secret queda embebido en el APK. Cualquiera que
decompile la app puede extraerlo. Es aceptable para uso privado/entre amigos,
pero si algun dia esto se publica en Play Store, hay que mover el intercambio
de codigo por token a un backend propio en vez de hacerlo desde el celular.

Ademas, en el Discord Developer Portal -> OAuth2 -> Redirects, agrega:
```
haxnew://auth
```

## Como compilarlo (GitHub Actions, sin PC)

1. Cre창 un repo en GitHub (puede ser privado).
2. Sub��� todos estos archivos y carpetas tal cual estan.
3. Anda a la pestaña "Actions" del repo -> el workflow "Build APK" corre solo
   al hacer push a `main` (o lo tira a mano con "Run workflow").
4. Cuando termina (2-4 min aprox), entra al run finalizado -> abajo del todo
   dice "Artifacts" -> descarga `HaxNewMobile-debug-apk`. Es un .zip que
   adentro tiene el `app-debug.apk`.
5. Pasalo a tu celular e instalalo (Android va a pedir permiso para
   "instalar apps de origen desconocido" la primera vez).

## Notas

- Es un APK de "debug", sin firma de release. Sirve perfecto para instalar y
  probar vos y tus amigos, pero no es apto para subir a Play Store tal cual.
- Los botones de settings.js que abrian paneles removidos (fps, ping, clock,
  room-info, spotify) van a quedar visibles pero sin hacer nada al tocarlos.
  Avisen si quieren que se limpien del menu tambien.
"# Haxnew-mobile-v0.1" 
