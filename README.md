# 🚀 Kubernetes Local avec Minikube — Pod, Service & Deployment

Premier projet pratique de mon parcours **DevOps / Cloud** : déploiement d'une application Node.js sur un cluster Kubernetes local avec **Minikube**.

L'objectif est de comprendre progressivement les principaux objets Kubernetes — **Pod, Service et Deployment** — et d'expérimenter concrètement des mécanismes essentiels de l'orchestration : **auto-réparation, scaling horizontal, rolling update et rollback**.

---

## 🎯 Objectifs du projet

* Comprendre le cycle de vie complet d'une application conteneurisée :
  **code → image Docker → déploiement Kubernetes**
* Manipuler les objets Kubernetes essentiels :
  **Pod, Service et Deployment**
* Comprendre le fonctionnement d'un cluster Kubernetes local
* Expérimenter l'**auto-réparation** des Pods
* Effectuer du **scaling horizontal**
* Réaliser un **rolling update**
* Tester un **rollback** vers une version précédente
* Se familiariser avec les commandes `kubectl`

---

## 🏗️ Stack technique

| Outil        | Rôle                                     |
| ------------ | ---------------------------------------- |
| **Docker**   | Construction de l'image de l'application |
| **Minikube** | Exécution d'un cluster Kubernetes local  |
| **kubectl**  | CLI de gestion et de pilotage du cluster |
| **Node.js**  | Application HTTP minimale                |

---

## 📁 Structure du projet

```text
kubernetes-minikube-nodejs/
│
├── app.js
├── Dockerfile
├── README.md
├── .gitignore
├── .dockerignore
│
└── k8s/
    ├── pod.yaml
    ├── deployment.yaml
    └── service.yaml
```

### Rôle des fichiers

* `app.js` : serveur HTTP Node.js minimal
* `Dockerfile` : définition de l'image Docker
* `pod.yaml` : définition d'un Pod Kubernetes simple
* `deployment.yaml` : définition d'un Deployment avec plusieurs replicas
* `service.yaml` : exposition réseau de l'application
* `.dockerignore` : fichiers exclus de l'image Docker
* `.gitignore` : fichiers exclus du dépôt Git

> **⚠️ Important :** `pod.yaml` et `deployment.yaml` utilisent le même label `app: mon-app`, ciblé par le `selector` du Service. Ils sont conservés tous les deux à des fins pédagogiques, mais **ne doivent pas être déployés simultanément**.
>
> Le **Pod** permet d'observer le fonctionnement d'une instance simple, tandis que le **Deployment** est utilisé pour les expériences de réplication, d'auto-réparation et de mise à jour.

---

## 🔧 Prérequis

Avant de commencer, installer :

