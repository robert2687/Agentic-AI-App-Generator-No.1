Agentic app builder architecture blueprint
You’re not just shipping code; you’re building a repeatable system that outputs production-ready apps with zero ambiguity. Here’s a complete blueprint with text-based diagrams, explicit schemas, API contracts, and a security model—optimized for reproducibility, auditability, and instant onboarding.
System overview
Core purpose: Orchestrate multi-agent stages (Planner → Architect → Visual Designer → Coder → Reviewer → Patcher → Deployer) to generate, validate, patch, and ship full-stack apps with deterministic artifacts.
Key guarantees: Explicit artifact paths, versioning, immutable audit logs, RBAC gates, and one-command environment scaffolding.
Runtime stack: React-based IDE UI, Node/Express Orchestrator, isolated Agent containers on Cloud Run, Firestore for metadata/RBAC/audit, Cloud Storage for artifacts/logs, Pub/Sub for stage dispatch, GitHub Actions for CI/CD.
Architecture diagrams (text-based)
```text
+--------------------------------------------------------------------+
|                          Agentic App Builder                        |
+--------------------------------------------------------------------+
|  UI/IDE Layer                                                      |
|  - React (Monaco) workspace                                        |
|  - Stage dashboards, diffs, approvals                              |
|  - Artifact explorer & runbooks                                    |
+--------------------------------------------------------------------+
|  Orchestrator API (Node/Express)                                   |
|  - Route layer (JWT + RBAC)                                        |
|  - Workflow engine (DAG stages, gates)                             |
|  - Job queue (Pub/Sub)                                             |
|  - Artifact registry (Cloud Storage + Firestore index)             |
|  - Audit logger (immutable events)                                 |
+--------------------------------------------------------------------+
|  Agent Runners (Cloud Run containers)                              |
|  - Planner | Architect | Visual Designer | Coder | Reviewer         |
|  - Patcher | Deployer                                               |
|  - Least-privilege, per-stage write scopes                         |
+--------------------------------------------------------------------+
|  Data & Infra                                                      |
|  - Firestore (projects, workflows, artifacts, audit, RBAC)         |
|  - Cloud Storage (artifacts, logs, manifests)                      |
|  - Pub/Sub (stage jobs, DLQs)                                      |
|  - Cloudflare (WAF, rate limits)                                   |
|  - GitHub Actions (CI/CD)                                          |
+--------------------------------------------------------------------+
```
```text
Sequence: Workflow run (happy path)

User -> UI -> Orchestrator: Create workflow (projectId, stages)
Orchestrator -> Firestore: Persist workflow + traceId
Orchestrator -> Pub/Sub: Enqueue Planner(job)
Agent(Planner) -> Storage: Write plan-v001.yaml + logs + hash
Agent(Planner) -> Firestore: Record artifact + stage status
Orchestrator -> Pub/Sub: Enqueue Architect(job)
Agent(Architect) -> Storage: Write blueprint, schemas, contracts
Agent(Architect) -> Firestore: Record artifacts
... (Visual Designer -> Coder -> Reviewer)
User(Approver) -> Orchestrator: Approve Reviewer gate
Orchestrator -> Pub/Sub: Enqueue Patcher(job) -> Deployer(job)
Deployer -> Cloud Run/GitHub: Release + deploy-report.md
```
```text
Deployment topology

[Internet] -> [Cloudflare WAF+RateLimit] -> [Cloud Run: Orchestrator API]
                                               |
                                               v
                                          [Pub/Sub]
                                               |
                     +-------------------------+-------------------------+
                     v                                                   v
           [Cloud Run: Agents]                                   [Cloud Run: Deployer]
                     |                                                   |
                     v                                                   v
       [Cloud Storage: Artifacts/Logs]                          [GitHub Actions + Cloud Run]
                     |
                     v
                [Firestore: Metadata/RBAC/Audit]
```
Data model and schemas
Firestore collections
```yaml
projects:
  - id: string
  - name: string
  - ownerUserId: string
  - repoUrl: string
  - createdAt: timestamp
  - status: enum[active, archived]

workflows:
  - id: string
  - projectId: ref(projects)
  - traceId: string
  - status: enum[pending, running, blocked, completed, failed]
  - stages: map {
      planner: {status, version, artifactPaths[], startedAt, completedAt}
      architect: {...}
      visualDesigner: {...}
      coder: {...}
      reviewer: {...}
      patcher: {...}
      deployer: {...}
    }
  - createdAt: timestamp
  - updatedAt: timestamp

artifacts:
  - id: string
  - projectId: ref(projects)
  - workflowId: ref(workflows)
  - stage: enum[planner, architect, visualDesigner, coder, reviewer, patcher, deployer]
  - version: number
  - path: string            # gs://bucket/...
  - sha256: string
  - sizeBytes: number
  - contentType: string
  - labels: map
  - createdAt: timestamp

auditLogs:
  - id: string
  - traceId: string
  - actorUserId: string | system
  - action: string         # STAGE_START, ARTIFACT_WRITE, REVIEW_APPROVE, DEPLOY_RELEASE
  - resourceType: string   # project|workflow|artifact|release
  - resourceId: string
  - timestamp: timestamp
  - metadata: map          # ip, roles, stage, version, hashes

users:
  - id: string
  - email: string
  - displayName: string
  - roles: array           # admin|maintainer|reviewer|operator|viewer
  - createdAt: timestamp

permissions:
  - id: string
  - role: string
  - grants: array          # project.manage, workflow.run, stage.approve, artifact.read, deploy.execute
```
Artifact manifest (stored in repo and Storage)
```json
{
  "workflowId": "wf_456",
  "traceId": "tr_789",
  "createdAt": "2025-10-01T20:00:00Z",
  "items": [
    {
      "stage": "planner",
      "version": 1,
      "path": "workflows/planner/outputs/plan-v001.yaml",
      "sha256": "b3e...",
      "sizeBytes": 1423,
      "labels": { "feature": "core" }
    }
  ]
}
```
App data schema (example Firestore subcollections for builder apps)
```yaml
apps:
  - id: string
  - projectId: ref(projects)
  - name: string
  - status: enum[draft, active, archived]
  - createdAt: timestamp
  - updatedAt: timestamp

apps/{appId}/components:
  - id: string
  - type: string           # Page|Section|Widget
  - props: map
  - tokensRef: ref(designTokens)
  - version: number
  - createdAt: timestamp

designTokens:
  - id: string
  - projectId: ref(projects)
  - name: string
  - tokens: map            # color, spacing, typography
  - version: number
  - createdAt: timestamp
```
API contracts
Conventions
Base path: /api/v1
Headers: Authorization: Bearer <JWT>, X-Trace-Id optional (server generates if missing)
Errors: { error: { code, message, details[] }, traceId }
Workflows
Create workflow: POST /api/v1/workflows Request:
```json
{ "projectId": "proj_123", "stages": ["planner","architect","visualDesigner","coder","reviewer","patcher","deployer"] }
```
Response:
```json
{ "workflowId": "wf_456", "traceId": "tr_789", "status": "pending" }
```

