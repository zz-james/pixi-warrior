import * as KEY from "./pixelf/keys";
import {
  createParticleExplosion,
  updateParticles,
  drawParticles,
} from "./pixelf/particle";

import { shipStrip, loadGameData } from "./resources";
import { initBackground, drawBackground, drawParallax } from "./background";
import {
  setStatusMessage,
  initStatusDisplay,
  setPlayerStatusInfo,
  setOpponentStatusInfo,
  updateStatusDisplay,
} from "./status";
import { checkPhaserHit, drawPhaserBeam } from "./weapon";
import { initRadarDisplay, updateRadarDisplay } from "./radar";

import { runGameScript } from "./scripting";

import { app } from "./main";
import * as g from "./globals";
import {
  PlayerType,
  PlayerState,
  Player_t,
  PHASER_DAMAGE_DEVIL,
} from "./globals";

import {
  Particle,
  ParticleContainer,
  Rectangle,
  RenderTexture,
  Texture,
} from "pixi.js";

let player: Player_t = {
  type: PlayerType.WARRIOR,
  state: PlayerState.ATTACK,
  angle: 0,
  worldX: 0,
  worldY: 0,
  screenX: 0,
  screenY: 0,
  velocity: 0,
  accel: 0,
  shields: 0,
  firing: 0,
  charge: 100,
  score: 0,
  hit: 0,
}; // the player at the computer
let opponent: Player_t = {
  type: PlayerType.DEVIL,
  state: PlayerState.EVADE,
  angle: 0,
  worldX: 500,
  worldY: 500,
  screenX: 0,
  screenY: 0,
  velocity: 0,
  accel: 0,
  shields: 0,
  firing: 0,
  charge: 100,
  score: 0,
  hit: 0,
};

let cameraX: number; // position of the 640x480 viewport within the world
let cameraY: number;
const tempContainer = new ParticleContainer();
export let screen: RenderTexture; /* global for convenience */
let timeScale: number = 0;

/**
 * Drawing
 */
const drawPlayer = (p: Player_t) => {
  let angle: number;

  // calculate the player's new screen coordinates
  p.screenX = p.worldX - cameraX;
  p.screenY = p.worldY - cameraY;

  // if player is not on screen, don't draw anything
  if (
    p.screenX < -g.PLAYER_WIDTH / 2 ||
    p.screenX >= g.SCREEN_WIDTH + g.PLAYER_WIDTH / 2
  ) {
    return;
  }

  if (
    p.screenY < -g.PLAYER_HEIGHT / 2 ||
    p.screenY >= g.SCREEN_HEIGHT + g.PLAYER_HEIGHT / 2
  ) {
    return;
  }

  // calculate drawing coordinates
  angle = p.angle;
  if (angle < 0) angle += 360;

  const srcRect = new Rectangle(
    g.PLAYER_WIDTH * ((angle / 4) | 0), // lines up with px value in strip fighter.png
    0,
    g.PLAYER_WIDTH,
    g.PLAYER_HEIGHT
  );

  const ship = new Particle({
    texture: new Texture({
      source: shipStrip.source,
      frame: srcRect,
    }),
    x: p.screenX - g.PLAYER_WIDTH / 2,
    y: p.screenY - g.PLAYER_HEIGHT / 2,
  });
  tempContainer.addParticle(ship);

  // blit the temp container into the perminantly attached texture
  app.renderer.render({
    container: tempContainer,
    target: screen,
    clear: false,
  });

  tempContainer.removeParticle(ship);
};

/* initializes the given player */
const initPlayer = (p: Player_t, type: PlayerType): void => {
  p.state = PlayerState.EVADE;
  p.type = type;
  p.worldX = ((Math.random() * 1024) | 0) % g.WORLD_WIDTH;
  p.worldY = ((Math.random() * 1024) | 0) % g.WORLD_HEIGHT;
  p.accel = 0;
  p.velocity = 0;
  p.angle = 0;
  p.charge = 0;
  p.firing = 0;
  p.shields = 100;
  updatePlayer(p);
};

/* calculates the player's new world coordinates based on the camera
   and player's velocity. Adds acceleration to velocity. Uses simple
   trigonometry to update the world's coordinates */
const updatePlayer = (p: Player_t) => {
  const angle: number = p.angle;

  p.velocity += p.accel * timeScale;

  if (p.type === PlayerType.WARRIOR) {
    if (p.velocity > g.PLAYER_MAX_VELOCITY) p.velocity = g.PLAYER_MAX_VELOCITY;
    if (p.velocity < g.PLAYER_MIN_VELOCITY) p.velocity = g.PLAYER_MIN_VELOCITY;
  } else if (p.type === PlayerType.DEVIL) {
    if (p.velocity > g.DEVIL_MAX_VELOCITY) p.velocity = g.DEVIL_MAX_VELOCITY;
    if (p.velocity < g.DEVIL_MIN_VELOCITY) p.velocity = g.DEVIL_MIN_VELOCITY;
  }

  p.worldX += (p.velocity * Math.cos((angle * Math.PI) / 180) * timeScale) | 0;
  p.worldY += (p.velocity * -Math.sin((angle * Math.PI) / 180) * timeScale) | 0;

  /* make sure the player doesn't slide off the edge of the world */
  if (p.worldX < 40) p.worldX = 40;
  if (p.worldX >= g.SHIP_LIMIT_WIDTH) p.worldX = g.SHIP_LIMIT_WIDTH;
  if (p.worldY < 40) p.worldY = 40;
  if (p.worldY >= g.WORLD_HEIGHT) p.worldY = g.WORLD_HEIGHT - 1;
};

