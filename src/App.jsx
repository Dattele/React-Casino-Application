import { BrowserRouter, Routes, Route } from 'react-router-dom';

import { BalanceProvider } from './Context/BalanceContext';

import CasinoPage from './Pages/CasinoPage';
import BlackJackPage from './Pages/BlackJackPage';
import RoulettePage from './Pages/RoulettePage';

import './All.scss';
import './App.scss';

function App() {
  return (
    <BalanceProvider>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<CasinoPage />} />
          <Route path='/BlackJack' element={<BlackJackPage />} />
          <Route path='/Roulette' element={<RoulettePage />} />
          {/* <Route path="/Texas Hold'em" className="Button">Texas Hold'em</Route> 
        <Route path='/Slot Machine' className="Button">SlotMachine</Route>  */}
        </Routes>
      </BrowserRouter>
    </BalanceProvider>
  );
}

export default App;
