export const SCREEN_WIDTH = 640;
export const SCREEN_HEIGHT = 480;

/* Dimensions of the player's ship. The graphics data must correspond to this. */
export const PLAYER_WIDTH = 96;
export const PLAYER_HEIGHT = 96;

/* Limits on the player. */
export const PLAYER_MAX_VELOCITY = 15.0;
export const PLAYER_MIN_VELOCITY = -10.0;

/* Limits on the devil. */
export const DEVIL_MAX_VELOCITY = 13.0;
export const DEVIL_MIN_VELOCITY = -10.0;

/* Charge level required to fire. */
export const PHASER_CHARGE_FIRE = 10;

/* Maximum charge the phasers can hold. */
export const PHASER_CHARGE_MAX = 30;

/* Roughly the number of charge units per second. */
export const PHASER_CHARGE_RATE = 30;

/* Duration of each phaser shot, in ticks. (30 ticks/second) */
export const PHASER_FIRE_TIME = 5;

/* Amount of damage a single shot does.  warrior*/
export const PHASER_DAMAGE = 16;

/* Amount of damage a single shot does. devil*/
export const PHASER_DAMAGE_DEVIL = 1;

/* Total size (in pixels) of the complete playing field */
export const WORLD_WIDTH = 2000;
export const WORLD_HEIGHT = 2000;

export const SHIP_LIMIT_WIDTH = WORLD_WIDTH - 40;

/* Number of particles allowed in the particle system. */
export const MAX_PARTICLES = 30000;

/* Time to delay before respawning, in ticks. */
export const RESPAWN_TIME = 60;

export const INVINCIBLE_TIME = 300;

export const PLAYER_FORWARD_THRUST = 3;
export const PLAYER_REVERSE_THRUST = -1;

export const PHASER_RANGE = WORLD_WIDTH / 10;

export enum PlayerType {
  WARRIOR,
  DEVIL,
}

export enum PlayerState {
  EVADE,
  ATTACK,
  UNDER_ATTACK,
  INVINCIBLE,
  DEAD,
  DEADING,
}

export type Player_t = {
  type: PlayerType;
  state: PlayerState;
  angle: number;
  worldX: number;
  worldY: number;
  screenX: number;
  screenY: number;
  velocity: number;
  accel: number;
  shields: number;
  firing: number;
  charge: number;
  score: number;
  hit: number;
};
