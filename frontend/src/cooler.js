import React, { useState, useEffect } from "react";
import CopyToClipboard from "react-copy-to-clipboard";

const ColorPaletteGenerator = () => {
  const [colors, setColors] = useState([]);
  const [colorType, setColorType] = useState('hex');
  const [colorMethod, setColorMethod] = useState('random');
  const [paletteName, setPaletteName] = useState('');
  const [paletteCode, setPaletteCode] = useState('')
  const [savedPalettes, setSavedPalettes] = useState([]);
  const [like, setLike] = useState(false)

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
        body: JSON.stringify({ name: paletteName, colors, like: like }),
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

  useEffect(() => {
    const fetchPalettes = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/select_palette");
        const names = await response.json();
        setSavedPalettes(names);
      } catch (error) {
        console.error("Error fetching palettes:", error);
      }
    };

    fetchPalettes();
  }, []);

  const handleSelectPalette = async (selectedName) => {
    try {
      const response = await fetch(`http://localhost:5000/api/select_palette/${selectedName}`);
      if (response.ok) {
        const palette = await response.json();
        setColors(palette.colors);
        setPaletteName(palette.name);
        setLike(palette.like)
      } else {
        alert("Palette not found");
      }
    } catch (error) {
      console.error("Error fetching selected palette:", error);
    }
  };
  const toggleLike = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/like_palette/${paletteName}`, {
        method: 'GET'
      });

      if (response.ok) {
        const data = await response.json();
        setLike(data.like);
      } else {
        alert("Error updating like status");
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };



  return (
    <div className="flex flex-col">
      
      <div className="flex flex-wrap items-center justify-between bg-gray-800 text-white px-4 py-3 fixed top-0 left-0 right-0 shadow-lg z-50">
      <button
        className="z-50 text-red-500 "
        onClick={toggleLike}
      >
        {like ? <span class="material-icons text-[2vw]" >
          favorite
        </span> : <span class="material-icons text-[2vw]" >
          favorite_border
        </span>}
      </button>
        <div className="flex items-center space-x-2 mb-2 md:mb-0">
          <input
            type="text"
            placeholder="Enter the palette code"
            value={paletteCode}
            onChange={(e) => setPaletteCode(e.target.value)}
            className="p-2 border border-gray-500 rounded-md text-lg bg-gray-900 text-white placeholder-gray-400"
          />
          <button onClick={readSavedPalette} className="p-2 bg-blue-500 text-white rounded-md text-lg">
            Load Palette
          </button>
        </div>

        <div className="flex items-center space-x-4">
          <label className="text-lg text-white">Select a saved palette:</label>
          <select
            onChange={(e) => handleSelectPalette(e.target.value)}
            value={paletteName}
            className="p-2 border border-gray-500 rounded-md bg-gray-900 text-white"
          >
            <option value="">--Choose Palette--</option>
            {savedPalettes.map((name, index) => (
              <option key={index} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>


        <div className="flex items-center space-x-4 mb-2 md:mb-0">
          <span className="text-lg md:text-xl">Change Type:</span>
          <label className="text-lg md:text-xl">
            <input
              type="radio"
              value="hex"
              checked={colorType === 'hex'}
              onChange={() => setColorType('hex')}
              className="mr-1"
            />
            HEX
          </label>
          <label className="text-lg md:text-xl">
            <input
              type="radio"
              value="rgb"
              checked={colorType === 'rgb'}
              onChange={() => setColorType('rgb')}
              className="mr-1"
            />
            RGB
          </label>
          <label className="text-lg md:text-xl">
            <input
              type="radio"
              value="hsl"
              checked={colorType === 'hsl'}
              onChange={() => setColorType('hsl')}
              className="mr-1"
            />
            HSL
          </label>
        </div>

        <div className="flex items-center space-x-2 mb-2 md:mb-0">
          <span className="text-lg md:text-xl">Generate:</span>
          <select
            onChange={(e) => setColorMethod(e.target.value)}
            value={colorMethod}
            className="text-lg md:text-xl bg-gray-900 border border-gray-500 rounded-md text-white"
          >
            <option value="random">Random</option>
            <option value="monochrome">Monochrome</option>
            <option value="triadic">Triadic</option>
            <option value="quadratic">Quadratic</option>
          </select>
        </div>

        <div className="flex items-center space-x-2 mb-2 md:mb-0">
          <input
            type="text"
            placeholder="Enter the name of the palette"
            value={paletteName}
            onChange={(e) => setPaletteName(e.target.value)}
            className="p-2 border border-gray-500 rounded-md text-lg bg-gray-900 text-white placeholder-gray-400"
          />
          <button onClick={savePalette} className="p-2 bg-blue-500 text-white rounded-md text-lg">
            Save
          </button>
        </div>

        <button onClick={fetchNewColors} className="text-lg md:text-xl p-2">
          <span className="material-symbols-outlined">refresh</span>
        </button>
      </div>

      <div className="w-full flex flex-wrap ">
        {colors.map((colorObj, index) => (
          <div
            style={{ backgroundColor: colorObj.color }}
            key={index}
            className="w-1/5 h-screen flex items-center justify-center"
          >
            <div className="flex flex-col justify-evenly gap-4 items-center">
              <button onClick={() => toggleLock(index)} className="text-base sm:text-lg md:text-xl bg-gray-900 text-white p-1">
                {colorObj.locked ? (
                  <span className="material-symbols-outlined">lock</span>
                ) : (
                  <span className="material-symbols-outlined">lock_open</span>
                )}
              </button>

              <CopyToClipboard text={colorType === 'hex' ? colorObj.color : (colorType === 'rgb' ? colorObj.rgb : colorObj.hsl)}>
                <button className="text-base sm:text-lg md:text-xl bg-gray-900 text-white px-2 py-1">
                  {colorType === 'hex' ? colorObj.color : (colorType === 'rgb' ? colorObj.rgb : colorType === 'hsl' ? colorObj.hsl : '')}
                </button>
              </CopyToClipboard>
            </div>
          </div>
        ))}
      </div>

    </div>

  );
};

export default ColorPaletteGenerator;
