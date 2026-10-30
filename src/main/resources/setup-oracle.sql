-- ==============================================================================
-- MeeSeva DQMS - Master SQL*Plus Execution Wrapper
-- Run via SQL*Plus: sqlplus username/password@localhost:1521/FREE @setup-oracle.sql
-- ==============================================================================

SET ECHO ON
SET FEEDBACK ON
SET SERVEROUTPUT ON
WHENEVER SQLERROR EXIT SQL.SQLCODE ROLLBACK

PROMPT ====================================================================
PROMPT 1. Executing MeeSeva DQMS Schema Creation (schema-oracle.sql) ...
PROMPT ====================================================================
@@schema-oracle.sql

PROMPT ====================================================================
PROMPT 2. Executing MeeSeva DQMS Catalog & District Seeding (seed-oracle.sql) ...
PROMPT ====================================================================
@@seed-oracle.sql

PROMPT ====================================================================
PROMPT 3. Database Verification Summary
PROMPT ====================================================================
SELECT 'DISTRICTS' AS Entity, COUNT(*) AS TotalCount FROM DISTRICT
UNION ALL
SELECT 'DEPARTMENTS', COUNT(*) FROM DEPARTMENT
UNION ALL
SELECT 'SERVICES', COUNT(*) FROM SERVICE
UNION ALL
SELECT 'OFFICES', COUNT(*) FROM OFFICE
UNION ALL
SELECT 'COUNTERS', COUNT(*) FROM COUNTER
UNION ALL
SELECT 'OFFICIALS', COUNT(*) FROM OFFICIAL
UNION ALL
SELECT 'ACTIVE_TICKETS', COUNT(*) FROM QUEUE_TICKET;

PROMPT MeeSeva DQMS Database Provisioning Successfully Completed!
