/// <reference types="office-js" />
/* global Word console */

import type { ClauseNode } from "../engine/types";

/**
 * Retrieves the plain text content of the entire document.
 * @returns A promise that resolves with the plain text content of the document.
 */
export async function getDocumentAsOoxml(): Promise<string> {
  return Word.run(async (context) => {
    const body = context.document.body;
    const ooxml = body.getOoxml();
    await context.sync();
    return ooxml.value;
  });
}

/**
 * Applies a redline (replaces content) to a specific clause in the document.
 * @param clauseNode The clause node containing the start position and text length.
 * @param suggestionHtml The HTML content to insert as a suggestion.
 */
export async function applyRedline(
  clauseNode: ClauseNode,
  suggestionHtml: string
): Promise<void> {
  await Word.run(async (context) => {
    const range = context.document.body.getRangeByNumber(
      clauseNode.start,
      clauseNode.start + clauseNode.text.length
    );
    range.insertHtml(suggestionHtml, Word.InsertLocation.replace);
    await context.sync();
  });
}

/**
 * Selects a specific clause in the editor.
 * @param clauseNode The clause node containing the start position and text length.
 */
export async function selectClauseInEditor(clauseNode: ClauseNode) {
  await Word.run(async (context) => {
    const range = context.document.body.getRangeByNumber(
      clauseNode.start,
      clauseNode.start + clauseNode.text.length
    );
    range.select();
    await context.sync();
  });
}

/**
 * Inserts text at the end of the document.
 * @param text The text to insert.
 */
export async function insertText(text: string) {
  try {
    await Word.run(async (context) => {
      const body = context.document.body;
      body.insertParagraph(text, Word.InsertLocation.end);
      await context.sync();
    });
  } catch (error) {
    console.log("Error: " + error);
  }
}
