import './App.css';
import ColorPaletteGenerator from './cooler';
import { BrowserRouter as Router, Routes, Route} from "react-router-dom";  
function App() {
  return (
    <div className="App">
      <Router >
        <Routes>
      <Route path='/' element={<ColorPaletteGenerator />} />
      
        </Routes>
      </Router>
    </div>
  );
}

export default App;
