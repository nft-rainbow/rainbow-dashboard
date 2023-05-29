import { PixelCrop } from 'react-image-crop'

// @reference https://codesandbox.io/s/react-image-crop-demo-with-react-hooks-y831o?file=/src/App.tsx

// const TO_RADIANS = Math.PI / 180

const TEMPLATE_WIDTH = 640;
const POAP_CIRCLE_RATIO = TEMPLATE_WIDTH / 466;

export async function canvasPreview(
  image: HTMLImageElement,
  canvas: HTMLCanvasElement,
  crop: PixelCrop,
  scale = 1,
  rotate = 0,
  template: HTMLImageElement,
) {
  const ctx = canvas.getContext('2d')

  if (!ctx) {
    throw new Error('No 2d context')
  }
  
  const scaleX = image.naturalWidth / image.width
  const scaleY = image.naturalHeight / image.height
  // devicePixelRatio slightly increases sharpness on retina devices
  // at the expense of slightly slower render times and needing to
  // size the image back down if you want to download/upload and be
  // true to the images natural size.
  const pixelRatio = window.devicePixelRatio
  // const pixelRatio = 1

  const bodyWidth = Math.floor(crop.width * scaleX * pixelRatio)
  canvas.width = bodyWidth * POAP_CIRCLE_RATIO;
  canvas.height = bodyWidth * POAP_CIRCLE_RATIO;

  ctx.scale(pixelRatio, pixelRatio)
  ctx.imageSmoothingQuality = 'high'

  const cropX = crop.x * scaleX
  const cropY = crop.y * scaleY

//   const rotateRads = rotate * TO_RADIANS
//   const centerX = image.naturalWidth / 2
//   const centerY = image.naturalHeight / 2

  ctx.save()

  // 5) Move the crop origin to the canvas origin (0,0)
//   ctx.translate(-cropX, -cropY)
  // 4) Move the origin to the center of the original position
//   ctx.translate(centerX, centerY)
  // 3) Rotate around the origin
//   ctx.rotate(rotateRads)
  // 2) Scale the image
//   ctx.scale(scale, scale)
  // 1) Move the center of the image to the origin (0,0)
//   ctx.translate(-centerX, -centerY)
  const offset = canvas.width * (87 / TEMPLATE_WIDTH) / pixelRatio;
  ctx.drawImage(
    image,
    cropX,
    cropY,
    bodyWidth,
    bodyWidth,
    offset,
    offset,
    bodyWidth,
    bodyWidth,
  )

  // draw the poap template
  const scaleT = canvas.width / TEMPLATE_WIDTH / pixelRatio;
  ctx.scale(scaleT, scaleT);
  ctx.drawImage(
    template,
    0,
    0,
    canvas.width,
    canvas.height,
    0,
    0,
    canvas.width,
    canvas.height,
  )

  ctx.restore()
}
