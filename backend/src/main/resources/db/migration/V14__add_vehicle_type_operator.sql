ALTER TABLE vehicle_type ADD COLUMN operator VARCHAR(50);

-- Standard-gauge fleets carry no operator in their name, so assign it explicitly.
UPDATE vehicle_type SET operator = 'SBB' WHERE number_prefix IN
    ('500','501','502','503','511','512','514','521','522','523','524','527','528','533',
     '540','560','420','421','430','450','460','620','843','922','923','940');
UPDATE vehicle_type SET operator = 'SBB Cargo' WHERE number_prefix IN ('474','475','482','484');
UPDATE vehicle_type SET operator = 'Thurbo' WHERE number_prefix = '526';
UPDATE vehicle_type SET operator = 'Railcare' WHERE number_prefix = '476';
UPDATE vehicle_type SET operator = 'BLS' WHERE number_prefix IN
    ('425','465','485','486','487','515','525','535','565','566');
UPDATE vehicle_type SET operator = 'SOB' WHERE number_prefix IN ('446','456');

-- Metre-gauge fleets have a null number_prefix; key them by name.
UPDATE vehicle_type SET operator = 'RhB' WHERE name IN
    ('RhB Ge 4/4 II','RhB Ge 4/4 III','RhB Ge 6/6 II','RhB ABe 8/12','RhB ABe 4/16');
UPDATE vehicle_type SET operator = 'MGB' WHERE name IN
    ('MGB HGe 4/4 II','MGB Deh 4/4','MGB ABeh 4/10');
UPDATE vehicle_type SET operator = 'Zentralbahn' WHERE name IN
    ('zb ABe 130','zb ABeh 150','zb ABeh 160');
UPDATE vehicle_type SET operator = 'MOB' WHERE name = 'MOB GDe 4/4';
UPDATE vehicle_type SET operator = 'Appenzeller Bahnen' WHERE name = 'AB ABe 8/12';
