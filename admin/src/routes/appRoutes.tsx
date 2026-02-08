import { Routes, Route } from 'react-router-dom'
import Login from '@/pages/auth/login'
import Dashboard from '@/pages/dashboard/dashboard'
import AgenciesList from '@/pages/agencies/AgenciesList'
import AgencyDetail from '@/pages/agencies/AgencyDetail'
import ReportsList from '@/pages/reports/ReportsList'
import PrivateRoutes from './privateRoutes'

const AppRoutes = () => {
  return (
    <Routes>
      <Route element={<PrivateRoutes />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/agencies" element={<AgenciesList />} />
        <Route path="/agencies/:id" element={<AgencyDetail />} />
        <Route path="/reports" element={<ReportsList />} />
      </Route>

      <Route path="/login" element={<Login />} />
    </Routes>
  )
}

export default AppRoutes
