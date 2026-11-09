# DevWork Tracker

DevWork Tracker is a single-user developer work tracking application designed to replace three manual Excel workbooks:
- Daily Work Log
- Database Change Log
- Code File Change Log

## Technology Stack
- **Frontend:** React + Vite (JavaScript), Tailwind CSS
- **Backend:** Java 23 + Spring Boot 3.4.x, Maven Wrapper
- **Database:** PostgreSQL 18 (Flyway schema migrations)
- **Export Engine:** Apache POI

## Repository Structure
```text
DevWork Tracker/
├── frontend/          # React + Vite application
├── backend/           # Spring Boot application
├── database/          # Database documentation and reference SQL
│   ├── README.md
│   └── reference/
├── docs/              # Specifications and architectural documentation
├── OLD_XLS_FILES/     # Original Excel workbook templates
├── docker-compose.yml # Optional local PostgreSQL container
└── README.md
```

## Getting Started

### Prerequisites
- Node.js (v22.x LTS) & npm (10.x)
- Java JDK 23
- PostgreSQL 18

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Backend Setup
```bash
cd backend
# Windows:
mvnw.cmd spring-boot:run
# Linux/macOS:
./mvnw spring-boot:run
```
