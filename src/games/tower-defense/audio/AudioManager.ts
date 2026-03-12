// ============================================================
// Tower Defense – Audio Manager
// Placeholder system for SFX and music
// All audio hooks are wired but use no-op until real assets are added
// ============================================================

export type SfxId =
  | 'tower_place'
  | 'tower_sell'
  | 'tower_upgrade'
  | 'tower_shoot'
  | 'enemy_hit'
  | 'enemy_die'
  | 'enemy_boss_die'
  | 'enemy_reach_end'
  | 'wave_start'
  | 'wave_complete'
  | 'level_win'
  | 'level_lose'
  | 'button_click'
  | 'button_hover'
  | 'star_earn'
  | 'gold_earn'
  | 'gem_earn'
  | 'gem_spend'
  | 'reward_video_complete'
  | 'menu_open'
  | 'menu_close'
  | 'error';

export type MusicTrackId =
  | 'title_theme'
  | 'world_map'
  | 'battle_forest'
  | 'battle_desert'
  | 'battle_ice'
  | 'battle_volcano'
  | 'battle_shadow'
  | 'battle_crystal'
  | 'boss_battle'
  | 'victory_fanfare'
  | 'defeat_theme'
  | 'editor_theme'
  | 'shop_theme';

// Placeholder audio file manifest
// Replace paths with actual audio file URLs when assets are available
export const SFX_MANIFEST: Record<SfxId, { path: string; volume: number; poolSize: number }> = {
  tower_place:           { path: '/audio/sfx/tower_place.ogg',     volume: 0.7, poolSize: 3 },
  tower_sell:            { path: '/audio/sfx/tower_sell.ogg',      volume: 0.6, poolSize: 2 },
  tower_upgrade:         { path: '/audio/sfx/tower_upgrade.ogg',   volume: 0.7, poolSize: 2 },
  tower_shoot:           { path: '/audio/sfx/tower_shoot.ogg',     volume: 0.3, poolSize: 8 },
  enemy_hit:             { path: '/audio/sfx/enemy_hit.ogg',       volume: 0.3, poolSize: 8 },
  enemy_die:             { path: '/audio/sfx/enemy_die.ogg',       volume: 0.5, poolSize: 6 },
  enemy_boss_die:        { path: '/audio/sfx/enemy_boss_die.ogg',  volume: 0.8, poolSize: 2 },
  enemy_reach_end:       { path: '/audio/sfx/enemy_reach_end.ogg', volume: 0.6, poolSize: 4 },
  wave_start:            { path: '/audio/sfx/wave_start.ogg',      volume: 0.7, poolSize: 1 },
  wave_complete:         { path: '/audio/sfx/wave_complete.ogg',   volume: 0.7, poolSize: 1 },
  level_win:             { path: '/audio/sfx/level_win.ogg',       volume: 0.8, poolSize: 1 },
  level_lose:            { path: '/audio/sfx/level_lose.ogg',      volume: 0.8, poolSize: 1 },
  button_click:          { path: '/audio/sfx/button_click.ogg',    volume: 0.5, poolSize: 3 },
  button_hover:          { path: '/audio/sfx/button_hover.ogg',    volume: 0.2, poolSize: 3 },
  star_earn:             { path: '/audio/sfx/star_earn.ogg',       volume: 0.7, poolSize: 3 },
  gold_earn:             { path: '/audio/sfx/gold_earn.ogg',       volume: 0.3, poolSize: 6 },
  gem_earn:              { path: '/audio/sfx/gem_earn.ogg',        volume: 0.7, poolSize: 2 },
  gem_spend:             { path: '/audio/sfx/gem_spend.ogg',       volume: 0.6, poolSize: 2 },
  reward_video_complete: { path: '/audio/sfx/reward_complete.ogg', volume: 0.8, poolSize: 1 },
  menu_open:             { path: '/audio/sfx/menu_open.ogg',       volume: 0.4, poolSize: 2 },
  menu_close:            { path: '/audio/sfx/menu_close.ogg',      volume: 0.4, poolSize: 2 },
  error:                 { path: '/audio/sfx/error.ogg',           volume: 0.5, poolSize: 2 },
};

export const MUSIC_MANIFEST: Record<MusicTrackId, { path: string; volume: number; loop: boolean }> = {
  title_theme:    { path: '/audio/music/title_theme.ogg',    volume: 0.5, loop: true },
  world_map:      { path: '/audio/music/world_map.ogg',      volume: 0.4, loop: true },
  battle_forest:  { path: '/audio/music/battle_forest.ogg',  volume: 0.4, loop: true },
  battle_desert:  { path: '/audio/music/battle_desert.ogg',  volume: 0.4, loop: true },
  battle_ice:     { path: '/audio/music/battle_ice.ogg',     volume: 0.4, loop: true },
  battle_volcano: { path: '/audio/music/battle_volcano.ogg', volume: 0.4, loop: true },
  battle_shadow:  { path: '/audio/music/battle_shadow.ogg',  volume: 0.4, loop: true },
  battle_crystal: { path: '/audio/music/battle_crystal.ogg', volume: 0.4, loop: true },
  boss_battle:    { path: '/audio/music/boss_battle.ogg',    volume: 0.5, loop: true },
  victory_fanfare:{ path: '/audio/music/victory_fanfare.ogg',volume: 0.6, loop: false },
  defeat_theme:   { path: '/audio/music/defeat_theme.ogg',   volume: 0.5, loop: false },
  editor_theme:   { path: '/audio/music/editor_theme.ogg',   volume: 0.3, loop: true },
  shop_theme:     { path: '/audio/music/shop_theme.ogg',     volume: 0.4, loop: true },
};

