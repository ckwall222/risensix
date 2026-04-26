import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './auth/AuthContext'
import { AuthGate } from './components/AuthGate'
import { Home } from './pages/Home'
import { SignUp } from './pages/SignUp'
import { SignIn } from './pages/SignIn'
import { Onboarding } from './pages/Onboarding'
import { Dashboard } from './pages/Dashboard'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/signin" element={<SignIn />} />
          <Route
            path="/onboarding"
            element={
              <AuthGate>
                <Onboarding />
              </AuthGate>
            }
          />
          <Route
            path="/dashboard"
            element={
              <AuthGate requireOnboarded>
                <Dashboard />
              </AuthGate>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
