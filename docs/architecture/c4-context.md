# C4 Architecture Model — Level 1: System Context

> **Classification**: Authoritative C4 Architecture Specification (Stage S2 — Shared Architecture)
> **Source Documents**:
> - `docs/source-material/Team07_Escrow_Mini_Project_KLE_Theme.pptx` (Slide 8, 16, 17)
> - `docs/requirements/team-project-overview.md`
> - `docs/architecture/architecture.md`

---

## 1. System Context Diagram

The System Context diagram illustrates the system boundaries, human actors, and external system integrations.

```mermaid
flowchart TD
    subgraph Users ["Human User Personas"]
        Client["Client (Project Poster)<br>[Person]<br>Posts projects, funds escrow, inspects deliverables, approves payments."]
        Freelancer["Freelancer (Developer)<br>[Person]<br>Browses gigs, submits proposals, uploads deliverables with SHA-256 proofs."]
        Reviewer["Dispute Reviewer (Arbiter)<br>[Person]<br>Inspects EvidenceTrees, evaluates claims, renders binding escrow rulings."]
        Admin["Auditor / System Admin<br>[Person]<br>Monitors institutional compliance, inspects append-only audit trail."]
    end

    System["Milestone Escrow & Dispute Resolution Platform<br>[Software System]<br>Provides milestone-based escrow state management, cryptographic evidence verification, and dispute resolution."]

    subgraph ExternalSystems ["External Integration Boundaries"]
        GitHubAPI["GitHub REST API<br>[External System]<br>Read-only repository and commit activity inspection for DevScore calculation."]
        LocalFS["Local Storage Filesystem<br>[Local OS Service]<br>Secure local disk storage for deliverable ZIP files and evidence artifacts."]
    end

    Client -->|Interacts via HTTPS / Browser| System
    Freelancer -->|Submits bids & deliverables via HTTPS| System
    Reviewer -->|Inspects evidence & arbitrates via HTTPS| System
    Admin -->|Inspects audit logs via HTTPS| System

    System -->|Queries public profile metrics| GitHubAPI
    System -->|Stores & verifies binary artifacts| LocalFS

    style System fill:#1976d2,stroke:#0d47a1,stroke-width:3px,color:#ffffff
    style Client fill:#e3f2fd,stroke:#1565c0,stroke-width:1px
    style Freelancer fill:#e3f2fd,stroke:#1565c0,stroke-width:1px
    style Reviewer fill:#e3f2fd,stroke:#1565c0,stroke-width:1px
    style Admin fill:#e3f2fd,stroke:#1565c0,stroke-width:1px
    style GitHubAPI fill:#f5f5f5,stroke:#616161,stroke-width:1px
    style LocalFS fill:#f5f5f5,stroke:#616161,stroke-width:1px
```

---

## 2. Actor Responsibilities & Interactions

| Persona / Actor | Role Code | Authentication Method | Primary System Operations |
| :--- | :--- | :--- | :--- |
| **Client** | `CLIENT` | Bcrypt password / Session Token | Creates projects; reviews proposals; executes `DEPOSIT` into escrow; inspects deliverables; triggers `APPROVE` or `RAISE_DISPUTE`. |
| **Freelancer** | `FREELANCER` | Bcrypt password / Session Token | Creates service gigs; submits proposals; triggers `SUBMIT_DELIVERABLE` with SHA-256 hash generation; challenges delayed approvals. |
| **Dispute Reviewer** | `REVIEWER` | Bcrypt password / Session Token | Assigned to open disputes; evaluates N-ary `EvidenceTree`; executes binding arbitration rulings (`RELEASE` or `REFUND`). |
| **Auditor / Admin** | `ADMIN` | Multi-factor / Admin Token | Inspects append-only `AUDIT_LOG` with cryptographic verification hashes; verifies institutional RTM compliance. |

---

## 3. External System Boundaries & Constraints

1. **GitHub REST API (`api.github.com`)**:
   - **Boundary**: Read-only public endpoints (`/users/{username}`, `/users/{username}/repos`).
   - **Purpose**: Retrieves public commit counts and language distributions to calculate developer reputation score (`devScore`).
   - **Failure Mode**: If GitHub is unreachable or rate-limited, system falls back to default neutral score ($50$) without blocking user workflows.
2. **Local Storage Filesystem (`/storage/deliverables/`)**:
   - **Boundary**: Local POSIX filesystem on host server with restricted read/write permissions (`0640`).
   - **Purpose**: Stores binary deliverable uploads (ZIP, PDF, images).
   - **Security**: Uploaded files are addressed by unique UUIDs, avoiding path traversal vulnerabilities.
