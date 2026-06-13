UPDATE vehicle_type SET family = 'MIKA', fleet_size = 30 WHERE number_prefix = '528';
UPDATE vehicle_type SET family = 'FLIRT EVO' WHERE number_prefix = '533';

INSERT INTO vehicle_type (name, family, manufacturer, fleet_size, number_prefix) VALUES
    -- SBB long-distance multiple units
    ('RABDe 500', 'ICN', 'Bombardier/Alstom', 44, '500'),
    ('RABe 503', 'Astoro', 'Alstom', 19, '503'),
    ('RABe 512', 'KISS', 'Stadler', 52, '512'),
    -- FLIRT regional multiple units (SBB and subsidiaries)
    ('RABe 521', 'FLIRT', 'Stadler', NULL, '521'),
    ('RABe 522', 'FLIRT', 'Stadler', NULL, '522'),
    ('RABe 524', 'FLIRT', 'Stadler', NULL, '524'),
    ('RABe 527', 'FLIRT', 'Stadler', NULL, '527'),
    -- SBB legacy regional units
    ('RBe 540', 'NPZ', 'SIG/BBC', NULL, '540'),
    ('RBDe 560', 'Domino', 'SIG/Bombardier', NULL, '560'),
    -- SBB locomotives
    ('Re 420', 'Re 4/4 II', 'SLM/BBC', NULL, '420'),
    ('Re 421', 'Re 4/4 II', 'SLM/BBC', NULL, '421'),
    ('Re 430', 'Re 4/4 III', 'SLM/BBC', NULL, '430'),
    ('Eem 923', 'Eem 923', 'Stadler', 30, '923'),
    ('Aem 940', 'Aem 940', 'Alstom', 47, '940'),
    -- BLS
    ('RABe 515', 'MUTZ', 'Stadler', 28, '515'),
    ('RABe 525', 'NINA', 'Stadler', 36, '525'),
    ('RBDe 565', 'NPZ', 'SIG/BBC', 21, '565'),
    ('RBDe 566', 'NPZ', 'SIG', 13, '566'),
    ('Re 425', 'Re 4/4', 'SLM/BBC', 33, '425'),
    ('Re 465', 'Re 465', 'SLM/ABB', 18, '465'),
    ('Re 485', 'TRAXX F140 AC1', 'Bombardier', NULL, '485'),
    ('Re 486', 'TRAXX F140 MS', 'Bombardier', NULL, '486'),
    ('Re 487', 'TRAXX F140 MS2', 'Bombardier', NULL, '487'),
    -- SOB
    ('Re 446', 'Re 4/4 IV', 'SLM/BBC', NULL, '446'),
    ('Re 456', 'Re 456', 'SLM/ABB', NULL, '456'),
    -- Other standard-gauge locomotives
    ('Re 476', 'Vectron', 'Siemens', NULL, '476'),
    -- RhB (metre gauge)
    ('RhB Ge 4/4 II', NULL, 'SLM/BBC', NULL, NULL),
    ('RhB Ge 4/4 III', NULL, 'SLM/ABB', NULL, NULL),
    ('RhB Ge 6/6 II', NULL, 'SLM/MFO', NULL, NULL),
    ('RhB ABe 8/12', 'Allegra', 'Stadler', 15, NULL),
    ('RhB ABe 4/16', 'Capricorn', 'Stadler', 56, NULL),
    -- MGB (metre gauge)
    ('MGB HGe 4/4 II', NULL, 'SLM/ABB', NULL, NULL),
    ('MGB Deh 4/4', NULL, 'SLM/BBC', NULL, NULL),
    ('MGB ABeh 4/10', 'Komet', 'Stadler', NULL, NULL),
    -- Zentralbahn (metre gauge)
    ('zb ABe 130', 'SPATZ', 'Stadler', 10, NULL),
    ('zb ABeh 150', 'ADLER', 'Stadler', 4, NULL),
    ('zb ABeh 160', 'FINK', 'Stadler', NULL, NULL),
    -- MOB (metre gauge)
    ('MOB GDe 4/4', NULL, 'SLM/BBC', NULL, NULL),
    -- Appenzeller Bahnen (metre gauge)
    ('AB ABe 8/12', 'Tango', 'Stadler', NULL, NULL);
