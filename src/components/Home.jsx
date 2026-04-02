import { useState, useEffect, useRef } from "react";
import { GoogleMap, LoadScript, OverlayView } from "@react-google-maps/api";
import InfoBox from "./InfoBox";
import { FaUndo, FaPalette } from "react-icons/fa";
import markersData from "./MarkersInfo";
import TrackerTableHome from "./TrackerTableHome";
const API_KEY = process.env.REACT_APP_GRAPHHOPPER_KEY;
function Home() {
  const containerstyle = {
    height: "100vh",
    width: "100%",
    position: "relative",
  };
  const MAX_LAT = 85.05112878;
  function clampLatLngValues(lat, lng) {
    return {
      lat: Math.max(-MAX_LAT, Math.min(MAX_LAT, lat)),
      lng: lng,
    };
  }
  const mapRef = useRef(null);
  const overlayViewRef = useRef({});
  const [mapCenter, setMapCenter] = useState({ lat: 20.5937, lng: 78.9629 });
  const [zoom, setZoom] = useState(2);
  const didDivDrag = useRef(false);
  const divDragOffset = useRef({ x: 0, y: 0 });
  const [Divdragging, setDivDragging] = useState(false);
  const [divPosition, setDivPosition] = useState({
    top: window.innerHeight - 200,
    left: 16,
  });
  const [markerDragging, setMarkerDragging] = useState(false);
  const didMarkerDrag = useRef(false);
  const markerDragOffset = useRef({ x: 0, y: 0 });
  const infoBoxRef = useRef(null);
  const animationRef = useRef({});
  const startLatLngRef = useRef({});
  const targetLatLngRef = useRef({});
  const polylineRef = useRef({});
  // const [colorPicker, setColorPicker] = useState("#b93f3f");
  // const colorPickerRef = useRef(null);
  const angleRef = useRef({});
  const [markers, setMarkers] = useState(
    markersData.map((m, idx) => ({
      ...m,
      index: idx,
      position: {
        lat: m.lat,
        lng: m.lng,
      },
      angle: 0,
      selected: false,
      path: null,
      animating: false,
      showReverse: false,
      showInfo: false,
    }))
  );
  const [latInput, setLatInput] = useState(20.5937);
  const [lngInput, setLngInput] = useState(78.9629);
  const [activeMarkerId, setActiveMarkerId] = useState(null);

  const HandleMapClick = (event) => {
    const marker = markers.find((m) => m.id === activeMarkerId);
    if (!marker) return;
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();
    const clamped = clampLatLngValues(lat, lng);
    startLatLngRef.current[marker.id] = marker.position;
    targetLatLngRef.current[marker.id] = clamped;
    if (animationRef.current[marker.id]) {
      cancelAnimationFrame(animationRef.current[marker.id]);
      animationRef.current[marker.id] = null;
    }
    setLatInput(clamped.lat);
    setLngInput(clamped.lng);
    markerWay(marker.id, clamped);
  };

  async function markerWay(markerId, target) {
    if (markerId !== activeMarkerId) return;
    const marker = markers.find((m) => m.id === markerId);
    if (!marker) return;
    const start = marker.position;
    if (!target) return;
    if (animationRef.current[markerId]) {
      cancelAnimationFrame(animationRef.current[markerId]);
      animationRef.current[markerId] = null;
    }
    const url = `https://graphhopper.com/api/1/route?point=${start.lat},${start.lng}&point=${target.lat},${target.lng}&vehicle=car&points_encoded=false&key=${API_KEY}`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        alert("Failed to fetch route. Please try again.");
        return;
      }

      const data = await response.json();
      if (!data.paths || data.paths.length === 0) {
        alert("Route not found. Please select another location.");
        return;
      }

      const coordinatesInLngLat = data.paths[0].points.coordinates;
      if (!coordinatesInLngLat) return;
      const path = coordinatesInLngLat.map((coord) => ({
        lat: coord[1],
        lng: coord[0],
      }));
      setMarkers((prev) =>
        prev.map((m) =>
          m.id === markerId
            ? { ...m, path: path } // store the path directly
            : m
        )
      );
      polyline(markerId, path);
      animateMarker(markerId, path);
    } catch (err) {
      console.error("Route error for marker:", marker.id, err);
      alert("Route error. Please try another location.");
    }
  }
  function animateMarker(id, path) {
    if (animationRef.current[id]) {
      cancelAnimationFrame(animationRef.current[id]);
    }
    if (!path || path.length === 0) return;
    if (!angleRef.current[id]) angleRef.current[id] = 0;
    setMarkers((prev) =>
      prev.map((m) =>
        m.id === id ? { ...m, showReverse: false, showInfo: false } : m
      )
    );
    let index = 0;
    const speed = 4;

    function animate() {
      if (id !== activeMarkerId) {
        cancelAnimationFrame(animationRef.current[id]);
        animationRef.current[id] = null;
        return;
      }
      if (index < path.length - 1) {
        const current = path[Math.floor(index)];
        const lookAhead = Math.min(
          Math.floor(speed) + 25,
          path.length - 1 - Math.floor(index)
        );

        const next = path[Math.floor(index) + lookAhead];

        const deltaLat = next.lat - current.lat;
        const deltaLng = next.lng - current.lng;

        const pointAngle = Math.atan2(deltaLng, deltaLat);
        const angDeg = pointAngle * (180 / Math.PI) - 90;

        let delta = angDeg - angleRef.current[id];

        if (delta > 180) delta -= 360;
        if (delta < -180) delta += 360;

        angleRef.current[id] += delta * 0.12;

        setMarkers((prev) =>
          prev.map((m) =>
            m.id === id
              ? {
                  ...m,
                  position: current,
                  angle: angleRef.current[id],
                }
              : m
          )
        );

        index += speed;

        animationRef.current[id] = requestAnimationFrame(animate);
      } else {
        animationRef.current[id] = null;

        setMarkers((prev) =>
          prev.map((m) =>
            m.id === id
              ? { ...m, position: path[path.length - 1], showReverse: true }
              : m
          )
        );
      }
    }

    animate();
  }
  function reverseAnimateMarker(id, path) {
    if (animationRef.current[id]) {
      cancelAnimationFrame(animationRef.current[id]);
      animationRef.current[id] = null;
    }
    if (!path || path.length === 0) return;
    let index = path.length - 1;
    const speed = 4;
    function animate() {
      if (id !== activeMarkerId) {
        cancelAnimationFrame(animationRef.current[id]);
        animationRef.current[id] = null;
        return;
      }
      setMarkers((prev) =>
        prev.map((m) => (m.id === id ? { ...m, showReverse: false } : m))
      );

      if (index > 0) {
        const currentIndex = Math.floor(index);
        const current = path[currentIndex];

        const lookBehind = Math.min(speed + 25, currentIndex);
        const prev = path[currentIndex - lookBehind];

        const deltaLat = prev.lat - current.lat;
        const deltaLng = prev.lng - current.lng;

        const pointAngle = Math.atan2(deltaLng, deltaLat);
        const angDeg = pointAngle * (180 / Math.PI) - 90;

        let delta = angDeg - angleRef.current[id];

        if (delta > 180) delta -= 360;
        if (delta < -180) delta += 360;

        angleRef.current[id] += delta * 0.12;

        setMarkers((prev) =>
          prev.map((m) =>
            m.id === id
              ? {
                  ...m,
                  position: current,
                  angle: angleRef.current[id],
                }
              : m
          )
        );

        index -= speed;

        animationRef.current[id] = requestAnimationFrame(animate);
      } else {
        animationRef.current[id] = null;
        setMarkers((prev) =>
          prev.map((m) =>
            m.id === id ? { ...m, position: path[0], showReverse: false } : m
          )
        );

        if (polylineRef.current[id]) {
          polylineRef.current[id].setMap(null);
          polylineRef.current[id] = null;
        }
      }
    }

    animate();
  }
  function polyline(id, routepath) {
    if (polylineRef.current[id]) {
      polylineRef.current[id].setMap(null);
      polylineRef.current[id] = null;
    }
    const marker = markers.find((m) => m.id == id);
    if (!marker) return;
    if (!mapRef.current) return;
    const line = new window.google.maps.Polyline({
      path: routepath,
      strokeColor: marker.color,
      strokeOpacity: 1.0,
      strokeWeight: 7,
    });

    line.setMap(mapRef.current);
    polylineRef.current[id] = line;
  }
  // function polylineColor() {
  //     colorPickerRef.current.click();
  // }
  const HandleGoClick = () => {
    if (lngInput < -180 || lngInput > 180) {
      alert("Longitude out of range");
      return;
    }
    const clamped = clampLatLngValues(latInput, lngInput);
    setMarkers((prevMarkers) =>
      prevMarkers.map(
        (marker) =>
          (marker.id = activeMarkerId
            ? { ...marker, position: clamped }
            : marker)
      )
    );
  };
  const HandleLatChange = (event) => {
    setLatInput(parseFloat(event.target.value));
  };
  const HandleLngChange = (event) => {
    setLngInput(parseFloat(event.target.value));
  };
  const handleMarkerMouseDown = (e, id) => {
    if (id != activeMarkerId) return;
    const marker = markers.find((m) => m.id === id);
    if (!marker) return;
    didMarkerDrag.current = false;
    setMarkerDragging(true);
    setMarkers((prev) =>
      prev.map((m) => ({
        ...m,
        showInfo: false,
      }))
    );
    e.preventDefault();
    e.stopPropagation();
    const mapDiv = mapRef.current.getDiv();
    const rect = mapDiv.getBoundingClientRect();
    const projection = overlayViewRef.current[id]?.getProjection();
    if (!projection) return;

    const markerPoint = projection.fromLatLngToDivPixel(
      new window.google.maps.LatLng(marker.position.lat, marker.position.lng)
    );
    markerDragOffset.current = {
      x: e.clientX - rect.left - markerPoint.x,
      y: e.clientY - rect.top - markerPoint.y,
    };
  };
  const HandleMarkerDragMove = (e) => {
    if (!markerDragging || !activeMarkerId) return;
    didMarkerDrag.current = true;
    const overlay = overlayViewRef.current[activeMarkerId];
    if (!overlay || !mapRef) return;
    const projection = overlay.getProjection();
    if (!projection) return;
    const mapDiv = mapRef.current.getDiv();
    const rect = mapDiv.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    // ===== AUTO PAN LOGIC =====
    const EDGE_THRESHOLD = 30; // px
    const PAN_SPEED = 8; // px per frame
    let panX = 0;
    let panY = 0;

    if (mouseX < EDGE_THRESHOLD) panX = -PAN_SPEED;
    else if (mouseX > rect.width - EDGE_THRESHOLD) panX = PAN_SPEED;

    if (mouseY < EDGE_THRESHOLD) panY = -PAN_SPEED;
    else if (mouseY > rect.height - EDGE_THRESHOLD) panY = PAN_SPEED;

    if (panX || panY) mapRef.current.panBy(panX, panY);

    // ===== END AUTO PAN =====

    const point = new window.google.maps.Point(
      mouseX - markerDragOffset.current.x,
      mouseY - markerDragOffset.current.y
    );
    const latLng = projection.fromDivPixelToLatLng(point);
    if (!latLng) return;
    setMarkers((prev) =>
      prev.map((m) =>
        m.id === activeMarkerId
          ? { ...m, position: { lat: latLng.lat(), lng: latLng.lng() } }
          : m
      )
    );
    setLatInput(latLng.lat());
    setLngInput(latLng.lng());
  };
  const handleMarkerMouseUp = () => {
    setMarkerDragging(false);
    didMarkerDrag.current = false;
  };
  useEffect(() => {
    if (!markerDragging) return;

    window.addEventListener("mousemove", HandleMarkerDragMove);
    window.addEventListener("mouseup", handleMarkerMouseUp);

    return () => {
      window.removeEventListener("mousemove", HandleMarkerDragMove);
      window.removeEventListener("mouseup", handleMarkerMouseUp);
    };
  }, [markerDragging]);
  const HandleDivDragStart = (e) => {
    didDivDrag.current = false;
    setDivDragging(true);
    e.preventDefault();
    e.stopPropagation();

    divDragOffset.current = {
      x: e.clientX - divPosition.left,

      y: e.clientY - divPosition.top,
    };
  };
  const divWidth = 300;
  const divHeight = 200;
  // i am uisng div width and height so my div can stay within the window i dont want that to croose the boudries
  const handleDivDragMove = (e) => {
    if (!Divdragging) return;
    didDivDrag.current = true;
    const newLeft = Math.max(
      0,
      Math.min(
        window.innerWidth - divWidth,
        e.clientX - divDragOffset.current.x
      )
    );
    const newTop = Math.max(
      0,
      Math.min(
        window.innerHeight - divHeight,
        e.clientY - divDragOffset.current.y
      )
    );

    setDivPosition({ top: newTop, left: newLeft });
  };
  const handleDivDragEnd = () => {
    setDivDragging(false);
  };
  useEffect(() => {
    if (!Divdragging) return;

    window.addEventListener("mousemove", handleDivDragMove);
    window.addEventListener("mouseup", handleDivDragEnd);

    return () => {
      window.removeEventListener("mousemove", handleDivDragMove);
      window.removeEventListener("mouseup", handleDivDragEnd);
    };
  }, [Divdragging]);
  function getMarkerSize(zoom) {
    const defaultZoom = 8; // medium marker at zoom 8
    const defaultSize = 100; // medium size
    const minSize = 30;
    const maxSize = 120;

    const scale = 1 + (zoom - defaultZoom) * 0.1; // adjust speed
    let size = defaultSize * scale;

    size = Math.min(Math.max(size, minSize), maxSize);
    return { width: size, height: "auto" };
  }
  const markerSize = getMarkerSize(zoom);
  const HandleReset = () => {
    const reset = { lat: 20.5937, lng: 78.9629 };
    Object.keys(animationRef.current).forEach((id) => {
      cancelAnimationFrame(animationRef.current[id]);
      animationRef.current[id] = null;
    });
    Object.keys(polylineRef.current).forEach((id) => {
      if (polylineRef.current[id]) {
        polylineRef.current[id].setMap(null);
        polylineRef.current[id] = null;
      }
    });
    setMapCenter(reset);
    setLatInput(reset.lat);
    setLngInput(reset.lng);

    setZoom(2);
  };
  const panMapForInfoBox = () => {
    if (!mapRef.current || !infoBoxRef.current) return;

    const map = mapRef.current;
    const mapRect = map.getDiv().getBoundingClientRect();
    const infoRect = infoBoxRef.current.getBoundingClientRect();

    const padding = 20;

    const overflowRight = infoRect.right - mapRect.right;
    const overflowLeft = mapRect.left - infoRect.left;
    const overflowBottom = infoRect.bottom - mapRect.bottom;
    const overflowTop = mapRect.top - infoRect.top;
    let dx = 0;
    let dy = 0;
    if (overflowRight > 0) {
      dx = overflowRight + padding;
    } else if (overflowLeft > 0) {
      dx = -(overflowLeft + padding);
    }
    if (overflowBottom > 0) {
      dy = overflowBottom + padding;
    } else if (overflowTop > 0) {
      dy = -(overflowTop + padding);
    }
    if (dx !== 0 || dy !== 0) {
      mapRef.current.panBy(dx, dy);
    }
  };
  const handleRowClick = (id) => {
    console.log(id);
    const marker = markers.find((m) => m.id === id);
    const isDeselecting = activeMarkerId === id;
    stopAllMarkersRow(markers);
    setMarkers((prev) =>
      prev.map((m) => {
        if (m.id === id) {
          return { ...m, showInfo: false };
        } else if (m.id === activeMarkerId) {
          if (m.selected) {
            return { ...m, showInfo: false };
          } else {
            return { ...m, path: [], showInfo: false };
          }
        } else {
          return { ...m, showInfo: false };
        }
      })
    );

    setActiveMarkerId(isDeselecting ? null : id);
    if (isDeselecting) {
      setLatInput(20.5937);
      setLngInput(78.9629);
    } else {
      setLatInput(marker.position.lat);
      setLngInput(marker.position.lng);
      setMapCenter({ lat: marker.position.lat, lng: marker.position.lng });
    }

    setMarkerDragging(false);
    didMarkerDrag.current = false;
  };
  const lastSelectedIndexRef = useRef(null);
  const handleTrackerSelect = (id, checked, event) => {
    const isActive = activeMarkerId === id;

    if (!checked && !isActive) {
      if (animationRef.current[id]) {
        cancelAnimationFrame(animationRef.current[id]);
        animationRef.current[id] = null;
      }
      if (polylineRef.current[id]) {
        polylineRef.current[id].setMap(null);
        polylineRef.current[id] = null;
      }
    }

    setMarkers((prev) => {
      const currentIndex = prev.findIndex((m) => m.id === id);
      let startIndex = lastSelectedIndexRef.current;
      if (startIndex === null) {
        const lastSelected = prev
          .map((m, idx) => (m.selected ? idx : -1))
          .filter((idx) => idx !== -1)
          .pop();

        startIndex = lastSelected ?? currentIndex;
      }
      if (event?.shiftKey) {
        let start = startIndex;
        let end = currentIndex;
        if (start > end) [start, end] = [end, start];
        const updated = prev.map((m, idx) => {
          if (idx >= start && idx <= end) {
            return { ...m, selected: checked };
          }
          return m;
        });
        if (!checked && activeMarkerId !== null) {
          if (currentIndex >= start && currentIndex <= end) {
            if (activeMarkerId !== id) {
              setActiveMarkerId(null);
            }
          }
        }
        lastSelectedIndexRef.current = currentIndex;
        return updated;
      }
      lastSelectedIndexRef.current = currentIndex;
      return prev.map((m) => (m.id === id ? { ...m, selected: checked } : m));
    });
  };
  const stopAllMarkers = () => {
    Object.keys(animationRef.current).forEach((id) => {
      if (animationRef.current[id]) {
        cancelAnimationFrame(animationRef.current[id]);
        animationRef.current[id] = null;
      }
    });
    markers.forEach((m) => {
      if (!m.selected && polylineRef.current[m.id]) {
        polylineRef.current[m.id].setMap(null);
        polylineRef.current[m.id] = null;
      }
    });
  };
  const stopAllMarkersRow = () => {
    Object.keys(animationRef.current).forEach((id) => {
      if (animationRef.current[id]) {
        cancelAnimationFrame(animationRef.current[id]);
        animationRef.current[id] = null;
      }
    });

    markers.forEach((m) => {
      if (!m.selected && polylineRef.current[m.id]) {
        polylineRef.current[m.id].setMap(null);
        polylineRef.current[m.id] = null;
      }
    });
  };
  return (
    <div style={{ display: "flex" }}>
      <TrackerTableHome
        markers={markers}
        onRowClick={handleRowClick}
        activeMarkerId={activeMarkerId}
        onTrackerSelect={handleTrackerSelect}
      />
      <div style={{ width: "75%" }}>
        <LoadScript googleMapsApiKey="">
          <GoogleMap
            mapContainerStyle={containerstyle}
            center={mapCenter}
            zoom={zoom}
            onClick={(e) => {
              setMarkers((prev) =>
                prev.map((m) => ({
                  ...m,
                  showInfo: false,
                }))
              );
              HandleMapClick(e);
            }}
            onDblClick={() => {
              setMarkers((prev) =>
                prev.map((m) => ({
                  ...m,
                  showInfo: false,
                }))
              );
            }}
            onLoad={(map) => {
              mapRef.current = map; //store map instant in useref box
            }}
            onZoomChanged={() => {
              if (mapRef.current) {
                setZoom(mapRef.current.getZoom());
              }
            }}
          >
            {markers.map(
              (marker) =>
                (marker.selected || marker.id === activeMarkerId) && (
                  <OverlayView
                    key={marker.id}
                    position={marker.position}
                    mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
                    onLoad={(overlay) => {
                      overlayViewRef.current[marker.id] = overlay;
                    }}
                  >
                    <div
                      style={{
                        transform: `translate(-50%, -50%) rotate(${marker.angle}deg)`,
                        pointerEvents: "auto",
                        transition: "width 0.2s, height 0.2s",
                        width: markerSize.width + "px",
                        height: markerSize.height + "px",
                      }}
                      onMouseDown={(e) => handleMarkerMouseDown(e, marker.id)}
                      onClick={(e) => {
                        e.stopPropagation();
                        stopAllMarkers();

                        setActiveMarkerId(marker.id);
                        if (didMarkerDrag.current) return;
                        setMarkers((prev) =>
                          prev.map(
                            (m) =>
                              m.id === marker.id
                                ? { ...m, showInfo: true }
                                : { ...m, showInfo: false } // optional (single open)
                          )
                        );
                        requestAnimationFrame(() => {
                          requestAnimationFrame(() => {
                            panMapForInfoBox();
                          });
                        });
                      }}
                    >
                      <img
                        src={marker.image}
                        alt=""
                        style={{
                          width: "100%",
                          height: "100%",
                          cursor: "pointer",
                        }}
                        draggable={false}
                      />

                      {marker.showReverse && (
                        <span
                          className="bg-success text-light  d-inline-flex justify-content-center align-items-center rounded-circle"
                          onClick={(e) => {
                            e.stopPropagation();
                            reverseAnimateMarker(marker.id, marker.path);
                          }}
                          style={{
                            width: "28px",
                            height: "28px",
                            cursor: "pointer",
                          }}
                        >
                          <FaUndo size={13} />
                        </span>
                      )}
                    </div>
                  </OverlayView>
                )
            )}

            {markers.map(
              (marker) =>
                marker.showInfo && (
                  <OverlayView
                    key={marker.id}
                    position={marker.position}
                    mapPaneName={OverlayView.FLOAT_PANE}
                  >
                    <div
                      ref={infoBoxRef}
                      style={{
                        position: "absolute",
                        left: "5px",
                        bottom: "100%",
                        marginBottom: "12px",
                      }}
                    >
                      <InfoBox
                        lat={marker.position.lat}
                        lng={marker.position.lng}
                        onClose={() => {
                          setMarkers((prev) =>
                            prev.map((m) =>
                              m.id === marker.id ? { ...m, showInfo: false } : m
                            )
                          );
                        }}
                      />
                    </div>
                  </OverlayView>
                )
            )}
            <div
              className="position-absolute"
              style={{
                width: "250px",
                left: divPosition.left,
                top: divPosition.top,
              }}
            >
              <div
                className="card text-light shadow-lg"
                style={{ backgroundColor: "#2e2f33ff" }}
              >
                <div
                  className="card-header  bg-transparent border-bottom "
                  style={{
                    cursor: "move",
                  }}
                  onMouseDown={HandleDivDragStart}
                >
                  <span
                    className="fw-semibold text-uppercase "
                    style={{ color: "#22d3ee", fontSize: "1rem" }}
                  >
                    Search Lat & Lng
                  </span>
                  {/* <>
                                        <input type="color" style={{ display: "none" }} value={colorPicker} ref={colorPickerRef} onChange={(e) => {
                                            const newColor = e.target.value;
                                            setColorPicker(newColor);
                                            if (polylineRef.current) {
                                                polylineRef.current.setOptions({ strokeColor: newColor });
                                            }
                                        }} />
                                    </> */}
                  {/* <span onClick={polylineColor} onMouseDown={(e) => { e.stopPropagation() }} style={{ cursor: "pointer" }}
                                        className=" ms-3"><FaPalette></FaPalette></span>
                                */}
                  <span className="ms-3">
                    <img
                      src="https://icons.iconarchive.com/icons/icons8/ios7/128/Maps-Center-Direction-icon.png"
                      style={{
                        width: "25px",
                        height: "25px",
                        cursor: "pointer",
                      }}
                      onMouseDown={(e) => {
                        e.stopPropagation();
                      }}
                      onClick={() => {
                        setMapCenter({ lat: latInput, lng: lngInput });
                      }}
                      draggable={false}
                    />
                  </span>
                </div>{" "}
                <div className="card-body px-3 py-2">
                  <div className="mb-2">
                    <div className="input-group input-group-sm">
                      <span
                        className="input-group-text "
                        style={{ width: "45px" }}
                      >
                        Lat
                      </span>
                      <input
                        type="number"
                        className="form-control"
                        placeholder="Latitude"
                        value={latInput}
                        onChange={HandleLatChange}
                      />
                    </div>
                  </div>
                  <div className="mb-3">
                    <div className="input-group input-group-sm">
                      <span
                        className="input-group-text "
                        style={{ width: "45px" }}
                      >
                        Lng
                      </span>
                      <input
                        type="number"
                        className="form-control"
                        placeholder="Longitude"
                        value={lngInput}
                        onChange={HandleLngChange}
                      />
                    </div>
                  </div>
                  <div className="input-group input-group-sm">
                    <button
                      className="btn btn-primary w-50"
                      onClick={HandleGoClick}
                    >
                      Go
                    </button>
                    <button
                      className="btn btn-outline-light w-50"
                      onClick={HandleReset}
                    >
                      Reset
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </GoogleMap>
        </LoadScript>
      </div>
    </div>
  );
}
export default Home;
