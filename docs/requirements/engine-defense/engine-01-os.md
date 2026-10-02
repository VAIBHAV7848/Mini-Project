# Engine 01 Defense — Operating Systems Engine

> **Student Owner**: Vaishnavi Modekar (Roll No: 21, SRN: `02FE24BCS060`)
> **Owning Engine**: Engine 01 — Escrow & State Scheduler
> **Academic Subject**: Operating Systems (Core CSE 4th/5th Semester)
> **Evaluation Phase**: Stage S1 Requirements Baseline (Gate 1)

---

## 1. Academic Subject & Curricular Alignment
- **Foundational Subject**: Operating Systems
- **Core Curricular Principles**:
  - Process lifecycle states and deterministic state transitions.
  - Concurrency control, mutual exclusion, and critical section protection.
  - Resource starvation prevention and watchdog timer interrupts.
  - Deterministic state scheduling and deadlock avoidance.

---

## 2. Problem Being Solved
In freelance escrow systems, uncoordinated state transitions cause severe financial anomalies:
1. **Race Conditions / Double Spending**: A client rapidly double-clicking "Deposit" or concurrent client/freelancer actions can lock or release funds twice if the balance state transition is not atomic.
2. **Review Starvation**: Clients frequently abandon submitted work, leaving freelancer funds frozen indefinitely in escrow without recourse.
3. **Illegal State Transitions**: Malicious or buggy clients attempting to bypass deliverable review and move a milestone directly from un-deposited to released.

---

## 3. Functional Requirements Owned
- **FR-01: Escrow Fund Locking**: System locks milestone funds upon deposit confirmation, deducting from client available balance and placing into milestone escrow state atomically.
- **FR-02: Milestone State Tracking**: Implements strict deterministic Finite State Machine (FSM) transitions:
  `AWAITING_DEPOSIT` $\rightarrow$ `FUNDED` $\rightarrow$ `IN_PROGRESS` $\rightarrow$ `UNDER_REVIEW` $\rightarrow$ `RELEASED` (or `DISPUTED`, `REFUNDED`, `REVIEW_TIMEOUT`).
- **FR-12: Contract Lifecycle Orchestration**: Coordinates multi-milestone contract lifecycle, guaranteeing sequential dependency and contract completion state transitions.

---

## 4. Core Concepts Demonstrated
1. **Finite State Machine (FSM) Engine**:
   - Explicitly defined allowable transitions.
   - Rejection of all illegal, out-of-order, or re-entrant transitions.
2. **Critical Section Protection & Mutual Exclusion**:
   - Escrow balance and milestone state treated as a shared critical resource.
   - Strict transactional atomicity preventing concurrent double-allocation.
3. **Timer-Driven Watchdogs**:
   - Timeout monitoring for submitted deliverables (e.g. 7-day client review deadline).
   - Autonomous transition to `REVIEW_TIMEOUT` to prevent freelancer starvation.

---

## 5. Why This Belongs to Operating Systems
Operating Systems fundamentally governs the allocation of scarce shared resources and manages entity lifecycles:
- A milestone lifecycle mirrors an OS process state diagram (`READY` $\rightarrow$ `RUNNING` $\rightarrow$ `BLOCKED` $\rightarrow$ `TERMINATED`).
- Escrow funds represent a shared critical section where multiple asynchronous events (client approvals, dispute triggers, timer expirations) contend for state updates.
- The review timeout watchdog implements the exact OS scheduling paradigm of timer-driven preemption to prevent indefinite thread/process blocking.

---

## 6. Expected Gate 1 Evidence
- **State Transition Matrix**: A complete tabular specification of all valid `(Current State, Action, Next State)` tuples.
- **Invalid Transition Rejection Rules**: Explicit catalog of prohibited transitions and corresponding rejection codes.
- **Watchdog Timeout Flowchart**: Visual model of milestone submission timestamps, elapsed time checks, and automated state transitions.
- **Requirements Traceability**: Forward mapping from Gate 0 Pain Point 3 (Delayed Client Review) to FR-01, FR-02, and UC-01, UC-02.

---

## 7. Likely Evaluator Questions & Exact Defenses

### Q1: "How is an escrow state machine related to Operating Systems? Isn't this just business logic?"
> **Defense**: "In Operating Systems, process scheduling is governed by an automaton with strict invariants: a process cannot transition from `BLOCKED` to `RUNNING` without passing through `READY`, and mutual exclusion is required to protect shared memory. Our Escrow FSM treats milestone states and balance pools as critical OS resources. An action like `RELEASE_FUNDS` is an atomic system call that alters the shared resource state under strict concurrency control. We apply OS synchronization and state-machine principles directly to financial workflow orchestration."

### Q2: "What happens if two concurrent requests attempt to fund or release the same milestone simultaneously?"
> **Defense**: "Under FR-01 and NFR-08, state transitions that mutate balances are wrapped in isolated atomic transactions. In SQLite, the single-writer transaction model guarantees serializability. If request A commits a state transition from `UNDER_REVIEW` to `RELEASED`, request B's concurrent attempt will fail the precondition check (`Current State == UNDER_REVIEW`) and be rejected with a state collision error, completely preventing double-release."

### Q3: "How will the 7-day review timeout be scheduled without a background OS daemon?"
> **Defense**: "In Stage S1, we have modeled the watchdog as an event-driven time check evaluated on state inspection or periodic scheduled invocation. When a milestone enters `UNDER_REVIEW`, its `submitted_at` timestamp is fixed. Any subsequent state query or system check compares `current_timestamp - submitted_at >= 7 days`. If true, the FSM transitions the milestone to `REVIEW_TIMEOUT`. In Stage S2, this will be implemented via lightweight scheduled jobs or lazy timestamp evaluation."

### Q4: "Can a client dispute a milestone after it has reached `RELEASED`?"
> **Defense**: "No. The FSM strictly defines `RELEASED` as a terminal state for that milestone. Allowable transitions to `DISPUTED` can only originate from `UNDER_REVIEW` or `REVIEW_TIMEOUT`. Any attempt to transition a `RELEASED` milestone to `DISPUTED` is flagged as an invalid state transition by FR-02 and rejected."
