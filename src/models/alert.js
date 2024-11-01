class Alert {
  constructor() {
    this.show = false;
    this.color = "";
    this.icon = "";
    this.title = "";
    this.text = "";
  }

  setSuccess(message) {
    this.color = "success";
    this.icon = "$success";
    this.title = "Success";
    this.text = message;
    this.unhide();
  }

  setInfo(message) {
    this.color = "info";
    this.icon = "$info";
    this.title = "Info";
    this.text = message;
    this.unhide();
  }

  setError(message, code = null) {
    this.color = "error";
    this.icon = "$error";
    this.title = "Oops...";
    if (code) {
      this.text = `${message}. [${code}]`;
    } else {
      this.text = message || "";
    }
    this.unhide();
  }

  hide() {
    this.show = false;
  }

  unhide() {
    this.show = true;
  }
}

export default Alert;
