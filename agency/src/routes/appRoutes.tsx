import { Routes, Route } from 'react-router-dom'
import Login from '@/pages/auth/login'
import Register from '@/pages/auth/register'
import SetPassword from '@/pages/auth/set-password'
import Dashboard from '@/pages/dashboard/dashboard'
import PropertiesList from '@/pages/properties/PropertiesList'
import PropertyNew from '@/pages/properties/PropertyNew'
import PropertyDetail from '@/pages/properties/PropertyDetail'
import SubscriptionPage from '@/pages/subscriptions/SubscriptionPage'
import EngagementPage from '@/pages/social/EngagementPage'
import ConversationsList from '@/pages/messaging/ConversationsList'
import ConversationThread from '@/pages/messaging/ConversationThread'
import AccountPage from '@/pages/account/AccountPage'
import PrivateRoutes from './privateRoutes'

const AppRoutes = () => {
  return (
    <Routes>
      <Route element={<PrivateRoutes />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/properties" element={<PropertiesList />} />
        <Route path="/properties/new" element={<PropertyNew />} />
        <Route path="/properties/:id" element={<PropertyDetail />} />
        <Route path="/subscription" element={<SubscriptionPage />} />
        <Route path="/engagement" element={<EngagementPage />} />
        <Route path="/messages" element={<ConversationsList />} />
        <Route path="/messages/:id" element={<ConversationThread />} />
        <Route path="/account" element={<AccountPage />} />
      </Route>

      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/set-password" element={<SetPassword />} />
    </Routes>
  )
}

export default AppRoutes
