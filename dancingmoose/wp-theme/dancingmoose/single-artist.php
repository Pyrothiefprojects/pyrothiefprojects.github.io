<?php
/**
 * Single artist page template
 */
get_header();

$bg_image = get_theme_file_uri('dancingmoose.jpg');
$medium   = get_post_meta(get_the_ID(), '_artist_medium', true);
?>

    <div id="main" class="main" style="background-image: url('<?php echo esc_url($bg_image); ?>');">
        <div class="content-card">
            <h1><?php the_title(); ?></h1>
            <?php if ($medium) : ?>
                <p style="text-align:center; font-style:italic; color:#5a4a3a;"><?php echo esc_html($medium); ?></p>
            <?php endif; ?>
            <?php if (has_post_thumbnail()) : ?>
                <div style="text-align:center; margin: 1.5rem 0;">
                    <?php the_post_thumbnail('large', array('style' => 'max-width:100%; height:auto; border-radius:6px;')); ?>
                </div>
            <?php endif; ?>
            <?php the_content(); ?>
        </div>
    </div>

    <aside id="artists-panel" class="right-sidebar" style="display:none;"></aside>

<?php get_footer(); ?>
