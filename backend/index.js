const express = require('express');
const cors = require('cors');
const chroma = require('chroma-js'); // Import chroma-js
const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

const generateRandomColor = () => {
  return chroma.random().hex(); // Generate a random color in hex format
};

const generateColorPalette = (lockedColors = []) => {
  return Array(5).fill("").map((_, index) => {
    const color = lockedColors[index]?.locked ? lockedColors[index].color : generateRandomColor();
    return {
      color,
      locked: lockedColors[index]?.locked || false,
      rgb: chroma(color).rgb().join(", "), // Convert to RGB
      hsl: chroma(color).hsl().join(", "), // Convert to HSL
    };
  });
};

app.post('/api/colors', (req, res) => {
  const { currentColors } = req.body; 
  const newPalette = generateColorPalette(currentColors);
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
