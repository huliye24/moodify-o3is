import re

with open('src/components/RulesModal.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# We'll process className attributes carefully
# Strategy: for each className="...", identify color classes and move them to style={{}}

def process_classname(match):
    tag_start = match.group(1)  # everything before className
    full_classes = match.group(2)  # the full className value
    tag_end = match.group(3)  # everything after the className value (>, />, etc.)

    # Identify color-related classes
    color_map = {
        'text-gray-500': "'rgba(107,122,143,0.5)'",
        'text-gray-400': "'rgba(107,122,143,0.5)'",
        'text-gray-300': "'rgba(196,212,228,0.75)'",
        'text-gray-100': "'rgba(196,212,228,0.9)'",
        'text-white':     "'rgba(196,212,228,1)'",
        'text-primary-400': "'rgba(107,122,143,0.7)'",
        'text-primary-500': "'rgba(107,122,143,0.7)'",
        'text-primary-600': "'rgba(107,122,143,0.7)'",
        'text-green-400':  "'rgba(74,222,128,0.7)'",
        'text-red-400':    "'rgba(239,68,68,0.7)'",
        'text-red-500':    "'rgba(239,68,68,0.7)'",
        'text-red-200':    "'rgba(252,165,165,0.8)'",
        'text-yellow-400': "'rgba(196,212,228,0.9)'",
        'text-amber-500':  "'rgba(251,191,36,0.8)'",
    }
    bg_map = {
        'bg-dark-300':        "'rgba(107,122,143,0.04)'",
        'bg-dark-200':        "'rgba(107,122,143,0.08)'",
        'bg-dark-100':        "'rgba(107,122,143,0.12)'",
        'bg-primary-600':     "'rgba(107,122,143,0.2)'",
        'bg-primary-500':     "'rgba(107,122,143,0.2)'",
        'bg-primary-400':     "'rgba(107,122,143,0.15)'",
        'bg-primary-900':     "'rgba(107,122,143,0.12)'",
        'bg-green-600/20':    "'rgba(22,163,74,0.08)'",
        'bg-amber-600/20':   "'rgba(251,191,36,0.08)'",
        'bg-yellow-600/20':  "'rgba(202,138,4,0.08)'",
    }
    border_map = {
        'border-gray-700':    "'rgba(107,122,143,0.15)'",
        'border-gray-800':    "'rgba(107,122,143,0.1)'",
        'border-gray-600':    "'rgba(107,122,143,0.2)'",
        'border-primary-600':  "'rgba(107,122,143,0.3)'",
        'border-red-600':     "'rgba(220,38,38,0.3)'",
        'border-primary-500/30': "'rgba(107,122,143,0.2)'",
        'border-primary-500/50': "'rgba(107,122,143,0.3)'",
    }
    hover_bg_map = {
        'hover:bg-dark-100': "'rgba(107,122,143,0.15)'",
        'hover:bg-dark-200': "'rgba(107,122,143,0.12)'",
        'hover:bg-red-600/20': "'rgba(220,38,38,0.08)'",
        'hover:bg-green-600/20': "'rgba(22,163,74,0.08)'",
    }
    hover_text_map = {
        'hover:text-primary-400': "'rgba(107,122,143,0.7)'",
        'hover:text-white':       "'rgba(196,212,228,1)'",
        'hover:text-red-400':    "'rgba(239,68,68,0.7)'",
    }
    hover_border_map = {
        'hover:border-primary-600': "'rgba(107,122,143,0.35)'",
        'hover:border-gray-600':   "'rgba(107,122,143,0.25)'",
    }

    classes = full_classes.strip().split()
    new_classes = []
    text_colors = []
    bg_colors = []
    border_colors = []
    hover_bg_colors = []
    hover_text_colors = []
    hover_border_colors = []

    for cls in classes:
        if cls in color_map:
            text_colors.append(color_map[cls])
        elif cls in bg_map:
            bg_colors.append(bg_map[cls])
        elif cls in border_map:
            border_colors.append(border_map[cls])
        elif cls in hover_bg_map:
            hover_bg_colors.append(hover_bg_map[cls])
        elif cls in hover_text_map:
            hover_text_colors.append(hover_text_map[cls])
        elif cls in hover_border_map:
            hover_border_colors.append(hover_border_map[cls])
        else:
            new_classes.append(cls)

    # Build style object
    style_parts = []
    if bg_colors:
        style_parts.append(f"background: {bg_colors[0]}")
    if text_colors:
        style_parts.append(f"color: {text_colors[0]}")
    if border_colors:
        style_parts.append(f"border: 1px solid {border_colors[0]}")

    # Build result
    new_class_attr = 'className="' + ' '.join(new_classes) + '"'
    if style_parts:
        style_str = '{' + '{' + ', '.join(style_parts) + '}' + '}'
        new_class_attr += f' style={{{", ".join(style_parts)}}}'

    # For hover, we need onMouseEnter/onMouseLeave
    hover_attrs = ''
    if hover_bg_colors:
        hover_attrs += f' onMouseEnter={{(e) => {{ (e.currentTarget as HTMLElement).style.background = {hover_bg_colors[0]} }}}}'
        hover_attrs += f' onMouseLeave={{(e) => {{ (e.currentTarget as HTMLElement).style.background = "" }}}}'
    if hover_text_colors:
        hover_attrs += f' onMouseEnter={{(e) => {{ (e.currentTarget as HTMLElement).style.color = {hover_text_colors[0]} }}}}'
        hover_attrs += f' onMouseLeave={{(e) => {{ (e.currentTarget as HTMLElement).style.color = "" }}}}'
    if hover_border_colors:
        hover_attrs += f' onMouseEnter={{(e) => {{ (e.currentTarget as HTMLElement).style.borderColor = {hover_border_colors[0]} }}}}'
        hover_attrs += f' onMouseLeave={{(e) => {{ (e.currentTarget as HTMLElement).style.borderColor = "" }}}}'

    return tag_start + new_class_attr + hover_attrs + tag_end

# Process className="..." patterns
content = re.sub(r'(<[a-zA-Z][^>]*?)(className="([^"]*)")([^\n]*?)(/?>)', process_classname, content)

with open('src/components/RulesModal.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Done")
