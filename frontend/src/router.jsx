import React from 'react';
import { Navigate, Routes, Route } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';

// Pages principales
import Dashboard from './pages/Dashboard';
import NotFound from './pages/NotFound';
import Layout from './components/Layout';
import AuthLayout from './components/AuthLayout';

// Pages d'authentification
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import SecuritySettings from './pages/auth/SecuritySettings';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import VerifyEmail from './pages/auth/VerifyEmail';
import UserSettings from './pages/auth/UserSettings';

// Pages de paramètres globaux
import ParametresList from './pages/parametres/ParametresList';
import ParametreForm from './pages/parametres/ParametreForm';
import ParametresEntrepriseFixed from './pages/parametres/ParametresEntrepriseFixed';

// Pages de gestion
import AffairesList from './pages/affaires/AffairesList';
import AffairesListApple from './pages/affaires/AffairesListApple';
import AffaireForm from './pages/affaires/AffaireForm';
import AffaireDetails from './pages/affaires/AffaireDetails';
import AffaireEstimationAchats from './pages/affaires/AffaireEstimationAchats';
import AffaireAchatsUnifiedPage from './pages/affaires/AffaireAchatsUnifiedPage';
import ResultatsAffaires from './pages/affaires/ResultatsAffaires';
import ResultatsAffairesSimple from './pages/affaires/ResultatsAffairesSimple';

import DevisList from './pages/devis/DevisList';
import DevisForm from './pages/devis/DevisForm';

import FournisseursList from './pages/fournisseurs/FournisseursList';
import FournisseurForm from './pages/fournisseurs/FournisseurForm';

import Achats from './pages/Achats';
import AchatForm from './pages/achats/AchatForm';
import RapprochementAchats from './pages/RapprochementAchats';
import AchatsUnified from './pages/AchatsUnified';

import BdcList from './pages/achat/BdcList';
import BdcForm from './pages/achat/BdcForm';
import BdcDetails from './pages/achat/BdcDetails';

<<<<<<< HEAD

=======
import Pointages from './pages/Pointages';
import PointageCalendarView from './pages/pointage/PointageCalendarView';
import PointageForm from './pages/pointage/PointageForm';
import PointageValidation from './pages/pointage/PointageValidation';
import PointageStats from './pages/pointage/PointageStats';
>>>>>>> 80cb882ec299a5d98cb64db70adf5b22510865cd

import UsersList from './pages/users/UsersList';
import UsersForm from './pages/users/UserForm';

import AnalysesAvancees from './pages/reporting/AnalysesAvancees';
import Migration from './pages/Migration';
import Notifications from './pages/Notifications';

// Planning
import PlanningList from './pages/planning/PlanningList';
import PlanningForm from './pages/planning/PlanningForm';
<<<<<<< HEAD
=======
import PlanningInteractifPage from './pages/PlanningInteractifPage';
import PlanningInteractifFullPage from './pages/PlanningInteractifFullPage';
>>>>>>> 80cb882ec299a5d98cb64db70adf5b22510865cd
import FullPageLayout from './components/FullPageLayout';

// Autres pages
import Chantiers from './pages/Chantiers';
import Planification from './pages/Planification';
import Ressources from './pages/Ressources';
import TempsPasse from './pages/TempsPasse';

import TaskList from './pages/task/TaskList';
import TaskForm from './pages/task/TaskForm';
import UserList from './pages/user/UserList';
import UserForm from './pages/user/UserForm';

import FirebaseTestPage from './pages/test/FirebaseTestPage';
import PdfTestDiagnostic from './components/test/PdfTestDiagnostic';
<<<<<<< HEAD

=======
import ClaudeTestPage from './pages/ClaudeTestPage';
import ClaudeAssistantPage from './pages/ClaudeAssistantPage';
import TestPlanning from './pages/TestPlanning';
>>>>>>> 80cb882ec299a5d98cb64db70adf5b22510865cd
import TestCouleursPlanningEquipe from './pages/TestCouleursPlanningEquipe';
import PlanningTest from './components/test/PlanningTest';
import TestCalculFraisGeneraux from './components/test/TestCalculFraisGeneraux';

// Module Frais Généraux
import FraisGenerauxPage from './pages/frais-generaux/FraisGenerauxPage';

// Module OptiCoupe
import OptiCoupeDashboard from './pages/OptiCoupe/OptiCoupeDashboard';
import PanneauxPage from './pages/OptiCoupe/PanneauxPage';
import ProjetsPage from './pages/OptiCoupe/ProjetsPage';
import OptimisationPage from './pages/OptiCoupe/OptimisationPage';
import ResultatsPage from './pages/OptiCoupe/ResultatsPage';
import CutListOptimizer from './pages/OptiCoupe/CutListOptimizer';

// Module Planning Équipe
import PlanningEquipe from './pages/planning/PlanningEquipe';

<<<<<<< HEAD
// Module Améliorations CRM
import AmeliorationsList from './pages/ameliorations/AmeliorationsList';
import AmeliorationForm from './pages/ameliorations/AmeliorationForm';
import AmeliorationDetails from './pages/ameliorations/AmeliorationDetails';




