# Farm Valley Google Sheets Template

This document describes how to set up a Google Sheet to serve as the data source for Farm Valley.

## Setup

1. Create a new Google Sheet
2. Add the following sheets (tabs):
   - `Crops`
   - `Animals`
   - `Trees`
   - `Machines`
   - `Recipes`
   - `Products`
   - `Levels`
   - `Settings`
3. Make the sheet publicly readable (Share > Anyone with the link > Viewer)
4. Set environment variables:
   - `VITE_GOOGLE_SHEETS_API_KEY` - Your Google Sheets API key
   - `VITE_FARMINGSIM_SHEET_ID` - The spreadsheet ID (from the URL)

## Sheet Structures

### Crops Sheet

Columns (header row required):
| Column | Description | Example |
|--------|-------------|---------|
| id | Unique identifier | `wheat` |
| name | Display name | `Wheat` |
| emoji | Crop emoji | `🌾` |
| growthTime | Seconds to grow | `15` |
| yieldAmount | Items produced | `3` |
| seedCost | Cost to plant | `5` |
| baseValue | Sale value per item | `8` |
| xpReward | XP when harvested | `5` |
| unlockLevel | Level required | `1` |
| tier | Tier (1-3) | `1` |

### Animals Sheet

Columns (header row required):
| Column | Description | Example |
|--------|-------------|---------|
| id | Unique identifier | `chicken` |
| name | Display name | `Chicken` |
| emoji | Animal emoji | `🐔` |
| produces | Product ID it makes | `egg` |
| productionTime | Seconds per production | `20` |
| feedType | Feed item ID required | `chicken_feed` |
| feedAmount | Feed needed per cycle | `1` |
| purchaseCost | Cost to buy | `50` |
| baseValue | Product sale value | `15` |
| xpReward | XP when collecting | `8` |
| unlockLevel | Level required | `2` |
| tier | Tier (1-3) | `1` |

**Note:** Set `feedType` to `none` for animals that don't need feed (like bees).

### Trees Sheet

Columns (header row required):
| Column | Description | Example |
|--------|-------------|---------|
| id | Unique identifier | `apple_tree` |
| name | Display name | `Apple Tree` |
| emoji | Tree emoji | `🌳` |
| fruitEmoji | Fruit emoji | `🍎` |
| growthTime | Seconds to mature | `60` |
| harvestTime | Seconds between harvests | `30` |
| yieldAmount | Fruits per harvest | `3` |
| saplingCost | Cost to plant | `100` |
| baseValue | Fruit sale value | `15` |
| xpReward | XP when harvesting | `10` |
| unlockLevel | Level required | `3` |
| tier | Tier (1-3) | `1` |

### Machines Sheet

Columns (header row required):
| Column | Description | Example |
|--------|-------------|---------|
| id | Unique identifier | `mill` |
| name | Display name | `Flour Mill` |
| emoji | Machine emoji | `🏭` |
| description | Short description | `Grinds wheat into flour` |
| energyCost | Energy per use | `10` |
| purchaseCost | Cost to buy | `200` |
| unlockLevel | Level required | `2` |
| tier | Tier (1-3) | `1` |

### Recipes Sheet

Columns (header row required):
| Column | Description | Example |
|--------|-------------|---------|
| id | Unique recipe identifier | `flour` |
| machineId | Machine this recipe belongs to | `mill` |
| input1 | First input item ID | `wheat` |
| amount1 | Amount of first input | `3` |
| input2 | Second input item ID (optional) | |
| amount2 | Amount of second input | |
| input3 | Third input item ID (optional) | |
| amount3 | Amount of third input | |
| outputId | Output item ID | `flour` |
| outputAmount | Amount produced | `1` |
| processingTime | Seconds to process | `15` |
| xpReward | XP when completed | `8` |
| unlockLevel | Level required | `2` |

**Note:** Recipes are linked to machines via `machineId`.

### Products Sheet

Columns (header row required):
| Column | Description | Example |
|--------|-------------|---------|
| id | Unique identifier | `egg` |
| name | Display name | `Egg` |
| emoji | Product emoji | `🥚` |
| baseValue | Sale value | `15` |
| category | Type of product | `animal` |
| tier | Tier (1-3) | `1` |

**Categories:** `crop`, `animal`, `fruit`, `processed`, `feed`

### Levels Sheet

Columns (header row required):
| Column | Description | Example |
|--------|-------------|---------|
| level | Level number | `1` |
| xpRequired | Total XP needed | `0` |
| unlocksFields | Fields unlocked at this level | `2` |
| unlocksPens | Animal pens unlocked | |
| unlocksOrchards | Orchards unlocked | |
| unlocksMachineSlots | Machine slots unlocked | `1` |

**Note:** Leave unlock columns empty if nothing unlocks at that level.

### Settings Sheet

Simple key-value format (no header required):
| Key (Column A) | Value (Column B) | Description |
|----------------|------------------|-------------|
| startingMoney | `100` | Initial money |
| startingEnergy | `50` | Initial energy |
| maxEnergy | `100` | Maximum energy capacity |
| energyRegenRate | `0.5` | Energy regenerated per second |
| tickInterval | `100` | Game loop interval (ms) |
| maxFields | `6` | Maximum field slots |
| maxAnimalPens | `4` | Maximum animal pen slots |
| maxOrchards | `4` | Maximum orchard slots |
| maxMachineSlots | `4` | Maximum machine slots |
| maxOrders | `3` | Maximum simultaneous orders |
| orderRefreshInterval | `180` | Seconds between order refreshes |
| customerSpawnInterval | `60` | Seconds between customer spawns |
| customerDuration | `45` | Seconds customers wait |

## Default Values

If Google Sheets is not configured or fails to load, the game falls back to local data files:
- `src/games/farming-sim/data/crops.ts`
- `src/games/farming-sim/data/animals.ts`
- `src/games/farming-sim/data/trees.ts`
- `src/games/farming-sim/data/machines.ts`
- `src/games/farming-sim/data/products.ts`
- `src/games/farming-sim/data/settings.ts`

## Caching

Data is cached for 5 minutes to reduce API calls. Use the refresh button in the game to force a reload.

## Tips

- Use lowercase IDs without spaces (e.g., `wheat`, `apple_tree`, `chicken_feed`)
- Keep tier progression logical: Tier 1 (levels 1-3), Tier 2 (levels 4-7), Tier 3 (levels 8+)
- Balance production times with feed requirements
- Ensure all product IDs referenced in crops/animals/trees exist in the Products sheet
- Test recipe chains: raw materials -> processed goods
- Animals marked with `feedType: none` don't need feed (useful for bees, etc.)
