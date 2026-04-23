# Архітектура та Модель Даних (Core Architecture) — Актуальна версія

Цей документ фіксує цільову модель даних FeelUP після виконаного вирівнювання.

## 1. Фундаментальні принципи

1. **Header-Line Items**
- `orders` + `orderItems`
- `purchases` + `purchaseItems`

2. **Денормалізація цін і сум**
- в `items` зберігається зафіксована ціна на момент операції;
- в `items` зберігається `total`;
- в `orders/purchases` зберігається `totalAmount`.

3. **Soft Delete**
- фізичне видалення в робочих потоках заборонене;
- керування через `isDeleted`/`isArchived`.

4. **Immutable Audit Log**
- `logs`: create-only, без update/delete.

5. **Role-based Security Rules**
- доступ розділений за ролями `admin/manager/viewer`;
- глобальні permissive write-правила відсутні.

## 2. Колекції і ключові поля

### `users`
- `email`, `displayName`
- `role`: `admin | manager | viewer`
- `isActive`

### `clients`
- `name`, `phone`, `instagram`, `address`, `comment`
- `isArchived`, `isDeleted`
- `createdAt`, `updatedAt`

### `products`
- `name`, `category`, `size`, `color`
- `price`, `costPrice`
- `heliumVolume`, `minStock`
- `isArchived`, `isDeleted`

### `orders`
- `clientId`
- `status`: `Чернетка | В обробці | Виконано | Скасовано`
- `deliveryDate`
- `managerId`
- `extraCosts`, `comment`
- `totalAmount`
- `isDeleted`

### `orderItems`
- `orderId`, `productId`
- `qty`, `defect`
- `price`
- `total`
- `isDeleted`

### `purchases`
- `supplierName`
- `status`: `Чернетка | Обробляється | Оплачено | Борг | Скасовано`
- `deliveryCost`
- `totalAmount`
- `isDeleted`

### `purchaseItems`
- `purchaseId`, `productId`
- `qty`
- `costPrice`
- `total`
- `isDeleted`

### `logs`
- `userId`, `userEmail`
- `action`, `details`, `oldValue`, `newValue`
- `timestamp`

## 3. Інваріанти

1. Усі критичні операції виконуються транзакційно.
2. Складська доступність завжди перевіряється через `Free Stock` у транзакції.
3. Операції копіювання замовлення мають бути атомарними.
4. Журнал аудиту не можна редагувати або видаляти.

## 4. Перехідні (legacy) поля

Підтримуються тимчасово для сумісності:
- `orders.delivery` (legacy) -> `deliveryDate`
- `orders.manager` (legacy) -> `managerId`
- `purchases.supplier` (legacy) -> `supplierName`
- `purchaseItems.price` (legacy) -> `costPrice`

Ціль: поступово прибрати legacy-поля після фінальної стабілізації та повторної міграції.
