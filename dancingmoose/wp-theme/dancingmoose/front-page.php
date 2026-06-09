<?php
/**
 * Home page template — just the background image, sidebar, and artists panel
 */
get_header();

// Get background image — uses WordPress custom background or falls back to theme image
$bg_image = get_theme_file_uri('dancingmoose.jpg');
?>

    <div id="main" class="main" style="background-image: url('<?php echo esc_url($bg_image); ?>');">
    </div>

    <aside id="artists-panel" class="right-sidebar" style="display:none;">
        <div class="artist-list">
            <?php
            $artists = new WP_Query(array(
                'post_type'      => 'artist',
                'posts_per_page' => -1,
                'orderby'        => 'title',
                'order'          => 'ASC',
            ));

            if ($artists->have_posts()) :
                while ($artists->have_posts()) : $artists->the_post();
                    $medium  = get_post_meta(get_the_ID(), '_artist_medium', true);
                    $initials = '';
                    $words = explode(' ', get_the_title());
                    foreach ($words as $word) {
                        $initials .= mb_strtoupper(mb_substr($word, 0, 1));
                    }
                    $initials = mb_substr($initials, 0, 2);
                    ?>
                    <a class="artist-card" href="<?php the_permalink(); ?>">
                        <div class="artist-portrait">
                            <?php if (has_post_thumbnail()) : ?>
                                <?php the_post_thumbnail('thumbnail'); ?>
                            <?php else : ?>
                                <span class="artist-portrait-placeholder"><?php echo esc_html($initials); ?></span>
                            <?php endif; ?>
                        </div>
                        <div class="artist-info">
                            <div class="artist-name"><?php the_title(); ?></div>
                            <?php if ($medium) : ?>
                                <div class="artist-medium"><?php echo esc_html($medium); ?></div>
                            <?php endif; ?>
                        </div>
                    </a>
                    <?php
                endwhile;
                wp_reset_postdata();
            else :
                ?>
                <p style="color: #5a4a3a; font-size: 0.85rem;">Artists coming soon.</p>
            <?php endif; ?>
        </div>
    </aside>

<?php get_footer(); ?>
