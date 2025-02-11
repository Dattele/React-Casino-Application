import { BrowserRouter, Routes, Route } from "react-router-dom";

import CasinoPage from "./Pages/CasinoPage";
import BlackJackPage from "./Pages/BlackJackPage";
import "./all.scss";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<CasinoPage />} />
        <Route path='/BlackJack' element={<BlackJackPage />} />
        {/* <Route path='/Roulette' className="Button">Roulette</Route> 
        <Route path="/Texas Hold'em" className="Button">Texas Hold'em</Route> 
        <Route path='/Slot Machine' className="Button">SlotMachine</Route>  */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
