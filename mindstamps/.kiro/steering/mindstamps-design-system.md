---
inclusion: always
---

# Mindstamps Design System Guidelines

## Color Palette

Always use the defined CSS custom properties for consistent theming:

- `--warm-cream: #faf7f2` - Primary background gradient start
- `--soft-beige: #f5f1ea` - Primary background gradient end  
- `--warm-brown: #8b7355` - Secondary text and borders
- `--deep-brown: #5d4e37` - Primary text and headings
- `--sage-green: #9caf88` - Success states and accent buttons
- `--dusty-rose: #d4a574` - Primary buttons and highlights
- `--paper-white: #fefcf8` - Card backgrounds and input fields
- `--ink-black: #2c2416` - Body text and content
- `--shadow-warm: rgba(139, 115, 85, 0.15)` - Consistent shadow color

## Typography

### Font Families
- **Journal Font**: Use `font-journal` class for headings and decorative text (Crimson Text serif)
- **Body Font**: Use default Inter sans-serif for readable content
- **Consistent Sizing**: Use Tailwind's text sizing classes (text-sm, text-lg, etc.)

### Typography Hierarchy
- Page titles: `text-2xl font-journal font-semibold` with `--deep-brown` color
- Section headings: `text-xl font-journal font-semibold` with `--deep-brown` color
- Body text: `text-sm` or `text-base` with `--ink-black` color
- Secondary text: `text-xs` or `text-sm` with `--warm-brown` color

## Component Styling

### Buttons
- **Primary buttons**: Use `btn-warm` class for main actions
- **Secondary buttons**: Use `btn-sage` class for alternative actions
- **Button sizing**: Use `py-3` or `py-4` with `px-6` or `px-8` for proper touch targets
- **Button shape**: Always use `rounded-full` for the cozy aesthetic

### Containers
- **Main containers**: Use `paper-texture` class for card-like elements
- **Shadows**: Use `cozy-shadow` class for elevated elements
- **Borders**: Use `border-opacity-20` with `--warm-brown` color for subtle divisions

### Inputs
- **Form inputs**: Use `vintage-input` class for consistent styling
- **Focus states**: Automatically handled by vintage-input class
- **Validation**: Use warm color palette for error states

## Layout Principles

### Screen Utilization
- **No scrolling**: All content must fit within viewport height
- **Side-by-side layouts**: Use `side-by-side` class for 50/50 splits
- **Cozy container**: Use `cozy-container` class for full-screen layouts
- **Content width**: Use 80% width (`w-4/5`) for optimal readability in panels

### Spacing
- **Consistent padding**: Use `p-4`, `p-6`, or `p-8` for container padding
- **Element spacing**: Use `space-y-3` or `space-y-4` for vertical rhythm
- **Margins**: Use `mb-4`, `mb-6` for consistent bottom margins

## Interactive Elements

### Hover States
- **Buttons**: Include `hover:shadow-lg` and `hover:transform` effects
- **Cards**: Use `hover:shadow-xl` for subtle elevation changes
- **Links**: Use warm color transitions for hover states

### Loading States
- **Spinners**: Use warm color palette (`--dusty-rose`) for loading indicators
- **Messages**: Include friendly, journal-style language
- **Animations**: Keep subtle and cozy, avoid jarring transitions

## Responsive Design

### Breakpoints
- **Desktop**: Side-by-side layouts with full feature set
- **Mobile**: Stack layouts vertically while maintaining usability
- **Tablet**: Adapt layouts to available space efficiently

### Container Behavior
- **Fixed heights**: Use specific pixel values (like 400px) for critical elements like maps
- **Flexible content**: Allow text content to scroll within containers when needed
- **Overflow handling**: Always use `overflow-hidden` to prevent layout breaks

## Accessibility

### Color Contrast
- Ensure sufficient contrast between text and background colors
- Use the defined color palette which has been tested for accessibility

### Interactive Elements
- Maintain minimum 44px touch targets for buttons
- Provide clear focus indicators for keyboard navigation
- Use semantic HTML elements where possible

## Implementation Notes

### CSS Custom Properties
Always reference colors using `style={{ color: 'var(--deep-brown)' }}` syntax rather than hardcoded hex values.

### Class Combinations
Combine utility classes thoughtfully:
```jsx
className="paper-texture cozy-shadow rounded-2xl p-6 mb-4"
```

### Consistent Patterns
- Cards: `paper-texture cozy-shadow rounded-lg p-4`
- Buttons: `btn-warm px-6 py-3 rounded-full font-medium`
- Headers: `text-xl font-journal font-semibold` with appropriate color
- Containers: `cozy-container` for full-screen, `side-by-side` for splits