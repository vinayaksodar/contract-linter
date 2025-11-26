# Project Overview

This project is a Microsoft Office Task Pane Add-in developed using React, TypeScript, and Vite. It's designed to run within a host application like Microsoft Word. The add-in is built as a single-page application that is displayed in a task pane within the Office application. The core functionality involves extracting contract text, building a contract tree, applying deterministic rules, and optionally using an LLM for semantic analysis.

## Main Technologies

- **Office Add-in:** The project is structured as a Microsoft Office Add-in, with a `manifest.xml` file defining its properties and capabilities.
- **React:** The user interface is built using the React library.
- **TypeScript:** The project uses TypeScript for static typing.
- **Vite:** The project uses Vite for fast development and building.
- **ESLint:** The project uses ESLint for code linting.
- **OpenAI API:** Used for semantic analysis of contract clauses.

## Project Structure

- `manifest.xml`: The manifest file for the Office Add-in.
- `vite.config.ts`: The configuration file for Vite.
- `package.json`: Defines the project's dependencies and scripts.
- `src/engine/`: Contains the core logic for contract analysis.
  - `src/engine/types.ts`: Defines core TypeScript types and interfaces.
  - `src/engine/utils.ts`: Contains small helper functions.
  - `src/engine/extractor.ts`: Implements deterministic contract text extraction.
  - `src/engine/tree.ts`: Provides functions for building and navigating the contract tree.
  - `src/engine/rules/`: Houses the rule engine.
    - `src/engine/rules/types.ts`: Defines types for playbook and rule configurations.
    - `src/engine/rules/builtins.ts`: Implements deterministic rule handlers (e.g., `mustHaveClause`, `forbiddenPhrase`).
    - `src/engine/rules/engine.ts`: Orchestrates rule execution, including deterministic and semantic rules.
    - `src/engine/rules/playbook.schema.json`: JSON Schema for playbook validation.
  - `src/engine/llm/`: Integrates with Language Model APIs.
    - `src/engine/llm/types.ts`: Defines types for LLM requests and responses.
    - `src/engine/llm/adapter.ts`: Abstract adapter for calling LLM APIs (e.g., OpenAI).
    - `src/engine/llm/prompts.ts`: Centralized prompt templates for LLM interactions.
  - `src/engine/storage/`: Handles data persistence.
    - `src/engine/storage/playbookStore.ts`: Abstraction for loading and saving playbooks.
    - `src/engine/storage/settingsStore.ts`: Persists user settings, including LLM API keys.
  - `src/engine/playbook-examples/`: Contains example playbook JSON files.
- `src/taskpane/`: Contains the task pane UI and Office integration.
  - `src/taskpane/App.tsx`: The main React component for the task pane.
  - `src/taskpane/officeBridge.ts`: Functions for interacting with the Word document (e.g., getting text, applying redlines).
  - `src/taskpane/components/`: React UI components.
    - `src/taskpane/components/AnalysisPanel.tsx`: Main UI for initiating analysis and displaying high-level results.
    - `src/taskpane/components/FindingsList.tsx`: Displays detailed findings from the analysis.
    - `src/taskpane/components/PlaybookEditor.tsx`: UI for creating and editing playbooks.
    - `src/taskpane/components/RuleEditorModal.tsx`: Modal for editing individual rules.
  - `src/taskpane/hooks/useEngine.ts`: React hook to tie together the Office Bridge, extractor, rule engine, and LLM adapter.
- `src/commands/`: Contains code for Office Add-in commands.
- `docs/`: Project documentation.
  - `docs/playbook-schema.md`: Human-readable documentation for authoring rules.
- `tests/`: Unit tests for the engine.
  - `tests/engine/extractor.test.ts`: Unit tests for the contract extractor.
  - `tests/engine/rules.test.ts`: Unit tests for built-in rules.

# Building and Running

## Development

To run the add-in in development mode, use the following command:

```bash
npm run dev
```

This will start the Vite development server and allow you to sideload the add-in in an Office application for testing.

## Building

To build the add-in for production, use the following command:

```bash
npm run build
```

This will create a production-ready build in the `dist` directory.

## Linting

To lint the code, use the following command:

```bash
npm run lint
```

# Development Conventions

- The project follows the standard conventions for a React and TypeScript project.
- The code is organized into modular components and functions.
- ESLint is used to enforce code quality.
- Relative imports are preffered for internal modules don't use @ anywhere
- Types should be imported with the type keyword like `import type { Playbook, ContractTree, RuleResult, Finding } from "../types";`.
- LLM API keys should be stored securely and accessed via the `settingsStore`.
