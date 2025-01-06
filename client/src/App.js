import React, { useState } from "react";
import axios from "axios";
import "./App.css";

const App = () => {
  const [matrix, setMatrix] = useState(
    Array(20)
      .fill()
      .map(() => Array(20).fill("empty"))
  );
  const [start, setStart] = useState(null);
  const [end, setEnd] = useState(null);
  const [route, setRoute] = useState([]);

  const handleTileClick = (x, y) => {
    if (start && start.x === x && start.y === y) {
      alert("The start and end points cannot be the same!");
      return;
    }
    if (!start) {
      setStart({ x, y });
      updateMatrix(x, y, "start");
    } else if (!end) {
      setEnd({ x, y });
      updateMatrix(x, y, "end");
    }
  };

  const updateMatrix = (x, y, type) => {
    const mat = matrix.map((row, i) =>
      row.map((cell, j) => (i === x && j === y ? type : cell))
    );
    setMatrix(mat);
  };

  const GetPath = async () => {
    if (!start || !end) {
      alert(
        "Please select both a start and end point before finding the path!"
      );
      return;
    }

    try {
      const response = await axios.post("http://localhost:8080/find-path", {
        start,
        end,
      });
      console.log(response);
      setRoute(response.data.path);
    } catch (error) {
      console.error("Path not found", error);
    }
  };

  const isGotRoute = (x, y) => {
    return route.some((p) => p.x === x && p.y === y);
  };

  const reset = () => {
    setMatrix(
      Array(20)
        .fill()
        .map(() => Array(20).fill("empty"))
    );
    setStart(null);
    setEnd(null);
    setRoute([]);
  };

  return (
    <div className="main">
      <nav className="nav">Streak.AI-FullStack-Task</nav>
      <div className="matrix">
        {matrix.map((row, i) =>
          row.map((tile, j) => (
            <div
              key={`${i}-${j}`}
              className={`tile ${tile} 
              ${isGotRoute(i, j) ? "route" : ""} 
              ${start?.x === i && start?.y === j ? "start" : ""}
              ${end?.x === i && end?.y === j ? "end" : ""}
            `}
              onClick={() => handleTileClick(i, j)}
            ></div>
          ))
        )}
      </div>
      <div className="btns">
        <button className="reset" onClick={reset}>
          Reset
        </button>
        <button className="get" onClick={GetPath}>
          Get Path
        </button>
        {route.length > 0 && (
          <button className="result">
            {JSON.stringify(route.length - 1) + " Step"}
          </button>
        )}
      </div>
    </div>
  );
};

export default App;
