import type { Fact, Report, Warning } from "../types";

const measurementPattern = /((?:\d+(?:\.\d+)?\s*(?:x|×)\s*)*\d+(?:\.\d+)?)\s*(mm|cm|mL|ml|%)/i;

export function validateMeasurement(facts: Fact[], report: Report): Warning[] {
  const warnings: Warning[] = [];
  for (const sentence of [...report.findings, ...report.impression]) {
    for (const factId of sentence.factIds) {
      const fact = facts.find((item) => item.id === factId);
      if (!fact?.measurement) continue;
      const match = sentence.text.match(measurementPattern);
      if (!match) {
        warnings.push({
          id: `measurement-missing-${sentence.id}-${fact.id}`,
          type: "Measurement mismatch",
          dictation: fact.sourceQuote,
          report: sentence.text,
          severity: "medium",
          fix: `Preserve the documented measurement: ${fact.measurement.raw}.`,
          factIds: [fact.id],
        });
        continue;
      }
       const values = match[1].split(/\s*(?:x|×)\s*/i).map(Number);
       const expectedValues = fact.measurement.values ?? [fact.measurement.value];
       const sameValue = values.length === expectedValues.length && values.every((value, index) => value === expectedValues[index]);
       const sameUnit = match[2].toLowerCase() === fact.measurement.unit.toLowerCase();
      if (!sameValue || !sameUnit) {
        warnings.push({
          id: `measurement-mismatch-${sentence.id}-${fact.id}`,
          type: "Measurement mismatch",
          dictation: fact.sourceQuote,
          report: sentence.text,
          severity: "high",
          fix: `Use the documented measurement: ${fact.measurement.raw}.`,
          factIds: [fact.id],
            sentenceId: sentence.id,
            status: "open",
        });
      }
    }
  }
  return warnings;
}
