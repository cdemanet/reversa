# Guía con analogías

¿No sabes qué agente llamar? Activa la guía:

```
/reversa-agents-help
```

---

## Menú principal

| ¿Qué quieres hacer? | Comando | Equipo |
|---|---|---|
| Descubrir y documentar un sistema heredado | `/reversa` | Reversa Agents Core |
| Crear un proyecto nuevo desde una idea | `/reversa-new` | Code New Project Agents |
| Implementar o evolucionar código desde las specs | `/reversa-forward` | Code Forward Agents |
| Planificar la migración de un legado | `/reversa-migrate` | Migration Agents |
| Generar un mini-sitio visual de documentación | `/reversa-docs` | Documentation Agents |
| Descubrir cómo vender y cuánto cobrar por el software o por una feature | `/reversa-pricing` | Pricing and Size Agents |
| Elegir el agente adecuado | `/reversa-agents-help` | Guía de agentes |

El equipo de Pricing entra por `/reversa-pricing`. Translators usan `/reversa-n8n`.

---

## Orquestadores y agentes del Core

### 🆕 Reversa New: el fundador de producto

El fundador empieza con una idea todavía preliminar, investiga el problema, entiende para quién existe el producto, consolida un PRD y lo transforma en especificaciones listas para implementar.

> Usa `/reversa-new` para proyectos greenfield. Conduce `Ideator → Researcher → Drafter → Spec SDD` y entrega el resultado a `/reversa-forward`.

### 🎼 Reversa: el director de orquesta

Un director no toca ningún instrumento. Conoce la partitura completa y dice quién entra cuándo, en qué orden, a qué ritmo. Sin él, cada músico tocaría su parte sin conectarse con los demás.

> Usa `/reversa` para iniciar o retomar el análisis completo.

---

### 🗺️ Scout: el agente inmobiliario

El agente hace el primer tour de la propiedad. No abre cajones, no lee documentos, no toca nada. Solo mapea: cuántas habitaciones, qué instalaciones existen, cuál es el estado general.

> Usa el Scout al principio. Genera el inventario del proyecto sin entrar en la lógica del código.

---

### ⛏️ Archaeologist: el excavador

El arqueólogo excava el terreno con paciencia, capa a capa. Cataloga cada artefacto encontrado: tamaño, material, ubicación, forma. No interpreta la civilización, solo describe con precisión lo que hay.

> Usa el Archaeologist para analizar el código módulo a módulo. Corre un módulo por sesión para conservar tokens.

---

### 🔍 Detective: Sherlock Holmes

Sherlock Holmes llega después del arqueólogo. Mira los artefactos catalogados y pregunta: *"¿Por qué está esto aquí? ¿Quién lo puso? ¿Qué revela sobre quién vivió aquí?"* No excava, interpreta.

> Usa el Detective después del Archaeologist. Extrae reglas de negocio implícitas, lee el historial de git como un diario y reconstruye decisiones que nadie documentó.

---

### 📐 Architect: el cartógrafo

El cartógrafo visita un territorio y produce mapas formales. Alguien que nunca estuvo allí puede entender todo mirando los mapas.

> Usa el Architect después del Detective. Sintetiza todo en diagramas C4, ERD completo y mapa de integraciones.

---

### 📝 Writer: el notario

El notario transforma lo descubierto en contratos formales, precisos y trazables. Cada cláusula tiene nivel de certeza declarado. El documento vale como contrato.

> Usa el Writer después del Architect. Genera specs SDD, OpenAPI y user stories con trazabilidad de código.

---

### ⚖️ Reviewer: el revisor de specs

El Reviewer toma los contratos del Writer e intenta hacerles agujeros. No para destruir, sino para garantizar que lo que quede sea sólido.

> Usa el Reviewer después del Writer.

---

### 🖼️ Visor: el ilustrador forense

El ilustrador forense trabaja solo con imágenes. Recibe screenshots del sistema y reconstruye fielmente la interfaz: pantallas, formularios, flujos de navegación.

> Usa el Visor cuando tengas screenshots disponibles.

---

### 🗄️ Data Master: el geólogo

El geólogo mapea el subsuelo: la capa que nadie ve pero que lo sostiene todo. Tablas, relaciones, constraints, triggers, procedures.

> Usa el Data Master cuando haya DDL, migrations o modelos ORM disponibles.

---

### 🎨 Design System: el estilista

El estilista cataloga el guardarropa: paleta de colores, tipografía, espaciados, tokens de diseño.

> Usa el Design System cuando haya archivos CSS, temas o screenshots de interfaz.

---

## 💰 Reversa Pricing: el consultor de precios
**Comando:** `/reversa-pricing`

Un buen consultor de precios no empieza por el número. Antes pregunta cómo quieres vender: por encargo para un cliente, como licencia, alquiler, suscripción o en una tienda de apps. Solo después de conocer el modelo llama a cada especialista: quien investiga el mercado, quien anota cómo cobras, quien mide la obra, quien arma el presupuesto y quien calcula cuántos clientes pagan la cuenta. Al final nunca recibes un número solo: recibes rangos, escenarios y lo que cada precio exige.

> Usa Reversa Pricing cuando quieras saber cuánto cobrar por el software o por una feature, seas principiante o experimentado. Detecta dónde te quedaste en `_pricing/` y conduce `Advisor → Profile → Product` (producto) o `Size → Estimate` (servicio, por feature). Research entra cuando prefieres investigar en vez de informar.

**Los seis especialistas:**

| Agente | Analogía | Comando |
|---|---|---|
| **Advisor** | El consultor que pregunta cómo quieres vender antes de hablar de números | `/reversa-pricing-advisor` |
| **Research** | El investigador que va al mercado y vuelve con rango, fuente y fecha | `/reversa-pricing-research` |
| **Profile** | El contador que anota cómo cobras, o investiga por ti | `/reversa-pricing-profile` |
| **Size** | El ingeniero que mide la obra por el plano, no por el ladrillo | `/reversa-pricing-size` |
| **Estimate** | El presupuestador que entrega tres escenarios, nunca un número solo | `/reversa-pricing-estimate` |
| **Product** | El planificador que dice cuántos clientes pagan la cuenta en cada precio | `/reversa-pricing-product` |

---

## Secuencia recomendada

```
Proyecto heredado: /reversa → descubrimiento y especificaciones
Proyecto nuevo:    /reversa-new → PRD y specs → /reversa-forward
Migración:         /reversa → /reversa-migrate → /reversa-forward
Poner precio:      /reversa-pricing → advisor → profile → product | size → estimate

Pipeline heredado manual:
Scout → Archaeologist (N sesiones) → Detective → Architect → Writer → Reviewer

Opcionales en cualquier fase:
Visor · Data Master · Design System · Reversa Docs
```
