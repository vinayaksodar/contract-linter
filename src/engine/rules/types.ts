export interface RuleConfig {
  type:
    | "must_have_clause"
    | "forbidden_phrase"
    | "numeric_limit"
    | "preferred_wording"
    | "forbidden_phrase_in_clause"
    | "ordering";
}
