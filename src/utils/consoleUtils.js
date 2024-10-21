class ConsoleUtils {
  static displayError(error) {
    if (
      error &&
      typeof error.code !== "undefined" &&
      typeof error.message !== "undefined"
    ) {
      if (typeof error.code !== "undefined") {
        console.log(`⚠️ Code: ${error.code}.`);
      }
      console.log(`⚠️ Message: ${error.message}`);
    } else {
      console.warn("⚠️ Invalid error object provided.");
    }
  }
}

export default ConsoleUtils;
