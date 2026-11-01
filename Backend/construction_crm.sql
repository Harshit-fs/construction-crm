-- MariaDB dump 10.19  Distrib 10.4.32-MariaDB, for Win64 (AMD64)
--
-- Host: localhost    Database: construction_crm
-- ------------------------------------------------------
-- Server version	10.4.32-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `brokers`
--

DROP TABLE IF EXISTS `brokers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `brokers` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `email` varchar(150) NOT NULL,
  `address` text DEFAULT NULL,
  `commission` decimal(10,2) DEFAULT NULL,
  `status` varchar(20) DEFAULT 'Active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `brokers`
--

LOCK TABLES `brokers` WRITE;
/*!40000 ALTER TABLE `brokers` DISABLE KEYS */;
INSERT INTO `brokers` VALUES (4,'Rohit ','9876543210','Rohit30@gmail.com','Udaipur, Rajasthan',5.00,'Active','2026-09-25 08:05:51'),(5,'Rakesh','9988776655','Rakesh80@gmail.com','Udaipur',2.00,'Active','2026-09-30 07:18:29'),(6,'Naman','9988776655','Naman90@gmail.com','Udaipur',5.00,'Active','2026-10-01 10:24:30'),(7,'Kunal','2534763276','kunal@gmail.com','secter 14 udaipur',6.00,'Active','2026-10-13 09:04:31');
/*!40000 ALTER TABLE `brokers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `customers`
--

DROP TABLE IF EXISTS `customers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `customers` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `email` varchar(150) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `broker_id` int(11) DEFAULT NULL,
  `status` varchar(30) DEFAULT 'Active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `broker_id` (`broker_id`),
  CONSTRAINT `customers_ibfk_1` FOREIGN KEY (`broker_id`) REFERENCES `brokers` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customers`
--

