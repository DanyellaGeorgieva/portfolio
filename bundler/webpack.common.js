const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCSSExtractPlugin = require('mini-css-extract-plugin');
const path = require('path');

module.exports = {
	entry: {
		index: path.resolve(__dirname, '../src/script.js'),
		garet: path.resolve(__dirname, '../src/garet/script.js'),
	},
	output: {
		filename: 'bundle.[contenthash].js',
		path: path.resolve(__dirname, '../dist'),
	},
	devtool: 'source-map',
	plugins: [
		new CopyWebpackPlugin({
			patterns: [{ from: path.resolve(__dirname, '../static') }],
		}),
		new HtmlWebpackPlugin({
			template: path.resolve(__dirname, '../src/index.html'),
			filename: 'index.html',
			chunks: ['index'],
			minify: true,
		}),
		new HtmlWebpackPlugin({
			template: path.resolve(__dirname, '../src/garet/garet.html'),
			filename: 'garet.html',
			chunks: ['garet'],
			minify: true,
		}),
		new MiniCSSExtractPlugin(),
	],
	module: {
		rules: [
			// HTML
			{
				test: /\.(html)$/,
				use: ['html-loader'],
			},

			// JS
			{
				test: /\.js$/,
				exclude: /node_modules/,
				use: ['babel-loader'],
			},

			// CSS
			{
				test: /\.css$/,
				use: [MiniCSSExtractPlugin.loader, 'css-loader'],
			},

			// Images
			{
				test: /\.(jpg|png|gif|svg)$/,
				use: [
					{
						loader: 'file-loader',
						options: {
							outputPath: 'assets/images/',
						},
					},
				],
			},

			// Docs 
			{
				test: /\.(pdf|doc)$/,
				use: [
					{
						loader: 'file-loader',
						options: {
							outputPath: 'assets/docs/',
						},
					},
				],
			},

			// Fonts
			{
				test: /\.(ttf|eot|woff|woff2)$/,
				use: [
					{
						loader: 'file-loader',
						options: {
							outputPath: 'assets/fonts/',
						},
					},
				],
			},

			// Shaders
			{
				test: /\.(glsl|vs|fs|vert|frag)$/,
				exclude: /node_modules/,
				use: ['raw-loader'],
			},
		],
	},
};
