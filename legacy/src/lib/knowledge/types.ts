export type SourceType =
  | "standard"
  | "research"
  | "book"
  | "competition"
  | "roaster"
  | "article";

export type Domain =
  | "extraction"
  | "grind"
  | "water"
  | "pourover"
  | "immersion"
  | "espresso"
  | "pressure"
  | "roast-phases"
  | "heat-transfer"
  | "defects"
  | "sensory"
  | "green"
  | "terroir";

export type KnowledgeEntry = {
  id: string;
  name: string;
  author: string;
  type: SourceType;
  year?: number;
  url?: string;
  domains: Domain[];
  /** Keywords that make this entry relevant to a specific request. */
  tags?: string[];
  /** Concrete, citable claims and numbers this source contributes. */
  claims: string[];
  /** Always inject this entry regardless of the request. */
  core?: boolean;
};

/** A source the guide actually drew on, as reported back by the model. */
export type GuideReference = {
  name: string;
  author: string;
  type: SourceType | string;
  year: string | null;
  url: string | null;
  contribution: string;
};

export type GuideValidation = {
  passed: boolean;
  attempts: number;
  warnings: string[];
};

export type GuidePayload = {
  guide: string;
  scaCompliance: string;
  references: GuideReference[];
  researched: boolean;
  validation?: GuideValidation;
};
