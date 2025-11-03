import React from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

const Speedometer = ({ value }) => {
  return (
    <div style={{ width: 200, height: 100 }}>
      <CircularProgressbar
        value={value}
        maxValue={100}
        circleRatio={0.5} // makes it a half circle
        styles={buildStyles({
          rotation: 0.75, // starts from 225° to -45°
          strokeLinecap: "round",
          pathColor: "#0b2345", // deep blue arc
          trailColor: "#eee", // light gray base
          textColor: "#0b2345",
        })}
        text={`${value}%`}
      />
    </div>
  );
};

export default Speedometer;