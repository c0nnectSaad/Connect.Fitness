import os
import shutil
import glob

artifact_dirs = [
    r"C:\Users\dell\.gemini\antigravity\brain\b234fee1-563a-4e11-bb37-42d0d598df14",
    r"C:\Users\dell\.gemini\antigravity\brain\00decad6-4e12-4a5f-9e29-a091f64abe67"
]
project_img_dir = r"d:\Saad\Personal Projects\Web Apps\Saad'sWorkout\public\images"

copied_count = 0
for artifact_dir in artifact_dirs:
    if not os.path.exists(artifact_dir):
        continue
    # Look for files matching "e_*_cartoon*.png"
    search_path = os.path.join(artifact_dir, "e_*_cartoon*.png")
    matches = glob.glob(search_path)
    
    print(f"Directory {artifact_dir}: Found {len(matches)} generated matches.")
    for match in matches:
        filename = os.path.basename(match)
        if '_cartoon' in filename:
            ex_id = filename.split('_cartoon')[0]
            dest_path = os.path.join(project_img_dir, f"{ex_id}.png")
            
            # Only copy if we don't already have it, or if the source is newer
            if not os.path.exists(dest_path) or os.path.getmtime(match) > os.path.getmtime(dest_path):
                shutil.copy2(match, dest_path)
                print(f"Copied: {filename} -> {ex_id}.png")
                copied_count += 1

print(f"Done copying {copied_count} assets!")
