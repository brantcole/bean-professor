import type {
  BrewInputs,
  MockGuide,
  RoastInputs,
} from "@bean-professor/domain";

/** Phase 1 contract scaffold only; no listener, provider calls, or database connection. */
export const API_VERSION = "v1" as const;
export type ApiResult<T> =
  | { ok: true; data: T; mode: "mock" }
  | {
      ok: false;
      error: { code: "UNAVAILABLE" | "INVALID_INPUT"; message: string };
    };
export interface GuideService {
  brew(input: BrewInputs, signal?: AbortSignal): Promise<ApiResult<MockGuide>>;
  roast(
    input: RoastInputs,
    signal?: AbortSignal,
  ): Promise<ApiResult<MockGuide>>;
}
