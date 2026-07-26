import p5 from "p5";

export function getHostSize(p: p5) {
  const host = document.querySelector(".sketch-host");
  if (!(host instanceof HTMLElement)) {
    return { width: p.windowWidth, height: p.windowHeight };
  }

  return {
    width: Math.max(1, host.clientWidth),
    height: Math.max(1, host.clientHeight),
  };
}
