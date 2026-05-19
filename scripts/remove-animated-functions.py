#!/usr/bin/env python3
"""Remove animated component functions from MundialGame.tsx"""

import re

# Read the file
with open('src/components/MundialGame.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Pattern to match the animated functions
# We'll remove from "// ---------" comment before AnimatedBicycleKick to the end of AnimatedClockStadium function
pattern = r'// -+\n// 5 ILUSTRACIONES PREMIUM.*?(?=// -+\n// TEMPORIZADOR DE KICKOFF)'

# Replace with empty string
content = re.sub(pattern, '', content, flags=re.DOTALL)

# Write back
with open('src/components/MundialGame.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ Removed animated component functions from MundialGame.tsx")
