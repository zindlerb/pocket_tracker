// total
// view:


import _ from 'lodash'
import { h, render, Component } from 'preact';
import { ipcRenderer, remote } from 'electron'
import cx from 'classnames'
import './toolbar.css'
import {timerStates} from '../services/constants.js'
import {toolbarTimerStore, toolbarStore} from '../services/toolbar_stores.js'
import Table from '../components/Table.js'
import {humanReadableTime, beginningOfDayTimestamp} from '../services/utilities.js'

const {PLAYING, PAUSED, STOPPED, MINIMIZED} = timerStates

ipcRenderer.on('toolbarHide', () => {
	if (toolbarStore.state.timerState === PLAYING) {
		toolbarStore.minimizeWindow()
	}
})

ipcRenderer.on('toolbarShow', () => {
	if (toolbarStore.state.timerState === MINIMIZED) {
		toolbarStore.resumeTask()
	}
})

ipcRenderer.on('add-task', (e, taskName) => {
	toolbarStore.startTask(taskName)
})

ipcRenderer.on('toggleTaskState', (e) => {
	if (toolbarStore.state.timerState === RUNNING) {
		toolbarStore.pauseTask()
	} else if (toolbarStore.state.timerState === PAUSED) {
		toolbarStore.startTask(toolbarStore.state.currentTask)
	}
})

class Timer extends Component {
	componentDidMount() {
		toolbarTimerStore.registerComponentContext(this)
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

class TaskLog extends Component {
	taskSessionSummary(taskSessions, taskName) {
		if (!taskSessions.length) return

		const totalDuration = taskSessions.reduce((total, { startTimestamp, endTimestamp }) => {
			return total + (endTimestamp - startTimestamp)
		}, 0)

		const totalDayDuration = taskSessions
			.filter(({ startTimestamp }) => startTimestamp > beginningOfDayTimestamp())
			.reduce((total, { startTimestamp, endTimestamp }) => {
				return total + (endTimestamp - startTimestamp)
			}, 0)

		return [taskName, humanReadableTime(totalDayDuration), humanReadableTime(totalDuration)]
	}

	render({ allTaskSessions }) {
		return (
			<Table
			className="task-log ph2"
			columnConfig={[
				{ label: 'Task', columnClass: 'tl', columnWidthPercentage: .6 },
				{ label: 'Today', columnClass: 'tr' },
				{ label: 'Total', columnClass: 'tr' },
			]}
			rows={
				_.compact(_.map(
					allTaskSessions,
					(taskSessions, taskName) => this.taskSessionSummary(taskSessions, taskName)
				))
			}
			/>
		)
	}
}

const Menu = ({ onClose }) => {
	return (
		<div className="pa3">
			<div className="clickable pa2 tc" onClick={onClose}>Back</div>
			<div className="clickable pa2 tc" onClick={() => toolbarStore.deleteData()}>Delete Data</div>
			<div className="clickable pa2 tc" onClick={() => {
				ipcRenderer.send('exit-app')
				remote.getCurrentWindow().close()
			}}>Exit App</div>
		</div>
	)
}

class Toolbar extends Component {
	constructor() {
		super()
		this.state = { isMenuOpen: false }
	}

	componentDidMount() {
		toolbarStore.registerComponentContext(this)
	}

	openMenu() {
		this.setState({ isMenuOpen: true })
	}

	closeMenu() {
		this.setState({ isMenuOpen: false })
	}

	render(props, state) {
		let playOrPaused = (
			<i
				className="fas fa-play"
				onClick={() => {
					if (state.currentTask) {
						toolbarStore.startTask(state.currentTask)
					}
				}}>
			</i>
		)
		if (state.timerState === PLAYING) {
			playOrPaused = (
				<i
					className="fas fa-pause"
					onClick={() => toolbarStore.pauseTask()}>
				</i>
			)
		}

		if (!state.isMenuOpen) {
			return (
				<div className="toolbar-container h-100">
					<div className="pt2 ph2 mb1 flex justify-between items-center">
						<div
							className={cx('current-task', state.currentTask ? 'selected' : 'blank')}>
							{state.currentTask || 'select task'}
						</div>
						<div className="dib menu-button clickable" onClick={this.openMenu.bind(this)}>
							Menu
						</div>
					</div>
					<div className="flex items-center mb3 ph2">
						<Timer className="timer" />
						<div className="flex">
						<div className="ml3 mr1">
							{playOrPaused}
						</div>
						<i
							className="fas fa-stop"
							onClick={() => toolbarStore.stopTask()}>
						</i>
						</div>
					</div>
					<div className="view-container mv1 ph2">
						<div className="dib">View:</div>
						<div className="view-dropdown relative dib mh2">
							<span>total</span>
							<i className="fas fa-angle-down mh1"></i>
						</div>
					</div>
					<TaskLog allTaskSessions={state.allTaskSessions} />
					<div className="hotkey-info pv1 w-100">
						<span className="mh2">Select Task: &#8984;+shift+c</span>
						<span className="mh2">Play/Pause: &#8984;+shift+p</span>
					</div>
				</div>
			)
		} else {
			return <Menu onClose={() => this.setState({ isMenuOpen: false })} />
		}
	}
}

render(<Toolbar/>, document.getElementById("root"));
