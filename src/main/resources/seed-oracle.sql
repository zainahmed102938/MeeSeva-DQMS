-- ==============================================================================
-- MeeSeva Digital Queue Management System (DQMS) - Government of Telangana
-- Oracle Database 23ai / 26ai Seed Data Script
-- ==============================================================================

-- 1. Insert All 33 Telangana Districts
INSERT INTO DISTRICT (district_id, district_name, region, headquarters) VALUES ('ADB', 'Adilabad', 'Northern Telangana', 'Adilabad');
INSERT INTO DISTRICT (district_id, district_name, region, headquarters) VALUES ('BDK', 'Bhadradri Kothagudem', 'Eastern Telangana', 'Kothagudem');
INSERT INTO DISTRICT (district_id, district_name, region, headquarters) VALUES ('HNK', 'Hanamkonda', 'Warangal Urban', 'Hanamkonda');
INSERT INTO DISTRICT (district_id, district_name, region, headquarters) VALUES ('HYD', 'Hyderabad', 'Capital Region', 'Hyderabad');
INSERT INTO DISTRICT (district_id, district_name, region, headquarters) VALUES ('JGT', 'Jagtial', 'Northern Telangana', 'Jagtial');
INSERT INTO DISTRICT (district_id, district_name, region, headquarters) VALUES ('JNG', 'Jangaon', 'Central Telangana', 'Jangaon');
INSERT INTO DISTRICT (district_id, district_name, region, headquarters) VALUES ('JBP', 'Jayashankar Bhupalpally', 'Eastern Telangana', 'Bhupalpally');
INSERT INTO DISTRICT (district_id, district_name, region, headquarters) VALUES ('JGD', 'Jogulamba Gadwal', 'Southern Telangana', 'Gadwal');
INSERT INTO DISTRICT (district_id, district_name, region, headquarters) VALUES ('KMR', 'Kamareddy', 'Northern Telangana', 'Kamareddy');
INSERT INTO DISTRICT (district_id, district_name, region, headquarters) VALUES ('KRN', 'Karimnagar', 'Northern Telangana', 'Karimnagar');
INSERT INTO DISTRICT (district_id, district_name, region, headquarters) VALUES ('KHM', 'Khammam', 'Eastern Telangana', 'Khammam');
INSERT INTO DISTRICT (district_id, district_name, region, headquarters) VALUES ('KBA', 'Kumuram Bheem Asifabad', 'Northern Telangana', 'Asifabad');
INSERT INTO DISTRICT (district_id, district_name, region, headquarters) VALUES ('MBD', 'Mahabubabad', 'Eastern Telangana', 'Mahabubabad');
INSERT INTO DISTRICT (district_id, district_name, region, headquarters) VALUES ('MBN', 'Mahabubnagar', 'Southern Telangana', 'Mahabubnagar');
INSERT INTO DISTRICT (district_id, district_name, region, headquarters) VALUES ('MNC', 'Mancherial', 'Northern Telangana', 'Mancherial');
INSERT INTO DISTRICT (district_id, district_name, region, headquarters) VALUES ('MDK', 'Medak', 'Central Telangana', 'Medak');
INSERT INTO DISTRICT (district_id, district_name, region, headquarters) VALUES ('MCM', 'Medchal-Malkajgiri', 'Hyderabad Periphery', 'Shamirpet');
INSERT INTO DISTRICT (district_id, district_name, region, headquarters) VALUES ('MLG', 'Mulugu', 'Eastern Telangana', 'Mulugu');
INSERT INTO DISTRICT (district_id, district_name, region, headquarters) VALUES ('NGK', 'Nagarkurnool', 'Southern Telangana', 'Nagarkurnool');
INSERT INTO DISTRICT (district_id, district_name, region, headquarters) VALUES ('NLG', 'Nalgonda', 'Southern Telangana', 'Nalgonda');
INSERT INTO DISTRICT (district_id, district_name, region, headquarters) VALUES ('NRP', 'Narayanpet', 'Southern Telangana', 'Narayanpet');
INSERT INTO DISTRICT (district_id, district_name, region, headquarters) VALUES ('NRM', 'Nirmal', 'Northern Telangana', 'Nirmal');
INSERT INTO DISTRICT (district_id, district_name, region, headquarters) VALUES ('NZB', 'Nizamabad', 'Northern Telangana', 'Nizamabad');
INSERT INTO DISTRICT (district_id, district_name, region, headquarters) VALUES ('PED', 'Peddapalli', 'Northern Telangana', 'Peddapalli');
INSERT INTO DISTRICT (district_id, district_name, region, headquarters) VALUES ('RJS', 'Rajanna Sircilla', 'Northern Telangana', 'Sircilla');
INSERT INTO DISTRICT (district_id, district_name, region, headquarters) VALUES ('RNG', 'Ranga Reddy', 'Capital Surroundings', 'Shamshabad');
INSERT INTO DISTRICT (district_id, district_name, region, headquarters) VALUES ('SNG', 'Sangareddy', 'Western Telangana', 'Sangareddy');
INSERT INTO DISTRICT (district_id, district_name, region, headquarters) VALUES ('SDP', 'Siddipet', 'Central Telangana', 'Siddipet');
INSERT INTO DISTRICT (district_id, district_name, region, headquarters) VALUES ('SRP', 'Suryapet', 'Southern Telangana', 'Suryapet');
INSERT INTO DISTRICT (district_id, district_name, region, headquarters) VALUES ('VKR', 'Vikarabad', 'Western Telangana', 'Vikarabad');
INSERT INTO DISTRICT (district_id, district_name, region, headquarters) VALUES ('WNP', 'Wanaparthy', 'Southern Telangana', 'Wanaparthy');
INSERT INTO DISTRICT (district_id, district_name, region, headquarters) VALUES ('WGL', 'Warangal', 'Warangal Rural', 'Warangal');
INSERT INTO DISTRICT (district_id, district_name, region, headquarters) VALUES ('YDB', 'Yadadri Bhuvanagiri', 'Eastern Capital Buffer', 'Bhuvanagiri');

