export class StoreAbstractBase {
	constructor(initialState) {
		this.state = initialState
  	this.componentContext = null
	}

	registerComponentContext(ctx) {
		this.componentContext = ctx
		this.triggerRender()
	}

	setState(newState) {
		Object.assign(this.state, newState)
		this.triggerRender()
	}

	triggerRender(onUpdateCallback) {
		if (!this.componentContext) return;
		this.componentContext.setState(this.state, onUpdateCallback)
	}
}

// TIMER STATES
export const PLAYING = 'PLAYING'
export const PAUSED = 'PAUSED'
export const STOPPED = 'STOPPED'
export const MINIMIZED = 'MINIMIZED'
