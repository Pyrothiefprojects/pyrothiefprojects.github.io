    <script>
        function hideAll() {
            document.getElementById('sidebar-about').style.display = 'none';
            document.getElementById('artists-panel').style.display = 'none';
            document.getElementById('main').classList.remove('has-right-sidebar');
        }

        function togglePanel(panel) {
            var aboutEl = document.getElementById('sidebar-about');
            var artistsEl = document.getElementById('artists-panel');
            var mainEl = document.getElementById('main');

            if (panel === 'about') {
                var isHidden = aboutEl.style.display === 'none';
                hideAll();
                if (isHidden) aboutEl.style.display = 'flex';
            } else if (panel === 'artists') {
                var isHidden = artistsEl.style.display === 'none';
                hideAll();
                if (isHidden) {
                    artistsEl.style.display = 'block';
                    mainEl.classList.add('has-right-sidebar');
                }
            }
        }
    </script>

    <?php wp_footer(); ?>

</body>
</html>
