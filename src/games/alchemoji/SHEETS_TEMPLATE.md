# Alchemoji Google Sheets Template

This document describes how to set up a Google Sheet to serve as the data source for Alchemoji.

## Setup

1. Create a new Google Sheet
2. Add the following sheets (tabs):
   - `Elements`
   - `Recipes`
   - `Generators`
   - `Settings`
3. Make the sheet publicly readable (Share > Anyone with the link > Viewer)
4. Set environment variables:
   - `VITE_GOOGLE_SHEETS_API_KEY` - Your Google Sheets API key
   - `VITE_ALCHEMOJI_SHEET_ID` - The spreadsheet ID (from the URL)

## Sheet Structures

### Elements Sheet

Columns (header row required):
| Column | Description | Example |
|--------|-------------|---------|
| id | Unique identifier | `fire` |
| name | Display name | `Fire` |
| emoji | Element emoji | `🔥` |
| tier | Tier level (1-5) | `1` |
| description | Short description | `A basic flame element` |
| baseValue | Base market price | `5` |
| isBase | Is this a base element? | `TRUE` or `FALSE` |

### Recipes Sheet

Columns (header row required):
| Column | Description | Example |
|--------|-------------|---------|
| id | Unique recipe identifier | `recipe_steam` |
| input1 | First input element ID | `fire` |
| amount1 | Amount of first input | `1` |
| input2 | Second input element ID | `water` |
| amount2 | Amount of second input | `1` |
| input3 | Third input element ID (optional) | |
| amount3 | Amount of third input (optional) | |
| outputId | Output element ID | `steam` |
| outputAmount | Amount produced | `1` |
| energyCost | Energy required to craft | `10` |

### Generators Sheet

Columns (header row required):
| Column | Description | Example |
|--------|-------------|---------|
| id | Unique generator identifier | `gen_campfire` |
| name | Display name | `Campfire` |
| emoji | Generator emoji | `🏕️` |
| description | Short description | `A cozy campfire` |
| tier | Tier level (1-5) | `1` |
| produces | Comma-separated production | `fire:1,ash:1` |
| baseEnergyCost | Energy cost per production | `0` |
| baseCooldown | Cooldown in seconds | `3` |
| unlockCost | Cost to unlock | `0` |
| unlocked | Is unlocked by default? | `TRUE` or `FALSE` |

**Produces format:** `elementId:amount,elementId:amount`
- Example: `fire:2,smoke:1` means produces 2 fire and 1 smoke

### Settings Sheet

Simple key-value format (no header required):
| Key (Column A) | Value (Column B) | Description |
|----------------|------------------|-------------|
| startingMoney | `50` | Initial money |
| startingEnergy | `100` | Initial energy |
| upgradeCostBase | `100` | Base cost for upgrades |
| upgradeCostMultiplier | `1.5` | Cost multiplier per level |
| maxGeneratorLevel | `20` | Maximum generator level |
| tickInterval | `100` | Game loop interval (ms) |
| marketUpdateInterval | `30000` | Market price update (ms) |
| autoSaveInterval | `10000` | Auto-save interval (ms) |

## Default Values

If Google Sheets is not configured or fails to load, the game falls back to local data files:
- `src/games/alchemoji/data/elements.ts`
- `src/games/alchemoji/data/recipes.ts`
- `src/games/alchemoji/data/generators.ts`

## Caching

Data is cached for 5 minutes to reduce API calls. Use the refresh button in the game settings to force a reload.

## Tips

- Use lowercase IDs without spaces (e.g., `fire`, `water`, `steam`)
- Tier 1 elements should be marked as `isBase: TRUE`
- Start with a few generators unlocked (`unlocked: TRUE`)
- Balance energy costs with production rates
- Test recipe combinations in the crafting UI
