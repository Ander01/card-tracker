# Contributing

This guide describes the normal path for changing Card Tracker. The repository is a local-first React/Vite/TypeScript application, and product changes are planned with OpenSpec before implementation.

## Start here

1. Create or update a feature branch from the current integration branch.
2. Read the [architecture guide](docs/architecture.md) to find the relevant source, tests, durable specification, and Graphify neighborhood.
3. Run `npm install` and confirm the baseline with `npm test`, `npm run typecheck`, and `npm run build`.
4. Use the OpenSpec workflow for behavior changes. Documentation-only or tooling-only changes may opt out of capability specs when they do not change product behavior.

## Branch workflow

Use the repository's three-level flow:

```text
feature/<focused-change>
          |
          v
       develop
          |
          v
         main
```

- `main` is the stable branch.
- `develop` is the integration branch.
- `feature/*` branches contain focused work and should start from `develop`.

Keep a branch focused on one coherent change. Do not mix unrelated cleanup into a feature branch. Before opening a pull request, rebase or otherwise update from `develop` according to the team's repository policy, resolve conflicts locally, and rerun the validation commands.

## OpenSpec spec-driven development

OpenSpec separates discovery and planning from implementation. The conceptual lifecycle is:

```text
explore -> propose -> review artifacts -> apply tasks
                                      |
                                      v
                           validate -> sync/archive
```

### 1. Explore

Use exploration to understand the problem, current architecture, existing capabilities, and unresolved decisions. Exploration is read-only unless the explicit goal is to capture approved planning artifacts.

Available repository integrations include:

- GitHub Copilot: [`.github/prompts/opsx-explore.prompt.md`](.github/prompts/opsx-explore.prompt.md) and [`.github/skills/openspec-explore/`](.github/skills/openspec-explore/).
- Claude: [`.claude/commands/opsx/explore.md`](.claude/commands/opsx/explore.md) and [`.claude/skills/openspec-explore/`](.claude/skills/openspec-explore/).
- OpenCode: [`.opencode/commands/opsx-explore.md`](.opencode/commands/opsx-explore.md) and [`.opencode/skills/openspec-explore/`](.opencode/skills/openspec-explore/).

When the Graphify output is available, use it for architecture questions before broad source searches. See the [agent architecture guide](docs/architecture.md).

### 2. Propose

Create a named change and generate its planning artifacts:

```bash
openspec new change "<kebab-case-name>"
openspec status --change "<name>" --json
```

The default spec-driven change contains:

- `proposal.md` - why the change is needed and its scope.
- `design.md` - technical decisions and trade-offs.
- `specs/<capability>/spec.md` - changed or new product requirements.
- `tasks.md` - ordered implementation work.

For documentation or tooling work with no product behavior change, set `skip_specs: true` in the change metadata rather than inventing a requirement. Do not edit application code during the proposal phase.

The Copilot proposal workflow is documented in [`.github/prompts/opsx-propose.prompt.md`](.github/prompts/opsx-propose.prompt.md) and [`.github/skills/openspec-propose/`](.github/skills/openspec-propose/). Equivalent integrations exist under [`.claude/`](.claude/) and [`.opencode/`](.opencode/).

### 3. Review the artifacts

Read the proposal, design, specs, and tasks as a set. Confirm that:

- The scope matches the intended user outcome.
- Existing capabilities are modified rather than duplicated.
- Requirements have observable scenarios.
- Tasks are small, ordered, and include their own verification.
- Non-goals and compatibility constraints are explicit.

Use:

```bash
openspec status --change "<name>"
openspec validate --changes "<name>"
```

### 4. Apply the tasks

Only begin implementation after the planning artifacts are complete:

```text
/opsx-apply <change-name>
```

Implementation should follow `tasks.md`, updating each checkbox immediately after the task is fully complete. If implementation reveals a design or scope problem, pause and update the planning artifacts rather than silently changing the contract.

The Copilot apply workflow is documented in [`.github/prompts/opsx-apply.prompt.md`](.github/prompts/opsx-apply.prompt.md) and [`.github/skills/openspec-apply-change/`](.github/skills/openspec-apply-change/).

### 5. Validate, sync, and archive

Run the application checks before requesting review:

```bash
npm test
npm run typecheck
npm run build
openspec validate --changes "<name>"
```

If a change contains delta specs that need to become durable capabilities, use `/opsx-sync` or the repository's equivalent sync workflow. After implementation and review are complete, use `/opsx-archive` to archive the change and perform any required specification synchronization.

Relevant integrations:

- [`.github/prompts/opsx-sync.prompt.md`](.github/prompts/opsx-sync.prompt.md)
- [`.github/prompts/opsx-archive.prompt.md`](.github/prompts/opsx-archive.prompt.md)
- [`.github/skills/openspec-sync-specs/`](.github/skills/openspec-sync-specs/)
- [`.github/skills/openspec-archive-change/`](.github/skills/openspec-archive-change/)

## Pull requests

Before opening a pull request:

- Keep the change focused and explain the user-visible result.
- Link the OpenSpec change when one exists.
- Include tests and documentation for the behavior changed.
- Confirm the branch targets `develop`, not `main`, unless the repository owner explicitly requests a release promotion.
- Report the exact validation commands run and their outcomes.
- Do not commit secrets, local cache directories, or generated files that are intentionally ignored.
