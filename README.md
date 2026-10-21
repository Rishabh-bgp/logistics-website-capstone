<p align="center">
  <img src="screenshots/banner.jpg" alt="Logistics Website Capstone: Kargonaut Logistics hero with an animated dotted globe, a glass tracking card, a clay price card and a neumorphic dark-mode switch" width="100%">
</p>

<h1 align="center">Logistics Website Capstone</h1>

<p align="center">
  <b>Kargonaut Logistics</b>: a premium freight website where <b>claymorphism</b>, <b>glassmorphism</b> and <b>neumorphism</b> work together.<br>
  Live shipment tracking, instant ₹ quotes, multi-step pickup booking and a hand-drawn analytics dashboard,<br>
  built from scratch in plain HTML, CSS and JavaScript. No frameworks, no libraries, no build step.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white" alt="HTML5">
  <img src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white" alt="CSS3">
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript">
  <img src="https://img.shields.io/badge/Dependencies-0-8b5cf6?style=for-the-badge" alt="Zero dependencies">
  <img src="https://img.shields.io/badge/Accessibility-100-0b7a4b?style=for-the-badge&logo=lighthouse&logoColor=white" alt="Lighthouse accessibility 100">
  <img src="https://img.shields.io/badge/Tests-242%20passing-22d3ee?style=for-the-badge" alt="242 automated checks passing">
  <img src="https://img.shields.io/badge/License-MIT-ff7a3d?style=for-the-badge" alt="MIT License">
</p>

<p align="center">
  <a href="https://rishabh-bgp.github.io/logistics-website-capstone/"><b>🚀 Live demo</b></a> ·
  <a href="https://rishabh-bgp.github.io/logistics-website-capstone/dashboard.html">Dashboard</a> ·
  <a href="https://rishabh-bgp.github.io/logistics-website-capstone/design-system.html">Design system</a>
</p>

---

## The pitch

Logistics sites are usually either dull or slow. For this capstone I wanted one that feels like a product: you can **track a parcel across an animated map**, **price a shipment down to the rupee**, **book a pickup** and **watch your numbers in a dashboard**, and every surface has a reason to look the way it does.

Everything runs in the browser with fake local data, so it works offline, straight from the file system or on GitHub Pages. Kargonaut is a fictional company.

> **Try these tracking IDs:** `KGN-48213-IN` (delivered) · `KGN-77520-AE` (in customs) · `KGN-30911-SG` (at sea) · `KGN-10458-IN` (out for delivery) · `KGN-66092-NL` (delayed)

## Features

