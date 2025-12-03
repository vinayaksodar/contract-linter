# Project Overview

This project is a Microsoft Office Task Pane Add-in developed using React, TypeScript, and Vite. It's designed to run within a host application like Microsoft Word. The add-in is built as a single-page application that is displayed in a task pane within the Office application. The core functionality involves extracting contract text, building a contract tree, applying deterministic rules, and optionally using an LLM for semantic analysis.

## Main Technologies

- **Office Add-in:** The project is structured as a Microsoft Office Add-in, with a `manifest.xml` file defining its properties and capabilities.
- **React:** The user interface is built using the React library.
- **TypeScript:** The project uses TypeScript for static typing.
- **Vite:** The project uses Vite for fast development and building.
- **ESLint:** The project uses ESLint for code linting.
- **Tailwind CSS:** For utility-first CSS styling.
- **Shadcn UI:** For pre-built, customizable UI components.
- **Assistant UI:** For building AI chat interfaces.
- **Gemini API:** Used for powering the conversational AI features.
- **OpenAI API:** Used for semantic analysis of contract clauses.

## Assistant UI Integration

The project integrates Assistant UI to provide a conversational AI experience. This is achieved without a dedicated backend server by leveraging `useLocalRuntime` from `@assistant-ui/react` and a custom `ChatModelAdapter` for the Gemini API.

-   **Backend-less Operation**: The application communicates directly with the Gemini API from the browser, making it entirely local.
-   **Gemini Adapter**: A `geminiAdapter.ts` file in `src/engine/llm/` handles communication with the Google Gemini API. It retrieves the API key from the `settingsStore`.
-   **API Key Management**: Users can input and save their Gemini API key in the "Analysis" tab, which is then securely stored in `localStorage` via `src/engine/storage/settingsStore.ts`.
-   **Chat Interface**: The `ChatPage.tsx` component utilizes Assistant UI's `<Thread />` component to render the chat interface, enabling real-time interaction with the Gemini model.
-   **UI Components**: `shadcn/ui` components (e.g., Tabs, Input, Button, Label) are used for a consistent and customizable user interface.

## Project Structure

- `manifest.xml`: The manifest file for the Office Add-in.
- `vite.config.ts`: The configuration file for Vite.
- `package.json`: Defines the project's dependencies and scripts.
- `src/components/ui/`: Contains shared UI components from Shadcn UI.
  - `button.tsx`: Shadcn UI Button component.
  - `input.tsx`: Shadcn UI Input component.
  - `label.tsx`: Shadcn UI Label component.
  - `tabs.tsx`: Shadcn UI Tabs component.
  - `avatar.tsx`: Shadcn UI Avatar component.
  - `dialog.tsx`: Shadcn UI Dialog component.
  - `tooltip.tsx`: Shadcn UI Tooltip component.
- `src/components/assistant-ui/`: Contains Assistant UI specific components.
  - `attachment.tsx`: Handles file attachments in the chat.
  - `thread.tsx`: The core chat thread component.
  - `markdown-text.tsx`: Markdown rendering for chat messages.
  - `tool-fallback.tsx`: Fallback UI for tools.
  - `tooltip-icon-button.tsx`: Reusable icon button with tooltip.
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
    - `src/engine/llm/geminiAdapter.ts`: Specific adapter for Google Gemini API.
    - `src/engine/llm/prompts.ts`: Centralized prompt templates for LLM interactions.
  - `src/engine/storage/`: Handles data persistence.
    - `src/engine/storage/playbookStore.ts`: Abstraction for loading and saving playbooks.
    - `src/engine/storage/settingsStore.ts`: Persists user settings, including LLM API keys (OpenAI and Gemini).
  - `src/engine/playbook-examples/`: Contains example playbook JSON files.
- `src/taskpane/`: Contains the task pane UI and Office integration.
  - `src/taskpane/App.tsx`: The main React component for the task pane, now featuring a tabbed interface for Analysis and Chat.
  - `src/taskpane/officeBridge.ts`: Functions for interacting with the Word document (e.g., getting text, applying redlines).
  - `src/taskpane/components/`: React UI components.
    - `src/taskpane/components/AnalysisPanel.tsx`: Main UI for initiating analysis, now includes Gemini API key input.
    - `src/taskpane/components/ChatPage.tsx`: New component for the Assistant UI chat interface.
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
