# Alchemoji Base Data for Google Sheets

Copy each table below into the corresponding sheet tab. Select the table, copy (Ctrl+C), and paste into cell A1 of each sheet.

---

## Elements Sheet

| id | name | emoji | tier | description | baseValue | isBase |
|---|---|---|---|---|---|---|
| fire | Fire | 🔥 | 1 | The primordial flame | 5 | TRUE |
| water | Water | 💧 | 1 | Pure elemental water | 5 | TRUE |
| earth | Earth | 🪨 | 1 | Solid earth essence | 5 | TRUE |
| air | Air | 💨 | 1 | Breath of the wind | 5 | TRUE |
| energy | Energy | ✨ | 1 | Pure magical energy | 10 | TRUE |
| steam | Steam | ♨️ | 2 | Hot vapor rising | 15 | FALSE |
| mud | Mud | 🟤 | 2 | Wet earth mixture | 15 | FALSE |
| dust | Dust | 🌫️ | 2 | Particles in the wind | 15 | FALSE |
| lava | Lava | 🌋 | 2 | Molten rock flows | 20 | FALSE |
| smoke | Smoke | 💭 | 2 | Rising embers | 15 | FALSE |
| cloud | Cloud | ☁️ | 2 | Floating moisture | 15 | FALSE |
| stone | Stone | 🧱 | 3 | Hardened cooled lava | 35 | FALSE |
| rain | Rain | 🌧️ | 3 | Water from the sky | 30 | FALSE |
| plant | Plant | 🌱 | 3 | Life springs forth | 40 | FALSE |
| glass | Glass | 🪟 | 3 | Transparent solid | 45 | FALSE |
| metal | Metal | 🔩 | 3 | Refined ore | 50 | FALSE |
| ice | Ice | 🧊 | 3 | Frozen water | 35 | FALSE |
| lightning | Lightning | ⚡ | 3 | Electric discharge | 55 | FALSE |
| tree | Tree | 🌳 | 4 | Mighty growth | 80 | FALSE |
| flower | Flower | 🌸 | 4 | Beautiful bloom | 75 | FALSE |
| crystal | Crystal | 💎 | 4 | Precious formation | 120 | FALSE |
| sword | Sword | ⚔️ | 4 | Forged weapon | 100 | FALSE |
| potion | Potion | 🧪 | 4 | Magical brew | 90 | FALSE |
| storm | Storm | ⛈️ | 4 | Raging tempest | 85 | FALSE |
| snow | Snow | ❄️ | 4 | Frozen precipitation | 70 | FALSE |
| phoenix | Phoenix | 🦅 | 5 | Immortal fire bird | 250 | FALSE |
| dragon | Dragon | 🐉 | 5 | Ancient beast | 300 | FALSE |
| unicorn | Unicorn | 🦄 | 5 | Magical creature | 280 | FALSE |
| rainbow | Rainbow | 🌈 | 5 | Spectral beauty | 200 | FALSE |
| star | Star | ⭐ | 5 | Celestial light | 350 | FALSE |
| moon | Moon | 🌙 | 5 | Night illumination | 320 | FALSE |
| sun | Sun | ☀️ | 5 | Radiant power | 400 | FALSE |

---

## Recipes Sheet

