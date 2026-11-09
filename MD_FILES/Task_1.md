# Task 1 — DevWork Tracker: Repository & Project Initialization

## Project Location
`E:\WorkTracker`

## Objective
Initialize the DevWork Tracker repository and create the basic React frontend and Spring Boot backend.

## Before making changes
1. Inspect the existing directory structure.
2. Read `Master_instruction.md` and `00_PROJECT_STATUS.md`.
3. Preserve all existing documentation.
4. Preserve the `OLD_XLS_FILES` directory and all three original Excel workbooks.
5. Do not overwrite or delete existing files without a clear reason.

## Technology Stack

- Java: 23.0.1
- Spring Boot: Select a compatible stable 3.x release.
- Maven: Use Maven Wrapper.
- Node.js: 22.17.1
- npm: 10.9.2
- React + Vite
- PostgreSQL: 18 (already installed)
- Git: 2.50.1

Do not upgrade installed software.

## Repository Structure

Create or organize:

```text
E:\WorkTracker\
├── frontend\
├── backend\
├── database\
│   ├── README.md
│   └── reference\
├── docs\
│   ├── requirements\
│   ├── architecture\
│   ├── api\
│   ├── development\
│   └── excel\
├── OLD_XLS_FILES\
├── .gitignore
├── README.md
└── docker-compose.yml
```

Preserve existing documentation and organize it according to the approved documentation structure where necessary.

## Frontend Initialization

- Initialize React + Vite using JavaScript.
- Verify npm dependencies install successfully.
- Create a basic application entry point.
- Verify the frontend starts successfully.

Do not implement any business screens or features.

## Backend Initialization

- Create a Spring Boot project.
- Use Java 23.
- Use Maven Wrapper.
- Include only the initial dependencies needed for the project foundation.
- Create the base package `com.devworktracker`.
- Create the main application class.
- Add basic application configuration.
- Verify the backend starts successfully.

Do not implement authentication, entities, repositories, controllers or business modules.

## Git Initialization

- Initialize Git if not already initialized.
- Create `main` and `dev` branches.
- Configure `.gitignore`.
- Never commit real credentials or secrets.
- Preserve existing Git history if a repository already exists.

## Restrictions

- Do not create database tables.
- Do not create Flyway migrations.
- Do not connect to PostgreSQL yet.
- Do not implement business logic.
- Do not modify approved business requirements.
- Do not add unnecessary dependencies.
- Do not delete existing files.

## Completion Report

After implementation, report:

1. Created directory structure.
2. Created and modified files.
3. Selected Spring Boot version and compatibility.
4. Maven Wrapper version.
5. Frontend startup verification.
6. Backend startup verification.
7. Git branch status.
8. Any errors or unresolved issues.

Stop after this task. Wait for approval before starting the next task.