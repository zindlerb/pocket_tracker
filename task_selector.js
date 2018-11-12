import _ from 'lodash'
import './task_selector.css'
import { h, render, Component } from 'preact';
import { remote } from 'electron'

console.log(document.getElementById("root"))

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
  	this.debouncedOnChange = _.debounce(
			(e) => { props.onChange(e.target.value) },
			props.debounceWaitTime || 200
		)
	}

	render(props, state) {
  	return (
			<input
				{...(_.omit(props, ['onChange', 'debounceWaitTime']))}
				onChange={this.debouncedOnChange}
			/>
		)
	}
}


class TaskSelector extends Component {
	render(props, state) {
		return (
			<div onClick={closeWindow} className="task-selector-container">
				<div className="task-selector-dropdown">
					<DebouncedInput
						className="task-selector-input"
						autofocus={true}
						onChange={(value) => {
							console.log('value', value)
						}}
					/>
				</div>
			</div>
		)
	}
}

render(<TaskSelector />, document.getElementById("root"));
