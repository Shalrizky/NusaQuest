import React from "react";

const loaderContainerStyle = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  height: "100vh",
  backgroundColor: "#212121",
};

const loaderStyle = {
  width: "80px",
  height: "50px",
  position: "relative",
};

const loaderTextStyle = {
  position: "absolute",
  top: 0,
  padding: 0,
  margin: 0,
  color: "#4F98FF",
  fontFamily: "Potta One, cursive",
  fontSize: "1rem",
  letterSpacing: "1px",
  animation: "text_713 3.5s ease both infinite",
};

const loadStyle = {
  backgroundColor: "#69B4FF",
  borderRadius: "50px",
  display: "block",
  height: "16px",
  width: "16px",
  bottom: 0,
  position: "absolute",
  transform: "translateX(64px)",
  animation: "loading_713 3.5s ease both infinite",
};

const beforeStyle = {
  position: "absolute",
  content: '""',
  width: "100%",
  height: "100%",
  backgroundColor: "#267df6",
  borderRadius: "inherit",
  animation: "loading2_713 3.5s ease both infinite",
};

const Loader = () => (
  <div style={loaderContainerStyle}>
    <style>
      {`
        @keyframes text_713 {
          0% {
            letter-spacing: 1px;
            transform: translateX(0px);
          }
          40% {
            letter-spacing: 2px;
            transform: translateX(26px);
          }
          80% {
            letter-spacing: 1px;
            transform: translateX(32px);
          }
          90% {
            letter-spacing: 2px;
            transform: translateX(0px);
          }
          100% {
            letter-spacing: 1px;
            transform: translateX(0px);
          }
        }

        @keyframes loading_713 {
          0% {
            width: 16px;
            transform: translateX(0px);
          }
          40% {
            width: 100%;
            transform: translateX(0px);
          }
          80% {
            width: 16px;
            transform: translateX(64px);
          }
          90% {
            width: 100%;
            transform: translateX(0px);
          }
          100% {
            width: 16px;
            transform: translateX(0px);
          }
        }

        @keyframes loading2_713 {
          0% {
            transform: translateX(0px);
            width: 16px;
          }
          40% {
            transform: translateX(0%);
            width: 80%;
          }
          80% {
            width: 100%;
            transform: translateX(0px);
          }
          90% {
            width: 80%;
            transform: translateX(15px);
          }
          100% {
            transform: translateX(0px);
            width: 16px;
          }
        }
      `}
    </style>
    <div style={loaderStyle}>
      <span style={loaderTextStyle}>loading</span>
      <span style={loadStyle}>
        <span style={beforeStyle}></span>
      </span>
    </div>
  </div>
);

export default Loader;