| Feature | What it does | How it's built |
|---|---|---|
| 🌍 **Animated hero globe** | Parcels fly between Mumbai, Dubai, Singapore, Shanghai, Rotterdam and Nairobi over a dotted Earth | Orthographic projection of hand-traced continent outlines, rendered to SVG dots by depth. Packages ride the arcs with `<animateMotion>` |
| 📦 **Shipment tracking** | Animated 5-step timeline (picked up → in transit → customs → out for delivery → delivered), status badge, ETA and a route map with a moving vehicle | Route drawn as an SVG curve with `pathLength` progress, and the map auto-zooms to the lane using one of three dot-map resolutions |
| 🧮 **Instant quote** | Origin/destination from 24 cities, weight, box size, road/air/sea and economy/express/same-day, with a live ₹ breakdown and delivery date | Haversine distance × mode factor, volumetric weight (÷5000 / ÷6000 / ÷1000), base + freight + service + 12% fuel + 18% GST. Rejects impossible lanes |
| 📝 **Book a pickup** | 4-step form with inline validation (Indian mobile, PIN, no Sunday pickups) and a review step, then a confirmation with a booking ID | Saved to `localStorage`. The quote can pre-fill the form in one click |
| 🗂️ **My shipments** | Lists your saved bookings with Track and two-step Remove, and survives reloads | Booked IDs also work in the tracker ("Pickup scheduled") |
| 🛠️ **Services** | 8 clay cards filtered by Road / Air / Sea / Warehousing | `aria-pressed` chips, pop-in animation, live result count for screen readers |
| 🛰️ **Network** | Animated counters and a coverage map with clickable hubs in India and Global views | Hub buttons are real `<button>`s placed over the SVG. Selecting one draws its direct lanes and fills a details panel |
| 📊 **Customer dashboard** | KPIs with sparklines, an on-time gauge, a weekly line chart (8/12/26 weeks), a mode donut, spend bars and a shipments table | Charts hand-drawn with `<canvas>` and SVG (no chart library). The table has sort, search, status filter, pagination and CSV export |
| 💬 **Testimonials carousel** | Prev/next, dots, swipe, arrow keys and a pause button | Auto-play stops on hover or focus and never runs with reduced motion |
| 💳 **Pricing** | Three plans with a monthly/yearly switch (2 months free) | Neumorphic `role="switch"` |
| 👩‍💼 **Careers** | Perks and open roles. "Apply" pre-fills the contact form | |
| ❓ **FAQ** | Accessible accordion | `aria-expanded`, `inert` closed panels, CSS grid-rows animation |
| ✉️ **Contact & newsletter** | Inline errors linked with `aria-describedby`, success states, toasts | |
| 🌗 **Dark / light theme** | Saved in `localStorage`, follows the system on first visit, no flash | A tiny pre-paint script sets `data-theme` before CSS loads |
| ♿ **Accessibility** | Skip link, labels, landmarks, keyboard support, visible focus rings and AA contrast in both themes | Checked with axe-core and Lighthouse |
| 🎞️ **Motion** | Scroll reveals, micro-interactions, an animated mesh background | Fully respects `prefers-reduced-motion`, including pausing SVG animations |

## Design language

Three surface styles, each with a job, so they never fight:

<table>
  <tr>
    <td width="33%" valign="top"><img src="screenshots/ds-clay.jpg" alt="Claymorphism demo card and buttons"><h3>🧱 Claymorphism</h3>Puffy, tactile <b>objects</b> you press: service cards, stat tiles, plans and primary buttons. A soft gradient plus one big outer shadow and two inner shadows (dark bottom-right, light top-left) gives the inflated look.</td>
    <td width="33%" valign="top"><img src="screenshots/ds-glass.jpg" alt="Glassmorphism demo panel over a vivid gradient"><h3>🪟 Glassmorphism</h3>Frosted, translucent <b>panels</b> that float over the animated mesh: the nav bar, tracking and quote panels, toasts. Built with <code>backdrop-filter: blur() saturate()</code>, a hairline light border and an inner top highlight.</td>
    <td width="33%" valign="top"><img src="screenshots/ds-neu.jpg" alt="Neumorphism demo switch, input and segmented control"><h3>🫧 Neumorphism</h3>Soft, extruded or pressed-in <b>controls</b> you adjust: inputs, switches, segments, steppers and dials. A paired light and dark shadow is used outside for raised controls and inset for pressed ones.</td>
  </tr>
</table>

