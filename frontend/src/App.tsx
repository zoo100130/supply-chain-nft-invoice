import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Navbar from './components/Navbar'
import Dashboard from './pages/Dashboard'
import CreateInvoice from './pages/CreateInvoice'
import TraceShipment from './pages/TraceShipment'
import Financing from './pages/Financing'
import MyInvoices from './pages/MyInvoices'

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/create" element={<CreateInvoice />} />
            <Route path="/trace" element={<TraceShipment />} />
            <Route path="/financing" element={<Financing />} />
            <Route path="/my-invoices" element={<MyInvoices />} />
          </Routes>
        </main>
        <Toaster position="top-right" />
      </div>
    </BrowserRouter>
  )
}

export default App
