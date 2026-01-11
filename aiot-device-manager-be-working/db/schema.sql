CREATE DATABASE IF NOT EXISTS `aiot_device_manager` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE `aiot_device_manager`;

CREATE TABLE IF NOT EXISTS `users` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `firebase_uid` VARCHAR(128) NOT NULL,
  `email` VARCHAR(255) DEFAULT NULL,
  `display_name` VARCHAR(255) DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_users_firebase_uid` (`firebase_uid`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `devices` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `device_id` VARCHAR(128) NOT NULL,
  `device_name` VARCHAR(255) DEFAULT NULL,
  `last_seen_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_devices_user_id_device_id` (`user_id`, `device_id`),
  CONSTRAINT `fk_devices_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `sensor_readings` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `device_id` BIGINT UNSIGNED NOT NULL,
  `recorded_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `payload` JSON NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_sensor_readings_device_id_recorded_at` (`device_id`, `recorded_at`),
  CONSTRAINT `fk_sensor_readings_device_id` FOREIGN KEY (`device_id`) REFERENCES `devices` (`id`) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
