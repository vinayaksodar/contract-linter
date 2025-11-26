export const prompts = {
  policyEvaluation: `
    You are a legal assistant. Evaluate the following clause against the given policy.
    Clause: {clause}
    Policy: {policy}
    Provide your evaluation in JSON format with the following keys: "evaluation", "suggestion".
  `,
  rewriteSuggestion: `
    You are a legal assistant. Rewrite the following clause to comply with the given policy.
    Clause: {clause}
    Policy: {policy}
    Provide your suggestion in JSON format with the following key: "suggestion".
  `,
  riskScoring: `
    You are a legal assistant. Score the risk of the following clause on a scale of 1 to 10, where 1 is low risk and 10 is high risk.
    Clause: {clause}
    Provide your score in JSON format with the following key: "riskScore".
  `,
  summarization: `
    You are a legal assistant. Summarize the following clause.
    Clause: {clause}
    Provide your summary in JSON format with the following key: "summary".
  `,
};
