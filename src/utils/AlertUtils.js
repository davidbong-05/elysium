import Alert from "@/models/alert";

class AlertUtils {
  static buildSuccess(message) {
    return new Alert({
      color: "success",
      icon: "$success",
      title: "Success",
      message: message,
    });
  }

  static buildInfo(message) {
    return new Alert({
      color: "info",
      icon: "$info",
      title: "Info",
      message: message,
    });
  }

  static buildError(message, code = null) {
    return new Alert({
      show: true,
      color: "error",
      icon: "$error",
      title: "Oops...",
      code: code,
      message: message,
    });
  }
}

export default AlertUtils;
