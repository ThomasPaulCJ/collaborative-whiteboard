import React, { useEffect, useRef, useState } from 'react';
import { Stage, Layer, Line } from 'react-konva';
import { io, Socket } from 'socket.io-client';

const App: React.FC = () => {
  const [lines, setLines] = useState<any[]>([]);
  const [tool, setTool] = useState<'pen' | 'eraser'>('pen');
  const [color, setColor] = useState<string>('#000000'); // Default to black
  const [strokeWidth, setStrokeWidth] = useState<number>(5); // New state for stroke width, default 5
  const isDrawing = useRef(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socket = io('https://collaborative-whiteboard-server.onrender.com');
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Connected to server!');
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from server!');
    });

    socket.on('drawing', (data) => {
      setLines(prevLines => [...prevLines, data]);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleMouseDown = (e: any) => {
    isDrawing.current = true;
    const pos = e.target.getStage().getPointerPosition();
    // Include the current strokeWidth when starting a new line
    setLines([...lines, { points: [pos.x, pos.y], color: color, tool: tool, strokeWidth: strokeWidth }]);
  };

  const handleMouseMove = (e: any) => {
    if (!isDrawing.current) {
      return;
    }
    const stage = e.target.getStage();
    const point = stage.getPointerPosition();
    let lastLine = lines[lines.length - 1];
    lastLine.points = lastLine.points.concat([point.x, point.y]);
    setLines([...lines.slice(0, -1), lastLine]);
  };

  const handleMouseUp = () => {
    isDrawing.current = false;
    const lastLine = lines[lines.length - 1];
    if (lastLine && socketRef.current) {
      // Emit the completed line with its tool, color, and strokeWidth
      socketRef.current.emit('drawing', lastLine);
    }
  };

  return (
    <div style={{
      width: '100%',
      height: '100vh',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: 'Inter, sans-serif', // Modern font
      backgroundColor: '#f0f2f5', // Light grey background
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    }}>
      {/* Title */}
      <h1 style={{
        textAlign: 'center',
        padding: '20px 0',
        margin: 0,
        color: '#2c3e50', // Darker text for contrast
        fontSize: '2.5rem', // Larger font size
        fontWeight: '700', // Bolder font weight
        letterSpacing: '1px' // Slight letter spacing
      }}>
        Collaborative Whiteboard
      </h1>

      {/* Control Panel: Styled as a floating card */}
      <div style={{
        position: 'absolute',
        top: 20, // Slightly more padding from top
        right: 20,
        zIndex: 10,
        backgroundColor: '#ffffff', // White background
        padding: '15px 20px', // Increased padding
        borderRadius: '12px', // More rounded corners
        boxShadow: '0 4px 15px rgba(0,0,0,0.1)', // More prominent shadow
        display: 'flex',
        alignItems: 'center',
        gap: '15px', // Increased gap
        flexWrap: 'wrap' // Allow items to wrap on smaller screens
      }}>
        <button
          onClick={() => setTool('pen')}
          style={{
            fontWeight: tool === 'pen' ? 'bold' : 'normal',
            padding: '10px 20px', // Larger buttons
            borderRadius: '8px', // More rounded buttons
            border: 'none', // Remove default border
            backgroundColor: tool === 'pen' ? '#3498db' : '#ecf0f1', // Blue for active, light grey for inactive
            color: tool === 'pen' ? '#ffffff' : '#333', // White text for active, dark for inactive
            cursor: 'pointer',
            transition: 'background-color 0.3s ease, transform 0.1s ease', // Smooth transitions
            boxShadow: tool === 'pen' ? '0 2px 5px rgba(52, 152, 219, 0.4)' : 'none', // Shadow for active
          }}
          onMouseEnter={(e) => { if (tool !== 'pen') e.currentTarget.style.backgroundColor = '#dbe0e3'; }}
          onMouseLeave={(e) => { if (tool !== 'pen') e.currentTarget.style.backgroundColor = '#ecf0f1'; }}
          onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.98)'; }}
          onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
        >
          Pen
        </button>
        <button
          onClick={() => setTool('eraser')}
          style={{
            fontWeight: tool === 'eraser' ? 'bold' : 'normal',
            padding: '10px 20px',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: tool === 'eraser' ? '#e74c3c' : '#ecf0f1', // Red for active eraser
            color: tool === 'eraser' ? '#ffffff' : '#333',
            cursor: 'pointer',
            transition: 'background-color 0.3s ease, transform 0.1s ease',
            boxShadow: tool === 'eraser' ? '0 2px 5px rgba(231, 76, 60, 0.4)' : 'none',
          }}
          onMouseEnter={(e) => { if (tool !== 'eraser') e.currentTarget.style.backgroundColor = '#dbe0e3'; }}
          onMouseLeave={(e) => { if (tool !== 'eraser') e.currentTarget.style.backgroundColor = '#ecf0f1'; }}
          onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.98)'; }}
          onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
        >
          Eraser
        </button>
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          style={{
            width: '45px', // Slightly larger color picker
            height: '45px',
            padding: '5px', // Add padding to make the color area bigger
            borderRadius: '8px',
            border: '1px solid #ccc', // Subtle border
            cursor: 'pointer',
            background: 'transparent', // Make background transparent to show selected color well
          }}
        />
        <input
          type="range"
          min="1"
          max="80"
          value={strokeWidth}
          onChange={(e) => setStrokeWidth(parseInt(e.target.value))}
          style={{
            width: '120px', // Wider slider
            cursor: 'pointer',
            // Basic styles for slider thumb/track (can be more advanced with webkit/moz pseudo-elements)
            height: '8px',
            borderRadius: '5px',
            background: '#d3d3d3',
            outline: 'none',
            opacity: '0.7',
            transition: 'opacity .2s',
          }}
          title={`Stroke Width: ${strokeWidth}`}
        />
        <span style={{ color: '#555', fontSize: '0.9rem' }}>{strokeWidth}px</span>
      </div>

      {/* Canvas should fill the remaining space */}
      <div style={{
        flexGrow: 1, // Allow canvas container to grow and take available space
        width: '100%',
        backgroundColor: '#ffffff', // White canvas background
        borderRadius: '12px', // Rounded corners for the canvas
        boxShadow: '0 4px 15px rgba(0,0,0,0.08)', // Subtle shadow for canvas
        marginTop: '20px', // Space below the title
        marginBottom: '20px', // Space above the bottom of the screen
        position: 'relative', // Needed for absolute positioning of stage
      }}>
        <Stage
          width={window.innerWidth - 40} // Adjust width to account for main div padding
          height={window.innerHeight - 150} // Adjust height to account for title and main div padding
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          style={{
            borderRadius: '12px', // Inherit rounded corners
            overflow: 'hidden' // Hide overflow if drawing goes beyond bounds
          }}
        >
          <Layer>
            {lines.map((line, i) => (
              <Line
                key={i}
                points={line.points}
                stroke={line.color === '#ffffff' ? 'white' : line.color}
                strokeWidth={line.tool === 'eraser' ? (line.strokeWidth || 20) : (line.strokeWidth || 5)}
                tension={0.5}
                lineCap="round"
                globalCompositeOperation={line.tool === 'eraser' ? 'destination-out' : 'source-over'}
              />
            ))}
          </Layer>
        </Stage>
      </div>
    </div>
  );
};

export default App;
