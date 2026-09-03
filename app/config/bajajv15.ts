import type { TachometerConfig } from "../types/tachometer";

export const V15_TACHOMETER_CONFIG: TachometerConfig = {
    maxRpm: 10000,

    startAngle: 240,
    endAngle: 120,

    greenStartRpm: 2000,
    greenEndRpm: 4000,

    orangeStartRpm: 5000,
    orangeEndRpm: 7500,

    redlineRpm: 8000,
};