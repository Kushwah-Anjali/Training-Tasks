import React, { useState } from "react";
import { GoogleMap, LoadScript, OverlayView } from "@react-google-maps/api";
import markerImg from "../assets/marker.png";
function GoogleMapTask() {
  const mapContainer = {
    height: "100vh",
    width: "100%",
    position: "relative",
  };
  const [latInput, setLatInput] = useState(20.5937);
  const [lngInput, setLngInput] = useState(78.9629);
  const [center, setCenter] = useState({ lat: 20.5937, lng: 78.9629 });
  const [markerPosition, setMarkerPosition] = useState({
    lat: 20.5937,
    lng: 78.9629,
  });
  const handleMapClick = (e) => {
    setMarkerPosition({
      lat: e.latLng.lat(),
      lng: e.latLng.lng(),
    });
    setLatInput(e.latLng.lat());
    setLngInput(e.latLng.lng());
  };
  const handleGoClick = () => {
    if (isNaN(latInput) || isNaN(lngInput)) return;
    setCenter({ lat: latInput, lng: lngInput });
    setMarkerPosition({ lat: latInput, lng: lngInput });
  };
  const handleResetClick = () => {
    setLatInput(20.5937);
    setLngInput(78.9629);
    setCenter({ lat: 20.5937, lng: 78.9629 });
    setMarkerPosition({ lat: 20.5937, lng: 78.9629 });
  };
  return (
    <div>
      <div
        className="container"
        style={{
          maxWidth: "320px",
          position: "absolute",
          zIndex: 1,
          marginTop: "30%",
        }}
      >
        <div className="card bg-dark text-light shadow">
          <div className="card-body">
            <div className="card-header bg-secondary text-light">
              Go to Location
            </div>
            <div className="d-flex align-items-center gap-2 mb-2 mt-2">
              <label className="form-label mb-0" style={{ width: "80px" }}>
                Latitude
              </label>
              <input
                type="number"
                className="form-control bg-dark text-light border-secondary"
                style={{ flex: 1 }}
                value={latInput}
                onChange={(e) => setLatInput(parseFloat(e.target.value))}
              />
            </div>

            <div className="d-flex align-items-center gap-2 mb-2">
              <label className="form-label mb-0" style={{ width: "80px" }}>
                Longitude
              </label>
              <input
                type="number"
                className="form-control bg-dark text-light border-secondary"
                style={{ flex: 1 }}
                value={lngInput}
                onChange={(e) => setLngInput(parseFloat(e.target.value))}
              />
            </div>

            <div className="d-flex gap-2">
              <button className="btn btn-primary" onClick={handleGoClick}>
                Go
              </button>
              <button
                className="btn btn-outline-light"
                onClick={handleResetClick}
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>

      <LoadScript googleMapsApiKey="">
        <GoogleMap
          onClick={handleMapClick}
          mapContainerStyle={mapContainer}
          center={center}
          zoom={2}
        >
          <OverlayView
            position={markerPosition}
            mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
          >
            <div>
              <img
                src={markerImg}
                alt=""
                style={{ height: "20px", transform: "translate(-50%, -50%)" }}
              />
            </div>
          </OverlayView>
        </GoogleMap>
      </LoadScript>
    </div>
  );
}
export default GoogleMapTask;
