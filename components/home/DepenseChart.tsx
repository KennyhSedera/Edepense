import React, { useState } from "react";
import { View, Text, Dimensions } from "react-native";
import { LineChart } from "react-native-chart-kit";
import { useAppColors } from "@/hooks/useAppColors";
import { styles } from "@/styles/styles";
import { formatCompactNumber } from './../../utils/number.util';

interface DepenseChartProps {
  labels: string[];
  data: number[];
  user: any;
}

export default function DepenseChart({ labels, data, user }: DepenseChartProps) {
  const { cardBg, border, textColor, gradient } = useAppColors();
  const [point, setPoint] = useState({ click: false, v: 0, x: 0, y: 0 });

  const dataGraph = {
    labels,
    datasets: [{ data }],
  };

  return (
    <View style={[styles.card, styles.infoGridFull, { backgroundColor: cardBg, borderColor: border, borderRadius: 16, padding: 16, paddingHorizontal: 8, gap: 10 }]}>
      <Text style={{ fontSize: 15, fontWeight: "700", color: textColor }}>Évolution des dépenses</Text>

      <View style={{ borderRadius: 12, position: "relative", height: 220, overflow: "hidden" }}>
        <LineChart
          data={dataGraph}
          width={Dimensions.get("window").width}
          height={220}
          chartConfig={{
            backgroundGradientFrom: gradient.from,
            backgroundGradientTo: gradient.to,
            color: () => "#ffffff",
            labelColor: () => "#ffffff",
            propsForDots: { r: "4", strokeWidth: "2", stroke: "#ffffff" },
          }}
          onDataPointClick={(e) => setPoint({ v: e.value, x: e.x, y: e.y, click: true })}
          bezier
          style={{ borderRadius: 12 }}
        />
        {point.click && (
          <Text
            style={{
              position: "absolute",
              zIndex: 1,
              backgroundColor: cardBg,
              paddingHorizontal: 10,
              paddingVertical: 5,
              borderRadius: 50,
              top: point.y,
              left: point.x,
              color: textColor,
              fontWeight: "600",
              fontSize: 12,
            }}
          >
            {formatCompactNumber(point.v, user?.devise || "MGA")}
          </Text>
        )}
      </View>
    </View>
  );
}