const fs = require('fs');
const packageJson = JSON.parse(fs.readFileSync('package.json'))

module.exports = {
  APP_VERSION: packageJson.version,
	PAUSE_ICON: './PauseIcon.png',
	PLAY_ICON: './PlayIcon.png',
	STOP_ICON: './IconTemplate.png'
}
