import type { Playbook } from "../types";

const PLAYBOOKS_KEY = "playbooks";

export function getPlaybooks(): Playbook[] {
  const playbooksJson = localStorage.getItem(PLAYBOOKS_KEY);
  if (!playbooksJson) {
    return [];
  }
  return JSON.parse(playbooksJson);
}

export function savePlaybook(playbook: Playbook) {
  const playbooks = getPlaybooks();
  const existingIndex = playbooks.findIndex((p) => p.name === playbook.name);
  if (existingIndex !== -1) {
    playbooks[existingIndex] = playbook;
  } else {
    playbooks.push(playbook);
  }
  localStorage.setItem(PLAYBOOKS_KEY, JSON.stringify(playbooks));
}
