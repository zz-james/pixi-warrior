import { Surface } from "./utils/surface";

/* draws a line of the given color from (x0, y)) to (x1, y1)
Does not perform clipping against the edges of the surface
Uses the brenshham line drawing algorithm */

export const drawLine = (
  surf: Surface,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  color: Uint8ClampedArray // Uint8ClampedArray => new Uint8ClampedArray([red, green, blue, 255]);
) => {
  let drawPos: number;
  let xSpan: number;
  let ySpan: number;
  let xInc: number;
  let yInc: number;
  let sum: number;
  let i: number;

  const buffer: Uint8ClampedArray = surf.pixels;

  /* calculate the x and y spans of the line */
  xSpan = x1 - x0 + 1;
  ySpan = y1 - y0 + 1;

  /* figure out the correct increment for the major axis 
  accound for negative spans (x1<x0 for instance) */
  if (xSpan < 0) {
    xInc = -1;
    xSpan = -xSpan;
  } else {
    xInc = 1;
  }

  if (ySpan < 0) {
    yInc = -surf.width * 4;
    ySpan = -ySpan;
  } else {
    yInc = surf.width * 4;
  }

  i = 0;

  sum = 0;

  /* this is our current offset ino the buffer. We use this variable so that we don't have to calculate the offset at each step
  we simply increment this by the correct amount.
  instead of adding 1 to the x coordinate, we add one to drawpos
  instead of adding 1 to the y coordinate. we add the surface's pitch (scanline width) to drawpos */
  drawPos = surf.width * 4 * y0 + x0 * 4; // MAY BE WRONG

  /* our loop will be different depending on the major axis */

  if (xSpan < ySpan) {
    /* loop through each pixel along the major axis */
    for (i = 0; i < ySpan; i++) {
      // buffer[drawPos] = color;

      /* draw the pixel */
      buffer[drawPos + 0] = color[0];
      buffer[drawPos + 1] = color[1];
      buffer[drawPos + 2] = color[2];
      buffer[drawPos + 3] = color[3];

      // update the incemental division
      sum += xSpan;

      /* if we've reached the divident, advace and reset */
      if (sum >= ySpan) {
        drawPos += xInc;
        sum -= ySpan;
      }

      /* increemnt the drawing position */
      drawPos += yInc;
    }
  } else {
    /* see comments above this code is equivalent */
    for (i = 0; i < xSpan; i++) {
      // buffer[drawPos] = color;

      /* draw the pixel */
      buffer[drawPos + 0] = color[0];
      buffer[drawPos + 1] = color[1];
      buffer[drawPos + 2] = color[2];
      buffer[drawPos + 3] = color[3];

      // debugger;
      sum += ySpan;

      if (sum >= xSpan) {
        // if we have gone past the xSpan
        drawPos += yInc;
        sum -= xSpan;
      }
      drawPos += xInc * 4;
    }
  }
};
