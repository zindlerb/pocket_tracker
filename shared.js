export class StoreAbstractBase {
	constructor(initialState) {
		this.state = initialState
  	this.componentContext = null
	}

	registerComponentContext(ctx) {
		this.componentContext = ctx
		this.triggerRender()
	}

	triggerRender() {
		this.componentContext.setState(this.state)
	}
}

// TIMER STATES
export const PLAYING = 'PLAYING'
export const PAUSED = 'PAUSED'
export const STOPPED = 'STOPPED'
export const MINIMIZED = 'MINIMIZED'
