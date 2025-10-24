(function () {
  if (!document.getElementById("Loader")) {
    const style = document.createElement("style");
    style.id = "Loader-css";
    style.textContent = `
      .showbox {
          position: absolute;
          inset: 0;
          z-index: 99999999;
          backdrop-filter: blur(3px);
          display: flex;
          justify-content: center;
          align-items: center;
      }
  
      .loader {
          position: relative;
          margin: 0 auto;
          width: 100px
      }
  
      .loader:before {
          content: "";
          display: block;
          padding-top: 100%
      }
  
      .circular {
          animation: rotate 2s linear infinite;
          height: 100%;
          transform-origin: center center;
          width: 100%;
          position: absolute;
          top: 0;
          bottom: 0;
          left: 0;
          right: 0;
          margin: auto
      }
  
      .path {
          stroke-dasharray: 1, 200;
          stroke-dashoffset: 0;
          animation: dash 1.5s ease-in-out infinite, color 6s ease-in-out infinite;
          stroke-linecap: round
      }
  
      @keyframes rotate {
          100% {
              transform: rotate(360deg)
          }
      }
  
      @keyframes dash {
          0% {
              stroke-dasharray: 1, 200;
              stroke-dashoffset: 0
          }
  
          50% {
              stroke-dasharray: 89, 200;
              stroke-dashoffset: -35px
          }
  
          100% {
              stroke-dasharray: 89, 200;
              stroke-dashoffset: -124px
          }
      }
  
      @keyframes color {
  
          100%,
          0% {
              stroke: #d62d20
          }
  
          40% {
              stroke: #0057e7
          }
  
          66% {
              stroke: #008744
          }
  
          80%,
          90% {
              stroke: #ffa700
          }
      }
  
      .showboxform {
          position: relative;
          top: 0;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 5%
      }
      #LoaderForm {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          height: 40%;
          aspect-ratio: 2/1;
          --_g: no-repeat
            radial-gradient(circle closest-side,light-dark( var(--text-light), var(--text-dark)) 80%, #ffffff00);
          background: var(--_g) 0% 50%, var(--_g) 50% 50%, var(--_g) 100% 50%;
          background-size: calc(100% / 3) 50%;
          animation: loader-animate 1s infinite linear;
      }

      @keyframes loader-animate {
          20% {
            background-position: 0% 0%, 50% 50%, 100% 50%;
          }
          40% {
            background-position: 0% 100%, 50% 0%, 100% 50%;
          }
          60% {
            background-position: 0% 50%, 50% 100%, 100% 0%;
          }
          80% {
            background-position: 0% 50%, 50% 50%, 100% 100%;
          }
      }
    `;
    document.head.appendChild(style);
  }
})();
