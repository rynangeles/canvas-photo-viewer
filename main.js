class Canvas {
  element;
  context;
  styles;
  size;
  embeds = [];
  constructor(element, styles) {
    this.element = element;
    this.context = this.element.getContext('2d');
    this.styles = styles;
    this.size = {
      width: window.innerWidth,
      height: window.innerHeight
    }
  }

  embed(object) {
    this.embeds.push(object);
  }

  on(trigger, callback) {
    const [instance, event] = trigger.split(':');
    this.element.addEventListener(event, e => {
      this.embeds.forEach((object, index) => {
        if (object.constructor.name === instance) {
          const rect = this.element.getBoundingClientRect();
          const target = { x: e.clientX - rect.left, y: e.clientY - rect.top };
          if (object.within(target)) callback({ event: e, target: object, index });
        }
      })
    });
  }

  render() {
    const { width, height } = this.size;
    this.element.width = width;
    this.element.height = height;
    Object.keys(this.styles).forEach(style => this.element.style[style] = this.styles[style]);
  }
}

class Button {
  id;
  label;
  position;
  size;
  fontSize = 16;
  lineWidth = 1;
  disabled = false;
  _counter = 0;
  constructor(id, label, position, size) {
    this.id = id;
    this.label = label;
    this.position = position;
    this.size = size;
    const j6w = JSON.parse(window.localStorage.getItem('j6w') || '{}');
    this._counter = j6w[this.id] || 0;
  }

  get counter() {
    return this._counter;
  }

  set counter(count) {
    this._counter = count;
    const j6w = JSON.parse(window.localStorage.getItem('j6w') || '{}');
    window.localStorage.setItem('j6w', JSON.stringify({...j6w, [this.id]: this._counter}));
  }

  within({ x, y }) {
    const { width, height } = this.size;
    const { x: objectX, y: objectY } = this.position;
    return y > objectY && y < objectY + height && x > objectX && x < objectX + width;
  }

  render(context) {
    const { width, height } = this.size;
    const { x, y } = this.position;
    context.clearRect(x - this.lineWidth, y - this.lineWidth, width + (this.lineWidth * 2), height + (this.lineWidth * 2));
    context.beginPath();
    context.rect(x, y, width, height);
    context.lineWidth = this.lineWidth;
    context.stroke();
    context.fillStyle = this.disabled ? 'grey' : 'black';
    context.fill();
    context.font = `${this.fontSize}px Helvetica`;
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillStyle = "white";
    context.fillText(`${this.label}`, x + (width / 2), y + (height / 2));
  }
}

class Viewer {
  lineWidth = 1;
  position;
  size;
  constructor(position, size) {
    this.position = position;
    this.size = size;
  }

  async download(id) {
    const response = await fetch(`https://api.unsplash.com/photos/${id}`, {
      method: 'GET',
      headers: {
        Authorization: 'Client-ID c7x2LvInC-dGx1sKQwbuQu2suBEWKbRXgk6MPf04jYY'
      }
    })
    return response.json();
  }

  render(context, imageUrl) {
    const { width, height } = this.size;
    const { x, y } = this.position;
    context.clearRect(x - this.lineWidth, y - this.lineWidth, width + (this.lineWidth * 2), height + (this.lineWidth * 2));
    context.beginPath();
    context.rect(x, y, width, height);
    context.lineWidth = this.lineWidth;
    context.stroke();
    if (!!imageUrl) {
      var img = new Image();
      img.src = imageUrl;
      img.onload = function () {
        context.fillStyle = 'black';
        context.fill();
        var scale = Math.min(width / img.width, height / img.height);
        const nx = x + ((width / 2) - (img.width / 2) * scale);
        const ny = y + ((height / 2) - (img.height / 2) * scale);
        context.drawImage(img, nx, ny, img.width * scale, img.height * scale);
      }
    }
  }
}

class Console {
  padding = 20;
  lineWidth = 1;
  fontSize = 16;
  logs = [];
  position;
  size;

  render(context) {
    const { padding, lineWidth } = this;
    const width = context.canvas.width - (padding * 2);
    const height = (this.logs.length * this.fontSize) + padding;

    this.size = { width, height };

    const x = padding;
    const y = context.canvas.height - (height + padding);

    this.position = { x, y }

    context.clearRect(x - lineWidth, y - lineWidth, width + (lineWidth * 2), height + (lineWidth * 2));
    context.beginPath();
    context.rect(x, y, width, height);
    context.lineWidth = lineWidth;
    context.fillStyle = 'black';
    context.fill();
    context.stroke();
    context.font = `${this.fontSize}px Courier New`;

    this.logs.forEach((log, index) => {
      const height = this.fontSize;
      context.fillStyle = 'white';
      context.fillText(log, x + (width / 2), y + height * index + (height / 2) + (padding / 2));
    });
  }
}

const canvas = new Canvas(document.getElementById('canvas'), { background: '#EAEAEA' });
canvas.render();

const padding = 20;
const buttonHeight = 50;
const buttonWidth = (canvas.size.width - (padding * 3)) / 2;

// buttons
const btn1 = new Button('Nr88sR3i4Tg', 'Button 1', { x: padding, y: padding }, { width: buttonWidth, height: buttonHeight });
canvas.embed(btn1);
btn1.render(canvas.context);

const btn2 = new Button('vunx8bmlees', 'Button 2', { x: buttonWidth + (padding * 2), y: padding }, { width: buttonWidth, height: buttonHeight });
btn2.render(canvas.context);
canvas.embed(btn2);

const btn3 = new Button('udvwVkU7jyw', 'Button 3', { x: padding, y: (buttonHeight + padding * 2) }, { width: buttonWidth, height: buttonHeight });
btn3.render(canvas.context);
canvas.embed(btn3);

const btn4 = new Button('JBSON8KeFYM', 'Button 4', { x: buttonWidth + (padding * 2), y: (buttonHeight + padding * 2) }, { width: buttonWidth, height: buttonHeight });
btn4.render(canvas.context);
canvas.embed(btn4);

// console
const output = new Console();
output.logs = canvas.embeds.map(object => `${object.label} - ${object.counter}`);
output.render(canvas.context);

// viewer
const viewerX = padding;
const viewerY = (buttonHeight * 2) + (padding * 3);
const viewerWidth = (canvas.size.width - padding * 2);
const viewerHeight = canvas.size.height - (viewerY + output.size.height) - (padding * 2);
const viewer = new Viewer({ x: viewerX, y: viewerY }, { width: viewerWidth, height: viewerHeight });
viewer.render(canvas.context);

// button click event
canvas.on('Button:click', e => {
  if (e.target.disabled) return;
  canvas.embeds.forEach(object => object.disabled = false);
  e.target.disabled = true;
  e.target.render(canvas.context);
  viewer.download(e.target.id)
    .then(data => {
      e.target.counter++;
      e.target.disabled = false;
      e.target.render(canvas.context);
      output.logs = canvas.embeds.map(object => `${object.label} - ${object.counter}`);
      output.render(canvas.context);
      viewer.render(canvas.context, data.urls.regular);
    });
});
