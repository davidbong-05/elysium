import { openDB } from "idb";

class IndexDbClient {
  constructor(dbName, dbVersion, storeName, keyPath) {
    this.dbName = dbName;
    this.dbVersion = dbVersion;
    this.storeName = storeName;
    this.keyPath = keyPath;
  }

  initDB() {
    const storeName = this.storeName;
    const keyPath = this.keyPath;

    return openDB(this.dbName, this.dbVersion, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(storeName)) {
          db.createObjectStore(storeName, { keyPath: keyPath });
        }
      },
    });
  }
}

export default IndexDbClient;
