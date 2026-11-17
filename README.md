# Metabolic Atlas

English UI prototype for a biochemistry classroom. No pathway diagrams or quantitative simulations are included yet.

## Run locally

Serve `dist` with any static HTTP server, for example `python -m http.server 4173 --directory dist`, then open http://localhost:4173.

## Interface

- 6 pathway modules, 18 core pathways and 13 extensions.
- Animal, plant and microbial cell/context selection.
- Search, collapsible modules, related-pathway navigation.
- Overview, Connections and Regulation views.
- Layer switches, details panel, presentation mode and responsive mobile navigation.
- Cell and pathway selections persist in browser local storage.

Cell choices are contextual labels, not verified pathway availability rules. Diagram panels are intentionally empty. Course chapter references are module-level. Data and interactions live in `dist/app.js`; styling in `dist/style.css`.
