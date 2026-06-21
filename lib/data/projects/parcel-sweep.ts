import type { Project } from "../projects.schema";

const WORKFLOW_DIAGRAM = `Sunday Hub (supervisor)
       ↓
Import manifest → validate → plan & split routes → assign drivers
       ↓
Loading dock (scan, ghost detect, load order) → route plan (export, nav handoff)
       ↓
Start delivery → driver view (GPS, proximity, stop completion)
       ↓
Sunday Hub / admin (fleet view, readiness clocks, exceptions)`;

const ROUTE_ENGINE_DIAGRAM = `Depot geocode (Google or Nominatim)
       ↓
Cluster stops (haversine, configurable radius)
       ↓
OSRM duration matrix (haversine fallback)
       ↓
Nearest-neighbor + 2-opt stop ordering
       ↓
Cross-route proximity alerts + leg-by-leg route geometry
       ↓
GPX / KML / CSV export`;

const GPS_FLOW_DIAGRAM = `Driver device
  │ browser geolocation (5s throttle)
  ▼
DriverView ── proximity zones (300m / 120m / 40m)
  │ POST /api/routes/:id/gps
  ▼
Express API ──► gps_pings table
  │ emit gps:update + alert:proximity
  ▼
Socket.io route room ──► Sunday Hub / Admin / Route viewers`;

