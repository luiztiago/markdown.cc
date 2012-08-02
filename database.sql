/*
 Navicat Premium Data Transfer

 Source Server         : localhost
 Source Server Type    : PostgreSQL
 Source Server Version : 90104
 Source Host           : localhost
 Source Database       : postgres
 Source Schema         : public

 Target Server Type    : PostgreSQL
 Target Server Version : 90104
 File Encoding         : utf-8

 Date: 08/02/2012 15:01:08 PM
*/

-- ----------------------------
--  Table structure for "registers"
-- ----------------------------
DROP TABLE IF EXISTS "registers";
CREATE TABLE "registers" (
	"code" varchar(32) NOT NULL,
	"version" numeric NOT NULL,
	"markdown" varchar,
	"preview" varchar,
	"created_at" timestamp(6) NULL
)
WITH (OIDS=FALSE);
ALTER TABLE "registers" OWNER TO "postgres";

-- ----------------------------
--  Primary key structure for table "registers"
-- ----------------------------
ALTER TABLE "registers" ADD CONSTRAINT "p_registers" PRIMARY KEY ("code", "version") NOT DEFERRABLE INITIALLY IMMEDIATE;

