class ConsoleUtils {
  static displayError(error) {
    if (
      error &&
      typeof error.code !== "undefined" &&
      typeof error.message !== "undefined"
    ) {
      if (typeof error.name !== "undefined") {
        console.log(`⚠️ Name    : ${error.name}.`);
      }
      if (typeof error.code !== "undefined") {
        console.log(`⚠️ Code    : [${error.code}]`);
      }
      console.log(`⚠️ Message : ${error.message}`);
    } else {
      console.error(error);
    }
  }
}

export default ConsoleUtils;
