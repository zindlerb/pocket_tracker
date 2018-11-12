import _ from 'lodash'
import './task_selector.css'
import { h, render, Component } from 'preact';
import { remote } from 'electron'
import Mousetrap from 'mousetrap';

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


class TaskSelector extends Component {
	constructor() {
		super()
    this.state = {
    	currentTask: ''
		}
	}

	componentDidMount() {
		window.addEventListener('keyup', (e) => {
			if (e.keyCode === 13) { // Enter Pressed
				console.log('wowo', 'wowoww')
				console.log('creating current task', this.state.currentTask)
			}
		})
	}

	render(props, state) {
		return (
			<div onClick={closeWindow} className="task-selector-container">
				<div className="task-selector-dropdown">
					<DebouncedInput
						value={state.currentTask}
						className="task-selector-input"
						autofocus={true}
						onChange={(value) => {
							console.log('set current task', value)
							this.setState({ currentTask: value })
						}}
					/>
				</div>
			</div>
		)
	}
}

render(<TaskSelector />, document.getElementById("root"));
