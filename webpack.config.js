const path = require('path');

module.exports = {
	target: "electron-renderer",
	mode: 'development',
	devtool: 'cheap-source-map',
  entry: {
		toolbar: './renderers/toolbar.js',
		selector: './renderers/selector.js'
	},
	output: {
		path: path.resolve(__dirname, './dist'),
		filename: '[name].js',
	},
	devServer: {
		port: 3001,
		hot: false,
		inline: false
	},
	module: {
  	rules: [
			{
				test: /(\.js|\.jsx)$/,
				use: [
					{
						loader: 'babel-loader',
						query: {
							presets: [
								[
      						"@babel/preset-env",
									{"useBuiltIns": "entry"}
    						]
							],
							plugins: [
								["@babel/plugin-transform-react-jsx", { "pragma":"h" }]
							]
						},
					},

				],
			},
			{
        test: /\.css$/,
        use: [
          { loader: "style-loader" },
          { loader: "css-loader" }
        ]
    	}
		]
	}
};
