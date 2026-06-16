/* eslint-disable @typescript-eslint/no-require-imports */

const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

const width = 1200;
const height = 850;
const pixels = Buffer.alloc(width * height * 4);

function hexToRgb(hex) {
  const clean = hex.replace("#", "");
  return {
    r: parseInt(clean.slice(0, 2), 16),
    g: parseInt(clean.slice(2, 4), 16),
    b: parseInt(clean.slice(4, 6), 16)
  };
}

function setPixel(x, y, color, alpha = 1) {
  if (x < 0 || x >= width || y < 0 || y >= height) return;
  const index = (y * width + x) * 4;
  const baseAlpha = 1 - alpha;
  pixels[index] = Math.round(color.r * alpha + pixels[index] * baseAlpha);
  pixels[index + 1] = Math.round(color.g * alpha + pixels[index + 1] * baseAlpha);
  pixels[index + 2] = Math.round(color.b * alpha + pixels[index + 2] * baseAlpha);
  pixels[index + 3] = 255;
}

function fillRect(x, y, rectWidth, rectHeight, hex, alpha = 1) {
  const color = hexToRgb(hex);
  for (let yy = y; yy < y + rectHeight; yy += 1) {
    for (let xx = x; xx < x + rectWidth; xx += 1) {
      setPixel(xx, yy, color, alpha);
    }
  }
}

function fillCircle(cx, cy, radius, hex, alpha = 1) {
  const color = hexToRgb(hex);
  const radiusSq = radius * radius;
  for (let yy = cy - radius; yy <= cy + radius; yy += 1) {
    for (let xx = cx - radius; xx <= cx + radius; xx += 1) {
      const dx = xx - cx;
      const dy = yy - cy;
      if (dx * dx + dy * dy <= radiusSq) {
        setPixel(xx, yy, color, alpha);
      }
    }
  }
}

function card(x, y, w, h, fill, border) {
  fillRect(x + 8, y + 12, w, h, "#172033", 0.08);
  fillRect(x, y, w, h, fill);
  fillRect(x, y, w, 4, border);
  fillRect(x, y + h - 4, w, 4, border);
  fillRect(x, y, 4, h, border);
  fillRect(x + w - 4, y, 4, h, border);
}

function encodePng() {
  const raw = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y += 1) {
    const rowStart = y * (width * 4 + 1);
    raw[rowStart] = 0;
    pixels.copy(raw, rowStart + 1, y * width * 4, (y + 1) * width * 4);
  }

  const chunks = [
    chunk("IHDR", (() => {
      const data = Buffer.alloc(13);
      data.writeUInt32BE(width, 0);
      data.writeUInt32BE(height, 4);
      data[8] = 8;
      data[9] = 6;
      data[10] = 0;
      data[11] = 0;
      data[12] = 0;
      return data;
    })()),
    chunk("IDAT", zlib.deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0))
  ];

  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), ...chunks]);
}

function chunk(type, data) {
  const typeBuffer = Buffer.from(type);
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])), 0);
  return Buffer.concat([length, typeBuffer, data, crc]);
}

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = crc & 1 ? 0xedb88320 ^ (crc >>> 1) : crc >>> 1;
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

fillRect(0, 0, width, height, "#f6f8fb");
fillRect(0, 0, width, 280, "#eef3f8");
fillRect(80, 80, 1040, 690, "#172033", 0.05);
fillRect(100, 100, 1000, 650, "#ffffff");
fillRect(100, 100, 1000, 92, "#172033");
fillCircle(155, 146, 12, "#f0b429");
fillCircle(195, 146, 12, "#2f8f83");
fillCircle(235, 146, 12, "#7aa7c7");

card(160, 250, 300, 160, "#eef7f4", "#b9ded6");
fillRect(190, 292, 155, 18, "#172033");
fillRect(190, 332, 220, 14, "#536173", 0.5);
fillRect(190, 370, 118, 32, "#2f8f83");

card(495, 250, 300, 160, "#fff8e8", "#f4d27a");
fillRect(525, 292, 178, 18, "#172033");
fillRect(525, 332, 190, 14, "#536173", 0.5);
fillRect(525, 370, 118, 32, "#f0b429");

card(160, 455, 300, 160, "#eef3fa", "#bfd4e7");
fillRect(190, 497, 190, 18, "#172033");
fillRect(190, 537, 210, 14, "#536173", 0.5);
fillRect(190, 575, 118, 32, "#7aa7c7");

card(495, 455, 300, 160, "#f7f3ff", "#d4c6ef");
fillRect(525, 497, 205, 18, "#172033");
fillRect(525, 537, 160, 14, "#536173", 0.5);
fillRect(525, 575, 118, 32, "#8c6bc8");

card(835, 250, 210, 365, "#f4f6f8", "#d5dde7");
fillRect(865, 300, 118, 22, "#172033");
fillRect(865, 354, 150, 18, "#2f8f83", 0.85);
fillRect(865, 394, 128, 18, "#7aa7c7", 0.9);
fillRect(865, 434, 142, 18, "#f0b429", 0.9);
fillRect(865, 505, 150, 56, "#ffffff");
fillRect(885, 528, 90, 14, "#172033");

for (let x = 230; x < 760; x += 10) {
  const y = Math.round(680 - Math.sin((x - 230) / 95) * 28);
  fillCircle(x, y, 5, "#2f8f83", 0.45);
}

const outputPath = path.join(__dirname, "..", "public", "planner-visual.png");
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, encodePng());
console.log(outputPath);
