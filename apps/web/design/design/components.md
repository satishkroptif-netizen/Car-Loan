# Step-in-CRM — Component Specifications

**Source**: `replica/recon.md` component list + Groweon marketing screenshots  
**Design tokens**: `replica/design/tokens.json`  
**Icon set**: Lucide (MIT)  
**Accessibility**: WCAG AA minimum (4.5:1 body, 3:1 large/UI), focus-visible rings, ARIA labels, keyboard navigation

---

## Primitive Components (build first, in isolation)

### Button
- **Variants**: `primary`, `secondary`, `ghost`, `danger`, `outline`, `link`
- **Sizes**: `sm` (32px h), `md` (40px h), `lg` (48px h), `icon` (40×40)
- **States**: `default`, `hover`, `active`, `focus-visible` (2px ring, accent), `disabled`, `loading` (spinner, keeps label for SR)
- **Tokens**: `bg: accent / surface / transparent`, `text: on-accent / text / accent`, `radius: md`, `font: sm/600`, `gap: 2 (icon+text)`
- **A11y**: Real `<button>`, `aria-disabled`, `aria-busy` when loading, visible focus ring
- **Used on**: S01, S02, S32, S33-S60, all modals, forms, toolbars

### Input
- **Types**: `text`, `email`, `phone`, `search`, `textarea`, `select`, `multiselect`, `date`, `number`
- **Sizes**: `sm` (36px), `md` (40px), `lg` (44px)
- **States**: `default`, `hover`, `focus` (border-focus + ring), `error` (border-danger + icon), `disabled`, `readonly`, `loading`
- **Tokens**: `bg: surface`, `border: border-input`, `text: text`, `placeholder: text-muted`, `radius: md`, `font: base/400`
- **A11y**: Associated `<label>`, `aria-describedby` for error/help, `aria-invalid`, `aria-required`
- **Used on**: All forms (S32, S35, S40, S42, S48, S50-S54, S56-S60)

### Table
- **Variants**: `data` (dense), `comfort` (spacious), `virtualized` (10k+ rows)
- **Features**: Sortable columns, row selection, inline edit, row actions menu, expandable rows, sticky header/first-col
- **States**: `loading` (skeleton), `empty` (illustration + CTA), `error`, `filtered`, `sorted`, `paginated`
- **Tokens**: `header: bg surface-elevated text text-muted`, `row: hover surface-elevated`, `border: border`, `font: sm/400`
- **A11y**: `<table>` semantics, `scope="col"`, `aria-sort`, keyboard nav (arrows), row selection announced
- **Used on**: S34 (Leads), S37 (Deals), S38 (Contacts), S40 (Orders), S41 (Inventory), S42 (Tickets), S43 (POs), S48 (Campaigns)

### Card
- **Variants**: `kpi` (metric), `lead` (list item), `deal` (pipeline), `contact`, `ticket`, `product`, `activity`
- **States**: `default`, `hover` (elevated shadow), `selected` (accent border-left), `loading` (skeleton), `empty`
- **Tokens**: `bg: surface`, `border: border`, `radius: lg`, `shadow: sm`, `padding: 4-6`
- **A11y**: Clickable cards wrap in `<button>` or `<a>`, focus ring on interactive cards
- **Used on**: S33 (Dashboard KPIs), S34 (Lead cards alt view), S35, S36 (Deal cards), S45 (AI conversation cards)

