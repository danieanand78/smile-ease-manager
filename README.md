# Dentist

**Dentist** est une application de gestion de cabinet dentaire développée afin de centraliser les principales activités d'un cabinet au sein d'une seule interface. Le projet vise à simplifier le suivi des patients, la gestion des consultations, des rendez-vous, des traitements et des paiements.

L'application est pensée pour une utilisation locale dans un cabinet dentaire, avec une interface simple, moderne et adaptée aux besoins du personnel médical.

## Fonctionnalités

Le projet est organisé autour des modules suivants :

* Authentification
* Tableau de bord
* Gestion des patients
* Gestion des consultations
* Gestion des rendez-vous
* Historique médical
* Paiement et facturation
* Statistiques
* Paramètres

## Gestion des utilisateurs

L'application prévoit trois types d'utilisateurs, chacun disposant de droits adaptés à son rôle.

### Administrateur

L'administrateur peut :

* gérer les utilisateurs ;
* configurer les paramètres de l'application ;
* consulter les statistiques ;
* sauvegarder et restaurer les données.

### Dentiste

Le dentiste peut :

* consulter les dossiers des patients ;
* créer et modifier des consultations ;
* enregistrer les traitements réalisés ;
* consulter l'historique médical ;
* établir des prescriptions.

### Secrétaire

La secrétaire est chargée des opérations administratives, notamment :

* enregistrer les nouveaux patients ;
* rechercher un dossier patient ;
* planifier les rendez-vous ;
* enregistrer les paiements ;
* éditer les factures.

## Aperçu des modules

### Tableau de bord

Le tableau de bord fournit une vue d'ensemble de l'activité du cabinet en affichant notamment :

* le nombre total de patients ;
* les consultations et rendez-vous du jour ;
* les revenus du mois ;
* les paiements en attente ;
* les dernières activités enregistrées.

### Gestion des patients

Chaque dossier patient regroupe les informations administratives ainsi que les informations médicales utiles, comme les allergies, les antécédents médicaux, les traitements en cours ou les observations du praticien.

### Gestion des consultations

Les consultations permettent de conserver un historique détaillé des soins réalisés.

Chaque consultation peut contenir :

* les informations générales du rendez-vous ;
* le diagnostic ;
* les dents concernées (notation FDI) ;
* l'état des dents ;
* les traitements effectués ;
* les prescriptions ;
* le coût de la consultation et les informations de suivi.

### Gestion des rendez-vous

Le module de planification permet de gérer les rendez-vous avec différents états (confirmé, en attente, annulé, reporté ou terminé) et propose plusieurs modes d'affichage, notamment journalier, hebdomadaire et mensuel.

### Historique médical

Pour chaque patient, il est possible de consulter l'ensemble de son historique :

* consultations ;
* traitements ;
* prescriptions ;
* paiements ;
* rendez-vous.

### Paiement et facturation

Le système prend en charge la génération des factures ainsi que plusieurs modes de paiement :

* espèces ;
* carte bancaire ;
* Mobile Money ;
* virement bancaire.

### Statistiques

Le module de statistiques permet d'obtenir différents indicateurs sur l'activité du cabinet, tels que :

* le nombre de patients ;
* les consultations réalisées ;
* les revenus mensuels ;
* les traitements les plus fréquents ;
* les rendez-vous annulés.

## Technologies utilisées

* **Frontend :** React + TypeScript
* **Backend :** Python (Flask ou FastAPI)
* **Base de données :** PostgreSQL
* **Authentification :** locale (nom d'utilisateur et mot de passe)

## Lancement du projet

Après avoir cloné le dépôt, installez les dépendances puis démarrez l'application :

```bash
git clone <repository-url>
cd <repository-name>
npm install
npm run dev
```

## Objectif

L'objectif de ce projet est de proposer une solution simple, intuitive et facilement maintenable pour la gestion quotidienne d'un cabinet dentaire. Son architecture a été pensée afin de faciliter l'ajout de nouvelles fonctionnalités et son évolution vers une application complète.
