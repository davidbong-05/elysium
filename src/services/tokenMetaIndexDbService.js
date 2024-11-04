import BaseError from "@/models/errors/baseError";
import IndexDbClient from "./indexDbClient";

const DB_NAME = "TokenMetaDB";
const DB_VERSION = 1;
const STORE_NAME = "tokenMetas";
const KEY_PATH = "hash";

class TokenMetaIndexDbService {
  constructor() {
    this.dbClient = new IndexDbClient(
      DB_NAME,
      DB_VERSION,
      STORE_NAME,
      KEY_PATH
    );
  }

  addTokenMeta = async (token) => {
    try {
      const db = await this.dbClient.initDB();
      await db.put(STORE_NAME, token);
    } catch (error) {
      BaseError.parse(error);
    }
  };

  getTokenMeta = async (hash) => {
    let tokenMeta = null;
    try {
      const db = await this.dbClient.initDB();
      tokenMeta = db.get(STORE_NAME, hash);
    } catch (error) {
      BaseError.parse(error);
    } finally {
      return tokenMeta;
    }
  };

  getAllTokenMetas = async () => {
    let tokenMetas = [];
    try {
      const db = await this.dbClient.initDB();
      tokenMetas = db.getAll(STORE_NAME);
    } catch (error) {
      BaseError.parse(error);
    } finally {
      return tokenMetas;
    }
  };

  deleteTokenMeta = async (hash) => {
    try {
      const db = await this.dbClient.initDB();
      await db.delete(STORE_NAME, hash);
    } catch (error) {
      BaseError.parse(error);
    }
  };
}

export default TokenMetaIndexDbService;