-- 2. Insert 5 Master Departments
INSERT INTO DEPARTMENT (department_id, department_name, telugu_name, prefix, default_counter_name) VALUES ('REV', 'Revenue Department Services', 'రెవెన్యూ శాఖ సేవలు', 'REV-', 'Counter 01 & 02');
INSERT INTO DEPARTMENT (department_id, department_name, telugu_name, prefix, default_counter_name) VALUES ('REG', 'Civil Registration & Municipal Services', 'పౌర నమోదు & మునిసిపల్ సేవలు', 'CR-', 'Counter 03');
INSERT INTO DEPARTMENT (department_id, department_name, telugu_name, prefix, default_counter_name) VALUES ('RTA', 'Transport Department (RTA Services)', 'రవాణా శాఖ సేవలు', 'RTA-', 'Counter 04 & 05');
INSERT INTO DEPARTMENT (department_id, department_name, telugu_name, prefix, default_counter_name) VALUES ('CIVIL', 'Civil Supplies & Ration Services', 'పౌర సరఫరాలు & రేషన్ సేవలు', 'CS-', 'Counter 06');
INSERT INTO DEPARTMENT (department_id, department_name, telugu_name, prefix, default_counter_name) VALUES ('ELEC', 'Electricity & Utility Services (TSPDCL/TSNPDCL)', 'విద్యుత్ & యుటిలిటీ సేవలు', 'ELE-', 'Counter 07');

-- 3. Insert Master Services / Sub-Services
INSERT INTO SERVICE (department_id, service_name, service_prefix, average_service_minutes) VALUES ('REV', 'Income Certificate', 'REV-', 4);
INSERT INTO SERVICE (department_id, service_name, service_prefix, average_service_minutes) VALUES ('REV', 'Caste / Community Certificate', 'REV-', 4);
INSERT INTO SERVICE (department_id, service_name, service_prefix, average_service_minutes) VALUES ('REV', 'Residence / Nativity Certificate', 'REV-', 4);
INSERT INTO SERVICE (department_id, service_name, service_prefix, average_service_minutes) VALUES ('REV', 'Encumbrance Certificate (EC)', 'REV-', 5);
INSERT INTO SERVICE (department_id, service_name, service_prefix, average_service_minutes) VALUES ('REV', 'Adangal / Pahani Copies', 'REV-', 3);

INSERT INTO SERVICE (department_id, service_name, service_prefix, average_service_minutes) VALUES ('REG', 'Birth Certificate Issue / Correction', 'CR-', 3);
INSERT INTO SERVICE (department_id, service_name, service_prefix, average_service_minutes) VALUES ('REG', 'Death Certificate Issue', 'CR-', 3);
INSERT INTO SERVICE (department_id, service_name, service_prefix, average_service_minutes) VALUES ('REG', 'Property Tax Payment', 'CR-', 2);

INSERT INTO SERVICE (department_id, service_name, service_prefix, average_service_minutes) VALUES ('RTA', 'LLR Slot Booking', 'RTA-', 6);
INSERT INTO SERVICE (department_id, service_name, service_prefix, average_service_minutes) VALUES ('RTA', 'Driving License Renewal', 'RTA-', 6);
INSERT INTO SERVICE (department_id, service_name, service_prefix, average_service_minutes) VALUES ('RTA', 'Vehicle Ownership Transfer (Duplicate RC)', 'RTA-', 8);

INSERT INTO SERVICE (department_id, service_name, service_prefix, average_service_minutes) VALUES ('CIVIL', 'New Food Security Card (Ration Card)', 'CS-', 5);
INSERT INTO SERVICE (department_id, service_name, service_prefix, average_service_minutes) VALUES ('CIVIL', 'Member Addition / Deletion in Ration Card', 'CS-', 4);

INSERT INTO SERVICE (department_id, service_name, service_prefix, average_service_minutes) VALUES ('ELEC', 'Electricity Bill Payment', 'ELE-', 2);
INSERT INTO SERVICE (department_id, service_name, service_prefix, average_service_minutes) VALUES ('ELEC', 'New Service Connection Registration', 'ELE-', 5);

