import { loadData, saveData, deleteData } from './persistance.js'
import {StoreAbstractBase, PLAYING, PAUSED, STOPPED, MINIMIZED} from '../shared.js'

const getInitialState = () => {
  return {
		timerState: STOPPED,
		currentTask: null,
		allTaskSessions: {}
	}
}

class ToolbarStore extends StoreAbstractBase {
	constructor(timerStore) {
		super(getInitialState())
		loadData((data) => {
			if (data) this.setState(data)
		})

		this.timerStore = timerStore
	}

	deleteData() {
		deleteData()
		this.state = getInitialState()
		this.triggerRender()
	}

	pauseTask() {
		this.setState({ timerState: PAUSED })
		this.timerStore.pause()
	}

	minimizeWindow() { // bad name
		this.setState({ timerState: MINIMIZED })
		this.timerStore.minimize()
	}

	stopTask() {
		if (this.state.timerState === STOPPED) return;

		this.state.allTaskSessions[this.state.currentTask].push({
			startTimestamp: this.timerStore.state.startTimestamp,
			endTimestamp: Date.now()
		})

		this.state.timerState = STOPPED
		this.triggerRender()
		this.timerStore.stop()

		saveData(this.state) // TODO: need to formalize this structure.
	}

	resumeTask() {
		this.timerStore.start(this.state.timerState)
		this.setState({ timerState: PLAYING })
	}

	startTask(taskName) {
		const {currentTask, timerState} = this.state

		if (timerState !== STOPPED && currentTask !== taskName) {
			this.stopTask()
		}

		this.state.currentTask = taskName
		this.timerStore.start(timerState)
		this.state.timerState = PLAYING
		if (!this.state.allTaskSessions[taskName]) {
			this.state.allTaskSessions[taskName] = []
		}

		this.triggerRender()
	}
}

class ToolbarTimerStore extends StoreAbstractBase {
	constructor() {
		super({}) // TODO: possible properties should be documented in defaults here
		this.framesPerSecond = 30
		this.stop()
	}

	start(currentTimerState) {
		let newDurationMillis;
		const {lastMinimizedAt, durationMillis, runningTimerId} = this.state
		clearInterval(runningTimerId)

		if (currentTimerState === MINIMIZED) {
			newDurationMillis = (Date.now() - lastMinimizedAt)
		} else if (currentTimerState === PAUSED) {
			newDurationMillis = durationMillis
		} else {
			newDurationMillis = 0
		}

		this.setState({
			timerState: PLAYING,
			startTimestamp: this.state.startTimestamp || Date.now(),
			durationMillis: newDurationMillis,
			runningTimerId: setInterval(() => {
				this.state.durationMillis += (1000 / this.framesPerSecond)
				this.triggerRender()
			}, 1000/this.framesPerSecond)
		})
	}

	stop() {
		clearInterval(this.state.runningTimerId)
		this.setState({
			startTimestamp: null,
			lastMinimizedAt: null,
			durationMillis: 0,
			runningTimerId: null
		})
	}

	pause() {
		clearInterval(this.state.runningTimerId)
		this.setState({
			runningTimerId: null
		})
	}

	minimize() {
		clearInterval(this.state.runningTimerId)
		this.setState({
			lastMinimizedAt: Date.now(),
			runningTimerId: null
		})
	}
}

export const toolbarTimerStore = new ToolbarTimerStore()
export const toolbarStore = new ToolbarStore(toolbarTimerStore)