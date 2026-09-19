# 💰 E-dépense — Financely

**Financely** est une application mobile de gestion des dépenses personnelles développée avec **React Native et Expo**.

Elle permet à l'utilisateur de suivre ses dépenses quotidiennes, gérer son budget mensuel, définir un plafond journalier, gérer ses provisions et suivre ses objectifs financiers.

L'application est conçue pour fonctionner principalement **hors connexion**, avec un stockage local des données.

## ✨ Fonctionnalités

* 💰 Gestion du budget mensuel
* 📊 Suivi des dépenses
* 📅 Gestion des dépenses quotidiennes
* 🎯 Définition d'un maximum de dépenses par jour
* 📦 Gestion des provisions / approvisionnements
* 🎯 Gestion des objectifs financiers
* 📈 Suivi de l'évolution du budget
* 🔔 Rappels quotidiens
* 🔐 Authentification locale
* 🔒 Verrouillage de l'application
* 🌙 Mode clair et mode sombre
* 📱 Interface adaptée aux appareils mobiles
* 📴 Fonctionnement hors ligne
* 💾 Stockage local avec SQLite et AsyncStorage

## 🛠️ Technologies utilisées

### Application mobile

* React Native
* Expo
* Expo Router
* TypeScript

### Stockage

* SQLite avec `expo-sqlite`
* AsyncStorage

### Architecture

L'application utilise notamment :

* React Context API
* Expo Router
* SQLite
* AsyncStorage
* Hooks React
* Composants réutilisables
* Gestion globale du thème
* Gestion des notifications

## 📂 Structure du projet

```text id="w8x2k1"
front/
├── app/
│   ├── (auth)/
│   │   ├── login.tsx
│   │   └── ...
│   │
│   ├── (tabs)/
│   │   ├── index.tsx
│   │   ├── expenses.tsx
│   │   ├── provisions.tsx
│   │   ├── goals.tsx
│   │   └── ...
│   │
│   ├── (form)/
│   │   ├── shopping-form.tsx
│   │   ├── provision-form.tsx
│   │   └── goal-form.tsx
│   │
│   ├── details/
│   │   └── ...
│   │
│   └── _layout.tsx
│
├── components/
│   ├── ...
│   └── ...
│
├── context/
│   ├── AuthProvider.tsx
│   ├── AppThemeProvider.tsx
│   ├── NotificationProvider.tsx
│   └── ...
│
├── database/
│   └── ...
│
├── constants/
│   └── ...
│
├── hooks/
│   └── ...
│
├── utils/
│   └── ...
│
├── assets/
│   └── ...
│
├── app.json
├── package.json
└── README.md
```

## 🚀 Installation

### Prérequis

Avant de commencer, installer :

* Node.js
* npm
* Git
* Android Studio pour le développement Android
* Expo

### Cloner le projet

```bash id="f5qj6k"
git clone <URL_DU_REPOSITORY>
cd front
```

### Installer les dépendances

```bash id="r6xv2w"
npm install
```

## ▶️ Lancer l'application

### Expo

```bash id="p5b2tg"
npm start
```

ou :

```bash id="e4v5jm"
npx expo start
```

### Android

```bash id="kw8j3a"
npm run android
```

ou :

```bash id="x6z4b8"
npx expo run:android
```

## 💵 Gestion du budget

L'utilisateur peut définir un **budget mensuel** afin de contrôler ses dépenses.

Le budget permet notamment de connaître :

* le montant disponible
* le montant déjà dépensé
* le montant restant
* le montant prévu pour les jours restants

L'application peut également calculer un **budget maximum journalier** afin d'aider l'utilisateur à répartir son budget.

### Exemple

```text id="j7u2wq"
Budget mensuel :       500 000 Ar
Dépenses :             180 000 Ar
Reste :                320 000 Ar
```

L'utilisateur peut ainsi visualiser rapidement sa situation financière.

## 🧾 Gestion des dépenses

Une dépense peut être enregistrée avec différentes informations :

* montant
* date
* catégorie
* description
* informations complémentaires

Exemple :

```ts id="j1p4sa"
{
  amount: 15000,
  date: "2026-09-19",
  category: "Alimentation",
  description: "Déjeuner"
}
```

Les dépenses sont enregistrées localement afin de rester accessibles sans connexion Internet.

## 📦 Provisions

L'application possède un système de **provisionnement** permettant de mettre de côté une partie du budget pour des dépenses prévues.

Une provision peut être utilisée pour prévoir par exemple :

* transport
* alimentation
* logement
* factures
* événements
* achats prévus
* autres dépenses futures

Le système permet ainsi de distinguer les dépenses immédiates des sommes déjà réservées pour des besoins futurs.

## 🎯 Objectifs financiers

L'utilisateur peut créer des objectifs afin de suivre progressivement une somme à atteindre.

Un objectif peut contenir :

```text id="4s7xpa"
Nom
Montant cible
Montant actuel
Date prévue
Description
```

Exemple :

```text id="6c7f9e"
Objectif : Nouvel ordinateur
Cible    : 3 000 000 Ar
Épargné  : 1 250 000 Ar
```

La progression de l'objectif peut être visualisée directement dans l'application.

## 📊 Suivi des dépenses

L'application permet de consulter les dépenses afin d'avoir une meilleure visibilité sur l'utilisation du budget.

Les informations peuvent être organisées par :

