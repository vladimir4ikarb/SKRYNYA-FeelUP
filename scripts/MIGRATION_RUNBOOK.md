# Migration Runbook

## Цель
Привести данные в Firestore к новой схеме (Stage 2 compliance).

## Шаги
1. **Резервное копирование**: Перед запуском создайте бэкап системы через Admin Tab -> Trigger Backup.
2. **Dry Run**: Просмотрите код `scripts/migrate-schema.ts` на предмет логики.
3. **Запуск**:
   ```bash
   npx tsx scripts/migrate-schema.ts
   ```
4. **Проверка**: Откройте Firebase Console или Tab приложения и убедитесь, что старые закупки имеют имя поставщика и статусы переведены.

## Изменения
- `purchases`: `supplier` -> `supplierName`.
- `purchases`: Маппинг статусов (Paid -> Оплачено, Draft -> Чернетка).
- `orderItems`: Добавлено поле `total` (qty * price).
- `purchaseItems`: Перенос `price` в `costPrice` + добавлено поле `total`.
