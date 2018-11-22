import _ from 'lodash'
import { h, render, Component } from 'preact';
import {PLAYING, PAUSED, STOPPED, MINIMIZED} from './shared.js'
import { ipcRenderer } from 'electron'
import './toolbar.css'
import cx from 'classnames'
import {toolbarTimerStore, toolbarStore} from './services/toolbar_stores.js'

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

const secondInMillis = 1000
const minuteInMillis = 60 * secondInMillis
const hourInMillis = 60 * minuteInMillis
const dayInMillis = 24 * hourInMillis

const humanReadableTime = (milliseconds) => {
	const precision = 1
	if (milliseconds > dayInMillis) {
		return `${_.floor(milliseconds/dayInMillis, precision)}d`
	} else if (milliseconds > hourInMillis) {
		return `${_.floor(milliseconds/hourInMillis, precision)}h`
	} else if (milliseconds > minuteInMillis) {
		return `${_.floor(milliseconds/minuteInMillis, precision)}m`
	} else {
		return `${_.floor(milliseconds/secondInMillis, precision)}s`
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
		*/

		let totalFixedColumnPercentage = columnConfig.reduce((total, { columnWidthPercentage }) => total + (columnWidthPercentage || 0), 0)
		if (totalFixedColumnPercentage > 1) { // TODO: should also have is number check here
			throw "Invalid column config. Must not have the sum of the column width percentages exceed 1."
		}

		let numberOfUnfixedColumns = columnConfig.filter(({ columnWidthPercentage }) => !columnWidthPercentage).length
		let sizeOfUnfixedColumn = (1 - totalFixedColumnPercentage) / numberOfUnfixedColumns // TODO: for perf these calculations should really be cached.
		console.log('sizeOfUnfixedColumn', sizeOfUnfixedColumn)
		const headerColumns = columnConfig.map(({ label, columnClass, columnWidthPercentage }) => {
			console.log('columnWidthPercentage', columnWidthPercentage)
			return (
				<div
					className={cx("column-item", columnClass)}
					style={{ width: `${(columnWidthPercentage || sizeOfUnfixedColumn) * 100}%` }}>
					{label}
				</div>
			)
		})

		return (
			<div className={cx('table w-100', className)}>
				<div className="header row flex tl">
					{headerColumns}
				</div>
				{
					rows.map((columnItems) => {
						return (
							<div className="row flex tl">
								{
									columnItems.map((columnItem, colInd) => {
										const { columnClass, columnWidthPercentage } = columnConfig[colInd]
										return (
											<div
												className={cx("column-item", columnClass)}
												style={{width: `${(columnWidthPercentage || sizeOfUnfixedColumn) * 100}%`}}>
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
		console.log('allTaskSessions', allTaskSessions)

		return (
			<Table
			className="task-log"
			columnConfig={[
				{ label: 'Task', columnClass: 'tl', columnWidthPercentage: .5 },
				{ label: 'Today', columnClass: 'tl' },
				{ label: 'Total', columnClass: 'tl' },
			]}
			rows={
				_.map(
					allTaskSessions,
					(taskSessions, taskName) => this.taskSessionSummary(taskSessions, taskName)
				)
			}
			/>
		)
	}
}

class Toolbar extends Component {
	constructor() {
		super()
		this.state = {}
	}

	componentDidMount() {
		toolbarStore.registerComponentContext(this)
	}

	render(props, state) {
		let playOrPaused = (
			<button
				className={cx("ma2", { disabled: !state.currentTask })}
				onClick={() => {
					if (state.currentTask) {
						toolbarStore.startTask(state.currentTask)
					}
				}}>
				Play
			</button>
		)
		if (state.timerState === PLAYING) {
			playOrPaused = <button className="ma2" onClick={() => toolbarStore.pauseTask()}>Pause</button>
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
					<button className="ma2" onClick={() => toolbarStore.stopTask()}>Stop</button>
				</div>
				<TaskLog allTaskSessions={state.allTaskSessions} />
			</div>
		)
	}
}

render(<Toolbar/>, document.getElementById("root"));