export const parcelSweep: Project = {
  slug: "parcel-sweep",
  title: "Parcel Sweep",
  description:
    "A full-stack last-mile delivery operations prototype built around one question: what would a modern Sunday parcel workflow look like if manifest intake, route planning, loading, dispatch, and driver execution were one continuous system?",
  status: "demo",
  imageUrl: "/images/parcel_sweep.png",
  tags: [
    "React",
    "Express",
    "SQLite",
    "Route Optimization",
    "Logistics",
    "Socket.io",
    "Full Stack",
  ],
  keywords: [
    "parcel sweep",
    "last mile",
    "route optimization",
    "usps",
    "sunday delivery",
    "loading dock",
    "driver gps",
    "logistics",
    "operations",
  ],
  builtFor: "Sunday parcel operations and portfolio-grade logistics workflow storytelling",
  solved: "routing demos that stop at stop optimization instead of covering manifest-to-delivery operations",
  delivered: [
    "End-to-end workflow: manifest → plan/split → load → export → drive → supervise",
    "Composable route engine: clustering, OSRM matrix, 2-opt, cross-route proximity alerts",
    "Driver execution layer: wake lock, tiered proximity alerts, speech, vibration, demo simulation",
    "Sunday Hub supervisor view with KPI strip, readiness clocks, and exception lanes",
    "Single-service deploy on Railway with Docker, health checks, and GPX/KML/CSV export",
  ],
  cardDescription:
    "Last-mile ops prototype: manifest intake, route planning, dock scanning, live driver mode, and a Sunday supervisor hub - from manifest to last stop.",
  cardBuiltFor: "Sunday parcel operations and logistics portfolio demos",
  cardSolved: "routing tools that ignore manifest, loading, dispatch, and supervisor visibility",
  cardDelivered: [
    "Full manifest-to-delivery workflow in one SPA",
    "OSRM-backed optimization with cross-route proximity alerts",
    "Driver mode with GPS telemetry and proximity ergonomics",
  ],
  liveUrl: "https://parcel-sweep.up.railway.app",
  repoUrl: "https://github.com/stepweaver/parcel-sweep",
  sections: [
    {
      id: "overview",
      title: "Overview",
      type: "overview",
      content:
        "Parcel Sweep is not a USPS product. It is a full-stack prototype I built to answer a narrow operational question: what would a modern Sunday delivery workflow look like if manifest intake, route planning, loading, dispatch, and driver execution were designed as one continuous system?\n\nMost routing demos stop at \"optimize these stops.\" Parcel Sweep follows the parcel all the way through: CSV or synthetic manifest intake, validation and hold review, multi-driver route proposals, loading-dock scanning with ghost detection, route book export, live driver mode with proximity alerts, and a Sunday Hub supervisor control tower. Each screen has a concrete place in the operational story. That through-line is the product.\n\nThe codebase is intentionally inspectable. Frontend and backend are cleanly separated, data shapes are typed, SQLite initializes predictably, API routes are organized by domain, and route planning is decomposed into clustering, matrix construction, optimization, alert generation, and export services. For a portfolio case study, that readability matters as much as the demo flow.",
    },
    {
      id: "problem",
      title: "The Problem",
      type: "problem",
      bullets: [
        "Most routing demos optimize stops in isolation and ignore manifest intake, loading, dispatch readiness, and supervisor visibility",
        "Sunday parcel operations need a supervisor-to-driver through-line, not a spreadsheet plus a map",
        "Real delivery execution requires proximity ergonomics - wake lock, alerts, arrival gating - not just pins on a map",
        "Enterprise last-mile suites (Onfleet, Routific) are broad but opaque; portfolio projects often hide domain logic behind SaaS wrappers",
        "Bulk manifest import and multi-driver splitting are usually treated as separate products from driver execution",
        "Straightaway and similar tools focus on driver navigation but skip the supervisor manifest and loading-dock story",
      ],
    },
    {
      id: "solution",
      title: "The Solution",
      type: "solution",
      bullets: [
        "Workflow stepper and Sunday Hub frame the entire shift as one narrative: import → validate → plan → load → dispatch → monitor",
        "Manifest review combines validation results, route proposals, driver assignment, and unassigned-package handling on one page",
        "Loading dock supports scanner input, ghost package detection, load-order preview, and re-optimization after scans",
        "Route plan view offers stop lists, map themes, GPX/KML/CSV export, and external navigation handoff to Google Maps, Waze, or Apple Maps",
        "Driver mode adds wake lock, 5-second GPS telemetry, demo simulation, tiered proximity alerts, speech synthesis, vibration, and blocking arrival prompts",
        "Backend route engine decomposes cleanly: geocode depot → cluster stops → OSRM matrix → nearest-neighbor + 2-opt → alerts → geometry export",
      ],
    },
    {
      id: "workflow",
      title: "Operational Workflow",
      type: "data-flow",
      content: WORKFLOW_DIAGRAM,
    },
    {
      id: "key-features",
      title: "Key Features",
      type: "key-features",
      bullets: [
        "Synthetic manifest generation from real OpenStreetMap addresses via Overpass for any ZIP code",
        "CSV import with validation, hold/review workflow, supervisor override paths, and template download",
        "Multi-driver route proposals with capacity framing, feasibility flags, and per-route creation",
        "Cross-route proximity alerts when another driver's stop is on the same block (default 120 m)",
        "Load-order calculation so the first delivery is loaded last on the truck",
        "Ghost package detection for scans that do not match the manifest",
        "Realtime fleet visibility via Socket.io route rooms - GPS, proximity alerts, stop completion",
        "Sunday Hub KPI strip: imported, validated, routed, loaded, delivered, route count, active routes",
        "Readiness clocks and exception lanes for supervisor scan-and-act workflows",
        "Admin fleet view with driver, status, progress, ETA, and remaining stops (15 s auto-refresh)",
      ],
    },
    {
      id: "route-engine",
      title: "Route Engine Pipeline",
      type: "data-flow",
      content: ROUTE_ENGINE_DIAGRAM,
    },
    {
      id: "architecture",
      title: "Architecture",
      type: "architecture",
      bullets: [
        "Monolithic demo deploy: Express serves REST API + Vite-built SPA from one container on Railway or Render",
        "SQLite in WAL mode with foreign keys; manifests, packages, routes, stops, scans, and GPS pings",
        "Route handlers in backend/src/routes; domain logic in backend/src/services - findable without spelunking",
        "Frontend pages map directly to operational roles: dispatcher, loader, driver, supervisor",
        "OSRM for drive-time matrix and route geometry; Nominatim or optional Google Geocoding for depot resolution",
        "Leaflet map stack (CARTO, OSM, Esri) - no embedded Google Maps JavaScript; Google URLs used only for external nav handoff",
        "CSV import uses ZIP-centroid jitter for speed - acceptable for demo, flagged as APPROXIMATE_GEOCODE in validation results",
      ],
    },
    {
      id: "gps-flow",
      title: "GPS and Alerts Data Flow",
      type: "data-flow",
      content: GPS_FLOW_DIAGRAM,
    },
    {
      id: "driver-experience",
      title: "Driver Experience",
      type: "features",
      bullets: [
        "Full-screen drive mode with rotated Leaflet map that follows heading, truck icon, and route geometry",
        "Demo mode simulates movement along the route path when live GPS is unavailable - useful for portfolio demos",
        "Tiered proximity model: warning at 300 m, alert at 120 m, arriving at 40 m",
        "Blocking arrival overlay forces acknowledgment before continuing - safety prompt, not passive notification",
        "Speech synthesis, vibration, and browser notifications layered on banner UI",
        "Turn-by-turn handoff opens the next stop or full route in external navigation apps",
        "Map themes: CARTO Voyager/Light/Night, OSM, Esri satellite",
      ],
    },
    {
      id: "engineering",
      title: "Engineering Decisions",
      type: "engineering",
      bullets: [
        "Composable route planner services instead of one opaque optimizer module - clustering, matrixBuilder, routeOptimizer, alertGenerator, routeExporter each own one concern",
        "OSRM matrix with haversine fallback when routing services fail - planning does not hard-fail on public infra blips",
        "Frontend fetch wrapper retries 502/503/504 and network failures up to six attempts",
        "Single-service production Docker image with health check wired for Railway and Render",
        "Socket.io scoped to route rooms for GPS and proximity broadcast without polling",
        "Accessibility fundamentals: semantic landmarks, dynamic document titles, aria-live scan history, alert roles, reduced-motion CSS, responsive grid collapse",
      ],
    },
    {
      id: "evidence",
      title: "Directional Benchmarks",
      type: "evidence-bar",
      evidence: [
        { label: "CSV import (2,000 rows)", value: "~270 ms" },
        { label: "Route proposal (50 drivers)", value: "~3.5 s" },
        { label: "Proximity zones", value: "300 / 120 / 40 m" },
        { label: "GPS telemetry throttle", value: "5 s" },
      ],
    },
    {
      id: "tradeoffs",
      title: "Tradeoffs",
      type: "tradeoffs",
      bullets: [
        "No authentication: admin and API endpoints are open; any client can modify manifests, routes, GPS, and join Socket.io rooms by route ID",
        "Approximate bulk geocodes: CSV import assigns ZIP-centroid coordinates with deterministic jitter instead of street-level geocoding - fast for demos, weak for real routing fidelity",
        "Heuristic multi-driver split: routes are balanced chunks along one optimized sequence, not a true multi-vehicle VRP with time windows or service-time modeling",
        "Google geocoding compliance: optional Google Geocoding persists depot coordinates while maps render on Leaflet/OSM - needs legal review before any production rollout",
        "Public routing infra: default OSRM, Nominatim, and Overpass instances are fine for demos but rate-limited with no SLA",
        "PII and GPS retention: SQLite stores recipient names, addresses, tracking numbers, notes, and GPS pings with no defined retention or purge policy",
        "Manual QA only: strong supervisor acceptance runbook in the repo, but no automated test suite or CI pipeline yet",
        "No proof-of-delivery capture, exception taxonomy, offline sync, or role-based access - all deliberate prototype scope cuts",
      ],
    },
    {
      id: "hardening-roadmap",
      title: "Hardening Roadmap",
      type: "project-structure",
      items: [
        { label: "Critical", description: "Auth/RBAC, Google geocoding compliance review, rate limiting on writes and imports" },
        { label: "High", description: "Staged real geocoding with confidence flags, GPS/PII retention controls, proof-of-delivery workflow, CI and smoke tests" },
        { label: "Medium", description: "True multi-vehicle optimization (OR-Tools or hosted API), structured observability, CSV export formula-injection hardening" },
        { label: "Low", description: "Offline driver resume support, seeded demo scenarios for screenshot and eval flows" },
      ],
    },
    {
      id: "outcome",
      title: "Outcome",
      type: "outcome",
      bullets: [
        "Portfolio-grade logistics case study demonstrating workflow-first product thinking, not just algorithm output",
        "Credible supervisor-to-driver demo flow suitable for evaluators unfamiliar with last-mile operations",
        "Inspectable codebase where clustering, matrix construction, optimization, alerts, and export are readable services",
        "Natural companion to Carrier's Log and Mail Sort Academy in the postal operations portfolio story - field experience informing systems design",
        "Live demo deployed on Railway; not production-ready for real drivers or customer parcels without the hardening phase above",
        "Publishable as a prototype that shows strong product judgment: narrow context, full workflow, honest tradeoffs",
      ],
    },
    {
      id: "tech-stack",
      title: "Tech Stack",
      type: "tech-stack",
      techStack: [
        { name: "React", category: "Frontend" },
        { name: "Vite", category: "Frontend" },
        { name: "Leaflet", category: "Maps" },
        { name: "Express", category: "Backend" },
        { name: "Socket.io", category: "Realtime" },
        { name: "SQLite", category: "Database" },
        { name: "OSRM", category: "Routing" },
        { name: "TypeScript", category: "Language" },
        { name: "Docker", category: "Deploy" },
        { name: "Railway", category: "Hosting" },
      ],
    },
  ],
};
