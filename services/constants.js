const fs = require('fs');
const packageJson = JSON.parse(fs.readFileSync('../package.json'))
var path = require('path')

module.exports = {
  APP_VERSION: packageJson.version,
	PAUSE_ICON: './icons/PauseIcon.png',
	PLAY_ICON: './icons/PlayIcon.png',
	STOP_ICON: './icons/IconTemplate.png',
	// RENDERERS
	SELECTOR_RENDERER_URL: 'file://' + path.resolve('./renderers/selector.html'),
	TOOLBAR_RENDERER_URL: 'file://' + path.resolve('./renderers/toolbar.html'),
	timerStates: {
		PLAYING: 'PLAYING',
		PAUSED: 'PAUSED',
		STOPPED: 'STOPPED',
		MINIMIZED: 'MINIMIZED'
	}
}
