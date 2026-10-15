#!/usr/bin/env python3
"""WCAG Contrast Checker for design tokens."""

import json
import sys
import colorsys

def hex_to_rgb(hex_color: str) -> tuple:
    """Convert hex color to RGB tuple (0-255)."""
    hex_color = hex_color.lstrip('#')
    if len(hex_color) == 3:
        hex_color = ''.join([c*2 for c in hex_color])
    return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))

def rgb_to_luminance(rgb: tuple) -> float:
    """Calculate relative luminance per WCAG."""
    def channel(c):
        c = c / 255.0
        return c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4
    r, g, b = rgb
    return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)

def contrast_ratio(fg: str, bg: str) -> float:
    """Calculate contrast ratio between two colors."""
    fg_lum = rgb_to_luminance(hex_to_rgb(fg))
    bg_lum = rgb_to_luminance(hex_to_rgb(bg))
    lighter = max(fg_lum, bg_lum)
    darker = min(fg_lum, bg_lum)
    return (lighter + 0.05) / (darker + 0.05)

def check_tokens(tokens_path: str) -> int:
    with open(tokens_path) as f:
        tokens = json.load(f)
    
    colors = tokens['color']['roles']
    pairs = tokens['color']['pairs']
    
    failures = 0
    results = []
    
    for fg_role, bg_role in pairs:
        fg_color = colors[fg_role]['value']
        bg_color = colors[bg_role]['value']
        
        ratio = contrast_ratio(fg_color, bg_color)
        
        # Determine required ratio
        # Large text: 18pt+ or 14pt+ bold — we'll check both
        # For UI components (borders, focus): 3:1
        is_large_text = fg_role in ['text', 'text-muted', 'accent-text', 'on-accent', 
                                     'danger-text', 'success-text', 'warning-text', 'info-text']
        required = 3.0 if not is_large_text else 4.5
        
        # Actually, body text needs 4.5:1, large text 3:1, UI 3:1
        # Let's be conservative: text roles need 4.5:1, others 3:1
        text_roles = ['text', 'text-muted', 'accent-text', 'on-accent', 
                      'danger-text', 'success-text', 'warning-text', 'info-text']
        required = 4.5 if fg_role in text_roles else 3.0
        
        passed = ratio >= required
        status = "✓ PASS" if passed else "✗ FAIL"
        
        if not passed:
            failures += 1
        
        results.append({
            'fg': fg_role,
            'bg': bg_role,
            'fg_color': fg_color,
            'bg_color': bg_color,
            'ratio': round(ratio, 2),
            'required': required,
            'status': status
        })
    
    # Print results
    print(f"{'FG Role':<20} {'BG Role':<20} {'FG Color':<10} {'BG Color':<10} {'Ratio':>6} {'Req':>5} {'Status'}")
    print("-" * 95)
    for r in results:
        print(f"{r['fg']:<20} {r['bg']:<20} {r['fg_color']:<10} {r['bg_color']:<10} {r['ratio']:>6.2f} {r['required']:>5.1f} {r['status']}")
    
    print(f"\nTotal pairs: {len(results)}")
    print(f"Passed: {len(results) - failures}")
    print(f"Failed: {failures}")
    
    return failures

if __name__ == '__main__':
    tokens_path = sys.argv[1] if len(sys.argv) > 1 else 'replica/design/tokens.json'
    failures = check_tokens(tokens_path)
    sys.exit(1 if failures > 0 else 0)