import {
  STORAGE_DB_NAME,
  STORAGE_DB_VERSION,
} from '../shared/constants';

export const STORE_NAMES = {
  stats: 'stats',
  quests: 'quests',
  completionLogs: 'completionLogs',
  userProfile: 'userProfile',
  appSettings: 'appSettings',
} as const;

export function hasIndexedDbSupport() {
  return typeof indexedDB !== 'undefined';
}

export function requestToPromise<T>(request: IDBRequest<T>) {
  return new Promise<T>((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export function transactionToPromise(transaction: IDBTransaction) {
  return new Promise<void>((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error);
  });
}

export function openAppDatabase() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(STORAGE_DB_NAME, STORAGE_DB_VERSION);

    request.onerror = () => reject(request.error);

    request.onupgradeneeded = () => {
      const database = request.result;

      if (!database.objectStoreNames.contains(STORE_NAMES.stats)) {
        database.createObjectStore(STORE_NAMES.stats, { keyPath: 'id' });
      }

      if (!database.objectStoreNames.contains(STORE_NAMES.quests)) {
        database.createObjectStore(STORE_NAMES.quests, { keyPath: 'id' });
      }

      if (!database.objectStoreNames.contains(STORE_NAMES.completionLogs)) {
        database.createObjectStore(STORE_NAMES.completionLogs, {
          keyPath: 'id',
        });
      }

      if (!database.objectStoreNames.contains(STORE_NAMES.userProfile)) {
        database.createObjectStore(STORE_NAMES.userProfile, {
          keyPath: 'id',
        });
      }

      if (!database.objectStoreNames.contains(STORE_NAMES.appSettings)) {
        database.createObjectStore(STORE_NAMES.appSettings, {
          keyPath: 'id',
        });
      }
    };

    request.onsuccess = () => resolve(request.result);
  });
}
