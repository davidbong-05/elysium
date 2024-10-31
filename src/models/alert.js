class Alert {
  constructor({ color, icon, title, code, message }) {
    this.show = true;
    this.color = color || "";
    this.icon = icon || "";
    this.title = title || "";
    if (code) {
      this.text = `${message}. [${code}]`;
    } else {
      this.text = message || "";
    }
    this.displayInfo();
  }

  displayInfo() {
    console.log(`💬 (${alert.title}) ${alert.text}`);
  }
}

export default Alert;