Every colour and shadow is a CSS custom property, so dark and light themes are just two sets of tokens. The [Design system page](https://rishabh-bgp.github.io/logistics-website-capstone/design-system.html) shows the three styles side by side, a combined widget with a neumorphic dial, live colour tokens and the type scale.

<p align="center"><img src="screenshots/design-system-dark.jpg" alt="Design system page in dark mode showing clay, glass and neumorphism columns" width="100%"></p>

## Screenshots

<table>
  <tr>
    <td width="50%"><img src="screenshots/hero-dark.jpg" alt="Home page hero in dark mode with the animated globe"><p align="center"><sub>Hero, dark mode</sub></p></td>
    <td width="50%"><img src="screenshots/hero-light.jpg" alt="Home page hero in light mode"><p align="center"><sub>Hero, light mode</sub></p></td>
  </tr>
  <tr>
    <td width="50%"><img src="screenshots/tracking-dark.jpg" alt="Tracking result for KGN-77520-AE: Dubai to Bengaluru by air, in customs, with timeline and route map"><p align="center"><sub>Tracking: animated timeline and route map</sub></p></td>
    <td width="50%"><img src="screenshots/tracking-light.jpg" alt="Tracking result for KGN-10458-IN: Bhagalpur to Kolkata, out for delivery"><p align="center"><sub>Domestic lane with the zoomed India map</sub></p></td>
  </tr>
  <tr>
    <td width="50%"><img src="screenshots/quote-light.jpg" alt="Instant quote calculator, Mumbai to Dubai by air with price breakdown"><p align="center"><sub>Instant quote with live ₹ breakdown</sub></p></td>
    <td width="50%"><img src="screenshots/quote-dark.jpg" alt="Instant quote calculator in dark mode"><p align="center"><sub>Quote, dark mode</sub></p></td>
  </tr>
  <tr>
    <td width="50%"><img src="screenshots/booking-step3-light.jpg" alt="Book a pickup, step 3: package details with mode tiles and service level"><p align="center"><sub>Multi-step booking</sub></p></td>
    <td width="50%"><img src="screenshots/booking-confirmed-light.jpg" alt="Booking confirmation with booking ID and My shipments list"><p align="center"><sub>Confirmation, booking ID and My shipments</sub></p></td>
  </tr>
  <tr>
    <td width="50%"><img src="screenshots/dashboard-dark.jpg" alt="Customer dashboard with KPIs, gauge, line chart, donut and bar chart"><p align="center"><sub>Customer dashboard</sub></p></td>
    <td width="50%"><img src="screenshots/dashboard-light.jpg" alt="Dashboard shipments table sorted by cost, light mode"><p align="center"><sub>Sortable, searchable, paginated table</sub></p></td>
  </tr>
  <tr>
    <td width="50%"><img src="screenshots/services-dark.jpg" alt="Services section with clay cards and mode filters"><p align="center"><sub>Services with mode filters</sub></p></td>
    <td width="50%"><img src="screenshots/network-dark.jpg" alt="Network section with animated counters and the India coverage map"><p align="center"><sub>Network stats and coverage map</sub></p></td>
  </tr>
  <tr>
    <td width="50%"><img src="screenshots/stories-pricing-light.jpg" alt="Pricing plans with the yearly billing switch on"><p align="center"><sub>Pricing with monthly / yearly switch</sub></p></td>
    <td width="50%"><img src="screenshots/faq-contact-dark.jpg" alt="FAQ accordion with one answer open"><p align="center"><sub>FAQ accordion</sub></p></td>
  </tr>
</table>

### Mobile

<p align="center">
  <img src="screenshots/mobile-hero.jpg" alt="Mobile hero" width="23%">
  &nbsp;
  <img src="screenshots/mobile-menu.jpg" alt="Mobile hamburger menu open" width="23%">
  &nbsp;
  <img src="screenshots/mobile-tracking.jpg" alt="Mobile tracking result" width="23%">
  &nbsp;
  <img src="screenshots/mobile-dashboard.jpg" alt="Mobile dashboard" width="23%">
</p>

## Lighthouse

Measured with Lighthouse 12.8 (headless Chrome, default simulated throttling) against the live GitHub Pages site.

| Page | Desktop (Perf / A11y / BP / SEO) | Desktop LCP | Mobile (Perf / A11y / BP / SEO) | Mobile LCP |
|---|---|---|---|---|
| Home `index.html` | **100 / 100 / 100 / 100** | 0.4 s | **100 / 100 / 100 / 100** | 1.3 s |
| Dashboard `dashboard.html` | **100 / 100 / 100 / 100** | 0.4 s | **100 / 100 / 100 / 100** | 1.1 s |
| Design system `design-system.html` | **100 / 100 / 100 / 100** | 0.3 s | **100 / 100 / 100 / 100** | 1.0 s |

Cumulative layout shift is 0 and total blocking time is 0 ms on every page.

## Quality checks

- **242 automated browser checks** (Playwright + headless Chrome), all passing. They cover:
  - every page at 1366 px and 390 px, in dark and light, with no console errors, no failed requests and no horizontal overflow
  - axe-core WCAG 2.1 A/AA audits in both themes
  - tracking for all 5 sample IDs, plus invalid and empty IDs
  - quote maths against independently hand-calculated cases
  - the full booking flow and its persistence
  - dashboard sort, search, filter, pagination and CSV export
  - theme persistence across reloads and pages
  - hamburger menu, carousel, accordion, pricing toggle, hub map, contact and newsletter forms
  - reduced-motion behaviour
- **html-validate** (recommended rules) passes on every page.
- **Every local link, anchor and asset resolves**, and the site makes zero external requests.

## How to run

No installation needed.

**Option 1:** open `index.html` directly in your browser (works from `file://`).

**Option 2:** run a local server:

```bash
git clone https://github.com/Rishabh-bgp/logistics-website-capstone.git
cd logistics-website-capstone
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Folder structure

```
logistics-website-capstone/
├── index.html              # home: hero, services, tracking, quote, booking, network, stories, pricing, careers, FAQ, contact
├── dashboard.html          # customer dashboard demo
├── design-system.html      # clay vs glass vs neumorphism, tokens, type scale
├── assets/
│   ├── css/styles.css      # design tokens, the three surface styles, layout, themes, motion
│   ├── js/theme-init.js    # applies the saved theme before first paint
│   ├── js/maps.js          # hand-traced dot-matrix world maps (injected once, reused via <use>)
│   ├── js/data.js          # cities, rates, sample shipments, hubs (all fictional)
│   ├── js/logic.js         # pure functions: haversine, quote engine, formatting, projection
│   ├── js/common.js        # theme toggle, menu, reveals, toasts, newsletter
│   ├── js/app.js           # home page features
│   ├── js/dashboard.js     # KPIs, canvas and SVG charts, data table
│   ├── js/design.js        # design system demos
│   └── img/favicon.svg
├── screenshots/            # README images
├── .nojekyll
├── LICENSE
└── README.md
```

## Pricing formula

```
distance     = round(haversine(origin, destination) × factor)      road 1.2 · air 1.0 · sea 1.35
volumetric   = L × W × H ÷ divisor                                  road 5000 · air 6000 · sea 1000
chargeable   = ceil(max(actual, volumetric) × 2) ÷ 2                 next 0.5 kg
freight      = round(chargeable × distance × rate)                  road ₹0.010 · air ₹0.022 · sea ₹0.0012 per kg·km
service      = round(freight × (multiplier − 1))                    economy 1.0 · express 1.5 · same-day 2.4
fuel         = round((base + freight + service) × 12%)              base road ₹149 · air ₹499 · sea ₹1,999
total        = subtotal + round(subtotal × 18% GST)
```

**Worked example:** Mumbai → Delhi, road, express, 10 kg in a 30 × 20 × 15 cm box. Distance 1,378 km, volumetric 1.8 kg, so chargeable 10 kg. Freight ₹138 + base ₹149 + express ₹69 + fuel ₹43 = ₹399, plus GST ₹72 = **₹471**, delivered in 3 days.

## Tech stack

**HTML5 · CSS3 (custom properties, Grid, Flexbox, `backdrop-filter`, `color-mix`) · vanilla JavaScript (ES5+, no modules so it works from `file://`) · SVG · Canvas 2D · localStorage.** No frameworks, no libraries, no fonts or scripts from CDNs.

## What I learned

- Combining three visual styles into one coherent system by giving each a clear role
- Projecting geographic data to SVG (equirectangular and orthographic) and animating along paths
- Building a transparent pricing engine and testing it against independent calculations
- Multi-step forms, client-side persistence and accessible validation
- Drawing charts by hand with Canvas and SVG, including HiDPI scaling and theme-aware redraws
- Accessibility at scale: focus management, ARIA states, reduced motion and contrast in two themes

## Author

**Rishabh Aryan** · [@Rishabh-bgp](https://github.com/Rishabh-bgp)

## License

Released under the [MIT License](LICENSE). © 2026 Rishabh Aryan

## 🔗 Other repositories by Rishabh Aryan

| Repository | Description | Live |
|---|---|---|
| [100-days-of-python](https://github.com/Rishabh-bgp/100-days-of-python) | My original, offline, no-API-key solutions to all 100 projects of the 100 Days of Code Python bootcamp curriculum… | — |
| [Agentic-Engineering-Ebook](https://github.com/Rishabh-bgp/Agentic-Engineering-Ebook) | Agentic Engineering is a practical notebook-book on specifying, generating, verifying, and refining multi-tenant… | — |
| [beed-ml-study](https://github.com/Rishabh-bgp/beed-ml-study) | Provenance audit and leakage-aware benchmark of seizure-type classifiers on the Bangalore EEG Epilepsy Dataset — IIT… | — |
| [Brain-Computer-Interfaces-and-Cognitive-Computing-An-Introduction](https://github.com/Rishabh-bgp/Brain-Computer-Interfaces-and-Cognitive-Computing-An-Introduction) | Brain–computer interfaces (BCIs) link neural activity to external devices, translating brain signals via algorithms… | — |
| [building-a-virtual-cell-in-python](https://github.com/Rishabh-bgp/building-a-virtual-cell-in-python) | A cell has a normal gene-activity pattern. Knock out one gene and that pattern changes. This project trains a small… | — |
| [Chronic-Kidney-Disease-Stage-Identification-in-HIV-Infected-Patients-Using-Supervised-ML](https://github.com/Rishabh-bgp/Chronic-Kidney-Disease-Stage-Identification-in-HIV-Infected-Patients-Using-Supervised-ML) | ML is transforming Chronic Kidney Disease (CKD) detection in HIV patients, catching early asymptomatic stages to… | — |
| [cobratate](https://github.com/Rishabh-bgp/cobratate) | Cobratate, an esoteric imperative programming language. Tate-flavored syntax, ordinary semantics, and a Python… | [open](https://rishabh-bgp.github.io/cobratate/) |
| [coda-synth](https://github.com/Rishabh-bgp/coda-synth) | CoDA-Synth: stylometric detection of LLM-rewritten dark-web documents with sparse TF-IDF + LinearSVC. Research lab,… | [open](https://shale-ember-delta-kite.grok.me/) |
| [IIT-ROPAR-GENAI-FOUNDATIONS](https://github.com/Rishabh-bgp/IIT-ROPAR-GENAI-FOUNDATIONS) | Free open-source Generative AI foundations ebooks (2026) covering Claude, Grok, Gemini, Cursor, OpenAI and more —… | — |
| [kbc-game](https://github.com/Rishabh-bgp/kbc-game) | Kaun Banega Crorepati (KBC) quiz game for the terminal in Python: 16-question prize ladder, safe levels and 4… | — |
| [knn-classifier](https://github.com/Rishabh-bgp/knn-classifier) | Simple K-Nearest Neighbors classifier on the classic Iris dataset using scikit-learn. Loads data, trains the model,… | — |
| [linear-regression-model-](https://github.com/Rishabh-bgp/linear-regression-model-) | Supervised linear regression on the scikit-learn diabetes dataset. A single feature (BMI) is used to predict… | — |
| [logistic-regression](https://github.com/Rishabh-bgp/logistic-regression) | This graduate capstone applies multi-class logistic regression to the Iris dataset. It includes EDA, stratified… | — |
| [lovelight-leap](https://github.com/Rishabh-bgp/lovelight-leap) | 💖 Lovelight Leap: a love-themed 2D platformer in vanilla JS canvas. 4 worlds, a boss you cheer up, original… | [open](https://rishabh-bgp.github.io/lovelight-leap/) |
| [machine-learning-part-1](https://github.com/Rishabh-bgp/machine-learning-part-1) | Machine learning in Python with scikit-learn: heart disease classification and medical insurance cost regression… | — |
| [Meeting-of-Machines-Consumer-Agents-Seller-Agents-and-Hidden-Fulfilment-Risk-in-Online-Retail](https://github.com/Rishabh-bgp/Meeting-of-Machines-Consumer-Agents-Seller-Agents-and-Hidden-Fulfilment-Risk-in-Online-Retail) | Agentic commerce lets shopping and seller agents place orders without showing operational truth. This IS case argues… | — |
| [morocco-city-aware-load-forecasting](https://github.com/Rishabh-bgp/morocco-city-aware-load-forecasting) | City-aware short-term load forecasting and peak detection on high-resolution Moroccan smart-meter data (5 zones).… | — |
| [NIELIT-DATA-SCIENCE](https://github.com/Rishabh-bgp/NIELIT-DATA-SCIENCE) | Hands-on NumPy, Pandas, and Matplotlib Jupyter notebooks for the NIELIT Data Science curriculum — practical,… | — |
| [NIELIT-MACHINE-LEARNING-PROJECTS](https://github.com/Rishabh-bgp/NIELIT-MACHINE-LEARNING-PROJECTS) | Nineteen end-to-end machine learning projects: classification, regression, clustering, and recommendation, with… | — |
| [NIELIT-PYTHON-](https://github.com/Rishabh-bgp/NIELIT-PYTHON-) | Open-source Python teaching notebooks: a language reference and five capstone programs, with detailed documentation.… | — |
| [pan-cancer-classification](https://github.com/Rishabh-bgp/pan-cancer-classification) | Leakage, equivalence, conformal reliability and data efficiency on the UCI TCGA Pan-Cancer RNA-Seq dataset — IIT… | — |
| [Predicting-Hot-Events-in-the-Early-Period-through-Bayesian-Model-for-Social-Networks](https://github.com/Rishabh-bgp/Predicting-Hot-Events-in-the-Early-Period-through-Bayesian-Model-for-Social-Networks) | This notebook details the implementation and evaluation of a Bayesian perspective Early stage Event Prediction… | — |
| [prediction-as-power](https://github.com/Rishabh-bgp/prediction-as-power) | Laboratory and working paper on prediction as power in European electricity markets. A DE-like hourly simulator… | — |
| [snakes-and-ladders](https://github.com/Rishabh-bgp/snakes-and-ladders) | 🐍🪜 Original Snakes & Ladders browser game: hand-drawn SVG snakes and ladders, 3D dice, 2-4 humans or bots, sound,… | [open](https://rishabh-bgp.github.io/snakes-and-ladders/) |
| [spam-scan](https://github.com/Rishabh-bgp/spam-scan) | Explainable spam, phishing & Indian-scam detector for SMS/email (English, Hindi, Hinglish): TF-IDF + Logistic… | [open](https://spam-scan.onrender.com) |
| [vedic-math-hybrid-kt](https://github.com/Rishabh-bgp/vedic-math-hybrid-kt) | Hybrid Vedic Math AI: rule-based sutras (Urdhva-Tiryagbhyam, Nikhilam, Yavadunam) plus RF classifier that cleans… | — |
| [wind-turbine-power-model](https://github.com/Rishabh-bgp/wind-turbine-power-model) | Single-turbine power curves + wind-farm simulation. Weibull wind stats, hourly NASA-style speed data, and… | — |
| [zoo-website-capstone](https://github.com/Rishabh-bgp/zoo-website-capstone) | Capstone project: a fictional zoo website built twice — a beginner-style simple version and a cinematic advanced… | [open](https://rishabh-bgp.github.io/zoo-website-capstone/) |
