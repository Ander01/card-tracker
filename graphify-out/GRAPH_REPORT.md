# Graph Report - card-tracker  (2026-10-14)

## Corpus Check
- 68 files · ~88,371 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 4 file(s) not represented in the graph (top: (none) 3, .css 1)

## Summary
- 314 nodes · 330 edges · 44 communities (23 shown, 21 thin omitted)
- Extraction: 91% EXTRACTED · 9% INFERRED · 0% AMBIGUOUS · INFERRED: 31 edges (avg confidence: 0.89)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Application Tests
- Runtime Configuration
- Claude OpenSpec Skills
- OpenSpec Concepts
- TypeScript Compiler
- GitHub OpenSpec Prompts
- Card Tracker Design
- Development Dependencies
- Archive Synchronization
- Claude Apply Workflow
- OpenCode Sync Workflow
- Application Architecture
- Product Requirements
- Claude Archive Workflow
- OpenCode Proposal Workflow
- Storage Test Doubles
- GitHub Archive Prompts
- Collection Requirements
- Binder Suggestions
- Card Validation
- Collection Browsing
- OpenCode Exploration
- OpenSpec Configuration
- Claude Exploration
- Change Artifact Updates
- OpenCode Apply Workflow
- GitHub Exploration Prompts
- Repository Workflow
- Exploration Artifacts
- Update Reconciliation
- Product Purpose
- TypeScript Branding
- Copilot Instructions
- Project Checks
- Store Selection
- Schema Configuration
- Bluesky Icon
- Discord Icon
- Documentation Icon
- GitHub Icon
- Social Icons
- X Icon
- Vite Branding

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 17 edges
2. `OpenSpec Propose Skill` - 9 edges
3. `scripts` - 8 edges
4. `App()` - 8 edges
5. `vitest` - 7 edges
6. `Card` - 7 edges
7. `StorageMock` - 7 edges
8. `OpenSpec Archive Change` - 6 edges
9. `OpenSpec Sync Specs Skill` - 6 edges
10. `suggestBinderOrder()` - 5 edges

## Surprising Connections (you probably didn't know these)
- `Layered Card Illustration` --semantically_similar_to--> `Personal Pokémon Card Collection`  [INFERRED] [semantically similar]
  src/assets/hero.png → openspec/specs/collection-management/spec.md
- `Local-first first release` --semantically_similar_to--> `Local-first web app`  [INFERRED] [semantically similar]
  openspec/changes/archive/2026-10-14-greenfield-card-tracker-app/proposal.md → README.md
- `Collection management` --semantically_similar_to--> `Pokemon card collection`  [INFERRED] [semantically similar]
  openspec/changes/archive/2026-10-14-greenfield-card-tracker-app/design.md → README.md
- `Binder suggestions` --semantically_similar_to--> `Themed binder layouts`  [INFERRED] [semantically similar]
  openspec/changes/archive/2026-10-14-greenfield-card-tracker-app/design.md → README.md
- `Browser local storage persistence` --semantically_similar_to--> `Browser local storage`  [INFERRED] [semantically similar]
  openspec/changes/archive/2026-10-14-greenfield-card-tracker-app/design.md → README.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **OpenSpec Lifecycle Workflows** — _claude_commands_opsx_explore_explore_mode, _claude_commands_opsx_propose_propose_workflow, _claude_commands_opsx_apply_apply_workflow, _claude_commands_opsx_archive_archive_workflow [EXTRACTED 1.00]
