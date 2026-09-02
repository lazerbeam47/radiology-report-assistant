import type { Fact, Report, Warning } from "../types";

const diagnosticWords = /\b(carcinoma|metastasis|pneumonia|fracture|malignancy|stroke|abscess|mass)\b/gi;

export function validateGrounding(facts: Fact[], report: Report): Warning[] {
  const knownTerms = facts.flatMap((fact) => [fact.entity.toLowerCase(), fact.anatomy.toLowerCase()]);
  const warnings: Warning[] = [];
  for (const sentence of [...report.findings, ...report.impression]) {
    const unsupported = [...sentence.text.matchAll(diagnosticWords)].map((match) => match[1]);
    if (unsupported.length === 0) continue;
    const supportedByFact = unsupported.every((term) => knownTerms.some((known) => known.includes(term.toLowerCase())));
    if (!supportedByFact) {
      warnings.push({
        id: `grounding-${sentence.id}`,
        type: "Unsupported content",
        dictation: facts.map((fact) => fact.sourceQuote).join(" ") || "No matching source fact.",
        report: sentence.text,
        severity: "high",
        fix: `Remove unsupported diagnostic language: ${unsupported.join(", ")}.`,
        factIds: sentence.factIds,
          sentenceId: sentence.id,
          status: "open",
      });
    }
  }
  return warnings;
}
