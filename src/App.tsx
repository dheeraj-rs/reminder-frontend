import { BrowserRouter, Route, Routes } from "react-router-dom"
import Homepage from "./pages/Homepage"
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css";
import { Singnin } from "./pages/Singnin";
import { Singnup } from "./pages/Singnup";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/login" element={<Singnin />} />
        <Route path="/register" element={<Singnup />} />
      </Routes>
      <ToastContainer />
    </BrowserRouter>
  )
}

export default App
