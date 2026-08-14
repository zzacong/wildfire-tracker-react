# Wildfire Tracker

A web app that visualizes ongoing natural hazards on a world map. The product ships focused on wildfires but is architected around a generic hazard-event concept so other hazard kinds can be enabled later.

## Language

**Hazard Event**:
A reported occurrence of a natural hazard, at a location, at a time. The core entity of the app.
_Avoid_: Event, incident, occurrence

**Kind**:
The type of a hazard event — wildfire, flood, earthquake, volcano, severe storm, and so on. Determines how the event is visualized and described. EONET calls these "categories"; our canonical term is *Kind*.
_Avoid_: Category, type (when referring to a hazard)

**Wildfire**:
A kind of hazard event, the current focus of the product. A wildfire is ongoing while it is open; once contained and no longer reported it becomes closed.
_Avoid_: Fire (alone), blaze

**Status**:
Whether a hazard event is ongoing (open) or ended (closed). Derived from the source's close date — a missing close date means open.
_Avoid_: Active/contained/out (the source does not provide these)

**Geometry**:
The point location of a hazard event (lon/lat). Not all hazards report a precise point; an event without a usable geometry is hidden from the map.

**Area**:
The reported size of a wildfire, carried by the source as a magnitude with a unit (acres or hectares).
_Avoid_: Size (when it means area specifically)

**Source**:
The organization that reported a hazard event — EONET aggregates reports from agencies such as IRWIN and GDACS, each with a URL. The app links back to these.
_Avoid_: Provider, origin
