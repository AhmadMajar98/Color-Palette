import React, { useState, useEffect } from "react";
import CopyToClipboard from "react-copy-to-clipboard";
import { useNavigate } from "react-router-dom";

const ColorPaletteGenerator = () => {
  const [colors, setColors] = useState([]);
  const [colorType, setColorType] = useState('hex');
  const [colorMethod, setColorMethod] = useState('random'); 
  const [paletteName, setPaletteName] = useState('');
  const [paletteCode, setPaletteCode] = useState('')

  const fetchNewColors = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/colors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ method: colorMethod, currentColors: colors }),
      });
      const data = await response.json();
      setColors(data.colors);
    } catch (error) {
      console.error('Error fetching color palette:', error);
    }
  };

  const toggleLock = async (index) => {
    try {
      const response = await fetch('http://localhost:5000/api/toggle-lock', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ currentColors: colors, indexToToggle: index }),
      });
      const data = await response.json();
      setColors(data.colors);
    } catch (error) {
      console.error('Error toggling lock:', error);
    }
  };

  const savePalette = async () => {
    if (!paletteName.trim()) {
      alert("Please enter a name for your palette.");
      return;
    }
    try {
      const response = await fetch('http://localhost:5000/api/save_palette', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: paletteName, colors }),
      });
      if (response.ok) {
        alert("Palette saved successfully!");
        setPaletteName(''); 
      } else {
        alert("Failed to save palette. Please try again.");
      }
    } catch (error) {
      console.error('Error saving palette:', error);
    }
  };

  const readSavedPalette = async () => {
    if (!paletteCode.trim()) {
      alert('Please enter the code');
      return;
    }
  
    try {
      const response = await fetch(`http://localhost:5000/api/palette/${paletteCode}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      if (response.ok) {
        const paletteData = await response.json();
        setColors(paletteData.colors)
        setPaletteName(paletteData.name)
        
      } else {
        alert('Palette not found');
      }
    } catch (error) {
      console.error('Error fetching palette:', error);
    }
  };

  useEffect(() => {
    fetchNewColors();
  }, [colorMethod]); 

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.code === "Space") {
        event.preventDefault();
        fetchNewColors();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [colors]);

  return (
    <div className="flex flex-col">
      <div className="flex justify-end fixed right-1 items-center">
      <div className="mt-4 p-4">
  <input
    type="text"
    placeholder="Enter the palette code"
    value={paletteCode} 
    onChange={(e) => setPaletteCode(e.target.value)} 
    className="p-2 border border-gray-300 rounded-md text-lg"
  />
  <button onClick={readSavedPalette} className="ml-2 p-2 bg-blue-500 text-white rounded-md text-lg">
    Load Palette
  </button>
</div>

        <div className="ml-4">
          <label className="mr-2 text-lg md:text-xl">Change Type:</label>
          <label className="text-lg md:text-xl">
            <input 
              type="radio" 
              value="hex" 
              checked={colorType === 'hex'} 
              onChange={() => setColorType('hex')} 
            />
            HEX
          </label>
          <label className="ml-2 text-lg md:text-xl">
            <input 
              type="radio" 
              value="rgb" 
              checked={colorType === 'rgb'} 
              onChange={() => setColorType('rgb')} 
            />
            RGB
          </label>
          <label className="ml-2 text-lg md:text-xl">
            <input 
              type="radio" 
              value="hsl" 
              checked={colorType === 'hsl'} 
              onChange={() => setColorType('hsl')} 
            />
            HSL
          </label>
        </div>
        <div className="ml-4">
          <label className="mr-2 text-lg md:text-xl">Generate:</label>
          <select onChange={(e) => setColorMethod(e.target.value)} value={colorMethod} className="text-lg md:text-xl">
            <option value="random">Random</option>
            <option value="monochrome">Monochrome</option>
            <option value="triadic">Triadic</option>
            <option value="quadratic">Quadratic</option>
          </select>
        </div>
        <button onClick={fetchNewColors} className="text-center text-lg md:text-xl">
          <span className="material-symbols-outlined">refresh</span>
        </button>
      </div>
      <div className="w-full flex">
        {colors.map((colorObj, index) => (
          <div
            style={{ backgroundColor: colorObj.color }}
            key={index}
            className="w-1/5 h-screen flex items-end justify-center"
          >
            <div className="flex flex-col justify-evenly gap-10 items-center">
            <button onClick={() => toggleLock(index)} className="text-lg md:text-xl bg-green-300">
                {colorObj.locked ? (
                  <span className="material-symbols-outlined">lock</span>
                ) : (
                  <span className="material-symbols-outlined">lock_open</span>
                )}
              </button>
              <CopyToClipboard text={colorType === 'hex' ? colorObj.color : (colorType === 'rgb' ? colorObj.rgb : colorObj.hsl)}>
                <button className="text-lg md:text-xl bg-green-300 text-black p-1">
                  {colorType === 'hex' ? colorObj.color : (colorType === 'rgb' ? colorObj.rgb : colorObj.hsl)}
                </button>
              </CopyToClipboard>

            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 p-4 fixed">
        <input
          type="text"
          placeholder="Enter the name of the palette"
          value={paletteName}
          onChange={(e) => setPaletteName(e.target.value)}
          className="p-2 border border-gray-300 rounded-md text-lg"
        />
        <button onClick={savePalette} className="ml-2 p-2 bg-blue-500 text-white rounded-md text-lg">
          Save
        </button>
      </div>
    </div>
  );
};

export default ColorPaletteGenerator;
