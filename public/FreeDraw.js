class FreeDraw extends Tool {
  constructor (...args) {
    super(...args);
    this.drawing = false;
    
  }

  mouseup (e) {
    if (!this.drawing) { return; }
    this.drawing = false;
    this.state.drawLine(this.shiftCurrent.x, this.shiftCurrent.y, this.shiftX(e.clientX), this.shiftY(e.clientY), this.state.color, true);
  }

  mousedown (e) {
    this.drawing = true;
    this.current.x = e.clientX;
    this.current.y = e.clientY;
  }

  mousemove (e) {
    if (!this.drawing) { return; }
    this.state.drawLine(this.shiftCurrent.x, this.shiftCurrent.y, this.shiftX(e.clientX), this.shiftY(e.clientY), this.state.color, true);
    this.current.x = e.clientX;
    this.current.y = e.clientY;
  }

  drawLine(x0, y0, x1, y1, color, emit) {
    this.context.beginPath();
    this.context.moveTo(x0, y0);
    this.context.lineTo(x1, y1);
    this.context.strokeStyle = color;
    this.context.lineWidth = 2;
    this.context.stroke();
    this.context.closePath();

    if (!emit) { return; }
    var w = this.context.canvas.width;
    var h = this.context.canvas.height;

    this.socket.emit('drawing', {
      x0: x0 / w,
      y0: y0 / h,
      x1: x1 / w,
      y1: y1 / h,
      color: color
    });
  }

  deactivate () {
    this.drawing = false;
  }
}