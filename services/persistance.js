const electron = require('electron');
const path = require('path');
const fs = require('fs');
const appVersion = require('../constants.js').APP_VERSION

const FILE_NAME = 'pocketTrackerData'
const USER_DATA_PATH = (electron.app || electron.remote.app).getPath('userData');
const FILE_PATH = path.join(USER_DATA_PATH, FILE_NAME + '.json');

const saveData = (data) => {
	try {
  	fs.writeFileSync(FILE_PATH, JSON.stringify({
			appVersion: appVersion,
			data: data
		}));
		return true
	} catch (e) {
		console.log(e.code, e)
		return false
	}
}

const deleteData = () => {
	try {
  	fs.unlinkSync(FILE_PATH)
	} catch (e) {
		console.log(e.code)
		throw e;
	}
}

const loadData = (cb) => { // TODO: use promises
	fs.readFile(FILE_PATH, (err, data) => {
		if (!err) {
			return cb(JSON.parse(data).data)
		} else if (err.code === "ENOENT") {
			return cb(null)
		} else {
    	throw err
		}
	})
}

module.exports = { saveData, loadData, deleteData }
