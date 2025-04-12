import React from 'react';
import TaskForm from '../components/TaskForm';

//Renderiza dependiendo si es para editar o no
const TaskFormPage = ({ isEditing = false }) => {
  return (
    <div className="container mx-auto p-4 md:p-6">
      <TaskForm isEditing={isEditing} /> 
    </div>
  );
};

export default TaskFormPage;