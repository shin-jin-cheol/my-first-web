/**
 * Generate a consistent color for an avatar based on the name
 * Returns CSS color variable name
 */
export function getAvatarColorClass(name: string): string {
  const colors = [
    "var(--accent-primary)",
    "var(--accent-light)",
    "#ff6b6b",
    "#4ecdc4",
    "#45b7d1",
    "#f7b731",
    "#5f27cd",
    "#00d2d3",
  ];

  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    const char = name.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }

  const index = Math.abs(hash) % colors.length;
  return colors[index];
}

/**
 * Get first character of name for avatar text
 */
export function getAvatarText(name: string): string {
  return name.charAt(0).toUpperCase() || "U";
}
