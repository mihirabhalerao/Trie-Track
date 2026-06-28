# Trie&Track

Trie&Track is a full-stack DSA progress tracker that consolidates NeetCode 150 and Striver A2Z into a single platform — so you can log attempts, track solve status, and get timely revision reminders across both sheets without switching between spreadsheets. Each time you log a problem, you record the level of help you required and the bottleneck where you got stuck. An adapted SM-2 spaced repetition engine uses those signals to schedule exactly when you should revisit it.

---

## Features

- **SM-2 Spaced Repetition** — Per-attempt friction signals (`HelpLevel`, `BottleneckType`) map to quality scores (0–5) that drive dynamic review interval and Ease Factor calculations
- **Unified Sheet Aggregation** — 400+ problems from NeetCode 150 and Striver A2Z in a single filterable schema by topic, difficulty, and status
- **JWT Auth + Redis Blocklist** — Stateless authentication with instant logout invalidation via a Redis-backed token blocklist
- **Batch State Resolution** — O(1) multi-row lookup pipeline with duplicate-safe merge for guaranteed persistence
- **Auto-saving Notes & Stars** — Blur-triggered note saves and optimistic star updates per problem

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Java 17, Spring Boot, Spring Data JPA, Spring Security |
| Frontend | React, TypeScript, Zustand, Vite |
| Database | PostgreSQL |
| Auth | JWT + Redis token blocklist |

---

## Project Structure

### Backend (`/backend`)

```
src/main/java/com/example/trietrack/
│
├── controller/
│   ├── AuthController.java
│   └── ProblemController.java           # REST endpoints for sheets, submissions, notes, stars
│
├── dto/
│   ├── LoginRequest.java
│   ├── ProblemResponse.java             # Merged contract: static catalog + live user state
│   └── ProblemSubmissionRequest.java    # Input structure mapping friction parameters
│
├── model/
│   ├── Problem.java                     # Master problem catalog
│   ├── SheetProblem.java                # Junction entity mapping problems to curriculum sheets
│   ├── User.java                        # User authentication profiles
│   ├── UserProblemState.java            # Per-user persistent analytics state
│   ├── ProgressLog.java                 # Immutable audit trail of all attempt logs
│   └── enums/
│       ├── SheetType.java               # [NEETCODE_150, STRIVER_A2Z]
│       ├── Topic.java                   # 19 DSA topic patterns
│       ├── HelpLevel.java               # [SOLO, HINT, SOLUTION]
│       └── BottleneckType.java          # [NONE, CONCEPT, OPTIMIZATION, TRANSLATION, EDGE_CASES]
│
├── repository/
│   ├── UserRepository.java
│   ├── ProblemRepository.java
│   ├── SheetProblemRepository.java
│   ├── UserProblemStateRepository.java
│   └── ProgressLogRepository.java
│
├── service/
│   ├── ProblemService.java              
│   └── ProblemSubmissionService.java    
│
└── srs/
    └── SpacedRepetitionEngine.java      
```

### Frontend (`/frontend`)

```
src/
├── api/
│   └── client.ts          
├── store/
│   └── authStore.ts  
├── layouts/
│   ├── ProtectedRoute.tsx
│   └── PublicRoute.tsx     
├── pages/
│   ├── Login.tsx
│   ├── Register.tsx
│   └── Dashboard.tsx      
└── App.tsx                
```

---

## Spaced Repetition Algorithm (SM-2)

On each problem submission, a quality score `q ∈ [0, 5]` is derived from `HelpLevel` and `BottleneckType` signals.

**Interval scheduling:**

- `q < 3` (struggled): interval resets to 1 day
- `q ≥ 3` (successful):
  - Attempt 1 → 1 day
  - Attempt 2 → 6 days
  - Attempt n → `round(I(n-1) × EF)`

**Ease Factor update:**

$$EF' = EF + \left(0.1 - (5 - q) \times (0.08 + (5 - q) \times 0.02)\right)$$

EF is floored at `1.3` to prevent runaway daily review loops.

---

## Local Setup

### Prerequisites

- Java 17+ (OpenJDK or Corretto)
- Node.js v18+ and npm
- Docker and Docker Compose

### 1. Infrastructure

PostgreSQL and Redis are managed via Docker Compose from the parent directory:

```bash
docker-compose up -d
```

This starts PostgreSQL on `localhost:5432` and Redis on `localhost:6379`. Schema is auto-managed by Hibernate DDL on first boot. Problem catalog seeds automatically from `src/main/resources/data.sql`.

### 2. Backend

```bash
./mvnw clean spring-boot:run
```

Server starts at `http://localhost:8080`.

### 3. Frontend

```bash
npm install
npm run dev
```

Client starts at `http://localhost:5173`.