import { View, Text, TouchableOpacity, ScrollView, LayoutAnimation, Platform, UIManager } from 'react-native'
import React, { useState } from 'react'
import { HeaderWithSearch } from './_layout'
import { MainHeader } from '@/components/header/header-main'
import { useAppColors } from '@/hooks/useAppColors'
import { Ionicons } from '@expo/vector-icons'

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type FaqItem = {
  question: string;
  answer: string;
  category: string;
};

const FAQ_DATA: FaqItem[] = [
  {
    category: 'Général',
    question: "Qu'est-ce que E-Dépense ?",
    answer: "E-Dépense est une application de gestion des finances personnelles et du foyer. Elle vous permet de suivre vos dépenses, gérer vos budgets, vos provisions et vos objectifs d'épargne.",
  },
  {
    category: 'Général',
    question: "Mes données sont-elles sauvegardées en ligne ?",
    answer: "Vos données sont stockées localement sur votre appareil. Pensez à faire des exports réguliers si vous changez de téléphone.",
  },
  {
    category: 'Sécurité',
    question: "Comment activer le verrouillage par code PIN ?",
    answer: "Rendez-vous dans Paramètres > Sécurité, activez le toggle \"Verrouillage de l'app\" et suivez les instructions pour créer votre code à 4 chiffres.",
  },
  {
    category: 'Sécurité',
    question: "J'ai oublié mon code PIN, que faire ?",
    answer: "Contactez le support via la section Contact/Feedback des Paramètres. Nous vous aiderons à réinitialiser votre verrouillage.",
  },
  {
    category: 'Sécurité',
    question: "Comment activer le déverrouillage par empreinte digitale ?",
    answer: "Le déverrouillage biométrique est disponible une fois le code PIN activé, à condition que votre appareil ait une empreinte ou un Face ID enregistré au niveau du système.",
  },
  {
    category: 'Dépenses & Budgets',
    question: "Comment scanner un reçu automatiquement ?",
    answer: "Depuis l'écran d'ajout de dépense, utilisez l'option de scan. L'application détecte automatiquement les montants et catégories via reconnaissance de texte, avec ou sans connexion internet.",
  },
  {
    category: 'Dépenses & Budgets',
    question: "Comment fonctionne la réinitialisation des budgets ?",
    answer: "Chaque budget se réinitialise automatiquement selon la fréquence que vous avez définie (journalier, hebdomadaire, mensuel).",
  },
  {
    category: 'Provisions',
    question: "À quoi sert la gestion des provisions ?",
    answer: "Elle vous permet de suivre votre stock de produits à la maison (épicerie, produits ménagers) et d'être alerté quand un produit est presque épuisé.",
  },
  {
    category: 'Compte',
    question: "Comment changer la devise affichée ?",
    answer: "Dans Paramètres > Préférences d'affichage, sélectionnez la devise de votre choix (Ariary, Euro, Dollar).",
  },
  {
    category: 'Compte',
    question: "Comment supprimer définitivement mon compte ?",
    answer: "Dans Paramètres > Compte, appuyez sur \"Supprimer mon compte\". Cette action efface toutes vos données locales et est irréversible.",
  },
];

export default function FaqScreen() {
  const { textColor, backgroundColor, border, cardBg, sectionColor, labelColor } = useAppColors();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const toggleExpand = (index: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const categories = Array.from(new Set(FAQ_DATA.map((f) => f.category)));

  return (
    <MainHeader
      height={100}
      header={() => <HeaderWithSearch searchable={false} title="Aide / FAQ" />}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        {categories.map((category) => (
          <View key={category} style={{ marginBottom: 20 }}>
            <Text style={{ color: labelColor, fontSize: 13, marginBottom: 8, marginLeft: 5, textTransform: 'uppercase', fontWeight: '600' }}>
              {category}
            </Text>

            <View style={{ borderRadius: 10, backgroundColor: cardBg, borderColor: border, borderWidth: 1, paddingHorizontal: 12 }}>
              {FAQ_DATA
                .map((item, globalIndex) => ({ ...item, globalIndex }))
                .filter((item) => item.category === category)
                .map((item, i, arr) => {
                  const isExpanded = expandedIndex === item.globalIndex;
                  const isLast = i === arr.length - 1;

                  return (
                    <View
                      key={item.globalIndex}
                      style={{
                        borderBottomWidth: isLast ? 0 : 1,
                        borderBottomColor: border,
                      }}
                    >
                      <TouchableOpacity
                        onPress={() => toggleExpand(item.globalIndex)}
                        style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 14 }}
                      >
                        <Text style={{ color: textColor, fontSize: 15, flex: 1, fontWeight: '500' }}>
                          {item.question}
                        </Text>
                        <Ionicons
                          name={isExpanded ? 'chevron-up' : 'chevron-down'}
                          size={18}
                          color={sectionColor}
                        />
                      </TouchableOpacity>

                      {isExpanded && (
                        <Text style={{ color: labelColor, fontSize: 14, lineHeight: 20, paddingBottom: 16 }}>
                          {item.answer}
                        </Text>
                      )}
                    </View>
                  );
                })}
            </View>
          </View>
        ))}

        <View style={{ alignItems: 'center', marginBottom: 30, marginTop: 10 }}>
          <Text style={{ color: labelColor, fontSize: 13, textAlign: 'center' }}>
            Une question sans réponse ?{'\n'}Utilisez "Contact / Feedback" dans les Paramètres.
          </Text>
        </View>
      </ScrollView>
    </MainHeader>
  )
}