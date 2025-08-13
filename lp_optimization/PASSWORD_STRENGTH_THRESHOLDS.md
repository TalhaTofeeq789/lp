# Password Strength Thresholds

This document outlines the password strength calculation and thresholds used in the Change Password dialog.

## Scoring System

The password strength is calculated based on the following criteria:

### Length Points
- **6+ characters**: +25 points
- **8+ characters**: +15 additional points (40 total for length)

### Character Variety Points
- **Lowercase letters** (a-z): +20 points
- **Uppercase letters** (A-Z): +20 points  
- **Numbers** (0-9): +20 points

### Maximum Possible Score
- **100 points** (40 for length + 60 for character variety)

## Strength Categories

The password strength is categorized into three levels:

| Category | Score Range | Color | Description |
|----------|-------------|-------|-------------|
| **Weak** | 0-39 | 🔴 Red | Basic passwords that need improvement |
| **Fair** | 40-69 | 🟡 Yellow | Decent passwords that could be stronger |
| **Strong** | 70-100 | 🟢 Green | Good, secure passwords |

## Examples

### Weak Passwords (Red)
- `password` (8 points - only lowercase)
- `12345678` (25 points - only numbers with length)
- `Pass` (45 points but short)

### Fair Passwords (Yellow) 
- `Password` (65 points - 8+ chars, upper + lower)
- `mypass123` (60 points - 8+ chars, lower + numbers)

### Strong Passwords (Green)
- `MyPass123` (80 points - 8+ chars, upper + lower + numbers)
- `SecurePassword1` (80 points - 8+ chars, all varieties)

## Implementation Notes

- The progress bar smoothly transitions between colors as the user types
- Helpful suggestions are provided at each strength level
- No special characters are required to reach "Strong" status
- Thresholds are designed to be user-friendly while encouraging good practices
