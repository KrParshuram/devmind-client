# 🧠 DevMind Frontend

DevMind is an AI-powered **Second Brain for Developers** that helps users save, organize, and query their development resources using AI. This repository contains the **React frontend** of the application.

---

## ✨ Features

* 🔐 JWT Authentication
* 📚 Resource Management

  * Save URLs
  * Upload PDF files
  * Store code snippets
  * Save text notes
* 🗂️ Collections

  * Create collections
  * View collection resources
  * Add existing resources to collections
  * Remove resources from collections
* 🤖 AI-powered Query Interface
* 🔍 Search & Filtering
* 📄 Pagination
* 📱 Responsive Design
* 🛡️ Protected Routes
* 🌐 REST API Integration

---

## 🛠️ Tech Stack

* React
* Vite
* React Router
* Axios
* Tailwind CSS

---

## 📁 Project Structure

```text
src/
│
├── api/
│   └── axios.js
│
├── components/
│   ├── AddResourceModal.jsx
│   ├── CollectionCard.jsx
│   ├── CollectionDetailsModal.jsx
│   ├── CreateCollectionModal.jsx
│   └── ...
│
├── pages/
│   ├── Dashboard.jsx
│   ├── Collections.jsx
│   ├── Login.jsx
│   ├── Register.jsx
│   └── Query.jsx
│
├── redux/
├── routes/
├── utils/
│
├── App.jsx
└── main.jsx
```

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd devmind-client
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Create Environment Variables

Create a `.env` file in the project root.

```env
VITE_API_URL=http://localhost:3000
```

### 4. Run the Development Server

```bash
npm run dev
```

The application will be available at:

```text
http://localhost:5173
```

---

## 📦 Production Build

Build the application:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

---

## 🔗 Backend API

The frontend communicates with the DevMind backend through REST APIs.

### Authentication

```http
POST /api/auth/register
POST /api/auth/login
```

### Resources

```http
GET    /api/user/resource
POST   /api/resource
PUT    /api/resource/:id
DELETE /api/resource/:id
```

### Collections

```http
GET    /api/collections
POST   /api/collections
DELETE /api/collections/:id

GET    /api/collections/:id/resources
POST   /api/collections/:id/resources
```

### AI Query

```http
POST /api/query
```

---

## 🌟 Core Workflow

1. Register or log in.
2. Save resources such as URLs, PDFs, code snippets, or notes.
3. Organize resources into collections.
4. Query your knowledge base using AI.
5. Manage resources and collections from the dashboard.

---

## 🎯 Future Enhancements

* 🌙 Dark/Light Theme
* 📝 Edit Resources
* 🤝 Shared Collections
* ⭐ Favorite Resources
* 📊 Analytics Dashboard
* 🔔 Notifications
* ⌨️ Keyboard Shortcuts
* 💬 AI Chat History
* ⚡ Real-time Updates
* 🎨 Improved UI Animations

---

## 📸 Screenshots

Add screenshots of:

* Login
* Dashboard
* Resource Management
* Collections
* Collection Details
* AI Query Interface

---

## 🤝 Contributing

Contributions are welcome!

1. Fork the repository.
2. Create a feature branch.

```bash
git checkout -b feature/your-feature
```

3. Commit your changes.

```bash
git commit -m "Add your feature"
```

4. Push to your branch.

```bash
git push origin feature/your-feature
```

5. Open a Pull Request.

---

## 📄 License

This project is licensed under the **MIT License**.

---

**Built with ❤️ using React, Vite, Tailwind CSS, and modern web technologies.**

If you're planning to make the repository public, I can also create a more polished GitHub-style README with badges, architecture diagrams, feature screenshots, and deployment instructions.
