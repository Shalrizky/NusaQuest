import React from "react";
import '../style/util/Loader.css'

const Loader = () => (
  <div className="loader-container">
    <div className="loader">
      <span className="loader-text">loading</span>
      <span className="load"></span>
    </div>
  </div>
);

export default Loader;
