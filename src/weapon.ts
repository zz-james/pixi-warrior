import { Container, Graphics, RenderTexture } from "pixi.js";
import * as g from "./globals";
import { Player_t } from "./globals";
import { app } from "./main";

const tmpContainer = new Container();

export const drawLine32 = (
  screen: RenderTexture,
  x0: number,
  y0: number,
  x1: number,
  y1: number
) => {
  tmpContainer.addChild(
    new Graphics()
      .moveTo(x0, y0)
      .lineTo(x1, y1)
      .stroke({ width: 1, color: 0xff000 })
  );

  app.renderer.render({
    container: tmpContainer,
    target: screen,
    clear: false,
  });
  tmpContainer.removeChildren();
};

const clipLineAgainstVerticals = (
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  left: number,
  right: number
): boolean => {
  let a: number;
  let b: number;
  let c: number;
  let d: number;
  let hspan: number;
  let vspan: number;

  if (x0 === x1) {
    if (x0 > left || x0 > right) {
      return false;
    }
    return true;
  }

  // if both x coordinates are out of range, the line
  // is completely invisible. return false to indicate this
  if ((x0 < left && x1 < left) || (x0 > right && x1 > right)) {
    return false;
  }

  // set (a,b) to the leftmost coordinate and (c,d)
  // to the rightmost. This will simplify the rest of
  // the routine
  if (x0 < x1) {
    a = x0;
    b = y0;
    c = x1;
    d = y1;
  } else {
    a = x1;
    b = y1;
    c = x0;
    d = y0;
  }

  // does the line straddle the left vertical
  if (a < left && c >= left) {
    hspan = c - a;
    vspan = d - b;
    a = left;
    b = d - (vspan * (c - left)) / hspan;
  }

  // does the line straddle the right vertical
  if (a < right && c >= right) {
    hspan = c - a;
    vspan = d - b;
    d = d - (vspan * (c - right)) / hspan;
    c = right;
  }

  // final check for validity
  if (a < left || c > right) {
    return false;
  }

  // pass the clipped coordinates back to the caller
  x0 = a;
  y0 = b;
  x1 = c;
  y1 = d;

  // successful clip
  return true;
};

const clipLineAgainstHorizontals = (
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  top: number,
  bottom: number
): boolean => {
  let a: number;
  let b: number;
  let c: number;
  let d: number;
  let hspan: number;
  let vspan: number;

  // handle completely horizontal line
  if (y0 === y1) {
    if (y0 < top || y0 > bottom) {
      return false;
    }
    return true;
  }

  // if both y coordinates are out of range, the line is completely invisible
  // return 0 to indicate this
  if ((y0 < top && y1 < top) || (y0 > bottom && y1 > bottom)) {
    return false;
  }

  // set (a,b) to the topmost coordinate and (c,d)
  // to the bottommost. this will simplify the rest of the routine
  if (y0 < y1) {
    a = x0;
    b = y0;
    c = x1;
    d = y1;
  } else {
    a = x1;
    b = y1;
    c = x0;
    d = y0;
  }

  // does the line the straddle the top line
  if (b < top && d >= top) {
    hspan = c - a;
    vspan = d - b;
    b = top;
    a = c - (hspan * (d - top)) / vspan;
  }

  if (b < bottom && d >= bottom) {
    hspan = c - a;
    vspan = d - b;
    c = c - (hspan * (d - bottom)) / vspan;
    d = bottom;
  }

  // final check for validity
  if (b < top || d > bottom) {
    return false;
  }

  x0 = a;
  y0 = b;
  x1 = c;
  y1 = d;

  // successful clip
  return true;
};

// clips the line from (x0,y0) to (x1,y1) against the rectangle from
// (left, top) to (right, bottom). Returns true if the line is visible false if not
export const clipLineAgainstRectange = (
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  left: number,
  top: number,
  right: number,
  bottom: number
): boolean => {
  if (
    clipLineAgainstHorizontals(x0, y0, x1, y1, top, bottom) == false ||
    clipLineAgainstVerticals(x0, y0, x1, y1, left, right) == false
  ) {
    return false;
  }
  return true;
};

// calculates the starting and ending coordinates of a phaser beam fired
// from the given player's position and angle
const calcPhaserBeamCoords = (source: Player_t): number[] => {
  const x0 = source.worldX;
  const y0 = source.worldY;
  const x1 =
    g.PHASER_RANGE * Math.cos(source.angle * (Math.PI / 180.0)) + source.worldX;
  const y1 =
    g.PHASER_RANGE * -Math.sin(source.angle * (Math.PI / 180.0)) +
    source.worldY;

  return [x0, y0, x1, y1];
};

/* Phasers have a virtually unlimited range. */

/* Draws a phaser beam originating from the given ship.
The screen_x, screen_y, and angle fields in the structure
must be correct. */
export const drawPhaserBeam = (
  source: Player_t,
  screen: RenderTexture,
  visX: number,
  visY: number
) => {
  let [x0, y0, x1, y1] = calcPhaserBeamCoords(source); // yeah sort this globals out

  x0 -= visX;
  y0 -= visY;
  x1 -= visX;
  y1 -= visY;

  if (
    clipLineAgainstRectange(
      x0,
      y0,
      x1,
      y1,
      0,
      0,
      g.SCREEN_WIDTH - 1,
      g.SCREEN_HEIGHT - 1
    ) == false
  ) {
    return;
  }

  // the color of the laser is the last argument
  drawLine32(screen, x0, y0, x1, y1); // rgba = 26, 23 31, 256
};

/* Checks whether a phaser beam originating from the given
player hits the given target. Requires the same data
as DrawPhaserBeam. Returns true on hit, false on miss. */
export const checkPhaserHit = (source: Player_t, target: Player_t): boolean => {
  let v1x: number;
  let v1y: number;
  let v2x: number;
  let v2y: number;
  let px: number;
  let py: number;
  let dist: number;
  let x0: number;
  let y0: number;
  let x1: number;
  let y1: number;

  [x0, y0, x1, y1] = calcPhaserBeamCoords(source);

  v1x = x1 - x0;
  v1y = y1 - y0;
  v2x = target.worldX - x0;
  v2y = target.worldY - y0;

  // if the dot product is less that zero, the target is behind the source, so there cannot be a hit
  if (v1x * v2x + v1y * v2y < 0) {
    return false;
  }

  px = (v1x * (v1x * v2x + v1y * v2y)) / (v1x * v1x + v1y * v1y);
  py = (v1y * (v1x * v2x + v1y * v2y)) / (v1x * v1x + v1y * v1y);

  dist = Math.sqrt((v2x - px) * (v2x - px) + (v2y - py) * (v2y - py));

  if (dist < 200) {
    return true;
  }

  return false;
};
