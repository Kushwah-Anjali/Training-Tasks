import marker1Img from "../assets/bluemarker.png";
import marker2Img from "../assets/redmarker.png";
import marker3Img from "../assets/marker.png";
import marker4Img from "../assets/greenmarker.png";
import marker5Img from "../assets/greymarker.png";
import marker6Img from "../assets/lightgreenmarker.png";
import marker7Img from "../assets/purplemarker.png";
import marker8Img from "../assets/orangemarker.png";
import marker9Img from "../assets/pinkmarker.png";
const markersData = [
    {
        id: 1, image: marker1Img, lat: 28.6139, lng: 77.2090, lastUpdate: new Date().toLocaleTimeString(), color: "blue",
    },
    {
        id: 2, image: marker2Img, lat: 19.0760, lng: 72.8777, lastUpdate: new Date().toLocaleTimeString(), color: "red",
    },
    {
        id: 3, image: marker3Img, lat: 12.9716, lng: 77.5946, lastUpdate: new Date().toLocaleTimeString(), color: "yellow",
    },
    {
        id: 4, image: marker4Img, lat: 22.5726, lng: 88.3639, lastUpdate: new Date().toLocaleTimeString(), color: "green",

    },
    {
        id: 5, image: marker5Img, lat: 13.0827, lng: 80.2707, lastUpdate: new Date().toLocaleTimeString(), color: "grey"
    },
    {
        id: 6, image: marker6Img, lat: 17.3850, lng: 78.4867, lastUpdate: new Date().toLocaleTimeString(), color: "lightgreen"
    },
    {
        id: 7, image: marker7Img, lat: 18.5204, lng: 73.8567, lastUpdate: new Date().toLocaleTimeString(), color: "purple"
    },
   
    {
        id: 8, image: marker8Img, lat: 26.9124, lng: 75.7873, lastUpdate: new Date().toLocaleTimeString(), color: "orange"
    },
    {
        id: 9, image: marker9Img, lat: 26.8467, lng: 80.9462, lastUpdate: new Date().toLocaleTimeString(), color: "pink"
    },
];

export default markersData; 