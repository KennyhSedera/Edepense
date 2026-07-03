import React, { useCallback, useEffect, useState } from "react";
import { View, Text, ScrollView, Pressable, Dimensions } from "react-native";
import { LineChart } from "react-native-chart-kit";
import { useAppColors } from "@/hooks/useAppColors";
import { Depense } from "@/types/db";
import { router, useFocusEffect } from "expo-router";
import { getDepenseCurrentMonth } from "@/controller/depense";
import { getCycleStart, getDepenseParSemaine, getInfosPeriode } from "@/utils/dateFormat";
import { useAppTheme } from "@/hooks/themeContext";
import { styles } from "@/styles/styles";
import QuickAdd from "@/components/ui/QuickAdd";

export default function HomeScreen() {
  const { textColor, backgroundColor, gradient, cardBg, sectionColor, border } = useAppColors();
  const { user } = useAppTheme();

  const [budgetMensuel, setBudgetMensuel] = useState<number>(0);
  const [depenses, setDepenses] = React.useState<Depense[]>([]);
  const [point, setPoint] = useState({
    click: false,
    v: 0,
    x: 0,
    y: 0,
  });
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setBudgetMensuel(Number(user?.budget_mensuel));
    }, 500);
  }, [user]);

  const loadData = async () => {
    const data = await getDepenseCurrentMonth();
    setDepenses(data.sort((a: any, b: any) => b.id - a.id));
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
      setPoint({ click: false, v: 0, x: 0, y: 0, });
    }, [])
  );

  const dateDebut = getCycleStart(new Date().toISOString(), 20).toISOString();

  const { joursRestants } = getInfosPeriode(dateDebut);

  const totalDepense = depenses.reduce((sum, d) => sum + d.montant, 0);
  const reste = budgetMensuel - totalDepense;

  const budgetJournalier = Math.floor(reste / joursRestants);

  const dataGraphlabel = getDepenseParSemaine(dateDebut, depenses).map((s) => s.id);
  const dataGraphdata = getDepenseParSemaine(dateDebut, depenses).map((s) => s.total);

  const dataGraph = {
    labels: dataGraphlabel,
    datasets: [
      {
        data: dataGraphdata,
      },
    ],
  };

  const predictionFinMois = totalDepense * 1.2;
  const economieConseil = reste > 0 ? Math.floor(reste * 0.1) : 0;

  const pourcentage = (totalDepense / budgetMensuel) * 100;

  return (
    <ScrollView style={[styles.container]} contentContainerStyle={styles.scrollContent}>
      <Pressable onPress={() => setPoint({ click: false, v: 0, x: 0, y: 0, })}>
        <Text style={[styles.title, { color: textColor }]}>
          Bonjour <Text style={[styles.title, { color: sectionColor, fontWeight: "bold" }]}>{user?.name}</Text>
        </Text>

        <View style={[styles.card, styles.infoGridFull,
        { borderColor: border, gap: 2, marginVertical: 10, backgroundColor }
        ]}>
          <Text style={[styles.section, { color: textColor, marginBottom: 10 }]}>
            📊 Budget Alimentaire
          </Text>

          <View style={[styles.card, styles.infoGridFull, { backgroundColor: cardBg, borderColor: border }]}>
            <Text style={{ color: textColor }}>Budget mensuel</Text>
            <Text style={[styles.big, { color: textColor }]}>{budgetMensuel.toLocaleString()} Ar</Text>

            <Text style={{ color: textColor }}>
              Dépensé : {totalDepense.toLocaleString()} Ar
            </Text>

            <Text style={{ color: textColor }}>
              Restant : {reste.toLocaleString()} Ar
            </Text>
          </View>

          <View style={[{ position: "relative", width: "100%", marginVertical: 10 }]}>
            <Text style={{ color: textColor, fontSize: 10, position: "absolute", top: -5, left: `${Math.min(pourcentage, 100) - 3}%` }}>{pourcentage.toFixed(2)}%</Text>
            <View style={[styles.progressBar, { backgroundColor: cardBg }]}>
              <View
                style={{
                  width: `${Math.min(pourcentage, 100)}%`,
                  height: 10,
                  backgroundColor: pourcentage > 100 ? "#ef4444" : pourcentage > 50 ? "#fbbf24" : "#22c55e",
                }}
              />
            </View>
          </View>

          <View style={[styles.card, styles.infoGridFull, { backgroundColor: cardBg, borderColor: border }]}>
            <Text style={{ color: textColor }}>Budget journalier</Text>
            <Text style={[styles.big, { color: textColor }]}>
              {budgetJournalier.toLocaleString()} Ar
            </Text>

            <Text
              style={{
                color: budgetJournalier > 0 ? "#22c55e" : "#ef4444",
                marginTop: 8,
                fontWeight: "bold",
              }}
            >
              {budgetJournalier > 0
                ? "✔ OK pour aujourd'hui"
                : "⚠ Budget insuffisant"}
            </Text>
          </View>
        </View>

        <View style={[styles.card, styles.infoGridFull, { gap: 10, backgroundColor, borderColor: border }]}>
          <Text style={[styles.section, { color: textColor }]}>📈 Dépenses</Text>

          <View style={{ backgroundColor, borderRadius: 10, position: 'relative', height: 220 }}>
            <LineChart
              data={dataGraph}
              width={Dimensions.get("window").width - 45}
              height={220}
              chartConfig={{
                backgroundColor: "red",
                backgroundGradientFrom: gradient.from,
                backgroundGradientTo: gradient.to,
                color: () => "#ffffff",
                labelColor: () => "#ffffff",
              }}
              onDataPointClick={(e) => setPoint({ v: e.value, x: e.x, y: e.y, click: true })}
              bezier
              style={{ borderRadius: 10 }}
            />
            {point.click && <Text style={{ position: 'absolute', zIndex: 1, backgroundColor: cardBg, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 50, top: point.y, left: point.x, color: textColor }}>{point.v}</Text>}
          </View>

        </View>

        <View style={[styles.card, styles.infoGridFull, { gap: 2, backgroundColor, borderColor: border }]}>
          <Text style={[styles.section, { color: textColor }]}>⚡ Actions rapides</Text>

          <Pressable style={[styles.button, { backgroundColor: "transparent", borderColor: sectionColor, borderWidth: 1 }]} onPress={() => router.push("/scan-ticket")}>
            <Text style={[styles.buttonText, { color: sectionColor }]}>📷 Scanner ticket (OCR)</Text>
          </Pressable>

          <Pressable style={styles.buttonSecondary} onPress={() => setOpen(true)}>
            <Text style={styles.buttonText}>➕ Ajout rapide type WhatsApp</Text>
          </Pressable>
          <QuickAdd
            visible={open}
            onChange={() => setOpen(false)}
          />
        </View>

        <View style={[styles.card, styles.infoGridFull, { gap: 10, backgroundColor, borderColor: border }]}>
          <Text style={[styles.section, { color: textColor }]}>🧠 Intelligence</Text>

          <View style={[styles.card, styles.infoGridFull, { backgroundColor: cardBg, borderColor: border }]}>
            <Text style={{ color: textColor }}>
              💡 Économie conseillée : {economieConseil.toLocaleString()} Ar
            </Text>

            <Text style={{ color: textColor }}>
              📉 Prévision fin du mois : {predictionFinMois.toLocaleString()} Ar
            </Text>

            {predictionFinMois > budgetMensuel ? (
              <Text style={{ color: "#ef4444", marginTop: 8 }}>
                ⚠ Risque de dépassement
              </Text>
            ) : (
              <Text style={{ color: "#22c55e", marginTop: 8 }}>
                ✅ Budget maîtrisé
              </Text>
            )}
          </View>
        </View>
      </Pressable>
    </ScrollView >
  );
}
