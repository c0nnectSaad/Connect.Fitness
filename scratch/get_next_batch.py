import os
import json
import sys

# Force UTF-8 stdout
if sys.platform.startswith('win'):
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

project_img_dir = 'd:/Saad/Personal Projects/Web Apps/Saad\'sWorkout/public/images'
json_path = 'd:/Saad/Personal Projects/Web Apps/Saad\'sWorkout/scratch/missing_exercises.json'

with open(json_path, 'r', encoding='utf-8') as f:
    missing_list = json.load(f)

actual_images = os.listdir(project_img_dir)

# Find the next 8 exercises that don't have their ID-based PNG image yet
batch_size = 8
next_batch = []
for ex in missing_list:
    expected_img = f"{ex['id']}.png"
    if expected_img not in actual_images:
        next_batch.append(ex)
        if len(next_batch) == batch_size:
            break

print(json.dumps(next_batch, indent=2, ensure_ascii=False))
