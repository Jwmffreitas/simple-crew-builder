import os
from typing import List, Dict

# Mapeamento de Extensões para Linguagens (Enterprise & Legacy)
EXTENSION_TO_LANGUAGE = {
    # Modern / Web
    '.py': 'Python',
    '.js': 'JavaScript',
    '.jsx': 'React (JS)',
    '.ts': 'TypeScript',
    '.tsx': 'React (TS)',
    '.json': 'JSON',
    '.md': 'Markdown',
    '.html': 'HTML',
    '.css': 'CSS',
    # Enterprise (Backend)
    '.java': 'Java',
    '.cs': 'C# (.NET)',
    '.go': 'Go',
    '.rb': 'Ruby',
    '.php': 'PHP',
    '.cpp': 'C++',
    '.c': 'C',
    '.h': 'C/C++ Header',
    # Databases
    '.sql': 'SQL',
    '.plsql': 'PL/SQL (Oracle)',
    '.tsql': 'T-SQL (SQL Server)',
    '.prc': 'Stored Procedure',
    '.fnc': 'Function (DB)',
    # Legacy Systems
    '.cbl': 'COBOL',
    '.cob': 'COBOL',
    '.cpy': 'COBOL Copybook',
    '.jcl': 'JCL (Mainframe)',
    # Scripts & Config
    '.sh': 'Shell Script',
    '.bat': 'Batch Script',
    '.ps1': 'PowerShell',
    '.yaml': 'YAML',
    '.yml': 'YAML',
    '.xml': 'XML'
}

def get_language_from_ext(file_path: str) -> str:
    ext = os.path.splitext(file_path)[1].lower()
    return EXTENSION_TO_LANGUAGE.get(ext, 'Unknown')

def chunk_code(content: str, file_path: str, chunk_size: int = 1800, overlap: int = 250) -> List[str]:
    """
    Divide o código em chunks heurísticos, tentando quebrar em linhas e preservando metadados.
    """
    language = get_language_from_ext(file_path)
    header = f"[File: {file_path}]\n[Language: {language}]\n[Code]\n"
    
    # Se o conteúdo for menor que o tamanho do chunk, retorna ele inteiro com header
    if len(content) <= chunk_size:
        return [header + content]

    chunks = []
    start = 0
    
    while start < len(content):
        end = start + chunk_size
        
        # Se não for o fim do arquivo, tenta encontrar uma quebra de linha inteligente
        if end < len(content):
            # Tenta encontrar \n\n (fim de função/bloco) nos últimos 300 caracteres do chunk
            lookback = content.rfind('\n\n', end - 300, end)
            if lookback != -1:
                end = lookback + 2
            else:
                # Tenta encontrar apenas \n nos últimos 100 caracteres
                lookback_line = content.rfind('\n', end - 100, end)
                if lookback_line != -1:
                    end = lookback_line + 1
        
        chunk_text = content[start:end].strip()
        if chunk_text:
            chunks.append(header + chunk_text)
            
        # Avança com overlap
        start = end - overlap
        if start >= len(content) or end >= len(content):
            break
            
    return chunks
