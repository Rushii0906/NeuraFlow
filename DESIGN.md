# NeuraFlow AI Design System Specification

Welcome to the design system specification for **NeuraFlow AI**. This document details the color tokens, custom typography, component patterns, and responsiveness behaviors that define the application's clean, Notion-inspired corporate aesthetic.

---

## 1. Color System

The color system is optimized for high readability, clean boundaries, and a minimalist canvas feel.

### Primary Brand Colors
- **Vivid Indigo (`#1B1BFF`)**: The primary brand color used for action buttons, focused outlines, active links, and brand landmarks.
- **Vivid Indigo Pressed (`#1212c4`)**: Used for button hover and active pressed states.
- **Vivid Teal (`#00FF9C`)**: Accent color used for highlighting special features, status nodes, and visual indicators.
- **Pale Yellow (`#FAFAF8`)**: Soft card backdrop color for visual highlights.
- **Deep Navy (`#0a1530`)**: Used for the public homepage hero banner background to project enterprise confidence.

### Neutral Palette
- **Canvas Backdrop (`#ffffff`)**: The default clean background for main panels and study outlines.
- **Notion Surface (`#f6f5f4`)**: Used for persistent sidebars, table headers, and layout dividers.
- **Soft Backdrop (`#fafaf9`)**: Light grey-cream shade used for secondary cards and timeline backgrounds.
- **Hairline Divider (`#e5e3df`)**: Soft border divider for clean containment grids.
- **Strong Border (`#c8c4be`)**: Standard border color for form input fields.

### Ink & Typography Colors
- **Ink Black (`#1a1a1a`)**: Default color for headings, titles, and active buttons.
- **Charcoal (`#37352f`)**: Main body text color, providing high contrast without the harshness of pure black.
- **Steel Gray (`#787671`)**: Used for captions, badges, secondary information, and inactive navigation links.

### Category Accent Tints (Pastel)
| Tint Name | Background Hex | Text Hex | Use Case |
| :--- | :--- | :--- | :--- |
| **Peach** | `#ffe8d4` | `#dd5b00` | Developer Track / Total Pathways |
| **Lavender** | `#e6e0f5` | `#391c57` | Chapters Completed / Quizzes |
| **Mint** | `#d9f3e1` | `#1aae39` | Average Quiz Score / Accomplished Nodes |
| **Rose** | `#fde0ec` | `#a02e6d` | Interview Questions |
| **Sky** | `#dcecfa` | `#005bab` | Secondary badges |

---

## 2. Typography

NeuraFlow AI uses a custom font pairing to establish a technical, high-yield learning aesthetic:

- **Heading Font (`JetBrains Mono`)**: Used for H1-H6 headings, page titles, active syllabus node headers, and key dashboard metrics. This monospace typeface projects precision.
- **Body Font (`Inter`)**: Used for all reading materials (beginner, detailed, and revision notes), form labels, buttons, navigation links, and standard paragraph text for high legibility.

### Stylesheet Import Configuration:
```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@300;400;500;600;700;800&display=swap');

:root {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

h1, h2, h3, h4, h5, h6, .font-heading {
  font-family: 'JetBrains Mono', monospace !important;
}
```

---

## 3. UI Component Specifications

### 1. Cards (`.glass-panel`)
Cards use a solid white surface with a subtle shadow instead of neon gradients:
```css
.glass-panel {
  background-color: #ffffff;
  border: 1px solid #e5e3df;
  box-shadow: rgba(15, 15, 15, 0.05) 0px 4px 12px 0px;
  border-radius: 12px;
}
```

### 2. Form Inputs (`.glass-input`)
Inputs are styled as clean, structured boxes with high-contrast text and a purple focus ring:
```css
.glass-input {
  background-color: #ffffff;
  border: 1px solid #c8c4be;
  border-radius: 8px;
  color: #1a1a1a;
  transition: all 0.15s ease;
}

.glass-input:focus {
  outline: none;
  border-color: #1B1BFF;
  box-shadow: 0 0 0 3px rgba(27, 27, 255, 0.15);
}
```

---

## 4. Responsiveness Guidelines

NeuraFlow AI employs mobile-first grid and layout configurations:

1. **Dashboard Sidebar**: Hidden on small viewports (`hidden`) and enabled starting from the medium breakpoint (`md:flex md:w-64`).
2. **Mobile Nav Header**: Renders horizontal inline links (`Dashboard`, `Profile`, `Logout`) within the header on mobile screens.
3. **Study Workspaces**: Columns collapse from a 3-column side-by-side view on desktop to a single stacked column list on mobile viewports (`grid-cols-1 lg:grid-cols-3`).

---

## 5. Print Layout Overrides

To allow students to download and print textbooks cleanly or export them as PDFs from the browser, specific print style declarations are configured:

```css
@media print {
  /* Hide navigation landmarks */
  .no-print, header, aside, nav, button {
    display: none !important;
  }
  
  /* Reset document flow to full page width */
  body, main, .max-w-7xl, .lg\:col-span-2 {
    background: white !important;
    color: black !important;
    width: 100% !important;
    max-width: 100% !important;
    margin: 0 !important;
    padding: 0 !important;
    box-shadow: none !important;
    border: none !important;
  }
}
```
