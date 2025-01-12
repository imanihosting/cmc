/*
  Warnings:

  - You are about to alter the column `startTime` on the `bookings` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `endTime` on the `bookings` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.

*/
-- AlterTable
ALTER TABLE `bookings` MODIFY `startTime` DATETIME NOT NULL,
    MODIFY `endTime` DATETIME NOT NULL;

-- AlterTable
ALTER TABLE `subscriptions` MODIFY `status` ENUM('pending', 'active', 'inactive', 'cancelled', 'expired') NOT NULL DEFAULT 'active';
