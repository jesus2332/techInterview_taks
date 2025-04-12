import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router';
import TaskCard from '../components/TaskCard';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import * as api from '../services/api'; 
import { toast } from "sonner"; 
import { Loader2, FilterX, ListPlus, ListX } from "lucide-react"; 

const TaskListPage = () => {

  const [tasks, setTasks] = useState([]);
  const [priorities, setPriorities] = useState([]);
  const [statuses, setStatuses] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filterPriority, setFilterPriority] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const loadInitialData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [tasksData, prioritiesData, statusesData] = await Promise.all([
        api.fetchTasks(),
        api.fetchPriorities(),
        api.fetchStatuses()
      ]);
      setTasks(tasksData || []); 
      setPriorities(prioritiesData || []);
      setStatuses(statusesData || []);
    } catch (err) {
      setError('Error al cargar los datos iniciales.');
      toast.error(`Error al cargar datos: ${err.message || 'Error desconocido'}`);
      console.error("Error fetching initial data:", err);
      setTasks([]);
      setPriorities([]);
      setStatuses([]);
    } finally {
      setIsLoading(false);
    }
  }, []); 

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]); 

  // Función para manejar la eliminación de tareas
  const handleDelete = async (id) => {
    if (!window.confirm(`¿Realmente quieres eliminar la tarea?`)) {
       return;
     }

    const originalTasks = [...tasks]; // Guarda el estado original
    setTasks(prevTasks => prevTasks.filter(task => task.id !== id));

    try {
      await api.deleteTask(id);
      toast.success('Tarea eliminada correctamente.');
    } catch (err) {
      toast.error(`Error al eliminar la tarea: ${err.message}`);
      console.error("Error deleting task:", err);
      //Si la Api falla revertir al estado original
      setTasks(originalTasks);
      setError("No se pudo eliminar la tarea. Inténtalo de nuevo.");
    }
  };

  const filteredTasks = useMemo(() => {
    if (!tasks || tasks.length === 0) return [];

    return tasks.filter(task => {
      //Comprobar si la prioridad/estado coincide o si el filtro de prioridad está vacío
      //  la tarea debe cumplir ambas condiciones
   
      const priorityMatch = !filterPriority || String(task.prioridad_id) === filterPriority;
      const statusMatch = !filterStatus || String(task.estado_id) === filterStatus;
      return priorityMatch && statusMatch;
    });
  }, [tasks, filterPriority, filterStatus]); 

  const clearFilters = () => {
    setFilterPriority('');
    setFilterStatus('');
    toast.info("Filtros limpiados.");
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-60 flex-col text-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
          <p className="text-lg text-muted-foreground">Cargando tareas...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center mt-10 p-6 bg-destructive/10 border border-destructive rounded-lg">
          <p className="text-destructive font-semibold text-lg">{error}</p>
          <Button onClick={loadInitialData} variant="destructive" className="mt-4">
            Reintentar Carga
          </Button>
        </div>
      );
    }

    if (tasks.length === 0) {
        return (
            <div className="text-center mt-16 p-8 border-2 border-dashed rounded-lg">
                <ListX className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No hay tareas todavía</h3>
                <p className="text-muted-foreground mb-6">Crea una tarea</p>
                <Link to="/nueva-tarea">
                  <Button>
                    <ListPlus className="mr-2 h-4 w-4" /> Crear Tarea
                  </Button>
                </Link>
            </div>
        );
    }


    if (filteredTasks.length === 0 && tasks.length > 0) {
      return (
        <div className="text-center mt-10 p-6 bg-secondary/30 border border-secondary rounded-lg">
          <FilterX className="mx-auto h-10 w-10 text-muted-foreground mb-4" />
          <p className="text-lg font-medium mb-4">No hay tareas que coincidan con los filtros.</p>
          <Button variant="outline" onClick={clearFilters}>
            Limpiar Filtros
          </Button>
        </div>
      );
    }

  
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        {filteredTasks.map(task => (
          <TaskCard key={task.id} task={task} onDelete={handleDelete} />
        ))}
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-6 md:px-6 md:py-8">
     
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4 border-b pb-4">
        <h1 className="text-3xl font-bold tracking-tight">Mis Tareas</h1>
        {!isLoading && !error && (
            <Link to="/nueva-tarea">
            <Button>
                <ListPlus className="mr-2 h-4 w-4" /> Crear Tarea
            </Button>
            </Link>
        )}
      </div>

       {/* Sección de Filtros */}
       {!isLoading && !error && tasks.length > 0 && (
         <div className="mb-8 p-4 border rounded-lg bg-card shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
           <div className="flex flex-col md:flex-row gap-4 items-center flex-grow">
             <h2 className="text-md font-semibold whitespace-nowrap text-muted-foreground hidden md:block">Filtrar por:</h2>
             <div className="w-full md:w-auto md:min-w-[180px]">
               <Label htmlFor="filter-priority" className="sr-only">Prioridad</Label>
               <Select value={filterPriority} onValueChange={setFilterPriority} disabled={priorities.length === 0}>
                 <SelectTrigger id="filter-priority" className="w-full">
                   <SelectValue placeholder="Todas las Prioridades" />
                 </SelectTrigger>
                 <SelectContent>
                   {priorities.map(p => (
                     <SelectItem key={p.id} value={String(p.id)}>{p.nombre}</SelectItem>
                   ))}
                   {priorities.length === 0 && <SelectItem value="loading" disabled>Cargando...</SelectItem>}
                 </SelectContent>
               </Select>
             </div>
             <div className="w-full md:w-auto md:min-w-[180px]">
               <Label htmlFor="filter-status" className="sr-only">Estado</Label>
               <Select value={filterStatus} onValueChange={setFilterStatus} disabled={statuses.length === 0}>
                 <SelectTrigger id="filter-status" className="w-full">
                   <SelectValue placeholder="Todos los Estados" />
                 </SelectTrigger>
                 <SelectContent>
                   {statuses.map(s => (
                     <SelectItem key={s.id} value={String(s.id)}>{s.nombre}</SelectItem>
                   ))}
                    {statuses.length === 0 && <SelectItem value="loading" disabled>Cargando...</SelectItem>}
                 </SelectContent>
               </Select>
             </div>
           </div>
           { (filterPriority || filterStatus) && ( 
             <Button variant="ghost" onClick={clearFilters} size="sm" className="w-full md:w-auto mt-2 md:mt-0 text-muted-foreground hover:text-foreground">
               <FilterX className="mr-2 h-4 w-4"/>
               Limpiar Filtros
             </Button>
            )}
         </div>
       )}

      {/* Tareas */}
      <div className="mt-6">
        {renderContent()}
      </div>

    </div>
  );
};

export default TaskListPage;