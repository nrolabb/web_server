CREATE TABLE IF NOT EXISTS `spin` (
  `type` text NOT NULL,
  `account_id` int(11) DEFAULT NULL,
  `code` text NOT NULL,
  `name` text NOT NULL,
  `time_stamps` bigint(20) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
