# La plataforma — contexto clínico y epidemiológico

Este documento explica de qué trata la plataforma para alguien sin formación
médica. Su propósito es entender qué hace el sistema antes de tocar el código.

---

## El problema que resuelve

México tiene un problema creciente de **resistencia antimicrobiana (RAM)**:
las bacterias están evolucionando para resistir los antibióticos que se usan
para tratarlas. Esto convierte infecciones tratables en infecciones difíciles
o imposibles de curar.

Para combatirlo, se necesita **vigilancia epidemiológica**: saber qué bacterias
están circulando, qué antibióticos ya no funcionan contra ellas, en qué
hospitales y regiones. Sin datos, no hay política de salud pública posible.

Esta plataforma es una herramienta de captura y análisis de esos datos, usada
por profesionales de salud en hospitales y clínicas vinculados a la SSA
(Secretaría de Salud).

---

## Las dos funciones principales

### 1. Registro clínico de pacientes con soporte diagnóstico

Los profesionales de salud registran a sus pacientes (identificados por CURP)
y documentan sus visitas clínicas. La plataforma guía el diagnóstico a través
de **algoritmos clínicos**: el sistema pregunta síntomas y sugiere opciones de
tratamiento basadas en guías clínicas nacionales.

Esto es relevante para la RAM porque el tratamiento sugerido considera qué
antibióticos son apropiados dado el perfil de resistencia conocido en la región.

### 2. Vigilancia del resistoma InDRE

Los laboratorios ingresan resultados de cultivos bacteriológicos: qué bacteria
se identificó, qué mecanismos de resistencia tiene, qué antibióticos le
funcionan y cuáles no. Estos datos se agregan en dashboards y mapas
epidemiológicos.

**InDRE** (Instituto de Diagnóstico y Referencia Epidemiológicos) es la
institución federal que coordina la red de laboratorios de salud pública en
México. Esta plataforma complementa su sistema de vigilancia.

---

## Los cuatro síndromes clínicos

La plataforma cubre cuatro tipos de infección. Cuando un profesional de salud
registra un paciente, selecciona cuál de estos síndromes sospecha:

### IRAS — Infecciones Respiratorias Agudas Superiores
Afectan nariz, garganta, senos paranasales y oídos. Incluyen resfriado común,
faringitis, sinusitis y otitis. Son las infecciones más frecuentes en atención
primaria y también donde más se abusa del uso de antibióticos (muchas son
virales y no responden a antibióticos).

### ITS — Infecciones de Transmisión Sexual
Incluyen gonorrea, clamidia, sífilis y otras. Varias de estas son infecciones
donde la resistencia antimicrobiana ya es un problema grave a nivel mundial
(la gonorrea resistente a cefalosporinas es una preocupación activa de la OMS).

### IVU — Infecciones de Vías Urinarias
Afectan vejiga (cistitis), uretra (uretritis) o riñones (pielonefritis). Son
muy comunes, especialmente en mujeres, y los antibióticos de primera línea
(como fluoroquinolonas) ya muestran resistencia significativa en varios países.

### EDAS — Enfermedades Diarreicas Agudas
Infecciones gastrointestinales causadas por bacterias como Salmonella,
E. coli o Campylobacter. La mayoría se resuelven sin antibióticos, pero en
casos severos o en pacientes vulnerables, el perfil de resistencia del
organismo causal es crítico.

---

## El resistoma

El **resistoma** es el conjunto de genes de resistencia a antibióticos
presentes en una bacteria. No es solo "esta bacteria resiste tal antibiótico",
sino el mecanismo molecular específico por el que lo hace:

- **Mecanismos de resistencia**: cómo la bacteria evade el antibiótico
  (ej. produce una enzima que lo destruye, modifica su punto de acción, lo
  expulsa activamente)
- **Genes de resistencia**: los genes específicos que codifican ese mecanismo
  (ej. gen `blaKPC` que produce una enzima que destruye carbapenémicos)
- **Familias de genes**: agrupaciones de genes con mecanismos similares

En la plataforma, cuando un laboratorio ingresa un resultado InDRE, documenta
exactamente esto: bacteria + mecanismo + genes + resultados de sensibilidad
a antibióticos específicos.

---

## Los algoritmos clínicos — cómo están implementados

Los algoritmos son la lógica de soporte diagnóstico. Toman como entrada los
síntomas que el profesional marcó y producen como salida una recomendación de
tratamiento. Están basados en guías clínicas oficiales (GPC — Guías de
Práctica Clínica de México).

### Estructura en el código

Cada síndrome tiene su propia carpeta bajo `app/algorithms/`:

```
app/algorithms/
  AlgorithmIRAS.tsx     ← componente React que orquesta el algoritmo IRAS
  AlgorithmITS.tsx      ← ídem para ITS
  AlgorithmIVU.tsx      ← ídem para IVU
  AlgorithmEDAS.tsx     ← ídem para EDAS
  IRAS/                 ← lógica detallada de IRAS
    utilitiesSymptoms.ts  ← lista de síntomas y sus etiquetas
    utilitiesAlgorithm.ts ← reglas del árbol de decisión
  ITS/                  ← ídem para ITS
  IVU/                  ← ídem para IVU
  EDAS/                 ← ídem para EDAS
  Utilities             ← utilidades compartidas entre algoritmos
```

### Cómo funciona el árbol de decisión

1. El usuario marca síntomas secundarios en la ruta `/add/define`
2. Esos síntomas se guardan en el Zustand store `useSecondarySymptomStore`
3. El componente del algoritmo (ej. `AlgorithmIRAS.tsx`) lee el store y
   evalúa qué combinación de síntomas está presente
4. Según las reglas definidas en `utilitiesAlgorithm.ts`, determina el
   diagnóstico más probable y las opciones de tratamiento
5. El resultado se muestra al profesional en la ruta `/add/revise`

Todo esto ocurre en el **cliente** (navegador), no en el servidor. No hay
llamadas a la base de datos en este paso — es lógica pura sobre los síntomas
ya capturados.

### Qué significan los símbolos del algoritmo

Los algoritmos clínicos médicos usan árboles de decisión con condiciones
tipo "si el paciente tiene fiebre Y dificultad para respirar, entonces...".
En el código esto se traduce a evaluaciones de arrays booleanos (qué síntomas
están marcados como `true` en el store).
