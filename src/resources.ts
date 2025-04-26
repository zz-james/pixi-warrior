import { Assets, Texture } from "pixi.js";

export let shipStrip: Texture;
export let backStarTiles: Texture;
export let frontStarTiles: Texture;

export const loadGameData = async () => {
  Assets.addBundle("images", {
    shipStrip: "fighter.png",
    backStarTiles: "back-stars.png",
    frontStarTiles: "front-stars.png",
  });

  const imageTextures = await Assets.loadBundle("images");
  shipStrip = imageTextures.shipStrip;

  backStarTiles = imageTextures.backStarTiles;
  frontStarTiles = imageTextures.frontStarTiles;
};
