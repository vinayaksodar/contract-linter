# Playbook Schema

This document describes the schema for playbook files.

## Root

The root of a playbook is a JSON object with the following properties:

*   `name` (string, required): The name of the playbook.
*   `rules` (array, required): An array of rule objects.

## Rule

A rule object has the following properties:

*   `id` (string, required): A unique identifier for the rule.
*   `type` (string, required): The type of the rule. See below for a list of supported rule types.
*   Other properties may be required depending on the rule type.

## Rule Types

### `must_have_clause`

Checks for the presence of a clause with a specific title or heading.

*   `clauseName` (string, required): The name of the clause to check for.

### `forbidden_phrase`

Checks for the presence of a forbidden phrase in the document.

*   `phrase` (string, required): The forbidden phrase.

### `numeric_limit`

Extracts numbers from the document and ensures they are within a certain limit.

*   `limit` (number, required): The numeric limit.

### `preferred_wording`

Checks for exact or substring matches of preferred wording in a clause.

*   `clause` (string, required): The clause to check.
*   `text` (string, required): The preferred wording.

### `semantic_policy`

Evaluates a clause against a semantic policy using an LLM.

*   `clause` (string, required): The clause to evaluate.
*   `policyText` (string, required): The semantic policy.
