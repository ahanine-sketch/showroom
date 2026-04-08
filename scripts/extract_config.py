import re
import os

input_file = '/Users/mac/Desktop/Sketch performance/showroom_iq/.stitch/designs/Login_Page.html'
output_file = '/Users/mac/Desktop/Sketch performance/showroom_iq/tailwind.config.ts'

with open(input_file, 'r') as f:
    html = f.read()

# Extract script content
match = re.search(r'<script id="tailwind-config">(.*?)</script>', html, re.DOTALL)
if match:
    config_js = match.group(1).strip()
    # It contains `tailwind.config = { ... }`
    # We want to export this as a typescript config.
    # Replace `tailwind.config = {` with `import type { Config } from "tailwindcss";\n\nconst config: Config = {`
    config_ts = config_js.replace('tailwind.config = {', 'import type { Config } from "tailwindcss";\n\nconst config: Config = {')
    
    # Add content array since the HTML config might not have it
    config_ts = re.sub(r'const config: Config = \{', 'const config: Config = {\n  content: [\n    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",\n    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",\n    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",\n  ],', config_ts)
    
    # Export it
    config_ts += '\nexport default config;'
    
    with open(output_file, 'w') as f:
        f.write(config_ts)
    print("tailwind.config.ts updated.")
else:
    print("Could not find tailwind-config block.")
