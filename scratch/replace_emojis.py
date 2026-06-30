import os

file_path = r"c:\Users\Victus\OneDrive\Desktop\Gen AI Academy APAC Edition\index.html"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Replacements dictionary
replacements = {
    '<div style="font-size:40px;margin-bottom:16px">🏛️</div>': '<div style="margin-bottom:16px"><span class="material-symbols-rounded" style="font-size:40px;color:var(--blue);vertical-align:middle">corporate_fare</span></div>',
    '<div style="font-size:40px;margin-bottom:16px">🏥</div>': '<div style="margin-bottom:16px"><span class="material-symbols-rounded" style="font-size:40px;color:var(--green);vertical-align:middle">local_hospital</span></div>',
    '<div style="font-size:40px;margin-bottom:16px">🎓</div>': '<div style="margin-bottom:16px"><span class="material-symbols-rounded" style="font-size:40px;color:var(--yellow);vertical-align:middle">school</span></div>',
    '<div style="font-size:40px;margin-bottom:16px">🌱</div>': '<div style="margin-bottom:16px"><span class="material-symbols-rounded" style="font-size:40px;color:var(--red);vertical-align:middle">eco</span></div>',
    
    '<div style="font-size:36px;margin-bottom:16px">📖</div>': '<div style="margin-bottom:16px"><span class="material-symbols-rounded" style="font-size:36px;color:var(--blue);vertical-align:middle">book</span></div>',
    '<div style="font-size:36px;margin-bottom:16px">✍️</div>': '<div style="margin-bottom:16px"><span class="material-symbols-rounded" style="font-size:36px;color:var(--green);vertical-align:middle">edit_note</span></div>',
    '<div style="font-size:36px;margin-bottom:16px">🎬</div>': '<div style="margin-bottom:16px"><span class="material-symbols-rounded" style="font-size:36px;color:var(--yellow);vertical-align:middle">play_circle</span></div>',
    '<div style="font-size:36px;margin-bottom:16px">🏙️</div>': '<div style="margin-bottom:16px"><span class="material-symbols-rounded" style="font-size:36px;color:var(--red);vertical-align:middle">location_city</span></div>',
    '<div style="font-size:36px;margin-bottom:16px">📋</div>': '<div style="margin-bottom:16px"><span class="material-symbols-rounded" style="font-size:36px;color:var(--blue);vertical-align:middle">description</span></div>',
    '<div style="font-size:36px;margin-bottom:16px">📦</div>': '<div style="margin-bottom:16px"><span class="material-symbols-rounded" style="font-size:36px;color:var(--green);vertical-align:middle">deployed_code</span></div>',
    
    '<div class="connector-icon">📊</div>': '<div class="connector-icon"><span class="material-symbols-rounded" style="font-size:24px;color:var(--blue)">query_stats</span></div>',
    '<div class="connector-icon">☁️</div>': '<div class="connector-icon"><span class="material-symbols-rounded" style="font-size:24px;color:var(--blue)">cloud</span></div>',
    '<div class="connector-icon">🔥</div>': '<div class="connector-icon"><span class="material-symbols-rounded" style="font-size:24px;color:var(--red)">local_fire_department</span></div>',
    '<div class="connector-icon">📡</div>': '<div class="connector-icon"><span class="material-symbols-rounded" style="font-size:24px;color:var(--blue)">sensors</span></div>',
    '<div class="connector-icon">🐘</div>': '<div class="connector-icon"><span class="material-symbols-rounded" style="font-size:24px;color:var(--blue)">dns</span></div>',
    '<div class="connector-icon">🔗</div>': '<div class="connector-icon"><span class="material-symbols-rounded" style="font-size:24px;color:var(--green)">link</span></div>',
    
    '<div style="font-size:48px">🏙️</div>': '<div style="height:140px;display:flex;align-items:center;justify-content:center"><span class="material-symbols-rounded" style="font-size:48px;color:var(--blue)">location_city</span></div>',
    '<div style="font-size:48px">📊</div>': '<div style="height:140px;display:flex;align-items:center;justify-content:center"><span class="material-symbols-rounded" style="font-size:48px;color:var(--yellow)">query_stats</span></div>',
    '<div style="font-size:48px">⚡</div>': '<div style="height:140px;display:flex;align-items:center;justify-content:center"><span class="material-symbols-rounded" style="font-size:48px;color:var(--green)">flash_on</span></div>',
    
    '<div style="font-size:36px">📰</div>': '<div><span class="material-symbols-rounded" style="font-size:36px;color:var(--blue)">newspaper</span></div>',
    '<div style="font-size:72px;margin-bottom:20px">🐙</div>': '<div style="margin-bottom:20px"><span class="material-symbols-rounded" style="font-size:72px;color:var(--text-primary)">terminal</span></div>',
    
    '<div style="color:#fff;font-weight:700;margin-bottom:8px">📡 80+ REST Endpoints</div>': '<div style="color:#fff;font-weight:700;margin-bottom:8px;display:flex;align-items:center;gap:8px"><span class="material-symbols-rounded" style="font-size:18px;color:var(--blue)">sensors</span> 80+ REST Endpoints</div>',
    '<div style="color:#fff;font-weight:700;margin-bottom:8px">⚡ WebSocket Streaming</div>': '<div style="color:#fff;font-weight:700;margin-bottom:8px;display:flex;align-items:center;gap:8px"><span class="material-symbols-rounded" style="font-size:18px;color:var(--yellow)">flash_on</span> WebSocket Streaming</div>',
    '<div style="color:#fff;font-weight:700;margin-bottom:8px">🐍 Python & JS SDKs</div>': '<div style="color:#fff;font-weight:700;margin-bottom:8px;display:flex;align-items:center;gap:8px"><span class="material-symbols-rounded" style="font-size:18px;color:var(--green)">code</span> Python & JS SDKs</div>',
    
    '📖 Documentation': 'Documentation',
    '📖 API Reference': 'API Reference',
}

for emoji, replacement in replacements.items():
    content = content.replace(emoji, replacement)

# Replace remaining standalone emojis if present
content = content.replace('🏙️', '')
content = content.replace('📊', '')
content = content.replace('⚡', '')
content = content.replace('🌱', '')
content = content.replace('🎓', '')
content = content.replace('🏥', '')
content = content.replace('🏛️', '')
content = content.replace('🐙', '')
content = content.replace('📖', '')
content = content.replace('✍️', '')
content = content.replace('🎬', '')
content = content.replace('📋', '')
content = content.replace('📦', '')
content = content.replace('📡', '')
content = content.replace('🔥', '')
content = content.replace('🐘', '')
content = content.replace('🔗', '')
content = content.replace('📰', '')
content = content.replace('🐍', '')

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("index.html emojis successfully replaced.")
