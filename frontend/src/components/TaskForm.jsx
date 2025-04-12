import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon, Loader2 } from "lucide-react"; 
import { cn } from "@/lib/utils"; 
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import * as api from '../services/api'; 
import { toast } from "sonner"; 

const TaskForm = ({ isEditing = false }) => {
  const navigate = useNavigate();
  const { id } = useParams(); // Obtiene el ID de la URL si estamos editando

  //Estado del formulario
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priorityId, setPriorityId] = useState(''); 
  const [statusId, setStatusId] = useState('');   
  const [dueDate, setDueDate] = useState(null); 

  const [priorities, setPriorities] = useState([]);
  const [statuses, setStatuses] = useState([]);

  const [isLoadingData, setIsLoadingData] = useState(false); 
  const [isSubmitting, setIsSubmitting] = useState(false); 
  const [error, setError] = useState(null); 

  useEffect(() => {
    const loadDropdownData = async () => {
      if (priorities.length === 0 || statuses.length === 0) {
        setIsLoadingData(true); // Inicia carga si es necesario
        setError(null);
        try {
          const [prioritiesData, statusesData] = await Promise.all([
            api.fetchPriorities(),
            api.fetchStatuses()
          ]);
          setPriorities(prioritiesData || []);
          setStatuses(statusesData || []);

          if (!isEditing && statusesData && statusesData.length > 0) {
            const defaultStatus = statusesData.find(s => s.nombre.toLowerCase() === 'pendiente') || statusesData[0];
            if (defaultStatus) {
              setStatusId(String(defaultStatus.id));
            }
          }

        } catch (err) {
          setError('Error al cargar prioridades o estados.');
          toast.error('Error al cargar datos necesarios para el formulario.');
          console.error("Error fetching dropdown data:", err);
        } finally {
            if(!isEditing) setIsLoadingData(false);
        }
      }
    };
    loadDropdownData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditing]); 


  useEffect(() => {
    if (isEditing && id) {
      const loadTaskData = async () => {
        setIsLoadingData(true); 
        setError(null);
        try {
          const task = await api.fetchTask(id);
          setTitle(task.titulo);
          setDescription(task.descripcion || '');
          setPriorityId(String(task.prioridad_id)); 
          setStatusId(String(task.estado_id));     
          setDueDate(task.fecha_vencimiento ? new Date(task.fecha_vencimiento + 'T00:00:00') : null);
        } catch (err) {
          setError(`Error al cargar la tarea.`);
          toast.error(`Error al cargar la tarea: ${err.message}`);
          console.error("Error fetching task:", err);
          //Redirigir si la tarea no se encuentra (error 404)
          if (err.message.includes('404') || err.message.toLowerCase().includes('not found')) {
             toast.error('Tarea no encontrada. Redirigiendo...');
             setTimeout(() => navigate('/'), 2000); 
          }
        } finally {
          setIsLoadingData(false); 
        }
      };
      loadTaskData();
    }
 
  }, [isEditing, id, navigate]); 

  const validateForm = () => {
    const errors = [];
    if (!title.trim()) {
      errors.push("El título es obligatorio.");
    }
    if (!priorityId) {
       errors.push("Debes seleccionar una prioridad.");
    }
     if (!statusId) {
       errors.push("Debes seleccionar un estado.");
     }

    if (errors.length > 0) {
        errors.forEach(errMsg => toast.error(errMsg));
        return false;
    }
    return true;
  };


  const handleSubmit = async (event) => {
    event.preventDefault();
     if (!validateForm()) return; 

    setIsSubmitting(true);
    setError(null); 

    const taskData = {
      titulo: title.trim(),
      descripcion: description.trim() ? description.trim() : null,
      prioridad_id: parseInt(priorityId, 10), 
      estado_id: parseInt(statusId, 10),       
      fecha_vencimiento: dueDate ? format(dueDate, 'yyyy-MM-dd') : null,
    };

    try {
      let result;
      if (isEditing) {
        result = await api.updateTask(id, taskData);
        toast.success(`Tarea "${result.titulo}" actualizada correctamente!`);
      } else {
        result = await api.createTask(taskData);
        toast.success(`Tarea "${result.titulo}" creada correctamente!`);
      }
      navigate('/'); 
    } catch (err) {
      const action = isEditing ? 'actualizar' : 'crear';
      setError(`Error al ${action} la tarea.`); 
      toast.error(`Error al ${action} la tarea: ${err.message}`); 
      console.error(`Error submitting task (isEditing: ${isEditing}):`, err);
    } finally {
      setIsSubmitting(false); 
    }
  };


  if (isLoadingData) {
    return (
        <div className="flex justify-center items-center h-40">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-2">Cargando datos...</p>
        </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto p-4 md:p-8 border rounded-lg shadow-lg bg-card text-card-foreground">
       <h2 className="text-2xl font-semibold mb-6 text-center border-b pb-4">
         {isEditing ? 'Editar Tarea' : 'Crear Nueva Tarea'}
       </h2>

       {/*Mostrar error si hay */}
       {error && !isSubmitting && (
          <p className="text-red-600 text-center bg-red-100 p-3 rounded-md">{error}</p>
        )}

       {/*Titulo */}
       <div className="space-y-2">
         <Label htmlFor="title">Título <span className="text-red-500">*</span></Label>
         <Input
           id="title"
           value={title}
           onChange={(e) => setTitle(e.target.value)}
           placeholder="Ej: Preparar presentación Q3"
           required
           disabled={isSubmitting}
           className="disabled:opacity-70"
         />
       </div>

       {/*Descr */}
       <div className="space-y-2">
         <Label htmlFor="description">Descripción</Label>
         <Textarea
           id="description"
           value={description}
           onChange={(e) => setDescription(e.target.value)}
           placeholder="Añade detalles sobre la tarea (opcional)"
           disabled={isSubmitting}
           rows={4}
           className="disabled:opacity-70"
         />
       </div>

       {/*Prioridad y esado */}
       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <div className="space-y-2">
           <Label htmlFor="priority">Prioridad <span className="text-red-500">*</span></Label>
           <Select
             value={priorityId} 
             onValueChange={setPriorityId} 
             required
             disabled={isSubmitting || priorities.length === 0}
             name="priority" 
           >
             <SelectTrigger id="priority" className="disabled:opacity-70">
               <SelectValue placeholder="Selecciona una prioridad" />
             </SelectTrigger>
             <SelectContent>
               {priorities.length === 0 && <SelectItem value="loading" disabled>Cargando...</SelectItem>}
               {priorities.map((p) => (
                 <SelectItem key={p.id} value={String(p.id)}>
                   {p.nombre}
                 </SelectItem>
               ))}
             </SelectContent>
           </Select>
         </div>

         <div className="space-y-2">
           <Label htmlFor="status">Estado <span className="text-red-500">*</span></Label>
           <Select
             value={statusId} 
             onValueChange={setStatusId} 
             required
             disabled={isSubmitting || statuses.length === 0}
             name="status"
           >
             <SelectTrigger id="status" className="disabled:opacity-70">
               <SelectValue placeholder="Selecciona un estado" />
             </SelectTrigger>
             <SelectContent>
               {statuses.length === 0 && <SelectItem value="loading" disabled>Cargando...</SelectItem>}
               {statuses.map((s) => (
                 <SelectItem key={s.id} value={String(s.id)}>
                   {s.nombre}
                 </SelectItem>
               ))}
             </SelectContent>
           </Select>
         </div>
       </div>

       <div className="space-y-2">
         <Label htmlFor="dueDate">Fecha de Vencimiento</Label>
         <Popover>
            <PopoverTrigger asChild>
              <Button
                id="dueDate"
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !dueDate && "text-muted-foreground",
                  "disabled:opacity-70"
                )}
                 disabled={isSubmitting}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dueDate ? format(dueDate, 'PPP', { locale: es }) : <span>Selecciona una fecha</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={dueDate}
                onSelect={setDueDate} 
                initialFocus
                locale={es} 
              />
            </PopoverContent>
          </Popover>
       </div>

       <div className="flex justify-end space-x-3 pt-4 border-t mt-6">
         <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/')} 
            disabled={isSubmitting} 
          >
           Cancelar
         </Button>
         <Button type="submit" disabled={isSubmitting || isLoadingData}>
           {isSubmitting ? (
             <>
               <Loader2 className="mr-2 h-4 w-4 animate-spin" />
               {isEditing ? 'Actualizando...' : 'Creando...'}
             </>
           ) : (
             isEditing ? 'Actualizar Tarea' : 'Crear Tarea'
           )}
         </Button>
       </div>
     </form>
  );
};

export default TaskForm;