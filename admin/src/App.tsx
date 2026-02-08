import SidebarLayout from "./components/layouts/SidebarLayout"
import AppRoutes from "./routes/appRoutes"
import { Toaster } from "@/components/ui/sonner"

const App = () => {
  return (
    <SidebarLayout>
      <AppRoutes />
      <Toaster position="bottom-right" richColors />
    </SidebarLayout>
  )
}

export default App
