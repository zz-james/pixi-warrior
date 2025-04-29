import { Assets, Sprite, Texture } from "pixi.js";

export let warrior: Sprite;
export let devil: Sprite;
export let backStarTiles: Texture;
export let frontStarTiles: Texture;

export const loadGameData = async () => {
  Assets.addBundle("images", {
    shipStrip: "fighter.png",
    backStarTiles: "back-stars.png",
    frontStarTiles: "front-stars.png",
  });

  const imageTextures = await Assets.loadBundle("images");
  warrior = new Sprite(imageTextures.shipStrip);
  warrior.anchor.set(0.5, 0.5);
  devil = new Sprite(imageTextures.shipStrip);
  devil.anchor.set(0.5, 0.5);

  backStarTiles = imageTextures.backStarTiles;
  frontStarTiles = imageTextures.frontStarTiles;
};
