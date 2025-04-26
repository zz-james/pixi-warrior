import { backStarTiles, frontStarTiles } from "./resources";
import { createMultiArray } from "./utils/multiArray";
import * as g from "./globals";
import { app } from "./main";
import {
  Particle,
  ParticleContainer,
  Rectangle,
  RenderTexture,
  Texture,
} from "pixi.js";

/* we can render a container to the stage so lets begin by creating a single particle container which we reuse. */
/* then we can create a renderTexture from a spritesheet or atlas or whatever */
/* I think we can then create a particleSprite which we can set the width/height/x/y of and set the texture */
/* add that to the container */
/* then blit it to the stage at the end */

const numStarTiles = 4;
/* These define the sizes of the backgrond tile grids. We don't really need a one to one
   mapping between the size of the playing field and the size of the tile grids;
   we can wrap around at some point, and nobody will notice a difference. */
const PARALLAX_GRID_WIDTH = 100;
const PARALLAX_GRID_HEIGHT = 100;

/* These define the scrolling speeds of the front and back background
   layers, relative to the movement of the camera. */
const PARALLAX_BACK_FACTOR = 4;
const PARALLAX_FRONT_FACTOR = 2;

/* Dimensions of the map tiles. */
const TILE_WIDTH = 64;
const TILE_HEIGHT = 64;

const frontTiles: any[] = createMultiArray(
  PARALLAX_GRID_WIDTH,
  PARALLAX_GRID_WIDTH
);
const backTiles: number[][] = createMultiArray(
  PARALLAX_GRID_WIDTH,
  PARALLAX_GRID_HEIGHT
);

/* sets up the starry background by assigning random tiles 
  this should be called after loadGameData() */
export const initBackground = (): void => {
  let x: number;
  let y: number;

  for (x = 0; x < PARALLAX_GRID_WIDTH; x++) {
    for (y = 0; y < PARALLAX_GRID_WIDTH; y++) {
      frontTiles[x][y] = ((Math.random() * 1028) | 0) % numStarTiles; // an array of random numbers from 0 to 3 that gets created i.e random but stable
      backTiles[x][y] = ((Math.random() * 1028) | 0) % numStarTiles;
    }
  }
};

/* draws the background on the screen, with respect to the global 'camera' position
  the camera marks the 640x480 section of the world that we can see at any given time
  this is usually in the vicinity of the players ship */
export const drawBackground = (
  dest: RenderTexture,
  cameraX: number,
  cameraY: number
) => {
  let drawX: number, drawY: number; /* drawing position on screen */
  let startDrawX: number, startDrawY: number;
  let tileX: number, tileY: number; /* indices in the backTiles array */
  let startTileX: number, startTileY: number;

  const tempContainer = new ParticleContainer();

  /* map the camera position into the tile indices */
  startTileX =
    (cameraX / PARALLAX_BACK_FACTOR / TILE_WIDTH) % PARALLAX_GRID_WIDTH | 0; // how many tile spaces X is camera (in 4px steps)
  startTileY =
    (cameraY / PARALLAX_BACK_FACTOR / TILE_HEIGHT) % PARALLAX_GRID_HEIGHT | 0; // how many tiles space Y is camera (in 4 px steps)

  startDrawX = -((cameraX / PARALLAX_BACK_FACTOR) % TILE_WIDTH) | 0; // a number between 0 and 63 that is driven by cameraX in 4px steps.
  startDrawY = -((cameraY / PARALLAX_BACK_FACTOR) % TILE_HEIGHT) | 0;

  tileY = startTileY;
  drawY = startDrawY;

  while (drawY < g.SCREEN_HEIGHT) {
    tileX = startTileX;
    drawX = startDrawX;
    while (drawX < g.SCREEN_WIDTH) {
      const srcRect: Rectangle = new Rectangle(
        TILE_WIDTH * backTiles[tileX][tileY], // choose a slice of the backstars texture
        0,
        TILE_WIDTH,
        TILE_HEIGHT
      );
      const part = new Particle({
        texture: new Texture({
          source: backStarTiles.source,
          frame: srcRect,
        }),
        x: drawX,
        y: drawY,
      });
      tempContainer.addParticle(part);
      tileX++;
      tileX %= PARALLAX_GRID_WIDTH;
      drawX += TILE_WIDTH;
    }
    tileY++;
    tileY %= PARALLAX_GRID_HEIGHT;
    drawY += TILE_HEIGHT;
  }

  // blit the temp container into the perminantly attached texture
  app.renderer.render({
    container: tempContainer,
    target: dest,
    clear: false,
  });
};

export const drawParallax = (
  dest: RenderTexture,
  cameraX: number,
  cameraY: number
): void => {
  let drawX: number, drawY: number; /* drawing position on screen */
  let startDrawX: number, startDrawY: number;
  let tileX: number, tileY: number; /* indices in the backTiles array */
  let startTileX: number, startTileY: number;

  const tempContainer = new ParticleContainer();

  /* map the camera position into the tile indices */
  startTileX =
    (cameraX / PARALLAX_FRONT_FACTOR / TILE_WIDTH) % PARALLAX_GRID_WIDTH | 0;
  startTileY =
    (cameraY / PARALLAX_FRONT_FACTOR / TILE_HEIGHT) % PARALLAX_GRID_HEIGHT | 0;

  startDrawX = -((cameraX / PARALLAX_FRONT_FACTOR) % TILE_WIDTH) | 0;
  startDrawY = -((cameraY / PARALLAX_FRONT_FACTOR) % TILE_HEIGHT) | 0;

  tileY = startTileY;
  drawY = startDrawY;

  while (drawY < g.SCREEN_HEIGHT) {
    tileX = startTileX;
    drawX = startDrawX;
    while (drawX < g.SCREEN_WIDTH) {
      const srcRect = new Rectangle(
        TILE_WIDTH * frontTiles[tileX][tileY],
        0,
        TILE_WIDTH,
        TILE_HEIGHT
      );

      const part = new Particle({
        texture: new Texture({
          source: frontStarTiles.source,
          frame: srcRect,
        }),
        x: drawX,
        y: drawY,
      });
      tempContainer.addParticle(part);

      tileX++;
      tileX %= PARALLAX_GRID_WIDTH;
      drawX += TILE_WIDTH;
    }
    tileY++;
    tileY %= PARALLAX_GRID_HEIGHT;
    drawY += TILE_HEIGHT;
  }
  // blit the temp container into the perminantly attached texture
  app.renderer.render({
    container: tempContainer,
    target: dest,
    clear: false,
  });
};
