# CollabFlow 🚀

A full-featured collaborative project management platform inspired by Trello and Notion. CollabFlow enables teams to organize, track, and collaborate on projects with real-time updates, task management, and comprehensive notification system.

## ✨ Features

### Core Functionality
- **User Authentication**: Secure registration and login with JWT tokens
- **Project Management**: Create, update, delete, and archive projects
- **Board System**: Kanban-style boards with customizable columns
- **Task Management**: Full CRUD operations for tasks with status tracking
- **Real-time Collaboration**: Socket.IO powered live updates
- **Comments System**: Threaded discussions on tasks
- **Notifications**: Real-time alerts for task assignments, mentions, and updates
- **User Roles**: Owner, admin, member, and viewer permissions

### Technical Features
- **RESTful API**: Complete backend API with Express.js
- **MongoDB Database**: Scalable NoSQL database with Mongoose ODM
- **Authentication**: JWT-based secure authentication
- **Real-time**: Socket.IO for instant updates
- **Validation**: Express-validator for input validation
- **Security**: Bcrypt password hashing, CORS enabled

## 🏗️ Architecture

```
CollabFlow/
├── backend/
│   ├── models/          # Mongoose schemas
│   │   ├── User.js
│   │   ├── Project.js
│   │   ├── Board.js
│   │   ├── Task.js
│   │   ├── Comment.js
│   │   └── Notification.js
│   ├── routes/          # Express route handlers
│   │   ├── auth.js
│   │   ├── projects.js
│   │   ├── boards.js
│   │   ├── tasks.js
│   │   ├── comments.js
│   │   └── notifications.js
│   ├── middleware/      # Custom middleware
│   │   └── auth.js
│   ├── package.json
│   └── server.js        # Express server
├── frontend/            # (To be implemented)
│   ├── index.html
│   ├── styles.css
│   └── app.js
├── .gitignore
├── LICENSE
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/laatortuejaune/CollabFlow.git
cd CollabFlow
```

2. **Install backend dependencies**
```bash
cd backend
npm install
```

3. **Configure environment variables**

Create a `.env` file in the backend directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/collabflow
JWT_SECRET=your-super-secret-jwt-key-change-this
CLIENT_URL=http://localhost:3000
```

4. **Start MongoDB**
```bash
# If using local MongoDB
mongod
```

5. **Run the backend server**
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

The API will be available at `http://localhost:5000`

## 📚 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "securepassword",
  "fullName": "John Doe"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securepassword"
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>
```

### Project Endpoints

#### Get All Projects
```http
GET /api/projects
Authorization: Bearer <token>
```

#### Create Project
```http
POST /api/projects
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "My Project",
  "description": "Project description",
  "tags": ["work", "urgent"]
}
```

#### Get Project by ID
```http
GET /api/projects/:id
Authorization: Bearer <token>
```

#### Update Project
```http
PUT /api/projects/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Name",
  "status": "active"
}
```

#### Delete Project
```http
DELETE /api/projects/:id
Authorization: Bearer <token>
```

### Additional Endpoints
- **Boards**: `/api/boards`
- **Tasks**: `/api/tasks`
- **Comments**: `/api/comments`
- **Notifications**: `/api/notifications`

## 🧪 Testing

```bash
cd backend
npm test
```

## 🛠️ Technology Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **Real-time**: Socket.IO
- **Validation**: Express-validator
- **Security**: Bcryptjs, CORS

### Frontend (Planned)
- **HTML5/CSS3/JavaScript**
- **Real-time updates with Socket.IO client**
- **Responsive design**

## 🔒 Security

- Passwords are hashed using bcrypt with salt rounds of 10
- JWT tokens expire after 7 days
- CORS enabled for cross-origin requests
- Input validation on all endpoints
- Authentication middleware protects sensitive routes

## 📊 Database Schema

### User Model
- username, email, password (hashed)
- fullName, avatar, role
- projects[], notifications[]

### Project Model
- name, description, owner
- members[] (with roles)
- boards[], status, tags

### Task Model
- title, description, status, priority
- assignedTo[], comments[]
- dueDate, checklist[], attachments[]

### Board Model
- name, description, project
- columns[] with tasks

### Comment Model
- content, author, task
- timestamps

### Notification Model
- recipient, sender, type, message
- link, read status

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**laatortuejaune**
- GitHub: [@laatortuejaune](https://github.com/laatortuejaune)

## 🙏 Acknowledgments

- Inspired by Trello and Notion
- Built with modern web technologies
- Community-driven development

## 🚀 Deployment

### Deploy to Heroku

1. Create a Heroku account and install Heroku CLI
2. Login to Heroku: `heroku login`
3. Create a new app: `heroku create collabflow-app`
4. Add MongoDB Atlas addon: `heroku addons:create mongolab`
5. Set environment variables:
```bash
heroku config:set JWT_SECRET=your-secret-key
heroku config:set CLIENT_URL=https://your-frontend-url.com
```
6. Deploy: `git push heroku main`

### Deploy Frontend to GitHub Pages

1. Build your frontend (if applicable)
2. Push to gh-pages branch
3. Enable GitHub Pages in repository settings

## 📞 Support

For support, please open an issue in the GitHub repository.

## 🗺️ Roadmap

- [x] Backend API with authentication
- [x] Project and task management
- [x] Real-time updates with Socket.IO
- [ ] Complete frontend implementation
- [ ] File upload support
- [ ] Email notifications
- [ ] Advanced search and filtering
- [ ] Mobile app (React Native)
- [ ] Analytics dashboard

---

**Made with ❤️ by laatortuejaune**
