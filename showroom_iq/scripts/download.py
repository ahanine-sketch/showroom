import json
import urllib.request
import os

# Path to the screens JSON file
json_path = "/Users/mac/.gemini/antigravity/brain/9fabb666-7aa3-4da3-837e-4b34f5b32812/.system_generated/steps/22/output.txt"
output_dir = "/Users/mac/Desktop/Sketch performance/showroom_iq/.stitch/designs"

os.makedirs(output_dir, exist_ok=True)

with open(json_path, 'r') as f:
    data = json.load(f)

screens = data.get("screens", [])

for screen in screens:
    title = screen.get("title", "Untitled").replace("/", "-").replace(" ", "_").replace("(", "").replace(")", "")
    html_info = screen.get("htmlCode", {})
    download_url = html_info.get("downloadUrl")
    
    if download_url:
        print(f"Downloading: {title}")
        try:
            filename = os.path.join(output_dir, f"{title}.html")
            urllib.request.urlretrieve(download_url, filename)
            print(f"  -> Saved as {filename}")
        except Exception as e:
            print(f"  -> Failed to download: {e}")
    else:
        print(f"No HTML download URL for {title}")
