# 🚀 SimpleCrew

SimpleCrew is a professional-grade visual builder for **CrewAI**, allowing you to design, orchestrate, and monitor AI Multi-Agent systems through an intuitive drag-and-drop interface.

![SimpleCrew Banner](https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=1600)

## ✨ Features

- **Visual Orchestration:** Drag and drop Agents, Tasks, and Crews using a React Flow canvas.
- **Real-time SSE Streaming:** Watch the AI's "thought process" letter-by-letter with Server-Sent Events.
- **Dynamic Status Tracking:** Nodes and connections change colors (Gray -> Blue -> Green) in real-time as the execution flows.
- **Collapsible Console:** A sleek, VS-Code-style drawer to monitor raw logs and final results.
- **Robust Connection:** Built-in heartbeats and sentinel signals to prevent timeouts during long AI processing.

## 🛠 Tech Stack

### Frontend
- **React 18** + **Vite**
- **Tailwind CSS** (Modern, premium aesthetics)
- **Zustand** (Global state management)
- **React Flow** (Visual graph engine)
- **Lucide React** (Icons)

### Backend
- **Python 3.10+**
- **FastAPI** (High-performance streaming API)
- **CrewAI** (Multi-agent framework)
- **Uvicorn** (ASGI server)

## 🚀 Getting Started

### Prerequisites
- Node.js & npm
- Python 3.10+
- OpenAI API Key (configured in backend `.env`)

### 1. Backend Setup
```bash
cd simple-crew-backend
# Install dependencies (using uv or pip)
uv sync
# Or: pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env and add your OPENAI_API_KEY

# Run the server
uv run -m uvicorn app.main:app --reload
```
The API will be available at `http://localhost:8000`.

### 2. Frontend Setup
```bash
cd simple-crew-front
npm install
npm run dev
```
The application will be available at `http://localhost:5173`.

## 📂 Project Structure

```text
SimpleCrew/
├── simple-crew-backend/    # FastAPI + CrewAI logic
│   ├── app/                # Main application code
│   └── .env                # Backend configuration
├── simple-crew-front/      # React + Vite frontend
│   ├── src/                # Frontend source code
│   └── public/             # Static assets
└── README.md               # You are here!
```

## 📜 License
MIT
