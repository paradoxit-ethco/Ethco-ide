# Airline Booking CMS — Design Direction

## Three stylistic approaches

### Theme Name: Runway Ledger
Very Brief Intro: A calm operations console inspired by airport wayfinding and premium travel documents: warm paper surfaces, deep ink, and a decisive runway-orange accent. The experience feels trustworthy, precise, and ready for daily use.
Probability: 0.06

### Theme Name: Atlas Signal
Very Brief Intro: A high-contrast navigation system built around midnight blue, aviation chart lines, and electric cyan. It feels technical and global, with a stronger control-room energy.
Probability: 0.03

### Theme Name: Cloudline Editorial
Very Brief Intro: An airy editorial dashboard with soft sky blues, oversized typography, and generous whitespace. It feels approachable and client-friendly, prioritizing clarity over density.
Probability: 0.08

## Selected direction: Runway Ledger

### Design Movement
Contemporary Swiss editorial systems blended with airport wayfinding and premium travel ephemera.

### Core Principles
1. **Operational clarity:** every screen makes the next action obvious, using strong hierarchy and compact status language.
2. **Wayfinding over decoration:** route lines, gate markers, and boarding-pass geometry guide the eye without becoming ornamental noise.
3. **Warm precision:** off-white paper-like surfaces and ink-black typography soften a data-heavy product while preserving credibility.
4. **Role-aware density:** super admin, technical team, and client views share the same visual language but reveal different levels of detail.

### Color Philosophy
Use a warm mineral background instead of sterile white, deep ink for high-confidence reading, slate for secondary information, and a signature runway orange for actions, active states, and important moments. Dark mode preserves the same orange as a navigation beacon against ink-black panels rather than swapping to generic neon colors.

### Layout Paradigm
A persistent left rail behaves like an airport terminal map, while the main workspace uses asymmetrical editorial bands: a wide operational summary, a narrow “next movement” column, and a lower manifest table. Mobile collapses the rail into a compact header and turns table-heavy areas into stacked cards.

### Signature Elements
- A thin route-line motif with circular waypoints in charts and booking timelines.
- Boarding-pass style summary cards with perforated or dashed separators.
- Small uppercase wayfinding labels such as “CONTROL TOWER”, “NEXT MOVEMENT”, and “LOAD FACTOR”.

### Interaction Philosophy
Interactions should feel like confirming a flight movement: deliberate, immediate, and legible. Active navigation uses a route-line marker, buttons compress subtly on press, filters update in place, and unsupported actions explain themselves through a concise toast instead of dead ends.

### Animation
Use short ease-out transitions for hover, focus, and active states. Dashboard sections reveal with a 40–60ms stagger. Route-line markers draw in with opacity and translate only, never layout properties. Drawers and dialogs enter from their source edge at 220ms. Respect reduced-motion preferences and avoid animation on high-frequency table updates.

### Typography System
Use **Space Grotesk** for interface headlines, KPI numerals, and compact labels; use **DM Sans** for body copy and table content. Amharic text should remain readable with the same hierarchy and generous line-height. Headlines use tight tracking and sentence case; labels use uppercase with 0.12em tracking; body copy stays at 14–16px.

### Brand Essence
A configurable airline operations workspace for teams who need to manage bookings, routes, and service health in one calm control surface. Personality: **precise, grounded, ready**.

### Brand Voice
Headlines are direct and operational. CTAs describe the action and its outcome. Microcopy is concise, calm, and never vague.

Example lines:
- “Keep every movement visible.”
- “Review the manifest before the gate changes.”

### Wordmark & Logo
A bold, text-free symbol combining a vertical runway strip with a split route waypoint: a compact orange mark that reads as both an airport runway and a system status beacon. The header pairs the symbol with the custom wordmark “Runway Ledger” in Space Grotesk SemiBold.

### Signature Brand Color
**Runway Orange — #F26A3D**, a warm signal color that is more distinctive than airline blue and remains legible in both themes.
