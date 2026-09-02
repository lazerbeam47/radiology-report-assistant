import type { Fact, Report, ReportSentence, Warning } from "./types";

const measurementPattern = /((?:\d+(?:\.\d+)?\s*(?:x|×)\s*)*\d+(?:\.\d+)?)\s*(mm|cm|mL|ml|%)/i;
const lateralityPattern = /\b(left|right|bilateral)\b/gi;
const negationPattern = /\b(no|without|negative for|absent|normal)\b\s*/i;

export type CorrectionResult = {
  report: Report;
  changed: boolean;
  description: string;
};

export function canAutoFix(warning: Warning) {
  if (["Laterality inconsistency", "Measurement mismatch", "Negation inconsistency"].includes(warning.type)) return warning.factIds.length === 1;
  return warning.type === "Unsupported content" && warning.factIds.length === 0 && warning.sentenceId !== null;
}

function updateReportSentence(
  report: Report,
  warning: Warning,
  transform: (sentence: ReportSentence) => ReportSentence | null,
): { report: Report; changed: boolean } {
  let changed = false;
  const update = (sentence: ReportSentence) => {
    const isTarget = warning.sentenceId === sentence.id || (warning.sentenceId === null && warning.report === sentence.text);
    if (!isTarget) return sentence;
    const next = transform(sentence);
    if (next === null) {
      changed = true;
      return null;
    }
    if (next.text !== sentence.text) changed = true;
    return next;
  };

  return {
    report: {
      findings: report.findings.map(update).filter((sentence): sentence is ReportSentence => sentence !== null),
      impression: report.impression.map(update).filter((sentence): sentence is ReportSentence => sentence !== null),
    },
    changed,
  };
}

function targetFact(facts: Fact[], warning: Warning) {
  return warning.factIds.length === 1 ? facts.find((fact) => fact.id === warning.factIds[0]) : undefined;
}

function correctNegation(text: string, fact: Fact) {
  if (fact.negated) {
    const withoutNegation = text.replace(negationPattern, "").trim();
    return `No ${withoutNegation.charAt(0).toLowerCase()}${withoutNegation.slice(1)}`;
  }

  return text
    .replace(/\b(no|without|negative for|absent|normal)\b\s*/i, "")
    .replace(/\bis not present\b|\bis absent\b/i, "is present")
    .replace(/\s{2,}/g, "")
    .trim();
}

export function applyDeterministicFix(facts: Fact[], report: Report, warning: Warning): CorrectionResult {
  if (!canAutoFix(warning)) return { report, changed: false, description: "This warning requires manual review." };

  const fact = targetFact(facts, warning);
  if (warning.type === "Laterality inconsistency" && fact && fact.laterality !== "none" && fact.laterality !== "midline") {
    const result = updateReportSentence(report, warning, (sentence) => ({
      ...sentence,
      text: sentence.text.replace(lateralityPattern, fact.laterality),
    }));
    return { ...result, description: `Replaced the report laterality with “${fact.laterality}”.` };
  }

  if (warning.type === "Measurement mismatch" && fact?.measurement) {
    const result = updateReportSentence(report, warning, (sentence) => ({
      ...sentence,
      text: sentence.text.replace(measurementPattern, fact.measurement?.raw ?? ""),
    }));
    return { ...result, description: `Restored the documented measurement “${fact.measurement.raw}”.` };
  }

  if (warning.type === "Negation inconsistency" && fact) {
    const result = updateReportSentence(report, warning, (sentence) => ({
      ...sentence,
      text: correctNegation(sentence.text, fact),
    }));
    return { ...result, description: fact.negated ? "Restored the documented negation." : "Removed the unsupported negation." };
  }

  if (warning.type === "Unsupported content") {
    const result = updateReportSentence(report, warning, () => null);
    return { ...result, description: "Removed the unsupported report sentence." };
  }

  return { report, changed: false, description: "This warning requires manual review." };
}