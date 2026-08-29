-- ربط صور الغلاف ببرامج العمرة (الصور المرفوعة في مجلد images/covers)
UPDATE programs
SET cover_image = 'images/covers/umrah-air-1.jpeg'
WHERE id = 'bbbbbbbb-1111-0000-0000-000000000001'::uuid
AND COALESCE(cover_image, '') = '';

UPDATE programs
SET cover_image = 'images/covers/umrah-air-2.webp'
WHERE id = 'bbbbbbbb-1111-0000-0000-000000000002'::uuid
AND COALESCE(cover_image, '') = '';

UPDATE programs
SET cover_image = 'images/covers/umrah-land-1.jpeg'
WHERE id = 'bbbbbbbb-1111-0000-0000-000000000003'::uuid
AND COALESCE(cover_image, '') = '';