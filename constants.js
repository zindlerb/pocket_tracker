const fs = require('fs');
const packageJson = JSON.parse(fs.readFileSync('package.json'))

module.exports = {
  APP_VERSION: packageJson.version
}
