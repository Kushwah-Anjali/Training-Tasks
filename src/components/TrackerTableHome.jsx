import {useEffect, useRef } from "react";
import $ from "jquery";
import "datatables.net";
import "datatables.net-dt/css/dataTables.dataTables.css";
function TrackerTableHome({
  onTrackerSelect,
  onRowClick,
  markers,
  activeMarkerId,
  
}) {
  const tableRef = useRef(null);
  useEffect(() => {
    const table = $(tableRef.current).DataTable({
      paging: true,
      searching: true,
      pageLength: 5,
      ordering: true,
      info: false,
      scrollY: "350px",
      lengthChange: false,
      language: {
        search: "Filter:",
        paginate: {
          next: "Next",
          previous: "Prev",
        },
      
      },
    });
    return () => {
      table.destroy(); // cleanup (IMPORTANT in React)
    };
  }, []);

  return (
    <div
      className="table-responsive"
      style={{ maxWidth: "900px", margin: "auto" }}
    >
      <table
        ref={tableRef}
        id="trackertable"
        className="table table-hover text-center"
      >
        <colgroup>
          <col style={{ width: "40px" }} />
          <col style={{ width: "200px" }} />
          <col style={{ width: "60px" }} />
          <col style={{ width: "120px" }} />
        </colgroup>

        <thead className="table-primary">
          <tr>
            <th>Select</th>
            <th className="text-start">Trackers</th>
            <th>
              <i className="fa-solid fa-power-off"></i>
            </th>
            <th>Last Update</th>
          </tr>
        </thead>

        <tbody>
          {markers.map((marker) => (
            <tr
              key={marker.id}
              className={`align-middle ${marker.id === activeMarkerId ? "table-success" : ""}`}
              onClick={(e) => onRowClick(marker.id, e)}
            >
              <td className="text-start">
                <input
                  type="checkbox"
                  checked={marker.selected}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => onTrackerSelect(marker.id, e.target.checked)}
                />
              </td>

              <td className="text-start">
                <img
                  src={marker.image}
                  alt=""
                  className="img-fluid"
                  style={{ maxHeight: "40px" }}
                />
              </td>

              <td className="text-start">
                <i className="fa-solid fa-power-off"></i>
              </td>

              <td className="text-start">{marker.lastUpdate}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default TrackerTableHome;