| id | input1 | amount1 | input2 | amount2 | input3 | amount3 | outputId | outputAmount | energyCost |
|---|---|---|---|---|---|---|---|---|---|
| steam | fire | 1 | water | 1 |  |  | steam | 1 | 10 |
| mud | water | 1 | earth | 1 |  |  | mud | 1 | 10 |
| dust | earth | 1 | air | 1 |  |  | dust | 1 | 10 |
| lava | fire | 1 | earth | 1 |  |  | lava | 1 | 15 |
| smoke | fire | 1 | air | 1 |  |  | smoke | 1 | 10 |
| cloud | water | 1 | air | 1 |  |  | cloud | 1 | 10 |
| stone | lava | 1 | water | 1 |  |  | stone | 1 | 25 |
| rain | cloud | 1 | water | 1 |  |  | rain | 1 | 20 |
| plant | earth | 1 | rain | 1 |  |  | plant | 1 | 30 |
| glass | fire | 2 | dust | 1 |  |  | glass | 1 | 35 |
| metal | stone | 1 | fire | 2 |  |  | metal | 1 | 40 |
| ice | water | 2 | air | 2 |  |  | ice | 1 | 25 |
| lightning | storm | 1 | energy | 2 |  |  | lightning | 1 | 45 |
| lightning_alt | cloud | 2 | energy | 3 |  |  | lightning | 1 | 50 |
| tree | plant | 2 | earth | 2 |  |  | tree | 1 | 50 |
| flower | plant | 1 | rain | 1 |  |  | flower | 1 | 45 |
| crystal | stone | 2 | ice | 1 | energy | 2 | crystal | 1 | 80 |
| sword | metal | 2 | fire | 2 |  |  | sword | 1 | 70 |
| potion | water | 2 | plant | 1 | glass | 1 | potion | 1 | 60 |
| storm | cloud | 2 | air | 2 |  |  | storm | 1 | 55 |
| snow | ice | 1 | cloud | 1 |  |  | snow | 1 | 50 |
| phoenix | fire | 5 | energy | 5 |  |  | phoenix | 1 | 150 |
| dragon | fire | 3 | lava | 2 | air | 2 | dragon | 1 | 200 |
| unicorn | crystal | 1 | flower | 2 | energy | 3 | unicorn | 1 | 180 |
| rainbow | rain | 2 | sun | 1 |  |  | rainbow | 1 | 120 |
| rainbow_alt | water | 3 | fire | 2 | energy | 3 | rainbow | 1 | 130 |
| star | fire | 3 | energy | 5 | air | 2 | star | 1 | 250 |
| moon | stone | 2 | ice | 2 | energy | 4 | moon | 1 | 220 |
| sun | fire | 5 | energy | 5 | star | 1 | sun | 1 | 300 |

---

## Generators Sheet

| id | name | emoji | description | tier | produces | baseEnergyCost | baseCooldown | unlockCost | unlocked |
|---|---|---|---|---|---|---|---|---|---|
| flame-pit | Flame Pit | 🕯️ | A simple fire source that produces fire essence | 1 | fire:1 | 0 | 3 | 0 | TRUE |
| spring | Spring | ⛲ | A natural spring that produces water | 1 | water:1 | 0 | 3 | 0 | TRUE |
| quarry | Quarry | ⛏️ | Dig deep for earth essence | 1 | earth:1 | 0 | 3 | 50 | FALSE |
| windmill | Windmill | 🌬️ | Captures the essence of air | 1 | air:1 | 0 | 3 | 50 | FALSE |
| mana-well | Mana Well | 🔮 | Generates pure magical energy | 1 | energy:5 | 0 | 5 | 200 | FALSE |
| volcano | Mini Volcano | 🌋 | Produces fire and earth together | 2 | fire:2,earth:1 | 5 | 4 | 500 | FALSE |
| tornado | Tornado Chamber | 🌪️ | Harness the power of wind | 2 | air:3 | 5 | 4 | 500 | FALSE |
| crystal-cave | Crystal Cave | 💎 | Rare crystal formations grow here | 3 | stone:2,crystal:1 | 20 | 8 | 2000 | FALSE |
| storm-tower | Storm Tower | 🗼 | Attracts and harvests storms | 3 | lightning:1,rain:2 | 25 | 10 | 3000 | FALSE |
| enchanted-forest | Enchanted Forest | 🌲 | A magical grove of life | 4 | tree:1,flower:2,plant:3 | 40 | 12 | 8000 | FALSE |
| arcane-forge | Arcane Forge | ⚒️ | Mystical metalworking facility | 4 | metal:2,sword:1 | 50 | 15 | 10000 | FALSE |
| celestial-observatory | Celestial Observatory | 🔭 | Harness cosmic energy | 5 | star:1,moon:1,energy:20 | 100 | 30 | 50000 | FALSE |

---

## Settings Sheet

| key | value |
|---|---|
| startingMoney | 50 |
| startingEnergy | 100 |
| upgradeCostBase | 100 |
| upgradeCostMultiplier | 1.5 |
| maxGeneratorLevel | 20 |
| tickInterval | 100 |
| marketUpdateInterval | 30000 |
| autoSaveInterval | 10000 |

---

## Notes

- **Produces format**: `elementId:amount,elementId:amount` (comma-separated, no spaces)
- **isBase/unlocked**: Use `TRUE` or `FALSE` (case insensitive)
- **Tier**: 1-5 integer
- **Empty cells**: Leave blank for optional fields (input3, amount3)
- Generators that produce craftable elements should be reviewed for game balance
