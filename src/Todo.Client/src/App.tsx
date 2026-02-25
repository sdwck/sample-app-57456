import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import TodosPage from './pages/TodosPage';
import MailPage from './pages/MailPage';
import TodoDetailPage from './pages/TodoDetailPage';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-900 text-gray-300 font-sans">
        <nav className="p-4 border-b border-gray-700 flex gap-6 items-center">
          <h1 className="text-xl font-bold text-white">LabApp</h1>
          <Link to="/" className="hover:text-white">ToDos</Link>
          <Link to="/mail" className="hover:text-white">Mail</Link>
        </nav>
        
        <div className="p-4">
          <Routes>
            <Route path="/" element={<TodosPage />} />
            <Route path="/todos/:id" element={<TodoDetailPage />} />
            <Route path="/mail" element={<MailPage />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}