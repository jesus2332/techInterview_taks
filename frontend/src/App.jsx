import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router';
import TaskListPage from './pages/TaskListPage';
import TaskFormPage from './pages/TaskFormPage';
import { Toaster } from "@/components/ui/sonner";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        
        <header className="bg-white dark:bg-gray-800 shadow-md">
          <nav className="container mx-auto px-4 py-3 flex justify-between items-center">
            <h1 to="/" className="text-xl font-bold text-blue-600 dark:text-blue-400">
              Gestor de Tareas
            </h1>
          </nav>
        </header>

    
        <main className="container mx-auto p-4">
          <Routes>
            <Route path="/" element={<TaskListPage />} />
            <Route path="/nueva-tarea" element={<TaskFormPage isEditing={false} />} />
            <Route path="/editar-tarea/:id" element={<TaskFormPage isEditing={true} />} />
             <Route path="*" element={<NotFound />} />
          </Routes>
        </main>

         

         <Toaster richColors position="top-right" />
      </div>
    </Router>
  );
}

function NotFound() {
  return (
    <div className="text-center mt-20">
      <h2 className="text-3xl font-semibold mb-4">404 - Página No Encontrada</h2>
      <p className="text-gray-600 dark:text-gray-400 mb-6">Lo sentimos, la página que buscas no existe.</p>
      <Link to="/">
        <Button variant="link">Volver al Inicio</Button>
      </Link>
    </div>
  );
}


export default App;