* [Docker Desktop](https://www.docker.com/products/docker-desktop/)
* [Minikube](https://minikube.sigs.k8s.io/docs/start/)
* [kubectl](https://kubernetes.io/docs/tasks/tools/)

Vérifier les installations :

```bash
docker --version
minikube version
kubectl version --client
```

---

## ▶️ Déploiement pas à pas

### 1. Démarrer Minikube

Depuis le dossier du projet :

```bash
minikube start
minikube status
```

Le cluster Kubernetes local doit être en état `Running`.

---

### 2. Utiliser l'environnement Docker de Minikube

Dans cette configuration locale, cette commande permet de construire l'image dans l'environnement Docker utilisé par Minikube :

```bash
eval $(minikube docker-env)
```

Cela permet au cluster d'utiliser directement l'image construite localement, sans avoir besoin de publier l'image sur un registre distant.

---

### 3. Construire l'image Docker

Depuis la racine du projet :

```bash
docker build -t mon-app:v2 .
```

Vérifier que l'image existe :

```bash
docker images | grep mon-app
```

---

## ☸️ 4. Déployer l'application

### Option A — Pod simple

Cette option permet d'observer le fonctionnement d'un Pod individuel.

```bash
kubectl apply -f k8s/pod.yaml
kubectl apply -f k8s/service.yaml
```

Vérifier :

```bash
kubectl get pods
kubectl get svc
```

---

### Option B — Deployment

Cette option est recommandée pour les expérimentations Kubernetes.

```bash
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
```

Vérifier :

```bash
kubectl get pods
kubectl get deployments
kubectl get svc
```

Le Deployment démarre initialement **2 replicas** de l'application.

---

## 🌐 5. Accéder à l'application

Pour récupérer l'URL permettant d'accéder au Service :

```bash
minikube service mon-app-service --url
```

L'application Node.js est alors accessible depuis le navigateur.

---

# 🧪 Expérimentations Kubernetes

## 1. Auto-réparation — Self-Healing

Le Deployment maintient le nombre de replicas demandé.

Supprimer manuellement un Pod :

```bash
kubectl delete pod <nom-du-pod>
```

Puis observer les Pods :

```bash
kubectl get pods
```

Un nouveau Pod est automatiquement créé afin de revenir à l'état désiré.

**Objectif :** observer concrètement le principe de réconciliation de Kubernetes.

---

## 2. Scaling horizontal

Le Deployment possède initialement 2 replicas.

Passer à 5 replicas :

```bash
kubectl scale deployment mon-app-deployment --replicas=5
```

Vérifier :

```bash
kubectl get pods
```

Kubernetes crée automatiquement les Pods supplémentaires.

Revenir à 2 replicas :

```bash
kubectl scale deployment mon-app-deployment --replicas=2
```

---

## 3. Rolling Update

Le projet permet également d'expérimenter la mise à jour progressive de l'application.

Après modification du code :

```bash
docker build -t mon-app:v2 .
```

Puis mettre à jour le Deployment :

```bash
kubectl apply -f k8s/deployment.yaml
```

Observer le déploiement :

```bash
kubectl rollout status deployment mon-app-deployment
```

Et suivre les Pods en temps réel :

```bash
kubectl get pods -w
```

Kubernetes remplace progressivement les anciennes instances par les nouvelles.

---

## 4. Rollback

En cas de problème après une mise à jour, Kubernetes permet de revenir à une version précédente :

```bash
kubectl rollout undo deployment mon-app-deployment
```

Consulter l'historique :

```bash
kubectl rollout history deployment mon-app-deployment
```

Vérifier le statut :

```bash
kubectl rollout status deployment mon-app-deployment
```

---

# 🧠 Concepts Kubernetes abordés

Ce projet permet de mettre en pratique plusieurs concepts fondamentaux :

### Pod

Un **Pod** constitue la plus petite unité déployable de Kubernetes. Il encapsule un ou plusieurs conteneurs partageant le même environnement réseau.

### Deployment

Le **Deployment** permet de déclarer l'état souhaité de l'application, notamment le nombre de replicas.

Kubernetes veille ensuite à maintenir cet état.

### Service

Le **Service** fournit un point d'accès réseau stable vers les Pods correspondant à son `selector`.

### Labels & Selectors

Les labels permettent d'identifier les ressources Kubernetes.

Le Service utilise notamment :

```yaml
selector:
  app: mon-app
```

pour sélectionner les Pods correspondants.

### Réconciliation

Kubernetes compare en permanence :

```text
État désiré
     ↓
Deployment
     ↓
État réel du cluster
     ↓
Réconciliation
     ↓
Création / suppression / remplacement des Pods
```

C'est notamment ce mécanisme qui permet l'auto-réparation observée dans ce projet.

---

# 🔄 Architecture simplifiée

```text
                ┌─────────────────────┐
                │      Navigateur     │
                └──────────┬──────────┘
                           │
                           ▼
                ┌─────────────────────┐
                │   Kubernetes        │
                │      Service        │
                │     NodePort        │
                └──────────┬──────────┘
                           │
                 ┌─────────┴─────────┐
                 │                   │
                 ▼                   ▼
          ┌─────────────┐     ┌─────────────┐
          │    Pod 1    │     │    Pod 2    │
          │  Node.js    │     │  Node.js    │
          └─────────────┘     └─────────────┘
                 ▲                   ▲
                 │                   │
                 └─────────┬─────────┘
                           │
                    ┌──────────────┐
                    │  Deployment  │
                    │  replicas: 2 │
                    └──────────────┘
```

---

# 🛠️ Commandes Kubernetes utilisées

Quelques commandes essentielles utilisées dans ce projet :

```bash
kubectl get pods
kubectl get deployments
kubectl get svc

kubectl describe pod <nom-du-pod>
kubectl logs <nom-du-pod>

kubectl apply -f k8s/
kubectl delete -f k8s/

kubectl scale deployment mon-app-deployment --replicas=5

kubectl rollout status deployment mon-app-deployment
kubectl rollout history deployment mon-app-deployment
kubectl rollout undo deployment mon-app-deployment
```

---

# 📚 Ce que ce projet démontre

À travers ce projet, j'ai mis en pratique :

* Le workflow **code → image Docker → cluster Kubernetes**
* La création et le déploiement d'une application conteneurisée
* La différence entre **Pod** et **Deployment**
* L'exposition d'une application avec un **Service**
* Les **labels et selectors**
* L'auto-réparation des applications
* Le **scaling horizontal**
* Les **rolling updates**
* Le **rollback**
* Le modèle déclaratif de Kubernetes
* Le principe de **réconciliation automatique**
* L'utilisation quotidienne de `kubectl`
* L'organisation des manifests Kubernetes dans un répertoire `k8s/`

---

# 🔜 Prochaine étape

Ce projet constitue une première étape vers une architecture DevOps / Cloud plus complète.

La prochaine évolution sera de mettre en place une application **multi-services**, comprenant par exemple :

```text
API
 │
 ├── PostgreSQL
 │
 ├── Redis
 │
 └── Nginx
```

avec **Docker Compose**, avant d'évoluer progressivement vers un déploiement sur un **cluster Kubernetes managé** dans le Cloud.

---

## 🎓 Contexte

Projet réalisé dans le cadre de mon parcours d'auto-formation **DevOps / Cloud**, en parallèle de mon **Master 2 Ingénierie des Réseaux et des Systèmes (IRS) à l'Université Paris-Saclay**.

L'objectif est de développer progressivement des compétences pratiques en :

**Kubernetes · Docker · Cloud · DevOps · Systèmes · Réseaux · Cybersécurité**
