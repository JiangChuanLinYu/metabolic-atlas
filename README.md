# Metabolic Atlas

English UI for a biochemistry classroom with an interactive object-level import of the supplied PowerPoint metabolic diagram. Quantitative simulations are not included.

## Interactive source map

## Structures and regulation details

Click a mapped substance to view its structure and participating reactions. Click an enzyme or reaction to view regulation factors and context. Details include source slide references. There is no separate course browser; the sidebar has compound/enzyme and optional target query fields. Missing records show a short empty-state message. Source data and local slide images are retained for these details.

Select multiple pathways in the sidebar to retain their original colors while other objects turn grey. Shared objects stay highlighted while any owning pathway is selected. Click substances and reactions to open their details. Use the mouse wheel to zoom around the cursor, and hold Space while dragging with the left mouse button to pan. The toolbar also offers zoom, full-map and focus-selection controls. Select all includes all available pathways in the current cell context and remains active across cell switches and reloads. Changing to a different context automatically selects its newly available pathways. Manually toggling a pathway or clearing selection exits this mode. Grey object tooltips distinguish unselected pathways from pathways excluded by the current teaching context. Clear selection greys the pathways while keeping the cell background in its original colors. Selections persist in browser storage and are filtered on cell changes.

The November 23 source slide's 1053 objects were exported by PowerPoint as individual SVG files in `dist/assets/atlas`. Text, pictures and arrows retain source styling. `scripts/atlas-memberships.json` stores reviewed source object-ID memberships; `scripts/build-atlas.cjs` generates `dist/atlas-data.js`; `dist/atlas.js` controls highlighting. Re-export with `scripts/export-atlas.ps1 -Source <pptx-path>` on Windows with PowerPoint, then run `node scripts/build-atlas.cjs` and `node scripts/version-assets.cjs`. Source IDs must be reviewed if the deck is changed.

This is a source-faithful diagram, not a scientifically corrected or complete atlas. Original spelling, directions and embedded raster artwork are retained. The current drawing now includes the gluconeogenesis bypasses, glycogen synthesis, respiratory chain, lipid synthesis and nucleotide metabolism. Ketone metabolism and interorgan cycles retain partial-coverage notices. Unmapped pathways report that they are not drawn. Unclassified source objects remain grey. The anatomical background is the supplied reference, not a plant/bacterial compartment model. The updated map includes the urea cycle and its connections to amino acid metabolism. New bindings and course references are in `dist/map-update.js`; additional directed query edges and aliases are in `dist/route-update.js`. The source reuses some object IDs, so old bindings are explicitly removed before adding current bindings.

Check with `node --test tests/*.test.cjs`. Browser verification covered simultaneous glycolysis/gluconeogenesis highlighting, shared objects after deselection, and removal of gluconeogenesis on switching to skeletal muscle.

## Run locally

Serve `dist` with any static HTTP server, for example `python -m http.server 4173 --directory dist`, then open http://localhost:4173.

## Interface

- Collapsible pathway modules, including ethanol metabolism and the updated urea cycle.
- Animal, plant and microbial cell/context selection.
- Pathway search and a separate selected-pathway bar with select-all and clear actions.
- Interactive pathway map with substance and reaction details.
- Compact top toolbar and collapsible sidebar, with a large diagram viewport.
- Cell and pathway selections persist in browser local storage.

Cell choices filter navigation, search, counts, and selections using `dist/availability.js`. Switching context preserves an applicable selection or selects the first available core pathway. Saved selections are checked at startup. Data and interactions live in `dist/app.js`; styling in `dist/style.css`.

## Context rules and scope

- Animal profiles represent mammalian teaching contexts: no photosynthesis or glyoxylate cycle. Complete glucose-producing gluconeogenesis is offered for hepatocytes, renal cortex, and intestinal epithelium, not muscle (partial reactions/glyceroneogenesis are not this pathway).
- Photosynthetic plant profiles expose light reactions; C4 mesophyll and bundle sheath are distinguished for the Calvin cycle. C4 assimilation is accessible from both participating cells. Germinating seed and unspecified general plant profiles do not imply a photosynthetic cell.
- Named phototrophic microbes expose light reactions. Green sulfur bacteria are not assigned the Calvin cycle; yeast and E. coli are not assigned photosynthesis. Bacterial light reactions can be anoxygenic; future diagrams must respect this distinction.
- Cori and glucose–alanine cycles remain available for liver and skeletal muscle as interorgan participation, not complete intracellular cycles. Lipoprotein transport is treated as an animal physiology topic.
- This is an initial exclusion rule set, not a fully validated organism-by-pathway matrix. Unlisted pathways remain visible. Broad microbial labels and algal/plant glyoxylate activity require species, developmental-stage and growth-condition refinements. Visibility does not imply constitutive activity; absence from this teaching menu is not a universal biological absence claim.

