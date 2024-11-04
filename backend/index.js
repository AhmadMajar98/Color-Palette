const express = require('express');
const cors = require('cors');
const chroma = require('chroma-js');
const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

const generateRandomColor = () => {
  return chroma.random().hex().toUpperCase();
};

const generateMonochromeColors = (baseColor) => {
  return chroma.scale([baseColor, chroma(baseColor).darken()]).mode('lab').colors(5).map(color => color.toUpperCase());
};

const generateTriadicColors = (baseColor) => {
  return [baseColor, ...[120, 240].map(angle => chroma(baseColor).set('hsl.h', `+${angle}`).hex().toUpperCase())];
};

const generateQuadraticColors = (baseColor) => {
  return [baseColor, ...[90, 180, 270].map(angle => chroma(baseColor).set('hsl.h', `+${angle}`).hex().toUpperCase())];
};

const generateColorPalette = (method, lockedColors = []) => {
  const baseColor = generateRandomColor();
  let newColors;

  switch (method) {
    case 'monochrome':
      newColors = generateMonochromeColors(baseColor);
      break;
    case 'triadic':
      newColors = generateTriadicColors(baseColor);
      break;
    case 'quadratic':
      newColors = generateQuadraticColors(baseColor);
      break;
    case 'random':
    default:
      newColors = Array(5).fill("").map(() => generateRandomColor());
      break;
  }

  return newColors.map((color, index) => ({
    color: lockedColors[index]?.locked ? lockedColors[index].color : color,
    locked: lockedColors[index]?.locked || false,
    rgb: `rgb(${chroma(color).rgb().map(Math.round).join(", ")})`,
    hsl: `hsl(${Math.round(chroma(color).hsl()[0])}, ${Math.round(chroma(color).hsl()[1] * 100)}%, ${Math.round(chroma(color).hsl()[2] * 100)}%)`
  }));
};

app.post('/api/colors', (req, res) => {
  const { method, currentColors } = req.body;
  const newPalette = generateColorPalette(method, currentColors);
  res.json({ colors: newPalette });
});

app.post('/api/toggle-lock', (req, res) => {
  const { currentColors, indexToToggle } = req.body;

  const updatedColors = currentColors.map((color, index) => {
    return index === indexToToggle ? { ...color, locked: !color.locked } : color;
  });

  res.json({ colors: updatedColors });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
