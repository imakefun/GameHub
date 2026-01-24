# Farm Valley Base Data for Google Sheets

Copy each table below into the corresponding sheet tab. Select the table, copy (Ctrl+C), and paste into cell A1 of each sheet.

---

## Crops Sheet

| id | name | emoji | growthTime | yieldAmount | seedCost | baseValue | xpReward | unlockLevel | tier |
|---|---|---|---|---|---|---|---|---|---|
| wheat | Wheat | 🌾 | 15 | 3 | 5 | 8 | 5 | 1 | 1 |
| carrot | Carrot | 🥕 | 20 | 4 | 8 | 10 | 6 | 1 | 1 |
| potato | Potato | 🥔 | 25 | 5 | 10 | 12 | 8 | 2 | 1 |
| corn | Corn | 🌽 | 35 | 4 | 20 | 18 | 12 | 4 | 2 |
| tomato | Tomato | 🍅 | 40 | 6 | 25 | 20 | 15 | 5 | 2 |
| pumpkin | Pumpkin | 🎃 | 50 | 2 | 30 | 35 | 18 | 6 | 2 |
| strawberry | Strawberry | 🍓 | 60 | 8 | 50 | 25 | 25 | 8 | 3 |
| eggplant | Eggplant | 🍆 | 70 | 4 | 60 | 40 | 30 | 10 | 3 |
| pepper | Hot Pepper | 🌶️ | 80 | 5 | 75 | 45 | 35 | 12 | 3 |

---

## Animals Sheet

| id | name | emoji | produces | productionTime | feedType | feedAmount | purchaseCost | baseValue | xpReward | unlockLevel | tier |
|---|---|---|---|---|---|---|---|---|---|---|---|
| chicken | Chicken | 🐔 | egg | 20 | chicken_feed | 1 | 50 | 15 | 8 | 2 | 1 |
| duck | Duck | 🦆 | duck_egg | 25 | chicken_feed | 1 | 75 | 20 | 10 | 3 | 1 |
| cow | Cow | 🐄 | milk | 40 | cattle_feed | 2 | 200 | 30 | 15 | 5 | 2 |
| goat | Goat | 🐐 | goat_milk | 35 | cattle_feed | 1 | 150 | 25 | 12 | 6 | 2 |
| sheep | Sheep | 🐑 | wool | 60 | cattle_feed | 2 | 180 | 40 | 18 | 7 | 2 |
| pig | Pig | 🐷 | truffle | 90 | premium_feed | 2 | 400 | 80 | 35 | 9 | 3 |
| bee | Bee Hive | 🐝 | honey | 50 | none | 0 | 300 | 50 | 25 | 11 | 3 |

---

## Trees Sheet

| id | name | emoji | fruitEmoji | growthTime | harvestTime | yieldAmount | saplingCost | baseValue | xpReward | unlockLevel | tier |
|---|---|---|---|---|---|---|---|---|---|---|---|
| apple_tree | Apple Tree | 🌳 | 🍎 | 60 | 30 | 3 | 100 | 15 | 10 | 3 | 1 |
| orange_tree | Orange Tree | 🌳 | 🍊 | 75 | 35 | 4 | 120 | 18 | 12 | 4 | 1 |
| lemon_tree | Lemon Tree | 🌳 | 🍋 | 90 | 40 | 4 | 180 | 22 | 15 | 6 | 2 |
| peach_tree | Peach Tree | 🌳 | 🍑 | 100 | 45 | 3 | 200 | 28 | 18 | 7 | 2 |
| cherry_tree | Cherry Tree | 🌸 | 🍒 | 110 | 50 | 5 | 250 | 25 | 20 | 8 | 2 |
| grape_vine | Grape Vine | 🍇 | 🍇 | 120 | 55 | 6 | 350 | 30 | 25 | 10 | 3 |
| mango_tree | Mango Tree | 🌳 | 🥭 | 140 | 60 | 3 | 450 | 50 | 30 | 11 | 3 |
| coconut_tree | Coconut Palm | 🌴 | 🥥 | 150 | 70 | 2 | 500 | 60 | 35 | 13 | 3 |

---

## Machines Sheet

