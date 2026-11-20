// Icons for the Minecraft advancements. Each advancement id maps to the item/block texture shown
// in the in-game advancement frame. Textures come from the PrismarineJS minecraft-assets mirror
// (GitHub + jsDelivr), several versions are tried in order, and the UI falls back to a "?" tile.
// Prefix a name with "b:" for a block texture; use "|" to list alternatives tried in order.

const ICONS: Record<string, string> = {
  // story
  'story/root': 'b:grass_block_side',
  'story/mine_stone': 'wooden_pickaxe',
  'story/upgrade_tools': 'stone_pickaxe',
  'story/smelt_iron': 'iron_ingot',
  'story/obtain_armor': 'iron_chestplate',
  'story/lava_bucket': 'lava_bucket',
  'story/iron_tools': 'iron_pickaxe',
  'story/deflect_arrow': 'arrow',
  'story/form_obsidian': 'b:obsidian',
  'story/mine_diamond': 'diamond',
  'story/enter_the_nether': 'flint_and_steel',
  'story/shiny_gear': 'diamond_chestplate',
  'story/enchant_item': 'enchanted_book',
  'story/cure_zombie_villager': 'golden_apple',
  'story/follow_ender_eye': 'ender_eye',
  'story/enter_the_end': 'b:end_portal_frame_top',
  // nether
  'nether/root': 'b:netherrack',
  'nether/return_to_sender': 'fire_charge',
  'nether/find_bastion': 'b:polished_blackstone_bricks',
  'nether/obtain_ancient_debris': 'b:ancient_debris_side',
  'nether/fast_travel': 'map',
  'nether/find_fortress': 'b:nether_bricks',
  'nether/obtain_crying_obsidian': 'b:crying_obsidian',
  'nether/distract_piglin': 'gold_ingot',
  'nether/ride_strider': 'warped_fungus_on_a_stick',
  'nether/uneasy_alliance': 'ghast_tear',
  'nether/loot_bastion': 'b:gilded_blackstone',
  'nether/netherite_armor': 'netherite_chestplate',
  'nether/get_wither_skull': 'bone',
  'nether/obtain_blaze_rod': 'blaze_rod',
  'nether/charge_respawn_anchor': 'b:glowstone',
  'nether/ride_strider_in_overworld_lava': 'b:magma',
  'nether/explore_nether': 'netherite_boots',
  'nether/summon_wither': 'nether_star',
  'nether/brew_potion': 'potion',
  'nether/create_beacon': 'b:beacon',
  'nether/all_potions': 'splash_potion',
  'nether/create_full_beacon': 'b:emerald_block',
  'nether/all_effects': 'enchanted_golden_apple|golden_apple',
  // end
  'end/root': 'b:end_stone',
  'end/kill_dragon': 'experience_bottle',
  'end/dragon_egg': 'b:dragon_egg',
  'end/enter_end_gateway': 'ender_pearl',
  'end/respawn_dragon': 'end_crystal',
  'end/dragon_breath': 'dragon_breath',
  'end/find_end_city': 'b:purpur_block',
  'end/elytra': 'elytra',
  'end/levitate': 'shulker_shell',
  // adventure
  'adventure/root': 'filled_map|map',
  'adventure/heart_transplanter': 'b:creaking_heart',
  'adventure/voluntary_exile': 'ominous_bottle',
  'adventure/use_lodestone': 'compass',
  'adventure/spyglass_at_parrot': 'spyglass',
  'adventure/kill_a_mob': 'iron_sword',
  'adventure/read_power_of_chiseled_bookshelf': 'comparator',
  'adventure/trade': 'emerald',
  'adventure/trim_with_any_armor_pattern': 'sentry_armor_trim_smithing_template',
  'adventure/honey_block_slide': 'b:honey_block_side',
  'adventure/ol_betsy': 'crossbow_standby',
  'adventure/lightning_rod_with_villager_no_fire': 'b:lightning_rod',
  'adventure/fall_from_world_height': 'feather',
  'adventure/salvage_sherd': 'brush',
  'adventure/avoid_vibration': 'b:sculk_sensor_top',
  'adventure/sleep_in_bed': 'red_bed',
  'adventure/hero_of_the_village': 'bell|emerald',
  'adventure/spyglass_at_ghast': 'spyglass',
  'adventure/throw_trident': 'trident',
  'adventure/kill_mob_near_sculk_catalyst': 'b:sculk_catalyst_top',
  'adventure/shoot_arrow': 'bow',
  'adventure/kill_all_mobs': 'diamond_sword',
  'adventure/totem_of_undying': 'totem_of_undying',
  'adventure/spear_many_mobs': 'iron_spear|trident',
  'adventure/summon_iron_golem': 'b:iron_block',
  'adventure/trade_at_world_height': 'b:emerald_ore',
  'adventure/trim_with_all_exclusive_armor_patterns': 'netherite_upgrade_smithing_template',
  'adventure/two_birds_one_arrow': 'phantom_membrane',
  'adventure/whos_the_pillager_now': 'crossbow_arrow|arrow',
  'adventure/arbalistic': 'firework_rocket',
  'adventure/craft_decorated_pot_using_only_sherds': 'angler_pottery_sherd',
  'adventure/adventuring_time': 'diamond_boots',
  'adventure/play_jukebox_in_meadows': 'music_disc_13',
  'adventure/walk_on_powder_snow_with_leather_boots': 'leather_boots',
  'adventure/spyglass_at_dragon': 'spyglass',
  'adventure/very_very_frightening': 'trident',
  'adventure/sniper_duel': 'bow',
  'adventure/bullseye': 'b:target_side',
  'adventure/brush_armadillo': 'armadillo_scute',
  'adventure/minecraft_trials_edition': 'trial_key',
  'adventure/crafters_crafting_crafters': 'b:crafter_north',
  'adventure/lighten_up': 'b:copper_bulb',
  'adventure/who_needs_rockets': 'wind_charge',
  'adventure/under_lock_and_key': 'trial_key',
  'adventure/revaulting': 'ominous_trial_key',
  'adventure/blowback': 'wind_charge',
  'adventure/overoverkill': 'mace',
  // husbandry
  'husbandry/root': 'wheat',
  'husbandry/place_dried_ghast_in_water': 'ghast_tear',
  'husbandry/safely_harvest_honey': 'honey_bottle',
  'husbandry/breed_an_animal': 'wheat',
  'husbandry/allay_deliver_item_to_player': 'amethyst_shard',
  'husbandry/ride_a_boat_with_a_goat': 'oak_boat',
  'husbandry/tame_an_animal': 'bone',
  'husbandry/make_a_sign_glow': 'glow_ink_sac',
  'husbandry/fishy_business': 'fishing_rod',
  'husbandry/silk_touch_nest': 'b:bee_nest_front',
  'husbandry/tadpole_in_a_bucket': 'tadpole_bucket',
  'husbandry/uh_oh': 'b:tnt_side',
  'husbandry/obtain_sniffer_egg': 'b:sniffer_egg_not_cracked_side',
  'husbandry/plant_seed': 'wheat_seeds',
  'husbandry/wax_on': 'honeycomb',
  'husbandry/bred_all_animals': 'egg',
  'husbandry/allay_deliver_cake_to_note_block': 'cake',
  'husbandry/complete_catalogue': 'cod',
  'husbandry/tactical_fishing': 'cod_bucket',
  'husbandry/leash_all_frog_variants': 'lead',
  'husbandry/feed_snifflet': 'torchflower_seeds',
  'husbandry/balanced_diet': 'apple',
  'husbandry/obtain_netherite_hoe': 'netherite_hoe',
  'husbandry/wax_off': 'iron_axe',
  'husbandry/axolotl_in_a_bucket': 'axolotl_bucket',
  'husbandry/froglights': 'b:verdant_froglight_side',
  'husbandry/plant_any_sniffer_seed': 'pitcher_pod',
  'husbandry/kill_axolotl_target': 'tropical_fish',
  'husbandry/repair_wolf_armor': 'wolf_armor',
  'husbandry/whole_pack': 'bone_meal',
  'husbandry/remove_wolf_armor': 'shears',
};

