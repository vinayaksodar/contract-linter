import { useState } from "react";
import type { Rule } from "../../engine/types";

interface RuleEditorModalProps {
  rule: Rule;
  onSave: (rule: Rule) => void;
  onClose: () => void;
}

export function RuleEditorModal({
  rule,
  onSave,
  onClose,
}: RuleEditorModalProps) {
  const [editedRule, setEditedRule] = useState(rule);

  const handleSave = () => {
    onSave(editedRule);
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>Rule Editor</h2>
        <label>
          ID:
          <input
            type="text"
            value={editedRule.id}
            onChange={(e) =>
              setEditedRule({ ...editedRule, id: e.target.value })
            }
          />
        </label>
        <label>
          Type:
          <select
            value={editedRule.type}
            onChange={(e) =>
              setEditedRule({ ...editedRule, type: e.target.value })
            }
          >
            <option value="must_have_clause">must_have_clause</option>
            <option value="forbidden_phrase">forbidden_phrase</option>
            <option value="numeric_limit">numeric_limit</option>
            <option value="preferred_wording">preferred_wording</option>
            <option value="semantic_policy">semantic_policy</option>
          </select>
        </label>
        {editedRule.type === "must_have_clause" && (
          <label>
            Clause Name:
            <input
              type="text"
              value={editedRule.clauseName}
              onChange={(e) =>
                setEditedRule({ ...editedRule, clauseName: e.target.value })
              }
            />
          </label>
        )}
        {editedRule.type === "forbidden_phrase" && (
          <label>
            Phrase:
            <input
              type="text"
              value={editedRule.phrase}
              onChange={(e) =>
                setEditedRule({ ...editedRule, phrase: e.target.value })
              }
            />
          </label>
        )}
        {editedRule.type === "semantic_policy" && (
          <label>
            Policy Text:
            <textarea
              value={editedRule.policyText}
              onChange={(e) =>
                setEditedRule({ ...editedRule, policyText: e.target.value })
              }
            />
          </label>
        )}
        <button onClick={handleSave}>Save</button>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
}
