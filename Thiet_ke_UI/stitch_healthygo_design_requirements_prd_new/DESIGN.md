# Design System Document

## 1. Overview & Creative North Star: "The Living Pantry"
To move beyond the sterile, "template" feel of typical e-commerce, this design system is guided by the Creative North Star of **"The Living Pantry."** 

This concept rejects the rigid, boxy constraints of standard grids in favor of an editorial, high-end culinary aesthetic. We achieve this through **intentional asymmetry**, where product imagery occasionally breaks out of its containers, and **tonal layering**, where depth is felt through color shifts rather than heavy shadows. The goal is to make the user feel they are browsing a premium physical boutique, emphasizing freshness, vitality, and professional transparency.

---

## 2. Colors: Tonal Depth & Vitality
The palette is rooted in organic growth (`primary`) and sun-ripened energy (`secondary`). We utilize a sophisticated Material Design-inspired token set to ensure harmony.

### The "No-Line" Rule
**Prohibit 1px solid borders for sectioning.** Boundaries must be defined solely through background color shifts. For instance, a `surface-container-low` section sitting on a `surface` background creates a clear but soft distinction. 

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers. Use the hierarchy below to define importance:
- **Base Layer:** `surface` (#f9f9f9)
- **Secondary Sectioning:** `surface-container-low` (#f3f3f3)
- **Active UI Elements/Cards:** `surface-container-lowest` (#ffffff)
- **Elevated Overlays:** `surface-container-high` (#e8e8e8)

### The "Glass & Gradient" Rule
To elevate the "Fresh Green" (#4CAF50), do not use it only as a flat fill. 
- **Signature CTAs:** Use a subtle linear gradient from `primary` (#006e1c) to `primary-container` (#4caf50) at a 135-degree angle. This adds "soul" and dimension.
- **Floating Navigation:** Use `surface-container-lowest` with an 80% opacity and a `backdrop-blur-md` (Tailwind) to create a frosted glass effect, allowing organic product colors to bleed through as the user scrolls.

---

## 3. Typography: Editorial Authority
We pair the geometric precision of **Plus Jakarta Sans** for high-impact display with the utilitarian clarity of **Inter** for functional data.

| Level | Token | Font Family | Size | Intent |
| :--- | :--- | :--- | :--- | :--- |
| **Display** | `display-lg` | Plus Jakarta Sans | 3.5rem | High-end hero messaging; use with `-0.02em` tracking. |
| **Headline** | `headline-md` | Plus Jakarta Sans | 1.75rem | Category headers; bold and authoritative. |
| **Title** | `title-lg` | Inter | 1.375rem | Product names and card titles; Medium weight (500). |
| **Body** | `body-md` | Inter | 0.875rem | Nutritional info and descriptions; Regular weight (400). |
| **Label** | `label-sm` | Inter | 0.6875rem | Micro-copy and "Organic" tags; All caps with `0.05em` spacing. |

**The Hierarchy Rule:** Always pair a `display-lg` headline with a `body-lg` sub-header. The drastic scale contrast creates the "Editorial" look that differentiates us from generic competitors.

---

## 4. Elevation & Depth: Tonal Layering
Traditional drop shadows are often a crutch for poor layout. In this system, we use **Tonal Layering**.

- **The Layering Principle:** Place a `surface-container-lowest` card on a `surface-container-low` background. This creates a natural "lift" that feels premium and clean.
- **Ambient Shadows:** For floating elements (e.g., a "Quick Add" FAB), use a shadow with a 24px blur and only 4% opacity. The shadow color must be a tinted version of `on-surface` (#1a1c1c), never pure black.
- **The "Ghost Border":** If a border is required for accessibility, use the `outline-variant` token at 15% opacity. **Never use 100% opaque borders.**
- **Asymmetric Offsets:** Break the grid. A product image should overlap its container by `spacing-4` (1rem) to create a sense of movement and "life."

---

## 5. Components: Functional Elegance

### Product Cards
- **Structure:** No borders or dividers. Use `surface-container-lowest` background. 
- **Nutritional Tags:** Use `tertiary-container` (#74aa34) with `on-tertiary-container` (#203900) text. Tags should have a `rounded-full` corner.
- **Interaction:** On hover, transition the background to `surface-container-high` and slightly scale the image.

### Buttons (CTAs)
- **Primary:** Gradient fill (`primary` to `primary-container`), `rounded-md` (0.75rem), white text.
- **Secondary:** `surface-container-highest` background with `on-surface` text. No border.
- **Tertiary:** Text-only in `primary` weight 600, with a `spacing-1` (0.25rem) underline that expands on hover.

### Admin Dashboard
- **Sidebar:** Use `surface-container-low` to distinguish the navigation from the main workspace.
- **Data Tables:** Forbid horizontal lines. Use alternating row colors (`surface` and `surface-container-lowest`) and generous vertical padding (`spacing-4`).
- **Charts:** Use the `secondary` (#8b5000) and `tertiary` (#3e6a00) tokens for data visualization to ensure health-centric color coding.

### Input Fields
- **Default:** `surface-container-highest` background, `rounded-sm`.
- **Focus:** `outline` (#6f7a6b) "Ghost Border" at 20% opacity.
- **Error:** Background shifts to `error-container` (#ffdad6) with `on-error-container` text.

---

## 6. Do’s and Don’ts

### Do:
- **Do** use whitespace as a separator. Use `spacing-12` (3rem) between major sections.
- **Do** use `rounded-xl` (1.5rem) for large image containers to maintain a "soft" organic feel.
- **Do** utilize the "soft orange" (`secondary-container`) for scarcity alerts (e.g., "Only 2 left!").

### Don’t:
- **Don’t** use pure black (#000) for text. Always use `on-surface` (#1a1c1c).
- **Don’t** use standard 1px dividers to separate list items. Use `spacing-2` gaps or subtle background shifts.
- **Don’t** use sharp 0px corners. Every element must have at least `rounded-sm` (0.25rem) to feel approachable.