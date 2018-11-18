import _ from 'lodash'
import './task_selector.css'
import { h, render, Component } from 'preact';
import { remote, ipcRenderer } from 'electron'
import Mousetrap from 'mousetrap';
import {StoreAbstractBase} from './shared.js'

class Store extends StoreAbstractBase {
	constructor() {
		super({
			taskSearch: '',
    	taskNames: new Set([])
		})
	}

	addTask(taskName) {
		this.state.taskNames.add(taskName)
		this.state.taskSearch = ''
		ipcRenderer.send('add-task', taskName)
		this.triggerRender(() => {
			closeWindow()
		})
	}

	updateTaskSearch(newSearchString) {
		this.state.taskSearch = newSearchString
		this.triggerRender()
	}
}

const localStore = new Store()

const closeWindow = () => {
	remote.getCurrentWindow().hide()
}

class BlurInput extends Component {
	constructor() {
		super()
  	this.state = { isEditing: false, temporaryValue: null }
	}

	onChange(e) {
		this.setState({ temporaryValue:  e.target.value })
	}

	onFocus(e) {
		this.setState({ isEditing: true, temporaryValue: this.props.value })
	}

	onBlur(e) {
		this.props.onBlur(this.state.temporaryValue)
		this.setState({ isEditing: false, temporaryValue: null })
	}

	render(props, state) {
		let value = props.value
		if (state.isEditing) {
			value = state.temporaryValue
		}

  	return <input className={props.className} value={value} />
	}
}

class DebouncedInput extends Component {
	constructor(props) {
		super()
		if (!props.onChange) throw "Must provide onChange callback to props"

		/*
			TODO: make this actually debounce lol

			this.debouncedOnChange = _.debounce(
			(e) => {
				console.log('called', e)
				props.onChange(e.target.value)
			},
			props.debounceWaitTime || 200
			)
		*/


		this.debouncedOnChange = (e) => {
			console.log('called', e)
			props.onChange(e.target.value)
		}
	}

	render(props, state) {
		console.log(_.omit(props, ['onChange', 'debounceWaitTime']))

  	return (
			<input
				{...(_.omit(props, ['onChange', 'debounceWaitTime']))}
				onInput={this.debouncedOnChange}
			/>
		)
	}
}

class SelectionDropdown extends Component {
	render ({ tasks, taskSearch }) {
		if (!tasks.length || !taskSearch) return <div/>

		let filteredTaskSelections = tasks.filter((taskName) => {
			return taskName.indexOf(taskSearch) > -1
		})

		const taskItems = filteredTaskSelections.map((taskName) => {
    	return <li className="selection-dropdown-item">{taskName}</li>
		})

		return (
			<ul className="selection-dropdown">
				{taskItems}
			</ul>
		)
	}
}


class TaskSelector extends Component {
	constructor() {
		super()
    this.state = {
    	currentTask: ''
		}
	}

	componentDidMount() {
		localStore.registerComponentContext(this)

		window.addEventListener('keyup', (e) => {
			if (e.keyCode === 13) { // Enter Pressed
				// TODO: handle moving the dropdown selection
				localStore.addTask(this.state.taskSearch)
			}
		})
	}

	render(props, state) {
		const {taskSearch, taskNames} = state
		const tasksArray = Array.from(taskNames || [])

		return (
			<div onClick={closeWindow} className="task-selector-container">
				<div className="task-selector-dropdown">
					<DebouncedInput
						value={state.taskSearch}
						className="task-selector-input"
						autofocus={true}
						onChange={(value) => {
							localStore.updateTaskSearch(value)
						}}
					/>
					<SelectionDropdown tasks={tasksArray} taskSearch={taskSearch} />
				</div>
			</div>
		)
	}
}

render(<TaskSelector />, document.getElementById("root"));
