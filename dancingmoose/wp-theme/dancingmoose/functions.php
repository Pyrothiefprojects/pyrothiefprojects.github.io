<?php
/**
 * Dancing Moose Gifts — Theme Functions
 */

// Load stylesheet
function dancingmoose_enqueue_styles() {
    wp_enqueue_style('dancingmoose-style', get_stylesheet_uri());
}
add_action('wp_enqueue_scripts', 'dancingmoose_enqueue_styles');

// Theme support
function dancingmoose_setup() {
    add_theme_support('title-tag');
    add_theme_support('post-thumbnails');
    add_theme_support('custom-background');
}
add_action('after_setup_theme', 'dancingmoose_setup');

// Register Artists custom post type
function dancingmoose_register_artists() {
    register_post_type('artist', array(
        'labels' => array(
            'name'               => 'Artists',
            'singular_name'      => 'Artist',
            'add_new'            => 'Add New Artist',
            'add_new_item'       => 'Add New Artist',
            'edit_item'          => 'Edit Artist',
            'new_item'           => 'New Artist',
            'view_item'          => 'View Artist',
            'search_items'       => 'Search Artists',
            'not_found'          => 'No artists found',
            'not_found_in_trash' => 'No artists found in trash',
        ),
        'public'        => true,
        'has_archive'   => false,
        'menu_icon'     => 'dashicons-art',
        'supports'      => array('title', 'thumbnail', 'editor'),
        'show_in_rest'  => true,
    ));
}
add_action('init', 'dancingmoose_register_artists');

// Add custom fields for artists (medium)
function dancingmoose_artist_meta_boxes() {
    add_meta_box(
        'artist_medium',
        'Medium',
        'dancingmoose_artist_medium_callback',
        'artist',
        'side'
    );
}
add_action('add_meta_boxes', 'dancingmoose_artist_meta_boxes');

function dancingmoose_artist_medium_callback($post) {
    $medium = get_post_meta($post->ID, '_artist_medium', true);
    wp_nonce_field('dancingmoose_save_medium', 'dancingmoose_medium_nonce');
    echo '<input type="text" name="artist_medium" value="' . esc_attr($medium) . '" style="width:100%;" placeholder="e.g. Printmaking, Mixed Media">';
}

function dancingmoose_save_artist_medium($post_id) {
    if (!isset($_POST['dancingmoose_medium_nonce']) ||
        !wp_verify_nonce($_POST['dancingmoose_medium_nonce'], 'dancingmoose_save_medium')) {
        return;
    }
    if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) {
        return;
    }
    if (isset($_POST['artist_medium'])) {
        update_post_meta($post_id, '_artist_medium', sanitize_text_field($_POST['artist_medium']));
    }
}
add_action('save_post_artist', 'dancingmoose_save_artist_medium');

// Get site option helpers
function dancingmoose_get_about_text() {
    return get_option('dancingmoose_about_text',
        'Nestled on historic Front Street in the heart of Dawson City, The Dancing Moose has celebrated the creativity and spirit of the North since 2001. Offering a curated collection of handcrafted goods, ladies fashion, jewellery, and unique gifts you won\'t find anywhere else.'
    );
}

function dancingmoose_get_shop_url() {
    return get_option('dancingmoose_shop_url', '#');
}

// Settings page for store owner
function dancingmoose_settings_page() {
    add_menu_page(
        'Site Settings',
        'Site Settings',
        'manage_options',
        'dancingmoose-settings',
        'dancingmoose_settings_callback',
        'dashicons-admin-generic'
    );
}
add_action('admin_menu', 'dancingmoose_settings_page');

function dancingmoose_settings_callback() {
    if (isset($_POST['dancingmoose_save_settings']) &&
        wp_verify_nonce($_POST['_wpnonce'], 'dancingmoose_settings')) {
        update_option('dancingmoose_about_text', sanitize_textarea_field($_POST['about_text']));
        update_option('dancingmoose_shop_url', esc_url_raw($_POST['shop_url']));
        update_option('dancingmoose_address', sanitize_textarea_field($_POST['address']));
        update_option('dancingmoose_hours', sanitize_text_field($_POST['hours']));
        update_option('dancingmoose_phone', sanitize_text_field($_POST['phone']));
        update_option('dancingmoose_email', sanitize_email($_POST['email']));
        update_option('dancingmoose_facebook', esc_url_raw($_POST['facebook']));
        update_option('dancingmoose_instagram', esc_url_raw($_POST['instagram']));
        echo '<div class="updated"><p>Settings saved.</p></div>';
    }

    $about    = get_option('dancingmoose_about_text', '');
    $shop_url = get_option('dancingmoose_shop_url', '');
    $address  = get_option('dancingmoose_address', "986 Front Street\nDawson City, YT Y0B 0A3");
    $hours    = get_option('dancingmoose_hours', 'Open Daily: 10am – 6pm');
    $phone    = get_option('dancingmoose_phone', '(867) 993-3188');
    $email    = get_option('dancingmoose_email', 'info@dancingmoose.ca');
    $facebook = get_option('dancingmoose_facebook', 'https://www.facebook.com/DancingMooseGifts/');
    $instagram = get_option('dancingmoose_instagram', 'https://www.instagram.com/dancingmoosegifts/');
    ?>
    <div class="wrap">
        <h1>Dancing Moose — Site Settings</h1>
        <form method="post">
            <?php wp_nonce_field('dancingmoose_settings'); ?>
            <table class="form-table">
                <tr>
                    <th><label for="about_text">About Text</label></th>
                    <td><textarea name="about_text" id="about_text" rows="4" class="large-text"><?php echo esc_textarea($about); ?></textarea></td>
                </tr>
                <tr>
                    <th><label for="shop_url">Shop URL (Square Online)</label></th>
                    <td><input type="url" name="shop_url" id="shop_url" value="<?php echo esc_attr($shop_url); ?>" class="regular-text"></td>
                </tr>
                <tr>
                    <th><label for="address">Address</label></th>
                    <td><textarea name="address" id="address" rows="2" class="large-text"><?php echo esc_textarea($address); ?></textarea></td>
                </tr>
                <tr>
                    <th><label for="hours">Hours</label></th>
                    <td><input type="text" name="hours" id="hours" value="<?php echo esc_attr($hours); ?>" class="regular-text"></td>
                </tr>
                <tr>
                    <th><label for="phone">Phone</label></th>
                    <td><input type="text" name="phone" id="phone" value="<?php echo esc_attr($phone); ?>" class="regular-text"></td>
                </tr>
                <tr>
                    <th><label for="email">Email</label></th>
                    <td><input type="email" name="email" id="email" value="<?php echo esc_attr($email); ?>" class="regular-text"></td>
                </tr>
                <tr>
                    <th><label for="facebook">Facebook URL</label></th>
                    <td><input type="url" name="facebook" id="facebook" value="<?php echo esc_attr($facebook); ?>" class="regular-text"></td>
                </tr>
                <tr>
                    <th><label for="instagram">Instagram URL</label></th>
                    <td><input type="url" name="instagram" id="instagram" value="<?php echo esc_attr($instagram); ?>" class="regular-text"></td>
                </tr>
            </table>
            <p class="submit">
                <input type="submit" name="dancingmoose_save_settings" class="button-primary" value="Save Settings">
            </p>
        </form>
    </div>
    <?php
}
