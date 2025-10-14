const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCSSExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
	entry: './src/main.js',
	output: {
		filename: 'bundle.js',
		path: path.resolve(__dirname, 'dist'),
		clean: true,
		assetModuleFilename: path => {
			return `assets/${path.filename.split('/').at(2)}/[name][ext]`;
		},
	},
	plugins: [
		new HtmlWebpackPlugin({
			template: './src/index.html',
			favicon: './src/assets/svgs/favicon.svg',
		}),
		new MiniCSSExtractPlugin({
			filename: 'styles/[name].css',
		}),
	],
	module: {
		rules: [
			{
				test: /\.css$/i,
				use: [MiniCSSExtractPlugin.loader, 'css-loader'],
			},
			{
				test: /\.html$/i,
				loader: 'html-loader',
			},
			{
				test: /\.(png|svg|jpg|jpeg|gif)$/i,
				type: 'asset/resource',
			},
		],
	},
};