### Modal / Sheet / Dialog
- **Variants**: `center` (modal), `side` (sheet - right, 480px/640px), `full` (full-screen), `confirm` (destructive), `form` (multi-step)
- **Sizes**: `sm` (400px), `md` (560px), `lg` (720px), `xl` (960px), `full`
- **States**: `open` (animate in), `closing` (animate out), `loading` (submit), `error` (inline)
- **Tokens**: `bg: surface`, `overlay: overlay`, `radius: xl`, `shadow: 2xl`, `focus-trap: true`
- **A11y**: `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, focus trap, `Esc` closes, restore focus on close
- **Used on**: S35 (Lead detail), S40 (Order create), S42 (Ticket create), S48 (Campaign builder), S50-S54 (Settings)

### Dropdown / Select / Combobox
- **Variants**: `select` (single), `multiselect` (chips), `combobox` (search + create), `async` (server search)
- **States**: `closed`, `open`, `loading`, `empty`, `error`, `disabled`
- **Tokens**: `trigger: input styles`, `panel: surface, border, radius md, shadow lg, max-h 64`, `option: hover surface-elevated, selected accent-light`
- **A11y**: `role="combobox"`, `aria-expanded`, `aria-activedescendant`, keyboard (arrows, Enter, Esc, Type-to-filter)
- **Used on**: S34 (filters), S35 (assign, stage), S36 (stage), S48 (agent select), S50-S54 (settings)

### Tabs
- **Variants**: `horizontal` (default), `vertical` (sidebar), `pill` (segmented)
- **States**: `active`, `hover`, `disabled`, `focus-visible`
- **Tokens**: `active: border-b-2 accent text accent`, `inactive: text-muted`, `indicator: accent`, `font: sm/600`
- **A11y**: `role="tablist"`, `role="tab"`, `aria-selected`, `aria-controls`, keyboard (arrows, Home/End)
- **Used on**: S35 (Lead detail tabs), S45 (Command center tabs), S47 (Chat tabs), S49 (AI+ tabs), S50-S54 (Settings tabs)

### Badge / Pill / Tag
- **Variants**: `status` (hot/warm/cold, stage), `priority` (low/med/high/critical), `count` (notification), `category` (source, type)
- **Sizes**: `sm` (20px h), `md` (24px h)
- **Tokens**: `bg: semantic-light (danger-light, success-light, etc.)`, `text: semantic-text`, `radius: full`, `font: xs/600`
- **A11y**: Not interactive; if clickable, use Button variant=ghost size=sm
- **Used on**: S34 (lead score, status), S35 (qualification), S36 (deal stage), S45 (agent status), S46 (call status), S47 (chat status), S48 (campaign status)

### Avatar
- **Variants**: `user` (photo/initials), `lead` (company logo/initials), `company`, `ai-agent` (bot icon)
- **Sizes**: `xs` (24px), `sm` (32px), `md` (40px), `lg` (56px), `xl` (80px)
- **States**: `default`, `online` (green ring), `busy` (orange ring), `offline` (grey ring), `loading`
- **Tokens**: `bg: accent-light (fallback)`, `text: accent-text`, `radius: full`, `ring: 2px surface`
- **A11y**: `alt=""` for decorative, `role="img"` with label for meaningful
- **Used on**: S33 (user menu), S35 (assigned rep), S39 (activity owner), S45 (AI agent), S46 (caller), S47 (chat participant), S57 (mobile lead)

### Toast / Alert / Notification
- **Variants**: `success`, `error`, `warning`, `info`, `ai-action` (special: "AI qualified lead", "Call started")
- **Positions**: `top-right` (default), `bottom-right`, `top-center`
- **States**: `entering`, `visible`, `dismissing`, `persistent` (no auto-dismiss)
- **Tokens**: `bg: semantic-light`, `border: semantic`, `text: semantic-text`, `icon: semantic`, `radius: lg`, `shadow: lg`
- **A11y**: `role="alert"` (error), `role="status"` (others), `aria-live="polite"`, keyboard dismiss (Esc), screen reader reads on mount
- **Used on**: All app screens (form submit, AI actions, sync, errors)

### Sidebar Navigation
- **Variants**: `expanded` (280px), `collapsed` (72px, icons only), `mobile-drawer` (overlay)
- **Sections**: `primary` (Dashboard, Leads, Deals, Orders, Inventory, Tickets, Procurement), `ai` (Command Center, Campaigns, AI+), `admin` (Settings, Users, Integrations, Reports)
- **States**: `active` (accent bg + border-left), `hover` (surface-elevated), `disabled` (text-muted), `badge` (notification count)
- **Tokens**: `bg: surface`, `border-r: border`, `item: px-3 py-2`, `icon: md`, `gap: 3`, `font: sm/500`
- **A11y**: `<nav aria-label="Main navigation">`, `aria-current="page"`, keyboard (arrows), mobile: `Esc` closes, backdrop click closes
- **Used on**: S33-S44, S45-S49, S50-S54

### Chart
- **Variants**: `line` (trends), `bar` (comparison), `funnel` (pipeline), `pipeline` (horizontal bar per stage), `gauge` (KPI), `area` (cumulative)
- **Library**: Recharts (web) / react-native-svg-charts (mobile) — themed via tokens
- **States**: `loading` (skeleton), `empty` (illustration), `error`, `interactive` (tooltip, legend click)
- **Tokens**: `colors: accent, success, warning, info, danger`, `grid: border`, `text: text-muted`, `tooltip: surface, shadow-lg, border`
- **A11y**: `role="img"`, `aria-label` with summary, data table fallback, keyboard navigable data points
- **Used on**: S33 (Dashboard), S44 (Reports), S45 (Command center metrics), S48 (Campaign analytics)

### Kanban Column / Board
- **Column**: `header` (stage name, count, WIP limit badge), `drop-zone` (min-h 200), `add-card` (inline form)
- **Card**: `deal` variant (name, value, company, assignee avatar, age badge, priority dot)
- **States**: `dragging` (opacity-50, rotate-2), `drag-over` (accent border), `empty` (placeholder), `loading`
- **Tokens**: `column: bg surface-elevated/50, radius lg, border`, `card: surface, shadow-sm, radius md`, `drag-over: border-2 accent`
- **A11y**: `role="list"`, `aria-label="Pipeline stage: Qualify"`, keyboard: `Space` pick, `Arrows` move, `Enter` drop, `Esc` cancel; screen reader announces position
- **Used on**: S36 (Pipeline), S58 (Mobile pipeline)

### Chat Bubble
- **Variants**: `user` (right, accent bg), `bot` (left, surface bg), `system` (center, muted), `handoff` (accent border, icon)
- **States**: `sending` (spinner), `sent` (check), `delivered` (double-check), `read` (blue double-check), `failed` (error icon, retry)
- **Tokens**: `user: bg accent, text on-accent, radius 2xl (tl/tr/br 2xl, bl md)`, `bot: bg surface, text text, radius 2xl (tl/tr/bl 2xl, br md)`, `max-w: 75%`
- **A11y**: `role="log"`, `aria-live="polite"`, timestamps in `time` element, sender name announced
- **Used on**: S47 (WhatsApp monitor), S57 (Mobile lead chat)

### Call Widget
- **Variants**: `incoming` (full-screen mobile, banner desktop), `active` (minimized bar + expanded), `ended` (summary), `voicemail` (playback)
- **States**: `ringing` (pulse animation), `connecting`, `connected` (timer), `recording` (red dot), `held`, `ended`
- **Tokens**: `incoming: bg accent, text on-accent`, `active: bg surface, border, shadow-lg`, `timer: mono, lg`, `controls: icon-lg, gap-3`
- **A11y**: `role="region"`, `aria-label="Active call with John Doe"`, live region for timer, keyboard shortcuts (M mute, H hold, E end)
- **Used on**: S35 (Lead detail call), S45 (Command center), S46 (Call monitor), S57 (Mobile lead)

### Form Section / Stepper / Wizard
- **Variants**: `collapsible` (accordion), `stepper` (horizontal progress), `wizard` (modal full-screen)
- **States**: `complete` (check), `current` (accent), `incomplete` (muted), `error` (danger), `disabled`
- **Tokens**: `step: counter (accent bg), label (text), connector (border)`, `section: py-4, border-t border`
- **A11y**: `aria-current="step"`, `aria-describedby` for errors, keyboard: `Enter` next, `Backspace` previous (if valid)
- **Used on**: S48 (Campaign builder: List → Script → Launch → Monitor), S50-S54 (Settings), S02 (Pricing signup)

### AI Insight Panel
- **Variants**: `summary` (lead), `score` (qualification), `next-action` (rep), `objections` (list), `transcript` (call/chat)
- **States**: `loading` (skeleton lines), `loaded`, `refreshing`, `empty` (no AI data), `error`
- **Tokens**: `bg: accent-light/50`, `border-l: accent`, `icon: info`, `score: 2xl bold (hot=danger, warm=warning, cold=success)`, `actions: button ghost sm`
- **A11y**: `role="region"`, `aria-label="AI Insights"`, live region for score changes, expandable transcript
- **Used on**: S35 (Lead detail), S45 (Command center), S46 (Call monitor), S47 (Chat monitor), S49 (AI+ workspace)

### Campaign Builder (Stepper)
- **Steps**: `1. List` (CSV upload / CRM segment builder), `2. Script` (AI agent config, knowledge base, thresholds), `3. Launch` (review, schedule, compliance check), `4. Monitor` (live dashboard)
- **States per step**: `pending`, `active`, `complete`, `error`
- **Tokens**: Uses Form Section + Table + AI Insight Panel + Chart
- **A11y**: Stepper pattern, each step validates before next, `Esc` cancels draft
- **Used on**: S48 (Bulk campaigns)

### Field Tracker Map
- **Variants**: `check-in` (single pin), `route` (polyline), `geofence` (circle)
- **States**: `tracking` (live location pulse), `idle`, `offline` (cached), `permission-denied`
- **Tokens**: `pin: accent`, `route: accent`, `geofence: accent/20`, `accuracy: danger/20`
- **A11y**: Text fallback for location, `role="img"`, `aria-label="Map showing visit at 123 Main St"`
- **Used on**: S59 (Mobile field visit)

---

## Composite Screens (assembled from primitives)

### S33 — Dashboard
```
Layout: Grid 12-col, gap-6
Row 1: KPI Cards (4) — Leads This Month, Pipeline Value, Win Rate, AI Qualified
Row 2: Pipeline Funnel (chart, 8-col) + Activity Feed (4-col)
Row 3: My Tasks (6-col) + AI Insights / Hot Leads (6-col)
Components: Card (kpi), Chart (funnel), Table (comfort), Badge, Avatar, Button
```

### S34 — Leads List
```
Layout: Toolbar (search, filters, export, +Create) + Table (data variant)
Table cols: Score (badge), Name/Company, Phone/Email, Source, Status, Assignee, Created, Actions
Row click → S35; Row hover → quick actions (call, WhatsApp, email, qualify)
Components: Table, Input (search), Dropdown (filters), Badge, Avatar, Button (icon), Modal
```

### S35 — Lead Detail
```
Layout: 2-col (8/4) or tabs on mobile
Left: Timeline (Activity feed — communications, AI conversations, notes, tasks)
Right: AI Insight Panel (score, summary, next action, objections) + Quick Actions (Call, WhatsApp, Email, Qualify, Create Deal)
Tabs: Overview | Communications | AI Conversations | Deals | Activities
Components: Card (lead), Avatar, Badge, AI Insight Panel, Chat Bubble, Call Widget, Button, Modal, Tabs
```

### S36 — Pipeline (Kanban)
```
Layout: Horizontal scroll, columns = deal stages (Qualify → Propose → Negotiate → Won/Lost)
Each column: Header (stage, count, Σvalue, WIP limit), Drop zone (Deal cards), +Add card
Deal card: Name, Value, Company, Assignee avatar, Age badge, Priority dot
Drag-drop between columns → PATCH /api/deals/:id/advance
Components: Kanban Board, Card (deal), Badge, Avatar, Modal (deal create/edit), Toast
```

### S45 — AION Command Center
```
Layout: 3-panel (Live Feed | Active Conversations | Metrics)
Live Feed: Real-time cards (Lead name, Source, AI Agent, Status, Time) — WebSocket
Active Conversations: Tabs (Voice | WhatsApp) → List (Contact, Agent, Duration, Score, Disposition) → Click → Transcript modal
Metrics: KPIs (Response time, Qualification rate, Handoff rate, Cost/lead) + Charts (line, bar)
Components: Card, Table, Badge, Avatar, AI Insight Panel, Chart, Chat Bubble, Call Widget, Toast, WebSocket status indicator
```

### S48 — Bulk Campaign Builder
```
Layout: Stepper (List → Script → Launch → Monitor)
Step 1: List — CSV drag-drop / CRM segment builder (Table with filters) → Preview count
Step 2: Script — Agent select (Dropdown), Knowledge base (multiselect), Thresholds (Input number), Schedule (datetime)
Step 3: Launch — Summary, TRAI compliance checkbox, Confirm button
Step 4: Monitor — Live dashboard (Chart: dials/answered/qualified/hot), Table (campaign_contacts), Pause/Resume
Components: Stepper, Table, Input, Dropdown, Badge, Button, Chart, Modal, Toast
```

### S55-S60 — Mobile App Screens
```
S55 Dashboard: Bottom nav (5 tabs), KPI cards (scroll), Quick actions (FAB), Hot leads list (5)
S56 Leads: Search bar, Filter chips, Lead cards (swipe actions: call, WhatsApp, qualify)
S57 Lead Detail: Header (name, score badge), Tabs (Overview, Chat, Calls, Tasks), FAB (Call/WhatsApp)
S58 Pipeline: Horizontal swipe columns, Deal cards (tap → detail, long press → drag)
S59 Field Visit: Map (check-in button), Form (notes, photos, outcome), GPS accuracy indicator
S60 Settings: Profile, Notifications, Sync status, Offline storage, Call log toggle, Logout
Components: All primitives responsive, BottomNavigation, FAB, SwipeableList, MapView, Camera, SQLite sync indicator
```

---

## Screen Specs Index (from recon)

| Screen | Primary Components | Key States |
|--------|-------------------|------------|
| S01 Landing | Button, Card, Badge | Marketing |
| S02 Pricing | Card, Button, Badge, Toggle | Monthly/Annual |
| S32 Login | Input, Button, Alert | Error, Loading, MFA |
| S33 Dashboard | KPI Card, Chart, Table, AI Insight | Empty, Loading, Loaded |
| S34 Leads List | Table, Input, Dropdown, Badge | Empty, Loading, Filtered |
| S35 Lead Detail | Card, Timeline, AI Insight, Chat, Call | Loading, Editing, Calling |
| S36 Pipeline | Kanban, Card, Badge, Avatar | Dragging, Empty column |
| S37 Deals | Table, Dropdown, Modal | Filtered, Inline edit |
| S38 Contacts | Table, Modal, Avatar | Empty, Importing |
| S39 Activities | Table, Calendar, Modal | Overdue, Completed |
| S40 Orders | Table, Modal, Badge | Status workflow |
| S41 Inventory | Table, Badge, Modal | Low stock, Expiry |
| S42 Tickets | Table, Modal, Badge | SLA breach, Escalated |
| S43 Purchase | Table, Modal, Dropdown | Pending approval |
| S44 Reports | Chart, Table, Dropdown, Modal | Building, Exporting |
| S45 Command Center | Table, Chart, AI Insight, Chat, Call | Live, Paused |
| S46 Call Monitor | Call Widget, Table, AI Insight | Live, Recording |
| S47 Chat Monitor | Chat Bubble, AI Insight, Table | Bot, Human, Handoff |
| S48 Campaign Builder | Stepper, Table, Chart, Modal | Draft, Running, Paused |
| S49 AI+ Workspace | Input, Button, AI Insight, Card | Generating, Applied |
| S50-S54 Settings | Tabs, Form, Table, Modal | Saving, Error |
| S55-S60 Mobile | All primitives responsive | Offline, Syncing |

---

## Contrast Report (WCAG AA)

Run: `python3 contrast.py replica/design/tokens.json`

Expected: **0 failures** — all pairs in tokens.json pass AA (4.5:1 body, 3:1 large/UI).

Key verified pairs:
- text/bg: 15.3:1 ✓
- text/surface: 15.3:1 ✓
- text-muted/bg: 6.2:1 ✓
- accent-text/accent-light: 7.8:1 ✓
- on-accent/accent: 8.6:1 ✓
- danger/danger-light: 5.1:1 ✓
- success/success-light: 6.8:1 ✓
- warning/warning-light: 4.7:1 ✓
- info/info-light: 5.9:1 ✓

---

## Build Order (Design System First)

1. **Tokens + CSS + Tailwind config** ✓ (this step)
2. **Primitive components** (Button, Input, Table, Card, Modal, Dropdown, Tabs, Badge, Avatar, Toast, Sidebar) — build in `/design` route or Storybook
3. **Composite components** (Chart, Kanban, Chat Bubble, Call Widget, Form Section, AI Insight Panel, Campaign Builder, Field Tracker Map)
4. **Screen assembly** (per build order in architecture.md: M1 → M9)
5. **Screenshot + contrast verify** each screen

---

## Next Step

`/replica-build` — Implement the vertical slice (M0 + M1): auth, org, leads, pipeline, deals, orders with the design system.