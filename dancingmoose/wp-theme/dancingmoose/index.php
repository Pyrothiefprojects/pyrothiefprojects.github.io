<?php
/**
 * Fallback template — redirects to front page
 */
get_header();

$bg_image = get_theme_file_uri('dancingmoose.jpg');
?>

    <div id="main" class="main" style="background-image: url('<?php echo esc_url($bg_image); ?>');">
        <?php if (have_posts()) : ?>
            <div class="content-card">
                <?php while (have_posts()) : the_post(); ?>
                    <h1><?php the_title(); ?></h1>
                    <?php the_content(); ?>
                <?php endwhile; ?>
            </div>
        <?php endif; ?>
    </div>

    <aside id="artists-panel" class="right-sidebar" style="display:none;"></aside>

<?php get_footer(); ?>
