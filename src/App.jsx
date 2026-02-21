/**
 * App.jsx
 * Main app with React Router, Layout wrapper, and lazy-loaded pages.
 */
import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';

// Lazy-load all pages for code splitting
const Landing = lazy(() => import('./pages/Landing'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Assessment = lazy(() => import('./pages/Assessment'));
const SprintTest = lazy(() => import('./pages/SprintTest'));
const TTestDrill = lazy(() => import('./pages/TTestDrill'));
const PushUpTest = lazy(() => import('./pages/PushUpTest'));
const VerticalJump = lazy(() => import('./pages/VerticalJump'));
const BeepTest = lazy(() => import('./pages/BeepTest'));
const TargetAccuracy = lazy(() => import('./pages/TargetAccuracy'));
const ReactionTest = lazy(() => import('./pages/ReactionTest'));
const CoachDashboard = lazy(() => import('./pages/CoachDashboard'));
const TestSelector = lazy(() => import('./pages/TestSelector'));
const AuthPage = lazy(() => import('./pages/AuthPage'));
const CombatReaction = lazy(() => import('./pages/CombatReaction'));

function LoadingFallback() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      minHeight: '60vh', flexDirection: 'column', gap: '16px',
    }}>
      <div style={{
        width: '40px', height: '40px', border: '3px solid var(--glass-border)',
        borderTopColor: 'var(--neon-green)', borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Loading module...</div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<AuthPage />} />
            <Route path="/signup" element={<AuthPage />} />
            <Route path="/select-test" element={<TestSelector />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/assessment" element={<Assessment />} />
            <Route path="/coach" element={<CoachDashboard />} />

            {/* Module 1: Speed & Agility */}
            <Route path="/test/sprint" element={<SprintTest />} />
            <Route path="/test/t-test" element={<TTestDrill />} />

            {/* Module 2: Strength */}
            <Route path="/test/pushups" element={<PushUpTest />} />
            <Route path="/test/vertical-jump" element={<VerticalJump />} />

            {/* Module 3: Endurance */}
            <Route path="/test/beep" element={<BeepTest />} />

            {/* Module 4: Skill Accuracy */}
            <Route path="/test/target" element={<TargetAccuracy />} />

            {/* Module 5: Reaction Time */}
            <Route path="/test/reaction" element={<ReactionTest />} />

            {/* Module 6: Combat Sports */}
            <Route path="/test/combat-reaction" element={<CombatReaction />} />
          </Routes>
        </Suspense>
      </Layout>
    </BrowserRouter>
  );
}