=======
// Module CACA Boudin
import CacaBoudin from './pages/CacaBoudin';

// Module Gestion des Heures
import GestionHeures from './pages/GestionHeures';
>>>>>>> 80cb882ec299a5d98cb64db70adf5b22510865cd

// Composant pour protéger les routes
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <div>Chargement...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" />;
  }
  
  return children;
};

// Composant pour les routes publiques
const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  
  if (isAuthenticated) {
    return <Navigate to="/" />;
  }
  
  return children;
};

// Définition du routeur avec les routes
const Router = () => {
  return (
    <Routes>
      {/* Routes d'authentification */}
      <Route path="/auth" element={<AuthLayout />}>
        <Route path="login" element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } />
        <Route path="register" element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        } />
        <Route path="forgot-password" element={
          <PublicRoute>
            <ForgotPassword />
          </PublicRoute>
        } />
        <Route path="reset-password/:token" element={
          <PublicRoute>
            <ResetPassword />
          </PublicRoute>
        } />
        <Route path="verify-email/:token" element={<VerifyEmail />} />
      </Route>
      
      {/* Routes protégées */}
      <Route path="/" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<AffairesList />} />
        
        {/* Route pour le tableau de bord */}
        <Route path="dashboard" element={<Dashboard />} />
        
        {/* Routes de planning */}
        <Route path="plannings">
          <Route index element={<PlanningList />} />
          <Route path="nouveau" element={<PlanningForm />} />
          <Route path=":id" element={<PlanningForm />} />
        </Route>
        
        {/* Module Planning Équipe */}
        <Route path="planning-equipe" element={<PlanningEquipe />} />
        
        {/* Routes de tâches */}
        <Route path="taches">
          <Route index element={<TaskList />} />
          <Route path="nouveau" element={<TaskForm />} />
          <Route path=":id" element={<TaskForm />} />
        </Route>
        
        {/* Routes de collaborateurs */}
        <Route path="collaborateurs">
          <Route index element={<UserList />} />
          <Route path="nouveau" element={<UserForm />} />
          <Route path=":id" element={<UserForm />} />
        </Route>

        {/* Routes de gestion de l'équipe */}
        <Route path="users">
          <Route index element={<UsersList />} />
          <Route path="nouveau" element={<UsersForm />} />
          <Route path=":id/modifier" element={<UsersForm />} />
        </Route>
        
        {/* Routes de chantiers */}
        <Route path="chantiers" element={<Chantiers />} />
        
        {/* Routes des affaires */}
        <Route path="affaires">
          <Route index element={<AffairesList />} />
          <Route path="apple" element={<AffairesListApple />} />
          <Route path="nouveau" element={<AffaireForm />} />
          <Route path=":id" element={<AffaireDetails />} />
          <Route path=":id/modifier" element={<AffaireForm />} />
          <Route path=":id/estimation-achats" element={<AffaireEstimationAchats />} />

          <Route path=":id/achats-unified" element={<AffaireAchatsUnifiedPage />} />
          <Route path="resultats" element={<ResultatsAffaires />} />
          <Route path="resultats-simple" element={<ResultatsAffairesSimple />} />
        </Route>
        
        {/* Routes des devis */}
        <Route path="devis">
          <Route index element={<DevisList />} />
          <Route path="nouveau" element={<DevisForm />} />
          <Route path=":id/modifier" element={<DevisForm />} />
        </Route>
        
        {/* Routes d'achats unifiées */}
        <Route path="achats">
          <Route index element={<AchatsUnified />} />
          <Route path="factures/nouveau" element={<AchatForm />} />
          <Route path="factures/:id/modifier" element={<AchatForm />} />
          {/* Routes individuelles pour accès direct (rétrocompatibilité) */}
          <Route path="factures" element={<Achats />} />
          <Route path="bdc" element={<BdcList />} />
          <Route path="rapprochement" element={<RapprochementAchats />} />
        </Route>
        <Route path="bdc">
          <Route index element={<BdcList />} />
          <Route path="nouveau" element={<BdcForm />} />
          <Route path=":id" element={<BdcDetails />} />
          <Route path=":id/modifier" element={<BdcForm />} />
        </Route>
        
        {/* Routes des fournisseurs */}
        <Route path="fournisseurs">
          <Route index element={<FournisseursList />} />
          <Route path="nouveau" element={<FournisseurForm />} />
          <Route path=":id/modifier" element={<FournisseurForm />} />
        </Route>
        
        {/* Routes des frais généraux */}
        <Route path="frais-generaux" element={<FraisGenerauxPage />} />
        
        {/* Routes OptiCoupe - Optimisation de découpe */}
        <Route path="opti-coupe">
          <Route index element={<OptiCoupeDashboard />} />
          <Route path="panneaux" element={<PanneauxPage />} />
          <Route path="projets" element={<ProjetsPage />} />
          <Route path="optimisation" element={<OptimisationPage />} />
          <Route path="resultats" element={<ResultatsPage />} />
          <Route path="debit" element={<CutListOptimizer />} />
        </Route>
        
