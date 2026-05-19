#!/usr/bin/env python3
"""
Script para generar modelos 3D realistas de estadios usando Trellis
Requiere: trellis-cli instalado
"""

import os
import json
import subprocess
from pathlib import Path

# Datos de estadios del Mundial 2026
STADIUMS = [
    {
        "id": "azteca",
        "name": "Estadio Azteca",
        "city": "Ciudad de México",
        "country": "México",
        "prompt": "Realistic 3D model of Estadio Azteca, iconic Mexican football stadium with distinctive architecture, aerial view, high quality, detailed"
    },
    {
        "id": "akron",
        "name": "Estadio Akron",
        "city": "Guadalajara",
        "country": "México",
        "prompt": "Realistic 3D model of Estadio Akron in Guadalajara, modern football stadium, detailed architecture, aerial perspective"
    },
    {
        "id": "bbva",
        "name": "Estadio BBVA",
        "city": "Monterrey",
        "country": "México",
        "prompt": "Realistic 3D model of Estadio BBVA Bancomer in Monterrey, modern Mexican stadium, detailed design, high quality"
    },
    {
        "id": "arrowhead",
        "name": "Arrowhead Stadium",
        "city": "Kansas City",
        "country": "USA",
        "prompt": "Realistic 3D model of Arrowhead Stadium Kansas City, iconic American football stadium, detailed architecture"
    },
    {
        "id": "mercedes_benz",
        "name": "Mercedes-Benz Stadium",
        "city": "Atlanta",
        "country": "USA",
        "prompt": "Realistic 3D model of Mercedes-Benz Stadium Atlanta, modern futuristic design, detailed architecture, high quality"
    },
    {
        "id": "att",
        "name": "AT&T Stadium",
        "city": "Dallas",
        "country": "USA",
        "prompt": "Realistic 3D model of AT&T Stadium Dallas, iconic American football stadium with distinctive dome, detailed"
    },
    {
        "id": "nrg",
        "name": "NRG Stadium",
        "city": "Houston",
        "country": "USA",
        "prompt": "Realistic 3D model of NRG Stadium Houston, modern football stadium, detailed architecture"
    },
    {
        "id": "hard_rock",
        "name": "Hard Rock Stadium",
        "city": "Miami",
        "country": "USA",
        "prompt": "Realistic 3D model of Hard Rock Stadium Miami, modern football stadium, detailed design"
    },
    {
        "id": "levis",
        "name": "Levi's Stadium",
        "city": "San Francisco",
        "country": "USA",
        "prompt": "Realistic 3D model of Levi's Stadium San Francisco, modern football stadium, detailed architecture"
    },
    {
        "id": "sofi",
        "name": "SoFi Stadium",
        "city": "Los Angeles",
        "country": "USA",
        "prompt": "Realistic 3D model of SoFi Stadium Los Angeles, ultra-modern futuristic design, detailed architecture"
    },
    {
        "id": "lumen",
        "name": "Lumen Field",
        "city": "Seattle",
        "country": "USA",
        "prompt": "Realistic 3D model of Lumen Field Seattle, modern football stadium, detailed design"
    },
    {
        "id": "empower",
        "name": "Empower Field",
        "city": "Denver",
        "country": "USA",
        "prompt": "Realistic 3D model of Empower Field Denver, modern football stadium, detailed architecture"
    },
    {
        "id": "bmo",
        "name": "BMO Field",
        "city": "Toronto",
        "country": "Canadá",
        "prompt": "Realistic 3D model of BMO Field Toronto, modern Canadian football stadium, detailed design"
    },
    {
        "id": "bc_place",
        "name": "BC Place",
        "city": "Vancouver",
        "country": "Canadá",
        "prompt": "Realistic 3D model of BC Place Vancouver, modern stadium with distinctive roof, detailed architecture"
    }
]

OUTPUT_DIR = Path("public/stadiums-3d")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

def generate_stadium_model(stadium: dict) -> bool:
    """
    Genera un modelo 3D realista de un estadio usando Trellis
    
    Args:
        stadium: Diccionario con datos del estadio
        
    Returns:
        True si fue exitoso, False si falló
    """
    stadium_id = stadium["id"]
    prompt = stadium["prompt"]
    output_path = OUTPUT_DIR / f"{stadium_id}.glb"
    
    print(f"\n🏟️  Generando modelo 3D para {stadium['name']}...")
    print(f"   Prompt: {prompt}")
    print(f"   Output: {output_path}")
    
    try:
        # Comando para Trellis (ajusta según tu instalación)
        cmd = [
            "trellis",
            "generate",
            "--prompt", prompt,
            "--output", str(output_path),
            "--format", "glb",
            "--quality", "high",
            "--size", "1024"
        ]
        
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=300)
        
        if result.returncode == 0:
            print(f"   ✅ Modelo generado exitosamente")
            return True
        else:
            print(f"   ❌ Error: {result.stderr}")
            return False
            
    except subprocess.TimeoutExpired:
        print(f"   ❌ Timeout: La generación tardó demasiado")
        return False
    except Exception as e:
        print(f"   ❌ Error: {str(e)}")
        return False

def generate_all_stadiums():
    """Genera modelos 3D para todos los estadios"""
    print("=" * 60)
    print("🏟️  GENERADOR DE ESTADIOS 3D CON TRELLIS")
    print("=" * 60)
    print(f"\nGenerando {len(STADIUMS)} modelos 3D de estadios...")
    print(f"Directorio de salida: {OUTPUT_DIR}")
    
    successful = 0
    failed = 0
    
    for stadium in STADIUMS:
        if generate_stadium_model(stadium):
            successful += 1
        else:
            failed += 1
    
    print("\n" + "=" * 60)
    print(f"✅ Exitosos: {successful}")
    print(f"❌ Fallidos: {failed}")
    print("=" * 60)
    
    # Generar archivo de índice
    index = {
        "stadiums": STADIUMS,
        "generated": successful,
        "failed": failed,
        "total": len(STADIUMS)
    }
    
    index_path = OUTPUT_DIR / "index.json"
    with open(index_path, "w") as f:
        json.dump(index, f, indent=2)
    
    print(f"\n📋 Índice guardado en: {index_path}")

if __name__ == "__main__":
    generate_all_stadiums()
