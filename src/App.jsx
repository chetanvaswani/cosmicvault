import SignupPage from './Signup.jsx';
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import Home from './Home.jsx';

function App() {
  return (
    <div className='App'>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path="add-wallet" element={<SignupPage />} />
        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App;
