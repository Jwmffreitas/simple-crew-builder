import os
import shutil
import zipfile
import tempfile
from typing import List, Dict
from openai import OpenAI
from sqlmodel import Session
from .enterprise_code_parser import chunk_code, get_language_from_ext, EXTENSION_TO_LANGUAGE
from ...database import engine
from ...ai_service import get_embedding_model_config
from ..database.neo4j_db import neo4j_manager

# Blacklist de pastas e arquivos binários/sensíveis
BLACKLIST_DIRS = {
    'node_modules', 'venv', '.env', '.git', '.idea', '.vscode', 
    '__pycache__', 'bin', 'obj', 'target', 'dist', 'build'
}
BLACKLIST_EXTENSIONS = {
    '.class', '.dll', '.exe', '.so', '.pyc', '.zip', '.tar', '.gz'
}

def is_valid_file(file_path: str) -> bool:
    """Verifica se o arquivo deve ser processado com base na Whitelist corporativa."""
    ext = os.path.splitext(file_path)[1].lower()
    return ext in EXTENSION_TO_LANGUAGE

def is_blacklisted(rel_path: str) -> bool:
    """Verifica se o caminho está na blacklist (pastas ou extensões)."""
    parts = rel_path.replace('\\', '/').split('/')
    if any(part in BLACKLIST_DIRS for part in parts):
        return True
    ext = os.path.splitext(rel_path)[1].lower()
    if ext in BLACKLIST_EXTENSIONS:
        return True
    return False

def ingest_repository_zip(kb_id: str, zip_path: str, kb_dir: str):
    """
    Extrai o ZIP permanentemente e retorna a lista de arquivos válidos para indexação.
    kb_dir: Caminho base da Knowledge Base (ex: storage/documents/{kb_id})
    """
    repo_name = os.path.splitext(os.path.basename(zip_path))[0]
    repo_extract_path = os.path.join(kb_dir, repo_name)
    
    # Se já existir uma pasta com o mesmo nome, tenta remover ou usar sufixo
    if os.path.exists(repo_extract_path):
        import time
        repo_extract_path = f"{repo_extract_path}_{int(time.time())}"
    
    os.makedirs(repo_extract_path, exist_ok=True)

    # 1. Extração
    try:
        with zipfile.ZipFile(zip_path, 'r') as zip_ref:
            zip_ref.extractall(repo_extract_path)
    except Exception as e:
        print(f"DEBUG: Erro ao extrair ZIP: {e}")
        return []

    # 2. Coleta de Arquivos Válidos
    valid_files = []
    
    for root, dirs, files in os.walk(repo_extract_path):
        # Remove pastas em blacklist do traversal
        dirs[:] = [d for d in dirs if d not in BLACKLIST_DIRS]
        
        for file in files:
            abs_path = os.path.join(root, file)
            rel_path = os.path.relpath(abs_path, repo_extract_path)
            
            if is_blacklisted(rel_path) or not is_valid_file(rel_path):
                # Remove arquivos não desejados para não ocupar espaço
                # ou apenas ignore. Aqui vamos apenas ignorar.
                continue
                
            valid_files.append({
                'abs_path': abs_path,
                'rel_path': rel_path,
                'filename': file,
                'language': get_language_from_ext(rel_path)
            })

    # Opcional: Remover o ZIP original após extração para economizar espaço
    try:
        os.remove(zip_path)
    except:
        pass

    return valid_files
