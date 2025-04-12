from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, timezone

db = SQLAlchemy() 
class Prioridad(db.Model):
    __tablename__ = 'prioridades'
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(20), nullable=False, unique=True)
    tareas = db.relationship('Tarea', backref='prioridad', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'nombre': self.nombre
        }

    def __repr__(self):
        return f"<Prioridad {self.id}: {self.nombre}>"

class Estado(db.Model):
    __tablename__ = 'estados'
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(20), nullable=False, unique=True)
    tareas = db.relationship('Tarea', backref='estado', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'nombre': self.nombre
        }

    def __repr__(self):
        return f"<Estado {self.id}: {self.nombre}>"


class Tarea(db.Model):
    __tablename__ = 'tareas'
    id = db.Column(db.Integer, primary_key=True)
    titulo = db.Column(db.String(100), nullable=False)
    descripcion = db.Column(db.Text, nullable=True)
    prioridad_id = db.Column(db.Integer, db.ForeignKey('prioridades.id'), nullable=False)
    estado_id = db.Column(db.Integer, db.ForeignKey('estados.id'), nullable=False, default=1) 
    fecha_creacion = db.Column(db.DateTime, default=datetime.now(timezone.utc).replace(tzinfo=None)) 
    fecha_vencimiento = db.Column(db.Date, nullable=True)

    def to_dict(self):
        return {
            'id': self.id,
            'titulo': self.titulo,
            'descripcion': self.descripcion,
            'prioridad_id': self.prioridad_id,
            'prioridad_nombre': self.prioridad.nombre if self.prioridad else None, 
            'estado_id': self.estado_id,
            'estado_nombre': self.estado.nombre if self.estado else None, 
            'fecha_creacion': self.fecha_creacion.isoformat() + 'Z' if self.fecha_creacion else None,
            'fecha_vencimiento': self.fecha_vencimiento.isoformat() if self.fecha_vencimiento else None,
        }

    def __repr__(self):
        return f"<Tarea {self.id}: {self.titulo}>"