import { Text, View } from "react-native";
import "./global.css";
import { Tachometer } from "./app/components/tachometer/Tachometer";
import { V15_TACHOMETER_CONFIG } from "./app/config/bajajv15";
import { InstrumentScreen } from "./app/screens/InstrumentScreen";

export default function App() {
  return <InstrumentScreen />;
}
