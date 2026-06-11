import { Route, Routes } from 'react-router-dom'
import { AppShell } from './components/AppShell'
import { QuickPage } from './pages/QuickPage'
import { AdvancedPage } from './pages/AdvancedPage'
import { SightingsPage } from './pages/SightingsPage'

function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<QuickPage />} />
        <Route path="/advanced" element={<AdvancedPage />} />
        <Route path="/sightings" element={<SightingsPage />} />
      </Routes>
    </AppShell>
  )
}

export default App