| id | name | emoji | description | energyCost | purchaseCost | unlockLevel | tier |
|---|---|---|---|---|---|---|---|
| feed_mill | Feed Mill | 🌾 | Makes animal feed from crops | 5 | 100 | 1 | 1 |
| mill | Flour Mill | 🏭 | Grinds wheat into flour | 10 | 200 | 2 | 1 |
| juicer | Juicer | 🧃 | Makes fresh juice from fruits | 8 | 150 | 3 | 1 |
| oven | Bakery Oven | 🍞 | Bakes bread and pastries | 15 | 400 | 4 | 2 |
| cheese_press | Cheese Press | 🧀 | Makes cheese from milk | 12 | 350 | 5 | 2 |
| loom | Loom | 🧵 | Weaves wool into cloth | 10 | 300 | 7 | 2 |
| preserves_jar | Preserves Jar | 🫙 | Makes jams and preserves | 15 | 500 | 8 | 3 |
| oil_press | Oil Press | 🫒 | Extracts oils and essences | 20 | 600 | 6 | 3 |
| keg | Fermentation Keg | 🛢️ | Ferments beverages | 25 | 800 | 10 | 3 |

---

## Recipes Sheet

| id | machineId | input1 | amount1 | input2 | amount2 | input3 | amount3 | outputId | outputAmount | processingTime | xpReward | unlockLevel |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| chicken_feed | feed_mill | wheat | 2 |  |  |  |  | chicken_feed | 2 | 10 | 5 | 1 |
| cattle_feed | feed_mill | wheat | 2 | corn | 1 |  |  | cattle_feed | 2 | 15 | 8 | 4 |
| premium_feed | feed_mill | corn | 2 | potato | 2 | carrot | 2 | premium_feed | 2 | 20 | 15 | 9 |
| flour | mill | wheat | 3 |  |  |  |  | flour | 1 | 15 | 8 | 2 |
| apple_juice | juicer | apple | 3 |  |  |  |  | apple_juice | 1 | 10 | 10 | 3 |
| orange_juice | juicer | orange | 3 |  |  |  |  | orange_juice | 1 | 10 | 12 | 4 |
| grape_juice | juicer | grape | 4 |  |  |  |  | grape_juice | 1 | 12 | 20 | 10 |
| bread | oven | flour | 2 |  |  |  |  | bread | 1 | 20 | 15 | 4 |
| cake | oven | flour | 2 | egg | 2 |  |  | cake | 1 | 30 | 25 | 5 |
| strawberry_pie | oven | flour | 1 | strawberry | 3 |  |  | strawberry_pie | 1 | 25 | 35 | 8 |
| cheese | cheese_press | milk | 2 |  |  |  |  | cheese | 1 | 25 | 20 | 5 |
| goat_cheese | cheese_press | goat_milk | 2 |  |  |  |  | goat_cheese | 1 | 25 | 18 | 6 |
| cloth | loom | wool | 2 |  |  |  |  | cloth | 1 | 30 | 22 | 7 |
| strawberry_jam | preserves_jar | strawberry | 4 |  |  |  |  | strawberry_jam | 1 | 35 | 30 | 8 |
| peach_preserves | preserves_jar | peach | 4 |  |  |  |  | peach_preserves | 1 | 35 | 28 | 7 |
| cherry_jam | preserves_jar | cherry | 5 |  |  |  |  | cherry_jam | 1 | 35 | 32 | 8 |
| corn_oil | oil_press | corn | 5 |  |  |  |  | corn_oil | 1 | 40 | 25 | 6 |
| truffle_oil | oil_press | truffle | 1 |  |  |  |  | truffle_oil | 1 | 60 | 50 | 10 |
| wine | keg | grape_juice | 2 |  |  |  |  | wine | 1 | 90 | 60 | 12 |
| cider | keg | apple_juice | 2 |  |  |  |  | cider | 1 | 70 | 45 | 10 |
| mead | keg | honey | 1 | wheat | 2 |  |  | mead | 1 | 80 | 55 | 11 |

---

## Products Sheet

