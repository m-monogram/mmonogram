#!/usr/bin/env node
/**
 * Seed script: uploads all project images to Supabase Storage and inserts projects into DB.
 * Run: node scripts/seed-projects.mjs
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const assetsDir = resolve(__dirname, '../src/assets');

const SUPABASE_URL = 'https://mgyufoyornzbwvgdfojb.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1neXVmb3lvcm56Ynd2Z2Rmb2piIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTE0NjY3NiwiZXhwIjoyMDg0NzIyNjc2fQ.9IdhPD4tvJH6g4VXy4ZTKHW84AX8XqAYkZ7p9Dx8Khk';

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);
const BUCKET = 'project-images';

async function uploadImage(localFile, remoteName) {
    try {
        const fileBuffer = readFileSync(resolve(assetsDir, localFile));
        const { error } = await supabase.storage
            .from(BUCKET)
            .upload(remoteName, fileBuffer, {
                contentType: 'image/jpeg',
                upsert: true,
            });
        if (error) throw error;
        const url = supabase.storage.from(BUCKET).getPublicUrl(remoteName).data.publicUrl;
        console.log(`  ✅ ${localFile} → ${remoteName}`);
        return url;
    } catch (err) {
        console.error(`  ❌ ${localFile}: ${err.message}`);
        return null;
    }
}

async function main() {
    console.log('📸 Uploading images to Supabase Storage...\n');

    // --- G900 White Pearl Edition ---
    const [g900Front, g900Aerial, g900Side, g900Rear] = await Promise.all([
        uploadImage('g900-white-front-new.jpg', 'g900/front.jpg'),
        uploadImage('g900-white-aerial-new.jpg', 'g900/aerial.jpg'),
        uploadImage('g900-white-side-new.jpg', 'g900/side.jpg'),
        uploadImage('g900-white-rear-new.jpg', 'g900/rear.jpg'),
    ]);

    // --- G63 Black Edition ---
    const [g63Front, g63Quarter, g63Side, g63Rear] = await Promise.all([
        uploadImage('g63-front-new.jpg', 'g63/front.jpg'),
        uploadImage('g63-quarter-new.jpg', 'g63/quarter.jpg'),
        uploadImage('g63-side-new.jpg', 'g63/side.jpg'),
        uploadImage('g63-rear-new.jpg', 'g63/rear.jpg'),
    ]);

    // --- Rolls-Royce The Fusion ---
    const [rrQuarter, rrRear, rrAerial, rrSide, rrTop] = await Promise.all([
        uploadImage('rr-fusion-quarter.jpg', 'rr-fusion/quarter.jpg'),
        uploadImage('rr-fusion-rear.jpg', 'rr-fusion/rear.jpg'),
        uploadImage('rr-fusion-aerial.jpg', 'rr-fusion/aerial.jpg'),
        uploadImage('rr-fusion-side.jpg', 'rr-fusion/side.jpg'),
        uploadImage('rr-fusion-top.jpg', 'rr-fusion/top.jpg'),
    ]);

    console.log('\n🗄️  Inserting projects into database...\n');

    // Delete existing projects first for clean seed
    await supabase.from('projects').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('project_images').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    const projectsToInsert = [
        {
            slug: 'g900-white-pearl',
            title: 'G900 M Monogram',
            subtitle: 'White Pearl Edition',
            year: '2024',
            duration: '10 weeks',
            package: 'Full',
            category: 'G63',
            cover_image: g900Front,
            description: 'This M-Monogram G900 is a signature project defined by precision and architectural design. Custom M-Monogram grille, proprietary monogram detailing, and exclusive forged wheels form a clear and recognizable identity. Created as a statement of control, individuality, and modern luxury.',
            modifications: [
                'Custom Maybach front grille conversion',
                'Exclusive monogram pattern wrap on hood & roof',
                "24'' Multi-spoke forged wheels",
                'Carbon fiber roof spoiler',
                'Brabus exhaust system G900',
                'Full body PPF protection',
            ],
            specs: {
                exterior: 'White Pearl Metallic with PPF',
                interior: 'Maybach exclusive leather',
                carbon: 'Carbon roof & hood accents',
                spoilers: 'Carbon fiber roof spoiler',
                wheels: "24'' Maybach forged multi-spoke",
                aeroKit: 'Maybach widebody conversion',
            },
            sort_order: 0,
            is_published: true,
        },
        {
            slug: 'g63-black-edition',
            title: 'G900 M Monogram',
            subtitle: 'FULL Black Edition',
            year: '2024',
            duration: '8 weeks',
            package: 'Full',
            category: 'G63',
            cover_image: g63Front,
            description: 'This M-Monogram G900 is a signature project defined by precision and architectural design. Custom M-Monogram grille, proprietary monogram detailing, and exclusive forged wheels form a clear and recognizable identity. Created as a statement of control, individuality, and modern luxury.',
            modifications: [
                'Brabus Widestar carbon body kit',
                "23'' forged wheels with exclusive design",
                'Full interior retrim in Nappa leather',
                'Stage 2 chip tuning (+150 HP)',
                'Akrapovič exhaust system',
                'PPF protection film on entire body',
            ],
            specs: {
                exterior: 'Obsidian Black Metallic with PPF',
                interior: 'Nappa Leather Cognac/Black',
                carbon: 'Full Brabus carbon package',
                spoilers: 'Carbon rear spoiler',
                wheels: "23'' Forged Monoblock",
                aeroKit: 'Brabus Widestar widebody',
            },
            sort_order: 1,
            is_published: true,
        },
        {
            slug: 'rolls-royce-fusion',
            title: 'Rolls-Royce',
            subtitle: 'The Fusion',
            year: '2024',
            duration: '12 weeks',
            package: 'Full',
            category: 'Rolls-Royce',
            cover_image: rrQuarter,
            description: 'Rolls-Royce The Fusion is a modern luxury statement, blending timeless elegance with bold contemporary design. Featuring bespoke exterior elements, a sculpted grille, and a handcrafted open-top interior. A seamless fusion of power, refinement, and future vision.',
            modifications: [
                'Bespoke exterior design elements',
                'Sculpted signature grille',
                'Handcrafted open-top interior',
                'Custom Navy Blue metallic finish',
                'Exclusive white leather interior',
                "22'' forged wheels with dark finish",
            ],
            specs: {
                exterior: 'Navy Blue Metallic Bespoke',
                interior: 'Arctic White handcrafted leather',
                carbon: 'Carbon fiber hood accents',
                spoilers: 'Integrated rear diffuser',
                wheels: "22'' Forged dark finish",
                aeroKit: 'Custom open-top conversion',
            },
            sort_order: 2,
            is_published: true,
        },
    ];

    const { data: inserted, error: insertError } = await supabase
        .from('projects')
        .insert(projectsToInsert)
        .select('id, slug');

    if (insertError) {
        console.error('❌ Error inserting projects:', insertError.message);
        return;
    }

    console.log('✅ Projects inserted:', inserted.map(p => p.slug).join(', '));

    // Insert images for each project
    const imagesBySlug = {
        'g900-white-pearl': [
            { src: g900Front, title: 'Front view', sort_order: 0 },
            { src: g900Aerial, title: 'Aerial view', sort_order: 1 },
            { src: g900Side, title: 'Side profile', sort_order: 2 },
            { src: g900Rear, title: 'Rear view', sort_order: 3 },
        ],
        'g63-black-edition': [
            { src: g63Front, title: 'Front view', sort_order: 0 },
            { src: g63Quarter, title: 'Quarter view', sort_order: 1 },
            { src: g63Side, title: 'Side profile', sort_order: 2 },
            { src: g63Rear, title: 'Rear view', sort_order: 3 },
        ],
        'rolls-royce-fusion': [
            { src: rrQuarter, title: 'Quarter view', sort_order: 0 },
            { src: rrRear, title: 'Rear view', sort_order: 1 },
            { src: rrAerial, title: 'Aerial view', sort_order: 2 },
            { src: rrSide, title: 'Side profile', sort_order: 3 },
            { src: rrTop, title: 'Top view', sort_order: 4 },
        ],
    };

    for (const project of inserted) {
        const images = imagesBySlug[project.slug];
        if (!images) continue;
        const { error: imgError } = await supabase
            .from('project_images')
            .insert(images.map(img => ({ ...img, project_id: project.id })));
        if (imgError) {
            console.error(`❌ Error inserting images for ${project.slug}:`, imgError.message);
        } else {
            console.log(`✅ Images for ${project.slug}: ${images.length} uploaded`);
        }
    }

    // Seed navigation items
    console.log('\n🔗 Seeding navigation items...');
    await supabase.from('navigation_items').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('navigation_items').insert([
        { label: 'Projects', href: '/projects', location: 'header', sort_order: 0, is_visible: true },
        { label: 'Modifications', href: '/modifications', location: 'header', sort_order: 1, is_visible: true },
        { label: 'Brand', href: '/brand', location: 'header', sort_order: 2, is_visible: true },
        { label: 'Contact', href: '/contact', location: 'header', sort_order: 3, is_visible: true },
        { label: 'Projects', href: '/projects', location: 'footer', sort_order: 0, is_visible: true },
        { label: 'Brand', href: '/brand', location: 'footer', sort_order: 1, is_visible: true },
        { label: 'Privacy Policy', href: '/privacy-policy', location: 'footer', sort_order: 2, is_visible: true },
        { label: 'Offer Agreement', href: '/offer-agreement', location: 'footer', sort_order: 3, is_visible: true },
    ]);
    console.log('✅ Navigation seeded');

    // Seed admin role for zapoinov@bk.ru
    console.log('\n👑 Assigning admin role...');
    const { data: userData } = await supabase.auth.admin.listUsers();
    const adminUser = userData?.users?.find(u => u.email === 'zapoinov@bk.ru');
    if (adminUser) {
        await supabase.from('user_roles').upsert({ user_id: adminUser.id, role: 'admin' });
        console.log('✅ Admin role assigned to zapoinov@bk.ru');
    } else {
        console.log('⚠️  User zapoinov@bk.ru not found. Run migrations first, then run this script again.');
    }

    console.log('\n🎉 Done! Open localhost:8080/admin and log in.');
}

main().catch(console.error);
