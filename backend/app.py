from flask import Flask, request, jsonify
from flask_cors import CORS 
from datetime import datetime
from config import Config 
from models import db, Tarea, Prioridad, Estado 

app = Flask(__name__)
app.config.from_object(Config) 

db.init_app(app)

CORS(app)

# Validar datos antes de mandarlos a la base
def validate_task_data(data, is_update=False):
    errors = {}
    required_fields = ['titulo', 'prioridad_id', 'estado_id']

    if not is_update:
        for field in required_fields:
            if field not in data or data[field] is None:
                errors[field] = f"El campo '{field}' es obligatorio."

    if 'prioridad_id' in data and data.get('prioridad_id') is not None:
        if not Prioridad.query.get(data['prioridad_id']):
            errors['prioridad_id'] = "La prioridad especificada no existe."
    if 'estado_id' in data and data.get('estado_id') is not None:
        if not Estado.query.get(data['estado_id']):
            errors['estado_id'] = "El estado especificado no existe."


    if 'titulo' in data and not data.get('titulo', '').strip():
         errors['titulo'] = "El título no puede estar vacío."

    if 'fecha_vencimiento' in data and data['fecha_vencimiento']:
        try:
            #Formato fecha YYYY-MM-DD
            datetime.strptime(data['fecha_vencimiento'], '%Y-%m-%d')
        except (ValueError, TypeError):
            errors['fecha_vencimiento'] = "Formato de fecha inválido. Use YYYY-MM-DD."

    return errors

#endpoints
@app.route('/tareas', methods=['POST'])
def create_tarea():
 
    data = request.get_json()
    if not data:
        return jsonify({"error": "No se recibieron datos JSON"}), 400

    errors = validate_task_data(data)
    if errors:
        return jsonify({"error": "Datos inválidos", "details": errors}), 400

    titulo = data['titulo']
    prioridad_id = data['prioridad_id']
    estado_id = data.get('estado_id', 1) 
    descripcion = data.get('descripcion') 
    fecha_vencimiento_str = data.get('fecha_vencimiento')
    fecha_vencimiento = None
    if fecha_vencimiento_str:
        fecha_vencimiento = datetime.strptime(fecha_vencimiento_str, '%Y-%m-%d').date()

    try:
        nueva_tarea = Tarea(
            titulo=titulo,
            descripcion=descripcion,
            prioridad_id=prioridad_id,
            estado_id=estado_id,
            fecha_vencimiento=fecha_vencimiento
        )
        db.session.add(nueva_tarea)
        db.session.commit()
        return jsonify(nueva_tarea.to_dict()), 201 

    except Exception as e:
        db.session.rollback() 
        print(f"Error al crear tarea: {e}") 
        return jsonify({"error": "Error interno del servidor al crear la tarea"}), 500


@app.route('/tareas', methods=['GET'])
def get_tareas():
    try:
        tareas = Tarea.query.order_by(Tarea.fecha_creacion.desc()).all() #El orden es por fecha de creación
        return jsonify([tarea.to_dict() for tarea in tareas]), 200
    except Exception as e:
        print(f"Error al obtener tareas: {e}")
        return jsonify({"error": "Error interno del servidor al obtener las tareas"}), 500


@app.route('/tareas/<int:id>', methods=['GET'])
def get_tarea(id):
    try:
        tarea = Tarea.query.get_or_404(id, description=f"Tarea con id {id} no encontrada")
        return jsonify(tarea.to_dict()), 200
    except Exception as e:
        print(f"Error al obtener tarea {id}: {e}")
        if hasattr(e, 'code') and e.code == 404:
             return jsonify({"error": str(e)}), 404
        return jsonify({"error": "Error interno del servidor"}), 500


@app.route('/tareas/<int:id>', methods=['PUT'])
def update_tarea(id):
    try:
        tarea = Tarea.query.get_or_404(id, description=f"Tarea con id {id} no encontrada para actualizar")
        data = request.get_json()
        if not data:
            return jsonify({"error": "No se recibieron datos JSON"}), 400

        errors = validate_task_data(data, is_update=True)
        if errors:
            return jsonify({"error": "Datos inválidos", "details": errors}), 400

        if 'titulo' in data:
            tarea.titulo = data['titulo'].strip()
        if 'descripcion' in data:
            tarea.descripcion = data['descripcion']
        if 'prioridad_id' in data:
            tarea.prioridad_id = data['prioridad_id']
        if 'estado_id' in data:
            tarea.estado_id = data['estado_id']
        if 'fecha_vencimiento' in data:
            fecha_vencimiento_str = data['fecha_vencimiento']
            if fecha_vencimiento_str:
                 tarea.fecha_vencimiento = datetime.strptime(fecha_vencimiento_str, '%Y-%m-%d').date()
            else:
                 tarea.fecha_vencimiento = None 

        db.session.commit()
        return jsonify(tarea.to_dict()), 200

    except Exception as e:
        db.session.rollback()
        print(f"Error al actualizar tarea {id}: {e}")
        if hasattr(e, 'code') and e.code == 404:
             return jsonify({"error": str(e)}), 404
        return jsonify({"error": "Error interno del servidor al actualizar la tarea"}), 500


@app.route('/tareas/<int:id>', methods=['DELETE'])
def delete_tarea(id):
    try:
        tarea = Tarea.query.get_or_404(id, description=f"Tarea con id {id} no encontrada para eliminar")
        db.session.delete(tarea)
        db.session.commit()
        return jsonify({"mensaje": f"Tarea con id {id} eliminada correctamente"}), 200
    except Exception as e:
        db.session.rollback()
        print(f"Error al eliminar tarea {id}: {e}")
        if hasattr(e, 'code') and e.code == 404:
             return jsonify({"error": str(e)}), 404
        return jsonify({"error": "Error interno del servidor al eliminar la tarea"}), 500


#para prioridades y estados en el front
@app.route('/prioridades', methods=['GET'])
def get_prioridades():
    try:
        prioridades = Prioridad.query.order_by(Prioridad.id).all()
        return jsonify([p.to_dict() for p in prioridades]), 200
    except Exception as e:
        print(f"Error al obtener prioridades: {e}")
        return jsonify({"error": "Error interno del servidor al obtener prioridades"}), 500

@app.route('/estados', methods=['GET'])
def get_estados():
    try:
        estados = Estado.query.order_by(Estado.id).all()
        return jsonify([e.to_dict() for e in estados]), 200
    except Exception as e:
        print(f"Error al obtener estados: {e}")
        return jsonify({"error": "Error interno del servidor al obtener estados"}), 500


@app.errorhandler(404)
def not_found_error(error):
    description = error.description if hasattr(error, 'description') else "Recurso no encontrado"
    return jsonify({"error": description}), 404

@app.errorhandler(400)
def bad_request_error(error):
    return jsonify({"error": "Solicitud incorrecta"}), 400

@app.errorhandler(500)
def internal_error(error):
    db.session.rollback() 
    return jsonify({"error": "Error interno del servidor"}), 500


if __name__ == '__main__':
    #http://127.0.0.1:5000 
    app.run(debug=True)