export type TachometerConfig = {
    // Maximum RPM displayed by the gauge
    maxRpm: number;

    // Physical sweep of the tachometer
    startAngle: number;
    endAngle: number;

    // Fuel-economy RPM range
    greenStartRpm: number;
    greenEndRpm: number;

    // Performance RPM range
    orangeStartRpm: number;
    orangeEndRpm: number;

    // Engine redline
    redlineRpm: number;
};