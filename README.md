# canvas-template

A starting point for canvas animation projects. Clone it, open `canvas.html` in a browser, and start tweaking — no build tools needed.

## Getting started

1. Clone this repo.
2. Open `canvas.html` in a browser.
3. Edit `js/sketch.js` and go from there.

## How it works

```mermaid
flowchart TD
    A[window load] --> B[get canvas element]
    B --> C[new Scene]
    C --> D[create entities]
    D --> E[new Loop]
    E --> F[Loop.start]

    F --> G[requestAnimFrame]
    G --> H{enough time\npassed?}
    H -- no --> G
    H -- yes --> I[Scene.update]
    I --> J[Entity.update × n]
    J --> K[Scene.draw]
    K --> L[Entity.draw × n]
    L --> G
```

## Projects using this template

- [canvas-fireworks](https://github.com/lukecassidy/canvas-fireworks)
- [canvas-digital-rain](https://github.com/lukecassidy/canvas-digital-rain)
