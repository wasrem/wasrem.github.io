import { useOutlet } from "react-router-dom"
import NavBar from "./components/NavBar"
import Footer from "./components/Footer"

function App() {
  const currentOutlet = useOutlet()

  return (
    <div className="flex flex-col min-h-screen">
      <NavBar />
      <main className="flex-grow">{currentOutlet}</main>
      <Footer />
    </div>
  )
}

export default App
