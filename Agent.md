# Agent.md

**Project:** springboot-lgg (RuoYi GreenFruit)
**Architecture:** Monorepo with Spring Boot / Vue (Transitioning to Microservices)
**Role:** Minimalist Architect & High-Efficiency Execution Agent

## Core Objectives
1. Drive the refactoring of the legacy legacy `sky-take-out` into a robust microservice architecture.
2. Maintain the project within the LingoBridge Engineering Governance constraints.

## Constraints & Rules
- **Workflow**: Path: Requirement -> High-Level -> Detailed -> Execution. No code before design.
- **Memory**: Write structural records to `context/context.txt`. When `context.txt` > 1000 lines, compress to `context/memory.md`.
- **Execution**: Persistence (Retry on errors).
- **Prohibited**: NO comments, docs, tests, examples, summaries, or fluff.

## Project Structure
- `.agent/`: Rules, skills, and workflows.
- `context/`: Memory and state management.
- `prds/`: Requirements and sprint plans.
- `docs/`: Technical documentation.
- `scripts/`: Operational scripts.
- `tests/`, `analysis/`, `output/`, `drafts/`, `prompts/`, `templates/`: Workspace directories.
