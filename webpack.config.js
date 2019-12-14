const path = require('path');
const nodeExternals = require('webpack-node-externals');

module.exports = (env) => {
    const devMode = env && !!env.DEV;
    return {
        entry: {
            server: './src/server.ts',
        },
        mode: (devMode) ? 'development' : 'production',
        target: 'node',
        externals: [nodeExternals()],
        module: {
            rules: [
                {
                    test: /\.tsx?$/,
                    use: 'ts-loader',
                    exclude: /node_modules/
                },
                {
                    test: /\.(html)$/,
                    use: {
                        loader: 'html-loader',
                        options: {
                            attrs: false,
                            minimize: true,
                            removeAttributeQuotes: false,
                            minifyJS: true,
                            minifyCSS: true,
                        }
                    }
                }
            ]
        },
        resolve: {
            extensions: ['.tsx', '.ts', '.js'],
            modules: [
                './src',
                './node_modules',
            ]
        },
        plugins: [
        ],
        output: {
            filename: 'server.js',
            path: path.resolve(__dirname, 'dist')
        },
    }
}
