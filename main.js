var BrowserWindow = require('electron').BrowserWindow
const ipc = require('electron').ipcMain
var menubar = require('./services/menubar');
var globalShortcut = require('electron').globalShortcut
var constants = require('./services/constants.js')
var mb = menubar({
	alwaysOnTop: true,
	width: 300,
	height: 350,
	index: './renderers/toolbar.html',
	icon: './icons/IconTemplate.png'
})

var win;

const DEBUG = {
	showDropdownDevTools: true,
	showToolbarDevTools: true
}

mb.on('ready', function ready () {
  console.log('app is ready')
	win = new BrowserWindow({
		width: '100%',
		height: '100%',
		transparent: true,
		frame: false,
    toolbar: false,
	})
	win.loadURL(constants.SELECTOR_RENDERER_URL)
	win.hide()
	win.maximize()
	mb.showWindow()

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
		win.show() // TODO: add in toggle show

		if (DEBUG.showDropdownDevTools) {
			win.openDevTools()
		}
  })

	globalShortcut.register('Command+Shift+C', () => {
		mb.window.webContents.send('toggleTaskState')
  })

	globalShortcut.register('esc', () => {
		win.hide()

		if (DEBUG.showDropdownDevTools) {
			win.closeDevTools()
		}
  })
})

mb.on('show', function () {
	mb.window.webContents.send('toolbarShow')
})

mb.on('hide', function () {
	mb.window.webContents.send('toolbarHide')
})

ipc.on('add-task', function (e, taskName) {
	mb.window.webContents.send('add-task', taskName)
})

ipc.on('exit-app', function (e, taskName) {
	mb.tray.destroy()
})

ipc.on('play-icon', function (e, taskName) {
	mb.tray.setImage(constants.PLAY_ICON)
})

ipc.on('pause-icon', function (e, taskName) {
	mb.tray.setImage(constants.PAUSE_ICON)
})

ipc.on('stop-icon', function (e, taskName) {
	mb.tray.setImage(constants.STOP_ICON)
})
