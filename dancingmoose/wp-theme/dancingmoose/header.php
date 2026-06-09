<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
    <meta charset="<?php bloginfo('charset'); ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>

    <button class="hamburger" onclick="document.querySelector('.sidebar').classList.toggle('active')">
        <span></span>
        <span></span>
        <span></span>
    </button>

    <?php
    $about_text = dancingmoose_get_about_text();
    $shop_url   = dancingmoose_get_shop_url();
    $address    = get_option('dancingmoose_address', "986 Front Street\nDawson City, YT Y0B 0A3");
    $hours      = get_option('dancingmoose_hours', 'Open Daily: 10am – 6pm');
    $phone      = get_option('dancingmoose_phone', '(867) 993-3188');
    $email      = get_option('dancingmoose_email', 'info@dancingmoose.ca');
    $facebook   = get_option('dancingmoose_facebook', 'https://www.facebook.com/DancingMooseGifts/');
    $instagram  = get_option('dancingmoose_instagram', 'https://www.instagram.com/dancingmoosegifts/');
    ?>

    <aside class="sidebar" style="display:flex; flex-direction:column;">
        <ul class="sidebar-nav">
            <li><a href="#" title="Home" onclick="hideAll(); return false;"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg></a></li>
            <li><a href="<?php echo esc_url($shop_url); ?>">Shop</a></li>
            <li><a href="#" onclick="togglePanel('artists'); return false;">Local Artists</a></li>
            <li><a href="#" onclick="togglePanel('about'); return false;">About</a></li>
        </ul>

        <div id="sidebar-about" style="display:none; flex:1; align-items:center; padding:1rem 0;">
            <div style="border: 1px solid rgba(44,24,16,0.2); border-radius: 6px; padding: 1rem; font-size: 0.8rem; line-height: 1.6; color: #3d2a1c;">
                <?php echo esc_html($about_text); ?>
            </div>
        </div>

        <div style="margin-top:auto;">
            <div class="sidebar-contact" style="font-size:0.85rem; line-height:1.7; color:#5a4a3a;">
                <p><?php echo nl2br(esc_html($address)); ?></p>
                <p class="sidebar-hours"><?php echo esc_html($hours); ?></p>
                <p><a href="tel:<?php echo esc_attr(preg_replace('/[^0-9]/', '', $phone)); ?>"><?php echo esc_html($phone); ?></a></p>
                <p><a href="mailto:<?php echo esc_attr($email); ?>"><?php echo esc_html($email); ?></a></p>
            </div>

            <div class="sidebar-social">
                <?php if ($facebook) : ?>
                <a href="<?php echo esc_url($facebook); ?>" target="_blank" title="Facebook">
                    <svg viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                </a>
                <?php endif; ?>
                <?php if ($instagram) : ?>
                <a href="<?php echo esc_url($instagram); ?>" target="_blank" title="Instagram">
                    <svg viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                </a>
                <?php endif; ?>
            </div>
        </div>
    </aside>
