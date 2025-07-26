#!/usr/bin/env python3
"""
Simple HTTP server for BBC Documentary Maker
Run this to serve the app locally on port 8000
"""

import http.server
import socketserver
import webbrowser
import os

PORT = 8000

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

if __name__ == "__main__":
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    with socketserver.TCPServer(("", PORT), MyHTTPRequestHandler) as httpd:
        print(f"🎬 BBC Documentary Maker Server Starting...")
        print(f"🌐 Server running at: http://localhost:{PORT}")
        print(f"📂 Serving files from: {os.getcwd()}")
        print(f"🚀 Opening browser...")
        
        webbrowser.open(f'http://localhost:{PORT}')
        
        print(f"💡 Press Ctrl+C to stop the server")
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print(f"\n🛑 Server stopped")
            httpd.shutdown()