import os

frontend_dir = r"c:\Users\Victus\OneDrive\Desktop\Gen AI Academy APAC Edition\frontend\src"

replacements = {
    "⚡ Google Cloud": "Google Cloud",
    "🏙️": "",
    "📊": "",
    "⚡": "",
    "🌱": "",
    "🎓": "",
    "🏥": "",
    "🏛️": "",
    "🐙": "",
    "📖": "",
    "✍️": "",
    "🎬": "",
    "📋": "",
    "📦": "",
    "📡": "",
    "🔥": "",
    "🐘": "",
    "🔗": "",
    "📰": "",
    "💡": "",
}

for dirpath, _, filenames in os.walk(frontend_dir):
    for filename in filenames:
        if filename.endswith((".tsx", ".ts", ".js")):
            filepath = os.path.join(dirpath, filename)
            try:
                with open(filepath, "r", encoding="utf-8") as f:
                    content = f.read()
                
                orig_content = content
                for emoji, rep in replacements.items():
                    content = content.replace(emoji, rep)
                
                if content != orig_content:
                    with open(filepath, "w", encoding="utf-8") as f:
                        f.write(content)
                    print(f"Replaced emojis in: {filename}")
            except Exception as e:
                print(f"Error processing {filename}: {e}")

print("Frontend emojis successfully replaced.")
