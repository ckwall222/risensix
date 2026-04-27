import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './auth/AuthContext'
import { AuthGate } from './components/AuthGate'
import { Home } from './pages/Home'
import { SignUp } from './pages/SignUp'
import { SignIn } from './pages/SignIn'
import { Onboarding } from './pages/Onboarding'
import { Dashboard } from './pages/Dashboard'
import { LessonPage } from './pages/LessonPage'
import { FocusAreaPage } from './pages/FocusAreaPage'
import { TheoryList } from './pages/TheoryList'
import { TheoryDetail } from './pages/TheoryDetail'
import { ChordsPage } from './pages/ChordsPage'
import { TunerPage } from './pages/TunerPage'
import { MetronomePage } from './pages/MetronomePage'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/onboarding" element={<AuthGate><Onboarding /></AuthGate>} />
          <Route path="/dashboard" element={<AuthGate requireOnboarded><Dashboard /></AuthGate>} />
          <Route path="/focus/:id" element={<AuthGate requireOnboarded><FocusAreaPage /></AuthGate>} />
          <Route path="/lessons/:slug" element={<AuthGate requireOnboarded><LessonPage /></AuthGate>} />
          <Route path="/theory" element={<AuthGate requireOnboarded><TheoryList /></AuthGate>} />
          <Route path="/theory/:id" element={<AuthGate requireOnboarded><TheoryDetail /></AuthGate>} />
          <Route path="/chords" element={<AuthGate requireOnboarded><ChordsPage /></AuthGate>} />
          <Route path="/tuner" element={<AuthGate requireOnboarded><TunerPage /></AuthGate>} />
          <Route path="/metronome" element={<AuthGate requireOnboarded><MetronomePage /></AuthGate>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
