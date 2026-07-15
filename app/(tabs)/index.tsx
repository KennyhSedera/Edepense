import React, { useCallback, useEffect, useRef, useState } from "react";
import { View, Text, Image, ScrollView } from "react-native";
import { useAppColors } from "@/hooks/useAppColors";
import { Depense, Goal, Provision } from "@/types/db";
import { useFocusEffect } from "expo-router";
import { getDepenseCurrentMonth, trouverDerniereListe } from "@/controller/depense.controller";
import { getCycleStart, getDayFixed, getDepenseParSemaine, getDepensesMoisPrecedent, getInfosPeriode } from "@/utils/date.util";
import { MainHeader } from "@/components/header/header-main";
import { HomeHeader } from "./_layout";
import { useAuth } from "@/contexts/AuthContext";
import BudgetCard from "@/components/home/BudgetCard";
import DailyBudgetCard from "@/components/home/DailyBudgetCard";
import DepenseChart from "@/components/home/DepenseChart";
import QuickActions from "@/components/home/QuickActions";
import IntelligenceCard from "@/components/home/IntelligenceCard";
import ProvisionsAlert from "@/components/home/ProvisionsAlert";
import CategoryBreakdown from "@/components/home/CategoryBreakdown";
import RecentDepenses from "@/components/home/RecentDepenses";
import { getProvision } from "@/controller/provision.controller";
import StreakCard from "@/components/home/StreakCard";
import { getGoal } from "@/controller/goal.controller";
import ObjectifEpargne from "@/components/home/ObjectifEpargne";
import MeteoSuggestion from "@/components/home/MeteoSuggestion";
import ReutiliserListe from "@/components/home/ReutiliserListe";
import ComparaisonMoisPrecedent from "@/components/home/ComparaisonMoisPrecedent";
import { styles } from "@/styles/styles";
import { FloatingActionButton, useScrollFab } from "@/components/input/floating-action-button";
import { ChevronUp } from "lucide-react-native";

export default function HomeScreen() {
  const { textColor, sectionColor, labelColor } = useAppColors();
  const { user } = useAuth();
  const { translateY, onScroll, opacity } = useScrollFab("show-after-leaving-top");

  const [budgetMensuel, setBudgetMensuel] = useState<number>(0);
  const [depenses, setDepenses] = useState<Depense[]>([]);
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [provisions, setProvisions] = useState<Provision[]>([]);
  const scrollViewRef = useRef<ScrollView>(null);

  useFocusEffect(
    useCallback(() => {
      loadData();
      getProvision().then(setProvisions);
    }, [])
  );

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
    }, [])
  );


  const dateDebut = user?.date_debut
    ? getCycleStart(new Date().toISOString(), getDayFixed(user.date_debut)).toISOString()
    : new Date().toISOString();

  const { joursRestants } = getInfosPeriode(dateDebut);

  const totalDepense = depenses.reduce((sum, d) => sum + d.montant, 0);
  const reste = budgetMensuel - totalDepense;
  const budgetJournalier = Math.floor(reste / joursRestants);

  const dataGraphlabel = getDepenseParSemaine(dateDebut, depenses).map((s) => s.id);
  const dataGraphdata = getDepenseParSemaine(dateDebut, depenses).map((s) => s.total);

  const predictionFinMois = totalDepense * 1.2;
  const economieConseil = reste > 0 ? Math.floor(reste * 0.1) : 0;

  const [objectifPrincipal, setObjectifPrincipal] = useState<Goal | null>(null);

  useFocusEffect(
    useCallback(() => {
      getGoal().then((goals) => {
        if (goals.length === 0) return; const epargnes = goals.filter((g) => g.type === "epargne" && g.user_id === user?.id);

        const goal = epargnes.length > 0
          ? epargnes.reduce((closest, current) => {
            const pourcentageClosest = closest.montant_cible && closest.montant_actuel > 0 ? closest.montant_actuel / closest.montant_cible : 0;
            const pourcentageCurrent = current.montant_cible && current.montant_cible > 0 ? current.montant_actuel / current.montant_cible : 0;
            return pourcentageCurrent > pourcentageClosest ? current : closest;
          })
          : null;
        setObjectifPrincipal(goal);
      });
    }, [])
  );

  return (
    <MainHeader
      height={160}
      scrollRef={scrollViewRef}
      onScroll={onScroll}
      fabScroll={
        <FloatingActionButton
          opacity={opacity}
          translateY={translateY}
          onPress={() => scrollViewRef.current?.scrollTo({ y: 0, animated: true })}
          icon={<ChevronUp size={20} color="#fff" />}
          position={{ right: 15, width: 40, height: 40, bottom: 10, }}
        />
      }
      header={() => <HomeHeader />}
    >
      <View style={{ gap: 16, paddingBottom: 20 }}>

        <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 12 }}>
          <Image source={user?.avatar ? { uri: user?.avatar } : require("@/assets/images/avatar.png")} style={[styles.avatar, { width: 45, height: 45, borderColor: sectionColor }]} />
          <View>
            <Text style={{ fontSize: 22, fontWeight: "700", color: textColor }}>
              Bonjour <Text style={{ color: sectionColor }}>{user?.name}</Text> 👋
            </Text>
            <Text style={{ fontSize: 13, color: labelColor, marginTop: 2 }}>
              {joursRestants} jour{joursRestants > 1 ? "s" : ""} restant{joursRestants > 1 ? "s" : ""} ce mois-ci
            </Text>
          </View>
        </View>

        <MeteoSuggestion />

        <BudgetCard budgetMensuel={budgetMensuel} totalDepense={totalDepense} reste={reste} />

        <DailyBudgetCard budgetJournalier={budgetJournalier} />

        <DepenseChart labels={dataGraphlabel} data={dataGraphdata} />

        <StreakCard joursDansLeBudget={2} />

        <QuickActions quickAddOpen={quickAddOpen} setQuickAddOpen={setQuickAddOpen} />

        <ProvisionsAlert provisions={provisions} />

        <CategoryBreakdown depenses={depenses} />

        <ReutiliserListe derniereListeCourses={trouverDerniereListe(depenses)} />

        <RecentDepenses depenses={depenses} />

        {objectifPrincipal?.id && (
          <ObjectifEpargne
            nomObjectif={objectifPrincipal.titre}
            montantCible={objectifPrincipal.montant_cible || 0}
            montantActuel={objectifPrincipal.montant_actuel}
            goalId={objectifPrincipal.id}
          />
        )}

        <ComparaisonMoisPrecedent
          depensesMoisActuel={depenses}
          depensesMoisPrecedent={getDepensesMoisPrecedent(depenses, new Date())}
          jourDuMois={new Date().getDate()}
        />

        <IntelligenceCard
          economieConseil={economieConseil}
          predictionFinMois={predictionFinMois}
          budgetMensuel={budgetMensuel}
        />
      </View>
    </MainHeader>
  );
}