// ** phaser stuff ** //
export const canPlayerFire = (p: Player_t): boolean => {
  if (p.charge >= g.PHASER_CHARGE_FIRE && p.firing == 0) return true;
  return false;
};

/* Turns on a phaser beam. Test CanPlayerFire first. */
export const firePhasers = (p: Player_t): void => {
  p.charge -= g.PHASER_CHARGE_FIRE;
  if (p.charge < 0) p.charge = 0;

  p.firing = g.PHASER_FIRE_TIME;

  if (p === player) {
    // play player fire sound
  } else {
    // play opponent sound
  }
};

/* Charge phasers by one increment. */
const chargePhasers = (p: Player_t): void => {
  p.charge += (timeScale / 30) * g.PHASER_CHARGE_RATE;
  if (p.charge > g.PHASER_CHARGE_MAX) p.charge = g.PHASER_CHARGE_MAX;
};

/* Show a small explosion due to phaser damage. */
const showPhaserHit = (p: Player_t): void => {
  createParticleExplosion(p.worldX, p.worldY, 255, 255, 255, 10, 30);
  createParticleExplosion(p.worldX, p.worldY, 255, 0, 0, 5, 10);
  createParticleExplosion(p.worldX, p.worldY, 255, 255, 0, 2, 5);
};

/* Show a large ship explosion. */
const showShipExplosion = (p: Player_t): void => {
  createParticleExplosion(p.worldX, p.worldY, 255, 255, 255, 15, 300);
  createParticleExplosion(p.worldX, p.worldY, 255, 0, 0, 10, 100);
  createParticleExplosion(p.worldX, p.worldY, 255, 255, 0, 5, 50);
};

/* destroy the opponent */
const killOpponent = (): void => {
  player.score++;
  showShipExplosion(opponent);
  initPlayer(opponent, PlayerType.DEVIL);
};

/* destory the local player */
const killPlayer = (): void => {
  showShipExplosion(player);
  player.velocity = 0;
  player.accel = 0;
  player.state = PlayerState.DEAD;
  opponent.score++;
};

/* cause damage to the opponent */
const damageOpponent = (): void => {
  opponent.shields -= g.PHASER_DAMAGE;
  if (opponent.shields <= 0) {
    killOpponent();
  }
};

/**
 * !! main game loop !!
 */
