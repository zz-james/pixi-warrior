import { Rect, Coord } from "./pixelf/surfaces"; // types
import * as g from "./globals";
import {
  Assets,
  Container,
  Rectangle,
  RenderTexture,
  Sprite,
  Texture,
  TextureSource,
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

const tmpContainer = new Container();
const surfaceSprite = new Sprite();
const playerIcon = new Sprite();
const oppIcon = new Sprite();

let surfaceTexture: Texture<TextureSource<any>>;
let playerTexture: Texture<TextureSource<any>>;
let oppTexture: Texture<TextureSource<any>>;
let oppTextureOff: Texture<TextureSource<any>>;
let dest: Rect;

export const initRadarDisplay = async () => {
  const imageQueue = [
    "led-green-on.png",
    "led-red-on.png",
    "led-red-off.png",
    "radar.png",
  ];

  const imageSurfaces = await Assets.load(imageQueue);

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

  let src = new Rectangle(0, 0, radar.physicW, radar.physicH);
  surfaceTexture = new Texture({
    source: radar.radarSurface.source,
    frame: src,
  });

  //
  // start with player dot
  let playerBlobSrcRect = new Rectangle(
    0,
    0,
    radar.playerIcon.width,
    radar.playerIcon.height
  );
  playerTexture = new Texture({
    source: radar.playerIcon.source,
    frame: playerBlobSrcRect,
  });

  let oppenentBlobSrcRect = new Rectangle(
    0,
    0,
    radar.oppIconOn.width,
    radar.oppIconOn.height
  );
  oppTexture = new Texture({
    source: radar.oppIconOn.source,
    frame: oppenentBlobSrcRect,
  });
  oppTextureOff = new Texture({
    source: radar.oppIconOff.source,
    frame: oppenentBlobSrcRect,
  });
  dest = {
    x: radar.physicX,
    y: radar.physicY,
    w: radar.physicW,
    h: radar.physicH,
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
  // first draw radar background on screen

  surfaceSprite.x = dest.x;
  surfaceSprite.y = dest.y;
  surfaceSprite.width = dest.w;
  surfaceSprite.height = dest.h;
  surfaceSprite.texture = surfaceTexture;
  tmpContainer.addChild(surfaceSprite);

  // now do player 'dot' on the screen on top of the radar (why don't we blit onto the radar surface then blit at the end?)

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

    playerIcon.x = destCoord.x;
    playerIcon.y = destCoord.y;
    playerIcon.width = radar.playerIcon.width;
    playerIcon.height = radar.playerIcon.height;
    playerIcon.texture = playerTexture;

    tmpContainer.addChild(playerIcon);
  }

  //now do the opponent blob

  // start with player dot

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
      oppIcon.x = destCoord.x;
      oppIcon.y = destCoord.y;
      oppIcon.width = radar.oppIconOn.width;
      oppIcon.height = radar.oppIconOn.height;
      oppIcon.texture = oppTexture;

      tmpContainer.addChild(oppIcon);

      radar.oppIconState++;
    } else if (radar.oppIconState <= 20) {
      oppIcon.x = destCoord.x;
      oppIcon.y = destCoord.y;
      oppIcon.width = radar.oppIconOff.width;
      oppIcon.height = radar.oppIconOff.height;
      oppIcon.texture = oppTextureOff;
      tmpContainer.addChild(oppIcon);

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

  tmpContainer.removeChildren();
};
