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
			allTaskSessions: {}
		})

		this.timerStore = timerStore
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
		this.state.allTaskSessions[this.state.currentTask].push({
    	startTimestamp: this.timerStore.state.startTimestamp,
			endTimestamp: Date.now()
		})

		this.state.timerState = STOPPED
		this.triggerRender()
		this.timerStore.stop()
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

class TimerStore extends StoreAbstractBase {
  constructor() {
		super({})
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

ipcRenderer.on('toggleTaskState', (e) => {
	if (store.state.timerState === RUNNING) {
		store.pauseTask()
	} else if (store.state.timerState === PAUSED) {
		store.startTask(store.state.currentTask)
	}
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

const secondInMillis = 1000
const minuteInMillis = 60 * secondInMillis
const hourInMillis = 60 * minuteInMillis
const dayInMillis = 24 * hourInMillis

const humanReadableTime = (milliseconds) => {
	const precision = 1
	if (milliseconds > dayInMillis) {
		return `${_.floor(milliseconds/dayInMillis, precision)} days`
	} else if (milliseconds > hourInMillis) {
		return `${_.floor(milliseconds/hourInMillis, precision)} hrs`
	} else if (milliseconds > minuteInMillis) {
		return `${_.floor(milliseconds/minuteInMillis, precision)} mins`
	} else {
		return `${_.floor(milliseconds/secondInMillis, precision)} secs`
	}
}

const beginningOfDayTimestamp = () => {
  var now = new Date();
	return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

class Table extends Component {
	render({ className, columnConfig, rows }) { // Open Q. Do obj or positional here?
		/*
			column config:
				columnClass
				style
				label

				column config could take a custom renderer (not good here but could be good for bz?)

				it should handle scroll in a generally acceptable way
					scroll on body - body has column flex grow and overflows to bottom of container

				per the css tricks article are the rows even needed?
					they may be nicer for outward styling..
		*/

		return (
			<div className={cx('table', className)}>
				<div className="header row flex">
					{columnConfig.map(({ label, columnClass, columnStyle }) => <div className={cx("column-item", columnClass, columnStyle)}>{label}</div>)}
				</div>
				{
					rows.map((columnItems) => {
						return (
							<div className="row flex">
								{
									columnItems.map((columnItem, colInd) => {
										return (
											<div
												className={cx("column-item", columnConfig[colInd].columnClass, columnConfig[colInd].columnStyle)}>
												{columnItem}
											</div>
										)
									})
								}
							</div>
						)
					})
				}
			</div>
		)
	}
}

class TaskLog extends Component {
	taskSessionSummary(taskSessions, taskName) {
		const totalDuration = taskSessions.reduce((total, { startTimestamp, endTimestamp }) => {
			return total + (endTimestamp - startTimestamp)
		}, 0)

		const totalDayDuration = taskSessions
			.filter(({ startTimestamp }) => startTimestamp > beginningOfDayTimestamp())
			.reduce((total, { startTimestamp, endTimestamp }) => {
     		return total + (endTimestamp - startTimestamp)
			}, 0)

		return (
			<div className="task-log-row cf pv2">
				<div className="task-name fl ph1">{taskName}</div>
				<div className="day-amount fr ph1">{humanReadableTime(totalDayDuration)}</div>
				<div className="total-amount fr ph1">{humanReadableTime(totalDuration)}</div>
			</div>
		)
	}

	render({ allTaskSessions }) {
		return (
			<div>
				<div className="task-log-headers">
					<div>Task</div>
					<div>Today</div>
					<div>Total</div>
				</div>
				{
					_.map(
						allTaskSessions,
						(taskSessions, taskName) => this.taskSessionSummary(taskSessions, taskName)
					)
				}
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
				<TaskLog allTaskSessions={state.allTaskSessions} />
			</div>
		)
	}
}

render(<Toolbar/>, document.getElementById("root"));