// Map world theme to battle music
export const THEME_TO_MUSIC: Record<string, MusicTrackId> = {
  forest: 'battle_forest',
  desert: 'battle_desert',
  ice: 'battle_ice',
  volcano: 'battle_volcano',
  shadow: 'battle_shadow',
  crystal: 'battle_crystal',
};

class AudioManager {
  private sfxEnabled = true;
  private musicEnabled = true;
  private sfxVolume = 1.0;
  private musicVolume = 1.0;
  private currentMusic: MusicTrackId | null = null;
  private audioContext: AudioContext | null = null;
  private assetsLoaded = false;

  // Placeholder: In production, these would be actual AudioBuffer pools
  private sfxPools: Map<SfxId, HTMLAudioElement[]> = new Map();
  private musicElement: HTMLAudioElement | null = null;

  initialize() {
    // Create AudioContext on first user interaction
    if (!this.audioContext) {
      try {
        this.audioContext = new AudioContext();
      } catch {
        // AudioContext not supported
      }
    }
  }

  /**
   * Preload all audio assets. Call this on app start.
   * Currently a no-op since we're using placeholders.
   * When real assets are added, this will create audio buffers.
   */
  async preloadAll(): Promise<void> {
    // PLACEHOLDER: Preload SFX pools
    // for (const [id, manifest] of Object.entries(SFX_MANIFEST)) {
    //   const pool: HTMLAudioElement[] = [];
    //   for (let i = 0; i < manifest.poolSize; i++) {
    //     const audio = new Audio(manifest.path);
    //     audio.volume = manifest.volume * this.sfxVolume;
    //     audio.preload = 'auto';
    //     pool.push(audio);
    //   }
    //   this.sfxPools.set(id as SfxId, pool);
    // }
    this.assetsLoaded = true;
  }

  /**
   * Play a sound effect.
   * Returns immediately if SFX is disabled or assets not loaded.
   */
  playSfx(id: SfxId): void {
    if (!this.sfxEnabled || !this.assetsLoaded) return;

    const pool = this.sfxPools.get(id);
    if (!pool || pool.length === 0) {
      // PLACEHOLDER: Log for debugging during development
      // console.debug(`[AudioManager] SFX placeholder: ${id}`);
      return;
    }

    // Find an available audio element in the pool
    const audio = pool.find(a => a.paused || a.ended) || pool[0];
    if (audio) {
      const manifest = SFX_MANIFEST[id];
      audio.volume = manifest.volume * this.sfxVolume;
      audio.currentTime = 0;
      audio.play().catch(() => { /* ignore autoplay restrictions */ });
    }
  }

  /**
   * Play a music track. Crossfades from current track if one is playing.
   */
  playMusic(trackId: MusicTrackId): void {
    if (!this.musicEnabled) {
      this.currentMusic = trackId;
      return;
    }

    if (this.currentMusic === trackId && this.musicElement && !this.musicElement.paused) {
      return; // Already playing this track
    }

    this.stopMusic();
    this.currentMusic = trackId;

    // PLACEHOLDER: When real assets exist, create and play the audio element
    // const manifest = MUSIC_MANIFEST[trackId];
    // this.musicElement = new Audio(manifest.path);
    // this.musicElement.volume = manifest.volume * this.musicVolume;
    // this.musicElement.loop = manifest.loop;
    // this.musicElement.play().catch(() => { /* ignore autoplay restrictions */ });
  }

  /**
   * Stop the current music track.
   */
  stopMusic(): void {
    if (this.musicElement) {
      this.musicElement.pause();
      this.musicElement.currentTime = 0;
      this.musicElement = null;
    }
  }

  /**
   * Pause the current music track.
   */
  pauseMusic(): void {
    if (this.musicElement) {
      this.musicElement.pause();
    }
  }

  /**
   * Resume the current music track.
   */
  resumeMusic(): void {
    if (this.musicElement && this.musicEnabled) {
      this.musicElement.play().catch(() => { /* ignore */ });
    }
  }

  setSfxEnabled(enabled: boolean): void {
    this.sfxEnabled = enabled;
  }

  setMusicEnabled(enabled: boolean): void {
    this.musicEnabled = enabled;
    if (!enabled) {
      this.pauseMusic();
    } else if (this.currentMusic) {
      this.resumeMusic();
    }
  }

  setSfxVolume(volume: number): void {
    this.sfxVolume = Math.max(0, Math.min(1, volume));
  }

  setMusicVolume(volume: number): void {
    this.musicVolume = Math.max(0, Math.min(1, volume));
    if (this.musicElement) {
      const manifest = this.currentMusic ? MUSIC_MANIFEST[this.currentMusic] : null;
      this.musicElement.volume = (manifest?.volume ?? 0.5) * this.musicVolume;
    }
  }

  getSfxEnabled(): boolean { return this.sfxEnabled; }
  getMusicEnabled(): boolean { return this.musicEnabled; }
  getSfxVolume(): number { return this.sfxVolume; }
  getMusicVolume(): number { return this.musicVolume; }
  getCurrentMusic(): MusicTrackId | null { return this.currentMusic; }
}

// Singleton instance
export const audioManager = new AudioManager();
