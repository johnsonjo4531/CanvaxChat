class Tool {
  constructor (context, state, socket) {
    this.context = context;
    this.socket = socket;
    this.state = state;
    this.current = {
      x: null,
      y: null
    }
  }

  mouseup () {

  }

  mousedown () {
  
  }

  mousemove () {

  }

  activate () {
    
  }

  deactivate () {

  }

    get canvasBounds () {
        var rect = this.context.canvas.getBoundingClientRect();
        return {
            x: rect.left,
            y: rect.top
        }
    }

    shiftX (x) {
        return x - this.canvasBounds.x - this.state.pan.x;
    }

    shiftY (y) {
        return y - this.canvasBounds.y - this.state.pan.y;
    }

    get shiftCurrent () {
        return {
            x: this.shiftX(this.current.x),
            y: this.shiftY(this.current.y)
        }
    }
}