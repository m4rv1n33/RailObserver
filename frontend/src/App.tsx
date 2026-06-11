import { Route, Routes } from 'react-router-dom'
import { AppShell } from './components/AppShell'
import { QuickPage } from './pages/QuickPage'
import { AdvancedPage } from './pages/AdvancedPage'
import { SightingsPage } from './pages/SightingsPage'
import { StatisticsPage } from './pages/StatisticsPage'
import { FleetsPage } from './pages/FleetsPage'
import { FleetDetailPage } from './pages/FleetDetailPage'
import { VehicleDetailPage } from './pages/VehicleDetailPage'

function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<QuickPage />} />
        <Route path="/advanced" element={<AdvancedPage />} />
        <Route path="/sightings" element={<SightingsPage />} />
        <Route path="/statistics" element={<StatisticsPage />} />
        <Route path="/fleets" element={<FleetsPage />} />
        <Route path="/fleets/:id" element={<FleetDetailPage />} />
        <Route path="/vehicles/:id" element={<VehicleDetailPage />} />
      </Routes>
    </AppShell>
  )
}

export default App
