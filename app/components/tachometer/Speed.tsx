import { Text, View } from "react-native";

type SpeedProps = {
  speed: number;
  diameter: number;
};

export function Speed({ speed, diameter }: SpeedProps) {
  return (
    <View
      style={{
        position: "absolute",
        width: diameter,
        top: diameter * 0.68,
        alignItems: "center",
      }}
    >
      <Text
        style={{
          fontFamily: "Rajdhani",
          fontSize: 64,
          lineHeight: 64,
          color: "white",
        }}
      >
        {Math.round(speed)}
      </Text>

      <Text
        className="text-white/50 italic"
        style={{
          fontSize: 14,
          marginTop: -2,
        }}
      >
        km/h
      </Text>
    </View>
  );
}
