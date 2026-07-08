import React, { useCallback, useEffect, useState } from "react";
import { View, Text, Pressable } from "react-native";
import { useAppColors } from "@/hooks/useAppColors";
import { Depense, Goal, Provision } from "@/types/db";
import { router, useFocusEffect } from "expo-router";
import { getDepenseCurrentMonth, trouverDerniereListe } from "@/controller/depense.controller";
import { getCycleStart, getDepenseParSemaine, getDepensesMoisPrecedent, getInfosPeriode } from "@/utils/date.util";
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

export default function HomeScreen() {
  const { textColor, sectionColor, labelColor } = useAppColors();
  const { user } = useAuth();

  const [budgetMensuel, setBudgetMensuel] = useState<number>(0);
  const [depenses, setDepenses] = useState<Depense[]>([]);
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [provisions, setProvisions] = useState<Provision[]>([]);

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

  const dateDebut = getCycleStart(new Date().toISOString(), 20).toISOString();
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
        // Prend le premier objectif actif, ou le plus proche de l'échéance
        setObjectifPrincipal(goals.find((g) => !g.montant_cible) ?? null);
      });
    }, [])
  );

  return (
    <MainHeader height={148} header={() => <HomeHeader />}>
      <View style={{ gap: 16, paddingBottom: 20 }}>

        <View>
          <Text style={{ fontSize: 22, fontWeight: "700", color: textColor }}>
            Bonjour <Text style={{ color: sectionColor }}>{user?.name}</Text> 👋
          </Text>
          <Text style={{ fontSize: 13, color: labelColor, marginTop: 2 }}>
            {joursRestants} jour{joursRestants > 1 ? "s" : ""} restant{joursRestants > 1 ? "s" : ""} ce mois-ci
          </Text>
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

        {objectifPrincipal && (
          <ObjectifEpargne
            nomObjectif={objectifPrincipal.titre}
            montantCible={objectifPrincipal.montant_cible}
            montantActuel={objectifPrincipal.montant_actuel}
            goalId={objectifPrincipal.id}
          />
        )}

        <ObjectifEpargne
          nomObjectif={objectifPrincipal?.titre ?? ""}
          montantCible={objectifPrincipal?.montant_cible ?? 0}
          montantActuel={objectifPrincipal?.montant_actuel ?? 0}
          goalId={objectifPrincipal?.id ?? ""}
        />

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

        <Pressable onPress={() => router.push("/notes-vocales")}>
          <Text style={{ fontSize: 16, fontWeight: "700", color: textColor }}>
            Voir plus
          </Text>
        </Pressable>

      </View>
    </MainHeader>
  );
}