import { useState } from "react";
import { LayoutChangeEvent, View } from "react-native";
import Svg, { Circle, Path, Line } from "react-native-svg";
import type { TachometerConfig } from "../../types/tachometer";
import { Speed } from "./Speed";
import { Gear } from "./Gear";

import Animated, {
  useAnimatedStyle,
  useSharedValue,
  SharedValue,
  useFrameCallback,
} from "react-native-reanimated";

const gear = 4;

const outerRadius = 450;
const tickLength = 14;
const tickSpacing = 1.2;
const tickWidth = 2;

const mediumTickRpm = 500;
const mediumTickLength = 30;
const mediumTickWidth = 5;

const largeTickLength = 45;
const largeTickWidth = 6;
const largeTickInterval = 1000;

const orangeRangeColor = "#da8b04a6";
const orangeRangeTickColor = "#f5d909a6";

const greenRangeColor = "#168213a6";
const greenRangeTickColor = "#41bb41a6";

const redRangeColor = "#ff0000a6";
const redRangeTickColor = "#ff0000a6";

const defaultTickColor = "#777";

type TachometerProps = {
  rpm: SharedValue<number>;
  speed: number;
  config: TachometerConfig;
};

function getTickColor(rpm: number, config: TachometerConfig) {
  if (rpm >= config.greenStartRpm && rpm < config.greenEndRpm) {
    return greenRangeTickColor;
  }

  if (rpm >= config.orangeStartRpm && rpm < config.orangeEndRpm) {
    return orangeRangeTickColor;
  }

  if (rpm >= config.redlineRpm) {
    return redRangeTickColor;
  }

  return defaultTickColor;
}

function rpmToAngle(
  rpm: number,
  startAngle: number,
  endAngle: number,
  maxRpm: number,
) {
  "worklet";
  const sweepAngle =
    startAngle >= endAngle
      ? 360 - startAngle + endAngle
      : endAngle - startAngle;

  const progress = rpm / maxRpm;

  return startAngle + progress * sweepAngle;
}

function polarToCartesian(
  center: number,
  radius: number,
  angleInDegrees: number,
) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180;

  return {
    x: center + radius * Math.cos(angleInRadians),
    y: center + radius * Math.sin(angleInRadians),
  };
}

function describeArc(
  center: number,
  radius: number,
  startAngle: number,
  finishAngle: number,
) {
  let sweepAngle = 0;
  if (finishAngle > startAngle) {
    sweepAngle = finishAngle - startAngle;
  } else {
    sweepAngle = 360 - startAngle + finishAngle;
  }
  const endAngle = startAngle + sweepAngle;

  const start = polarToCartesian(center, radius, startAngle);
  const end = polarToCartesian(center, radius, endAngle);

  const largeArcFlag = sweepAngle > 180 ? 1 : 0;

  return [
    `M ${start.x} ${start.y}`,
    `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`,
  ].join(" ");
}

