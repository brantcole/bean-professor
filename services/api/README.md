# API scaffold

Phase 1 contains only a typed, versioned guide-service contract. There is no HTTP listener, database client, AI adapter, or secret requirement. The mobile preview uses pure local mocks from `packages/domain`.

Later phases must introduce runtime request/response validation, authenticated ownership, rate/cost limits, cancellation, verified evidence and independent provider interfaces. Do not connect production or add credentials as part of the Phase 1 prototype.
