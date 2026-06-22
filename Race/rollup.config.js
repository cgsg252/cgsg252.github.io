const resolve = require("@rollup/plugin-node-resolve");
const commonjs = require("@rollup/plugin-commonjs");
// const terser = require('@rollup/plugin-terser');

module.exports = {
    input: "src/client/client.js",
    output: {
        file: 'dist/bundle.js',
        format: "iife",
        sourcemap: true,
    },
    plugins: [
        resolve({
            jsnext: true,
            main: true,
            browser: true,
        }),
        commonjs()
        // terser()
    ],
};