References for the rules:
- Gluconeogenesis: https://www.ncbi.nlm.nih.gov/books/NBK544346/
- Glyoxylate pathway: https://bio.libretexts.org/Bookshelves/Biochemistry/Book%3A_Biochemistry_Free_and_Easy_%28Ahern_and_Rajagopal%29/06%3A_Metabolism_I_-_Oxidative_Reductive_Processes/6.06%3A_Glyoxylate_Pathway
- Photosynthesis: https://www.ncbi.nlm.nih.gov/books/NBK26819/
- Microbial photosynthesis: https://openstax.org/books/microbiology/pages/8-6-photosynthesis

Run regression checks with `node --test tests/availability.test.cjs`. These exercise rules and DOM event/render integration using a lightweight DOM stub; they do not replace visual browser testing.

## Compound and reaction query

The sidebar provides two fields. Enter a compound or enzyme (for example ATP or PFK-1) in the first field to view details. Fill the optional target field to find routes (for example G6P in the first field and Pyr in the second). The submit button changes between detail lookup and route search automatically. No separator syntax is required. Ambiguous abbreviations such as G3P require a choice. Single queries open the existing detail dialog. Paired queries enumerate directed simple paths in the curated main-substrate graph in dist/route-data.js, restricted to available pathways in the current cell context. Cofactors do not create shortcuts. Search results mark the union of mapped reaction objects, with individual route controls and links to enzyme details. Undrawn reactions remain visible in the result list.

This is reaction connectivity, not atom tracing, flux analysis, or proof of simultaneous biological feasibility; co-substrates and compartment transport must also be available. Only explicitly curated edges are searched. Enumeration stops at 200 results or 100,000 visited search states and reports incomplete results when truncated. It never claims an absent route is biologically impossible.

## November 23 map update

All 1053 layers are classified as a pathway object, the color cell background, or the source attribution. Original embedded background pixels are rendered directly, and picture placement follows current PowerPoint positions and rotations. The stage retains at least 800 pixels of pan space per side. Diagram images and browser scripts carry content hashes to avoid stale cached versions.

UCP1 thermogenesis is available in the brown adipocyte context. The aromatic amino acid synthesis branch is excluded from animal contexts. These teaching-context filters do not assert that the supplied drawing is a complete cell-specific flux model. Source summary arrows are labeled as multi-step reaction records in query results.

Validation: 30 automated checks plus browser interactions covering newly added enzyme queries, nucleotide paths, gluconeogenesis filtering, all-selection, clear-selection, detail navigation, cursor-anchored zoom, Space-drag panning, colored background, and all image loads.

PowerPoint downsamples embedded raster images during SVG export. `scripts/restore-source-images.ps1` restores the original PNG bytes from the source PPTX while preserving SVG transforms, clipping, and image viewport dimensions. The export script runs this step automatically. `source-images.json` records original-image hashes, verified by the image-quality regression test.

Animal contexts are limited to Hepatocyte, Skeletal Muscle Cell, Adipocyte and Brown Adipocyte. Selecting all follows cell changes immediately, including full selections saved by older versions.

## 在线发布与更新

网站地址：https://jiangchuanlinyu.github.io/metabolic-atlas/

GitHub Pages 使用 GitHub Actions 发布 `dist` 目录。`main` 分支中的网页、测试、脚本或部署配置发生更新时，会先运行测试，成功后再发布。也可在 Actions → Publish Metabolic Atlas → Run workflow 手动发布。

本地改好后，在仓库目录运行（每步成功后再执行下一步）：

```powershell
node scripts/version-assets.cjs
node --test tests/*.test.cjs
git add dist scripts tests .github README.md .gitignore
git commit -m "Update metabolic atlas"
git push origin main
```

推送后，在 https://github.com/JiangChuanLinYu/metabolic-atlas/actions 查看发布进度。绿色成功标记表示发布完成；同学刷新原来的网址即可。仅在本地保存文件不会更新在线页面。测试或部署失败时，上次成功发布的网站继续保留。

发布范围仅为 `dist`；本地临时文件 `tmp` 不进入仓库。未来添加网页文件时请使用相对资源路径，以兼容 `/metabolic-atlas/` 子路径。

Diagram semantics: 13 reviewed repeated-metabolite or cross-region schematic links are recorded separately in `scripts/atlas-memberships.json` (`referenceLinks`). They retain their source positions as muted visual references, have no pathway membership, and are excluded from reaction/molecule bindings and pointer interaction. Source shape 828 is the methylmalonyl-CoA to succinyl-CoA arrow, not ketogenesis. These classifications must be re-reviewed when source shape IDs change.