- **Specification Maintenance Workflows** — _claude_commands_opsx_sync_sync_workflow, _claude_commands_opsx_update_update_workflow, _claude_commands_opsx_archive_delta_spec_sync [EXTRACTED 1.00]
- **OpenSpec Change Lifecycle** — _claude_skills_openspec_explore_skill_openspec_explore_mode, _claude_skills_openspec_propose_skill_openspec_propose_change, _github_prompts_opsx_apply_prompt_apply_openspec_change, _claude_skills_openspec_archive_change_skill_openspec_archive_change [INFERRED 0.85]
- **OpenSpec Spec Maintenance** — _claude_skills_openspec_update_change_skill_update_change_artifacts, _claude_skills_openspec_sync_specs_skill_sync_delta_specs, _claude_skills_openspec_archive_change_skill_delta_spec_sync [INFERRED 0.85]
- **OpenSpec change lifecycle** — github_prompts_opsx_explore_prompt_planning_change, github_prompts_opsx_propose_prompt_planning_boundary, github_skills_openspec_apply_change_skill_implement_tasks, github_prompts_opsx_archive_prompt_archive_completed_change [EXTRACTED 1.00]
- **OpenSpec artifact management** — github_prompts_opsx_propose_prompt_proposal_artifact, github_prompts_opsx_propose_prompt_spec_artifact, github_prompts_opsx_propose_prompt_design_artifact, github_prompts_opsx_propose_prompt_tasks_artifact, github_prompts_opsx_update_prompt_reconcile_artifacts [EXTRACTED 1.00]
- **OpenSpec specification synchronization** — github_prompts_opsx_sync_prompt_delta_spec, github_prompts_opsx_sync_prompt_main_spec, github_prompts_opsx_sync_prompt_intelligent_merge, github_prompts_opsx_sync_prompt_validate_specs, github_prompts_opsx_archive_prompt_delta_spec_sync [EXTRACTED 1.00]
- **OpenSpec Change Lifecycle** — github_skills_openspec_explore_skill_openspecexplore, github_skills_openspec_propose_skill_openspecpropose, opencode_commands_opsx_apply, opencode_commands_opsx_archive [INFERRED 0.85]
- **Spec-Driven Planning Artifacts** — concept_proposalmd, concept_designmd, concept_tasksmd, concept_delta_specs, concept_main_specs [EXTRACTED 1.00]
- **Spec Sync and Validation Flow** — concept_delta_specs, concept_main_specs, concept_semantic_merge, concept_openspec_validate [EXTRACTED 1.00]
- **OpenSpec change lifecycle** — _opencode_commands_opsx_propose_opsx_propose, _opencode_skills_openspec_apply_change_openspec_apply_change, _opencode_skills_openspec_archive_change_openspec_archive_change [INFERRED 0.85]
- **Specification artifact reconciliation flow** — _opencode_commands_opsx_update_artifact_reconciliation, _opencode_commands_opsx_sync_intelligent_merge, _opencode_skills_openspec_propose_artifact_dependency_order [INFERRED 0.75]
- **Exploration to change capture** — _opencode_skills_openspec_explore_context_discovery, _opencode_skills_openspec_explore_change_capture, _opencode_skills_openspec_propose_change_creation [INFERRED 0.85]
- **Local-first collection architecture** — readme_card_tracker, readme_local_first_web_app, _openspec_changes_archive_2026_10_14_greenfield_card_tracker_app_design_storage_boundary, _openspec_changes_archive_2026_10_14_greenfield_card_tracker_app_design_local_storage [EXTRACTED 1.00]
- **Card Tracker feature capabilities** — _openspec_changes_archive_2026_10_14_greenfield_card_tracker_app_proposal_collection_management_capability, _openspec_changes_archive_2026_10_14_greenfield_card_tracker_app_proposal_binder_order_suggestions_capability, _openspec_changes_archive_2026_10_14_greenfield_card_tracker_app_proposal_card_tracker_app_shell_capability [EXTRACTED 1.00]
- **Frontend foundation stack** — _openspec_changes_archive_2026_10_14_greenfield_card_tracker_app_design_react, _openspec_changes_archive_2026_10_14_greenfield_card_tracker_app_design_vite, _openspec_changes_archive_2026_10_14_greenfield_card_tracker_app_design_typescript, index_html_vite_entry [EXTRACTED 1.00]
- **Collection to Binder Suggestion Flow** — openspec_changes_archive_2026_10_14_greenfield_card_tracker_app_specs_collection_management_spec_add_card, openspec_changes_archive_2026_10_14_greenfield_card_tracker_app_specs_collection_management_spec_browse_collection, openspec_changes_archive_2026_10_14_greenfield_card_tracker_app_specs_binder_order_suggestions_spec_theme, openspec_changes_archive_2026_10_14_greenfield_card_tracker_app_specs_binder_order_suggestions_spec_ordered_layout [INFERRED 0.85]
- **Local-First Card Tracker Experience** — openspec_changes_archive_2026_10_14_greenfield_card_tracker_app_specs_card_tracker_app_shell_spec_offline_use, openspec_changes_archive_2026_10_14_greenfield_card_tracker_app_specs_collection_management_spec_local_persistence, openspec_changes_archive_2026_10_14_greenfield_card_tracker_app_specs_card_tracker_app_shell_spec_navigation [INFERRED 0.85]
- **Collection Management Capabilities** — openspec_specs_collection_management_spec_add_card, openspec_specs_collection_management_spec_browse_collection, openspec_specs_collection_management_spec_search_and_filter, openspec_specs_collection_management_spec_local_persistence [EXTRACTED 1.00]

## Communities (44 total, 21 thin omitted)

### Community 0 - "Application Tests"
Cohesion: 0.10
Nodes (26): @testing-library/jest-dom, @testing-library/react, vitest, vitest-axe, App(), generateSuggestion(), initialCard, storage (+18 more)

### Community 1 - "Runtime Configuration"
Cohesion: 0.07
Nodes (25): dependencies, react, react-dom, name, private, scripts, build, dev (+17 more)

### Community 2 - "Claude OpenSpec Skills"
Cohesion: 0.08
Nodes (21): Archive Completion Checks, Archive Directory, Delta Spec Sync, OpenSpec Archive Change, Capture Exploration Artifacts, Context Discovery, OpenSpec Awareness, OpenSpec Explore Mode (+13 more)

### Community 3 - "OpenSpec Concepts"
Cohesion: 0.13
Nodes (15): Apply Tasks, design.md, Implementation Workflow, openspec context, openspec instructions, openspec new change, openspec status, proposal.md (+7 more)

### Community 4 - "TypeScript Compiler"
Cohesion: 0.11
Nodes (18): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+10 more)

