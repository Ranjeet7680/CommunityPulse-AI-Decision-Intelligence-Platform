import os

file_path = r"c:\Users\Victus\OneDrive\Desktop\Gen AI Academy APAC Edition\index.html"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

replacements = {
    '<span class="report-icon">🚦</span>': '<span class="report-icon"><span class="material-symbols-rounded" style="font-size:16px;color:var(--yellow);vertical-align:middle">traffic</span></span>',
    '<span class="report-icon">💨</span>': '<span class="report-icon"><span class="material-symbols-rounded" style="font-size:16px;color:var(--green);vertical-align:middle">air</span></span>',
    '<span class="report-icon">🚨</span>': '<span class="report-icon"><span class="material-symbols-rounded" style="font-size:16px;color:var(--red);vertical-align:middle">notifications_active</span></span>',
    
    '⚠️ CRITICAL: Flood Risk ORANGE': 'CRITICAL: Flood Risk ORANGE',
    '🌫️ CRITICAL: AQI 148': 'CRITICAL: AQI 148',
    ' WARNING: Energy Demand Peak': 'WARNING: Energy Demand Peak',
    '💧 WARNING: Water Pressure Drop': 'WARNING: Water Pressure Drop',
    '✅ RESOLVED: Traffic Blockage': 'RESOLVED: Traffic Blockage',
    
    '<div class="connector-icon">🗄️</div>': '<div class="connector-icon"><span class="material-symbols-rounded" style="font-size:24px;color:var(--blue)">database</span></div>',
    '<div class="connector-icon">📈</div>': '<div class="connector-icon"><span class="material-symbols-rounded" style="font-size:24px;color:var(--green)">table_chart</span></div>',
    '<div class="connector-icon">🔍</div>': '<div class="connector-icon"><span class="material-symbols-rounded" style="font-size:24px;color:var(--blue)">search</span></div>',
    
    '💬 WhatsApp': 'WhatsApp',
    
    '<span style="font-size:20px">🏆</span>': '<span class="material-symbols-rounded" style="font-size:20px;color:var(--yellow);vertical-align:middle">emoji_events</span>',
    '<span style="font-size:20px">🤝</span>': '<span class="material-symbols-rounded" style="font-size:20px;color:var(--blue);vertical-align:middle">handshake</span>',
    
    '🌫️ Pollution hotspots': 'Pollution hotspots',
    '🚦 Traffic forecast': 'Traffic forecast',
    '🌊 Flood risk analysis': 'Flood risk analysis',
    '🗑️ Waste routing': 'Waste routing',
    '🔒 Crime prediction': 'Crime prediction',
}

for emoji, rep in replacements.items():
    content = content.replace(emoji, rep)

# Strip remaining emoji unicode symbols
content = content.replace('⚠️', '')
content = content.replace('🌫️', '')
content = content.replace('🌊', '')
content = content.replace('🗑️', '')
content = content.replace('🔒', '')
content = content.replace('🚦', '')
content = content.replace('💧', '')
content = content.replace('✅', '')
content = content.replace('🏆', '')
content = content.replace('🤝', '')
content = content.replace('💬', '')
content = content.replace('🗄️', '')
content = content.replace('📈', '')
content = content.replace('🔍', '')

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("More emojis replaced in index.html.")
