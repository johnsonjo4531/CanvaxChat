class PanTool extends Tool {
    constructor (...args) {
        super(...args);
        this.current = {
            x: null,
            y: null
        };
        this.panning = false;
        this.lastUpdate = null;
    }

    mousedown(e){
        this.panning = true;
        this.current.x = e.clientX;
        this.current.y = e.clientY;
    }

    mousemove (e) {
        if (!this.panning) { return; }
        if(this.lastUpdate && this.lastUpdate >= Date.now() - 10) {return;}

        this.lastUpdate = Date.now();

        this.pan(e.clientX, e.clientY, this.current.x, this.current.y);
        this.current.x = e.clientX;
        this.current.y = e.clientY;
    }

    pan(x0, y0, x1, y1){
        if(!this.panning) {return;}

        var panX = x1 - x0;
        var panY = y1 - y0;
        this.state.pan.x += panX;
        this.state.pan.y += panY;
        this.context.translate(panX, panY);
        this.state.resetCanvas();
    }

    mouseup(e)
    {
        if (!this.panning) { return; }
        this.panning = false;
        this.pan(e.clientX, e.clientY, this.current.x, this.current.y);
    }

}
