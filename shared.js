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
