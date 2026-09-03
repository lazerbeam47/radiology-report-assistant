import type { Fact, Laterality } from "./types";

const ENTITY_PATTERNS = [
  { pattern: /post[- ]cholecystectomy|cholecystectomy/i, entity: "post-cholecystectomy status", anatomy: "gallbladder" },
  { pattern: /biliary dilatation/i, entity: "biliary dilatation", anatomy: "biliary tree" },
  { pattern: /midline shift/i, entity: "midline shift", anatomy: "midline" },
  { pattern: /lesion/i, entity: "lesion", anatomy: "organ" },
  { pattern: /opacity/i, entity: "opacity", anatomy: "lower lobe" },
  { pattern: /aneurysm/i, entity: "aneurysm", anatomy: "MCA" },
  { pattern: /infarct/i, entity: "acute infarct", anatomy: "brain" },
  { pattern: /intracranial hemorrhage|hemorrhage/i, entity: "intracranial hemorrhage", anatomy: "brain" },
  { pattern: /microvascular ischemic change/i, entity: "chronic microvascular ischemic change", anatomy: "brain" },
  { pattern: /calculus|stone/i, entity: "calculus", anatomy: "urinary tract" },
  { pattern: /hydroureteronephrosis/i, entity: "hydroureteronephrosis", anatomy: "ureter" },
  { pattern: /hydronephrosis/i, entity: "hydronephrosis", anatomy: "kidneys" },
  { pattern: /pleural effusion/i, entity: "pleural effusion", anatomy: "pleural space" },
  { pattern: /pneumothorax/i, entity: "pneumothorax", anatomy: "pleural space" },
  { pattern: /appendix/i, entity: "appendix", anatomy: "appendix" },
  { pattern: /heart size/i, entity: "heart size", anatomy: "heart" },
];

const MEASUREMENT_PATTERN = /((?:\d+(?:\.\d+)?\s*(?:x|×)\s*)*\d+(?:\.\d+)?)\s*(mm|cm|mL|ml|%)/i;

function getLaterality(text: string): Laterality {
  const lower = text.toLowerCase();
  if (lower.includes("bilateral")) return "bilateral";
  if (lower.includes("left")) return "left";
  if (lower.includes("right")) return "right";
  if (lower.includes("midline")) return "midline";
  return "none";
}

function sourceSentence(dictation: string, matchIndex: number, matchLength: number) {
  const start = dictation.lastIndexOf(".", matchIndex) + 1;
  const endCandidate = dictation.indexOf(".", matchIndex + matchLength);
  const end = endCandidate === -1 ? dictation.length : endCandidate;
  return dictation.slice(start, end).trim();
}

function isNegated(sentence: string, entity: string) {
  const entityIndex = sentence.toLowerCase().indexOf(entity.toLowerCase());
  if (entityIndex === -1) return false;
  return /\b(no|without|negative for|absent|normal)\b/i.test(sentence.slice(0, entityIndex + 2));
}

function severityFor(entity: string, negated: boolean): Fact["severity"] {
  if (negated) return "routine";
  if (/aneurysm|hemorrhage|infarct|obstructing/i.test(entity)) return "critical";
  if (/opacity|hydroureteronephrosis|ischemic/i.test(entity)) return "important";
  return "routine";
}

export function extractFacts(dictation: string): Fact[] {
  const facts: Fact[] = [];

  for (const [patternIndex, definition] of ENTITY_PATTERNS.entries()) {
    const match = definition.pattern.exec(dictation);
    if (!match || match.index === undefined) continue;

    const sentence = sourceSentence(dictation, match.index, match[0].length);
    const measurementMatch = sentence.match(MEASUREMENT_PATTERN);
    const negated = isNegated(sentence, match[0]);
    const laterality = getLaterality(sentence);
    const measurement = measurementMatch
      ? {
          value: Number(measurementMatch[1].split(/\s*(?:x|×)\s*/i)[0]),
          values: measurementMatch[1].split(/\s*(?:x|×)\s*/i).map(Number),
          unit: measurementMatch[2].toLowerCase(),
          raw: measurementMatch[0],
        }
      : null;

     const anatomy = /basal ganglia/i.test(sentence)
       ? "basal ganglia"
       : /segment VI/i.test(sentence)
         ? "segment VI"
         : /renal/i.test(sentence) && definition.entity === "calculus"
           ? "renal kidney"
           : /lower lobe/i.test(sentence)
             ? "right lower lobe"
             : /UVJ/i.test(sentence)
               ? "left UVJ"
               : definition.anatomy;
    facts.push({
      id: `fact-${patternIndex + 1}`,
      entity: definition.entity,
      anatomy,
      laterality,
      measurement,
      negated,
       severity: severityFor(definition.entity, negated),
      sourceQuote: sentence,
    });
  }

  return facts;
}
