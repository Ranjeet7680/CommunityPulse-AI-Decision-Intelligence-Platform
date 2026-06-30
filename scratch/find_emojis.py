import os
import re

# Unicode ranges for emojis
EMOJI_PATTERN = re.compile(
    "["
    "\U00010000-\U0010ffff"  # Supplemental planes (most emojis)
    "\u2600-\u27bf"          # Miscellaneous Symbols and Dingbats
    "\u2300-\u23ff"          # Miscellaneous Technical
    "\u2b50"                 # Star
    "\u2934-\u2935"          # Arrows
    "]",
    flags=re.UNICODE
)

root_dir = r"c:\Users\Victus\OneDrive\Desktop\Gen AI Academy APAC Edition"

for dirpath, _, filenames in os.walk(root_dir):
    if "node_modules" in dirpath or ".git" in dirpath or ".next" in dirpath:
        continue
    for filename in filenames:
        if filename.endswith((".html", ".js", ".css", ".tsx", ".ts")):
            filepath = os.path.join(dirpath, filename)
            try:
                with open(filepath, "r", encoding="utf-8") as f:
                    lines = f.readlines()
                for i, line in enumerate(lines):
                    matches = EMOJI_PATTERN.findall(line)
                    if matches:
                        print(f"{filepath}:{i+1} -> {matches} -> {line.strip()}")
            except Exception as e:
                pass
