import { cleoCfg } from './cleo';
import { abominableCfg } from './abominable';
import { triageCfg } from './triage';
import { barrierCfg } from './barrier';
import { fragmentedCfg } from './fragmented';
import { convolutedCfg } from './convoluted';
import type { RigConfig } from './types';

export const RIGS: Record<string, RigConfig> = {
  cleo: cleoCfg,
  abominable: abominableCfg,
  buzz: abominableCfg,
  mossy: triageCfg,
  luna: barrierCfg,
  pip: fragmentedCfg,
  pebble: convolutedCfg,
};
