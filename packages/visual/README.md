<h1 align="center">
  @bitmachina/visual
</h1>

## What is it?

An audio visualization library.

## Does it work yet?

Nope.

## Goal

Create something like [EYESY](https://www.critterandguitari.com/eyesy) that runs in the browser. It's [modes]((https://github.com/critterandguitari/EYESY_Modes_Pygame)) are open source and inspiration. Though I want to use the power GPU rendering to improve performance and visual complexity of the audio visualizations.

## Using

- [twgl.js](http://twgljs.org/docs/module-twgl.html) - Thin WebGL library
- [glslx](http://evanw.github.io/glslx/) - GLSL language linter and formatter
- [lygia](https://github.com/patriciogonzalezvivo/lygia) - GLSL shader library. Lygia is included as a git submodule.
- [vite](https://vitejs.dev/) and [vite-plugin-glsl](https://github.com/UstymUkhman/vite-plugin-glsl) are used to bundle GLSL files into JavaScript strings. Most importantly it resolves and bundles `#include` macros.

## GLSL Editing

- [glslx-vscode](https://github.com/evanw/glslx-vscode) - The best VSCode extension for GLSL that I have found, and its by `evanw`, the creator of esbuild, so it's gotta be good.

## Todo

- [ ] Create a basic WebGL rendering canvas on which to render GLSL scripts.
- [ ] Create a manual type declaration
- [ ] Figure out how to build a type declaration

## License

[MIT](LICENSE) @ John Hooks
