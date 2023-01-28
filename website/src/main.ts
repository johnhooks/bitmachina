import hello from "bitmachina";

document.querySelector<HTMLDivElement>("#app")!.innerHTML = /* html */ `
  <div>
    <p>Hello <code>bitmachina</code></p>
  </div>
`;

hello();
