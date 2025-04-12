import React from 'react';
import { useNavigate } from 'react-router';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge"; 
import { format } from 'date-fns'; 
import { es } from 'date-fns/locale'; 

//obtener el color según prioridad o estado
const getPriorityBadgeVariant = (priorityName) => {
  switch (priorityName?.toLowerCase()) {
    case 'alta': return 'destructive';
    case 'media': return 'secondary'; 
    case 'baja': return 'outline';
    default: return 'default';
  }
};

const getStatusBadgeVariant = (statusName) => {
    switch (statusName?.toLowerCase()) {
      case 'pendiente': return 'outline';
      case 'en progreso': return 'secondary'; 
      case 'completada': return 'default';
      default: return 'secondary';
    }
  };


const TaskCard = ({ task, onDelete }) => {
  const navigate = useNavigate();

  const handleEdit = () => {
    navigate(`/editar-tarea/${task.id}`);
  };

  
  const formattedCreationDate = task.fecha_creacion
    ? format(new Date(task.fecha_creacion), 'Pp', { locale: es }) 
    : 'N/A';
  const formattedDueDate = task.fecha_vencimiento
    ? format(new Date(task.fecha_vencimiento + 'T00:00:00'), 'P', { locale: es }) 
    : 'Sin fecha límite';

  return (
    <Card className="mb-4 shadow-md hover:shadow-lg transition-shadow duration-200 ">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold max-w-[120px] text-pretty hyphens-auto break-words">{task.titulo}</CardTitle>
          <div className="flex space-x-2">
             <Badge variant={getPriorityBadgeVariant(task.prioridad_nombre)}>
               {task.prioridad_nombre || 'N/A'}
             </Badge>
             <Badge variant={getStatusBadgeVariant(task.estado_nombre)}>
                {task.estado_nombre || 'N/A'}
             </Badge>
          </div>
        </div>
        {task.descripcion && (
          <CardDescription className="text-sm text-gray-600 mt-1 max-w-[300px] text-pretty hyphens-auto break-words">
            {task.descripcion}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="text-sm text-gray-500">
        <p>Creada: {formattedCreationDate}</p>
        <p>Vence: {formattedDueDate}</p>
      </CardContent>
      <CardFooter className="flex justify-end space-x-2">
        <Button variant="outline" size="sm" onClick={handleEdit}>
          Editar
        </Button>
        <Button variant="destructive" size="sm" onClick={() => onDelete(task.id)}>
          Eliminar
        </Button>
      </CardFooter>
    </Card>
  );
};

export default TaskCard;