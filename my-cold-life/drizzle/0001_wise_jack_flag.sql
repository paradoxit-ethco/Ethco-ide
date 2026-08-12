CREATE TABLE `plants` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(120) NOT NULL,
	`name` varchar(160) NOT NULL,
	`nameAm` varchar(160) NOT NULL,
	`description` text NOT NULL,
	`descriptionAm` text NOT NULL,
	`imageUrl` text NOT NULL,
	`height` varchar(40) NOT NULL,
	`care` enum('Easy','Moderate') NOT NULL DEFAULT 'Moderate',
	`featured` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `plants_id` PRIMARY KEY(`id`),
	CONSTRAINT `plants_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `passwordPlaceholder` text;