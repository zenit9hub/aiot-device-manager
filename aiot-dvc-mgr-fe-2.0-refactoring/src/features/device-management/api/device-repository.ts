import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  Firestore,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import type { QueryDocumentSnapshot } from 'firebase/firestore';
import { getFirebaseStore } from '../../../app/providers/firebase-provider';
import { Device } from '../../../entities/device/device';

type DeviceListener = (devices: Device[]) => void;

const fallbackDevices: Device[] = [
  { id: 'device-1', name: 'Smart Meter #01', status: 'online', lastSeen: '1분 전', location: '서울 송파' },
  { id: 'device-2', name: 'Temp Sensor #03', status: 'warning', lastSeen: '3분 전', location: '서울 강남' },
  { id: 'device-3', name: 'Humidity Node #05', status: 'offline', lastSeen: '12분 전', location: '부산 해운대' },
];

function mapSnapshot(snapshot: QueryDocumentSnapshot): Device {
  const data = snapshot.data();
  return {
    id: snapshot.id,
    name: data?.name ?? 'Unknown Device',
    status: (data?.status as Device['status']) ?? 'offline',
    lastSeen: data?.lastSeen ?? '알 수 없음',
    location: data?.location ?? '미지정',
  };
}

function useFallback(listener: DeviceListener) {
  const timer = setTimeout(() => listener(fallbackDevices.slice()), 150);
  return () => clearTimeout(timer);
}

export function subscribeToDevices(userId: string | null, listener: DeviceListener) {
  const store = getFirebaseStore();
  if (!store || !userId) {
    return useFallback(listener);
  }

  const devicesQuery = query(
    collection(store, 'devices'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
  );

  return onSnapshot(devicesQuery, (snapshot) => {
    listener(snapshot.docs.map((doc) => mapSnapshot(doc)));
  });
}

export async function createDevice(userId: string, payload: Omit<Device, 'id'>) {
  const store: Firestore | null = getFirebaseStore();
  if (!store) {
    const id = `mock-${Date.now()}`;
    fallbackDevices.unshift({ ...payload, id, lastSeen: payload.lastSeen ?? '방금' });
    return fallbackDevices[0];
  }

  const docRef = await addDoc(collection(store, 'devices'), {
    userId,
    ...payload,
    createdAt: serverTimestamp(),
    lastSeen: payload.lastSeen ?? new Date().toISOString(),
  });

  return { id: docRef.id, ...payload };
}

export async function updateDeviceStatus(userId: string, deviceId: string, status: Device['status']) {
  const store: Firestore | null = getFirebaseStore();
  if (!store) {
    const target = fallbackDevices.find((item) => item.id === deviceId);
    if (target) {
      target.status = status;
      target.lastSeen = '방금';
    }
    return target ?? null;
  }

  await updateDoc(doc(store, 'devices', deviceId), {
    status,
    lastSeen: new Date().toISOString(),
  });
  return { id: deviceId, status } as Device;
}

export async function deleteDevice(userId: string, deviceId: string) {
  const store: Firestore | null = getFirebaseStore();
  if (!store) {
    const index = fallbackDevices.findIndex((item) => item.id === deviceId);
    if (index >= 0) {
      fallbackDevices.splice(index, 1);
      return true;
    }
    return false;
  }

  await deleteDoc(doc(store, 'devices', deviceId));
  return true;
}