export function Tachometer({ rpm, speed, config }: TachometerProps) {
  const [diameter, setDiameter] = useState(0);

  const handleLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setDiameter(Math.min(width, height));
  };

  const gearWidth = diameter * 0.3;
  const gearHeight = diameter * 0.34;

  const sweepAngle =
    config.startAngle >= config.endAngle
      ? 360 - config.startAngle + config.endAngle
      : config.endAngle - config.startAngle;

  const tickCount = Math.floor(sweepAngle / tickSpacing) + 1;

  const animatedNeedleAngle = useSharedValue(config.startAngle);
  const targetNeedleAngle = useSharedValue(config.startAngle);
  const needleVelocity = useSharedValue(0);

  useFrameCallback((frameInfo) => {
    const frameTime = Math.min(frameInfo.timeSincePreviousFrame ?? 16, 32);

    const totalDeltaTime = frameTime / 1000;

    const subSteps = 4;
    const deltaTime = totalDeltaTime / subSteps;

    const stiffness = 20;
    const damping = 6;

    targetNeedleAngle.value = rpmToAngle(
      rpm.value,
      config.startAngle,
      config.endAngle,
      config.maxRpm,
    );

    for (let i = 0; i < subSteps; i++) {
      const difference = targetNeedleAngle.value - animatedNeedleAngle.value;

      const acceleration =
        difference * stiffness - needleVelocity.value * damping;

      needleVelocity.value += acceleration * deltaTime;

      animatedNeedleAngle.value += needleVelocity.value * deltaTime;
    }
  });

  const animatedNeedleStyle = useAnimatedStyle(() => ({
    transform: [
      {
        rotate: `${animatedNeedleAngle.value}deg`,
      },
    ],
  }));

  return (
    <View
      className="flex-1 w-full items-center justify-center"
      onLayout={handleLayout}
    >
      {diameter > 0 && (
        <View
          style={{
            width: diameter,
            height: diameter,
            position: "relative",
          }}
        >
          <Svg width={diameter} height={diameter} viewBox="0 0 1000 1000">
            <Circle
              cx="500"
              cy="500"
              r="470"
              fill="none"
              stroke="#33333343"
              strokeWidth="4"
            />

            {/* Green Zone Arc */}
            <Path
              d={describeArc(
                500,
                outerRadius - tickLength / 4,
                rpmToAngle(
                  config.greenStartRpm,
                  config.startAngle,
                  config.endAngle,
                  config.maxRpm,
                ),
                rpmToAngle(
                  config.greenEndRpm,
                  config.startAngle,
                  config.endAngle,
                  config.maxRpm,
                ),
              )}
              fill="none"
              stroke={greenRangeColor}
              strokeWidth={tickLength / 2}
              strokeLinecap="round"
            />

            {/* Orange Zone Arc */}
            <Path
              d={describeArc(
                500,
                outerRadius - tickLength / 4,
                rpmToAngle(
                  config.orangeStartRpm,
                  config.startAngle,
                  config.endAngle,
                  config.maxRpm,
                ),
                rpmToAngle(
                  config.orangeEndRpm,
                  config.startAngle,
                  config.endAngle,
                  config.maxRpm,
                ),
              )}
              fill="none"
              stroke={orangeRangeColor}
              strokeWidth={tickLength / 2}
            />

            {/* Red Line Arc */}
            <Path
              d={describeArc(
                500,
                outerRadius - tickLength / 4,
                rpmToAngle(
                  config.redlineRpm,
                  config.startAngle,
                  config.endAngle,
                  config.maxRpm,
                ),
                config.endAngle,
              )}
              fill="none"
              stroke={redRangeColor}
              strokeWidth={tickLength / 2}
              strokeLinecap="round"
            />

            {/*Fine Ticks*/}
            {Array.from(
              {
                length: tickCount,
              },
              (_, index) => {
                const angle =
                  config.startAngle + (index / (tickCount - 1)) * sweepAngle;

                const rpm = (index / (tickCount - 1)) * config.maxRpm;

                const outer = polarToCartesian(500, outerRadius, angle);

                const inner = polarToCartesian(
                  500,
                  outerRadius - tickLength,
                  angle,
                );

                return (
                  <Line
                    key={index}
                    x1={inner.x}
                    y1={inner.y}
                    x2={outer.x}
                    y2={outer.y}
                    stroke={getTickColor(rpm, config)}
                    strokeWidth={tickWidth}
                  />
                );
              },
            )}

            {/*Medium Ticks*/}
            {Array.from(
              {
                length: config.maxRpm / mediumTickRpm + 1,
              },
              (_, index) => {
                const rpm = index * mediumTickRpm;

                const progress = rpm / config.maxRpm;

                const sweepAngle =
                  config.startAngle >= config.endAngle
                    ? 360 - config.startAngle + config.endAngle
                    : config.endAngle - config.startAngle;

                const angle = config.startAngle + progress * sweepAngle;

                const outer = polarToCartesian(500, outerRadius, angle);
                const inner = polarToCartesian(
                  500,
                  outerRadius - mediumTickLength,
                  angle,
                );

                return (
                  <Line
                    key={`medium-${index}`}
                    x1={inner.x}
                    y1={inner.y}
                    x2={outer.x}
                    y2={outer.y}
                    stroke="#aaa"
                    strokeWidth={mediumTickWidth}
                  />
                );
              },
            )}

            {/* Large ticks */}
            {Array.from(
              {
                length: config.maxRpm / largeTickInterval + 1,
              },
              (_, index) => {
                const rpm = index * largeTickInterval;

                const progress = rpm / config.maxRpm;

                const sweepAngle =
                  config.startAngle >= config.endAngle
                    ? 360 - config.startAngle + config.endAngle
                    : config.endAngle - config.startAngle;

                const angle = config.startAngle + progress * sweepAngle;

                const outer = polarToCartesian(500, outerRadius, angle);
                const inner = polarToCartesian(
                  500,
                  outerRadius - largeTickLength,
                  angle,
                );

                return (
                  <Line
                    key={`large-${index}`}
                    x1={inner.x}
                    y1={inner.y}
                    x2={outer.x}
                    y2={outer.y}
                    stroke="#fff"
                    strokeWidth={largeTickWidth}
                  />
                );
              },
            )}

            {/* Needle */}
          </Svg>
          <Speed speed={speed} diameter={diameter} />

          <View
            style={{
              position: "absolute",
              width: gearWidth,
              height: gearHeight,
              left: diameter * 0.7,
              top: diameter * 0.71,
              zIndex: 10,
            }}
          >
            <Gear gear="N" width={gearWidth} height={gearHeight} />
          </View>

          <Animated.View
            style={[
              {
                position: "absolute",
                width: diameter,
                height: diameter,
                left: 0,
                top: 0,
              },
              animatedNeedleStyle,
            ]}
          >
            <Svg width={diameter} height={diameter} viewBox="0 0 1000 1000">
              <Path
                d="
        M 490 520
        L 500 130
        L 510 520
        Z
      "
                fill="white"
              />

              <Circle cx="500" cy="500" r="48" fill="#222" />

              <Circle cx="500" cy="500" r="34" fill="#888" />
            </Svg>
          </Animated.View>
        </View>
      )}
    </View>
  );
}