Start workflow: POST /api/v1/workflows/{workflowId}/start Response:
```json
{ "workflowId": "wf_456", "status": "running", "startedAt": "2025-10-01T20:01:00Z" }
```

Get workflow: GET /api/v1/workflows/{workflowId} Response:
```json
{
  "workflowId": "wf_456",
  "traceId": "tr_789",
  "status": "running",
  "stages": {
    "planner": {"status":"completed","version":1,"artifactPaths":["workflows/planner/outputs/plan-v001.yaml"]},
    "architect": {"status":"queued"}
  }
}
```

Stages
Run stage: POST /api/v1/workflows/{workflowId}/stages/{stage}/run Response:
```json
{ "stage": "architect", "status": "queued", "jobId": "job_001" }
```

Approve stage: POST /api/v1/workflows/{workflowId}/stages/{stage}/approve Response:
```json
{ "stage": "reviewer", "status": "approved", "approvedBy": "user_123", "approvedAt": "2025-10-01T20:05:00Z" }
```

List artifacts: GET /api/v1/workflows/{workflowId}/artifacts Response:
```json
[
  { "id":"art_1","stage":"planner","version":1,"path":"gs://bucket/workflows/planner/outputs/plan-v001.yaml","sha256":"..." }
]
```

RBAC
Current user: GET /api/v1/me Response:
```json
{ "id":"user_123","email":"user@example.com","roles":["maintainer","reviewer"] }
```

Assign role: POST /api/v1/projects/{projectId}/roles Request:
```json
{ "userId":"user_456","role":"reviewer" }
```
Response:
```json
{ "projectId":"proj_123","userId":"user_456","role":"reviewer","status":"granted" }
```

