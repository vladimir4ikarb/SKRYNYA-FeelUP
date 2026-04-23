import { initializeApp, applicationDefault, cert, getApps } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import fs from 'node:fs';
import path from 'node:path';

const args = new Set(process.argv.slice(2));
const execute = args.has('--execute');
const serviceAccountPathArg = process.argv.find(a => a.startsWith('--service-account='));
const serviceAccountPath = serviceAccountPathArg ? serviceAccountPathArg.split('=')[1] : '';

if (!getApps().length) {
  if (serviceAccountPath) {
    const raw = fs.readFileSync(serviceAccountPath, 'utf8');
    initializeApp({ credential: cert(JSON.parse(raw)) });
  } else {
    initializeApp({ credential: applicationDefault() });
  }
}

const configPath = path.resolve(process.cwd(), 'firebase-applet-config.json');
let firestoreDatabaseId = '(default)';
if (fs.existsSync(configPath)) {
  const cfg = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  if (cfg.firestoreDatabaseId && typeof cfg.firestoreDatabaseId === 'string') {
    firestoreDatabaseId = cfg.firestoreDatabaseId;
  }
}
if (process.env.FIRESTORE_DATABASE_ID) {
  firestoreDatabaseId = process.env.FIRESTORE_DATABASE_ID;
}

const db = getFirestore(undefined, firestoreDatabaseId);

type Patch = Record<string, unknown>;

function toOrderPatch(data: any): Patch {
  const patch: Patch = {};
  if (!('deliveryDate' in data)) patch.deliveryDate = data.delivery || '';
  if (!('managerId' in data)) patch.managerId = data.manager || '';
  if (!('totalAmount' in data)) patch.totalAmount = 0;
  if (!('status' in data) || !['Чернетка', 'В обробці', 'Виконано', 'Скасовано'].includes(data.status)) {
    patch.status = 'Чернетка';
  }
  if (!('isDeleted' in data)) patch.isDeleted = false;
  return patch;
}

function toPurchasePatch(data: any): Patch {
  const patch: Patch = {};
  if (!('supplierName' in data)) patch.supplierName = data.supplier || '';
  if (!('totalAmount' in data)) patch.totalAmount = 0;
  if (!('status' in data) || !['Чернетка', 'Обробляється', 'Оплачено', 'Борг', 'Скасовано'].includes(data.status)) {
    patch.status = 'Чернетка';
  }
  if (!('isDeleted' in data)) patch.isDeleted = false;
  return patch;
}

function toPurchaseItemPatch(data: any): Patch {
  const patch: Patch = {};
  if (!('costPrice' in data)) patch.costPrice = typeof data.price === 'number' ? data.price : 0;
  if (!('total' in data)) patch.total = (Number(data.qty) || 0) * (Number(data.costPrice ?? data.price) || 0);
  if (!('isDeleted' in data)) patch.isDeleted = false;
  return patch;
}

function toOrderItemPatch(data: any): Patch {
  const patch: Patch = {};
  if (!('total' in data)) patch.total = (Number(data.qty) || 0) * (Number(data.price) || 0);
  if (!('isDeleted' in data)) patch.isDeleted = false;
  return patch;
}

function toUserPatch(data: any): Patch {
  const patch: Patch = {};
  if (!('isActive' in data)) patch.isActive = true;
  return patch;
}

function toClientPatch(data: any): Patch {
  const patch: Patch = {};
  if (!('createdAt' in data)) patch.createdAt = FieldValue.serverTimestamp();
  patch.updatedAt = FieldValue.serverTimestamp();
  if (!('isDeleted' in data)) patch.isDeleted = false;
  return patch;
}

async function migrateCollection(name: string, patchBuilder: (data: any) => Patch) {
  const snap = await db.collection(name).get();
  let changed = 0;
  let queued = 0;
  let batch = db.batch();

  for (const doc of snap.docs) {
    const patch = patchBuilder(doc.data());
    if (Object.keys(patch).length === 0) continue;
    changed += 1;

    if (execute) {
      batch.update(doc.ref, patch);
      queued += 1;
      if (queued === 400) {
        await batch.commit();
        batch = db.batch();
        queued = 0;
      }
    }
  }

  if (execute && queued > 0) await batch.commit();
  return { total: snap.size, changed };
}

async function main() {
  console.log(execute ? 'RUN MODE: EXECUTE' : 'RUN MODE: DRY-RUN');
  console.log(`TARGET DATABASE: ${firestoreDatabaseId}`);

  const plans = [
    ['orders', toOrderPatch],
    ['purchases', toPurchasePatch],
    ['orderItems', toOrderItemPatch],
    ['purchaseItems', toPurchaseItemPatch],
    ['users', toUserPatch],
    ['clients', toClientPatch]
  ] as const;

  for (const [collectionName, builder] of plans) {
    const result = await migrateCollection(collectionName, builder);
    console.log(`${collectionName}: total=${result.total}, will_change=${result.changed}`);
  }

  console.log('Done.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