### Community 5 - "GitHub OpenSpec Prompts"
Cohesion: 0.13
Nodes (17): Artifact dependency order, Design artifact, Proposal artifact, Spec artifact, Tasks artifact, Spec delta, Intelligent spec merge, Main specification (+9 more)

### Community 6 - "Card Tracker Design"
Cohesion: 0.14
Nodes (12): Binder suggestions, Collection management, Future IndexedDB or API migration, Browser local storage persistence, Binder-order suggestions capability, Collection management capability, Themed binder layouts, Browser local storage (+4 more)

### Community 7 - "Development Dependencies"
Cohesion: 0.15
Nodes (13): devDependencies, axe-core, jsdom, @testing-library/jest-dom, @testing-library/react, @testing-library/user-event, @types/react, @types/react-dom (+5 more)

### Community 8 - "Archive Synchronization"
Cohesion: 0.25
Nodes (10): Archive Spec Sync, Change Archive, Delta Specs, Main Specs, openspec validate, Requirements, Scenarios, Task Completion Status (+2 more)

### Community 9 - "Claude Apply Workflow"
Cohesion: 0.22
Nodes (7): OPSX Apply Workflow, Change Selection, Apply Instruction Loading, Planning Artifacts, OPSX Propose Workflow, Implementation Guardrails, OpenSpec Apply Change Skill

### Community 10 - "OpenCode Sync Workflow"
Cohesion: 0.22
Nodes (8): Delta specification, Main specification, /opsx-sync command, Artifact reconciliation, /opsx-update command, Archive completion checks, Archive delta synchronization, openspec-archive-change skill

### Community 11 - "Application Architecture"
Cohesion: 0.25
Nodes (8): Responsive accessible interface, React, TypeScript, Vite, Card Tracker app shell capability, Card Tracker app shell, Responsive viewport configuration, Vite TypeScript entrypoint

### Community 12 - "Product Requirements"
Cohesion: 0.25
Nodes (6): Core Experiences Navigation, Add Card to Collection, Browse Collection, Search and Filter Cards, Collection Domain and Persistence, Integration and Delivery Checks

### Community 13 - "Claude Archive Workflow"
Cohesion: 0.29
Nodes (5): OPSX Archive Workflow, Archive Completion Checks, Delta Specification Sync, Intelligent Specification Merge, OPSX Sync Workflow

### Community 14 - "OpenCode Proposal Workflow"
Cohesion: 0.29
Nodes (6): Proposal artifact generation, /opsx-propose command, Project context loading, Artifact dependency order, Change creation, openspec-propose skill

### Community 16 - "GitHub Archive Prompts"
Cohesion: 0.33
Nodes (6): Archive completed change, Archive directory, Artifact completion status, Change selection, Delta spec sync assessment, Task completion status

### Community 17 - "Collection Requirements"
Cohesion: 0.33
Nodes (5): Themed Binder Organization, Collection Management Specification, Persistence Across Page Reload, Personal Pokémon Card Collection, Layered Card Illustration

### Community 18 - "Binder Suggestions"
Cohesion: 0.40
Nodes (5): Incomplete Collection Metadata, Ordered Binder Layout, Binder Suggestion Theme, Binder Suggestion Experience, Binder Suggestion Theme

### Community 19 - "Card Validation"
Cohesion: 0.40
Nodes (3): Card Collection Metadata, Card Name, Valid Quantity

### Community 20 - "Collection Browsing"
Cohesion: 0.40
Nodes (3): Collection View, Empty Collection State, Metadata Filters

### Community 21 - "OpenCode Exploration"
Cohesion: 0.50
Nodes (3): Change artifact capture, Context discovery, openspec-explore skill

### Community 22 - "OpenSpec Configuration"
Cohesion: 0.50
Nodes (3): OpenSpec sync specs workflow, OpenSpec update change workflow, Spec-driven change

### Community 25 - "OpenCode Apply Workflow"
Cohesion: 0.67
Nodes (3): openspec-apply-change skill, Task implementation loop, Task status tracking

## Knowledge Gaps
- **94 isolated node(s):** `@testing-library/user-event`, `@types/react`, `@types/react-dom`, `axe-core`, `jsdom` (+89 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 175 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **21 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `vitest` connect `Application Tests` to `Runtime Configuration`?**
  _High betweenness centrality (0.021) - this node is a cross-community bridge._
- **What connects `@testing-library/user-event`, `@types/react`, `@types/react-dom` to the rest of the system?**
  _94 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Application Tests` be split into smaller, more focused modules?**
  _Cohesion score 0.09957325746799431 - nodes in this community are weakly interconnected._
- **Why does `devDependencies` connect `Development Dependencies` to `Runtime Configuration`?**
  _High betweenness centrality (0.020) - this node is a cross-community bridge._
- **Should `Runtime Configuration` be split into smaller, more focused modules?**
  _Cohesion score 0.07389162561576355 - nodes in this community are weakly interconnected._
- **Why does `react` connect `Runtime Configuration` to `Application Tests`?**
  _High betweenness centrality (0.012) - this node is a cross-community bridge._
- **Should `Claude OpenSpec Skills` be split into smaller, more focused modules?**
  _Cohesion score 0.08 - nodes in this community are weakly interconnected._