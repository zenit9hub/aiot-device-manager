import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import type { Firestore, QueryDocumentSnapshot } from 'firebase/firestore';
import { getFirebaseStore } from '../../../app/providers/firebase-provider';
import type { Device } from '../../../entities/device/device';

type DeviceListener = (devices: Device[]) => void;

const baseFallbackDevices: Omit<Device, 'id'>[] = [
  { name: 'Smart Meter #01', status: 'online', lastSeen: '1분 전', location: '서울 송파', topicPath: 'aiot/devices/smartmeter01/status' },
  { name: 'Temp Sensor #03', status: 'warning', lastSeen: '3분 전', location: '서울 강남', topicPath: 'aiot/devices/temp03/status' },
  { name: 'Humidity Node #05', status: 'offline', lastSeen: '12분 전', location: '부산 해운대', topicPath: 'aiot/devices/humidity05/status' },
];

const fallbackDevicesByUser = new Map<string, Device[]>();
const fallbackListenersByUser = new Map<string, Set<DeviceListener>>();

function mapSnapshot(snapshot: QueryDocumentSnapshot): Device {
  const data = snapshot.data();
  return {
    id: snapshot.id,
    name: data?.name ?? 'Unknown Device',
    status: (data?.status as Device['status']) ?? 'offline',
    lastSeen: data?.lastSeen ?? '알 수 없음',
    location: data?.location ?? '미지정',
    topicPath: data?.topicPath ?? '미지정',
  };
}

function getFallbackDevices(userId: string) {
  if (!fallbackDevicesByUser.has(userId)) {
    const clone = baseFallbackDevices.map((device, index) => ({
      ...device,
      id: `${device.name.replace(/\s+/g, '-').toLowerCase()}-${userId}-${index}`,
    }));
    fallbackDevicesByUser.set(userId, clone);
  }
  return fallbackDevicesByUser.get(userId)!;
}

function getFallbackListeners(userId: string) {
  if (!fallbackListenersByUser.has(userId)) {
    fallbackListenersByUser.set(userId, new Set());
  }
  return fallbackListenersByUser.get(userId)!;
}

function notifyFallback(userId: string) {
  const snapshot = getFallbackDevices(userId).slice();
  getFallbackListeners(userId).forEach((listener) => listener(snapshot));
}

function useFallback(userId: string, listener: DeviceListener) {
  const listeners = getFallbackListeners(userId);
  listeners.add(listener);
  const timer = setTimeout(() => {
    listener(getFallbackDevices(userId).slice());
  }, 0);
  return () => {
    clearTimeout(timer);
    listeners.delete(listener);
  };
}

const ROOT_USER_DATA = 'users';

function resolveUser(userId: string | null) {
  return userId ?? 'demo-user';
}

function resolveUserDevicesCollection(store: Firestore, userId: string) {
  return collection(store, ROOT_USER_DATA, userId, 'devices');
}

export function subscribeToDevices(userId: string | null, listener: DeviceListener) {
  const resolvedUserId = resolveUser(userId);
  const store = getFirebaseStore();
  if (!store) {
    return useFallback(resolvedUserId, listener);
  }

  const userDevices = resolveUserDevicesCollection(store, resolvedUserId);
  const devicesQuery = query(userDevices, orderBy('createdAt', 'desc'));

  let fallbackCleanup = () => {};

  const unsubscribe = onSnapshot(
    devicesQuery,
    (snapshot) => {
      listener(snapshot.docs.map((doc) => mapSnapshot(doc)));
    },
    (error) => {
      console.warn('[device-repository] Firestore subscription failed', error);
      fallbackCleanup = useFallback(resolvedUserId, listener);
    },
  );

  return () => {
    unsubscribe();
    fallbackCleanup();
  };
}

export async function createDevice(userId: string, payload: Omit<Device, 'id'>) {
  const resolvedUserId = resolveUser(userId);
  const store: Firestore | null = getFirebaseStore();
  if (!store) {
    const devices = getFallbackDevices(resolvedUserId);
    const id = `mock-${Date.now()}`;
    const newDevice: Device = {
      id,
      name: payload.name,
      location: payload.location,
      status: payload.status,
      topicPath: payload.topicPath ?? `aiot/devices/${id}/status`,
      lastSeen: payload.lastSeen ?? '방금',
    };
    devices.unshift(newDevice);
    notifyFallback(resolvedUserId);
    return newDevice;
  }

  const userDevices = resolveUserDevicesCollection(store, resolvedUserId);
  const docRef = await addDoc(userDevices, {
    userId: resolvedUserId,
    ...payload,
    createdAt: serverTimestamp(),
    lastSeen: payload.lastSeen ?? new Date().toISOString(),
  });

  return { id: docRef.id, ...payload };
}

export async function updateDeviceStatus(_userId: string, deviceId: string, status: Device['status']) {
  const resolvedUserId = resolveUser(_userId);
  const store: Firestore | null = getFirebaseStore();
  if (!store) {
    const devices = getFallbackDevices(resolvedUserId);
    const target = devices.find((item) => item.id === deviceId);
    if (target) {
      target.status = status;
      target.lastSeen = '방금';
      notifyFallback(resolvedUserId);
    }
    return target ?? null;
  }

  const userDevices = resolveUserDevicesCollection(store, resolvedUserId);
  await updateDoc(doc(userDevices, deviceId), {
    status,
    lastSeen: new Date().toISOString(),
  });
  return { id: deviceId, status } as Device;
}

export async function deleteDevice(_userId: string, deviceId: string) {
  const resolvedUserId = resolveUser(_userId);
  const store: Firestore | null = getFirebaseStore();
  if (!store) {
    const devices = getFallbackDevices(resolvedUserId);
    const index = devices.findIndex((item) => item.id === deviceId);
    if (index >= 0) {
      devices.splice(index, 1);
      notifyFallback(resolvedUserId);
      return true;
    }
    return false;
  }

  const userDevices = resolveUserDevicesCollection(store, resolvedUserId);
  await deleteDoc(doc(userDevices, deviceId));
  return true;
}
