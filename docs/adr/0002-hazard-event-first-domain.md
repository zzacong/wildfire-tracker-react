# 0002 - Hazard-event-first domain

The product is a *wildfire* tracker, but the domain model is built around a generic **Hazard Event** with a **Kind** (wildfire today, others later). `CONTEXT.md` is the glossary.

A future reader will wonder why a wildfire app has a "kind filter" and a generic event vocabulary. The reason: the EONET source already returns all hazard categories, and the user wants the option to enable floods, earthquakes, etc. later. Modeling the generic concept now — types, filters, normalization — costs little and keeps every category cheap to switch on. Cost of reversing later (a domain refactor) is real, so this is deliberate.
