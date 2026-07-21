export type {
  BattlePhase,
  PlayableEraId,
  RoundOutcome,
  RoundPlan,
  RoundRecord,
  RunSummary,
} from "./types";

export {
  DEFAULT_ERA_ROUND_COUNTS,
  PLAYABLE_ERA_IDS,
  buildRoundPlan,
  willAgeUp,
} from "./plan";

export {
  filterAttackerPool,
  filterDefenderPool,
  isHeroUnit,
  isHumanSoldierUnit,
  isMythUnit,
  isUnitEligibleForCurrentEra,
} from "./filters";

export {
  battlePairKey,
  buildBattleResultIndex,
  lookupBattleResult,
  mapPlayerOutcome,
  type BattleResultIndex,
} from "./lookup";

export {
  createRng,
  emptyEraStats,
  pickDefender,
  pickRandomUnit,
  resolvePlayerChoice,
  summarizeRun,
} from "./run";
