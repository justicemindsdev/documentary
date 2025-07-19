setupDragAndDrop();
            }

            initializeEventListeners() {
                // File upload handlers
                document.getElementById('videoFile').addEventListener('change', (e) => {
                    this.handleVideoUpload(e.target.files[0]);
                });

                document.getElementById('transcriptFile').addEventListener('change', (e) => {
                    this.handleTranscriptUpload(e.target.files[0]);
                });

                document.getElementById('documentsFile').addEventListener('change', (e) => {
                    this.handleDocumentsUpload(Array.from(e.target.files));
                }