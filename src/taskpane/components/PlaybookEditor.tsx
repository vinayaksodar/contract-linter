import { useState } from "react";
import type { Playbook, Rule } from "../../engine/types";
import { getPlaybooks, savePlaybook } from "../../engine/storage/playbookStore";
import { RuleEditorModal } from "../../taskpane/components/RuleEditorModal";

export function PlaybookEditor() {
  const [playbooks, setPlaybooks] = useState<Playbook[]>(getPlaybooks());
  const [selectedPlaybook, setSelectedPlaybook] = useState<Playbook | null>(
    playbooks.length > 0 ? playbooks[0] : null
  );
  const [isRuleEditorOpen, setIsRuleEditorOpen] = useState(false);
  const [selectedRule, setSelectedRule] = useState<Rule | null>(null);

  const handleSave = () => {
    if (selectedPlaybook) {
      savePlaybook(selectedPlaybook);
      setPlaybooks(getPlaybooks());
    }
  };

  const handleNewPlaybook = () => {
    const newPlaybook: Playbook = {
      name: `New Playbook ${playbooks.length + 1}`,
      rules: [],
    };
    setPlaybooks([...playbooks, newPlaybook]);
    setSelectedPlaybook(newPlaybook);
  };

  const handleRuleSave = (rule: Rule) => {
    if (selectedPlaybook) {
      const newRules = selectedPlaybook.rules.map((r) =>
        r.id === rule.id ? rule : r
      );
      setSelectedPlaybook({ ...selectedPlaybook, rules: newRules });
    }
    setIsRuleEditorOpen(false);
  };

  return (
    <div>
      <h2>Playbook Editor</h2>
      <select
        value={selectedPlaybook?.name}
        onChange={(e) =>
          setSelectedPlaybook(
            playbooks.find((p) => p.name === e.target.value) || null
          )
        }
      >
        {playbooks.map((playbook) => (
          <option key={playbook.name} value={playbook.name}>
            {playbook.name}
          </option>
        ))}
      </select>
      <button onClick={handleNewPlaybook}>New Playbook</button>
      <button onClick={handleSave} disabled={!selectedPlaybook}>
        Save
      </button>
      {selectedPlaybook && (
        <div>
          <h3>Rules</h3>
          <ul>
            {selectedPlaybook.rules.map((rule) => (
              <li key={rule.id}>
                {rule.id}
                <button
                  onClick={() => {
                    setSelectedRule(rule);
                    setIsRuleEditorOpen(true);
                  }}
                >
                  Edit
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
      {isRuleEditorOpen && selectedRule && (
        <RuleEditorModal
          rule={selectedRule}
          onSave={handleRuleSave}
          onClose={() => setIsRuleEditorOpen(false)}
        />
      )}
    </div>
  );
}