<<<<<<< HEAD
        {/* Routes Améliorations CRM */}
        <Route path="ameliorations">
          <Route index element={<AmeliorationsList />} />
          <Route path="nouveau" element={<AmeliorationForm />} />
          <Route path=":id" element={<AmeliorationDetails />} />
          <Route path=":id/modifier" element={<AmeliorationForm />} />
=======
        {/* Routes de Pointages - Page principale avec onglets intégrés */}
        <Route path="pointages" element={<Pointages />} />
        
        {/* Route de Gestion des Heures */}
        <Route path="gestion-heures" element={<GestionHeures />} />
        
        {/* Route CACA Boudin */}
        <Route path="caca-boudin" element={<CacaBoudin />} />
        
        {/* Routes individuelles pour les pointages (pour navigation directe si nécessaire) */}
        <Route path="pointage">
          <Route path="calendrier" element={<PointageCalendarView />} />
          <Route path="saisie" element={<PointageForm />} />
          <Route path="saisie/:id" element={<PointageForm />} />
          <Route path="validation" element={<PointageValidation />} />
          <Route path="statistiques" element={<PointageStats />} />
>>>>>>> 80cb882ec299a5d98cb64db70adf5b22510865cd
        </Route>
        
        {/* Routes d'inventaire - MODULE EN SOMMEIL */}
        {/* <Route path="inventaire">
          <Route index element={<InventaireList />} />
          <Route path="stats" element={<InventaireStats />} />
        </Route> */}
        
        {/* Routes des paramètres */}
        <Route path="parametres" element={<UserSettings />} />
        
        {/* Routes des paramètres globaux */}
        <Route path="parametres-globaux">
          <Route index element={<ParametresList />} />
          <Route path="nouveau" element={<ParametreForm />} />
          <Route path=":id/modifier" element={<ParametreForm />} />
        </Route>
        
        {/* Route des paramètres d'entreprise */}
        <Route path="parametres-entreprise" element={<ParametresEntrepriseFixed />} />
        
        {/* Routes des articles - MODULE EN SOMMEIL */}
        {/* <Route path="articles">
          <Route index element={<ArticlesList />} />
          <Route path="nouveau" element={<ArticleForm />} />
          <Route path=":id" element={<ArticleDetails />} />
          <Route path=":id/modifier" element={<ArticleForm />} />
        </Route> */}
        
        {/* Routes de reporting avancé */}
        <Route path="analyses-avancees" element={<AnalysesAvancees />} />
        
        {/* Route de migration Excel */}
        <Route path="migration" element={<Migration />} />
        
        {/* Route des notifications */}
        <Route path="notifications" element={<Notifications />} />
        
        {/* Profil utilisateur - redirigé vers les paramètres */}
        <Route path="profil" element={<Navigate to="/parametres" replace />} />
        
        {/* Paramètres de sécurité - redirigé vers les paramètres */}
        <Route path="securite" element={<Navigate to="/parametres" replace />} />
        
        {/* Routes de planification */}
        <Route path="planification" element={<Planification />} />
        
        {/* Routes de ressources */}
        <Route path="ressources" element={<Ressources />} />
        
        {/* Routes de temps passé */}
        <Route path="temps-passe" element={<TempsPasse />} />
        
        {/* Route de test Firebase */}
        <Route path="firebase-test" element={<FirebaseTestPage />} />
        
<<<<<<< HEAD
        {/* Route de diagnostic PDF */}
        <Route path="pdf-diagnostic" element={<PdfTestDiagnostic />} />
        

=======
        {/* Route de test Claude */}
        <Route path="claude-test" element={<ClaudeTestPage />} />
        
        {/* Route Claude Assistant */}
        <Route path="claude" element={<ClaudeAssistantPage />} />
        
        {/* Route de diagnostic PDF */}
        <Route path="pdf-diagnostic" element={<PdfTestDiagnostic />} />
        
        {/* Route de test Planning Interactif */}
        <Route path="test-planning" element={<TestPlanning />} />
>>>>>>> 80cb882ec299a5d98cb64db70adf5b22510865cd
        
        {/* Route de test Couleurs Planning Équipe */}
        <Route path="test-couleurs-planning-equipe" element={<TestCouleursPlanningEquipe />} />
        
        {/* Route de test Planning Affaire */}
        <Route path="test-planning-affaire" element={<PlanningTest />} />
        <Route path="test-frais-generaux" element={<TestCalculFraisGeneraux />} />
        
<<<<<<< HEAD

      </Route>


=======
        {/* Route Planning Interactif intégré */}
        <Route path="planning-interactif" element={<PlanningInteractifPage />} />
      </Route>

      {/* Route Planning Pleine Page */}
      <Route path="/planning-fullpage" element={
        <ProtectedRoute>
          <FullPageLayout>
            <PlanningInteractifFullPage />
          </FullPageLayout>
        </ProtectedRoute>
      } />
>>>>>>> 80cb882ec299a5d98cb64db70adf5b22510865cd
      
      {/* Page 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default Router; 