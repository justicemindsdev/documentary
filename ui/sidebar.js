toggleSidebar() {
            const sidebar = document.getElementById('sidebar');
            const toggleIcon = document.getElementById('toggleIcon');
            
            sidebar.classList.toggle('collapsed');
            documentaryMaker.sidebarCollapsed = sidebar.classList.contains('collapsed');
            
            toggleIcon.textContent = documentaryMaker.sidebarCollapsed ? '›' : '‹';
        }

        function toggleMobileSidebar() {
            const sidebar = document.getElementById('sidebar');
            sidebar.classList.toggle('mobile-open');
        }