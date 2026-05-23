#!/usr/bin/env python3
"""
Antigravity Context Integration
Guarda contexto automáticamente en Obsidian cuando se agota el token budget
"""

import subprocess
import datetime
import os
import json
from pathlib import Path

class ContextManager:
    def __init__(self, workspace="c:\\Proyectos\\OraculoMundial", 
                 vault_path="C:\\Proyectos\\Propgear-AI\\Propgear-Notas"):
        self.workspace = workspace
        self.vault_path = vault_path
        self.session_dir = Path(vault_path) / "Sesiones-Kiro"
        self.session_dir.mkdir(parents=True, exist_ok=True)
    
    def save_context(self, session_name=None, notes=""):
        """Guarda contexto actual en Obsidian"""
        if not session_name:
            session_name = f"antigravity-{datetime.datetime.now().strftime('%Y-%m-%d-%H%M')}"
        
        # Ejecutar script PowerShell
        cmd = [
            "powershell",
            "-NoProfile",
            "-Command",
            f"cd {self.workspace}; .\\scripts\\context-saver.ps1 -SessionName '{session_name}'"
        ]
        
        try:
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
            print(f"✅ Contexto guardado: {session_name}")
            print(result.stdout)
            return session_name
        except subprocess.TimeoutExpired:
            print("❌ Timeout al guardar contexto")
            return None
        except Exception as e:
            print(f"❌ Error: {e}")
            return None
    
    def load_context(self, session_name=None):
        """Carga contexto desde Obsidian"""
        cmd = [
            "powershell",
            "-NoProfile",
            "-Command",
            f"cd {self.workspace}; .\\scripts\\context-loader.ps1" + 
            (f" -SessionName '{session_name}'" if session_name else "")
        ]
        
        try:
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
            print(result.stdout)
            return True
        except Exception as e:
            print(f"❌ Error: {e}")
            return False
    
    def list_sessions(self, limit=10):
        """Lista sesiones guardadas"""
        try:
            sessions = sorted(
                self.session_dir.glob("*.md"),
                key=lambda x: x.stat().st_mtime,
                reverse=True
            )[:limit]
            
            print(f"\n📂 Últimas {len(sessions)} sesiones:\n")
            for i, session in enumerate(sessions, 1):
                mtime = datetime.datetime.fromtimestamp(session.stat().st_mtime)
                print(f"  {i}. {session.stem}")
                print(f"     Guardada: {mtime.strftime('%Y-%m-%d %H:%M:%S')}\n")
            
            return sessions
        except Exception as e:
            print(f"❌ Error: {e}")
            return []
    
    def get_recent_files(self, hours=2):
        """Obtiene archivos modificados recientemente"""
        try:
            cutoff = datetime.datetime.now() - datetime.timedelta(hours=hours)
            recent = []
            
            for root, dirs, files in os.walk(self.workspace):
                # Ignorar carpetas comunes
                dirs[:] = [d for d in dirs if d not in ['.git', 'node_modules', 'dist', 'build']]
                
                for file in files:
                    filepath = Path(root) / file
                    mtime = datetime.datetime.fromtimestamp(filepath.stat().st_mtime)
                    if mtime > cutoff:
                        recent.append(str(filepath.relative_to(self.workspace)))
            
            return sorted(recent)
        except Exception as e:
            print(f"❌ Error: {e}")
            return []

# Uso desde línea de comandos
if __name__ == "__main__":
    import sys
    
    manager = ContextManager()
    
    if len(sys.argv) < 2:
        print("Uso:")
        print("  python antigravity-context-integration.py save [nombre]")
        print("  python antigravity-context-integration.py load [nombre]")
        print("  python antigravity-context-integration.py list")
        sys.exit(1)
    
    command = sys.argv[1]
    
    if command == "save":
        name = sys.argv[2] if len(sys.argv) > 2 else None
        manager.save_context(name)
    elif command == "load":
        name = sys.argv[2] if len(sys.argv) > 2 else None
        manager.load_context(name)
    elif command == "list":
        manager.list_sessions()
    else:
        print(f"❌ Comando desconocido: {command}")
