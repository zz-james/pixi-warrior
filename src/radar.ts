import { Rect, Coord } from "./pixelf/surfaces"; // types
import * as g from "./globals";
import {
  Assets,
  Container,
  Rectangle,
  RenderTexture,
  Sprite,
  Texture,
} from "pixi.js";
import { app } from "./main";

type RadarDisplay = {
  radarSurface: Texture;
  physicW: number;
  physicH: number;
  physicX: number;
  physicY: number;
  playerIcon: Texture;
  oppIconState: number;
  oppIconOn: Texture;
  oppIconOff: Texture;
};

let radar: RadarDisplay;

export const initRadarDisplay = async () => {
  const imageQueue = [
    "led-green-on.png",
    "led-red-on.png",
    "led-red-off.png",
    "radar.png",
  ];

  const imageSurfaces = await Assets.load(imageQueue);

  console.log(imageSurfaces);

  radar = {
    physicW: 100,
    physicH: 100,

    physicX: 0,
    physicY: g.SCREEN_HEIGHT - 100,
    radarSurface: imageSurfaces[imageQueue[3]],
    playerIcon: imageSurfaces[imageQueue[0]],
    oppIconOn: imageSurfaces[imageQueue[1]],
    oppIconOff: imageSurfaces[imageQueue[2]],

    oppIconState: 0,
  };
};

export const cleanUpRadarDisplay = () => {
  if (radar.radarSurface !== null) {
    // radar.radarSurface.freesurface();
  }
};

const distance = (x: number, y: number, v: number, w: number) => {
  return Math.sqrt((Math.abs(x - v) ^ 2) + (Math.abs(y - w) ^ 2));
};

export const updateRadarDisplay = (
  screen: RenderTexture,
  playerX: number,
  playerY: number,
  oppX: number,
  oppY: number
) => {
  const tmpContainer = new Container();

  // first draw radar background on screen
  let src = new Rectangle(0, 0, radar.physicW, radar.physicH);

  let dest: Rect = {
    x: radar.physicX,
    y: radar.physicY,
    w: radar.physicW,
    h: radar.physicH,
  };

  tmpContainer.addChild(
    new Sprite({
      texture: new Texture({
        source: radar.radarSurface.source,
        frame: src,
      }),
      x: dest.x,
      y: dest.y,
      width: dest.w,
      height: dest.h,
    })
  );

  // now do player 'dot' on the screen on top of the radar (why don't we blit onto the radar surface then blit at the end?)

  // start with player dot
  let playerBlobSrcRect = new Rectangle(
    0,
    0,
    radar.playerIcon.width,
    radar.playerIcon.height
  );

  // figure the x, y by scaling the player x, y
  let destCoord: Coord = {
    x: ((playerX / (g.WORLD_WIDTH / 100)) | 0) + radar.physicX,
    y: ((playerY / (g.WORLD_HEIGHT / 100)) | 0) + radar.physicY,
  };

  if (
    distance(
      playerX / (g.WORLD_WIDTH / 100),
      playerY / (g.WORLD_HEIGHT / 100),
      50,
      50
    ) < 8
  ) {
    // draw player icon

    tmpContainer.addChild(
      new Sprite({
        texture: new Texture({
          source: radar.playerIcon.source,
          frame: playerBlobSrcRect,
        }),
        x: destCoord.x,
        y: destCoord.y,
      })
    );
  }

  //now do the opponent blob

  // start with player dot
  let oppenentBlobSrcRect = new Rectangle(
    0,
    0,
    radar.oppIconOn.width,
    radar.oppIconOn.height
  );

  // figure the x and y of the blob by scaling the x and y of opponent
  destCoord.x = ((oppX / (g.WORLD_WIDTH / 100)) | 0) + radar.physicX;
  destCoord.y = ((oppY / (g.WORLD_HEIGHT / 100)) | 0) + radar.physicY;

  if (
    distance(
      oppX / (g.WORLD_WIDTH / 100),
      oppY / (g.WORLD_HEIGHT / 100),
      50,
      50
    ) < 8
  ) {
    if (radar.oppIconState < 10) {
      // draw opposition icon
      tmpContainer.addChild(
        new Sprite({
          texture: new Texture({
            source: radar.oppIconOn.source,
            frame: oppenentBlobSrcRect,
          }),
          x: destCoord.x,
          y: destCoord.y,
        })
      );

      radar.oppIconState++;
    } else if (radar.oppIconState <= 20) {
      tmpContainer.addChild(
        new Sprite({
          texture: new Texture({
            source: radar.oppIconOff.source,
            frame: oppenentBlobSrcRect,
          }),
          x: destCoord.x,
          y: destCoord.y,
        })
      );

      radar.oppIconState++;
      if (radar.oppIconState === 20) {
        radar.oppIconState = 0;
      }
    }
  }

  app.renderer.render({
    container: tmpContainer,
    target: screen,
    clear: false,
  });
};
