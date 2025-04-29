export type Rect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type Coord = {
  x: number;
  y: number;
};

export const little_endian: boolean =
  new Int8Array(new Int16Array([1]).buffer)[0] > 0;

export class Surface {
  width: number;
  height: number;
  pixels: Uint8ClampedArray;
  bufferSize: number;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.pixels = new Uint8ClampedArray(width * height * 4);
    this.bufferSize = this.pixels.length;
  }

  static FromImage(image: HTMLImageElement) {
    const surface = new Surface(image.width, image.height);
    const canvas = new OffscreenCanvas(image.width, image.height);

    const context = canvas.getContext("2d");
    if (!(context instanceof CanvasRenderingContext2D)) {
      throw new Error("Failed to get a valid 2D canvas context");
    }
    context.drawImage(image, 0, 0);
    const imageData = context.getImageData(0, 0, image.width, image.height);
    surface.pixels.set(imageData.data);

    return surface;
  }

  /**
   * get the pixel index for a given coordinate
   * @param x the x coordinate
   * @param y the y coordinate
   * @returns the pixel index for the given coordinate
   */
  getIndex(x: number, y: number): number {
    if (x < 0 || x >= this.width) {
      throw new Error("X coordinate is out of bounds");
    }
    if (y < 0 || y >= this.height) {
      throw new Error("Y coordinate is out of bounds");
    }
    return (y * this.width + x) * 4;
  }

  /**
   * copy the pixel data back into the canvas context
   * @param context the canvas context to blit to (you can use a 2d context or an offscreen canvas)
   * @param srcRect the rectangle to copy (default fullwidth fullheight)
   * @param destCoord top left of where that rectangle goes (default 0 0)
   */
  blitToCanvas(
    canvas: HTMLCanvasElement | OffscreenCanvas,
    srcRect: Rect = { x: 0, y: 0, width: this.width, height: this.height },
    destCoord: Coord = { x: 0, y: 0 }
  ) {
    if (srcRect.x < 0 || srcRect.y < 0) {
      throw new Error("Source rectangle is out of bounds");
    }
    if (
      destCoord.x < 0 ||
      destCoord.y < 0 ||
      destCoord.x + srcRect.width > this.width ||
      destCoord.y + srcRect.height > this.height
    ) {
      throw new Error("Destination coordinates are out of bounds");
    }
    const context = canvas.getContext("2d") as CanvasRenderingContext2D;
    if (!context) {
      throw new Error("Failed to get canvas context");
    }

    const imageData = new ImageData(
      this.pixels.subarray(
        srcRect.x * 4 + srcRect.y * this.width * 4,
        (srcRect.x + srcRect.width) * 4 +
          (srcRect.y + srcRect.height) * this.width * 4
      ),
      srcRect.width,
      srcRect.height
    );

    context?.putImageData(
      imageData, // imageData is the array of pixels associated with the main buffer
      destCoord.x, // Horizontal position (x coordinate) at which to place the image data in the destination canvas
      destCoord.y, // Vertical position (y coordinate) at which to place the image data in the destination canvas.
      srcRect.x, // Horizontal position (x coordinate) of the top-left corner from which the image data will be extracted. Defaults to 0
      srcRect.y, // Vertical position (y coordinate) of the top-left corner from which the image data will be extracted. Defaults to 0
      srcRect.width, // Width of the rectangle to be painted. Defaults to the width of the image data.
      srcRect.height // Height of the rectangle to be painted. Defaults to the height of the image data.
    );
  }
  /**
   * clear the pixel buffer
   * @param color the color to clear the buffer to (default black)
   * @param alpha the alpha value to clear the buffer to (default 255)
   */
  clearPixels(color: number = 0, alpha: number = 0) {
    const r = (color >> 16) & 0xff;
    const g = (color >> 8) & 0xff;
    const b = color & 0xff;
    const a = alpha & 0xff;

    for (let i = 0; i < this.bufferSize; i += 4) {
      this.pixels[i] = r;
      this.pixels[i + 1] = g;
      this.pixels[i + 2] = b;
      this.pixels[i + 3] = a;
    }
  }

  /**
   * blit this surface to another
   * @param dest the destination surface
   * @param srcRect the rectangle to copy from (default fullwidth fullheight)
   * @param destCoord the coordinate to place the image in the destination surface
   */
  blitSurface(
    dest: Surface,
    srcRect: Rect = { x: 0, y: 0, width: this.width, height: this.height },
    destCoord: Coord = { x: 0, y: 0 }
  ) {
    if (
      srcRect.x < 0 ||
      srcRect.y < 0 ||
      srcRect.x + srcRect.width > this.width ||
      srcRect.y + srcRect.height > this.height
    ) {
      throw new Error("Source rectangle is out of bounds");
    }
    if (
      destCoord.x < 0 ||
      destCoord.y < 0 ||
      destCoord.x + srcRect.width > dest.width ||
      destCoord.y + srcRect.height > dest.height
    ) {
      throw new Error("Destination coordinates are out of bounds");
    }

    const sourceData = this.pixels.subarray(
      srcRect.x * 4 + srcRect.y * this.width * 4,
      (srcRect.x + srcRect.width) * 4 +
        (srcRect.y + srcRect.height) * this.width * 4
    );
    const destData = dest.pixels.subarray(
      destCoord.x * 4 + destCoord.y * dest.width * 4,
      (destCoord.x + srcRect.width) * 4 +
        (destCoord.y + srcRect.height) * dest.width * 4
    );

    for (let i = 0; i < sourceData.length; i++) {
      destData[i] = sourceData[i];
    }
  }
}
