/**
 * Colori delle scene del vetrino. Sono fissi, indipendenti dal tema dell'app: il vetrino è
 * come un'immagine al microscopio, illuminata da sotto, anche quando l'interfaccia è scura.
 * Ispirati alla colorazione ematossilina-eosina; i batteri seguono la colorazione di Gram.
 */
export const C = {
  ink: "#2a2340",
  inkSoft: "#5b5677",
  label: "#3b2c85",

  tissue: "#f6d3df",
  tissueDeep: "#efb7ca",
  tissueInflamed: "#e98aa8",
  cytoplasm: "#f9dfe8",
  membrane: "#d26f97",
  eosin: "#e57ba0",
  eosinDark: "#c2185b",
  nucleus: "#6556c9",
  nucleusDark: "#3b2c85",

  virus: "#7466d6",
  virusDark: "#473a9c",
  spike: "#c2185b",
  spikeSoft: "#ec93b6",
  capsid: "#b9b0f0",

  gramNeg: "#d6537a",
  gramNegDark: "#a8315a",
  gramPos: "#5b3fa0",
  gramPosDark: "#3e2a75",

  antibody: "#2d6a9f",
  whiteCell: "#f3eefc",
  whiteCellEdge: "#9f93d6",
  whiteNucleus: "#6a4fc3",
  mast: "#f5cfde",
  granule: "#4b3fa8",
  histamine: "#c2185b",

  pollen: "#dcae4f",
  pollenDark: "#a87618",
  mite: "#d2b08f",
  miteDark: "#8a6a4f",
  hypha: "#9b8fae",
  spore: "#6d5a7d",

  rbc: "#d64550",
  rbcRim: "#b5303c",
  rbcCenter: "#ef8a92",
  rbcPale: "#f4b4ba",
  oxygen: "#3b82c4",
  carbon: "#4a4a55",
  plasma: "#fdf2e6",

  mucus: "#ede2ae",
  mucusDark: "#cdbf7a",
  pus: "#ead57f",
  water: "#8fcaea",
  waterDeep: "#4f9fd0",
  air: "#e3eff9",

  nerve: "#f2c14e",
  nerveDark: "#c9971b",
  artery: "#d64550",
  arteryWall: "#e9a0a9",
  vein: "#5a6fd6",

  bone: "#f1e8d5",
  boneDark: "#cbbd99",
  muscle: "#de7f8c",
  muscleDark: "#b4485a",
  collagen: "#fbecef",
  collagenLine: "#d39aac",
  bruise: "#9b6bb5",

  acid: "#e0c45a",
  glucose: "#e8a33d",
  insulin: "#6556c9",

  body: "#ece3f5",
  bodyLine: "#3b2c85",
  highlight: "#c2185b",
  highlightSoft: "#f6b3cb",
  calm: "#b9b0f0",
  warn: "#c2185b",
  heat: "#e2603f",
} as const;
