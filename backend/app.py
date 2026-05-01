from flask import Flask, request, jsonify
from flask_cors import CORS          
from config import get_db_connection
import jwt
import datetime
from functools import wraps
import os


# New - strong key (32+ bytes)

SECRET_KEY = "taskflow_super_secret_key_2026_secure"

app = Flask(__name__)
CORS(app)                            

# Checking for Backend running!

@app.route('/')
def home():
    return "Backend running "

# Check to Database Connected!

@app.route('/test-db')
def test_db():
    try:
        conn = get_db_connection()
        return "Database Connected!"
    except Exception as e:
        return str(e), 500

# Move to signup section 

@app.route('/signup', methods=['POST'])
def signup():
    try:
        data = request.json
        name = data.get('name')
        email = data.get('email')
        password = data.get('password')

        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        # Check if user already exists
        cursor.execute("SELECT * FROM users WHERE email=%s", (email,))
        existing_user = cursor.fetchone()

        if existing_user:
            return jsonify({"message": "Email already exists"}), 400

        # Insert new user
        query = "INSERT INTO users (name, email, password) VALUES (%s, %s, %s)"
        cursor.execute(query, (name, email, password))
        conn.commit()

        return jsonify({"message": "User created successfully"})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Then Go to login 

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    email = data['email']
    password = data['password']

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    query = "SELECT * FROM users WHERE email=%s AND password=%s"
    cursor.execute(query, (email, password))
    user = cursor.fetchone()

    if user:
        token = jwt.encode({
            'user_id': user['id'],
            'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=2)
        }, SECRET_KEY, algorithm='HS256')

        return jsonify({
            "message": "Login successful",
            "token": token
        })
    else:
        return jsonify({"message": "Invalid credentials"}), 401
    
# Token Verify Function

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')

        if not token:
            return jsonify({"message": "Token missing"}), 401

        try:
            token = token.split(" ")[1]
            data = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
            current_user_id = data['user_id']
        except:
            return jsonify({"message": "Invalid token"}), 401

        return f(current_user_id, *args, **kwargs)

    return decorated

# Protected API test

@app.route('/protected')
@token_required
def protected(current_user_id):
    return jsonify({"message": "Protected route accessed 🚀"})


# Create Project API

@app.route('/create-project', methods=['POST'])
@token_required
def create_project(current_user_id):
    data = request.json
    name = data['name']

    conn = get_db_connection()
    cursor = conn.cursor()

    # Insert project
    query = "INSERT INTO projects (name, created_by) VALUES (%s, %s)"
    cursor.execute(query, (name, current_user_id))
    conn.commit()

    project_id = cursor.lastrowid

    # Add creator as member
    query2 = "INSERT INTO project_members (project_id, user_id) VALUES (%s, %s)"
    cursor.execute(query2, (project_id, current_user_id))
    conn.commit()

    return jsonify({"message": "Project created successfully"})

# Get Projects

@app.route('/projects', methods=['GET'])
@token_required
def get_projects(current_user_id):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    query = """
    SELECT p.* FROM projects p
    JOIN project_members pm ON p.id = pm.project_id
    WHERE pm.user_id = %s
    """

    cursor.execute(query, (current_user_id,))
    projects = cursor.fetchall()

    return jsonify(projects)


# Add Member by Email
@app.route('/add-member-by-email', methods=['POST'])
@token_required
def add_member_by_email(current_user_id):
    data = request.json
    project_id = data['project_id']
    email = data['email']

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    # Check if current user is admin
    cursor.execute(
        "SELECT * FROM projects WHERE id=%s AND created_by=%s",
        (project_id, current_user_id)
    )
    project = cursor.fetchone()
    if not project:
        return jsonify({"message": "Only admin can add members"}), 403

    # Email se user dhundho
    cursor.execute("SELECT * FROM users WHERE email=%s", (email,))
    user = cursor.fetchone()
    if not user:
        return jsonify({"message": "No user found with this email"}), 404

    # Already member hai?
    cursor.execute(
        "SELECT * FROM project_members WHERE project_id=%s AND user_id=%s",
        (project_id, user['id'])
    )
    already = cursor.fetchone()
    if already:
        return jsonify({"message": "User is already a member"}), 400

    # Member add karo
    cursor.execute(
        "INSERT INTO project_members (project_id, user_id) VALUES (%s, %s)",
        (project_id, user['id'])
    )
    conn.commit()

    return jsonify({
        "message": f"{user['name']} added successfully!"
    })


