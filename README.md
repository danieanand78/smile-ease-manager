# Dentist
Cahier des charges
Application de gestion d'un cabinet dentaire
1. Contexte
Les cabinets dentaires utilisent encore parfois des dossiers papier ou des logiciels peu adaptés. Cela complique la gestion des patients, des rendez-vous et des traitements.

L'objectif est de développer une application permettant de centraliser toutes les informations d'un cabinet dentaire dans une interface simple, sécurisée et intuitive.

2. Objectif général
Concevoir une application permettant de :
gérer les patients ;
gérer les consultations ;
gérer les rendez-vous ;
suivre les traitements dentaires ;
gérer les paiements ;
produire des statistiques ;
sécuriser les données.

3. Utilisateurs
L'application comporte trois profils.

a- Administrateur
Permissions :
gérer les utilisateurs ;
modifier les paramètres ;
consulter toutes les statistiques ;
sauvegarder/restaurer les données.

b- Dentiste
Permissions :
consulter les dossiers patients ;
créer une consultation ;
modifier une consultation ;
consulter l'historique médical ;
créer une prescription ;
enregistrer les traitements.

c- Secrétaire
Permissions :
enregistrer un patient ;
rechercher un patient ;
prendre un rendez-vous ;
encaisser les paiements ;
imprimer les factures.

4. Modules principaux
Le logiciel sera composé des modules suivants :

Authentification;
Tableau de bord;
Gestion des patients;
Gestion des consultations;
Gestion des rendez-vous;
Historique médical;
Paiement et facturation;
Statistiques;
Paramètres;

5. Authentification
Connexion locale.

Champs:
Nom d'utilisateur;
Mot de passe;

Fonctionnalités:
Connexion;
Déconnexion;
Redirection selon le rôle

6. Tableau de bord
Le tableau de bord affichera :

Indicateurs:
Nombre total de patients;
Patients enregistrés aujourd'hui;
Rendez-vous du jour;
Consultations du jour;
Revenus du mois;
Paiements en attente.

Activité récente:
Derniers patients;
Dernières consultations;
Derniers paiements.

Agenda:
Liste des rendez-vous de la journée.

7. Gestion des patients
Informations personnelles:
Numéro du dossier;
Nom;
Prénom;
Sexe;
Âge;
Téléphone;
Adresse (facultatif)
Profession (facultatif);
Assurance (facultatif)
Personne à contacter en cas d'urgence (facultatif)

Informations médicales (facultatif):
Allergies;
Antécédents médicaux;
Maladies chroniques;
Traitements en cours;
Médicaments;
Notes générales;

8. Gestion des consultations
Chaque consultation comprend :

a- Informations générales:
Numéro de consultation
Date
Heure
Dentiste
Patient
Motif de consultation

b- Diagnostic
Diagnostic
Observations cliniques

c- Dents concernées
Utilisation de la notation FDI :

11 à 18

21 à 28

31 à 38

41 à 48

d- Informations sur la dent
Numéro de dent
Type de dent: Incisive, Canine, Prémolaire, Molaire
Arcade: Maxillaire, Mandibulaire
Côté: Gauche, Droit
État de la dent: 
Saine,
Carie,
Fracturée,
Infection,
Abcès,
Restaurée,
Couronne,
Implant,
Extraite,
Absente,

e- Traitements réalisés
Consultation;
Détartrage;
Obturation;
Extraction;
Dévitalisation;
Traitement endodontique;
Implant;
Couronne;
Bridge;
Blanchiment;
Orthodontie;
Polissage;
Nettoyage;
Chirurgie;

f- Prescription
Médicaments;
Conseils;

g- Fin de consultation
Coût en Ariary;
Durée;
Date du prochain rendez-vous;

9. Gestion des rendez-vous

a- Informations :

Patient;
Dentiste;
Date;
Heure;
Durée;
Motif;

b- Statut :

Confirmé;
En attente;
Annulé;
Reporté;
Terminé;

c- Affichage :

Calendrier mensuel;
Calendrier hebdomadaire;
Liste quotidienne;

10. Historique
Pour chaque patient :

Toutes les consultations
Tous les traitements
Toutes les prescriptions
Tous les paiements
Tous les rendez-vous

11. Paiement

a- Facture :

Numéro
Date
Consultation
Patient
Montant
Remise
TVA (si applicable)
Total

b- Modes :

Espèces
Carte bancaire
Mobile Money
Virement bancaire

12. Statistiques

Le logiciel affichera :

Nombre de patients
Patients par mois
Consultations par mois
Revenus mensuels
Traitements les plus fréquents
Rendez-vous annulés
Répartition des actes dentaires

13. Paramètres
Gestion des utilisateurs
Gestion des rôles
Informations du cabinet
Logo
Sauvegarde
Restauration
Préférences

14. Technologies envisagées
Frontend : React + TypeScript
Backend : Python (Flask ou FastAPI)
Base de données : PostgreSQL
Authentification : Locale (nom d'utilisateur + mot de passe)
Déploiement : Local (cabinet dentaire)


## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
