const express = require('express');
const cors = require('cors');
const fs = require('fs')
const path = require('path')
const chroma = require('chroma-js');
const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

const generateRandomColor = () => {
  return chroma.random().hex().toUpperCase();
};

const generateMonochromeColors = (baseColor) => {
  return chroma
    .scale([chroma(baseColor).brighten(3), baseColor, chroma(baseColor).darken(3)]).domain([0, 0.5, 1]) .mode('lab').colors(5).map(color => color.toUpperCase());
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

return newColors.map((color, index) => {
  const isLocked = lockedColors[index]?.locked; 
  const lockedColor = lockedColors[index]?.color; 

  return {
    color: isLocked ? lockedColor : color, 
    locked: isLocked || false,
    rgb: isLocked 
      ? `rgb(${chroma(lockedColor).rgb().map(Math.round).join(", ")})` 
      : `rgb(${chroma(color).rgb().map(Math.round).join(", ")})`, 
    hsl: isLocked 
      ? `hsl(${Math.round(chroma(lockedColor).hsl()[0])}, ${Math.round(chroma(lockedColor).hsl()[1] * 100)}%, ${Math.round(chroma(lockedColor).hsl()[2] * 100)}%)` 
      : `hsl(${Math.round(chroma(color).hsl()[0])}, ${Math.round(chroma(color).hsl()[1] * 100)}%, ${Math.round(chroma(color).hsl()[2] * 100)}%)` 
  };
});
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

app.post('/api/save_palette', (req, res) => {
  const { colors, name } = req.body;
  const code = Math.random().toString(36).substring(2, 8).toUpperCase();
  const link = `http://localhost:3000/palette/${code}`;

  const paletteData = { name, colors, code, link };
  const filePath = path.join(__dirname, 'palettes.json');

  fs.readFile(filePath, (err, data) => {
    if (err) {
      return res.status(500).json({ message: 'Error reading file' });
    }

    let palettes = data.length ? JSON.parse(data) : [];
    
    const existingPaletteIndex = palettes.findIndex(palette => palette.name === name);
    
    if (existingPaletteIndex !== -1) {
      palettes[existingPaletteIndex] = { ...palettes[existingPaletteIndex], colors };
    } else {
      palettes.push(paletteData);
    }

    fs.writeFile(filePath, JSON.stringify(palettes, null, 2), (err) => {
      if (err) {
        return res.status(500).json({ message: 'Error saving file' });
      }
      res.json(paletteData);
    });
  });
});

app.get('/api/palette/:code', (req, res) => {
  const { code: paletteCode } = req.params; 
  const filePath = path.join(__dirname, 'palettes.json');

  fs.readFile(filePath, (err, data) => {
    if (err) {
      return res.status(500).json({ message: 'Error reading file' });
    }
    
    const palettes = data.length ? JSON.parse(data) : [];
    const palette = palettes.find(p => p.code === paletteCode);

    if (palette) {
      res.json(palette);
    } else {
      res.status(404).json({ message: 'Palette not found' });
    }
  });
});


app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
