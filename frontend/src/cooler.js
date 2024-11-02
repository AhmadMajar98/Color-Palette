import React, { useState, useEffect } from "react";
import CopyToClipboard from "react-copy-to-clipboard";

const ColorPaletteGenerator = () => {
  const [colors, setColors] = useState([]);
  const [colorType, setColorType] = useState('hex');

  const fetchNewColors = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/colors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ currentColors: colors }),
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

  useEffect(() => {
    fetchNewColors();
  }, []);

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
      <div className="flex justify-end fixed right-1">
        <div className="ml-4">
          <label className="mr-2">Change Type:</label>
          <label>
            <input 
              type="radio" 
              value="hex" 
              checked={colorType === 'hex'} 
              onChange={() => setColorType('hex')} 
            />
            HEX
          </label>
          <label className="ml-2">
            <input 
              type="radio" 
              value="rgb" 
              checked={colorType === 'rgb'} 
              onChange={() => setColorType('rgb')} 
            />
            RGB
          </label>
          <label className="ml-2">
            <input 
              type="radio" 
              value="hsl" 
              checked={colorType === 'hsl'} 
              onChange={() => setColorType('hsl')} 
            />
            HSL
          </label>
        </div>
      </div>
      <div className="w-full flex">
        {colors.map((colorObj, index) => (
          <div
            style={{ backgroundColor: colorObj.color }}
            key={index}
            className="w-1/5 h-screen flex items-center justify-center"
          >
            <div className="flex justify-evenly gap-10 items-center">
              <CopyToClipboard text={colorType === 'hex' ? colorObj.color : (colorType === 'rgb' ? colorObj.rgb : colorObj.hsl)}>
                <button>
                  {colorType === 'hex' ? colorObj.color : (colorType === 'rgb' ? colorObj.rgb : colorObj.hsl)}
                </button>
              </CopyToClipboard>
              <button onClick={() => toggleLock(index)}>
                {colorObj.locked ? (
                  <span className="material-symbols-outlined">lock</span>
                ) : (
                  <span className="material-symbols-outlined">lock_open</span>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
      <button onClick={fetchNewColors} className="fixed text-center">
        <span className="material-symbols-outlined">refresh</span>
      </button>
    </div>
  );
};

export default ColorPaletteGenerator;
