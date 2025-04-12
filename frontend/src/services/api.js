const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

async function handleResponse(response) {
  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch (_e) {
      errorData = { error: `HTTP error! status: ${response.status}` };
    }
    console.error("API Error:", errorData);
    // Extraer mensaje de error si esta disponible
    const message = errorData?.error?.details
      ? JSON.stringify(errorData.error.details)
      : errorData?.error || errorData?.mensaje || `Error ${response.status}`;
    throw new Error(message);
  }
  if (response.status === 204) {
      return null;
  }
  if (response.headers.get("content-type")?.includes("application/json")) {
    return response.json();
  }
  return response.text();
}

export const fetchTasks = async () => {
  const response = await fetch(`${API_BASE_URL}/tareas`);
  return handleResponse(response);
};

export const fetchTask = async (id) => {
  const response = await fetch(`${API_BASE_URL}/tareas/${id}`);
  return handleResponse(response);
};

export const createTask = async (taskData) => {
  const response = await fetch(`${API_BASE_URL}/tareas`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(taskData),
  });
  return handleResponse(response);
};

export const updateTask = async (id, taskData) => {
  const response = await fetch(`${API_BASE_URL}/tareas/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(taskData),
  });
  return handleResponse(response);
};

export const deleteTask = async (id) => {
  const response = await fetch(`${API_BASE_URL}/tareas/${id}`, {
    method: 'DELETE',
  });
  if (response.status === 200 || response.status === 204) {
      if (response.status === 200 && response.headers.get("content-type")?.includes("application/json")) {
        return response.json();
      }
      return { mensaje: `Tarea ${id} eliminada.` }; 
  }
  return handleResponse(response); 
};


export const fetchPriorities = async () => {
  const response = await fetch(`${API_BASE_URL}/prioridades`);
  return handleResponse(response);
};

export const fetchStatuses = async () => {
  const response = await fetch(`${API_BASE_URL}/estados`);
  return handleResponse(response);
};