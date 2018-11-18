var BrowserWindow = require('electron').BrowserWindow
const ipc = require('electron').ipcMain
var menubar = require('menubar');
var globalShortcut = require('electron').globalShortcut
var mb = menubar({
	alwaysOnTop: true,
	width: 250,
	height: 300
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
	win.loadURL(`file://${__dirname}/task_selector.html`)
	win.hide()
	win.maximize()
	mb.showWindow()

	if (DEBUG.showToolbarDevTools) {
		mb.window.openDevTools()
	}
})

let taskSwitcherShown = false

mb.on('after-create-window', function () {
	globalShortcut.register('Command+Shift+R', () => {
		mb.window.reload()
		win.reload()
  })

	globalShortcut.register('Command+Shift+X', () => {
		if (taskSwitcherShown) {
			win.hide()
		} else {
    	win.show()
		}

		taskSwitcherShown = !taskSwitcherShown

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
