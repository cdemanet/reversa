> Local copy of the consultive catalog. The canonical source is in `templates/migration/catalogs/paradigm_catalog.md`.
> This copy is installed with the agent so it can access the catalog within the user's project, without depending on the npm package location.

# Paradigm Catalog (local copy)

## Paradigm Catalog

### Procedural
- **Characteristics**: top-level functions, linear flow in controllers, absence of classes or ornamental use, data as dicts/structs, open side effects.
- **Legacy examples**: classic PHP scripts, COBOL batch, pre-OO Perl systems, shell scripts.
- **Signals in `_reversa_sdd/`**: domain described as "functions", linear flows in `process_flows`, absence of explicit aggregates.

### Classical OO
- **Characteristics**: class hierarchy, strong inheritance, Active Record pattern, logic coupled to models.
- **Legacy examples**: monolithic Rails, traditional Django, pre-DI Java EE, classic .NET WebForms.
- **Signals in `_reversa_sdd/`**: classes with broad responsibilities, inheritance in domain model, anemic controllers calling model methods.

### OO with DI
- **Characteristics**: injection containers, explicit interfaces, Repository / Service pattern, clear layer separation.
- **Legacy examples**: modern Spring, .NET 6+, NestJS, modern Symfony.
- **Signals in `_reversa_sdd/`**: explicit aggregates, repository interfaces, absence of Active Record.

### Functional
- **Characteristics**: dominant immutability, pure functions, composition, absence of implicit side effects, rich typing.
- **Legacy examples**: Haskell, Elm, F#, functional Scala, Clojure.
- **Signals in `_reversa_sdd/`**: algebraic types, absence of classes, flow expressed as composition.

### Event-driven (async)
- **Characteristics**: queues / topics, decoupled handlers, absence of linear flow, eventual consistency, explicit idempotency.
- **Legacy examples**: modern Node backend oriented to queue, heavy SQS / Kafka systems, async microservices.
- **Signals in `_reversa_sdd/`**: events in the domain model, integrations via queue, long-running processes with retry.

### Actor model
- **Characteristics**: isolated actors with mailbox, supervision, state isolation.
- **Legacy examples**: Erlang / Elixir / OTP, Akka.
- **Signals in `_reversa_sdd/`**: supervised processes, messages between actors.

### Dataflow
- **Characteristics**: declarative pipelines, in-flow transformations, absence of imperative loops in the domain.
- **Legacy examples**: classic ETLs, Spark, Flink.
- **Signals in `_reversa_sdd/`**: DAG description, stage-based transformations.

## Stack → natural paradigm mapping

| Target stack | Natural paradigm | Viable alternatives | Notes |
|---|---|---|---|
| Node.js 20 (Fastify, Express, NestJS) | async event-driven | OO with DI (NestJS), light functional | async-first runtime; heavy CPU blocking goes to worker threads |
| Go (net/http, Echo, Fiber) | CSP / goroutines (light event-driven) | structured procedural | concurrency via channels; simulated OO via interfaces |
| Rust (axum, Actix, tokio) | ownership / async functional | event-driven | default immutability, safety via types |
| Elixir / Phoenix | actor model (BEAM) | functional | supervision via OTP |
| Modern Python (FastAPI, Django 5) | OO with DI or rich procedural | event-driven (Celery, asyncio) | choice depends on the framework |
| Kotlin (Spring Boot, Ktor) | OO with DI | event-driven (Reactor) | coroutines enable ergonomic async |
| .NET 8 (ASP.NET Core, Minimal API) | OO with DI | event-driven (Channels, MediatR) | OO tradition + first-class async |
| Modern Java (Spring Boot 3, Quarkus) | OO with DI | event-driven (Project Reactor) | functional libraries possible but not dominant |
| Modern Ruby (Rails 7, Hanami) | Classical OO (Rails) or OO with DI (Hanami) | light functional (dry-rb) | Rails dictates Active Record; Hanami is DI-heavy |
| TypeScript serverless (AWS Lambda, Cloudflare Workers) | event-driven | functional | event invocation; cold start influences design |

## Typical gaps table by pair

| From → To | Main gap | Concrete implications |
|---|---|---|
| procedural → event-driven | sync → async | response stops being immediate; error handling becomes retry/DLQ; idempotency mandatory; event order starts to matter |
| procedural → OO with DI | data as dict → aggregates | invariants live inside aggregates; logic stops living in controllers; dependencies via interfaces |
| procedural → functional | open side effects → pure + isolated | mutability becomes the exception; composition replaces sequence; algebraic types for states |
| classical OO → event-driven | sync flow → choreography | actions stop being atomic; distributed transactions become sagas; strong consistency → eventual |
| classical OO → OO with DI | inheritance → composition via interfaces | Active Record disappears; persistence becomes repository; tests gain natural mocks |
| classical OO → functional | mutable encapsulation → immutability | methods with effect become pure functions + explicit update; state expressed as a sequence of transformations |
| OO with DI → event-driven | sync command → event | return stops being immediate; orchestration becomes choreography; order by key |
| OO with DI → functional | mocks → testable composition | DI stops being by interface, becomes by function argument |
| functional → event-driven | sync composition → messaging | latency increases; failure becomes DLQ message; distributed state |
| event-driven → synchronous procedural | unnatural; only makes sense for small systems | collapse handlers into direct calls; loss of decoupling; strong consistency returns |
| dataflow → event-driven | declarative DAG → mutable choreography | control becomes less predictable; order must be guaranteed by key |
| actor model → OO with DI | messages between actors → sync calls | loss of failure isolation; supervision must become try/catch or orchestrated retry |
