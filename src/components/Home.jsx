import { useState, useEffect, useRef } from "react";
import { GoogleMap, LoadScript, OverlayView } from "@react-google-maps/api";
import InfoBox from "./InfoBox";
import MarkerImg from "../assets/marker.png";
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
  const overlayViewRef = useRef(null);
  const [mapCenter, setMapCenter] = useState({ lat: 20.5937, lng: 78.9629 });
  const [latInput, setLatInput] = useState(20.5937);
  const [lngInput, setLngInput] = useState(78.9629);
  const [showInfo, setShowInfo] = useState(false);
  const [zoom, setZoom] = useState(2);
  const didDivDrag = useRef(false);
  const [divDragging, setDivDragging] = useState(false);
  const [divPosition, setDivPosition] = useState({
    top: window.innerHeight - 200,
    left: 16,
  });
  const divDragOffset = useRef({ x: 0, y: 0 });
  const didMarkerDrag = useRef(false);
  const [markerDragging, setMarkerDragging] = useState(false);
  const [markerPosition, setMarkerPosition] = useState({
    lat: 20.5937,
    lng: 78.9629,
  });
  const markerDragOffset = useRef({ x: 0, y: 0 });
  const infoBoxRef = useRef(null);
  const HandleMapClick = (event) => {
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();
    const clamped = clampLatLngValues(lat, lng);
    setMarkerPosition(clamped);
    setLatInput(clamped.lat);
    setLngInput(clamped.lng);
  };

  const HandleGoClick = () => {
    if (lngInput < -180 || lngInput > 180) {
      alert("Longitude out of range");
      return;
    }
    const clamped = clampLatLngValues(latInput, lngInput);
    setMapCenter(clamped);
    setMarkerPosition(clamped);
  };
  const HandleLatChange = (event) => {
    setLatInput(parseFloat(event.target.value));
  };
  const HandleLngChange = (event) => {
    setLngInput(parseFloat(event.target.value));
  };
  const handleMarkerMouseDown = (e) => {
    didMarkerDrag.current = false;
    setMarkerDragging(true);
    setShowInfo(false);
    e.preventDefault();
    e.stopPropagation();
    const mapDiv = mapRef.current.getDiv();
    const rect = mapDiv.getBoundingClientRect();
    const projection = overlayViewRef.current.getProjection();
    if (!projection) return;
    const markerPoint = projection.fromLatLngToDivPixel(
      new window.google.maps.LatLng(markerPosition.lat, markerPosition.lng)
    );
    markerDragOffset.current = {
      x: e.clientX - rect.left - markerPoint.x,
      y: e.clientY - rect.top - markerPoint.y,
    };
  };
  const HandleMarkerDragMove = (e) => {
    if (!markerDragging) return;
    didMarkerDrag.current = true;

    if (!overlayViewRef.current || !mapRef.current) return;
    const projection = overlayViewRef.current.getProjection();
    if (!projection) return;
    const map = mapRef.current;
    const mapDiv = map.getDiv();
    const rect = mapDiv.getBoundingClientRect();
    // Mouse position inside map
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

    if (panX !== 0 || panY !== 0) {
      map.panBy(panX, panY);
    }
    // ===== END AUTO PAN =====

    const point = new window.google.maps.Point(
      mouseX - markerDragOffset.current.x,
      mouseY - markerDragOffset.current.y
    );
    const latLng = projection.fromDivPixelToLatLng(point);
    if (!latLng) return;

    setMarkerPosition({
      lat: latLng.lat(),
      lng: latLng.lng(),
    });

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
    if (!divDragging) return;
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
    if (!divDragging) return;

    window.addEventListener("mousemove", handleDivDragMove);
    window.addEventListener("mouseup", handleDivDragEnd);

    return () => {
      window.removeEventListener("mousemove", handleDivDragMove);
      window.removeEventListener("mouseup", handleDivDragEnd);
    };
  }, [divDragging]);

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
    setMarkerPosition(reset);
    setMapCenter(reset);
    setLatInput(20.5937);
    setLngInput(78.9629);
    setZoom(2);
  };

  const panMapForInfoBox = () => {
    if (!mapRef.current || !infoBoxRef.current) return;

    const mapRect = mapRef.current.getDiv().getBoundingClientRect();
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

  return (
    <div>
      <LoadScript googleMapsApiKey="">
        <GoogleMap
          mapContainerStyle={containerstyle}
          center={mapCenter}
          zoom={zoom}
          onClick={(e) => {
            setShowInfo(false);
            HandleMapClick(e);
          }}
          onDblClick={() => {
            setShowInfo(false);
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
          <OverlayView
            position={markerPosition}
            mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
            onLoad={(overlay) => {
              overlayViewRef.current = overlay;
            }}
          >
            <div
              style={{
                transform: `translate(-92%, -50%)`,
                pointerEvents: "auto",
                transition: "width 0.2s, height 0.2s",
                width: markerSize.width + "px",
                height: markerSize.height + "px", // smooth resizing
              }}
              onMouseDown={handleMarkerMouseDown}
              onClick={(e) => {
                e.stopPropagation(); // prevent map click
                if (didMarkerDrag.current) return;
                setShowInfo(true);
                requestAnimationFrame(() => {
                  requestAnimationFrame(() => {
                    panMapForInfoBox();
                  });
                });
              }}
            >
              <img
                src={MarkerImg}
                alt=""
                style={{
                  width: "100%",
                  heightow: "100%",
                  cursor: "pointer",
                  transition: "width 0.2s, height 0.2s", // extra safety
                }}
                draggable={false}
              />
              {/* <span className="bg-danger text-light px-2 py-1 rounded small">
                            Location
                        </span>  */}
            </div>
          </OverlayView>
          {showInfo && (
            <OverlayView
              position={markerPosition}
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
                  lat={markerPosition.lat}
                  lng={markerPosition.lng}
                  onClose={() => setShowInfo(false)}
                />
              </div>
            </OverlayView>
          )}
          <div
            className="position-absolute"
            style={{
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
              </div>
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
  );
}

export default Home;
