import { Route, Routes } from 'react-router-dom'
import { AppShell } from './components/AppShell'
import { QuickPage } from './pages/QuickPage'
import { AdvancedPage } from './pages/AdvancedPage'
import { SightingsPage } from './pages/SightingsPage'
import { StatisticsPage } from './pages/StatisticsPage'
import { FleetsPage } from './pages/FleetsPage'
import { FleetDetailPage } from './pages/FleetDetailPage'
import { VehicleDetailPage } from './pages/VehicleDetailPage'
import { MapPage } from './pages/MapPage'

function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<AdvancedPage />} />
        <Route path="/quick" element={<QuickPage />} />
        <Route path="/sightings" element={<SightingsPage />} />
        <Route path="/statistics" element={<StatisticsPage />} />
        <Route path="/fleets" element={<FleetsPage />} />
        <Route path="/fleets/:id" element={<FleetDetailPage />} />
        <Route path="/vehicles/:id" element={<VehicleDetailPage />} />
        <Route path="/map" element={<MapPage />} />
      </Routes>
    </AppShell>
  )
}

export default App
