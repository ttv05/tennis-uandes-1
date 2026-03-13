CREATE TABLE `availability` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`dayOfWeek` int NOT NULL,
	`startTime` varchar(5) NOT NULL,
	`endTime` varchar(5) NOT NULL,
	`isAvailable` boolean NOT NULL DEFAULT true,
	`source` enum('manual','ocr','calendar_sync') NOT NULL DEFAULT 'manual',
	`weekNumber` int NOT NULL,
	`year` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `availability_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `calendar_uploads` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`imageUrl` text NOT NULL,
	`ocrResult` json,
	`weekNumber` int NOT NULL,
	`year` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `calendar_uploads_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `teams` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`captainId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `teams_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `training_confirmations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`trainingSessionId` int NOT NULL,
	`userId` int NOT NULL,
	`status` enum('confirmed','cancelled','pending') NOT NULL DEFAULT 'pending',
	`confirmedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `training_confirmations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `training_sessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`teamId` int NOT NULL,
	`dayOfWeek` int NOT NULL,
	`startTime` varchar(5) NOT NULL,
	`endTime` varchar(5) NOT NULL,
	`gender` enum('male','female','mixed') NOT NULL,
	`status` enum('suggested','approved','cancelled') NOT NULL DEFAULT 'suggested',
	`availablePlayerCount` int NOT NULL,
	`approvedBy` int,
	`weekNumber` int NOT NULL,
	`year` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `training_sessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('user','admin','captain') NOT NULL DEFAULT 'user';--> statement-breakpoint
ALTER TABLE `users` ADD `gender` enum('male','female');--> statement-breakpoint
ALTER TABLE `users` ADD `teamId` int;