# Create Task API

@app.route('/create-task', methods=['POST'])
@token_required
def create_task(current_user_id):
    data = request.json

    title = data['title']
    description = data['description']
    due_date = data['due_date']
    priority = data['priority']
    project_id = data['project_id']
    assigned_to = data['assigned_to']

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    # Check if user is part of project
    cursor.execute(
        "SELECT * FROM project_members WHERE project_id=%s AND user_id=%s",
        (project_id, current_user_id)
    )
    member = cursor.fetchone()

    if not member:
        return jsonify({"message": "Not authorized for this project"}), 403

    # Insert task
    cursor.execute("""
        INSERT INTO tasks (title, description, due_date, priority, status, project_id, assigned_to)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
    """, (title, description, due_date, priority, "To Do", project_id, assigned_to))

    conn.commit()

    return jsonify({
        "message": "Task created successfully",
        "task_id": cursor.lastrowid
    })

# Get Tasks API

@app.route('/tasks', methods=['GET'])
@token_required
def get_tasks(current_user_id):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    query = """
    SELECT * FROM tasks
    WHERE assigned_to = %s
    """
    cursor.execute(query, (current_user_id,))
    tasks = cursor.fetchall()

    return jsonify(tasks)

# Update Task Status


@app.route('/update-task/<int:task_id>', methods=['PUT'])
@token_required
def update_task(current_user_id, task_id):
    data = request.json
    status = data['status']

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    # Check task belongs to user
    cursor.execute(
        "SELECT * FROM tasks WHERE id=%s AND assigned_to=%s",
        (task_id, current_user_id)
    )
    task = cursor.fetchone()

    if not task:
        return jsonify({"message": "Not authorized"}), 403

    # Update status
    cursor.execute(
        "UPDATE tasks SET status=%s WHERE id=%s",
        (status, task_id)
    )
    conn.commit()

    return jsonify({"message": "Task updated successfully"})

# Dashboard API
@app.route('/dashboard', methods=['GET'])
@token_required
def dashboard(current_user_id):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    # Total tasks
    cursor.execute("SELECT COUNT(*) as total FROM tasks WHERE assigned_to=%s", (current_user_id,))
    total = cursor.fetchone()['total']

    # Status counts
    cursor.execute("""
        SELECT status, COUNT(*) as count
        FROM tasks
        WHERE assigned_to=%s
        GROUP BY status
    """, (current_user_id,))
    status_data = cursor.fetchall()

    # Overdue tasks
    cursor.execute("""
        SELECT COUNT(*) as overdue
        FROM tasks
        WHERE assigned_to=%s AND due_date < CURDATE() AND status != 'Done'
    """, (current_user_id,))
    overdue = cursor.fetchone()['overdue']

    return jsonify({
        "total_tasks": total,
        "status_breakdown": status_data,
        "overdue_tasks": overdue
    })

# Get Project Members API
@app.route('/project-members/<int:project_id>', methods=['GET'])
@token_required
def get_project_members(current_user_id, project_id):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    query = """
    SELECT u.id, u.name, u.email 
    FROM users u
    JOIN project_members pm ON u.id = pm.user_id
    WHERE pm.project_id = %s
    """
    cursor.execute(query, (project_id,))
    members = cursor.fetchall()
    return jsonify(members)


# Get Current User Profile
@app.route('/me', methods=['GET'])
@token_required
def get_me(current_user_id):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT id, name, email FROM users WHERE id=%s", (current_user_id,))
    user = cursor.fetchone()
    return jsonify(user)

# Reset Password API - verify email and set new password
@app.route('/reset-password', methods=['POST'])
def reset_password():
    data = request.json
    email = data.get('email')
    new_password = data.get('new_password')

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    # Check if email exists
    cursor.execute("SELECT * FROM users WHERE email=%s", (email,))
    user = cursor.fetchone()

    if not user:
        return jsonify({"message": "No account found with this email"}), 404

    # Update password
    cursor.execute(
        "UPDATE users SET password=%s WHERE email=%s",
        (new_password, email)
    )
    conn.commit()

    return jsonify({"message": "Password reset successfully!"})


# Check if email exists in database
@app.route('/check-email', methods=['POST'])
def check_email():
    data = request.json
    email = data.get('email')

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("SELECT id FROM users WHERE email=%s", (email,))
    user = cursor.fetchone()

    if not user:
        return jsonify({"message": "No account found with this email"}), 404

    return jsonify({"exists": True})


