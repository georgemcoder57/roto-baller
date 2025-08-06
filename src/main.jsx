import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

// const root = document.getElementById('react-root');
// console.log('AAAAAAAAA', root);
// if (root) {
//   createRoot(root).render(<App />);
// }

(function () {
  const rootEl = document.getElementById("react-root");
  if (rootEl) {
    createRoot(rootEl).render(
      <StrictMode>
        <App />
      </StrictMode>
    );
  } else {
    console.error("No #react-root found.");
  }
})();
