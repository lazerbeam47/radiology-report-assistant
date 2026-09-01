export type ExampleCase = {
  id: string;
  label: string;
  modality: string;
  dictation: string;
};

export const EXAMPLE_CASES: ExampleCase[] = [
  {
    id: "chest",
    label: "Chest radiograph",
    modality: "XR CHEST",
    dictation:
      "Portable AP chest. There is a right lower lobe opacity measuring 2.1 cm. No pleural effusion or pneumothorax. Heart size is within normal limits.",
  },
  {
    id: "brain",
    label: "Brain MRI",
    modality: "MRI BRAIN",
    dictation:
      "MRI brain without contrast. A 4 mm left MCA aneurysm is identified. No acute infarct or intracranial hemorrhage. Mild chronic microvascular ischemic change.",
  },
  {
    id: "abdomen",
    label: "CT abdomen",
    modality: "CT ABDOMEN / PELVIS",
    dictation:
      "CT abdomen and pelvis with contrast. There is a 6 mm obstructing left UVJ calculus with mild left hydroureteronephrosis. No right renal calculus. The appendix is normal.",
  },
];