* jour
* période
* catégorie
* montant

L'objectif est de permettre à l'utilisateur de comprendre rapidement où son argent est dépensé.

## 🔔 Notifications

L'application intègre un système de rappels quotidiens.

Un rappel peut notamment être utilisé pour encourager l'utilisateur à enregistrer ses dépenses de la journée.

Le système utilise des clés locales afin d'éviter les doublons et de suivre la dernière activité enregistrée.

## 🔐 Authentification

L'application dispose d'un système d'authentification locale.

Les différents éléments de l'application peuvent être protégés selon l'état de connexion de l'utilisateur.

## 🔒 Verrouillage

Un système de verrouillage permet de protéger l'accès aux données de l'application.

Cela ajoute une couche de confidentialité lorsque l'application contient des informations financières personnelles.

## 🗄️ Base de données

L'application utilise SQLite pour stocker les données localement.

La base est initialisée avec :

```ts id="e1w8rv"
initDB()
```

Elle contient notamment des tables liées à :

* utilisateurs
* dépenses
* provisions
* autres données nécessaires au fonctionnement de l'application

L'utilisation de SQLite permet de consulter et modifier les données sans dépendre d'un serveur distant.

## 💾 Stockage local

Certaines préférences et informations temporaires sont conservées avec **AsyncStorage**.

Par exemple :

```text id="b1j9eu"
APP_THEME
LAST_EXPENSE_DATE
DAILY_KEY
SCHEDULE_LOCK_KEY
```

Ces valeurs permettent notamment de gérer :

* le thème
* les rappels
* le suivi de l'activité quotidienne
* certaines préférences de l'application

## 🎨 Interface

L'application utilise une interface moderne basée sur un dégradé principal :

```text id="h5f2dc"
#2A7B9B → #57C785
```

### Mode sombre

L'interface prend également en charge un mode sombre afin d'améliorer le confort d'utilisation dans des environnements peu lumineux.

## 📴 Fonctionnement hors ligne

Financely est conçue pour fonctionner sans connexion Internet.

Les principales données sont conservées localement :

```text id="d4n7yx"
Utilisateur
    ↓
SQLite
    ↓
Dépenses
Provisions
Objectifs
    ↓
Interface
```

Une connexion Internet n'est donc pas nécessaire pour enregistrer ou consulter les dépenses locales.

## 📱 Navigation

La navigation principale est organisée autour des différentes fonctionnalités de gestion financière :

```text id="f8r3ma"
Accueil
  │
  ├── Budget
  │
  ├── Dépenses
  │     └── Ajouter une dépense
  │
  ├── Provisions
  │     └── Ajouter une provision
  │
  ├── Objectifs
  │     └── Ajouter un objectif
  │
  └── Profil / Paramètres
```

## 🧪 Développement

Vérifier le projet :

```bash id="k3t6qp"
npm run lint
```

Démarrer Expo :

```bash id="w4s8nc"
npm start
```

### Nettoyer et reconstruire le projet natif

```bash id="x5f7ka"
npx expo prebuild --clean
```

Puis :

```bash id="y6g9md"
npx expo run:android
```

## 📦 Build Android

Pour générer un APK de développement :

```bash id="p9r2cx"
eas build --profile development --platform android
```

Pour un build local :

```bash id="m4z7qs"
cd android
gradlew.bat assembleDebug
```

Pour une version release :

```bash id="t8v3ka"
cd android
gradlew.bat assembleRelease
```

L'APK généré se trouve généralement dans :

```text id="q2h5wn"
android/app/build/outputs/apk/
```

## 🗺️ Roadmap

### Fonctionnalités disponibles

* [x] Gestion du budget mensuel
* [x] Gestion des dépenses
* [x] Limite quotidienne
* [x] Gestion des provisions
* [x] Gestion des objectifs
* [x] Stockage SQLite
* [x] Fonctionnement hors ligne
* [x] Authentification
* [x] Verrouillage de l'application
* [x] Mode sombre
* [x] Notifications / rappels
* [x] Interface mobile

### Évolutions possibles

* [ ] Graphiques financiers avancés
* [ ] Statistiques mensuelles
* [ ] Export CSV / Excel
* [ ] Export PDF
* [ ] Sauvegarde cloud
* [ ] Synchronisation entre appareils
* [ ] Catégories personnalisées
* [ ] Budgets par catégorie
* [ ] Rapports financiers
* [ ] Sauvegarde / restauration des données

## 🤝 Contribution

Les contributions sont les bienvenues.

Créer une branche :

```bash id="n3x8hv"
git checkout -b feature/nouvelle-fonctionnalite
```

Ajouter les modifications :

```bash id="r7k2md"
git add .
```

Créer un commit :

```bash id="z4p6tc"
git commit -m "feat: ajout d'une nouvelle fonctionnalité"
```

Puis pousser la branche :

```bash id="v8m3qa"
git push origin feature/nouvelle-fonctionnalite
```

## 📄 Licence

Ce projet est développé dans le cadre d'un projet d'application mobile de gestion des finances personnelles.

Les conditions de distribution et d'utilisation du projet dépendent de la licence définie dans le dépôt.

---

## 👨‍💻 Technologies

**React Native · Expo · TypeScript · Expo Router · SQLite · AsyncStorage**

> 💰 Financely — Mieux gérer son budget, mieux comprendre ses dépenses.
