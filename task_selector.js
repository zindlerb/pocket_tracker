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
		console.log('addTask', taskName)
		this.state.taskNames.add(taskName)
		ipcRenderer.send('add-task', taskName)
		closeWindow()
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
	render (props) {
		console.log('SelectionDropdown PROPS', props)
		const taskItems = Array.from(props.tasks).map((taskName) => {
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
		console.log('state', state)

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
					<SelectionDropdown tasks={state.taskNames || []} />
				</div>
			</div>
		)
	}
}

render(<TaskSelector />, document.getElementById("root"));
