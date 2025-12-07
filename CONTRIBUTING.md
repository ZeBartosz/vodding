# Contributing to Vodingg

Thank you for your interest in contributing to Vodingg. We welcome contributions of all sizes — from documentation fixes and small bug reports to new features and performance improvements. This document explains how to get started, the preferred workflow, and guidelines to make your contributions easy to review and merge.

If something here is unclear, open an issue and ask — maintainers and contributors will help you get set up.

---

## Table of contents

- Getting set up
- Suggested workflow
- Branching & commit conventions
- Pull request process
- Code style and tests
- Documentation updates
- Reporting bugs and feature requests
- Security disclosures
- Code of conduct
- A few tips for a smooth contribution

---

## Getting set up

We recommend using either Bun or pnpm for development because they're fast and work well with modern toolchains. npm and Yarn are also supported.

- Using Bun:
  - Install: follow instructions at https://bun.sh/
  - Install dependencies: `bun install`
  - Start dev server: `bun run dev` (or `bun dev` if you have an alias)
  - Lint: `bun run lint`
  - Build: `bun run build`
  - Preview: `bun run preview`

- Using pnpm:
  - Install: follow instructions at https://pnpm.io/
  - Install dependencies: `pnpm install`
  - Start dev server: `pnpm dev`
  - Lint: `pnpm lint`
  - Build: `pnpm build`
  - Preview: `pnpm preview`

If you prefer npm or Yarn, use the equivalent scripts (e.g. `npm install` / `npm run dev`).

---

## Suggested workflow

1. Fork the repository (if you don't have write access).
2. Create a short-lived branch from `main`:
   - Use descriptive names. Examples:
     - `feature/add-share-button`
     - `fix/player-autoplay`
3. Make small, focused commits. Rebase/squash as needed before merging.
4. Keep changes scoped to a single concern per PR when possible.
5. Open a pull request against `main` when your branch is ready.

---

## Branching & commit conventions

- Branch names
  - `feature/<short-description>`
  - `fix/<issue-number>-short-description`
  - `chore/<description>`

- Commit messages
  - Use concise, descriptive messages.
  - We recommend Conventional Commits style:
    - `feat: add share button`
    - `fix: handle null source in player`
    - `chore: update deps`
  - If your changes relate to an issue, reference it in the commit or PR (e.g. `refs #12`).

---

## Pull request process

1. Ensure your branch is up-to-date with `main`.
2. Run linters, type checks, and tests locally:
   - Bun: `bun run lint`, `bun run build`, `bun run test` (if tests exist)
   - pnpm: `pnpm lint`, `pnpm build`, `pnpm test`
3. Push your branch to your fork and open a PR against `main`.
4. In the PR description include:
   - What the change does
   - Why the change is needed
   - Any manual verification steps
   - Screenshots or recordings for UI changes
   - Links to related issues or PRs
5. Maintain maintainability: keep changes small and document any notable design decisions.
6. Respond to review comments and iterate — maintainers will re-review after updates.
7. Once approved, a maintainer will merge the PR.

---

## Code style and tests

- TypeScript should be used for new source files.
- Prefer functional components and hooks for React UI.
- Keep components small and reusable.
- Run ESLint and address warnings before opening PRs.
- Add tests for new behavior when practical. If no test framework exists yet, add manual verification steps to your PR.
- Keep formatting consistent. If a formatter like Prettier is added later, run it across your changes.

---

## Documentation updates

- Update `README.md`, `CONTRIBUTING.md`, or other docs when behavior changes.
- For new features, add usage notes and examples.
- Keep CHANGELOG (if present) entries concise and informative.

---

## Reporting bugs and feature requests

When opening an issue, please include:

- A short, descriptive title
- Steps to reproduce
- Expected behavior
- Actual behavior (include screenshots if helpful)
- Environment (OS, Bun/Node version, pnpm version, browser details)
- Relevant logs or stack traces

For feature requests, explain the user problem, proposed solution, and any alternatives considered.

---

## Security disclosures

If you discover a security vulnerability, please avoid posting details publicly. Instead, open a private issue or contact a maintainer directly so we can address it promptly. Provide:

- Component or area affected
- Reproduction steps (if applicable)
- Impact assessment
- Any suggested mitigations

---

## Code of conduct

Please follow a respectful, inclusive, and constructive approach when interacting in issues and pull requests. We recommend adopting the Contributor Covenant as the baseline for behavior:

https://www.contributor-covenant.org/

If you'd like, we can add a `CODE_OF_CONDUCT.md` file to the repository — open an issue or request that in a PR.

---

## A few tips for a smooth contribution

- Open an issue first for large features to get feedback before implementation.
- Keep PRs small and focused; smaller PRs get merged faster.
- If you're unsure how to test a change, describe manual verification steps in the PR.
- If you introduce new build steps or scripts, document them in `README.md`.

---

## Thank you

Thanks again for contributing to Vodingg. Your help makes the project better for everyone. If you have questions about this guide or the project's workflow, open an issue and we'll assist.
