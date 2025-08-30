import React, { useState, useEffect, useRef, useCallback } from 'react';

const MouseTracker = ({ children }) => {
  const [isTracking, setIsTracking] = useState(false);
  const [showVisualization, setShowVisualization] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [mouseData, setMouseData] = useState([]);
  const [clicks, setClicks] = useState([]);
  const [settings, setSettings] = useState({
    trailLength: 1000, // Increased from 50 to store more points
    heatmapIntensity: 0.7,
    trailOpacity: 0.8,
    clickRadius: 20,
    colorMode: 'speed'
  });
  
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const heatmapRef = useRef(null);
  const animationRef = useRef(null);
  const lastPositionRef = useRef({ x: 0, y: 0, time: Date.now() });
  
  // Keyboard shortcut handler
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Alt + H to toggle controls
      if (e.altKey && e.code === 'KeyH') {
        e.preventDefault();
        setShowControls(prev => !prev);
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);
  
  // Color schemes for different modes
  const getColorBySpeed = (speed) => {
    const normalized = Math.min(speed / 1000, 1);
    const hue = (1 - normalized) * 240;
    return `hsla(${hue}, 100%, 50%, ${settings.trailOpacity})`;
  };
  
  const getColorByTime = (timestamp, currentTime) => {
    const age = (currentTime - timestamp) / 1000;
    const opacity = Math.max(0.1, 1 - (age / 10));
    return `hsla(${(timestamp / 100) % 360}, 70%, 60%, ${opacity * settings.trailOpacity})`;
  };
  
  const getColorByDensity = (density) => {
    const hue = 280 - (density * 180);
    return `hsla(${hue}, 90%, 60%, ${settings.trailOpacity})`;
  };

  // Mouse event handlers
  const handleMouseMove = useCallback((e) => {
    if (!isTracking) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const timestamp = Date.now();
    
    const lastPos = lastPositionRef.current;
    const distance = Math.sqrt(
      Math.pow(x - lastPos.x, 2) + Math.pow(y - lastPos.y, 2)
    );
    const timeDiff = timestamp - lastPos.time;
    const speed = timeDiff > 0 ? distance / timeDiff : 0;
    
    const newPoint = {
      x,
      y,
      timestamp,
      speed: speed * 1000,
      id: Math.random()
    };
    
    setMouseData(prev => {
      const updated = [...prev, newPoint];
      // Keep all points for complete trail history
      return updated;
    });
    
    lastPositionRef.current = { x, y, time: timestamp };
  }, [isTracking, settings.trailLength]);
  
  const handleClick = useCallback((e) => {
    if (!isTracking) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const clickData = {
      x,
      y,
      timestamp: Date.now(),
      type: e.button === 0 ? 'left' : e.button === 2 ? 'right' : 'middle',
      id: Math.random()
    };
    
    setClicks(prev => [...prev, clickData]);
  }, [isTracking]);

  // Set up event listeners
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    // Add event listeners to document to catch all mouse events
    const handleDocumentMouseMove = (e) => {
      if (!isTracking) return;
      
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left + window.scrollX;
      const y = e.clientY - rect.top + window.scrollY;
      const timestamp = Date.now();
      
      const lastPos = lastPositionRef.current;
      const distance = Math.sqrt(
        Math.pow(x - lastPos.x, 2) + Math.pow(y - lastPos.y, 2)
      );
      const timeDiff = timestamp - lastPos.time;
      const speed = timeDiff > 0 ? distance / timeDiff : 0;
      
      const newPoint = {
        x,
        y,
        timestamp,
        speed: speed * 1000,
        id: Math.random()
      };
      
      setMouseData(prev => [...prev, newPoint]);
      lastPositionRef.current = { x, y, time: timestamp };
    };
    
    const handleDocumentClick = (e) => {
      if (!isTracking) return;
      
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left + window.scrollX;
      const y = e.clientY - rect.top + window.scrollY;
      
      const clickData = {
        x,
        y,
        timestamp: Date.now(),
        type: e.button === 0 ? 'left' : e.button === 2 ? 'right' : 'middle',
        id: Math.random()
      };
      
      setClicks(prev => [...prev, clickData]);
    };
    
    // Listen on document to catch events from child components
    document.addEventListener('mousemove', handleDocumentMouseMove);
    document.addEventListener('click', handleDocumentClick);
    document.addEventListener('contextmenu', handleDocumentClick);
    
    return () => {
      document.removeEventListener('mousemove', handleDocumentMouseMove);
      document.removeEventListener('click', handleDocumentClick);
      document.removeEventListener('contextmenu', handleDocumentClick);
    };
  }, [isTracking]);

  // Render visualizations
  useEffect(() => {
    if (!showVisualization) return;
    
    const render = () => {
      const canvas = canvasRef.current;
      const heatmapCanvas = heatmapRef.current;
      if (!canvas || !heatmapCanvas) return;
      
      const ctx = canvas.getContext('2d');
      const heatCtx = heatmapCanvas.getContext('2d');
      const currentTime = Date.now();
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Render heatmap
      if (mouseData.length > 10) {
        const imageData = heatCtx.createImageData(canvas.width, canvas.height);
        const data = imageData.data;
        
        const gridSize = 10;
        const gridWidth = Math.ceil(canvas.width / gridSize);
        const gridHeight = Math.ceil(canvas.height / gridSize);
        const densityGrid = new Array(gridWidth * gridHeight).fill(0);
        
        mouseData.forEach(point => {
          const gx = Math.floor(point.x / gridSize);
          const gy = Math.floor(point.y / gridSize);
          if (gx >= 0 && gx < gridWidth && gy >= 0 && gy < gridHeight) {
            densityGrid[gy * gridWidth + gx]++;
          }
        });
        
        const maxDensity = Math.max(...densityGrid, 1);
        for (let y = 0; y < canvas.height; y++) {
          for (let x = 0; x < canvas.width; x++) {
            const gx = Math.floor(x / gridSize);
            const gy = Math.floor(y / gridSize);
            const density = densityGrid[gy * gridWidth + gx] / maxDensity;
            
            if (density > 0.1) {
              const pixelIndex = (y * canvas.width + x) * 4;
              const intensity = density * settings.heatmapIntensity * 255;
              
              data[pixelIndex] = intensity > 128 ? 255 : intensity * 2;
              data[pixelIndex + 1] = intensity > 64 ? Math.min(255, intensity * 3) : 0;
              data[pixelIndex + 2] = intensity < 64 ? 255 : Math.max(0, 255 - intensity * 2);
              data[pixelIndex + 3] = Math.min(100, intensity);
            }
          }
        }
        
        heatCtx.putImageData(imageData, 0, 0);
      }
      
      // Render mouse trail - show only recent points for performance, but keep all in memory
      if (mouseData.length > 1) {
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        // For display, show last 200 points for performance
        const displayPoints = mouseData.slice(-200);
        
        for (let i = 1; i < displayPoints.length; i++) {
          const point = displayPoints[i];
          const prevPoint = displayPoints[i - 1];
          
          let color;
          switch (settings.colorMode) {
            case 'speed':
              color = getColorBySpeed(point.speed);
              break;
            case 'time':
              color = getColorByTime(point.timestamp, currentTime);
              break;
            case 'density':
              const density = i / displayPoints.length;
              color = getColorByDensity(density);
              break;
            default:
              color = getColorBySpeed(point.speed);
          }
          
          ctx.strokeStyle = color;
          ctx.beginPath();
          ctx.moveTo(prevPoint.x, prevPoint.y);
          ctx.lineTo(point.x, point.y);
          ctx.stroke();
          
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.arc(point.x, point.y, 1, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      
      // Render clicks
      clicks.forEach(click => {
        const age = (currentTime - click.timestamp) / 1000;
        if (age < 2) {
          const radius = settings.clickRadius * (1 + age);
          const opacity = Math.max(0, 1 - age / 2);
          
          ctx.strokeStyle = click.type === 'left' ? 
            `rgba(255, 0, 0, ${opacity})` : 
            `rgba(0, 0, 255, ${opacity})`;
          ctx.lineWidth = 3;
          
          ctx.beginPath();
          ctx.arc(click.x, click.y, radius, 0, Math.PI * 2);
          ctx.stroke();
          
          ctx.fillStyle = click.type === 'left' ? 
            `rgba(255, 0, 0, ${opacity * 0.8})` : 
            `rgba(0, 0, 255, ${opacity * 0.8})`;
          ctx.beginPath();
          ctx.arc(click.x, click.y, 3, 0, Math.PI * 2);
          ctx.fill();
        }
      });
      
      animationRef.current = requestAnimationFrame(render);
    };
    
    render();
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [mouseData, clicks, showVisualization, settings]);

  // Handle canvas resize
  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    const heatmapCanvas = heatmapRef.current;
    
    if (!container || !canvas || !heatmapCanvas) return;
    
    const resizeCanvas = () => {
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = Math.max(rect.height, window.innerHeight);
      heatmapCanvas.width = rect.width;
      heatmapCanvas.height = Math.max(rect.height, window.innerHeight);
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Also resize when content changes (for dynamic content)
    const observer = new ResizeObserver(resizeCanvas);
    observer.observe(container);
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      observer.disconnect();
    };
  }, []);

  // Export canvas as JPG image with complete trail history
  const exportData = () => {
    const canvas = canvasRef.current;
    const heatmapCanvas = heatmapRef.current;
    
    if (!canvas || !heatmapCanvas) return;
    
    // Create a temporary canvas to combine both layers with complete data
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    
    // Fill with white background
    tempCtx.fillStyle = 'white';
    tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
    
    // Draw heatmap layer first (background) - use complete data
    if (mouseData.length > 10) {
      const imageData = tempCtx.createImageData(tempCanvas.width, tempCanvas.height);
      const data = imageData.data;
      
      const gridSize = 10;
      const gridWidth = Math.ceil(tempCanvas.width / gridSize);
      const gridHeight = Math.ceil(tempCanvas.height / gridSize);
      const densityGrid = new Array(gridWidth * gridHeight).fill(0);
      
      // Use ALL mouseData for complete heatmap
      mouseData.forEach(point => {
        const gx = Math.floor(point.x / gridSize);
        const gy = Math.floor(point.y / gridSize);
        if (gx >= 0 && gx < gridWidth && gy >= 0 && gy < gridHeight) {
          densityGrid[gy * gridWidth + gx]++;
        }
      });
      
      const maxDensity = Math.max(...densityGrid, 1);
      for (let y = 0; y < tempCanvas.height; y++) {
        for (let x = 0; x < tempCanvas.width; x++) {
          const gx = Math.floor(x / gridSize);
          const gy = Math.floor(y / gridSize);
          const density = densityGrid[gy * gridWidth + gx] / maxDensity;
          
          if (density > 0.1) {
            const pixelIndex = (y * tempCanvas.width + x) * 4;
            const intensity = density * settings.heatmapIntensity * 255;
            
            data[pixelIndex] = intensity > 128 ? 255 : intensity * 2;
            data[pixelIndex + 1] = intensity > 64 ? Math.min(255, intensity * 3) : 0;
            data[pixelIndex + 2] = intensity < 64 ? 255 : Math.max(0, 255 - intensity * 2);
            data[pixelIndex + 3] = Math.min(100, intensity);
          }
        }
      }
      
      tempCtx.putImageData(imageData, 0, 0);
    }
    
    // Draw complete trail on export canvas
    if (mouseData.length > 1) {
      tempCtx.lineWidth = 2;
      tempCtx.lineCap = 'round';
      tempCtx.lineJoin = 'round';
      
      const currentTime = Date.now();
      
      // Draw ALL points for complete trail in export
      for (let i = 1; i < mouseData.length; i++) {
        const point = mouseData[i];
        const prevPoint = mouseData[i - 1];
        
        let color;
        switch (settings.colorMode) {
          case 'speed':
            color = getColorBySpeed(point.speed);
            break;
          case 'time':
            color = getColorByTime(point.timestamp, currentTime);
            break;
          case 'density':
            const density = i / mouseData.length;
            color = getColorByDensity(density);
            break;
          default:
            color = getColorBySpeed(point.speed);
        }
        
        tempCtx.strokeStyle = color;
        tempCtx.beginPath();
        tempCtx.moveTo(prevPoint.x, prevPoint.y);
        tempCtx.lineTo(point.x, point.y);
        tempCtx.stroke();
      }
    }
    
    // Draw all clicks
    const currentTime = Date.now();
    clicks.forEach(click => {
      tempCtx.strokeStyle = click.type === 'left' ? 'rgba(255, 0, 0, 0.8)' : 'rgba(0, 0, 255, 0.8)';
      tempCtx.lineWidth = 3;
      
      tempCtx.beginPath();
      tempCtx.arc(click.x, click.y, settings.clickRadius, 0, Math.PI * 2);
      tempCtx.stroke();
      
      tempCtx.fillStyle = click.type === 'left' ? 'rgba(255, 0, 0, 0.6)' : 'rgba(0, 0, 255, 0.6)';
      tempCtx.beginPath();
      tempCtx.arc(click.x, click.y, 3, 0, Math.PI * 2);
      tempCtx.fill();
    });
    
    // Convert to JPG and download
    tempCanvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mouse-tracking-complete-${Date.now()}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 'image/jpeg', 0.9);
  };

  const clearData = () => {
    setMouseData([]);
    setClicks([]);
    
    const heatmapCanvas = heatmapRef.current;
    if (heatmapCanvas) {
      const ctx = heatmapCanvas.getContext('2d');
      ctx.clearRect(0, 0, heatmapCanvas.width, heatmapCanvas.height);
    }
  };

  // CSS styles as an object
  const iconStyles = {
    width: '16px',
    height: '16px',
    display: 'inline-block',
    position: 'relative'
  };

  const PlayIcon = () => (
    <span 
      style={{
        ...iconStyles,
        '::before': {
          content: '""',
          position: 'absolute',
          left: '3px',
          top: '2px',
          width: '0',
          height: '0',
          borderLeft: '10px solid currentColor',
          borderTop: '6px solid transparent',
          borderBottom: '6px solid transparent'
        }
      }}
    >▶</span>
  );

  const PauseIcon = () => (
    <span style={iconStyles}>⏸</span>
  );

  const EyeIcon = () => (
    <span style={iconStyles}>👁</span>
  );

  const EyeOffIcon = () => (
    <span style={iconStyles}>🚫</span>
  );

  const DownloadIcon = () => (
    <span style={iconStyles}>⬇</span>
  );

  const TrashIcon = () => (
    <span style={iconStyles}>🗑</span>
  );

  return (
    <>
      {/* Bootstrap CSS CDN */}
      <link 
        href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.0/css/bootstrap.min.css" 
        rel="stylesheet" 
      />
      
      <div ref={containerRef} className="position-relative w-100 vh-100">
        {/* Control Panel */}
        {showControls && (
          <div 
            className="position-absolute card shadow-lg border-0"
            style={{
              top: '1rem',
              right: '1rem',
              zIndex: 50,
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(10px)'
            }}
          >
            <div className="card-body">
              <div className="d-flex flex-column gap-3">
                <div className="d-flex gap-2">
                  <button
                    onClick={() => setIsTracking(!isTracking)}
                    className={`btn btn-sm d-flex align-items-center gap-2 fw-medium ${
                      isTracking 
                        ? 'btn-danger' 
                        : 'btn-success'
                    }`}
                  >
                    {isTracking ? <PauseIcon /> : <PlayIcon />}
                    {isTracking ? 'Stop' : 'Start'} Tracking
                  </button>
                  
                  <button
                    onClick={() => setShowVisualization(!showVisualization)}
                    className="btn btn-primary btn-sm d-flex align-items-center gap-2"
                  >
                    {showVisualization ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
                
                <div className="d-flex gap-2">
                  <button
                    onClick={exportData}
                    className="btn btn-secondary btn-sm d-flex align-items-center gap-2"
                    style={{ backgroundColor: '#6f42c1', borderColor: '#6f42c1' }}
                  >
                    <DownloadIcon />
                    Export JPG
                  </button>
                  
                  <button
                    onClick={clearData}
                    className="btn btn-secondary btn-sm d-flex align-items-center gap-2"
                  >
                    <TrashIcon />
                    Clear
                  </button>
                </div>
                
                <div className="border-top pt-2">
                  <div className="small text-muted mb-2">Color Mode:</div>
                  <select 
                    value={settings.colorMode}
                    onChange={(e) => setSettings(prev => ({...prev, colorMode: e.target.value}))}
                    className="form-select form-select-sm"
                  >
                    <option value="speed">Speed</option>
                    <option value="time">Time</option>
                    <option value="density">Density</option>
                  </select>
                </div>
                
                <div className="small text-muted">
                  Points: {mouseData.length} | Clicks: {clicks.length}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Hidden toggle indicator - shows when controls are hidden */}
        {!showControls && (
          <div 
            className="position-absolute rounded px-2 py-1"
            style={{
              top: '1rem',
              right: '1rem',
              zIndex: 50,
              backgroundColor: 'rgba(0, 0, 0, 0.2)',
              backdropFilter: 'blur(10px)'
            }}
          >
            {/* <div className="small" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              Alt+H to toggle controls
            </div> */}
          </div>
        )}

        {/* Legend */}
        {showVisualization && (
          <div 
            className="position-absolute card shadow-lg border-0"
            style={{
              bottom: '1rem',
              left: '1rem',
              zIndex: 50,
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(10px)'
            }}
          >
            <div className="card-body p-3">
              <div className="small fw-medium mb-2">Legend</div>
              <div className="d-flex flex-column gap-1">
                <div className="d-flex align-items-center gap-2 small">
                  <div 
                    className="rounded"
                    style={{
                      width: '1rem',
                      height: '0.25rem',
                      background: 'linear-gradient(to right, #3b82f6, #ef4444)'
                    }}
                  ></div>
                  <span>Mouse Trail ({settings.colorMode})</span>
                </div>
                <div className="d-flex align-items-center gap-2 small">
                  <div 
                    className="rounded-circle"
                    style={{
                      width: '0.75rem',
                      height: '0.75rem',
                      border: '2px solid #ef4444'
                    }}
                  ></div>
                  <span>Left Clicks</span>
                </div>
                <div className="d-flex align-items-center gap-2 small">
                  <div 
                    className="rounded-circle"
                    style={{
                      width: '0.75rem',
                      height: '0.75rem',
                      border: '2px solid #3b82f6'
                    }}
                  ></div>
                  <span>Right Clicks</span>
                </div>
                <div className="d-flex align-items-center gap-2 small">
                  <div 
                    className="rounded"
                    style={{
                      width: '1rem',
                      height: '1rem',
                      background: 'linear-gradient(to right, #60a5fa, #4ade80, #f87171)',
                      opacity: 0.5
                    }}
                  ></div>
                  <span>Heat Map</span>
                </div>
                <div className="d-flex align-items-center gap-2 small text-muted">
                  <kbd className="px-1 py-0 bg-dark rounded small">Alt+H</kbd>
                  <span>Toggle Controls</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Heatmap Canvas */}
        {showVisualization && (
          <canvas
            ref={heatmapRef}
            className="position-absolute top-0 start-0"
            style={{ 
              mixBlendMode: 'multiply',
              width: '100%',
              height: '100%',
              pointerEvents: 'none',
              zIndex: 10
            }}
          />
        )}

        {/* Trail Canvas */}
        {showVisualization && (
          <canvas
            ref={canvasRef}
            className="position-absolute top-0 start-0"
            style={{
              width: '100%',
              height: '100%',
              pointerEvents: 'none',
              zIndex: 20
            }}
          />
        )}

        {/* App content */}
        <div className="position-relative" style={{ zIndex: 30 }}>
          {children || (
            <div className="p-4 h-100">
              <h1 className="display-4 fw-bold mb-4">Mouse Tracking Demo</h1>
              <p className="text-muted mb-4">
                Start tracking to see mouse movements, clicks, and heatmaps visualized in real-time.
                <br />
                <span className="small fw-medium">Press <kbd className="px-1 py-0 bg-light rounded small">Alt+H</kbd> to toggle the control panel.</span>
              </p>
              <div className="row g-4 mb-4">
                <div className="col-md-6">
                  <div className="p-4 rounded" style={{ backgroundColor: '#dbeafe' }}>
                    <h2 className="h5 fw-semibold mb-2">Trail Visualization</h2>
                    <p className="small text-muted">
                      Real-time mouse movement trails with color-coded speed, time, or density.
                    </p>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="p-4 rounded" style={{ backgroundColor: '#dcfce7' }}>
                    <h2 className="h5 fw-semibold mb-2">Click Patterns</h2>
                    <p className="small text-muted">
                      Visual feedback for left/right clicks with ripple effects.
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-4 rounded" style={{ backgroundColor: '#fecaca' }}>
                <h2 className="h5 fw-semibold mb-2">Heat Maps</h2>
                <p className="small text-muted">
                  Density-based visualization showing areas of high mouse activity.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default MouseTracker;