Security model
Authentication:
Method: OAuth 2.0 / Google Identity Platform with JWT validation (audience, issuer, expiry).
Agent tokens: Short-lived service tokens via Workload Identity; no long-lived secrets in containers.
Authorization (RBAC):
Roles: admin, maintainer, reviewer, operator, viewer.
Grants: project.manage, workflow.run, stage.approve, artifact.read, deploy.execute..
Policies: Per-route checks; stage gates require reviewer or maintainer approval.
Isolation:
Containers: One agent per container, least privilege, outbound egress restricted.
Write scopes: Agents can write only to their stage-specific Storage paths; signed URLs for uploads.
Rate limiting and edge protection:
Limits: Per-IP and per-user (e.g., 60 req/min) enforced at CDN and API layers.
WAF: Block common attack vectors; bot mitigation at edge.
Auditability:
Immutable logs: Append-only audit logs with chained hashes per traceId.
Coverage: Auth events, stage lifecycle, artifact writes, approvals, deploy actions.
Secrets management:
Storage: Secret Manager; injected via env at deploy; never in Firestore or repo.
Rotation: Automated rotation with alarms and revocation procedures.
Repository layout and artifact paths
```text
repo-root/
  .env.example
  package.json
  Dockerfile
  README.md
  docs/
    architecture.md
    diagrams/
      component.txt
      sequence.txt
      deployment.txt
  apps/
    web/
      src/
      public/
      package.json
    server/
      src/
      package.json
  workflows/
    manifest.json
    planner/
      outputs/plan-v001.yaml
      logs/run-2025-10-01T20-01Z.log
      meta/hash.txt
    architect/
      outputs/blueprint-v001.md
      diagrams/component.txt
      diagrams/sequence.txt
      diagrams/deployment.txt
      schema/firestore-v001.yaml
      api/contracts-v001.yaml
      logs/run-*.log
    visual-designer/
      outputs/ui-spec-v001.md
      assets/tokens.json
    coder/
      diffs/diff-v001.patch
      outputs/codegen-report.md
      logs/run-*.log
    reviewer/
      outputs/review-v001.md
      checks/lint.json
      checks/tests.json
    patcher/
      diffs/patch-v001.patch
      outputs/changelog.md
    deployer/
      outputs/deploy-report.md
      logs/deploy-*.log
  ci/
    github/
      workflows/ci.yml
      workflows/release.yml
  scripts/
    dev.sh
    run.sh
    deploy.sh
```
Artifact invariants:
Versioning: Monotonic counters per stage (v001, v002…).
Integrity: SHA256 captured in workflows/<stage>/meta/hash.txt and indexed in Firestore.
Manifest: workflows/manifest.json ties all artifacts to a shared traceId.
CI/CD and environment scaffolding
CI pipeline:
Build/test: Node 20, npm ci, lint, tests, build.
Artifacts: Upload stage logs and manifests for reproducibility.
Release: Tag-based container builds; deploy to Cloud Run; attach manifests to GitHub releases.
.env.example:
```Kód
APP_ENV=development
FIRESTORE_PROJECT_ID=your-project
STORAGE_BUCKET=your-bucket
PUBSUB_TOPIC=agent-jobs
JWT_AUDIENCE=agentic-app-builder
JWT_ISSUER=https://secure.token.issuer
RATE_LIMIT_PER_MINUTE=60
CLOUD_RUN_REGION=europe-west1
```
One-command scripts:
dev.sh: Start local emulators, web, server.
run.sh: Launch orchestrator and run sample workflow.
deploy.sh: Build containers and deploy to Cloud Run.
Stage specifications
Planner
Inputs: Requirements brief, constraints, target stack.
Outputs: plan-vNNN.yaml with milestones, user stories, acceptance criteria.
Architect
Inputs: Planner plan, security and infra policies.
Outputs: blueprint-vNNN.md, diagrams/*.txt, schema/firestore-vNNN.yaml, api/contracts-vNNN.yaml.
Visual designer
Outputs: ui-spec-vNNN.md, assets/tokens.json, component mapping to the chosen UI library.
Coder
Outputs: diffs/diff-vNNN.patch applying changes to apps/web and apps/server, codegen-report.md with file lists.
Reviewer
Outputs: review-vNNN.md with findings and severities, checks/lint.json, checks/tests.json.
Patcher
Outputs: patch-vNNN.patch addressing reviewer items, changelog.md..
Deployer
Outputs: deploy-report.md with environment, versions, rollout status, links to release artifacts.
Next steps
Confirm constraints: Target region, artifact retention policy, rate limit thresholds, required roles.
Generate scaffold: I can emit the GitHub-ready repo with package.json, Dockerfile, .env.example, CI workflows, and a minimal running app.
Wire secrets: Share your Secret Manager keys and CI environment needs; I’ll produce ready-to-run configs.