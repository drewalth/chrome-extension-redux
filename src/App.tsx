import { useEffect, useState } from "react";
import "./App.css";
import { Ditto } from "./types.ts";

function App() {
  const [ditto, setDitto] = useState<Ditto>();

  useEffect(() => {
    chrome.runtime.sendMessage({ action: "FETCH_DATA" }, (response) => {
      console.log(response); // use the data to update your UI
      setDitto(response.data);
    });
  }, []);

  return (
    <>
      <h1>Ditto</h1>
      {ditto && (
        <div>
          <p>Name: {ditto.name}</p>
          <p>Height: {ditto.height}</p>
          <p>Weight: {ditto.weight}</p>
          <img src={ditto.sprites.front_default} alt="Ditto" />
        </div>
      )}
    </>
  );
}

export default App;
