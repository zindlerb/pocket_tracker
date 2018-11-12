var BrowserWindow = require('electron').BrowserWindow
const ipc = require('electron').ipcMain
var menubar = require('menubar');
var globalShortcut = require('electron').globalShortcut
var mb = menubar()

var win;

const DEBUG = {
	showDropdownDevTools: true,
	showToolbarDevTools: false
}

// TIMER STATES
const PLAYING = 'PLAYING'
const PAUSED = 'PAUSED'
const STOPPED = 'STOPPED'

class Store {
  constructor() {
  	this.state = {
    	tasks: {},
			currentTask: null,
			timer: 0,
			timerState: STOPPED
		}
	}

	addTask(taskName) {
		this.state.tasks[this._genId()] = {
    	name: taskName,
      sessions: []
		}

		this.state.timer = 0
		this.startTimer()
	}

	addSession() {
  	// when timer stops
	}

	startTimer() {
		this.state.timerState = PLAYING
		// TODO: EMIT EVENT TO START TIMER
	}

	_genId() {
  	return Math.random().toString().replace('.', '')
	}
}

const globalStore = new Store()

mb.on('ready', function ready () {
  console.log('app is ready')
	win = new BrowserWindow({
		width: '100%',
		height: '100%',
		transparent: true,
		frame: false,
    toolbar: false
	})
	win.loadURL(`file://${__dirname}/task_selector.html`)
	win.hide()
	win.maximize()

	if (DEBUG.showToolbarDevTools) {
		mb.window.openDevTools()
	}
})

mb.on('after-create-window', function () {
	globalShortcut.register('Command+Shift+R', () => {
		mb.window.reload()
		win.reload()
  })

	globalShortcut.register('Command+Shift+X', () => {
		win.show()
		if (DEBUG.showDropdownDevTools) {
			win.openDevTools()
		}
  })

	globalShortcut.register('Command+Shift+H', () => {
		win.hide()
		if (DEBUG.showDropdownDevTools) {
			win.closeDevTools()
		}
  })
})

ipc.on('add-task', function (e, taskName) {
	globalStore.addTask(taskName)
})
