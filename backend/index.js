const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 5000;

app.use(cors()); 
app.use(express.json()); 

const generateRandomColor = () => {
  const hexa = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += hexa[Math.floor(Math.random() * hexa.length)];
  }
  return color;
};

const generateColorPalette = (lockedColors = []) => {
  return Array(5).fill("").map((_, index) => {
    return {
      color: lockedColors[index]?.locked ? lockedColors[index].color : generateRandomColor(),
      locked: lockedColors[index]?.locked || false,
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
