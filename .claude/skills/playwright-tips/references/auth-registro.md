# Auth — Signup and Login

## Signup (create account)

1. Navigate to `http://localhost:5173/rag/auth`
2. Click "Crear un nuevo usuario" (link at the bottom)
3. Fill the form with `browser_fill_form`:

| Field | Ref pattern | Example |
|---|---|---|
| *Nombre | textbox "*Nombre" | Claudio |
| *Apellido paterno | textbox "*Apellido paterno" | Neuronal |
| Apellido materno | textbox "Apellido materno" | Transformer |
| *Cedula profesional | textbox "*Cedula profesional" | 1234567 |
| *Institucion (name) | textbox "*Institucion primaria..." | Hospital General de IA |
| *Institucion (state) | combobox | Ciudad de Mexico |
| *Correo electronico | textbox "*Correo electronico" | claudio.neuronal@ejemplo.com |
| *Contrasena | textbox "*Contrasena" | ClaudIA2025! |

4. Click "Crear cuenta"
5. **Bug:** redirects to `/rag/rag/add/characteristics` (404).
   Manually navigate to `/rag/add/characteristics`.

## Login

1. Navigate to `http://localhost:5173/rag/auth`
2. Fill email, password, and select state
3. Click "Iniciar sesion"
4. Redirects to the authenticated dashboard