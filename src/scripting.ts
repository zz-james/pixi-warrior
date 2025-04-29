import { canPlayerFire, firePhasers } from "./warrior";
import { Coord } from "./utils/surface";

import {
  PLAYER_FORWARD_THRUST,
  PLAYER_REVERSE_THRUST,
  Player_t,
  WORLD_HEIGHT,
  WORLD_WIDTH,
} from "./globals";

// see page 264 in chapter 6

// we could easily add more states
export enum OpponentState {
  ATTACK,
  EVADE,
}

let opponent = {
  state: OpponentState.ATTACK,
};

let target: Coord = {
  x: 0,
  y: 0,
};

const fireWeapon = (opponent: Player_t) => {
  if (canPlayerFire(opponent)) {
    firePhasers(opponent);
  }
};

export const runGameScript = (player: Player_t, computer: Player_t) => {
  playComputer(player, computer);

  /* bit sloppy but we can do this because player and computer are objects that
  get passed by reference so we don't need to return anything from playComputer
  to access their values */

  if (computer.accel > PLAYER_FORWARD_THRUST)
    computer.accel = PLAYER_FORWARD_THRUST;
  if (computer.accel < PLAYER_REVERSE_THRUST)
    computer.accel = PLAYER_REVERSE_THRUST;

  while (computer.angle >= 360) {
    computer.angle -= 360;
  }

  while (computer.angle < 0) {
    computer.angle += 360;
  }
};

const playComputer = (player: Player_t, computer: Player_t) => {
  // uses pass by refrence so doesn't bother to return the player and computer objects

  if (opponent.state === OpponentState.ATTACK) {
    // in attack mode the player is the target
    target.x = player.worldX;
    target.y = player.worldY;

    // if we're too close to player switch to evade
    const distance = getDistanceToTarget(computer, target);
    if (distance < 25) {
      // console.log("going into evade mode");
      opponent.state = OpponentState.EVADE;
      target.x = -1;
      // setting invalid target triggers coming up with a new one
      return;
    }

    // if we're far away, speed up, if we're close lay off
    if (distance > 100) {
      computer.accel = PLAYER_FORWARD_THRUST;
    } else if (distance > 50) {
      computer.accel = PLAYER_FORWARD_THRUST / 3;
    } else {
      computer.accel = 0;
    }

    // if we're close enoug to fire, fire away
    if (distance < 200) {
      fireWeapon(computer);
    }
  } else {
    // evade state
    if (
      Math.abs(computer.worldX - target.x) < 100 &&
      Math.abs(computer.worldY - target.y) < 100
    ) {
      // console.log("going back into attack mode");
      opponent.state = OpponentState.ATTACK;
      return;
    }

    // did we need to find a new target?
    if (target.x < 0) {
      // select a random point in the world
      // as target
      target.x = Math.floor(Math.random() * WORLD_WIDTH);
      target.y = Math.floor(Math.random() * WORLD_HEIGHT);
      // console.log("selected new evade target");
    }

    computer.accel = PLAYER_FORWARD_THRUST;
  }

  // figure out the quickest way to aim at our destination
  let target_angle = getAngleToTarget(computer, target);
  let arc = target_angle - computer.angle;
  if (arc < 0) {
    arc += 360;
  }

  if (arc < 180) {
    computer.angle += 3;
  } else {
    computer.angle -= 3;
  }
};

const getDistanceToTarget = (computer: Player_t, target: Coord) => {
  let xdiff = Math.abs(computer.worldX - target.x);
  let ydiff = Math.abs(computer.worldX - target.y);

  return Math.sqrt((xdiff ^ 2) + (ydiff ^ 2));
};

const getAngleToTarget = (computer: Player_t, target: Coord) => {
  // global computer_x, computer_y, target_x, target_y;

  let x = target.x - computer.worldX;
  let y = target.y - computer.worldY;

  let theta = Math.atan2(-y, x);

  if (theta < 0) {
    theta = 2 * Math.PI + theta;
  }

  return (theta * 180) / Math.PI;
};
