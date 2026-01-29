import {
  GoogleMap,
  LoadScript,
  Marker,
  OverlayView,
} from "@react-google-maps/api";
import { useState } from "react";
import MarkerImg from "../assets/marker.png";
function GoogleMapTask() {
  const mapcontainer = {
    height: "450px",
    width: "100%",
  };
  const [latInput, setLatInput] = useState(20.5937);
  const [lngInput, setLngInput] = useState(78.9629);
  const [center, setCenter] = useState({
    lat: latInput,
    lng: lngInput,
  });
  const [markerPosition, setMarkerPosition] = useState({
    lat: latInput,
    lng: lngInput,
  });
  const handleLatChange = (e) => {
    const lat = parseFloat(e.target.value);
    setLatInput(lat);
  };
  const handleLngChange = (e) => {
    const lng = parseFloat(e.target.value);
    setLngInput(lng);
  };
  const handleGoClick = () => {
    if (isNaN(latInput) || isNaN(lngInput)) {
      alert("Please enter valid latitude and longitude values.");
      return;
    } else if (latInput < -85 || latInput > 85) {
      alert("Latitude must be between -85 and 85.");
      return;
    } else if (lngInput < -180 || lngInput > 180) {
      alert("Longitude must be between -180 and 180.");
      return;
    }
    const lat = parseFloat(latInput);
    const lng = parseFloat(lngInput);
    setMarkerPosition({ lat: lat, lng: lng });
    setCenter({ lat: lat, lng: lng });
  };
  const handleMapClick = (e) => {
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    setLatInput(lat);
    setLngInput(lng);
    // setCenter({ lat: lat, lng: lng });
    setMarkerPosition({ lat: lat, lng: lng });
  };
  const handleResetClick = () => {
    setLatInput(20.5937);
    setLngInput(78.9629);
    setCenter({ lat: 20.5937, lng: 78.9629 });
    setMarkerPosition({ lat: 20.5937, lng: 78.9629 });
  };
  return (
    <div>
      <h1>Google Map Task </h1>
      <input type="number" value={latInput} onChange={handleLatChange} />
      <input type="number" value={lngInput} onChange={handleLngChange} />
      <button onClick={handleGoClick}>Go</button>
      <button onClick={handleResetClick}>Reset</button>
      <LoadScript googleMapsApiKey="">
        <GoogleMap
          mapContainerStyle={mapcontainer}
          zoom={2}
          center={center}
          onClick={handleMapClick}
        >
          {/* <Marker position={markerPosition}></Marker>  */}
          <OverlayView
            position={markerPosition}
            mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
          >
            <div>
              <img
                src={MarkerImg}
                alt="Marker"
                style={{
                  cursor: "pointer",
                  height: "20px",
                  width: "50px",
                  transform: "translate(-50%, -50%)",
                }}
              />
            </div>
          </OverlayView>
        </GoogleMap>
      </LoadScript>
    </div>
  );
}
export default GoogleMapTask;
