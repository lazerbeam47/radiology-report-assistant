import type { Fact, Report, ReportSentence } from "./types";

export interface ReportGenerator {
  readonly mode: "mock" | "groq";
  generate(facts: Fact[], dictation: string): Promise<Report>;
}

function factPhrase(fact: Fact) {
  const laterality = fact.laterality !== "none" && !fact.anatomy.toLowerCase().includes(fact.laterality)
    ? `${fact.laterality} `
    : "";
  const measurement = fact.measurement ? ` measuring ${fact.measurement.value} ${fact.measurement.unit}` : "";
  return `${laterality}${fact.anatomy} ${fact.entity}${measurement}`.replace(/\s+/g, " ").trim();
}

function sentence(id: string, text: string, provenance: ReportSentence["provenance"], factIds: string[]): ReportSentence {
  return { id, text, provenance, factIds };
}

export class MockReportGenerator implements ReportGenerator {
  readonly mode = "mock" as const;

  async generate(facts: Fact[], _dictation: string): Promise<Report> {
    const findings = facts.map((fact, index) => {
      const phrase = factPhrase(fact);
      const text = fact.negated ? `No ${phrase}.` : `${phrase.charAt(0).toUpperCase()}${phrase.slice(1)} is present.`;
      return sentence(`finding-${index + 1}`, text, "Dictation", [fact.id]);
    });

    const positiveFacts = facts.filter((fact) => !fact.negated);
    const impression: ReportSentence[] = positiveFacts.map((fact, index) =>
      sentence(`impression-${index + 1}`, `${factPhrase(fact).charAt(0).toUpperCase()}${factPhrase(fact).slice(1)}.`, "Dictation", [fact.id]),
    );

    if (impression.length === 0) {
      impression.push(sentence("impression-summary", "No positive findings are described in the provided dictation.", "System inference", []));
    }
    impression.push(sentence("impression-review", "Final interpretation requires human review against the source dictation.", "Template", []));

    return { findings, impression };
  }
}
