import _ from 'lodash'
import { h, render, Component } from 'preact';
import {StoreAbstractBase, PLAYING, PAUSED, STOPPED, MINIMIZED} from './shared.js'
import { ipcRenderer } from 'electron'
import './toolbar.css'
import cx from 'classnames'

class Store extends StoreAbstractBase {
	constructor(timerStore) {
		super({
			timerState: STOPPED,
			currentTask: null,
			tasks: {},
		})

		this.timerStore = timerStore
	}

	pauseTask() {
		this.setState({ timerState: PAUSED })
		this.timerStore.pause()
	}

	minimizeWindow() {
		// bad name
		this.setState({ timerState: MINIMIZED })
		this.timerStore.minimize()
	}

	stopTask() {
		// TODO: add to sessions here
		this.setState({ timerState: STOPPED })
		this.timerStore.stop()
	}

	resumeTask() {
		this.timerStore.start(this.state.timerState)
		this.setState({ timerState: PLAYING })
	}

	startTask(taskName) {
		this.state.currentTask = taskName
		this.state.timerState = PLAYING
		if (!this.state.tasks[taskName]) {
			this.state.tasks[taskName] = {
      	sessions: []
			}
		}

		this.timerStore.start(this.state.timerState)
		this.triggerRender()
	}
}

class TimerStore extends StoreAbstractBase {
  constructor() {
		super({})
		this.framesPerSecond = 30
		this.stop()
	}

	start(currentTimerState) {
		const {lastMinimizedAt} = this.state

		this.setState({
			timerState: PLAYING,
      startTimestamp: this.state.startTimestamp || Date.now(),
			durationMillis: currentTimerState === MINIMIZED ? (Date.now() - lastMinimizedAt) : 0,
			runningTimerId: setInterval(() => {
				this.state.durationMillis += (1000 / this.framesPerSecond)
				this.triggerRender()
			}, 1000/this.framesPerSecond)
		})
	}

	stop(currentTimerState) {
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

const timerStore = new TimerStore()
const store = new Store(timerStore)


ipcRenderer.on('toolbarHide', () => {
	if (store.state.timerState === PLAYING) {
		store.minimizeWindow()
	}
})

ipcRenderer.on('toolbarShow', () => {
	if (store.state.timerState === MINIMIZED) {
		store.resumeTask()
	}
})

ipcRenderer.on('add-task', (e, taskName) => {
	store.startTask(taskName)
})

class Timer extends Component {
	componentDidMount() {
  	timerStore.registerComponentContext(this)
	}

	render(props, { durationMillis }) {
		const durationSeconds = durationMillis / 1000
		const seconds = _.floor(durationSeconds) % 60
		const formattedSeconds = seconds < 10 ? `0${seconds}` : seconds
		const milliseconds = _.floor((_.floor(durationSeconds, 2) - _.floor(durationSeconds)) * 100)
		const formattedMillis = milliseconds < 10 ? `0${milliseconds}` : milliseconds

		return (
			<div className={props.className}>
				{_.floor(durationSeconds/60)}:{formattedSeconds}.{formattedMillis}
			</div>
		)
	}
}

class Toolbar extends Component {
	constructor() {
		super()
  	this.state = {}
	}

	componentDidMount() {
		store.registerComponentContext(this)
	}

  render(props, state) {
		let playOrPaused = (
			<button
				className={cx("ma2", { disabled: !state.currentTask })}
				onClick={() => {
					if (state.currentTask) {
          	store.startTask(state.currentTask)
					}
				}}>
				Play
			</button>
		)
		if (state.timerState === PLAYING) {
			playOrPaused = <button className="ma2" onClick={() => store.pauseTask()}>Pause</button>
		}

  	return (
			<div className="pa2 tc">
				<div
					className={cx('current-task mv2', state.currentTask ? 'selected' : 'blank')}>
					{state.currentTask || 'select task'}
				</div>
				<Timer className="timer mb2" />
				<div>
					{playOrPaused}
					<button className="ma2" onClick={() => store.stopTask()}>Stop</button>
				</div>
			</div>
		)
	}
}

render(<Toolbar/>, document.getElementById("root"));
