# API Documentation: NeuraFlow AI

All API endpoints are prefixed with `/api`. Standard responses are returned in JSON format.

---

## 1. Authentication Endpoints

### Register User
* **URL**: `/api/auth/register`
* **Method**: `POST`
* **Request Body**:
  ```json
  {
    "name": "Jane Doe",
    "email": "jane@example.com",
    "password": "strongpassword123"
  }
  ```
* **Success Response (201 Created)**:
  ```json
  {
    "message": "User registered successfully",
    "user": {
      "id": 1,
      "name": "Jane Doe",
      "email": "jane@example.com"
    }
  }
  ```

### Login User
* **URL**: `/api/auth/login`
* **Method**: `POST`
* **Request Body**:
  ```json
  {
    "email": "jane@example.com",
    "password": "strongpassword123"
  }
  ```
* **Success Response (200 OK)**:
  ```json
  {
    "message": "Login successful",
    "access_token": "jwt_token_string",
    "user": {
      "id": 1,
      "name": "Jane Doe",
      "email": "jane@example.com"
    }
  }
  ```

### Logout User
* **URL**: `/api/auth/logout`
* **Method**: `POST`
* **Headers**: `Authorization: Bearer <token>`
* **Success Response (200 OK)**:
  ```json
  {
    "message": "Logged out successfully"
  }
  ```

### Get User Profile
* **URL**: `/api/auth/profile`
* **Method**: `GET`
* **Headers**: `Authorization: Bearer <token>`
* **Success Response (200 OK)**:
  ```json
  {
    "user": {
      "id": 1,
      "name": "Jane Doe",
      "email": "jane@example.com"
    }
  }
  ```

---

## 2. Learning Path & Agents Endpoints

### Generate Topic Roadmap
* **URL**: `/api/learning/generate`
* **Method**: `POST`
* **Headers**: `Authorization: Bearer <token>`
* **Request Body**:
  ```json
  {
    "topic": "Machine Learning"
  }
  ```
* **Success Response (202 Accepted)**:
  ```json
  {
    "message": "Roadmap generation started",
    "topic_id": 4,
    "status": "generating"
  }
  ```

### List User Topics
* **URL**: `/api/learning/topics`
* **Method**: `GET`
* **Headers**: `Authorization: Bearer <token>`
* **Success Response (200 OK)**:
  ```json
  {
    "topics": [
      {
        "id": 4,
        "title": "Machine Learning",
        "status": "completed",
        "created_at": "2026-07-02T19:22:31Z",
        "progress_percentage": 45
      }
    ]
  }
  ```

### Get Roadmap Nodes
* **URL**: `/api/learning/roadmap/<topic_id>`
* **Method**: `GET`
* **Headers**: `Authorization: Bearer <token>`
* **Success Response (200 OK)**:
  ```json
  {
    "topic_id": 4,
    "title": "Machine Learning",
    "status": "completed",
    "nodes": [
      {
        "id": 12,
        "title": "1. Introduction to ML",
        "description": "Understand what machine learning is, supervised vs unsupervised learning, and core concepts.",
        "order": 1,
        "is_completed": true
      },
      {
        "id": 13,
        "title": "2. Linear Regression",
        "description": "Formulation, cost functions, gradient descent, and evaluation metrics.",
        "order": 2,
        "is_completed": false
      }
    ]
  }
  ```

### Get Node Content / Study Materials
* **URL**: `/api/learning/node/<node_id>/content`
* **Method**: `GET`
* **Headers**: `Authorization: Bearer <token>`
* **Success Response (200 OK)**:
  ```json
  {
    "node_id": 12,
    "title": "1. Introduction to ML",
    "beginner_notes": "# Introduction to Machine Learning\n\nMachine learning is...",
    "detailed_notes": "# Deep Dive into Machine Learning\n\nHistorically, artificial intelligence...",
    "revision_notes": "- ML is data-driven programming.\n- Supervised: Labeled data.\n- Unsupervised: Unlabeled data."
  }
  ```

### Get Node Quiz
* **URL**: `/api/learning/node/<node_id>/quiz`
* **Method**: `GET`
* **Headers**: `Authorization: Bearer <token>`
* **Success Response (200 OK)**:
  ```json
  {
    "quiz_id": 5,
    "node_id": 12,
    "questions": [
      {
        "id": 20,
        "question_text": "What is supervised learning?",
        "options": [
          "Learning without labeled data",
          "Learning with labeled inputs and target answers",
          "Finding structures in data clusters",
          "Learning from environment feedback rewards"
        ],
        "explanation": "Supervised learning relies on matching inputs to target outputs provided in labeled training datasets."
      }
    ]
  }
  ```

### Get Node Interview Prep
* **URL**: `/api/learning/node/<node_id>/interview`
* **Method**: `GET`
* **Headers**: `Authorization: Bearer <token>`
* **Success Response (200 OK)**:
  ```json
  {
    "node_id": 12,
    "questions": [
      {
        "id": 45,
        "question": "What is the difference between Supervised and Unsupervised learning?",
        "answer": "Supervised learning uses labeled training datasets to train models..."
      }
    ]
  }
  ```

---

## 3. User Progress & Analytics Endpoints

### Update Node Progress
* **URL**: `/api/learning/node/<node_id>/progress`
* **Method**: `POST`
* **Headers**: `Authorization: Bearer <token>`
* **Request Body**:
  ```json
  {
    "is_completed": true,
    "quiz_score": 85
  }
  ```
* **Success Response (200 OK)**:
  ```json
  {
    "message": "Progress updated successfully",
    "progress": {
      "node_id": 12,
      "is_completed": true,
      "quiz_score": 85
    }
  }
  ```

### Get Dashboard Statistics
* **URL**: `/api/learning/stats`
* **Method**: `GET`
* **Headers**: `Authorization: Bearer <token>`
* **Success Response (200 OK)**:
  ```json
  {
    "total_topics": 3,
    "completed_nodes": 14,
    "in_progress_nodes": 5,
    "average_quiz_score": 82.5,
    "recent_activity": [
      {
        "topic_title": "Machine Learning",
        "node_title": "1. Introduction to ML",
        "completed_at": "2026-07-02T19:22:31Z"
      }
    ]
  }
  ```
