// Import dependencies
import React, { useRef, useState, useEffect } from "react";
import * as tf from "@tensorflow/tfjs";
import Webcam from "react-webcam";
import "./App.css";

function App() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);

  const [model, setModel] = useState();

  async function loadModel() {
    try {
      const model = await tf.loadGraphModel("./tfjs_model/model.json");
      setModel(model);
      console.log("Load model success")
    }
      catch (err) {
      console.log(err);
    }
  }

  //React Hook
  useEffect(()=>{
    tf.ready().then(()=>{
    loadModel()
    });
  }, [])

  const detect = async (model) => {
    // Check data is available
    if (
      typeof webcamRef.current !== "undefined" &&
      webcamRef.current !== null &&
      webcamRef.current.video.readyState === 4
    ) {

      const video = webcamRef.current.video;
      const cakeTensor = tf.browser.fromPixels(video);
      const resized = tf.image.resizeBilinear(cakeTensor, [198, 198])
      const expand_1 = tf.expandDims(resized, 0);
      const expand_2 = tf.expandDims(expand_1, 0);
      const obj = await model.predict(expand_2);

      let element = document.getElementById("Result_text");
      element.innerHTML = "Age: "+ Math.ceil(obj[0].dataSync() * 116.0)
      if (obj[1].dataSync()[0] > obj[1].dataSync()[1])
      {
        element.innerHTML += "<br />" + "Gender: Male";
      } else 
      {
        element.innerHTML += "<br />" + "Gender: Female";
      }
      var dict = {
        0: 'white', 
        1: 'black', 
        2: 'asian', 
        3: 'indian', 
        4: 'others'
      };
      
      const max_elem = Math.max.apply(Math, obj[2].dataSync());
      const index = obj[2].dataSync().indexOf(max_elem);
      element.innerHTML += "<br />" + "Gender: " + dict[index];
    }
  };

  const shoot = () => {
    detect(model);
}

  return (
    <div className="App">
      <header className="App-header">
        <Webcam
          ref={webcamRef}
          muted={true} 
          style={{
            position: "absolute",
            marginLeft: "auto",
            marginRight: "auto",
            left: 0,
            right: 0,
            textAlign: "center",
            zindex: 9,
            width: 640,
            height: 480,
          }}
        />
        <canvas
          ref={canvasRef}
          style={{
            position: "absolute",
            marginLeft: "auto",
            marginRight: "auto",
            left: 0,
            right: 0,
            textAlign: "center",
            zindex: 8,
            width: 640,
            height: 480,
          }}
        />
        <button onClick={shoot} 
          style={{
            position: "absolute", 
            top: "0%", 
            width: "100px", 
            height: "40px",
            fontSize: 20,
          }}>
          Predict
        </button>
        <div id="Result_text"
          style={{
            width: "300px",
            height: "100px",
            background: "black",
            position: "absolute",
            bottom: "0%",
          }}>
        </div>
      </header>
    </div>
  );
}

export default App;
