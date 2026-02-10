import { useState, useEffect } from "react";
import dayjs from "dayjs";
import timeZone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
dayjs.extend(utc);
dayjs.extend(timeZone);
function InfoBox({ lat, lng, onClose }) {
  const latDirection = lat >= 0 ? "N" : "S";
  const lngDirection = lng >= 0 ? "E" : "W";
  // math.abs to remove any - sign 
  const latDisplay = `${Math.abs(lat).toFixed(5)}° ${latDirection}`;
  const lngDisplay = `${Math.abs(lng).toFixed(5)}° ${lngDirection}`;
  const [times, setTimes] = useState({
    india: "",
    london: "",
    tokyo: "",
    dubai: "",
    newYork: ""
  })
  useEffect(() => {

    const updateTime = () => {
      setTimes({
        india: dayjs().tz("Asia/Kolkata").format("DD-MM-YYYY HH:mm:ss"),
        london: dayjs().tz("EUROPE/London").format("DD-MM-YYYY HH:mm:ss"),
        tokyo: dayjs().tz("Asia/Tokyo").format("DD-MM-YYYY HH:mm:ss"),
        dubai: dayjs().tz("Asia/Dubai").format("DD-MM-YYYY HH:mm:ss"),
        newYork: dayjs().tz("America/New_York").format("DD-MM-YYYY HH:mm:ss"),
      })
    };
    updateTime();
    const id = setInterval(updateTime, 1000);
    return () => clearInterval(id);
  }, []);


  return (
    <div
      className="card shadow-lg border-0"
      style={{
        minWidth: "260px",
        borderRadius: "14px",
        backgroundColor: "#2e2f33ff",
      }}
    >
      <div className="card-header bg-transparent border-bottom d-flex justify-content-between align-items-center py-2">
        <span
          className="fw-semibold text-uppercase"
          style={{ color: "#22d3ee", fontSize: "0.8rem" }}
        >
          Location Details
        </span>

        <button
        onClick={(e) => {
    e.stopPropagation();
    onClose();
  }}
          className="btn btn-close btn-close-white btn-sm"
          aria-label="Close"
        
        />
      </div>
      <div className="card-body px-3 py-2">
        <table className="table table-sm table-borderless mb-2 text-light rounded">
          <tbody>
            <tr>
              <td className="text-muted small">Latitude</td>
              <td className="text-end fw-medium">{latDisplay}</td>
            </tr>

            <tr>
              <td className="text-muted small">Longitude</td>
              <td className="text-end fw-medium">{lngDisplay}</td>
            </tr>

            <tr>
              <td className="text-muted small">India (IST)</td>
              <td className="text-end fw-medium">{times.india}</td>
            </tr>
            <tr>
              <td className="text-muted small">London (GMT)</td>
              <td className="text-end fw-medium">{times.london}</td>
            </tr>
            <tr>
              <td className="text-muted small">Tokyo (JST)</td>
              <td className="text-end fw-medium">{times.tokyo}</td>
            </tr>
            <tr>
              <td className="text-muted small">Dubai (GST)</td>
              <td className="text-end fw-medium">{times.dubai}</td>
            </tr>
            <tr>
              <td className="text-muted small">New York (EST)</td>
              <td className="text-end fw-medium">{times.newYork}</td>
            </tr>

          </tbody>
        </table>
      </div>
    </div>
  );
}

export default InfoBox;
