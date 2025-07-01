from flask import Blueprint, request, jsonify
from pymongo import MongoClient
from bson import ObjectId

api = Blueprint('api', __name__)

client = MongoClient("mongodb://localhost:27017")
db = client["project_manager"]

# ---------- USUARIOS ----------
@api.route('/register', methods=['POST'])
def register():
    data = request.json
    if db.users.find_one({"username": data["username"]}):
        return jsonify({"message": "Usuario ya existe"}), 400
    db.users.insert_one({"username": data["username"], "password": data["password"]})
    return jsonify({"message": "Registrado correctamente"})

@api.route('/login', methods=['POST'])
def login():
    data = request.json
    user = db.users.find_one({"username": data["username"], "password": data["password"]})
    if not user:
        return jsonify({"message": "Credenciales inválidas"}), 401
    return jsonify({"message": "Login exitoso", "user_id": str(user["_id"])})

# ---------- PROYECTOS ----------
@api.route('/projects', methods=['POST'])
def create_project():
    data = request.json
    db.projects.insert_one({
        "name": data["name"],
        "description": data["description"],
        "owner_id": data["owner_id"],
        "tasks": []
    })
    return jsonify({"message": "Proyecto creado"})

@api.route('/projects', methods=['GET'])
def list_projects():
    projects = list(db.projects.find())
    for p in projects:
        p["_id"] = str(p["_id"])
    return jsonify(projects)

# ---------- TAREAS ----------
@api.route('/projects/<project_id>/tasks', methods=['POST'])
def add_task(project_id):
    data = request.json
    task = {
        "_id": ObjectId(),
        "title": data["title"],
        "priority": data["priority"],
        "assigned_to": data["assigned_to"],
        "completed": False,
        "subtasks": []
    }
    db.projects.update_one(
        {"_id": ObjectId(project_id)},
        {"$push": {"tasks": task}}
    )
    return jsonify({"message": "Tarea agregada"})

@api.route('/projects/<project_id>/tasks', methods=['GET'])
def list_tasks(project_id):
    project = db.projects.find_one({"_id": ObjectId(project_id)})
    for t in project["tasks"]:
        t["_id"] = str(t["_id"])
        for s in t["subtasks"]:
            s["_id"] = str(s["_id"])
    return jsonify(project)

@api.route('/projects/<project_id>/tasks/<task_id>', methods=['PUT'])
def update_task(project_id, task_id):
    data = request.json
    updates = {}
    if "title" in data:
        updates["tasks.$.title"] = data["title"]
    if "priority" in data:
        updates["tasks.$.priority"] = data["priority"]
    if "completed" in data:
        updates["tasks.$.completed"] = data["completed"]
    db.projects.update_one(
        {"_id": ObjectId(project_id), "tasks._id": ObjectId(task_id)},
        {"$set": updates}
    )
    return jsonify({"message": "Tarea actualizada"})

@api.route('/projects/<project_id>/tasks/<task_id>', methods=['DELETE'])
def delete_task(project_id, task_id):
    db.projects.update_one(
        {"_id": ObjectId(project_id)},
        {"$pull": {"tasks": {"_id": ObjectId(task_id)}}}
    )
    return jsonify({"message": "Tarea eliminada"})

@api.route('/projects/<project_id>/tasks/<task_id>/subtasks', methods=['POST'])
def add_subtask(project_id, task_id):
    data = request.json
    subtask = {
        "_id": ObjectId(),
        "title": data["title"],
        "completed": False
    }
    db.projects.update_one(
        {"_id": ObjectId(project_id), "tasks._id": ObjectId(task_id)},
        {"$push": {"tasks.$.subtasks": subtask}}
    )
    return jsonify({"message": "Subtarea agregada"})

@api.route('/projects/<project_id>/status', methods=['GET'])
def project_status(project_id):
    project = db.projects.find_one({"_id": ObjectId(project_id)})
    total = len(project["tasks"])
    completed = sum(1 for t in project["tasks"] if t["completed"])
    by_priority = {"alta": 0, "media": 0, "baja": 0}
    for t in project["tasks"]:
        by_priority[t["priority"]] += 1
    return jsonify({
        "total": total,
        "completed": completed,
        "by_priority": by_priority
    })
