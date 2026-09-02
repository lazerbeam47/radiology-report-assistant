export type ExampleCase = {
  id: string;
  label: string;
  modality: string;
  dictation: string;
};

export const EXAMPLE_CASES: ExampleCase[] = [
  {
    id: "brain",
    label: "Case 1 · Brain MRI",
    modality: "MRI BRAIN",
    dictation:
      "MRI brain without contrast. There is a 12 x 8 mm lesion in the left basal ganglia. No midline shift. No acute hemorrhage.",
  },
  {
    id: "abdomen",
    label: "Case 2 · CT abdomen",
    modality: "CT ABDOMEN",
    dictation:
      "CT abdomen with contrast. Status post cholecystectomy. There is a 2.4 cm lesion in segment VI. No biliary dilatation.",
  },
  {
    id: "validation",
    label: "Case 3 · Validation stress test",
    modality: "CT ABDOMEN",
    dictation:
      "CT abdomen without contrast. There is a 14 mm left renal calculus. No right hydronephrosis.",
  },
];
