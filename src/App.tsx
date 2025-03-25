import { Route, Routes } from 'react-router-dom';
import './App.css';
import Home from './pages/Home';
import Auth from './pages/Auth';
import EditTask from './pages/EditTask';
import Tasks from './pages/Tasks';
import Pnf from './pages/Pnf';

const App: React.FC = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Auth insideRegister={true} />} />
        <Route path="/login" element={<Auth insideRegister={false} />} /> 
        <Route path="/edit-task/:id" element={<EditTask />} />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/pnf" element={<Pnf />} />
      </Routes>
    </>
  );
};

export default App;
