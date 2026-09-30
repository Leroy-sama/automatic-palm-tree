CREATE TABLE `practice_progress` (
	`user_id` text PRIMARY KEY NOT NULL,
	`level` integer NOT NULL,
	`stats` text NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `lobbies` (
	`room_id` text PRIMARY KEY NOT NULL,
	`host_name` text NOT NULL,
	`player_count` integer NOT NULL,
	`status` text NOT NULL,
	`updated_at` integer NOT NULL
);
