import Navbar from "./components/layouts/navbar"
import AppRoutes from "./routes/appRoutes"
import { Toaster } from "@/components/ui/sonner"


const App = () => {
  return (
    <main className="min-h-screen bg-muted/30">
      <Navbar />
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <AppRoutes />
      </div>
      <Toaster position="bottom-right" richColors />
    </main>
  )
}

export default App