| id | name | emoji | baseValue | category | tier |
|---|---|---|---|---|---|
| wheat | Wheat | 🌾 | 8 | crop | 1 |
| carrot | Carrot | 🥕 | 10 | crop | 1 |
| potato | Potato | 🥔 | 12 | crop | 1 |
| corn | Corn | 🌽 | 18 | crop | 2 |
| tomato | Tomato | 🍅 | 20 | crop | 2 |
| pumpkin | Pumpkin | 🎃 | 35 | crop | 2 |
| strawberry | Strawberry | 🍓 | 25 | crop | 3 |
| eggplant | Eggplant | 🍆 | 40 | crop | 3 |
| pepper | Hot Pepper | 🌶️ | 45 | crop | 3 |
| egg | Egg | 🥚 | 15 | animal | 1 |
| duck_egg | Duck Egg | 🥚 | 20 | animal | 1 |
| milk | Milk | 🥛 | 30 | animal | 2 |
| goat_milk | Goat Milk | 🥛 | 25 | animal | 2 |
| wool | Wool | 🧶 | 40 | animal | 2 |
| truffle | Truffle | 🍄 | 80 | animal | 3 |
| honey | Honey | 🍯 | 50 | animal | 3 |
| apple | Apple | 🍎 | 15 | fruit | 1 |
| orange | Orange | 🍊 | 18 | fruit | 1 |
| lemon | Lemon | 🍋 | 22 | fruit | 2 |
| peach | Peach | 🍑 | 28 | fruit | 2 |
| cherry | Cherry | 🍒 | 25 | fruit | 2 |
| grape | Grape | 🍇 | 30 | fruit | 3 |
| coconut | Coconut | 🥥 | 60 | fruit | 3 |
| mango | Mango | 🥭 | 50 | fruit | 3 |
| chicken_feed | Chicken Feed | 🐔 | 10 | feed | 1 |
| cattle_feed | Cattle Feed | 🐄 | 25 | feed | 2 |
| premium_feed | Premium Feed | ⭐ | 50 | feed | 3 |
| flour | Flour | 🌾 | 30 | processed | 1 |
| apple_juice | Apple Juice | 🧃 | 50 | processed | 1 |
| orange_juice | Orange Juice | 🧃 | 55 | processed | 1 |
| grape_juice | Grape Juice | 🧃 | 65 | processed | 2 |
| bread | Bread | 🍞 | 70 | processed | 2 |
| cake | Cake | 🎂 | 120 | processed | 2 |
| strawberry_pie | Strawberry Pie | 🥧 | 140 | processed | 3 |
| cheese | Cheese | 🧀 | 80 | processed | 2 |
| goat_cheese | Goat Cheese | 🧀 | 75 | processed | 2 |
| cloth | Cloth | 🧵 | 100 | processed | 2 |
| strawberry_jam | Strawberry Jam | 🫙 | 130 | processed | 3 |
| peach_preserves | Peach Preserves | 🫙 | 140 | processed | 3 |
| cherry_jam | Cherry Jam | 🫙 | 145 | processed | 3 |
| corn_oil | Corn Oil | 🫒 | 110 | processed | 2 |
| truffle_oil | Truffle Oil | 🫒 | 250 | processed | 3 |
| wine | Wine | 🍷 | 200 | processed | 3 |
| cider | Cider | 🍺 | 150 | processed | 3 |
| mead | Mead | 🍺 | 180 | processed | 3 |

---

## Levels Sheet

| level | xpRequired | unlocksFields | unlocksPens | unlocksOrchards | unlocksMachineSlots |
|---|---|---|---|---|---|
| 1 | 0 | 2 |  |  | 3 |
| 2 | 100 | 3 | 1 |  |  |
| 3 | 250 |  |  | 1 |  |
| 4 | 450 | 4 |  |  | 4 |
| 5 | 700 |  | 2 |  |  |
| 6 | 1000 |  |  | 2 |  |
| 7 | 1350 | 5 | 3 |  |  |
| 8 | 1750 |  |  | 3 | 5 |
| 9 | 2200 |  | 4 |  |  |
| 10 | 2700 | 6 |  |  | 6 |
| 11 | 3250 |  |  | 4 |  |
| 12 | 3850 |  |  |  |  |
| 13 | 4500 |  |  |  |  |
| 14 | 5200 |  |  |  |  |
| 15 | 6000 |  |  |  |  |

---

## Settings Sheet

| key | value |
|---|---|
| startingMoney | 100 |
| startingEnergy | 50 |
| maxEnergy | 100 |
| energyRegenRate | 0.5 |
| tickInterval | 100 |
| maxFields | 6 |
| maxAnimalPens | 4 |
| maxOrchards | 4 |
| maxMachineSlots | 6 |
| maxOrders | 3 |
| orderRefreshInterval | 180 |
| customerSpawnInterval | 60 |
| customerDuration | 45 |

---

## Notes

- **feedType format**: Use product ID (e.g., `chicken_feed`) or `none` for animals that don't need feed
- **category values**: `crop`, `animal`, `fruit`, `processed`, `feed`
- **tier values**: 1, 2, or 3 (integer)
- **Empty cells**: Leave blank for optional fields (input2, input3, unlock columns)
- **Times are in seconds**: growthTime, harvestTime, processingTime, etc.
- **Costs are in currency units**: seedCost, purchaseCost, baseValue
- Recipe inputs must match existing product IDs in the Products sheet
- Machine recipes are linked via machineId column in Recipes sheet
