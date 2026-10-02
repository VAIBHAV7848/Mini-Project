# Milestone-Based Escrow & Evidence-Based Dispute Resolution Workflow

> **Team 07 (Theme 01)** — KLE Technological University (Dr. M. S. Sheshgiri College of Engineering and Technology, Belagavi)
>
> Academic Mini-Project: Milestone-Based Escrow & Evidence-Based Dispute Resolution Workflow.


This repository implements a disciplined engineering operating system:
- **Architecture by Design**: Explicit boundaries, minimal coupling, and ADR-governed evolution.
- **Verification First**: Automated test suites, strict linting, security scans, and evidence-based completion.
- **Agent Governance**: Standardized protocols defined in [AGENTS.md](file:///home/nethunter/Collage/BIG_PROJECT/AGENTS.md) and [AI Development Protocol](file:///home/nethunter/Collage/BIG_PROJECT/docs/development/ai-development-protocol.md).

---

## Directory Structure
```text
BIG_PROJECT/
├── .agents/skills/       # Project-owned AI agent skills
├── .github/              # GitHub Actions workflows and PR/issue templates
├── docs/                 # Single source of durable project knowledge
│   ├── architecture/     # System architecture blueprints and constraints
│   ├── decisions/        # Architectural Decision Records (ADRs)
│   ├── requirements/     # Business and technical specifications
│   ├── api/              # API contracts and schemas
│   ├── database/         # Schemas, ERDs, and migration plans
│   ├── development/      # Development lifecycle, testing strategy, status
│   ├── security/         # Threat models and security baselines
│   └── research/         # Research notes and evaluation spikes
├── src/                  # Production application source code
├── tests/                # Test suites (unit, integration, e2e)
├── scripts/              # Executable verification and lifecycle tools
├── infrastructure/       # IaC, Docker, deployment configs
├── config/               # Configuration files and schemas
├── examples/             # Code samples and fixtures
├── data/                 # Sample and non-sensitive seed datasets
├── assets/               # Static assets and media
└── tools/                # Development utilities
```

---

## Getting Started

### Prerequisites
- Linux (Ubuntu 24.04+ recommended)
- Git (>= 2.40)
- Node.js (>= 20) / Python (>= 3.11)
- Docker & Docker Compose

### Bootstrap
Run the automated environment bootstrap check:
```bash
./scripts/bootstrap
```

### Verification & Quality Checks
Run all quality and security gates:
```bash
./scripts/lint            # Shell, formatting, and file hygiene
./scripts/security-check  # Secret scanning, permissions, and security audit
./scripts/verify          # Full verification pipeline
```

---

## Documentation Quick Links
- [Engineering Constitution](file:///home/nethunter/Collage/BIG_PROJECT/AGENTS.md)
- [System Architecture](file:///home/nethunter/Collage/BIG_PROJECT/docs/architecture/architecture.md)
- [Testing Strategy](file:///home/nethunter/Collage/BIG_PROJECT/docs/development/testing-strategy.md)
- [Security Baseline](file:///home/nethunter/Collage/BIG_PROJECT/SECURITY.md)
- [Project Status](file:///home/nethunter/Collage/BIG_PROJECT/docs/development/project-status.md)
- [AI Development Protocol](file:///home/nethunter/Collage/BIG_PROJECT/docs/development/ai-development-protocol.md)
- [Contribution Guidelines](file:///home/nethunter/Collage/BIG_PROJECT/CONTRIBUTING.md)

---

## License
This project is licensed under the MIT License - see [LICENSE](file:///home/nethunter/Collage/BIG_PROJECT/LICENSE) for details.