const REPOS = [
  'https://raw.githubusercontent.com/PrismarineJS/minecraft-assets/master/data',
  'https://cdn.jsdelivr.net/gh/PrismarineJS/minecraft-assets@master/data',
];
// 1.21.x folders are singular (item/ block/), older ones plural (items/ blocks/).
const VERSIONS: Array<[string, boolean]> = [
  ['1.21.4', false],
  ['1.21.1', true],
  ['1.20.2', true],
];

function urlsFor(name: string, preferBlock: boolean): string[] {
  const out: string[] = [];
  const kinds = preferBlock ? ['block', 'item'] : ['item', 'block'];
  for (const [version, plural] of VERSIONS) {
    for (const repo of REPOS) {
      for (const kind of kinds) {
        out.push(`${repo}/${version}/${kind}${plural ? 's' : ''}/${name}.png`);
      }
    }
  }
  return out;
}

/** Candidate image URLs for an advancement (tried in order by the <Art> component). */
export function minecraftIconSources(id: string): string[] {
  const spec = ICONS[id];
  if (!spec) return [];
  const out: string[] = [];
  for (const part of spec.split('|')) {
    const isBlock = part.startsWith('b:');
    out.push(...urlsFor(isBlock ? part.slice(2) : part, isBlock));
  }
  return [...new Set(out)];
}

// Advancement frame types as in the game: task = square, goal = rounded, challenge = purple spiked.
const CHALLENGES = new Set([
  'nether/return_to_sender', 'nether/uneasy_alliance', 'nether/fast_travel', 'nether/netherite_armor',
  'nether/explore_nether', 'nether/ride_strider_in_overworld_lava', 'nether/all_potions', 'nether/all_effects',
  'adventure/kill_all_mobs', 'adventure/adventuring_time', 'adventure/arbalistic', 'adventure/hero_of_the_village',
  'adventure/two_birds_one_arrow', 'adventure/sniper_duel', 'adventure/trim_with_all_exclusive_armor_patterns',
  'adventure/overoverkill', 'husbandry/bred_all_animals', 'husbandry/balanced_diet',
  'husbandry/obtain_netherite_hoe', 'husbandry/complete_catalogue', 'husbandry/froglights',
]);
const GOALS = new Set([
  'nether/create_full_beacon', 'end/dragon_egg', 'end/respawn_dragon', 'end/dragon_breath', 'end/elytra',
  'husbandry/leash_all_frog_variants', 'husbandry/whole_pack',
]);

export function minecraftFrame(id: string): 'task' | 'goal' | 'challenge' {
  return CHALLENGES.has(id) ? 'challenge' : GOALS.has(id) ? 'goal' : 'task';
}
