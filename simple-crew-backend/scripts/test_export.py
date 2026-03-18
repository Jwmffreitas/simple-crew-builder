import sys
import os
import io
import zipfile
import yaml

# Adiciona o diretório app ao path para poder importar
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from app.schemas import GraphData, Node, NodeData, Edge
from app.exporter import generate_python_project

def test_export():
    # 1. Mock Graph Data
    mcp_id = "mcp_123"
    nodes = [
        Node(
            id="node_1",
            type="agent",
            position={"x": 0, "y": 0},
            data=NodeData(
                name="Pesquisador Sênior",
                role="Senior {topic} Researcher",
                goal="Find info about {topic}",
                backstory="Expert researcher in {topic}. He has more than 20 years of experience.",
                mcpServerIds=[mcp_id]
            )
        ),
        Node(
            id="node_2",
            type="task",
            position={"x": 100, "y": 100},
            data=NodeData(name="Tarefa de Pesquisa", description="Research {topic} for the year {year}. Make sure it is detailed.", expected_output="A list about {topic}. Bullet points format.")
        ),
        Node(
            id="node_3",
            type="crew",
            position={"x": 50, "y": -100},
            data=NodeData(name="Test Crew")
        )
    ]
    edges = [
        Edge(id="edge_1", source="node_1", target="node_2"),
    ]
    graph_data = GraphData(nodes=nodes, edges=edges)

    # Mocks MCP
    mcp_servers = [{
        "id": mcp_id,
        "name": "SearchServer",
        "transport_type": "stdio",
        "command": "npx",
        "args": ["-y", "@modelcontextprotocol/server-duckduckgo"],
        "env_vars": {"DEBUG": "true"}
    }]

    # Mocks LLM
    agent_llms = {
        "node_1": {"model": "gpt-4o-mini", "provider": "openai"}
    }
    providers = ["openai", "google"]

    # 2. Generate Zip
    zip_bytes = generate_python_project(
        graph_data, 
        "Test Project", 
        author_name="Gleison Souza", 
        author_email="gleison.lsouza@gmail.com",
        mcp_servers=mcp_servers,
        project_description="Este é um projeto de teste para verificar a exportação.",
        agent_llms=agent_llms,
        providers=providers
    )
    
    # 3. Verify Zip Content
    with zipfile.ZipFile(io.BytesIO(zip_bytes)) as z:
        files = z.namelist()
        print("Files in zip:", files)
        
        expected_files = [
            "test_project/.env",
            "test_project/pyproject.toml",
            "test_project/README.md",
            "test_project/src/test_project/config/agents.yaml",
            "test_project/src/test_project/config/tasks.yaml",
            "test_project/src/test_project/crew.py",
            "test_project/src/test_project/main.py",
            "test_project/src/test_project/__init__.py",
            "test_project/src/__init__.py",
        ]
        
        for f in expected_files:
            assert f in files, f"Missing file: {f}"
        
        # Verify .env content
        env_raw = z.read("test_project/.env").decode()
        assert "OPENAI_API_KEY=" in env_raw
        assert "GOOGLE_API_KEY=" in env_raw

        # Verify README.md for uv and description and keys
        readme_raw = z.read("test_project/README.md").decode()
        assert "uv sync" in readme_raw
        assert "uv run run_crew" in readme_raw
        assert "Este é um projeto de teste para verificar a exportação." in readme_raw
        assert "Simple Crew Builder" in readme_raw
        assert "OPENAI_API_KEY=sua_chave_aqui" in readme_raw
        assert "GOOGLE_API_KEY=sua_chave_aqui" in readme_raw

        # Verify pyproject.toml
        pyproject_raw = z.read("test_project/pyproject.toml").decode()
        assert "[project]" in pyproject_raw
        assert 'name = "test_project"' in pyproject_raw
        assert 'authors = [{ name = "Gleison Souza", email = "gleison.lsouza@gmail.com" }]' in pyproject_raw
        assert 'build-backend = "hatchling.build"' in pyproject_raw
        assert '"crewai-tools[mcp]>=1.10.1"' in pyproject_raw
        assert '"crewai[google-genai,tools]>=1.10.1"' in pyproject_raw

        # Verify YAML raw content (for block scalar verification)
        agents_yaml_raw = z.read("test_project/src/test_project/config/agents.yaml").decode()
        print("--- agents.yaml content ---\n", agents_yaml_raw)
        assert ">" in agents_yaml_raw, "Block scalar '>' not found in YAML"
        assert '"' not in agents_yaml_raw, "Quotation marks found in agents.yaml keys or values"
        assert "llm: gpt-4o-mini" in agents_yaml_raw
        
        agents_yaml = yaml.safe_load(agents_yaml_raw)
        assert "pesquisador_senior" in agents_yaml
        assert agents_yaml["pesquisador_senior"]["role"] == "Senior {topic} Researcher\n"
        
        # Check if the double newlines in backstory were squashed to single newlines
        backstory = agents_yaml["pesquisador_senior"]["backstory"]
        assert "\n\n" not in backstory, "Backstory still contains multiple newlines"
        
        tasks_yaml_raw = z.read("test_project/src/test_project/config/tasks.yaml").decode()
        print("--- tasks.yaml content ---\n", tasks_yaml_raw)
        
        tasks_yaml = yaml.safe_load(tasks_yaml_raw)
        assert "tarefa_de_pesquisa" in tasks_yaml
        assert tasks_yaml["tarefa_de_pesquisa"]["agent"] == "pesquisador_senior"
        
        # Verify crew.py content
        crew_py = z.read("test_project/src/test_project/crew.py").decode()
        print("--- crew.py content ---\n", crew_py)
        assert "class TestProjectCrew" in crew_py
        assert "@agent" in crew_py
        assert "def pesquisador_senior(self)" in crew_py
        assert "self.mcp_tools = mcp_tools or {}" in crew_py
        assert "this_tools.extend(self.mcp_tools.get('mcp_123', []))" in crew_py
        assert "tools=this_tools" in crew_py
        
        # Verify main.py for inputs and MCP
        main_py = z.read("test_project/src/test_project/main.py").decode()
        print("--- main.py content ---\n", main_py)
        assert '"topic":' in main_py
        assert '"year":' in main_py
        assert "kickoff(inputs=inputs)" in main_py
        assert "from contextlib import ExitStack" in main_py
        assert "from crewai_tools import MCPServerAdapter" in main_py
        assert "from mcp import StdioServerParameters" in main_py
        assert "StdioServerParameters" in main_py
        assert "SearchServer" in main_py
        assert "@modelcontextprotocol/server-duckduckgo" in main_py
        assert "mcp_tools['mcp_123'] = stack.enter_context" in main_py
        
    print("Export test passed!")

if __name__ == "__main__":
    test_export()
