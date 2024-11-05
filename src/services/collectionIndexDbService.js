import BaseError from "@/models/errors/baseError";
import IndexDbClient from "./indexDbClient";
import NftColletion from "@/models/nftCollection";

const DB_NAME = "CollectionDB";
const DB_VERSION = 1;
const STORE_NAME = "collections";
const KEY_PATH = "address";

class CollectionIndexDbService {
  constructor() {
    this.dbClient = new IndexDbClient(
      DB_NAME,
      DB_VERSION,
      STORE_NAME,
      KEY_PATH
    );
  }

  addCollection = async (collection) => {
    try {
      const db = await this.dbClient.initDB();
      await db.put(STORE_NAME, collection);
    } catch (error) {
      BaseError.parse(error);
    }
  };

  getCollection = async (address) => {
    let collection = null;
    try {
      const db = await this.dbClient.initDB();
      const res = await db.get(STORE_NAME, address);
      if (res) {
        collection = NftColletion.parse(res);
      }
    } catch (error) {
      BaseError.parse(error);
    } finally {
      return collection;
    }
  };

  getAllCollections = async () => {
    let collections = [];
    try {
      const db = await this.dbClient.initDB();
      collections = db.getAll(STORE_NAME);
    } catch (error) {
      BaseError.parse(error);
    } finally {
      return collections;
    }
  };

  deleteCollection = async (address) => {
    try {
      const db = await this.dbClient.initDB();
      await db.delete(STORE_NAME, address);
    } catch (error) {
      BaseError.parse(error);
    }
  };
}

export default CollectionIndexDbService;
