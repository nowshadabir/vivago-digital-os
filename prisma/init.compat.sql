CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `position` VARCHAR(191) NULL,
    `username` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `role` ENUM('USER', 'ADMIN') NOT NULL DEFAULT 'USER',
    `image` VARCHAR(191) NULL,
    `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` DATETIME NOT NULL,

    UNIQUE INDEX `User_username_key`(`username`),
    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `auth_otp` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(191) NOT NULL,
    `purpose` VARCHAR(191) NOT NULL,
    `codeHash` VARCHAR(191) NOT NULL,
    `payload` LONGTEXT NULL,
    `expiresAt` DATETIME NOT NULL,
    `verifiedAt` DATETIME NULL,
    `attempts` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` DATETIME NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `invoice` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `invoiceNumber` VARCHAR(191) NOT NULL,
    `clientName` VARCHAR(191) NOT NULL,
    `projectName` VARCHAR(191) NOT NULL,
    `clientPhone` VARCHAR(191) NOT NULL,
    `clientEmail` VARCHAR(191) NOT NULL,
    `issuedDate` DATETIME NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'Draft',
    `paymentMethod` VARCHAR(191) NOT NULL DEFAULT 'Bank Transfer',
    `paymentType` VARCHAR(191) NOT NULL DEFAULT 'Advance Payment',
    `taxRate` INTEGER NOT NULL DEFAULT 0,
    `note` LONGTEXT NULL,
    `terms` LONGTEXT NULL,
    `signature` LONGTEXT NULL,
    `createdById` VARCHAR(191) NULL,
    `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` DATETIME NOT NULL,

    UNIQUE INDEX `invoice_invoiceNumber_key`(`invoiceNumber`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `invoice_line_item` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `invoiceId` INTEGER NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `qty` INTEGER NOT NULL,
    `unitPrice` INTEGER NOT NULL,
    `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` DATETIME NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `Client` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `number` VARCHAR(191) NOT NULL,
    `business` VARCHAR(191) NOT NULL,
    `projectCount` INTEGER NOT NULL DEFAULT 0,
    `totalPaid` INTEGER NOT NULL DEFAULT 0,
    `due` INTEGER NOT NULL DEFAULT 0,
    `status` VARCHAR(191) NOT NULL DEFAULT 'Active',
    `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` DATETIME NOT NULL,

    UNIQUE INDEX `Client_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `Project` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `clientId` INTEGER NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'Planning',
    `startDate` DATETIME NOT NULL,
    `estimatedDeadline` DATETIME NOT NULL,
    `valuation` INTEGER NOT NULL DEFAULT 0,
    `companyCost` INTEGER NOT NULL DEFAULT 0,
    `temporaryCost` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` DATETIME NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `Credential` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `projectId` INTEGER NOT NULL,
    `category` VARCHAR(191) NOT NULL,
    `service` VARCHAR(191) NOT NULL,
    `endpoint` VARCHAR(191) NOT NULL,
    `username` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `reviewDate` DATETIME NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'Active',
    `note` VARCHAR(191) NULL,
    `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` DATETIME NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `ProjectFile` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `projectId` INTEGER NOT NULL,
    `fileName` VARCHAR(191) NOT NULL,
    `language` VARCHAR(191) NOT NULL,
    `sizeKb` INTEGER NOT NULL DEFAULT 0,
    `storagePath` VARCHAR(191) NOT NULL,
    `fileDate` DATETIME NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'Active',
    `note` VARCHAR(191) NULL,
    `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` DATETIME NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `Payment` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `date` DATETIME NOT NULL,
    `party` VARCHAR(191) NOT NULL,
    `projectId` INTEGER NULL,
    `purpose` VARCHAR(191) NOT NULL,
    `acknowledgement` VARCHAR(191) NULL,
    `method` VARCHAR(191) NOT NULL,
    `amount` INTEGER NOT NULL DEFAULT 0,
    `flow` VARCHAR(191) NOT NULL,
    `costResponsibility` VARCHAR(191) NULL,
    `reimbursementClient` VARCHAR(191) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'Completed',
    `note` VARCHAR(191) NULL,
    `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` DATETIME NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `reminder` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `dueDate` VARCHAR(191) NOT NULL,
    `dueTime` VARCHAR(191) NOT NULL,
    `priority` VARCHAR(191) NOT NULL DEFAULT 'Medium',
    `status` VARCHAR(191) NOT NULL DEFAULT 'Pending',
    `note` LONGTEXT NULL,
    `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` DATETIME NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `DueRecord` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `clientId` INTEGER NULL,
    `projectId` INTEGER NULL,
    `dueDate` DATETIME NOT NULL,
    `amount` INTEGER NOT NULL DEFAULT 0,
    `status` VARCHAR(191) NOT NULL DEFAULT 'Upcoming',
    `note` VARCHAR(191) NULL,
    `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` DATETIME NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `ProfitLossRecord` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `clientId` INTEGER NOT NULL,
    `projectId` INTEGER NOT NULL,
    `revenue` INTEGER NOT NULL DEFAULT 0,
    `companyCost` INTEGER NOT NULL DEFAULT 0,
    `temporaryCost` INTEGER NOT NULL DEFAULT 0,
    `note` VARCHAR(191) NULL,
    `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` DATETIME NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `invoice` ADD CONSTRAINT `invoice_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `invoice_line_item` ADD CONSTRAINT `invoice_line_item_invoiceId_fkey` FOREIGN KEY (`invoiceId`) REFERENCES `invoice`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `Project` ADD CONSTRAINT `Project_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `Client`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `Credential` ADD CONSTRAINT `Credential_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `Project`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `ProjectFile` ADD CONSTRAINT `ProjectFile_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `Project`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `Payment` ADD CONSTRAINT `Payment_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `Project`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `DueRecord` ADD CONSTRAINT `DueRecord_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `Client`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `DueRecord` ADD CONSTRAINT `DueRecord_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `Project`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `ProfitLossRecord` ADD CONSTRAINT `ProfitLossRecord_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `Client`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `ProfitLossRecord` ADD CONSTRAINT `ProfitLossRecord_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `Project`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;


