import * as g from "./globals";

import {
  Application,
  RenderTexture,
  ParticleContainer,
  Particle,
  Ticker,
} from "pixi.js";

import { initDevtools } from "@pixi/devtools";

import { main } from "./warrior";

import "./style.css";

export const app = new Application();
initDevtools({ app });

const ticker = Ticker.shared;
ticker.speed = 0.01; // Slows down the ticker by half

(async () => {
  await app.init({
    height: g.SCREEN_HEIGHT,
    width: g.SCREEN_WIDTH,
  });

  document.body.appendChild(app.canvas);

  const backContainer = new ParticleContainer();
  const stageSize = {
    width: g.SCREEN_WIDTH,
    height: g.SCREEN_HEIGHT,
  };

  // Create  render texture
  const backStarTexture = RenderTexture.create(stageSize);
  const backDisplayObject = new Particle({ texture: backStarTexture }); //  we create this with a texture at first blank*/
  backContainer.addParticle(backDisplayObject);

  app.stage.addChild(backContainer);

  main(backStarTexture);
})();
