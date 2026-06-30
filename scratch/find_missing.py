import os
import re
import sys

# Force UTF-8 stdout
if sys.platform.startswith('win'):
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# Read all exercises
path_ex = 'd:/Saad/Personal Projects/Web Apps/Saad\'sWorkout/src/data/exercises.ts'
with open(path_ex, 'r', encoding='utf-8') as f:
    content = f.read()

# Match entries
entries = re.findall(r"id:\s*'([^']+)'(?:.|\n)*?name:\s*'([^']+)'(?:.|\n)*?category:\s*'([^']+)'(?:.|\n)*?visualCategory:\s*'([^']+)'", content)

project_img_dir = 'd:/Saad/Personal Projects/Web Apps/Saad\'sWorkout/public/images'
actual_images = os.listdir(project_img_dir)

print(f"Checking {len(entries)} exercises against images folder...")
missing_count = 0
for idx, (ex_id, name, cat, vis_cat) in enumerate(entries, 1):
    expected_img = f"{ex_id}.png"
    if expected_img not in actual_images:
        print(f"MISSING: {ex_id} | Name: {name} | Category: {cat} | VisualCategory: {vis_cat}")
        missing_count += 1

print(f"\nTotal missing images: {missing_count}")
