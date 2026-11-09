# Source for A Black Hole in a Box

GitHub Pages does not publish this folder (Jekyll skips folders whose names start with `_`).

- `src/` holds the pages. Write maths as `\( ... \)` inline and `\[ ... \tag{2.3} \]` displayed; KaTeX renders it at build time. Page scripts go after the `<!--JS-->` marker.
- `build.mjs` assembles everything into `deploy/`.

To rebuild:

    npm install
    node build.mjs

then copy the contents of `deploy/` to the root of the repository. Equation numbers are never reused, and every change to the physics gets an entry in `src/changes.html`.