const playGame = (): void => {
  let keystate: Record<string, boolean>;
  let quit: boolean = false;
  let turn: number;
  let prevTicks: number = 0;
  let curTicks: number = 0;
  let awaitingRespawn: boolean = false;

  /* framerate counter variables */
  let startTime: number;
  let endTime: number;
  let framesDrawn: number = 0;

  /* respawn times */
  let respawnTimer: number = -1;

  /* invincible timer */
  let invincibleTimer: number = -1;

  prevTicks = Date.now();
  startTime = Date.now();

  /* reset the score timers */
  player.score = 0;
  opponent.score = 0;

  /* start the game! */
  const whileLoop = () => {
    /* determine how many milliseconds have passed since 
       the last frame, and update our motion scaling */
    prevTicks = curTicks;
    curTicks = Date.now();

    timeScale = (curTicks - prevTicks) / 25;

    /* grab a snapshot of keyboard */
    keystate = KEY.getKeyState();

    /* Update phasers. */
    player.firing -= timeScale;
    if (player.firing < 0) player.firing = 0;

    opponent.firing -= timeScale;
    if (opponent.firing < 0) opponent.firing = 0;

    chargePhasers(player);

    /* If the player is destroyed, the respawn timer will
           start counting. During this time the controls are disabled
           and explosion sequence occurs. */
    if (respawnTimer >= 0) {
      respawnTimer++;

      if (respawnTimer >= g.RESPAWN_TIME / timeScale) {
        respawnTimer = -1;
        initPlayer(player, PlayerType.WARRIOR);
        setStatusMessage("GOOD LUCK, WARRIOR!!");

        /* Go to invincible state */
        player.state = PlayerState.INVINCIBLE;
        invincibleTimer++;
      }
    }

    /* Respond to input events, but not if we're in a respawn. */
    if (respawnTimer == -1) {
      /* Small period of time invincible */
      if (invincibleTimer >= 0) {
        invincibleTimer++;
        if (invincibleTimer >= g.INVINCIBLE_TIME / timeScale) {
          invincibleTimer = -1;
          /* Back to normal */
          player.state = PlayerState.EVADE;
        }
      }

      if (keystate["q"]) {
        quit = true;
      }

      turn = 0;

      if (turn == 0) {
        if (keystate["ArrowLeft"]) {
          turn += 10;
        }
        if (keystate["ArrowRight"]) {
          turn -= 10;
        }
      }

      // forward and back arrow keys activate thrusters */
      player.accel = 0;
      if (keystate["ArrowUp"]) {
        player.accel = g.PLAYER_FORWARD_THRUST;
      }
      if (keystate["ArrowDown"]) {
        player.accel = g.PLAYER_REVERSE_THRUST;
      }

      /* Spacebar fires phasers. */
      if (keystate[" "]) {
        if (canPlayerFire(player)) {
          firePhasers(player);

          /* If it's a hit, either notify the opponent or exact the damage. Create a satisfying particle burst. */
          if (!awaitingRespawn && checkPhaserHit(player, opponent)) {
            showPhaserHit(opponent);
            damageOpponent();
            /* if that killed the opponent, set the
                      "awaiting respawn" state to prevent
                      multiple kills */
            if (opponent.shields <= 0) {
              awaitingRespawn = true;
            }
          }
        }
      }

      /* Turn. */
      player.angle += (turn * timeScale) | 0;
      if (player.angle < 0) player.angle += 360;
      if (player.angle >= 360) player.angle -= 360;

      /* If this is a network game, the remote player will
               tell us if we've died. Otherwise we have to check
               for failed shields. */
      if (player.shields <= 0) {
        console.log("Local player has been destroyed.\n");
        // localPlayerDead = 0;

        /* Kaboom! */
        killPlayer();

        /* Respawn. */
        respawnTimer = 0;
      }
    }

    runGameScript(player, opponent);

    /* Check for phaser hits against the player. */
    if (opponent.firing) {
      if (checkPhaserHit(opponent, player)) {
        if (player.state !== PlayerState.INVINCIBLE) {
          showPhaserHit(player);
          player.shields -= PHASER_DAMAGE_DEVIL;

          /* Did that destroy the player? */
          if (respawnTimer < 0 && player.shields <= 0) {
            console.log("kill player");
            killPlayer();
            respawnTimer = 0;
          }
        }
      }
    }

    chargePhasers(opponent);
    updatePlayer(opponent);

    /* Update the player's position. */
    updatePlayer(player);

    setPlayerStatusInfo(player.score, player.shields, player.charge);
    setOpponentStatusInfo(opponent.score, opponent.shields);

    /* make the camera follow the player (but impose limits) */
    cameraX = (player.worldX - g.SCREEN_WIDTH / 2) | 0;
    cameraY = (player.worldY - g.SCREEN_HEIGHT / 2) | 0;

    if (cameraX < 0) cameraX = 0;
    if (cameraX >= g.WORLD_WIDTH - g.SCREEN_WIDTH)
      cameraX = g.WORLD_WIDTH - g.SCREEN_WIDTH - 1;
    if (cameraY < 0) cameraY = 0;
    if (cameraY >= g.WORLD_HEIGHT - g.SCREEN_HEIGHT)
      cameraY = g.WORLD_HEIGHT - g.SCREEN_HEIGHT - 1;

    updateParticles();

    // redraw everything
    drawBackground(screen, cameraX, cameraY);
    drawParallax(screen, cameraX, cameraY);
    drawParticles(screen, cameraX, cameraY);

    if (opponent.firing) {
      drawPhaserBeam(opponent, screen, cameraX, cameraY);
    }
    if (player.firing) {
      drawPhaserBeam(player, screen, cameraX, cameraY);
    }

    if (respawnTimer < 0) {
      drawPlayer(player);
    }

    if (!awaitingRespawn) {
      drawPlayer(opponent);
    }

    updateStatusDisplay(screen);

    updateRadarDisplay(
      screen,
      player.worldX,
      player.worldY,
      opponent.worldX,
      opponent.worldY
    );

    if (quit) {
      app.ticker.remove(whileLoop);
      endTime = new Date().getTime();

      if (startTime == endTime) endTime++;

      console.log(
        `Drew ${framesDrawn} frames in ${
          endTime - startTime
        } seconds, for a framerate of ${
          framesDrawn / (endTime - startTime)
        } fps`
      );
    }

    framesDrawn++;
  };

  app.ticker.add(whileLoop);
};

export const main = async (scrn: RenderTexture) => {
  /* Save the screen pointer for later use. */
  screen = scrn;

  await initStatusDisplay();

  await initRadarDisplay();

  // initAudio();

  // initMusic();

  // loadMusic(); // files and shit

  await loadGameData();

  initBackground();

  initPlayer(player, PlayerType.WARRIOR);

  playGame();

  // cleanupStatusDisplay();

  // cleanupRadarDisplay()

  // unloadGameData();

  // cleanupScripting();

  // cleanupMusic();

  // cleanupAudio()
};
