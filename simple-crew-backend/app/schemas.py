from pydantic import BaseModel
from typing import List, Dict, Optional, Any

class NodeData(BaseModel):
    # Campos que transitam desde o Canvas do React Flow
    name: Optional[str] = None
    role: Optional[str] = None
    goal: Optional[str] = None
    backstory: Optional[str] = None
    description: Optional[str] = None
    expected_output: Optional[str] = None
    process: Optional[str] = None
    # Permitir chaves adicionais como isCollapsed de forma crua, caso necessite depois
    class Config:
        extra = "allow"

class Node(BaseModel):
    id: str
    type: str  # 'crew', 'agent' ou 'task'
    data: NodeData
    position: Dict[str, float]

class Edge(BaseModel):
    id: str
    source: str
    target: str
    # 'sourceHandle' e 'targetHandle' geralmente vem no xyflow, permitimos opcional
    sourceHandle: Optional[str] = None
    targetHandle: Optional[str] = None

class GraphData(BaseModel):
    version: Optional[str] = "1.0"
    nodes: List[Node]
    edges: List[Edge]
