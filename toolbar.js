import _ from 'lodash'
import { h, render, Component } from 'preact';
import {StoreAbstractBase, PLAYING, PAUSED, STOPPED, MINIMIZED} from './shared.js'
import { ipcRenderer } from 'electron'
import './toolbar.css'
import cx from 'classnames'

class Store extends StoreAbstractBase {
	constructor() {
		super({
			timerState: STOPPED,
			startTimestamp: null,
			currentTask: null,
			tasks: {}
		})
	}

	startTimer() {
		this.state.timerState = PLAYING
		this.state.startTimestamp = this.state.startTimestamp || (Date.now() / 1000)

		this.triggerRender()
	}

	stopTimer() {
		if (!this.state.currentTask) return;

		Object.assign(this.state, {
			timerState: STOPPED,
			startTimestamp: null,
			currentTask: null
		})

		this.state.tasks[this.state.currentTask].sessions.push({
			startTimestamp: this.state.startTimestamp, // TODO: THIS WON't be right with pauses
			endTimestamp: Date.now(),
		})

		this.triggerRender()
	}

	pauseTimer() {
		this.state.timerState = PAUSED
		this.triggerRender()
	}

	minimizeTimer() {
		this.state.timerState = MINIMIZED
		this.triggerRender()
	}

	startTask(taskName) {
		this.currentTask = taskName
		if (!this.state.tasks[taskName]) {
			this.state.tasks[taskName] = {
      	sessions: []
			}
		}
	}
}

const store = new Store()

ipcRenderer.on('toolbarHide', () => {
	store.minimizeTimer()
})

ipcRenderer.on('toolbarShow', () => {
	if (store.state.timerState === MINIMIZED) {
		store.startTimer()
	}
})

ipcRenderer.on('add-task', (taskName) => {
	store.startTask(taskName)
})

class Timer extends Component {
  constructor() {
		super()
  	this.state = {
			currentTime: 0
		}
	}

	componentWillReceiveProps({timerState, startTimestamp}) {
		const oldTimerState = this.props.timerState

		if (timerState !== oldTimerState) {
			if (timerState === PLAYING) {
				const framesPerSecond = 30

				if (oldTimerState === MINIMIZED) {
        	this.setState({
						currentTime: (Date.now() / 1000) - startTimestamp
					})
				}

				this._timerId = setInterval(() => {
					this.setState({ currentTime: _.floor(this.state.currentTime + 1/framesPerSecond, 2) })
				}, 1000/framesPerSecond)
			} else if (timerState === PAUSED || timerState === MINIMIZED) {
				clearInterval(this._timerId)
			} else if (timerState === STOPPED) {
				clearInterval(this._timerId)
				this.setState({ currentTime: 0 })
			}
		}
	}

	render(props, { currentTime }) {
		const seconds = _.floor(currentTime) % 60
		const formattedSeconds = seconds < 10 ? `0${seconds}` : seconds
		const milliseconds = _.floor((_.floor(currentTime, 2) - _.floor(currentTime)) * 100)

		return (
			<div className={props.className}>
				{_.floor(currentTime/60)}:{formattedSeconds}.{milliseconds}
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
          	store.startTimer()
					}
				}}>
				Play
			</button>
		)
		if (state.timerState === PLAYING) {
			playOrPaused = <button className="ma2" onClick={() => store.pauseTimer()}>Pause</button>
		}

  	return (
			<div className="pa2 tc">
				<div
					className={cx('current-task mv2', state.currentTask ? 'selected' : 'blank')}>
					{state.currentTask || 'select task'}
				</div>
				<Timer
					className="timer mb2"
					timerState={state.timerState}
					startTimestamp={state.startTimestamp}
				/>
				<div>
					{playOrPaused}
					<button className="ma2" onClick={() => store.stopTimer()}>Stop</button>
				</div>
			</div>
		)
	}
}

render(<Toolbar/>, document.getElementById("root"));