-- 4. Insert Offices
INSERT INTO OFFICE (office_id, district_id, department_id, office_name, address) VALUES (1, 'HYD', 'REV', 'MeeSeva Center - Sanath Nagar', 'H No 7-1-304/2/A/1, Subhash Nagar, Sanath Nagar, Hyderabad - 500018');
INSERT INTO OFFICE (office_id, district_id, department_id, office_name, address) VALUES (2, 'HYD', 'REV', 'MeeSeva Center - SR Nagar', 'Beside HMWS & SB, Prakash Nagar, Sanjeeva Reddy Nagar, Hyderabad - 500038');
INSERT INTO OFFICE (office_id, district_id, department_id, office_name, address) VALUES (3, 'HYD', 'RTA', 'District RTO Office - Hyderabad', 'RTO Testing Track Complex, NH Highway Side, Hyderabad');
INSERT INTO OFFICE (office_id, district_id, department_id, office_name, address) VALUES (4, 'HNK', 'REG', 'MeeSeva Center - Municipal Complex, Hanamkonda', 'Municipal Corporation Office Premises, Hanamkonda');
INSERT INTO OFFICE (office_id, district_id, department_id, office_name, address) VALUES (5, 'NZB', 'CIVIL', 'MeeSeva Center - Civil Supplies Hub, Nizamabad', 'Civil Supplies Bhavan, Old Collectorate Rd, Nizamabad');

-- 5. Insert Counters
INSERT INTO COUNTER (counter_id, office_id, counter_number, status) VALUES (1, 1, 'Counter 01', 'OPEN');
INSERT INTO COUNTER (counter_id, office_id, counter_number, status) VALUES (2, 1, 'Counter 02', 'OPEN');
INSERT INTO COUNTER (counter_id, office_id, counter_number, status) VALUES (3, 3, 'Counter 04', 'OPEN');
INSERT INTO COUNTER (counter_id, office_id, counter_number, status) VALUES (4, 4, 'Counter 03', 'OPEN');
INSERT INTO COUNTER (counter_id, office_id, counter_number, status) VALUES (5, 5, 'Counter 06', 'OPEN');

-- 6. Insert Pre-seeded Government Officials (Strictly server-determined authority)
INSERT INTO OFFICIAL (official_id, email, name, department_id, district_id, office_id, role, assigned_counter_id) 
VALUES (101, 'officer.rev@telangana.gov.in', 'Sri V. Ramesh, Tahsildar / Revenue Officer', 'REV', 'HYD', 1, 'OFFICER', 1);

INSERT INTO OFFICIAL (official_id, email, name, department_id, district_id, office_id, role, assigned_counter_id) 
VALUES (102, 'officer.rta@telangana.gov.in', 'Smt. K. Sunitha, Motor Vehicle Inspector', 'RTA', 'HYD', 3, 'OFFICER', 3);

INSERT INTO OFFICIAL (official_id, email, name, department_id, district_id, office_id, role, assigned_counter_id) 
VALUES (103, 'officer.reg@telangana.gov.in', 'Sri P. Anand Rao, Municipal Registrar', 'REG', 'HNK', 4, 'OFFICER', 4);

INSERT INTO OFFICIAL (official_id, email, name, department_id, district_id, office_id, role, assigned_counter_id) 
VALUES (104, 'officer.civil@telangana.gov.in', 'Smt. M. Geetha, Civil Supplies Officer', 'CIVIL', 'NZB', 5, 'OFFICER', 5);

INSERT INTO OFFICIAL (official_id, email, name, department_id, district_id, office_id, role, assigned_counter_id) 
VALUES (999, 'director.dqms@telangana.gov.in', 'Dr. C. Jayaraj, IAS, Commissioner of MeeSeva & e-Governance', 'REV', 'HYD', 1, 'ADMIN', 1);

-- 7. Insert Citizen Sandbox Records & Active Queue Tickets
INSERT INTO CITIZEN (citizen_id, mobile_number, name) VALUES (1, '9876543210', 'Citizen Srikanth Reddy');
INSERT INTO CITIZEN (citizen_id, mobile_number, name) VALUES (2, '9876543201', 'Citizen Ananya Sharma');

INSERT INTO QUEUE_TICKET (ticket_id, citizen_id, service_id, office_id, counter_id, token_number, sequence_number, status, booked_at, called_at, serving_at)
VALUES (1001, 2, 1, 1, 1, 'REV-001', 1, 'SERVING', CURRENT_TIMESTAMP - INTERVAL '30' MINUTE, CURRENT_TIMESTAMP - INTERVAL '10' MINUTE, CURRENT_TIMESTAMP - INTERVAL '5' MINUTE);

INSERT INTO QUEUE_STATUS_HISTORY (ticket_id, old_status, new_status, changed_by, remarks)
VALUES (1001, 'WAITING', 'CALLED', 'Sri V. Ramesh', 'Called to Counter 01');

INSERT INTO QUEUE_STATUS_HISTORY (ticket_id, old_status, new_status, changed_by, remarks)
VALUES (1001, 'CALLED', 'SERVING', 'Sri V. Ramesh', 'Processing certificate verification');

COMMIT;
