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
import { ChromaticTunerPage } from './pages/ChromaticTunerPage'
import { MetronomePage } from './pages/MetronomePage'
import { CircleToolPage } from './pages/CircleToolPage'
import { DailyPage } from './pages/DailyPage'
import { LicksPage } from './pages/LicksPage'
import { LickDetailPage } from './pages/LickDetailPage'
import { JamPage } from './pages/JamPage'
import { SongbookPage } from './pages/SongbookPage'
import { SongDetailPage } from './pages/SongDetailPage'
import { RoutinePage } from './pages/RoutinePage'

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
          <Route path="/tuner/advanced" element={<AuthGate requireOnboarded><ChromaticTunerPage /></AuthGate>} />
          <Route path="/metronome" element={<AuthGate requireOnboarded><MetronomePage /></AuthGate>} />
          <Route path="/circle" element={<AuthGate requireOnboarded><CircleToolPage /></AuthGate>} />
          <Route path="/daily" element={<AuthGate requireOnboarded><DailyPage /></AuthGate>} />
          <Route path="/licks" element={<AuthGate requireOnboarded><LicksPage /></AuthGate>} />
          <Route path="/licks/:slug" element={<AuthGate requireOnboarded><LickDetailPage /></AuthGate>} />
          <Route path="/jam" element={<AuthGate requireOnboarded><JamPage /></AuthGate>} />
          <Route path="/songs" element={<AuthGate requireOnboarded><SongbookPage /></AuthGate>} />
          <Route path="/songs/:slug" element={<AuthGate requireOnboarded><SongDetailPage /></AuthGate>} />
          <Route path="/routine" element={<AuthGate requireOnboarded><RoutinePage /></AuthGate>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
