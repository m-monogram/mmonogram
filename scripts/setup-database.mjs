#!/usr/bin/env node
// @ts-nocheck
/**
 * FULL DATABASE SETUP + SEED
 * Run: node scripts/setup-database.mjs
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const assetsDir = resolve(__dirname, '../src/assets');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables.');
  console.error('Set them locally before running, e.g. via a gitignored .env.local file.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { persistSession: false }
});

async function uploadImage(localFile, bucket, remoteName) {
    try {
        const fileBuffer = readFileSync(resolve(assetsDir, localFile));
        const { error } = await supabase.storage
            .from(bucket)
            .upload(remoteName, fileBuffer, { contentType: 'image/jpeg', upsert: true });
        if (error && !error.message.includes('already exists')) {
            console.error(`  ❌ ${localFile}: ${error.message}`);
            return null;
        }
        return supabase.storage.from(bucket).getPublicUrl(remoteName).data.publicUrl;
    } catch (err) {
        console.error(`  ❌ ${localFile}: ${err.message}`);
        return null;
    }
}

async function tableExists(tableName) {
    const { error } = await supabase.from(tableName).select('id').limit(1);
    return !error || (error.code !== '42P01' && error.code !== 'PGRST116');
}

async function main() {
    console.log('🚀 M-Monogram Database Setup\n' + '='.repeat(50));

    // 1. Check tables
    console.log('\n📋 Checking which tables exist...');
    const tables = ['user_roles', 'site_content', 'navigation_items', 'projects', 'project_images', 'bookings', 'site_settings'];
    const status = {};
    for (const t of tables) {
        status[t] = await tableExists(t);
        console.log(`  ${status[t] ? '✅' : '❌'} ${t}`);
    }

    const missing = tables.filter(t => !status[t]);
    if (missing.length > 0) {
        console.log(`\n⚠️  Missing: ${missing.join(', ')}`);
        console.log('  → Go to: https://supabase.com/dashboard/project/mgyufoyornzbwvgdfojb/sql/new');
        console.log('  → Run the SQL blocks provided by the assistant.\n');
    }

    // 2. Ensure bucket exists
    const { data: buckets } = await supabase.storage.listBuckets();
    if (!buckets?.some(b => b.id === 'project-images')) {
        await supabase.storage.createBucket('project-images', { public: true });
        console.log('\n✅ Created bucket: project-images');
    }

    // 3. Upload images
    console.log('\n📸 Uploading images...');
    const [g900Front, g900Aerial, g900Side, g900Rear] = await Promise.all([
        uploadImage('g900-white-front-new.jpg', 'project-images', 'g900/front.jpg'),
        uploadImage('g900-white-aerial-new.jpg', 'project-images', 'g900/aerial.jpg'),
        uploadImage('g900-white-side-new.jpg', 'project-images', 'g900/side.jpg'),
        uploadImage('g900-white-rear-new.jpg', 'project-images', 'g900/rear.jpg'),
    ]);
    const [g63Front, g63Quarter, g63Side, g63Rear] = await Promise.all([
        uploadImage('g63-front-new.jpg', 'project-images', 'g63/front.jpg'),
        uploadImage('g63-quarter-new.jpg', 'project-images', 'g63/quarter.jpg'),
        uploadImage('g63-side-new.jpg', 'project-images', 'g63/side.jpg'),
        uploadImage('g63-rear-new.jpg', 'project-images', 'g63/rear.jpg'),
    ]);
    const [rrQuarter, rrRear, rrAerial, rrSide, rrTop] = await Promise.all([
        uploadImage('rr-fusion-quarter.jpg', 'project-images', 'rr-fusion/quarter.jpg'),
        uploadImage('rr-fusion-rear.jpg', 'project-images', 'rr-fusion/rear.jpg'),
        uploadImage('rr-fusion-aerial.jpg', 'project-images', 'rr-fusion/aerial.jpg'),
        uploadImage('rr-fusion-side.jpg', 'project-images', 'rr-fusion/side.jpg'),
        uploadImage('rr-fusion-top.jpg', 'project-images', 'rr-fusion/top.jpg'),
    ]);
    console.log('  ✅ 13 images uploaded');

    // 4. Seed projects
    if (status['projects']) {
        console.log('\n💾 Seeding projects...');
        // Clear first
        const delImgRes = await supabase.from('project_images').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        const delProjRes = await supabase.from('projects').delete().neq('id', '00000000-0000-0000-0000-000000000000');

        const { data: inserted, error: pe } = await supabase.from('projects').insert([
            {
                slug: 'g900-white-pearl', title: 'G900 M Monogram', subtitle: 'White Pearl Edition',
                year: '2024', duration: '10 weeks', package: 'Full', category: 'G63',
                cover_image: g900Front,
                description: 'This M-Monogram G900 is a signature project defined by precision and architectural design. Custom M-Monogram grille, proprietary monogram detailing, and exclusive forged wheels form a clear and recognizable identity.',
                modifications: ['Custom Maybach front grille conversion', 'Exclusive monogram pattern wrap on hood & roof', "24'' Multi-spoke forged wheels", 'Carbon fiber roof spoiler', 'Brabus exhaust system G900', 'Full body PPF protection'],
                specs: { exterior: 'White Pearl Metallic with PPF', interior: 'Maybach exclusive leather', carbon: 'Carbon roof & hood accents', spoilers: 'Carbon fiber roof spoiler', wheels: "24'' Maybach forged multi-spoke", aeroKit: 'Maybach widebody conversion' },
                sort_order: 0, is_published: true,
            },
            {
                slug: 'g63-black-edition', title: 'G900 M Monogram', subtitle: 'FULL Black Edition',
                year: '2024', duration: '8 weeks', package: 'Full', category: 'G63',
                cover_image: g63Front,
                description: 'This M-Monogram G900 is a signature project defined by precision and architectural design. Custom M-Monogram grille, proprietary monogram detailing, and exclusive forged wheels form a clear and recognizable identity.',
                modifications: ['Brabus Widestar carbon body kit', "23'' forged wheels with exclusive design", 'Full interior retrim in Nappa leather', 'Stage 2 chip tuning (+150 HP)', 'Akrapovič exhaust system', 'PPF protection film on entire body'],
                specs: { exterior: 'Obsidian Black Metallic with PPF', interior: 'Nappa Leather Cognac/Black', carbon: 'Full Brabus carbon package', spoilers: 'Carbon rear spoiler', wheels: "23'' Forged Monoblock", aeroKit: 'Brabus Widestar widebody' },
                sort_order: 1, is_published: true,
            },
            {
                slug: 'rolls-royce-fusion', title: 'Rolls-Royce', subtitle: 'The Fusion',
                year: '2024', duration: '12 weeks', package: 'Full', category: 'Rolls-Royce',
                cover_image: rrQuarter,
                description: 'Rolls-Royce The Fusion is a modern luxury statement, blending timeless elegance with bold contemporary design. A seamless fusion of power, refinement, and future vision.',
                modifications: ['Bespoke exterior design elements', 'Sculpted signature grille', 'Handcrafted open-top interior', 'Custom Navy Blue metallic finish', 'Exclusive white leather interior', "22'' forged wheels with dark finish"],
                specs: { exterior: 'Navy Blue Metallic Bespoke', interior: 'Arctic White handcrafted leather', carbon: 'Carbon fiber hood accents', spoilers: 'Integrated rear diffuser', wheels: "22'' Forged dark finish", aeroKit: 'Custom open-top conversion' },
                sort_order: 2, is_published: true,
            },
        ]).select('id, slug');

        if (pe) {
            console.error('  ❌ Projects error:', pe.message);
        } else {
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
            for (const p of inserted) {
                const imgs = (imagesBySlug[p.slug] || []).map(img => ({ ...img, project_id: p.id }));
                await supabase.from('project_images').insert(imgs);
                console.log(`  ✅ ${p.slug}: ${imgs.length} images`);
            }
        }
    }

    // 5. Seed navigation
    if (status['navigation_items']) {
        console.log('\n🔗 Seeding navigation...');
        await supabase.from('navigation_items').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('navigation_items').insert([
            { label: 'Projects', href: '/projects', location: 'header', sort_order: 0, is_visible: true },
            { label: 'Modifications', href: '/modifications', location: 'header', sort_order: 1, is_visible: true },
            { label: 'Brand', href: '/brand', location: 'header', sort_order: 2, is_visible: true },
            { label: 'Contact', href: '/contact', location: 'header', sort_order: 3, is_visible: true },
            { label: 'Projects', href: '/projects', location: 'footer', sort_order: 0, is_visible: true },
            { label: 'Brand', href: '/brand', location: 'footer', sort_order: 1, is_visible: true },
            { label: 'Privacy Policy', href: '/privacy-policy', location: 'footer', sort_order: 2, is_visible: true },
        ]);
        console.log('  ✅ Navigation seeded');
    }

    // 6. Seed site_content
    if (status['site_content']) {
        console.log('\n📝 Seeding site sections...');
        const sections = [
            { id: 'hero', section_name: 'Hero Section', content: { heading: 'M Monogram', subheading: 'Bespoke Automotive Transformations', cta_text: 'Discover', description: 'Every vehicle is a canvas. Every transformation is a signature.' }, is_visible: true },
            { id: 'about', section_name: 'About Section', content: { heading: 'About M-Monogram', description: 'M-Monogram is a premium automotive atelier specializing in bespoke vehicle transformations. Based in Dubai.', year_founded: '2018', location: 'Dubai, UAE', projects_count: '50+' }, is_visible: true },
            { id: 'services', section_name: 'Modifications / Services', content: { heading: 'Our Modifications', description: 'From body kits to full restorations — every detail perfected.' }, is_visible: true },
            { id: 'contact', section_name: 'Contact & Booking', content: { heading: 'Commission Your Vision', phone: '+971 50 000 0000', email: 'info@m-monogram.com', whatsapp: '+971500000000', address: 'Dubai, UAE', instagram: '@m.monogram' }, is_visible: true },
            { id: 'brand', section_name: 'Brand Philosophy', content: { heading: 'The Art of Transformation', description: 'M-Monogram was born from a singular obsession: to push the boundaries of what\'s possible with an automobile.' }, is_visible: true },
        ];
        for (const s of sections) {
            await supabase.from('site_content').upsert(s, { onConflict: 'id' });
            console.log(`  ✅ ${s.section_name}`);
        }
    }

    // 7. Seed settings
    if (status['site_settings']) {
        console.log('\n⚙️  Seeding settings...');
        await supabase.from('site_settings').upsert([
            { key: 'contact', value: { phone: '+971 50 000 0000', email: 'info@m-monogram.com', whatsapp: '+971500000000', address: 'Dubai, UAE' }, description: 'Contact information' },
            { key: 'social', value: { instagram: 'https://instagram.com/m.monogram', youtube: '', tiktok: '' }, description: 'Social media links' },
            { key: 'seo', value: { site_name: 'M-Monogram', site_title: 'M-Monogram — Bespoke Automotive Transformations', site_description: 'Premium automotive atelier in Dubai.' }, description: 'SEO settings' },
        ], { onConflict: 'key' });
        console.log('  ✅ Site settings seeded');
    }

    // 8. Assign admin role
    if (status['user_roles']) {
        console.log('\n👑 Assigning admin role...');
        const { data: { users } } = await supabase.auth.admin.listUsers();
        const adminUser = users?.find(u => u.email === 'zapoinov@bk.ru');
        if (adminUser) {
            await supabase.from('user_roles').upsert({ user_id: adminUser.id, role: 'admin' }, { onConflict: 'user_id,role' });
            console.log(`  ✅ Admin: zapoinov@bk.ru`);
        } else {
            console.log('  ⚠️  User zapoinov@bk.ru not found. Creating...');
            const { data: newUser, error: createErr } = await supabase.auth.admin.createUser({
                email: 'zapoinov@bk.ru',
                password: 'Unga2236',
                email_confirm: true,
            });
            if (!createErr && newUser.user) {
                await supabase.from('user_roles').insert({ user_id: newUser.user.id, role: 'admin' });
                console.log(`  ✅ Created admin user: zapoinov@bk.ru`);
            } else if (createErr) {
                console.error('  ❌', createErr.message);
            }
        }
    }

    console.log('\n' + '='.repeat(50));
    console.log('✅ Setup complete!');
    console.log('🌐 Admin:    http://localhost:8080/admin');
    console.log('📧 Email:    zapoinov@bk.ru');
    console.log('🔑 Password: Unga2236');
    console.log('='.repeat(50) + '\n');
}

main().catch(e => {
    console.error('\n❌ Fatal error:', e.message);
    process.exit(1);
});
