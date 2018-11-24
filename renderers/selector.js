import _ from 'lodash'
import { h, render, Component } from 'preact';
import { remote, ipcRenderer } from 'electron'
import Mousetrap from 'mousetrap';
import cx from 'classnames'
import Fuse from 'fuse.js'

import './selector.css'
import StoreAbstractBase from '../services/store_abstract_base.js'
import {loadData} from '../services/persistance.js'

const ADD_NEW_TASK = "<<<~ADD_NEW_TASK~>>>"

const initFuse = (filteredTaskNames) => {
	const nameData = filteredTaskNames.map((taskName) => ({ name: taskName }))
	return new Fuse(nameData, { keys: ['name'] })
}

class Store extends StoreAbstractBase {
	constructor() {
		super({
			taskSearch: '',
    	taskNames: [],
      filteredTaskNames: [ADD_NEW_TASK],
      selectedTaskIndex: 0,
			fuzzySearch: initFuse([])
		})

		loadData((data) => {
			if (data) {
				const taskNames = Object.keys(data.allTaskSessions)
				this.setState({
					taskNames: taskNames,
					fuzzySearch: initFuse(taskNames)
				})
			}
		})
	}

	selectTask(taskName) {
		const {filteredTaskNames, selectedTaskIndex, taskNames} = this.state
		const selectedOption = filteredTaskNames[selectedTaskIndex]
		let selectedTaskName;

		if (selectedOption === ADD_NEW_TASK) {
			if (!taskNames.includes(taskName)) {
				this.state.taskNames.push(taskName)
				this.state.fuzzySearch = initFuse(this.state.taskNames)
				selectedTaskName = taskName
    	} else {
				throw `Attempt to add duplicate task name ${taskName}, ${taskNames}`
			}
		} else {
			selectedTaskName = selectedOption
		}

		this.state.taskSearch = ''
		ipcRenderer.send('add-task', selectedTaskName) // TODO: rename
		this.triggerRender(() => {
			closeWindow()
		})
	}

	updateTaskSearch(newSearchString) {
    this.setState({
      taskSearch: newSearchString,
      filteredTaskNames: this.state.fuzzySearch.search(newSearchString).map(({ name }) => name).concat([ADD_NEW_TASK]),
      selectedTaskIndex: 0
    })
	}

  moveTaskSelectionUp() {
		const {selectedTaskIndex, filteredTaskNames} = this.state
		let newIndex = selectedTaskIndex - 1;
		if (newIndex < 0) {
			newIndex = filteredTaskNames.length - 1
		}

		this.setState({selectedTaskIndex: newIndex})
  }

  moveTaskSelectionDown() {
		const {selectedTaskIndex, filteredTaskNames} = this.state
		let newIndex = selectedTaskIndex + 1;
		if (newIndex > (filteredTaskNames.length - 1)) {
			newIndex = 0
		}

		this.setState({selectedTaskIndex: newIndex})
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
			props.onChange(e.target.value)
		}
	}

	render(props, state) {
  	return (
			<input
				{...(_.omit(props, ['onChange', 'debounceWaitTime']))}
				onInput={this.debouncedOnChange}
			/>
		)
	}
}

class SelectionDropdown extends Component {
	render ({ tasks, selectedTaskIndex }) {
		const taskItems = tasks.map((taskName, index) => {
			if (taskName === ADD_NEW_TASK) {
				return (
					<li
						className={cx("selection-dropdown-item create-task", {active: selectedTaskIndex === index})}>
						+ Create New Task
					</li>
				)
			} else {
				return (
					<li
						className={cx("selection-dropdown-item", {active: selectedTaskIndex === index})}>
						{taskName}
					</li>
				)
			}
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
			if (e.keyCode === 13) { // Enter
				if (this.state.taskSearch) {
					localStore.selectTask(this.state.taskSearch)
				} else {
					closeWindow()
				}
			} else if (e.keyCode === 38) { // Up Key
				localStore.moveTaskSelectionUp()
			} else if (e.keyCode === 40) { // Down Key
				localStore.moveTaskSelectionDown()
			}
		})

		window.addEventListener('keydown', (e) => {
			if (e.keyCode === 38) { // Up Key
				e.preventDefault()
			} else if (e.keyCode === 40) { // Down Key
				e.preventDefault()
			}
		})
	}

	render(props, state) {
		const {taskSearch, filteredTaskNames, selectedTaskIndex} = state
		let dropdown;

		if (taskSearch && taskSearch.length) {
			dropdown = <SelectionDropdown tasks={filteredTaskNames}  selectedTaskIndex={selectedTaskIndex} />
		}

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
					{dropdown}
				</div>
			</div>
		)
	}
}

render(<TaskSelector />, document.getElementById("root"));
