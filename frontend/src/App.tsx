import { Route, Routes } from 'react-router-dom'
import { AppShell } from './components/AppShell'
import { AuthGate } from './components/AuthGate'
import { QuickPage } from './pages/QuickPage'
import { AdvancedPage } from './pages/AdvancedPage'
import { SightingsPage } from './pages/SightingsPage'
import { SightingDetailPage } from './pages/SightingDetailPage'
import { StatisticsPage } from './pages/StatisticsPage'
import { FleetsPage } from './pages/FleetsPage'
import { FleetDetailPage } from './pages/FleetDetailPage'
import { VehicleDetailPage } from './pages/VehicleDetailPage'
import { MapPage } from './pages/MapPage'
import { FormationPage } from './pages/FormationPage'
import { FormationSamplesPage } from './pages/FormationSamplesPage'

function App() {
  return (
    <AuthGate>
      <AppShell>
        <Routes>
          <Route path="/" element={<AdvancedPage />} />
          <Route path="/quick" element={<QuickPage />} />
          <Route path="/sightings" element={<SightingsPage />} />
          <Route path="/sightings/:id" element={<SightingDetailPage />} />
          <Route path="/statistics" element={<StatisticsPage />} />
          <Route path="/fleets" element={<FleetsPage />} />
          <Route path="/fleets/:id" element={<FleetDetailPage />} />
          <Route path="/vehicles/:id" element={<VehicleDetailPage />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/formation" element={<FormationPage />} />
          <Route path="/secret/formations" element={<FormationSamplesPage />} />
        </Routes>
      </AppShell>
    </AuthGate>
  )
}

export default App
