import os
import re

routes = {
    'Login_Page.html': 'src/app/page.tsx',
    'Admin_Dashboard_My_Showroom.html': 'src/app/admin/dashboard/page.tsx',
    'Showroom_Detail.html': 'src/app/admin/showroom/[id]/page.tsx',
    'Commercial_Scorecard_Admin.html': 'src/app/admin/scorecard/commercial/page.tsx',
    'Admin_Settings.html': 'src/app/admin/settings/page.tsx',
    'Owner_Dashboard.html': 'src/app/owner/dashboard/page.tsx',
    'Owner_Settings.html': 'src/app/owner/settings/page.tsx',
    'Commercial_Dashboard_Read-only.html': 'src/app/commercial/dashboard/page.tsx',
    'Scorecard_-_Behavior_Tab.html': 'src/app/shared/scorecard/behavior/page.tsx',
    'Scorecard_-_Calendar_Tab.html': 'src/app/shared/scorecard/calendar/page.tsx'
}

base_dir = '/Users/mac/Desktop/Sketch performance/showroom_iq'
html_dir = os.path.join(base_dir, '.stitch/designs')

def convert_html_to_jsx(html):
    # Extract body content
    match = re.search(r'<body[^>]*>(.*?)</body>', html, re.DOTALL | re.IGNORECASE)
    if not match:
        return "<></>"
    
    body = match.group(1)
    
    # 1. Replace class=" with className="
    body = re.sub(r'class="', 'className="', body)
    
    # 2. Replace for=" with htmlFor="
    body = re.sub(r'for="', 'htmlFor="', body)
    
    # 3. Replace inline styles style="..." with style={{}} (basic approximation)
    def style_replacer(m):
        style_str = m.group(1)
        styles = []
        for prop in style_str.split(';'):
            if not prop.strip(): continue
            parts = prop.split(':', 1)
            if len(parts) == 2:
                key, val = parts
                key = key.strip()
                val = val.strip()
                # camelCase keys
                key = re.sub(r'-([a-z])', lambda x: x.group(1).upper(), key)
                val = val.replace("'", "\\'")
                styles.append(f"{key}: '{val}'")
        return 'style={{' + ', '.join(styles) + '}}'
        
    body = re.sub(r'style="([^"]*)"', style_replacer, body)
    
    # 4. Self close tags
    void_tags = ['img', 'input', 'br', 'hr', 'source']
    for tag in void_tags:
        # Match <tag ... > but not self-closed <tag ... />
        pattern = re.compile(f'<{tag}\\b([^>]*?)(?<!/)>', re.IGNORECASE)
        # Use a function to ensure we don't double self-close if it's already self-closed
        def close_tag(match):
            attrs = match.group(1)
            if attrs.endswith('/'):
                return match.group(0) # Already closed
            return f'<{tag}{attrs}/>'
    body = pattern.sub(close_tag, body)

    # Convert disabled="" to disabled={true}
    body = re.sub(r'\bdisabled=""', 'disabled={true}', body)
    body = re.sub(r'\bchecked=""', 'defaultChecked={true}', body)

    # 5. Fix <svg> elements
    body = re.sub(r'\bviewbox=', 'viewBox=', body)
    body = re.sub(r'\bstroke-width=', 'strokeWidth=', body)
    body = re.sub(r'\bstroke-linecap=', 'strokeLinecap=', body)
    body = re.sub(r'\bstroke-linejoin=', 'strokeLinejoin=', body)
    body = re.sub(r'\bfill-rule=', 'fillRule=', body)
    body = re.sub(r'\bclip-rule=', 'clipRule=', body)
    body = re.sub(r'\bclip-path=', 'clipPath=', body)
    body = re.sub(r'\bstroke-dasharray=', 'strokeDasharray=', body)
    body = re.sub(r'\bstroke-dashoffset=', 'strokeDashoffset=', body)
    body = re.sub(r'<lineargradient\b', '<linearGradient', body, flags=re.IGNORECASE)
    body = re.sub(r'</lineargradient>', '</linearGradient>', body, flags=re.IGNORECASE)
    
    # Remove HTML comments to avoid issues
    body = re.sub(r'<!--(.*?)-->', '', body, flags=re.DOTALL)

    return body

for html_file, route_path in routes.items():
    in_path = os.path.join(html_dir, html_file)
    out_path = os.path.join(base_dir, route_path)
    
    if os.path.exists(in_path):
        with open(in_path, 'r', encoding='utf-8') as f:
            html = f.read()
            
        jsx_content = convert_html_to_jsx(html)
        
        # Write to React component
        component = f"""import React from 'react';

export default function Page() {{
  return (
    <>
      {jsx_content}
    </>
  );
}}
"""
        os.makedirs(os.path.dirname(out_path), exist_ok=True)
        with open(out_path, 'w', encoding='utf-8') as f:
            f.write(component)
        print(f"Created {route_path}")
    else:
        print(f"Skipping {html_file} -> {in_path} not found")
