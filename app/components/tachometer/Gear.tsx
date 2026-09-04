import { Text, View } from "react-native";
import Svg, { Path } from "react-native-svg";

type GearProps = {
  gear: string | number;
  width: number;
  height: number;
};

export function Gear({ gear, width, height }: GearProps) {
  return (
    <View
      style={{
        width,
        height,
        position: "relative",
      }}
    >
      <Svg
        width={width}
        height={height}
        viewBox="0 0 100 100"
        style={{
          position: "absolute",
          left: 0,
          top: 0,
        }}
      >
        <Path
          d="
                M 60 6
                L 88 6
                Q 95 7 95 13
                L 86 70
                Q 84 77 79 77
                L 14 77
                Q 7 75 7 70
                L 9 56
                Q 34 42 60 6 
                Z
            "
          fill="#000"
          stroke="#555"
          strokeWidth="1.5"
        />
      </Svg>

      <View
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: height * 0.15,
          alignItems: "center",
        }}
      >
        <Text
          style={{
            width: width * 0.65,
            color: "#777",
            fontSize: height * 0.08,
            fontWeight: "500",
            letterSpacing: 1,
            textAlign: "right",
          }}
        >
          GEAR
        </Text>

        <Text
          style={{
            width: width * 0.7,
            color: "#fff",
            fontSize: height * 0.38,
            fontFamily: "ExoItalic",
            lineHeight: height * 0.45,
            marginTop: height * 0,
            left: width * 0.13,
            textAlign: "center",
          }}
        >
          {gear}
        </Text>
      </View>
    </View>
  );
}
