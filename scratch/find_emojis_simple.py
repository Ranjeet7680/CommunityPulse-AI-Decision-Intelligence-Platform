import os

root_dir = r"c:\Users\Victus\OneDrive\Desktop\Gen AI Academy APAC Edition"

for dirpath, _, filenames in os.walk(root_dir):
    if "node_modules" in dirpath or ".git" in dirpath or ".next" in dirpath or "backend" in dirpath:
        continue
    for filename in filenames:
        if filename.endswith((".html", ".tsx", ".ts", ".js")):
            filepath = os.path.join(dirpath, filename)
            try:
                with open(filepath, "r", encoding="utf-8") as f:
                    lines = f.readlines()
                for i, line in enumerate(lines):
                    non_ascii = [c for c in line if ord(c) > 127]
                    # Filter out common punctuation or curly quotes if needed, but display emojis
                    emojis = [c for c in non_ascii if ord(c) > 1000] # Emojis are generally > 1000
                    if emojis:
                        print(f"{filename}:{i+1} -> {''.join(emojis)} -> {line.strip()}")
            except Exception as e:
                pass