LOCK TABLES `customers` WRITE;
/*!40000 ALTER TABLE `customers` DISABLE KEYS */;
INSERT INTO `customers` VALUES (1,'Rahul Sharma','9876543210','rahul@gmail.com','Udaipur',6,'Active','2026-09-24 11:47:01'),(2,'Abhaye','9988776655','Abhaye0@gmail.com','Delhi',4,'Active','2026-09-25 09:43:05'),(3,'Lokesh','2534763276','lokesh12@gmail.com','deal done',4,'Active','2026-09-28 07:28:51'),(4,'manav','9876543210','Manav57@gmail.com','jaipur',4,'Active','2026-09-28 10:30:48'),(5,'kailash','9988776655','Kailash55@gmail.com','delhi',5,'Active','2026-09-30 07:23:01'),(6,'Devraj Kumawat','1234567890','dev2434@gmail.com','Udaipur',5,'Active','2026-10-01 06:43:45'),(7,'mohit','2534763276','mohit90@gmail.com','mohit90@gmail.com',6,'Active','2026-10-07 11:07:17');
/*!40000 ALTER TABLE `customers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `documents`
--

DROP TABLE IF EXISTS `documents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `documents` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `document_name` varchar(150) NOT NULL,
  `document_type` varchar(50) NOT NULL,
  `customer_id` int(11) DEFAULT NULL,
  `project_id` int(11) DEFAULT NULL,
  `property_id` int(11) DEFAULT NULL,
  `file_path` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'Active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `fk_document_customer` (`customer_id`),
  KEY `fk_document_project` (`project_id`),
  KEY `fk_document_property` (`property_id`),
  CONSTRAINT `fk_document_customer` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_document_project` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_document_property` FOREIGN KEY (`property_id`) REFERENCES `properties` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `documents`
--

LOCK TABLES `documents` WRITE;
/*!40000 ALTER TABLE `documents` DISABLE KEYS */;
INSERT INTO `documents` VALUES (1,'Project Agreement','Agreement',2,2,1,'/uploads/1790406134743-71620.pdf',NULL,'Active','2026-09-26 07:02:14'),(2,'Project plan','Project',1,1,1,'/uploads/1790406818159-25896.pdf',NULL,'Active','2026-09-26 07:13:38'),(3,'Project Agreement','Customer',3,3,2,'/uploads/1790580701849-55813.pdf','Agreement done','Active','2026-09-28 07:31:41'),(4,'Project Agreement','Project',4,3,1,'/uploads/1790933356897-98430.pdf','jhhfjm','Active','2026-10-02 09:29:16');
/*!40000 ALTER TABLE `documents` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `employees`
--

DROP TABLE IF EXISTS `employees`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `employees` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `designation` varchar(100) NOT NULL,
  `department` varchar(100) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `email` varchar(150) NOT NULL,
  `project_id` int(11) DEFAULT NULL,
  `status` varchar(20) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `employees`
--

LOCK TABLES `employees` WRITE;
/*!40000 ALTER TABLE `employees` DISABLE KEYS */;
INSERT INTO `employees` VALUES (1,'HEMANT','Site Engineer','construction','2534763276','Hemant23@gmail.com',1,'Active','2026-09-25 08:22:13'),(2,'milan rathore','Site Engineer','construction','9257939735','milanr234@gmail.com',2,'Active','2026-09-28 06:57:37'),(3,'Pranav','Accountant','construction','9988776655','Pranav45@gmail.com',NULL,'Active','2026-09-30 07:21:57');
/*!40000 ALTER TABLE `employees` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `follow_ups`
--

DROP TABLE IF EXISTS `follow_ups`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `follow_ups` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(150) NOT NULL,
  `follow_up_date` date NOT NULL,
  `customer_id` int(11) DEFAULT NULL,
  `lead_id` int(11) DEFAULT NULL,
  `broker_id` int(11) DEFAULT NULL,
  `employee_id` int(11) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'Pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `fk_followup_customer` (`customer_id`),
  KEY `fk_followup_lead` (`lead_id`),
  KEY `fk_followup_broker` (`broker_id`),
  KEY `fk_followup_employee` (`employee_id`),
  CONSTRAINT `fk_followup_broker` FOREIGN KEY (`broker_id`) REFERENCES `brokers` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_followup_customer` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_followup_employee` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_followup_lead` FOREIGN KEY (`lead_id`) REFERENCES `leads` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `follow_ups`
--

LOCK TABLES `follow_ups` WRITE;
/*!40000 ALTER TABLE `follow_ups` DISABLE KEYS */;
INSERT INTO `follow_ups` VALUES (1,'call ustomer  for site visit ','2026-09-15',1,NULL,NULL,1,'Call customer and confirm site visit timing.\n','Completed','2026-09-26 07:33:23'),(2,'Payment Reminder','2026-09-21',2,1,4,1,'Remind customer about pending project payment.','Completed','2026-09-26 07:35:18'),(3,'call lokesh for sit visit','2026-09-19',3,3,4,2,'clear the doubt ','Pending','2026-09-28 07:33:39'),(4,'Check Site Progress','2026-09-28',5,5,5,3,'progress check properly  ','Completed','2026-09-30 07:49:30'),(5,'payment pending','2026-09-24',5,5,5,3,'call for pending payment ','Pending','2026-09-30 11:02:20');
/*!40000 ALTER TABLE `follow_ups` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inventory`
--

DROP TABLE IF EXISTS `inventory`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `inventory` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `item_name` varchar(150) NOT NULL,
  `item_code` varchar(80) DEFAULT NULL,
  `category` varchar(100) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `quantity` decimal(12,2) NOT NULL DEFAULT 0.00,
  `unit` varchar(30) NOT NULL DEFAULT 'Piece',
  `min_stock` decimal(12,2) NOT NULL DEFAULT 0.00,
  `unit_price` decimal(12,2) NOT NULL DEFAULT 0.00,
  `supplier` varchar(150) DEFAULT NULL,
  `project_id` int(11) DEFAULT NULL,
  `location` varchar(150) DEFAULT NULL,
  `status` varchar(50) NOT NULL DEFAULT 'Available',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inventory`
--

LOCK TABLES `inventory` WRITE;
/*!40000 ALTER TABLE `inventory` DISABLE KEYS */;
/*!40000 ALTER TABLE `inventory` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `leads`
--

DROP TABLE IF EXISTS `leads`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `leads` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `email` varchar(150) DEFAULT NULL,
  `lead_source` varchar(50) NOT NULL,
  `broker_id` int(11) DEFAULT NULL,
  `employee_id` int(11) NOT NULL,
  `status` varchar(30) NOT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `fk_lead_employee` (`employee_id`),
  KEY `fk_lead_broker` (`broker_id`),
  CONSTRAINT `fk_lead_broker` FOREIGN KEY (`broker_id`) REFERENCES `brokers` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_lead_employee` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `leads`
--

LOCK TABLES `leads` WRITE;
/*!40000 ALTER TABLE `leads` DISABLE KEYS */;
INSERT INTO `leads` VALUES (1,'abhaye','9876543210','Abhaye0@gmail.com','Social Media',4,1,'New','Clear the doubt','2026-09-25 08:29:02'),(3,'Lokesh','2534763276','lokesh12@gmail.com','Walk-in',4,2,'Converted','Call the customer','2026-09-28 07:27:39'),(4,'manav','9876543210','Manav57@gmail.com','Social Media',NULL,2,'New','dedew','2026-09-28 10:23:41'),(5,'kailash','9988776655','Kailash55@gmail.com','Advertisement',NULL,3,'New','follow up leads ','2026-09-30 07:16:02'),(6,'mohiit','2534763276','mohit90@gmail.com','Social Media',6,3,'New','follow up','2026-10-07 11:06:32');
/*!40000 ALTER TABLE `leads` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `notifications` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `type` varchar(50) NOT NULL,
  `reference_id` int(11) DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
INSERT INTO `notifications` VALUES (1,'New Lead','New lead added: Raj Construction','lead',NULL,1,'2026-09-28 10:24:38'),(2,'New Lead Received','Lokesh Sharma requested a site visit for Sunrise Villa','lead',1,0,'2026-11-01 17:50:33'),(3,'Payment Received','Received Γé╣2,50,000 for Green Valley Project (Unit A-102)','payment',1,0,'2026-11-01 17:50:33'),(4,'Follow-up Scheduled','Follow-up with Kailash regarding balance payment due tomorrow','followup',3,0,'2026-11-01 17:50:33');
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payments`
--

DROP TABLE IF EXISTS `payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `payments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `customer_id` int(11) NOT NULL,
  `broker_id` int(11) DEFAULT NULL,
  `project_id` int(11) NOT NULL,
  `total_amount` decimal(15,2) NOT NULL DEFAULT 0.00,
  `paid_amount` decimal(15,2) NOT NULL DEFAULT 0.00,
  `pending_amount` decimal(15,2) NOT NULL DEFAULT 0.00,
  `payment_date` date NOT NULL,
  `payment_method` varchar(40) NOT NULL,
  `status` varchar(20) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `fk_payment_customer` (`customer_id`),
  KEY `fk_payment_project` (`project_id`),
  KEY `fk_payment_broker` (`broker_id`),
  CONSTRAINT `fk_payment_broker` FOREIGN KEY (`broker_id`) REFERENCES `brokers` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_payment_customer` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `fk_payment_project` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payments`
--

LOCK TABLES `payments` WRITE;
/*!40000 ALTER TABLE `payments` DISABLE KEYS */;
INSERT INTO `payments` VALUES (1,1,5,1,8500000.00,3800000.00,4700000.00,'2026-09-24','Cheque','Partial','2026-09-25 09:27:29'),(2,2,NULL,2,20000000.00,14500000.00,5500000.00,'2026-09-24','Bank Transfer','Partial','2026-09-25 09:49:36'),(3,3,NULL,3,7000000.00,7000000.00,0.00,'2026-09-27','Online','Paid','2026-09-28 07:30:17'),(4,5,NULL,4,4500000.00,2000000.00,2500000.00,'2026-09-30','Cash','Partial','2026-09-30 07:39:08'),(5,6,NULL,5,100000000.00,100000000.00,0.00,'2026-09-27','Cheque','Paid','2026-10-01 06:45:26'),(6,1,6,3,8500000.00,4000000.00,4500000.00,'2026-10-01','Cash','Partial','2026-10-01 10:27:56'),(7,7,6,6,5000000.00,2500000.00,2500000.00,'2026-10-07','Bank Transfer','Partial','2026-10-07 11:10:40');
/*!40000 ALTER TABLE `payments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `projects`
--

DROP TABLE IF EXISTS `projects`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `projects` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(150) NOT NULL,
  `location` varchar(200) NOT NULL,
  `project_type` varchar(80) NOT NULL,
  `description` text DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `completion_date` date DEFAULT NULL,
  `status` varchar(30) NOT NULL,
  `team` varchar(150) DEFAULT NULL,
  `budget` decimal(15,2) DEFAULT 0.00,
  `progress` decimal(5,2) DEFAULT 0.00,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `projects`
--

LOCK TABLES `projects` WRITE;
/*!40000 ALTER TABLE `projects` DISABLE KEYS */;
INSERT INTO `projects` VALUES (1,'Green Valley Residency','Rajasthan','Commercial','Beigning','Screenshot 2026-09-21 164209.png','2026-09-19','2026-09-25','Completed','Pranav',5000000.00,10.00,'2026-09-24 12:13:29'),(2,'Sunrise City','Mumbai','Villa','under Progress',NULL,'2026-09-24','2027-09-24','Ongoing','HEMANT',20000000.00,25.00,'2026-09-25 09:04:52'),(3,'House','rajsamand','Plot','call a customer and final the work',NULL,'2026-09-27','2027-12-28','Upcoming','milan rathore',8000000.00,0.00,'2026-09-28 07:24:40'),(4,'Lake View Heights','delhi','Commercial','complete as possible',NULL,'2026-09-29','2028-10-29','Ongoing','Pranav',32000000.00,15.00,'2026-09-30 07:29:09'),(5,'burj khalifa ','dubai','Commercial','world high building',NULL,'2026-10-01','2030-12-30','Upcoming','milan rathore',10000000000.00,10.00,'2026-10-01 06:38:55'),(6,'FarmHouse','Rajsamand','Plot','deal','Ai1.jpeg','2026-10-07','2029-11-08','Upcoming','HEMANT',5000000.00,15.00,'2026-10-07 11:09:06');
/*!40000 ALTER TABLE `projects` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `properties`
--

DROP TABLE IF EXISTS `properties`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `properties` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `property_type` varchar(50) NOT NULL,
  `area` varchar(50) NOT NULL,
  `price` decimal(15,2) DEFAULT 0.00,
  `location` varchar(200) NOT NULL,
  `project_id` int(11) DEFAULT NULL,
  `unit_number` varchar(50) DEFAULT NULL,
  `floor` varchar(30) DEFAULT NULL,
  `status` varchar(20) NOT NULL,
  `active_status` varchar(20) NOT NULL DEFAULT 'Active',
  `customer_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `fk_property_project` (`project_id`),
  KEY `fk_property_customer` (`customer_id`),
  CONSTRAINT `fk_property_customer` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_property_project` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `properties`
--

LOCK TABLES `properties` WRITE;
/*!40000 ALTER TABLE `properties` DISABLE KEYS */;
INSERT INTO `properties` VALUES (1,'Apartment','1450 sq.ft',8500000.00,'Jaipur, Rajasthan',1,'A-101','1s floor','Sold','Inactive',1,'2026-09-25 08:46:32'),(2,'House','1600 sq.ft',7000000.00,'udaipur',3,'205','Ground','Reserved','Active',3,'2026-09-28 07:29:30'),(3,'Apartment','1250 sq.ft',45000000.00,'delhi',4,'A-110','2 floor','Available','Active',5,'2026-09-30 07:36:54'),(4,'Apartment','1250',45000000.00,'delhi',4,'A-110',NULL,'Available','Active',5,'2026-10-13 12:56:54');
/*!40000 ALTER TABLE `properties` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `role_permissions`
--

DROP TABLE IF EXISTS `role_permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `role_permissions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `role` varchar(50) NOT NULL,
  `permission` varchar(100) NOT NULL,
  `allowed` tinyint(1) DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_role_permission` (`role`,`permission`)
) ENGINE=InnoDB AUTO_INCREMENT=182 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `role_permissions`
--

LOCK TABLES `role_permissions` WRITE;
/*!40000 ALTER TABLE `role_permissions` DISABLE KEYS */;
INSERT INTO `role_permissions` VALUES (73,'Admin','Dashboard',1),(74,'Admin','Brokers',1),(75,'Admin','Customers',1),(76,'Admin','Properties',1),(77,'Admin','Projects',1),(78,'Admin','Leads',1),(79,'Admin','Employees',1),(80,'Admin','Payments',1),(81,'Admin','Documents',1),(82,'Admin','Follow-ups & Tasks',1),(129,'Admin','Inventory',1),(135,'Super Admin','Dashboard',1),(136,'Super Admin','Brokers',1),(137,'Super Admin','Customers',1),(138,'Super Admin','Leads',1),(139,'Super Admin','Projects',1),(140,'Super Admin','Properties',1),(141,'Super Admin','Employees',1),(142,'Super Admin','Payments',1),(143,'Super Admin','Follow-ups & Tasks',1),(144,'Super Admin','Documents',1),(145,'Super Admin','Reports & Analytics',1),(146,'Super Admin','Users & Roles',1),(147,'Super Admin','Inventory',1),(152,'Broker','Brokers',1),(153,'Broker','Leads',1),(154,'Broker','Projects',1),(155,'Broker','Customers',1),(156,'Broker','Properties',1),(157,'Broker','Employees',1),(162,'Staff','Follow-ups & Tasks',1),(163,'Staff','Leads',1),(164,'Staff','Customers',1),(165,'Staff','Inventory',1),(166,'Staff','Employees',1),(176,'Manager','Customers',1),(177,'Manager','Projects',1),(178,'Manager','Leads',1),(179,'Manager','Inventory',1),(180,'Manager','Payments',1),(181,'Manager','Properties',1);
/*!40000 ALTER TABLE `role_permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('Super Admin','Admin','Manager','Broker','Staff') NOT NULL DEFAULT 'Staff',
  `status` enum('Active','Inactive') NOT NULL DEFAULT 'Active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Harshit Tailor','Harshit24@gmail.com','2534763276','$2b$10$BrT.vWwEg8F0iDJrocp3F.0OW/rnq0cCA2Dg.WR5L18B3m0o2BFVa','Super Admin','Active','2026-09-24 08:54:59'),(2,'prince ','prince2434@gmail.com','9988776655','1234','Admin','Active','2026-09-24 09:31:14'),(4,'Devraj Kumawat','dev2434@gmail.com','1234567890','8520','Super Admin','Active','2026-10-01 06:36:26'),(5,'kunal koli','kunal@gmail.com','3434343434','Kunal@123','Super Admin','Active','2026-10-13 06:53:46'),(6,'Ram ji','ram@gmail.com','1234567890','1234','Manager','Active','2026-10-13 13:11:09'),(7,'nitesh','nitesh@gmail.com','9876543210','1234','Broker','Active','2026-10-13 13:25:22'),(8,'neelam','neelam24@gmail.com','1111111111','098765','Staff','Active','2026-10-30 08:59:26');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-11-01 23:23:55
