from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from .schemas import GraphData
from .crew_builder import run_crew_stream

app = FastAPI(
    title="SimpleCrew Backend API",
    description="Endpoint recebedor de Grafos visuais React Flow para rodar CrewAI via Python nativo",
    version="1.0.0"
)

# Setup CORS para permitir conexão com o Servidor Vite do Frontend (React)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Modificar com url local/prod exata se quiser ser restritivo: ["http://localhost:5173"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {"message": "SimpleCrew API Health status: Operacional! 🚀"}

@app.post("/api/v1/run-crew")
async def execute_crew(graph_data: GraphData):
    try:
        # Despacha as dependências e payload JSON para a magia do nosso Parser local CrewAI Stream
        return StreamingResponse(
            run_crew_stream(graph_data), 
            media_type="text/event-stream"
        )
    except ValueError as ve:
        # Erros esperados capturados na nossa lógica de Parse customizada
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        # Erros internos ou de infra API das LLMs (OpenAI error keys, etc)
        raise HTTPException(status_code=500, detail=f"Falha Crítica na Matrix da IAM: {str(e)}")
