import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import { useState } from "react";
function GoogleMapTask() {
  const ContainerStyle = {
    height: "70vh",
    width: "100%",
  };
  const [MapCenter, setMapCenter] = useState({ lat: 0, lng: 0 });
  const [Zoom, SetZoom] = useState(2);
  const [MarkerPosition, setMarkerPosition] = useState({ lat: 0, lng: 0 });
  const [LatInput, setLatInput] = useState(0);
  const [LngInput, setLngInput] = useState(0);
  const HandleLatInputChange = (e) => {
    setLatInput(parseFloat(e.target.value));
  };
  const HandleLngInputChange = (e) => {
    setLngInput(parseFloat(e.target.value));
  };
  const HandleMapClick = (e) => {
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    setMarkerPosition({ lat: lat, lng, lng });
    setLatInput(lat);
    setLngInput(lng);
  };
  const HandleGoClick = () => {
    if (isNaN(LatInput) || isNaN(LngInput)) {
      alert("Please enter valid numbers for latitude and longitude.");
      return;
    }
    setMarkerPosition({ lat: LatInput, lng: LngInput });
  };
  const HandleMarkerDrage = (e) => {
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    setLatInput(lat);
    setLngInput(lng);
  };
  const HandleMapCenter = () => {
    setMapCenter({ lat: LatInput, lng: LngInput });
  };
  return (
    <>
      <h1 className="text-center ">Google Map Task</h1>
      <input
        type="number "
        placeholder="Latitude"
        value={LatInput}
        onChange={HandleLatInputChange}
      />
      <input
        type="number "
        placeholder="Longitude"
        value={LngInput}
        onChange={HandleLngInputChange}
      />
      <button onClick={HandleGoClick}>Go</button>
      <button onClick={HandleMapCenter}>Center Map</button>
      <LoadScript googleMapsApiKey="">
        <GoogleMap
          mapContainerStyle={ContainerStyle}
          center={MapCenter}
          zoom={Zoom}
          onClick={HandleMapClick}
        >
          <Marker
            position={MarkerPosition}
            draggable
            onDrag={HandleMarkerDrage}
          />
        </GoogleMap>
      </LoadScript>
    </>
  );
}
export default GoogleMapTask;
